import React from "react";
import { GameItem, Character } from "../types";
import { Briefcase, Shield, Trash2, Award, Sparkles, CheckCircle2 } from "lucide-react";

interface InventoryPanelProps {
  char: Character;
  items: GameItem[];
  onUseItem?: (id: string) => void;
  onDiscardItem?: (id: string) => void;
  onEquipItem?: (id: string, slot: "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand") => void;
  onUnequipItem?: (slot: "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand") => void;
  onUpgradeAttribute?: (key: string) => void;
  onUpdateItems?: (updated: GameItem[]) => void;
}

export default function InventoryPanel({
  char,
  items,
  onUseItem,
  onDiscardItem,
  onEquipItem,
  onUnequipItem,
  onUpgradeAttribute,
  onUpdateItems,
}: InventoryPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"attributes" | "bag">("attributes");
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [activeSelectSlot, setActiveSelectSlot] = React.useState<"head" | "neck" | "body" | "waist" | "rightHand" | "leftHand" | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Local state for item modifiability/editing
  const [isEditingItem, setIsEditingItem] = React.useState<boolean>(false);
  const [localEditName, setLocalEditName] = React.useState<string>("");
  const [localEditType, setLocalEditType] = React.useState<string>("");
  const [localEditQuality, setLocalEditQuality] = React.useState<string>("");
  const [localEditCount, setLocalEditCount] = React.useState<number>(1);
  const [localEditDesc, setLocalEditDesc] = React.useState<string>("");
  const [localEditEffect, setLocalEditEffect] = React.useState<string>("");

  // Local state for adding item
  const [showAddItem, setShowAddItem] = React.useState<boolean>(false);
  const [addName, setAddName] = React.useState<string>("");
  const [addType, setAddType] = React.useState<string>("御用神兵");
  const [addQuality, setAddQuality] = React.useState<string>("奇珍");
  const [addCount, setAddCount] = React.useState<number>(1);
  const [addEffect, setAddEffect] = React.useState<string>("");
  const [addDesc, setAddDesc] = React.useState<string>("");

  React.useEffect(() => {
    if (selectedItem) {
      setLocalEditName(selectedItem.name);
      setLocalEditType(selectedItem.type);
      setLocalEditQuality(selectedItem.quality);
      setLocalEditCount(selectedItem.count);
      setLocalEditDesc(selectedItem.description);
      setLocalEditEffect(selectedItem.effect || "");
    }
  }, [selectedItem, isEditingItem]);

  // Helper to resolve slot compatibility based on item name and type
  const getCompatibleSlot = (item: GameItem): "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand" | null => {
    const name = item.name;
    const type = item.type;
    if (name.includes("冠") || name.includes("盔") || name.includes("帽") || name.includes("巾") || name.includes("发簪")) return "head";
    if (name.includes("项链") || name.includes("吊坠") || name.includes("绛珠") || name.includes("璎珞")) return "neck";
    if (name.includes("袍") || name.includes("甲") || name.includes("衣") || name.includes("衫") || name.includes("皮)阁")) return "body";
    if (name.includes("绦") || name.includes("绦带") || name.includes("玉佩") || name.includes("革带") || name.includes("腰坠")) return "waist";
    if (name.includes("剑") || name.includes("刀") || name.includes("枪") || name.includes("弩") || name.includes("弓") || name.includes("右手") || name.includes("印")) return "rightHand";
    if (name.includes("盾") || name.includes("玺") || name.includes("兵符") || name.includes("宝诰") || name.includes("扇") || name.includes("左手") || name.includes("书")) return "leftHand";
    
    // fallbacks based on item type
    if (type === "御用神兵") return "rightHand";
    if (type === "传国信物") return "leftHand";
    return null;
  };

  const getSlotName = (slotKey: string) => {
    switch (slotKey) {
      case "head": return "头戴冠冕";
      case "neck": return "长缨颈饰";
      case "body": return "龙袍云缎";
      case "waist": return "玉饰绦带";
      case "rightHand": return "主手神兵";
      case "leftHand": return "副手宝御";
      default: return "";
    }
  };

  const getQualityBorder = (quality: string) => {
    switch (quality) {
      case "神传": return "border-amber-400 bg-amber-500/10 text-amber-300";
      case "绝世": return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "奇珍": return "border-purple-500 bg-purple-500/10 text-purple-300";
      default: return "border-[#bfa15f]/20 bg-neutral-900 text-gray-350";
    }
  };

  const activeGear = char.equipment || {};
  const attr = char.attributes;
  const currentXP = char.experience !== undefined ? char.experience : 50; // default initial XP

  // Extract compatible items for a specific slot for equipping
  const getCompatibleItemsForSlot = (slot: "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand") => {
    return items.filter((item) => getCompatibleSlot(item) === slot);
  };

  const scaleValue = (val: number | undefined) => {
    const raw = val !== undefined ? val : 20;
    return (raw / 10).toFixed(1);
  };

  const attributesList = [
    { key: "strength", name: "力量 (Strength)", val: attr.strength, desc: "肉体搏杀、重兵负荷与硬性力劲" },
    { key: "agility", name: "敏捷 (Agility)", val: attr.agility, desc: "瞬息反应、灵巧变向与身手突袭" },
    { key: "stamina", name: "耐力 (Stamina)", val: attr.stamina, desc: "承压耐受、持久作战与生机底座" },
    { key: "intelligence", name: "智力 (Intelligence)", val: attr.intelligence, desc: "过目不忘、国策算力与谋略格局" },
    { key: "perception", name: "感知 (Perception)", val: attr.perception, desc: "直觉灵觉、秋毫微察与推演命途" },
    { key: "resolve", name: "决心 (Resolve)", val: attr.resolve, desc: "心志定力、不屈神意与抵御蛊惑" },
    { key: "charm", name: "风度 (Charm)", val: attr.charm, desc: "帝皇仪象、摄人心魄与群儒向心" },
    { key: "manipulation", name: "操控 (Manipulation)", val: attr.manipulation, desc: "权衡离间、党群博弈与朝局支配" },
    { key: "composure", name: "沉着 (Composure)", val: attr.composure, desc: "泰山崩裂色不变、临危不动如山" },
    { key: "luck", name: "幸运 (Luck)", val: attr.luck, desc: "天数偏宠、化险为夷与命数加护" },
  ];

  return (
    <div id="new-inventory-panel" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bfa15f]/5 to-transparent pointer-events-none rounded-bl-full" />
      
      <div>
        {/* Header with Title and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#bfa15f]/15 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#bfa15f]/10 border border-[#bfa15f]/25">
              <Briefcase className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-[#fcfbfa]">行装珍阁 / 人物属性与行囊</h2>
              <p className="text-[10px] text-[#a09e97] font-serif">神武配良人，妙药定命星</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-black/60 p-1 rounded-lg border border-neutral-850 self-start">
            <button
              onClick={() => {
                setActiveTab("attributes");
                setActiveSelectSlot(null);
              }}
              className={`px-3 py-1 text-center text-xs font-serif font-black tracking-wide rounded cursor-pointer transition ${
                activeTab === "attributes"
                  ? "bg-[#bfa15f]/20 text-[#e6c787] border border-[#bfa15f]/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              👤 武装与加点
            </button>
            <button
              onClick={() => {
                setActiveTab("bag");
                setSelectedItemId(items[0]?.id || null);
              }}
              className={`px-3 py-1 text-center text-xs font-serif font-black tracking-wide rounded cursor-pointer transition ${
                activeTab === "bag"
                  ? "bg-[#bfa15f]/20 text-[#e6c787] border border-[#bfa15f]/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              🎒 行囊百宝箱
            </button>
          </div>
        </div>

        {/* ======================= TAB 1: ATTRIBUTES & GEAR ======================= */}
        {activeTab === "attributes" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Visual Human Body Equipment Shape layout */}
            <div className="md:col-span-5 bg-gradient-to-b from-[#110f0c] to-black p-3.5 border border-[#bfa15f]/15 rounded-xl block relative min-h-[360px]">
              <h3 className="font-serif text-[11px] text-amber-200 font-bold border-b border-neutral-900 pb-1 mb-2 text-center tracking-wider">
                🛡️ 御挂法驾武装格 🛡️
              </h3>

              {/* Stylized Body layout */}
              <div className="relative h-[280px] w-full flex flex-col items-center justify-between py-2 overflow-visible">
                
                {/* HEAD SLOT */}
                <div className="z-10">
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "head" ? null : "head")}
                    className={`p-1.5 rounded-md border min-w-[100px] cursor-pointer text-center flex flex-col items-center justify-center transition active:scale-95 ${
                      activeGear.head ? getQualityBorder(activeGear.head.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">头戴冠冕</span>
                    <span className="text-[10px] font-black truncate max-w-[95px] block">{activeGear.head ? activeGear.head.name : "【戴位空虚】"}</span>
                  </button>
                </div>

                {/* NECK SLOT */}
                <div className="z-10 mt-1">
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "neck" ? null : "neck")}
                    className={`p-1.5 rounded-md border min-w-[100px] cursor-pointer text-center flex flex-col items-center justify-center transition active:scale-95 ${
                      activeGear.neck ? getQualityBorder(activeGear.neck.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">长缨颈饰</span>
                    <span className="text-[10px] font-black truncate max-w-[95px] block">{activeGear.neck ? activeGear.neck.name : "【颈位空虚】"}</span>
                  </button>
                </div>

                {/* INTERACTIVE ROW: RIGHT HAND, BODY ARMOR, LEFT HAND */}
                <div className="w-full flex justify-between items-center z-10 px-1 mt-1">
                  {/* Right Hand */}
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "rightHand" ? null : "rightHand")}
                    className={`p-1.5 rounded-md border text-center flex flex-col items-center justify-center w-[30%] min-h-[55px] cursor-pointer transition active:scale-95 ${
                      activeGear.rightHand ? getQualityBorder(activeGear.rightHand.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">主手神兵</span>
                    <span className="text-[9.5px] font-black leading-tight break-all line-clamp-2">{activeGear.rightHand ? activeGear.rightHand.name : "【主兵空虚】"}</span>
                  </button>

                  {/* Body Armor */}
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "body" ? null : "body")}
                    className={`p-1.5 rounded-md border text-center flex flex-col items-center justify-center w-[35%] min-h-[60px] cursor-pointer transition active:scale-95 ${
                      activeGear.body ? getQualityBorder(activeGear.body.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">龙袍云缎</span>
                    <span className="text-[10px] font-black leading-tight break-all line-clamp-2">{activeGear.body ? activeGear.body.name : "【龙铠虚悬】"}</span>
                  </button>

                  {/* Left Hand */}
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "leftHand" ? null : "leftHand")}
                    className={`p-1.5 rounded-md border text-center flex flex-col items-center justify-center w-[30%] min-h-[55px] cursor-pointer transition active:scale-95 ${
                      activeGear.leftHand ? getQualityBorder(activeGear.leftHand.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">副手宝御</span>
                    <span className="text-[9.5px] font-black leading-tight break-all line-clamp-2">{activeGear.leftHand ? activeGear.leftHand.name : "【副御空虚】"}</span>
                  </button>
                </div>

                {/* WAIST SLOT */}
                <div className="z-10 mt-1">
                  <button
                    onClick={() => setActiveSelectSlot(activeSelectSlot === "waist" ? null : "waist")}
                    className={`p-1.5 rounded-md border min-w-[100px] cursor-pointer text-center flex flex-col items-center justify-center transition active:scale-95 ${
                      activeGear.waist ? getQualityBorder(activeGear.waist.quality) : "border-neutral-800 bg-neutral-900 text-gray-500"
                    }`}
                  >
                    <span className="text-[7.5px] text-amber-500/70 block font-serif uppercase">玉饰绦带</span>
                    <span className="text-[10px] font-black truncate max-w-[95px] block">{activeGear.waist ? activeGear.waist.name : "【腰身虚悬】"}</span>
                  </button>
                </div>

                {/* SVG Stick Body Silhouette representation in background */}
                <svg className="absolute inset-0 w-full h-full text-neutral-900/60 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50%" cy="20%" r="14" className="text-neutral-850" />
                  <line x1="50%" y1="25%" x2="50%" y2="60%" />
                  <line x1="50%" y1="35%" x2="25%" y2="52%" />
                  <line x1="50%" y1="35%" x2="75%" y2="52%" />
                  <line x1="50%" y1="60%" x2="38%" y2="90%" />
                  <line x1="50%" y1="60%" x2="62%" y2="90%" />
                </svg>
              </div>

              {/* Equippable floating drawer popover */}
              {activeSelectSlot && (
                <div className="absolute inset-x-2 bottom-2 top-10 bg-black/95 border border-amber-500/30 rounded-lg p-3 z-30 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-serif font-black border-b border-neutral-900 pb-1 text-amber-300 flex justify-between items-center mb-2">
                      <span>🎒 可御挂之物 (对于: {getSlotName(activeSelectSlot)})</span>
                      <button onClick={() => setActiveSelectSlot(null)} className="text-[9px] hover:text-white text-gray-500">✕ 关闭</button>
                    </h4>

                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {getCompatibleItemsForSlot(activeSelectSlot).length === 0 ? (
                        <p className="text-[10px] text-center text-gray-500 py-10 italic">没有契合此武装孔之物品。可在江南/中原筹集或通过剧情获得！</p>
                      ) : (
                        getCompatibleItemsForSlot(activeSelectSlot).map((item) => (
                          <div key={item.id} className="bg-[#141413] border border-neutral-850 p-2 rounded flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-bold text-gray-200 block">{item.name}</span>
                              <span className="text-[8.5px] text-[#a09e97]">{item.description}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (onEquipItem) onEquipItem(item.id, activeSelectSlot);
                                setActiveSelectSlot(null);
                              }}
                              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-[9px] text-amber-300 hover:text-black border border-amber-500/30 rounded font-black cursor-pointer"
                            >
                              御挂
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {activeGear[activeSelectSlot] && (
                    <button
                      onClick={() => {
                        if (onUnequipItem) onUnequipItem(activeSelectSlot);
                        setActiveSelectSlot(null);
                      }}
                      className="w-full py-1 text-center bg-rose-950/20 text-rose-400 border border-rose-900/45 rounded font-black text-[9.5px] cursor-pointer"
                    >
                      卸下当前装备
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Attributes List & Points allocation */}
            <div className="md:col-span-7 bg-[#0e0e0d] border border-neutral-850 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-1.5">
                <span className="text-xs font-serif font-black text-amber-300">👤 神功龙骨 base stats</span>
                
                {/* XP points display */}
                <div className="bg-amber-950/20 px-2 py-1 rounded border border-amber-500/30 text-[10px] font-serif flex items-center gap-1">
                  <span className="text-amber-400">🔥 帝天修行经验 (XP)：</span>
                  <strong className="text-amber-300 font-sans">{currentXP} 点</strong>
                </div>
              </div>

              {/* Attributes Allocation Grid */}
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                <div className="text-[8.5px] text-[#a09e97] leading-tight flex items-start gap-1 p-1.5 bg-neutral-950/70 border border-neutral-900 rounded font-serif mb-2 text-justify">
                  <span>※</span>
                  <span><b>真仙天命度：</b>本品阶系统秉持极其苛刻的 <strong>1.0 ~ 10.0 刻度</strong> （2.0 为常人生理标杆，10.0 为人体五倍血肉极限）。每砸 <strong>5 XP</strong> 经验值可使该基础属性 <strong>+0.1</strong>（在底层机制中累进 +1 的属性因子）。</span>
                </div>

                {attributesList.map((item) => {
                  const currentValScaled = scaleValue(item.val);
                  const isLimit = item.val !== undefined && item.val >= 100;
                  return (
                    <div key={item.key} className="bg-black/50 p-2 rounded-lg border border-neutral-900/50 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[11px] font-serif">
                        <div className="space-y-0.5">
                          <span className="text-gray-300 font-bold block">{item.name}</span>
                          <span className="text-[9px] text-[#a09e97] block font-light leading-none">{item.desc}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-300">
                            {currentValScaled} <span className="text-gray-600 text-[10px]">/ 10.0</span>
                          </span>

                          {/* Attribute leveling up modifier button */}
                          <button
                            onClick={() => {
                              if (currentXP < 5) {
                                alert("本朝主公修行经验 (XP) 不足5点，请在各大城市或完成天诏任务提升阅历！");
                                return;
                              }
                              if (onUpgradeAttribute) {
                                onUpgradeAttribute(item.key);
                              }
                            }}
                            disabled={isLimit || currentXP < 5}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs select-none transition ${
                              isLimit 
                                ? "bg-stone-900 border-neutral-800 text-stone-600 cursor-not-allowed"
                                : currentXP >= 5 
                                ? "bg-amber-400 hover:bg-amber-300 text-black border-amber-500 cursor-pointer active:scale-90"
                                : "bg-black text-gray-500 border-neutral-800 cursor-not-allowed"
                            }`}
                            title="提升此项实力 (消耗 5 XP)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Visual gauge bar */}
                      <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(100, item.val !== undefined ? item.val : 20)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================= TAB 2: BACKPACK/BAG LIST ======================= */}
        {activeTab === "bag" && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Left grid compartment lists */}
            <div className="sm:col-span-7 space-y-2">
              <h3 className="font-serif text-[11px] text-[#e6c787] font-bold pb-1 flex justify-between">
                <span>🎒 随行背包行囊格 (Grid compartment)</span>
                <span className="font-mono text-[10px] text-gray-400">拥有数: {items.length} 格</span>
              </h3>
              
              {/* Box container styled as neat squares/grids */}
              <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <div className="col-span-4 mt-8 text-center text-[10px] text-gray-500 py-12 italic font-serif bg-black/20 rounded border border-dashed border-[#bfa15f]/15">
                    行装落空，并无一文一药挂怀
                  </div>
                ) : (
                  items.map((item) => {
                    const isSelected = item.id === selectedItemId;
                    const compatibilitySlot = getCompatibleSlot(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`aspect-square p-1 rounded-lg border flex flex-col justify-between items-center transition cursor-pointer relative ${
                          isSelected 
                            ? "border-amber-400 bg-amber-500/10 shadow-[0_0_8px_rgba(251,191,36,0.15)]" 
                            : "border-[#bfa15f]/10 bg-black/50 hover:border-neutral-700"
                        }`}
                      >
                        {/* Quality corner triangle */}
                        <div className={`absolute top-0 right-0 w-2 h-2 rounded-bl-sm ${
                          item.quality === "神传" ? "bg-amber-400" : item.quality === "绝世" ? "bg-orange-500" : "bg-purple-500"
                        }`} />

                        {/* Visual item representation index icon */}
                        <span className="text-lg my-auto select-none">
                          {item.type === "灵丹妙药" ? "💊" : compatibilitySlot === "head" ? "👑" : compatibilitySlot === "body" ? "🥋" : "🗡️"}
                        </span>

                        <div className="w-full text-center shrink-0">
                          <span className="text-[7.5px] font-black text-gray-300 block truncate px-1 leading-tight">{item.name}</span>
                          <span className="text-[7px] text-gray-500 font-mono leading-none">数量: {item.count}</span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Add Custom Item Recruiting Form */}
              {showAddItem ? (
                <div className="bg-black/80 border border-[#bfa15f]/30 rounded-lg p-3.5 space-y-2 mt-2 animate-fade-in text-[10px]">
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                    🎁 敕造赐新上用贡品 (Add Item)
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-gray-400 block font-bold">至宝名称:</label>
                      <input
                        type="text"
                        placeholder="如：九霄龙泉剑"
                        value={addName}
                        onChange={e => setAddName(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-400 block font-bold">至宝类别:</label>
                      <select
                        value={addType}
                        onChange={e => setAddType(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-amber-300 outline-none cursor-pointer"
                      >
                        <option value="御用神兵">⚔️ 御用神兵</option>
                        <option value="传国信物">玺 传国信物</option>
                        <option value="灵丹妙药">💊 灵丹妙药</option>
                        <option value="上品至装">👑 上品至装</option>
                        <option value="杂物珍奇">🔮 杂物珍奇</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-2">
                      <label className="text-[8px] text-gray-400 block font-bold">妙药神效 / 增效功效:</label>
                      <input
                        type="text"
                        placeholder="如：使用后武意气血均大涨+15%"
                        value={addEffect}
                        onChange={e => setAddEffect(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-400 block font-bold">数量:</label>
                      <input
                        type="number"
                        min="1"
                        value={addCount}
                        onChange={e => setAddCount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-gray-400 block font-bold">至宝品相:</label>
                      <select
                        value={addQuality}
                        onChange={e => setAddQuality(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-amber-300 outline-none cursor-pointer"
                      >
                        <option value="神传">✨ 神传</option>
                        <option value="绝世">🔥 绝世</option>
                        <option value="奇珍">🔮 奇珍</option>
                        <option value="凡品">📦 凡品</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-400 block font-bold">点位作用状态:</label>
                      <span className="text-[8.5px] text-stone-500 block pt-1.5">即刻充入皇家内务府</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold font-serif">物考风物志（详情描述）:</label>
                    <textarea
                      rows={1}
                      placeholder="如：出土于上古神迹中的龙泉宝剑..."
                      value={addDesc}
                      onChange={e => setAddDesc(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded p-1 text-[9px] text-gray-350 outline-none resize-none leading-normal"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (!addName.trim() || !addDesc.trim()) {
                          alert("请将敕造贡品的名号、神物描述填写完整！");
                          return;
                        }
                        const newId = `item_custom_${Date.now()}`;
                        const newItem: GameItem = {
                          id: newId,
                          name: addName,
                          type: addType as GameItem["type"],
                          quality: addQuality as GameItem["quality"],
                          count: addCount,
                          effect: addEffect || undefined,
                          description: addDesc
                        };
                        if (onUpdateItems) {
                          onUpdateItems([...items, newItem]);
                        }
                        setSelectedItemId(newId);
                        setShowAddItem(false);
                        setAddName("");
                        setAddDesc("");
                        setAddEffect("");
                        alert(`👑 【太初造物】：圣命昭昭，造化神殿特造【${addName}】已入皇家行装格！`);
                      }}
                      className="flex-1 py-1 bg-[#8c2c16] hover:bg-[#a63c24] text-white text-[9px] font-black rounded cursor-pointer text-center outline-none"
                    >
                      🏛️ 宣谕制造，敕赐入藏
                    </button>
                    <button
                      onClick={() => setShowAddItem(false)}
                      className="px-2.5 py-1 bg-stone-900 border border-neutral-850 text-gray-400 text-[9px] rounded cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddItem(true)}
                  className="w-full mt-2 py-1.5 border border-dashed border-[#bfa15f]/30 hover:border-amber-300 bg-neutral-900/30 hover:bg-neutral-900/60 rounded-lg text-[#bfa15f] hover:text-amber-200 text-[9px] font-bold cursor-pointer transition text-center animate-pulse"
                >
                  ➕ 八宝神炉：敕造并充实新贡品珍玩
                </button>
              )}
            </div>

            {/* Right popup details panel */}
            <div className="sm:col-span-5 bg-neutral-950 p-3 rounded-lg border border-neutral-900 flex flex-col justify-between max-h-[310px] overflow-y-auto">
              {selectedItem ? (
                isEditingItem ? (
                  <div className="space-y-2 font-serif text-[10px] flex flex-col justify-between h-full animate-fade-in">
                    <h4 className="text-[10px] font-black text-amber-300 border-b border-amber-500/10 pb-1 flex justify-between items-center">
                      <span>⚙️ 敕改内务府至宝卷卷</span>
                      <button onClick={() => setIsEditingItem(false)} className="text-gray-500 text-[8px] hover:text-white">✕</button>
                    </h4>

                    <div>
                      <label className="text-[8px] text-gray-500 block">至宝名号：</label>
                      <input 
                        type="text" 
                        value={localEditName} 
                        onChange={e => setLocalEditName(e.target.value)} 
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] text-gray-500 block">至宝类别：</label>
                        <select 
                          value={localEditType} 
                          onChange={e => setLocalEditType(e.target.value)} 
                          className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded text-[9px] text-amber-300 outline-none cursor-pointer p-0.5"
                        >
                          <option value="御用神兵">⚔️ 御用神兵</option>
                          <option value="传国信物">玺 传国信物</option>
                          <option value="灵丹妙药">💊 灵丹妙药</option>
                          <option value="上品至装">👑 上品至装</option>
                          <option value="杂物珍奇">🔮 杂物珍奇</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] text-gray-500 block">数量：</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={localEditCount} 
                          onChange={e => setLocalEditCount(Math.max(1, Number(e.target.value)))} 
                          className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] text-gray-500 block">品级阶位：</label>
                        <select 
                          value={localEditQuality} 
                          onChange={e => setLocalEditQuality(e.target.value)} 
                          className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded text-[9px] text-amber-300 outline-none cursor-pointer p-0.5"
                        >
                          <option value="神传">✨ 神传</option>
                          <option value="绝世">🔥 绝世</option>
                          <option value="奇珍">🔮 奇珍</option>
                          <option value="凡品">📦 凡品</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] text-gray-500 block">功效：</label>
                        <input 
                          type="text" 
                          value={localEditEffect} 
                          onChange={e => setLocalEditEffect(e.target.value)} 
                          className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] text-gray-500 block">古风描述/物考：</label>
                      <textarea 
                        rows={2} 
                        value={localEditDesc} 
                        onChange={e => setLocalEditDesc(e.target.value)} 
                        className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-1 text-[9px] text-gray-300 outline-none resize-none leading-tight" 
                      />
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-neutral-900 justify-end shrink-0">
                      <button 
                        onClick={() => {
                          if (!localEditName.trim()) {
                            alert("至宝名号切不可为空！");
                            return;
                          }
                          if (onUpdateItems) {
                            const updatedList: GameItem[] = items.map(i => i.id === selectedItemId ? {
                              ...i,
                              name: localEditName,
                              type: localEditType as GameItem["type"],
                              quality: localEditQuality as GameItem["quality"],
                              count: localEditCount,
                              description: localEditDesc,
                              effect: localEditEffect || undefined
                            } : i);
                            onUpdateItems(updatedList);
                            setIsEditingItem(false);
                            alert(`🔮 【贡品案底】：上用贡宝档案改造生效，中书省及内务府已同步。`);
                          }
                        }} 
                        className="bg-emerald-800 hover:bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded cursor-pointer shadow active:scale-90"
                      >
                        💾 敕令修缮
                      </button>
                      <button 
                        onClick={() => setIsEditingItem(false)} 
                        className="bg-stone-900 border border-stone-850 text-stone-400 text-[9px] px-2 py-0.5 rounded cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-serif flex flex-col justify-between h-full">
                    
                    {/* Visual Title */}
                    <div className="text-center bg-black/50 p-2 border border-[#bfa15f]/15 rounded bg-gradient-to-b from-[#19150f] to-black relative">
                      {onUpdateItems && (
                        <button 
                          onClick={() => setIsEditingItem(true)} 
                          className="absolute top-1 right-1 text-[#bfa15f] hover:text-amber-200 text-[8px] border border-[#bfa15f]/25 px-1 rounded cursor-pointer animate-pulse shrink-0 select-none"
                          title="修改此宝物"
                        >
                          ⚙️ 敕改
                        </button>
                      )}
                      <span className="text-[8px] text-amber-300/80 block uppercase leading-none">{selectedItem.type}</span>
                      <h4 className="text-xs font-black text-amber-200 mt-1">{selectedItem.name}</h4>
                      <span className="text-[8px] text-gray-500 font-mono">品阶：{selectedItem.quality} | 数量：{selectedItem.count}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-amber-400/90 block">✦ 物考详情说明</span>
                      <p className="text-[10px] text-gray-300 leading-normal bg-black/40 p-2 rounded border border-neutral-900 text-justify font-serif">
                        {selectedItem.description}
                      </p>
                    </div>

                    {selectedItem.effect && (
                      <div className="p-1.5 bg-emerald-500/5 border border-emerald-550/20 rounded text-[9.5px] text-emerald-300 leading-tight">
                        🔥 <b>功效：</b>{selectedItem.effect}
                      </div>
                    )}

                    {/* Interaction buttons */}
                    <div className="space-y-1.5 pt-2 border-t border-neutral-900 font-bold">
                      {selectedItem.type === "灵丹妙药" ? (
                        <button
                          onClick={() => onUseItem && onUseItem(selectedItem.id)}
                          className="w-full py-1 bg-[#8c2c16] hover:bg-[#a63c24] text-[10px] text-white rounded text-center cursor-pointer transition active:scale-95"
                        >
                          💊 服用药剂
                        </button>
                      ) : getCompatibleSlot(selectedItem) ? (
                        <div className="space-y-1">
                          <button
                            onClick={() => {
                              const slot = getCompatibleSlot(selectedItem)!;
                              if (onEquipItem) onEquipItem(selectedItem.id, slot);
                              alert(`已将在行行囊中的【${selectedItem.name}】御挂上至于【${getSlotName(slot)}】！`);
                              setActiveTab("attributes");
                            }}
                            className="w-full py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-[10px] text-amber-300 rounded text-center cursor-pointer transition animate-pulse"
                          >
                            ⚔️ 穿戴武装
                          </button>
                          <span className="text-[8px] text-[#a09e97]/65 block text-center italic">适配槽位: {getSlotName(getCompatibleSlot(selectedItem)!)}</span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => {
                          if (onDiscardItem) onDiscardItem(selectedItem.id);
                          setSelectedItemId(null);
                        }}
                        className="w-full py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-rose-450 rounded text-center cursor-pointer transition"
                      >
                        🗑️ 随身抛弃一格
                      </button>
                    </div>

                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[10px] text-gray-500 py-12">
                  <Sparkles className="w-5 h-5 text-[#bfa15f]/20 mb-1 animate-pulse" />
                  <p className="italic font-serif leading-tight">请在左侧点击物品方格格</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
      
      <div className="text-[8px] text-[#a09e97]/60 text-center font-serif leading-none mt-2 pt-2 border-t border-neutral-900/60 flex justify-between">
        <span>聚宝藏金印 玩家珍玩库</span>
        <span>九省纲纪太极典 承</span>
      </div>
    </div>
  );
}
