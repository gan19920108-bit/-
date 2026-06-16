import React from "react";
import { Skill, Character } from "../types";
import { Zap, BookOpen, Sparkles, Award } from "lucide-react";

interface SkillsPanelProps {
  skills: Skill[];
  char: Character;
  onUseActiveSkill?: (skillId: string, energyCost: number) => void;
  onUpgradeSkill?: (id: string, skillName: string) => void;
  gold: number;
  onUpdateSkills?: (updated: Skill[]) => void;
}

export default function SkillsPanel({
  skills,
  char,
  onUseActiveSkill,
  onUpgradeSkill,
  gold,
  onUpdateSkills,
}: SkillsPanelProps) {
  // Combine custom passive skills defined on character-level
  const getPredefinedPassives = (charName: string): Skill[] => {
    const list: Skill[] = [];
    if (charName.includes("朱由校")) {
      list.push({
        id: "p_wood",
        name: "木工秘传",
        level: "天赋异禀",
        description: "物品制造、巧匠百工行为，可获得【手艺】大额判定常驻护航。",
        exp: 100,
        type: "风雅杂世"
      });
    } else if (charName.includes("赵佶")) {
      list.push({
        id: "p_art",
        name: "书画艺术家",
        level: "千古一绝",
        description: "书法写墨、瘦金书绘卷之行，可被动获得高额心智悟性，豁免情绪烦躁。",
        exp: 100,
        type: "风雅杂世"
      });
    } else if (charName.includes("李治")) {
      list.push({
        id: "p_tang",
        name: "贞观遗风",
        level: "帝命流芳",
        description: "任用贤能、国礼外交时，朝野怨念减半，声望/民心额外增添加权。",
        exp: 100,
        type: "风雅杂世"
      });
    } else if (charName.includes("李隆基")) {
      list.push({
        id: "p_music",
        name: "梨园乐圣",
        level: "一代宗师",
        description: "丝竹乐礼雅集常驻领悟加速，佳人红颜交往时好感度结交效率翻倍。",
        exp: 100,
        type: "风雅杂世"
      });
    } else {
      list.push({
        id: "p_fate",
        name: "圣王天命",
        level: "常驻天数",
        description: "巡行出访天下时，异闻或良性剧情触发几率提升15%，避让凶煞。",
        exp: 100,
        type: "风雅杂世"
      });
    }
    return list;
  };

  const characterPassives = getPredefinedPassives(char.name);

  // Merge general list skills with pre-populated passives for complete skills roster
  const allMergedSkills: (Skill & { isPassive: boolean })[] = [
    ...skills.map(s => ({
      ...s,
      isPassive: s.type === "风雅杂世" || s.name.includes("被动")
    })),
    ...characterPassives.map(s => ({
      ...s,
      isPassive: true
    }))
  ];

  const [selectedSkillId, setSelectedSkillId] = React.useState<string>(allMergedSkills[0]?.id || "");
  const [isMeditatingId, setIsMeditatingId] = React.useState<string | null>(null);

  // Skills add state declarations
  const [showAddSkill, setShowAddSkill] = React.useState<boolean>(false);
  const [addSkillName, setAddSkillName] = React.useState<string>("");
  const [addSkillType, setAddSkillType] = React.useState<string>("风雅杂世");
  const [addSkillLevel, setAddSkillLevel] = React.useState<string>("初窥门径");
  const [addSkillDesc, setAddSkillDesc] = React.useState<string>("");

  // Skills edit state declarations
  const [isEditingSkill, setIsEditingSkill] = React.useState<boolean>(false);
  const [localSkillName, setLocalSkillName] = React.useState<string>("");
  const [localSkillLevel, setLocalSkillLevel] = React.useState<string>("");
  const [localSkillExp, setLocalSkillExp] = React.useState<number>(0);
  const [localSkillDesc, setLocalSkillDesc] = React.useState<string>("");

  const activeSkillInFocus = allMergedSkills.find(s => s.id === selectedSkillId) || allMergedSkills[0];

  React.useEffect(() => {
    if (activeSkillInFocus) {
      setLocalSkillName(activeSkillInFocus.name || "");
      setLocalSkillLevel(activeSkillInFocus.level || "");
      setLocalSkillExp(activeSkillInFocus.exp || 0);
      setLocalSkillDesc(activeSkillInFocus.description || "");
    }
  }, [activeSkillInFocus, isEditingSkill]);

  const currentEnergy = char.attributes.energy !== undefined ? char.attributes.energy : 100;
  const maxEnergy = char.attributes.energyMax !== undefined && char.attributes.energyMax > 0 ? char.attributes.energyMax : 100;

  const handleCastSkill = (s: Skill & { isPassive: boolean }) => {
    if (s.isPassive) return;
    const cost = 25; // standard energy cost
    if (currentEnergy < cost) {
      alert(`精力精力不足！大招释放需要 ${cost} 精力，当前龙体仅存 ${currentEnergy} 精力。`);
      return;
    }
    if (onUseActiveSkill) {
      onUseActiveSkill(s.id, cost);
      alert(`已成功施展国策武学【${s.name}】，消耗 ${cost} 点圣武精力！`);
    }
  };

  const handleLevelUp = (s: Skill) => {
    if (s.id.startsWith("p_")) {
      alert("此为天生龙脉本命神资，高妙已极，不可通过金饷研学。");
      return;
    }
    const energyCost = 15; // 少量能量
    if (currentEnergy < energyCost) {
      alert(`龙体疲惫！研习高级国策每次需要消耗 ${energyCost} 点圣武精力，当前龙体仅存 ${currentEnergy} 精力，请安歇！`);
      return;
    }
    setIsMeditatingId(s.id);
    setTimeout(() => {
      if (onUpgradeSkill) {
        onUpgradeSkill(s.id, s.name);
      }
      setIsMeditatingId(null);
    }, 600);
  };

  return (
    <div id="reconstructed-skills-panel" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bfa15f]/5 to-transparent pointer-events-none rounded-bl-full" />
      
      <div>
        {/* Header - Displays '技能' in top-left as explicitly requested */}
        <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#bfa15f]/10 border border-[#bfa15f]/25">
              <Zap className="w-4 h-4 text-amber-200" />
            </div>
            <h2 className="font-serif text-sm font-black text-[#fcfbfa]">技能</h2>
          </div>

          <div className="bg-black/60 px-2.5 py-1 rounded border border-[#bfa15f]/15 text-[9.5px] font-serif flex items-center gap-1.5">
            <span className="text-[#a09e97]">九五圣武精力:</span>
            <strong className="text-[#00ffd5] font-sans">{currentEnergy} / {maxEnergy} 点</strong>
          </div>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
          
          {/* Left panel: List layout of ALL skills */}
          <div className="md:col-span-5 space-y-1.5 max-h-[330px] overflow-y-auto pr-1">
            <span className="text-[8.5px] text-[#e6c787] block font-serif uppercase pb-1 tracking-widest border-b border-[#bfa15f]/10">
              ⚡ 绝学神通全谱 ({allMergedSkills.length} 阁)
            </span>
            
            {allMergedSkills.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic py-12 text-center">暂无修炼武学真策</p>
            ) : (
              allMergedSkills.map((s) => {
                const isSelected = s.id === selectedSkillId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSkillId(s.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? "bg-[#8c2c16]/20 border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.1)]"
                        : "bg-black/40 border-[#bfa15f]/10 hover:border-neutral-700 hover:bg-neutral-900/50"
                    }`}
                  >
                    <div className="truncate flex items-center gap-1">
                      <span className={`text-[10px] font-serif font-black ${isSelected ? "text-amber-200" : "text-gray-300"}`}>
                        【{s.name}】
                      </span>
                      {s.isPassive && (
                        <span className="text-[8.5px] text-emerald-400 font-bold font-serif whitespace-nowrap">
                          （被动）
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[8px] text-gray-500 font-mono scale-90">{s.level}</span>
                  </button>
                );
              })
            )}

            {/* Add Custom Skill Tool */}
            {showAddSkill ? (
              <div className="bg-black/85 border border-[#bfa15f]/30 rounded-lg p-3 space-y-2 mt-2 text-[10px] animate-fade-in font-serif">
                <span className="text-[10px] text-amber-350 font-black block">🌀 演武堂：自创绝学 / 大政真言</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">技能名讳:</label>
                    <input
                      type="text"
                      placeholder="如：九阴九阳归真术"
                      value={addSkillName}
                      onChange={e => setAddSkillName(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">研习分类:</label>
                    <select
                      value={addSkillType}
                      onChange={e => setAddSkillType(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-amber-300 outline-none cursor-pointer p-0.5"
                    >
                      <option value="风雅杂世">📖 风雅杂世</option>
                      <option value="修真方术">🔮 修真方术 (仙道防术)</option>
                      <option value="武林秘籍">⚔️ 武林秘籍 (沙场武功)</option>
                      <option value="君臣国政">🏛️ 君臣国政 (社稷大略)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">初始境界段位:</label>
                    <input
                      type="text"
                      placeholder="如：略通皮毛、天人合一"
                      value={addSkillLevel}
                      onChange={e => setAddSkillLevel(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">技能类型：</label>
                    <span className="text-[8.5px] text-stone-500 block pt-1.5">圣功研学精修</span>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] text-gray-400 block font-bold">绝技大权（神迹神效描述）:</label>
                  <textarea
                    rows={1.5}
                    placeholder="如：施展此绝技后，自身各项国运属性、气血充盈等大加权..."
                    value={addSkillDesc}
                    onChange={e => setAddSkillDesc(e.target.value)}
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded p-1 text-[9px] text-gray-300 outline-none resize-none leading-tight"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!addSkillName.trim() || !addSkillDesc.trim()) {
                        alert("请将自研绝学名号和神妙功效填写充实！");
                        return;
                      }
                      const newId = `skill_custom_${Date.now()}`;
                      const newSkill: Skill = {
                        id: newId,
                        name: addSkillName,
                        level: addSkillLevel || "窥壁初阶",
                        description: addSkillDesc,
                        exp: 10,
                        type: addSkillType as Skill["type"]
                      };
                      if (onUpdateSkills) {
                        onUpdateSkills([...skills, newSkill]);
                      }
                      setSelectedSkillId(newId);
                      setShowAddSkill(false);
                      setAddSkillName("");
                      setAddSkillDesc("");
                      alert(`👑 【自创奇才】：乾坤造梦！你自研磨磨砺出通神妙法【${addSkillName}】并收入在列！`);
                    }}
                    className="flex-1 py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-white text-[9px] font-black rounded cursor-pointer text-center outline-none"
                  >
                    🏛️ 钦点研创
                  </button>
                  <button
                    onClick={() => setShowAddSkill(false)}
                    className="px-2.5 py-1.5 bg-stone-900 border border-neutral-850 text-[#a09e97] text-[9px] rounded cursor-pointer"
                  >
                    放弃
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSkill(true)}
                className="w-full mt-2 py-1.5 border border-dashed border-[#bfa15f]/30 hover:border-amber-300 bg-neutral-900/30 hover:bg-neutral-900/60 rounded-lg text-[#bfa15f] hover:text-amber-200 text-[9px] font-bold cursor-pointer transition text-center animate-pulse"
              >
                ➕ 天道神运：苦修自琢奇妙法大真功
              </button>
            )}
          </div>

          {/* Right panel: Detailed displays of selected skill */}
          <div className="md:col-span-7 bg-[#0e0e0d] border border-[#bfa15f]/15 rounded-xl p-4 flex flex-col justify-between max-h-[330px] overflow-y-auto">
            {activeSkillInFocus ? (
              isEditingSkill ? (
                <div className="space-y-2 font-serif text-[10px] flex flex-col justify-between h-full animate-fade-in">
                  <h4 className="text-[10px] font-black text-amber-300 border-b border-amber-500/10 pb-1 flex justify-between items-center">
                    <span>⚙️ 敕改道心秘诀秘鉴</span>
                    <button onClick={() => setIsEditingSkill(false)} className="text-gray-500 text-[8px] hover:text-white">✕</button>
                  </h4>

                  <div>
                    <label className="text-[8px] text-gray-500 block">至高绝学名号：</label>
                    <input 
                      type="text" 
                      value={localSkillName} 
                      onChange={e => setLocalSkillName(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-gray-500 block">神功境界位阶：</label>
                      <input 
                        type="text" 
                        value={localSkillLevel} 
                        onChange={e => setLocalSkillLevel(e.target.value)} 
                        className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 block">参悟功底进度：</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={localSkillExp} 
                        onChange={e => setLocalSkillExp(Number(e.target.value))} 
                        className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] text-gray-500 block">至理妙谛/绝学加持详情：</label>
                    <textarea 
                      rows={3} 
                      value={localSkillDesc} 
                      onChange={e => setLocalSkillDesc(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-1 text-[9px] text-gray-300 outline-none resize-none leading-normal" 
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-900 justify-end shrink-0">
                    <button 
                      onClick={() => {
                        if (!localSkillName.trim()) {
                          alert("绝学名讳不可敕改成了虚无！");
                          return;
                        }
                        if (onUpdateSkills) {
                          const updatedList = skills.map(sk => sk.id === activeSkillInFocus.id ? {
                            ...sk,
                            name: localSkillName,
                            level: localSkillLevel,
                            exp: localSkillExp,
                            description: localSkillDesc
                          } : sk);
                          onUpdateSkills(updatedList);
                          setIsEditingSkill(false);
                          alert(`🔮 【大功微调】：玄机卷大政名记敕改完成，印章通达神池！`);
                        }
                      }} 
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-[9px] font-black px-2.5 py-1 rounded cursor-pointer transition shadow active:scale-95"
                    >
                      💾 敕令修缮
                    </button>
                    <button 
                      onClick={() => setIsEditingSkill(false)} 
                      className="bg-stone-900 border border-stone-850 text-stone-400 text-[9px] px-2.5 py-1 rounded cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 font-serif flex flex-col justify-between h-full animate-fade-in">
                  
                  {/* Visual title badge */}
                  <div className="border-b border-neutral-900 pb-2.5 relative">
                    {onUpdateSkills && !activeSkillInFocus.isPassive && (
                      <button 
                        onClick={() => setIsEditingSkill(true)} 
                        className="absolute top-0 right-0 text-[#bfa15f] hover:text-amber-200 text-[8px] border border-[#bfa15f]/25 px-1 rounded cursor-pointer shadow p-0.5 animate-pulse shrink-0 select-none"
                        title="敕改这门绝学"
                      >
                        ⚙️ 敕改
                      </button>
                    )}
                    <div className="flex justify-between items-center text-[9px] mb-1 text-[#a09e97]">
                      <span>分类：{activeSkillInFocus.isPassive ? "🍃 特权被动" : "💥 研参主动"}</span>
                      <span className="font-mono">{activeSkillInFocus.level}</span>
                    </div>
                    <h4 className="text-sm font-black text-amber-200 flex items-center gap-1">
                      📖 【{activeSkillInFocus.name}】
                      {activeSkillInFocus.isPassive && <span className="text-[9px] text-emerald-400">(被动真技)</span>}
                    </h4>
                  </div>

                {/* Skill Effect Display */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-400/90 block">✦ 绝学效果/天道加持</span>
                  <div className="text-[10px] text-gray-200 bg-neutral-950 p-3 rounded-lg border border-neutral-900 text-justify leading-relaxed">
                    {activeSkillInFocus.description}
                  </div>
                </div>

                {/* Skill Cost Display - explicitly requested */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-[#141413] border border-neutral-900 p-2 rounded">
                    <span className="text-gray-500 text-[8px] block uppercase">⚡ 技能消耗:</span>
                    <span className={`font-black block mt-0.5 ${activeSkillInFocus.isPassive ? "text-emerald-400" : "text-cyan-300"}`}>
                      {activeSkillInFocus.isPassive ? "无消耗 (被动常驻)" : "25 武意精力"}
                    </span>
                  </div>
                  <div className="bg-[#141413] border border-neutral-900 p-2 rounded">
                    <span className="text-gray-500 text-[8px] block uppercase">🎓 精进参悟数:</span>
                    <span className="text-gray-200 font-bold block mt-0.5">{activeSkillInFocus.exp}% 熟练度</span>
                  </div>
                </div>

                {/* Bottom operations */}
                <div className="pt-2 border-t border-neutral-900 flex gap-2 font-bold">
                  {!activeSkillInFocus.isPassive && (
                    <button
                      onClick={() => handleCastSkill(activeSkillInFocus)}
                      className="flex-1 py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-white text-[10px] font-black rounded text-center cursor-pointer transition active:scale-95"
                    >
                      💥 施展此术
                    </button>
                  )}

                  {!activeSkillInFocus.id.startsWith("p_") && (
                    <button
                      onClick={() => handleLevelUp(activeSkillInFocus)}
                      disabled={isMeditatingId !== null}
                      className="flex-1 py-1.5 bg-black hover:bg-neutral-900 border border-amber-500/25 text-amber-300 text-[10px] font-black rounded text-center cursor-pointer transition"
                    >
                      {isMeditatingId === activeSkillInFocus.id ? "天意领悟中..." : "参学大政 (15精/时间)"}
                    </button>
                  )}
                </div>

              </div>
            )
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-[10px] italic py-12">
                <BookOpen className="w-5 h-5 text-[#bfa15f]/25 mb-1 animate-pulse" />
                <p>请点选左栏绝学绝技底册</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="text-[8px] text-[#a09e97]/40 text-center font-serif mt-3 pt-2 border-t border-neutral-900/60 flex justify-between select-none">
        <span>九极通霄真道 诸天绝学印鉴</span>
        <span>圣功万古 承</span>
      </div>
    </div>
  );
}
