import React from "react";
import { Character } from "../types";
import { 
  User, Shield, Heart, Trophy, Coins, Star, Activity, Plus, Edit2, Check, X 
} from "lucide-react";

interface CharacterPanelProps {
  char: Character;
  portraits?: Record<string, string>;
  onUpdateCharacter?: (updated: Character) => void;
}

export default function CharacterPanel({ char, portraits, onUpdateCharacter }: CharacterPanelProps) {
  const attr = char.attributes;
  const health = attr.health !== undefined ? attr.health : 100;
  const fitness = attr.fitness !== undefined ? attr.fitness : 100;
  const defense = attr.defense !== undefined ? attr.defense : 0;
  const satiety = attr.satiety !== undefined ? attr.satiety : 100;

  // Local state for interactive modifiability
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [localName, setLocalName] = React.useState<string>(char.name);
  const [localDynasty, setLocalDynasty] = React.useState<string>(char.dynasty || "大梁朝廷");
  const [localTitle, setLocalTitle] = React.useState<string>(char.title || "天子御皇");
  const [localAge, setLocalAge] = React.useState<number>(char.age);
  const [localGold, setLocalGold] = React.useState<number>(attr.gold || 500);
  const [localMilitary, setLocalMilitary] = React.useState<number>(attr.military || 50);
  const [localHealth, setLocalHealth] = React.useState<number>(health);
  const [localFitness, setLocalFitness] = React.useState<number>(fitness);
  const [localSatiety, setLocalSatiety] = React.useState<number>(satiety);

  // Sync state if character props update externally
  React.useEffect(() => {
    setLocalName(char.name);
    setLocalDynasty(char.dynasty || "大梁朝廷");
    setLocalTitle(char.title || "天子御皇");
    setLocalAge(char.age);
    setLocalGold(attr.gold || 500);
    setLocalMilitary(attr.military || 50);
    setLocalHealth(health);
    setLocalFitness(fitness);
    setLocalSatiety(satiety);
  }, [char]);

  const handleSaveChanges = () => {
    if (!localName.trim() || !localDynasty.trim() || !localTitle.trim()) {
      alert("姓名、朝号与封国尊称不可修之为空！");
      return;
    }
    if (onUpdateCharacter) {
      const updated: Character = {
        ...char,
        name: localName,
        dynasty: localDynasty,
        title: localTitle,
        age: Number(localAge),
        attributes: {
          ...char.attributes,
          gold: Number(localGold),
          military: Number(localMilitary),
          health: Number(localHealth),
          fitness: Number(localFitness),
          satiety: Number(localSatiety)
        }
      };
      onUpdateCharacter(updated);
      setIsEditing(false);
      alert("🔮 【诏敕诏下】：天地清气环护，您成功重塑并修改了御前本纪圣体！");
    }
  };
  
  // Safe extraction of base skills or fallback defaults
  const skills = char.baseSkills || {
    athletics: 20, brawl: 20, driving: 15, firearms: 0, larceny: 10, stealth: 12, survival: 20, melee: 25, archery: 20,
    academics: 25, computers: 0, crafts: 15, investigation: 20, medicine: 10, occult: 5, science: 5,
    animalKen: 10, empathy: 20, expression: 25, intimidation: 15, socialize: 25, subterfuge: 15
  };

  // Environment and physical status effects matching user description
  const getStatusTags = () => {
    const list = [];
    const activeStatus = char.status || [];

    if (activeStatus.includes("寒冷")) {
      list.push({ text: "❄️ 寒冷 (行动限制: 敏捷 -1)", color: "text-blue-300 border-blue-600/30 bg-blue-950/20" });
    }
    if (activeStatus.includes("饥饿") || satiety < 30) {
      list.push({ text: "🍖 饥饿 (精力匮乏: 属性 -2)", color: "text-amber-400 border-amber-600/30 bg-amber-950/20" });
    }
    if (char.illness || attr.illness) {
      list.push({ text: `🤢 疾病 [${char.illness || attr.illness}]`, color: "text-rose-400 border-rose-600/30 bg-rose-950/20" });
    }

    if (list.length === 0) {
      list.push({ text: "✨ 诸邪退避 · 龙体安泰", color: "text-emerald-400 border-emerald-600/30 bg-emerald-950/20" });
    }
    return list;
  };

  const statusTags = getStatusTags();

  // Helper formula to scale 0-100 attributes and skills to a strict 1-10 range
  // where "2" represents average human, and "10" is human peak limit.
  const scaleAttribute = (rawVal: number | undefined): number => {
    if (rawVal === undefined) return 2;
    // Map 50 to 2, 100 to 10
    if (rawVal <= 50) {
      const scaled = 1 + (rawVal / 50);
      return parseFloat(Math.max(1, Math.min(2, scaled)).toFixed(1));
    } else {
      const scaled = 2 + ((rawVal - 50) / 50) * 8;
      return parseFloat(Math.max(2, Math.min(10, scaled)).toFixed(1));
    }
  };

  const scaleSkill = (rawVal: number | undefined): number => {
    if (rawVal === undefined) return 2;
    // Skills usually range between 0-50, let's map 20 to 2, 100 to 10
    if (rawVal <= 20) {
      const scaled = 1 + (rawVal / 20);
      return parseFloat(Math.max(1, Math.min(2, scaled)).toFixed(1));
    } else {
      const scaled = 2 + ((rawVal - 20) / 80) * 8;
      return parseFloat(Math.max(2, Math.min(10, scaled)).toFixed(1));
    }
  };

  // Scale basic attributes
  const physiologicalAttr = [
    { name: "力量 (Strength)", val: scaleAttribute(attr.strength), desc: "负重、搏杀与肉身劲力" },
    { name: "敏捷 (Agility)", val: scaleAttribute(attr.agility), desc: "瞬息闪避与突袭灵巧" },
    { name: "耐力 (Stamina)", val: scaleAttribute(attr.stamina), desc: "抗疲耐劳与久守生机" }
  ];

  const mentalAttr = [
    { name: "智力 (Intelligence)", val: scaleAttribute(attr.intelligence), desc: "博古通今与机变断政" },
    { name: "感知 (Perception)", val: scaleAttribute(attr.perception || 50), desc: "推演天下与微察秋毫" },
    { name: "决心 (Resolve)", val: scaleAttribute(attr.resolve || 50), desc: "抗压拒辱与圣贤神志" }
  ];

  const interactiveAttr = [
    { name: "风度 (Charm)", val: scaleAttribute(attr.charm || 50), desc: "帝王威严与群英臣属感召" },
    { name: "操控 (Manipulation)", val: scaleAttribute(attr.manipulation || 50), desc: "玩弄权谋与朝堂平衡制约" },
    { name: "沉着 (Composure)", val: scaleAttribute(attr.composure || 50), desc: "泰山崩而色不改之冷静" },
    { name: "幸运 (Luck)", val: scaleAttribute(attr.luck), desc: "天赐福缘与危中寻生" }
  ];

  const seed = char.avatarSeed || "emperor";

  // Check if Dynamic Portrait exists in portrait mapping
  const hasCustomPortrait = portraits && portraits[char.name];

  const renderSilhouette = (avatarSeed: string) => {
    let svgPath = "";
    let glowColor = "rgba(191,161,95,0.4)";
    
    if (avatarSeed === "female") {
      svgPath = "M16 8 c1.5 0 2.5 -1 2.5 -2.5 S17 3 16 3s-2.5 1-2.5 2.5S14.5 8 16 8z M16 9 c-3 0-5.5 2.5-5.5 5.5 v2.5 c0 1 1 2 2 2 h7 c1 0 2-1 2-2 v-2.5 C21.5 11.5 19 9 16 9z";
      glowColor = "rgba(244,63,94,0.3)";
    } else if (avatarSeed === "general") {
      svgPath = "M16 2 c-1.5 0-3 1.5-3 3 c0 1.5.5 2 1 2.5 C13 8 12.5 9 12 10.5 c-.5 1.5-1 4-1 5.5 h10 c0-1.5-.5-4-1-5.5 C19.5 9 19 8 18 7.5 c.5-.5 1-1 1-2.5 C19 3.5 17.5 2 16 2z";
      glowColor = "rgba(59,130,246,0.3)";
    } else if (avatarSeed === "scholar" || avatarSeed === "alchemist") {
      svgPath = "M16 2 c-1 0-2 1-2 2 v1 c-.5 .5-1.5 1-1.5 2.5 S13 9.5 13 10 v6 h6 v-6 c0-.5 .5-2 1-2.5 S20.5 5.5 20 5V4c0-1-1-2-2-2z";
      glowColor = "rgba(16,185,129,0.3)";
    } else {
      svgPath = "M16 2.5 h-3.5 c-1 0-1.5 .5-1.5 1.5 v2.5 c0 .5 .5 .8 1.2.8h7.6 c.7 0 1.2-.3 1.2-.8 V4c0-1-.5-1.5-1.5-1.5z M16 8.5 c-3 0-5.5 2.5-5.5 5.5 v3 c0 .5 .5 1 1 1 h9 c.5 0 1-.5 1-1 v-3 c0-3-2.5-5.5-5.5-5.5z";
      glowColor = "rgba(245,158,11,0.3)";
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-lg border border-[#bfa15f]/25 relative overflow-hidden group select-none">
        <svg viewBox="0 0 32 32" className="w-14 h-14 text-neutral-800 fill-current opacity-75 group-hover:opacity-90 transition">
          <circle cx="16" cy="16" r="13" className="fill-none stroke-neutral-900 stroke-1" />
          <path d={svgPath} />
        </svg>
        <span className="text-[7.5px] text-[#bfa15f]/70 font-serif font-black uppercase absolute bottom-1.5 tracking-wider">
          {avatarSeed === "female" ? "🌸 侍女" : avatarSeed === "general" ? "🛡️ 猛将" : avatarSeed === "scholar" ? "📜 宰辅" : "👑 圣上"}
        </span>
      </div>
    );
  };

  return (
    <div id="character-panel" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-4 shadow-2xl relative overflow-hidden h-full">
      {/* Visual embellishment */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bfa15f]/5 to-transparent pointer-events-none rounded-bl-full" />
      
      <div className="space-y-4 relative z-10 font-serif">
        
        {/* Requirement 2 Split Layout: Left upper side is 25% width portrait. Right side has structured rows */}
        <div className="grid grid-cols-12 gap-3 pb-3 border-b border-[#bfa15f]/15 items-stretch">
          
          {/* Portrait Container - occupying ~25% (col-span-3 or col-span-4) */}
          <div className="col-span-4 aspect-square max-h-[110px] sm:max-h-[140px] shrink-0">
            {hasCustomPortrait ? (
              <div className="w-full h-full rounded-lg overflow-hidden border border-[#bfa15f]/40 relative bg-neutral-950">
                <img 
                  src={portraits[char.name]} 
                  alt={char.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-[7.5px] px-1 py-0.5 bg-black/90 text-amber-300 font-sans absolute bottom-1 left-1.5 rounded leading-none border border-amber-500/25">
                  自定义肖像
                </span>
              </div>
            ) : (
              renderSilhouette(seed)
            )}
          </div>

          {/* Right column: Name, Status, Age, Money, Health, Fitness, Satiety downwards */}
          <div className="col-span-8 flex flex-col justify-between space-y-1.5 pl-1.5">
            {isEditing ? (
              <div className="space-y-1 bg-black/50 p-2 rounded-lg border border-[#bfa15f]/20">
                <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                  <input 
                    type="text" 
                    value={localDynasty} 
                    onChange={e => setLocalDynasty(e.target.value)} 
                    className="bg-neutral-900 px-1 border border-amber-500/30 rounded text-amber-200 text-[8.5px]" 
                    placeholder="封号"
                  />
                  <input 
                    type="text" 
                    value={localTitle} 
                    onChange={e => setLocalTitle(e.target.value)} 
                    className="bg-neutral-900 px-1 border border-amber-500/30 rounded text-white text-[8.5px]" 
                    placeholder="庙号"
                  />
                </div>
                <input 
                  type="text" 
                  value={localName} 
                  onChange={e => setLocalName(e.target.value)} 
                  className="bg-neutral-900 px-1 border border-amber-500/30 rounded text-white text-[10px] w-full font-bold" 
                  placeholder="姓名"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[8px] text-[#bfa15f]/80 block leading-none">
                    {char.dynasty} · {char.title || "真龙执乾坤"}
                  </span>
                  {onUpdateCharacter && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-[#bfa15f] hover:text-amber-200 text-[8.5px] border border-[#bfa15f]/30 px-1 rounded flex items-center gap-0.5"
                    >
                      <Edit2 className="w-2 h-2" /> <span>敕改</span>
                    </button>
                  )}
                </div>
                <h3 className="text-sm font-black text-[#fcfbfa] mt-1 tracking-wider leading-none">
                  {char.name}
                </h3>
              </div>
            )}

            {/* Status conditions row */}
            <div className="flex flex-wrap gap-1 leading-none">
              {statusTags.map((t, idx) => (
                <span key={idx} className={`px-1.5 py-0.5 rounded text-[8.5px] border ${t.color} font-serif whitespace-nowrap leading-none`}>
                  {t.text}
                </span>
              ))}
            </div>

            {/* Multi-row grid layout from top to bottom (Editable) */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 text-[9px] bg-black/40 p-2 rounded border border-neutral-900 border-dashed">
              <div className="leading-none">
                <span className="text-gray-500 text-[8px] block">天岁：</span>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={localAge} 
                    onChange={e => setLocalAge(Number(e.target.value))} 
                    className="w-11 bg-neutral-900 text-white rounded px-0.5 text-[8.5px]" 
                  />
                ) : (
                  <span className="text-white font-bold block pt-0.5">{char.age} 载</span>
                )}
              </div>
              <div className="leading-none pl-1.5 border-l border-neutral-850">
                <span className="text-gray-500 text-[8px] block">私库金钱：</span>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={localGold} 
                    onChange={e => setLocalGold(Number(e.target.value))} 
                    className="w-12 bg-neutral-900 text-amber-300 rounded px-0.5 text-[8.5px]" 
                  />
                ) : (
                  <span className="text-amber-400 font-bold block pt-0.5">🪙 {attr.gold} 两</span>
                )}
              </div>
              <div className="leading-none pl-1.5 border-l border-neutral-850">
                <span className="text-gray-500 text-[8px] block">亲卫兵力：</span>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={localMilitary} 
                    onChange={e => setLocalMilitary(Number(e.target.value))} 
                    className="w-11 bg-neutral-900 text-indigo-300 rounded px-0.5 text-[8.5px]" 
                  />
                ) : (
                  <span className="text-indigo-400 font-bold block pt-0.5">🛡️ {attr.military} 宿</span>
                )}
              </div>
            </div>

            {/* Row gauges: Health, Fitness, Satiety closely styled (Editable via sliders if editing) */}
            <div className="space-y-1 text-[9.5px]">
              {/* 生命值 */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-rose-400 font-bold block">❤️ 生命: {isEditing ? localHealth : health}%</span>
                {isEditing ? (
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={localHealth} 
                    onChange={e => setLocalHealth(Number(e.target.value))} 
                    className="w-16 h-1 rounded appearance-none cursor-pointer accent-rose-500"
                  />
                ) : (
                  <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-rose-500" style={{ width: `${health}%` }} />
                  </div>
                )}
              </div>

              {/* 健康值 */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-emerald-400 font-bold block">🤢 健康: {isEditing ? localFitness : fitness}%</span>
                {isEditing ? (
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={localFitness} 
                    onChange={e => setLocalFitness(Number(e.target.value))} 
                    className="w-16 h-1 rounded appearance-none cursor-pointer accent-emerald-500"
                  />
                ) : (
                  <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-emerald-500" style={{ width: `${fitness}%` }} />
                  </div>
                )}
              </div>

              {/* 饱食度 */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-amber-400 font-bold block">🍖 饱食: {isEditing ? localSatiety : satiety}%</span>
                {isEditing ? (
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={localSatiety} 
                    onChange={e => setLocalSatiety(Number(e.target.value))} 
                    className="w-16 h-1 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                ) : (
                  <div className="w-16 h-1 bg-neutral-900 rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-amber-500" style={{ width: `${satiety}%` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Editable save controls */}
            {isEditing && (
              <div className="flex justify-end gap-1.5 pt-1.5">
                <button 
                  onClick={handleSaveChanges} 
                  className="bg-emerald-800 hover:bg-emerald-700 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded border border-emerald-600 flex items-center gap-0.5 cursor-pointer"
                >
                  <Check className="w-2.5 h-2.5" /> 保存
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="bg-stone-900 text-stone-400 hover:text-white text-[8px] px-2 py-0.5 rounded border border-stone-850 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" /> 取消
                </button>
              </div>
            )}

          </div>
        </div>


        {/* Level indicators: Imperial stats */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-950/60 p-2 rounded-md border border-neutral-850 text-[10px]">
          <div className="flex justify-between items-center text-purple-300">
            <span>🛡️ 帝防要障:</span>
            <b className="text-white font-sans">{defense} / 100</b>
          </div>
          <div className="flex justify-between items-center text-amber-200">
            <span>🏆 朝廷声望:</span>
            <b className="text-white font-sans">{attr.prestige} / 100</b>
          </div>
        </div>

        {/* Emperor Temperament & Virtue Indexes */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-950/80 p-2 rounded-md border border-amber-500/10 text-[9.5px] leading-tight font-serif">
          <div className="flex flex-col justify-between text-left space-y-1">
            <span className="text-gray-400 font-bold">✨ 明智属性：</span>
            <div className="flex justify-between items-center">
              <span className={`font-serif font-black text-[9.5px] ${
                (attr.wisdomIndex ?? 0) >= 2 ? "text-emerald-400" : (attr.wisdomIndex ?? 0) <= -2 ? "text-red-400" : "text-gray-300"
              }`}>
                {
                  (attr.wisdomIndex ?? 0) >= 2 ? "👑 贤明君王" : (attr.wisdomIndex ?? 0) <= -2 ? "🌀 昏庸之君" : "⚖️ 中庸君王"
                }
              </span>
              <span className="text-amber-300 font-mono font-bold">{(attr.wisdomIndex ?? 0).toFixed(1)}</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1 mt-0.5 overflow-hidden">
              <div 
                className={`h-full ${
                  (attr.wisdomIndex ?? 0) >= 2 ? "bg-emerald-500" : (attr.wisdomIndex ?? 0) <= -2 ? "bg-red-500" : "bg-gray-400"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (((attr.wisdomIndex ?? 0) + 5) / 10) * 100))}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-between text-left space-y-1 pl-3 border-l border-neutral-850">
            <span className="text-gray-400 font-bold">❤️ 仁政行省：</span>
            <div className="flex justify-between items-center">
              <span className={`font-serif font-black text-[9.5px] ${
                (attr.benevolenceIndex ?? 0) >= 2 ? "text-pink-400" : (attr.benevolenceIndex ?? 0) <= -2 ? "text-rose-500" : "text-gray-300"
              }`}>
                {
                  (attr.benevolenceIndex ?? 0) >= 2 ? "💮 仁德天子" : (attr.benevolenceIndex ?? 0) <= -2 ? "⛓️ 残暴之帝" : "⚖️ 中庸统治"
                }
              </span>
              <span className="text-amber-300 font-mono font-bold">{(attr.benevolenceIndex ?? 0).toFixed(1)}</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1 mt-0.5 overflow-hidden">
              <div 
                className={`h-full ${
                  (attr.benevolenceIndex ?? 0) >= 2 ? "bg-pink-500" : (attr.benevolenceIndex ?? 0) <= -2 ? "bg-rose-500" : "bg-gray-400"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (((attr.benevolenceIndex ?? 0) + 5) / 10) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section: Base Attributes (Scaled 1-10) */}
        <div className="space-y-2 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900">
          <h4 className="font-serif text-[#e6c787] text-[10.5px] font-black border-b border-neutral-850 pb-1 flex items-center gap-1 uppercase tracking-wider">
            ✦ 九五根本·基础属性评定 (正常生:2·人体极限:10) ✦
          </h4>

          {/* Physiological attributes */}
          <div className="space-y-1">
            <span className="text-[9px] text-red-400 font-bold block text-left">【生理本根】 (力量、敏捷、耐力)</span>
            <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
              {physiologicalAttr.map((a, i) => (
                <div key={i} className="bg-black/50 p-1 rounded border border-neutral-900 text-center relative group" title={a.desc}>
                  <span className="text-gray-400 block text-[8.5px] leading-none">{a.name.slice(0, 2)}</span>
                  <span className="text-gray-200 font-black text-xs block pt-0.5 font-sans text-red-200">{a.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mental attributes */}
          <div className="space-y-1 pt-1.5">
            <span className="text-[9px] text-blue-400 font-bold block text-left">【修真法性】 (智力、感知、决心)</span>
            <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
              {mentalAttr.map((a, i) => (
                <div key={i} className="bg-black/50 p-1 rounded border border-neutral-900 text-center relative group" title={a.desc}>
                  <span className="text-gray-400 block text-[8.5px] leading-none">{a.name.slice(0, 2)}</span>
                  <span className="text-gray-200 font-black text-xs block pt-0.5 font-sans text-blue-200">{a.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive attributes */}
          <div className="space-y-1 pt-1.5">
            <span className="text-[9px] text-pink-400 font-bold block text-left">【社稷风情】 (风度、操控、沉着、幸运)</span>
            <div className="grid grid-cols-4 gap-1 text-[9px]">
              {interactiveAttr.map((a, i) => (
                <div key={i} className="bg-black/50 p-1.5 rounded border border-neutral-900 text-center relative group" title={a.desc}>
                  <span className="text-gray-400 block text-[8px] leading-none">{a.name.slice(0, 2)}</span>
                  <span className="text-gray-200 font-black text-[11px] block pt-0.5 font-sans text-pink-200">{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Base Skills (Scaled 1-10) */}
        <div className="space-y-2 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900">
          <h4 className="font-serif text-[#e6c787] text-[10.5px] font-black border-b border-neutral-850 pb-1 flex items-center gap-1 uppercase tracking-wider">
            ✦ 帝相百艺·基础技能图谱 (正常生:2·人体极限:10) ✦
          </h4>

          {/* Phys skills */}
          <div className="space-y-1">
            <span className="text-[9px] text-red-300 font-bold block">生理武技:</span>
            <div className="grid grid-cols-3 gap-1 text-[8.5px] text-gray-400 font-sans">
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">运动 <b>{scaleSkill(skills.athletics)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">肉搏 <b>{scaleSkill(skills.brawl)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">驾驶 <b>{scaleSkill(skills.driving)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">枪械 <b>{scaleSkill(skills.firearms)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">暗器 <b>{scaleSkill(skills.larceny)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">轻功 <b>{scaleSkill(skills.stealth)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">荒留 <b>{scaleSkill(skills.survival)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">白刃 <b>{scaleSkill(skills.melee)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">神弓 <b>{scaleSkill(skills.archery)}</b></span>
            </div>
          </div>

          {/* Mental skills */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] text-blue-300 font-bold block">文华心智:</span>
            <div className="grid grid-cols-3 gap-1 text-[8.5px] text-gray-400 font-sans">
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">学问 <b>{scaleSkill(skills.academics)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">算术 <b>{scaleSkill(skills.computers)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">营造 <b>{scaleSkill(skills.crafts)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">神机 <b>{scaleSkill(skills.investigation)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">金石 <b>{scaleSkill(skills.medicine)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">术学 <b>{scaleSkill(skills.occult)}</b></span>
            </div>
          </div>

          {/* Interaction skills */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] text-pink-300 font-bold block">帝皇行御:</span>
            <div className="grid grid-cols-3 gap-1 text-[8.5px] text-gray-400 font-sans">
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">训兽 <b>{scaleSkill(skills.animalKen)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">察觉 <b>{scaleSkill(skills.empathy)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">批红 <b>{scaleSkill(skills.expression)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">帝威 <b>{scaleSkill(skills.intimidation)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">宴饮 <b>{scaleSkill(skills.socialize)}</b></span>
              <span className="bg-black/30 p-1 rounded border border-neutral-900/60 flex justify-between">韬晦 <b>{scaleSkill(skills.subterfuge)}</b></span>
            </div>
          </div>
        </div>

        {/* NOTE FOR REQUIREMENT 2: Deleted the '列朝来尘批言' block completely */}

      </div>
    </div>
  );
}
