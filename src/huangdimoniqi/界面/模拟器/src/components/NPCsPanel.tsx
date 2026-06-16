import React from "react";
import { Users, Heart, Scroll, Shield, X, Network, FileText, Compass } from "lucide-react";
import { GameNPC } from "../types";

interface NPCsPanelProps {
  npcList: GameNPC[];
  onInteractNPC?: (npcName: string, actionType: "reward" | "conspire" | "talk") => void;
  portraits?: Record<string, string>; // Retrieve from portrait manager state
  onUpdateNPCs?: (updated: GameNPC[]) => void;
}

export default function NPCsPanel({ npcList, onInteractNPC, portraits, onUpdateNPCs }: NPCsPanelProps) {
  // Filter NPCs to ONLY show present characters
  const presentNPCs = npcList.filter(n => n.isPresent === true);

  const [activeNpcName, setActiveNpcName] = React.useState<string>(presentNPCs[0]?.name || "");
  const [viewMode, setViewMode] = React.useState<"list" | "graph">("list");

  // Local state for interactive modifiability
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [localName, setLocalName] = React.useState<string>("");
  const [localRole, setLocalRole] = React.useState<string>("");
  const [localAge, setLocalAge] = React.useState<number>(30);
  const [localRelationVal, setLocalRelationVal] = React.useState<number>(50);
  const [localLoyalty, setLocalLoyalty] = React.useState<number>(50);
  const [localStatusText, setLocalStatusText] = React.useState<string>("");
  const [localLocation, setLocalLocation] = React.useState<string>("");
  const [localThoughts, setLocalThoughts] = React.useState<string>("");
  const [localImpression, setLocalImpression] = React.useState<string>("");

  // NPC Creation State
  const [showAddNpc, setShowAddNpc] = React.useState<boolean>(false);
  const [addName, setAddName] = React.useState<string>("");
  const [addRole, setAddRole] = React.useState<string>("");
  const [addAge, setAddAge] = React.useState<number>(25);
  const [addAvatarSeed, setAddAvatarSeed] = React.useState<string>("scholar");

  // Keep active NPC state in sync with present NPCs
  React.useEffect(() => {
    if (presentNPCs.length > 0 && !presentNPCs.find(n => n.name === activeNpcName)) {
      setActiveNpcName(presentNPCs[0].name);
    }
  }, [npcList, activeNpcName]);

  const activeNpc = presentNPCs.find(n => n.name === activeNpcName) || presentNPCs[0];

  React.useEffect(() => {
    if (activeNpc) {
      setLocalName(activeNpc.name);
      setLocalRole(activeNpc.role);
      setLocalAge(activeNpc.age);
      setLocalRelationVal(activeNpc.relationVal);
      setLocalLoyalty(activeNpc.loyalty);
      setLocalStatusText(activeNpc.statusText || "");
      setLocalLocation(activeNpc.location || "");
      setLocalThoughts(activeNpc.currentThoughts || "");
      setLocalImpression(activeNpc.playerImpression || "");
    }
  }, [activeNpc, isEditing]);

  // Helper colors for relationships
  const getRelationBadge = (val: number) => {
    if (val >= 90) return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    if (val >= 75) return "bg-orange-500/10 text-orange-400 border-orange-500/25";
    if (val >= 50) return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    return "bg-zinc-800 text-gray-400 border-zinc-700";
  };

  const getLoyaltyBadge = (val: number) => {
    if (val >= 10) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    if (val >= 70) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
    return "bg-rose-500/10 text-rose-400 border-rose-500/25";
  };

  // Silhouette renderer in matching古风 style
  const renderSilhouette = (avatarSeed: string, sizeClass = "w-10 h-10") => {
    let svgPath = "";
    
    if (avatarSeed === "female") {
      svgPath = "M16 8 c1.5 0 2.5 -1 2.5 -2.5 S17 3 16 3s-2.5 1-2.5 2.5S14.5 8 16 8z M16 9 c-3 0-5.5 2.5-5.5 5.5 v2.5 c0 1 1 2 2 2 h7 c1 0 2-1 2-2 v-2.5 C21.5 11.5 19 9 16 9z";
    } else if (avatarSeed === "general") {
      svgPath = "M16 2 c-1.5 0-3 1.5-3 3 c0 1.5.5 2 1 2.5 C13 8 12.5 9 12 10.5 c-.5 1.5-1 4-1 5.5 h10 c0-1.5-.5-4-1-5.5 C19.5 9 19 8 18 7.5 c.5-.5 1-1 1-2.5 C19 3.5 17.5 2 16 2z";
    } else if (avatarSeed === "scholar") {
      svgPath = "M16 2 c-1 0-2 1-2 2 v1 c-.5 .5-1.5 1-1.5 2.5 S13 9.5 13 10 v6 h6 v-6 c0-.5 .5-2 1-2.5 S20.5 5.5 20 5V4c0-1-1-2-2-2z";
    } else {
      svgPath = "M16 2.5 h-3.5 c-1 0-1.5 .5-1.5 1.5 v2.5 c0 .5 .5 .8 1.2.8h7.6 c.7 0 1.2-.3 1.2-.8 V4c0-1-.5-1.5-1.5-1.5z M16 8.5 c-3 0-5.5 2.5-5.5 5.5 v3 c0 .5 .5 1 1 1 h9 c.5 0 1-.5 1-1 v-3 c0-3-2.5-5.5-5.5-5.5z";
    }

    return (
      <div className={`rounded-full bg-gradient-to-b from-neutral-850 to-neutral-950 flex items-center justify-center border border-amber-500/20 shrink-0 select-none overflow-hidden ${sizeClass}`}>
        <svg viewBox="0 0 32 32" className="w-2/3 h-2/3 text-neutral-800 fill-current opacity-85">
          <circle cx="16" cy="16" r="13" className="fill-none" />
          <path d={svgPath} />
        </svg>
      </div>
    );
  };

  // Graphical nodes coordinates mapping
  const renderRelationshipGraph = () => {
    if (presentNPCs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-xs font-serif italic text-center w-full h-[360px]">
          <span>此局之中暂无入仕臣卿，天命神隐，山河寂静。</span>
        </div>
      );
    }

    const cx = 220; // Center X
    const cy = 180; // Center Y
    const radius = 120; // Orbital circle radius

    // Precalculate coordinates for orbital nodes
    const graphNodes = presentNPCs.map((npc, idx) => {
      const angle = (idx * 2 * Math.PI) / presentNPCs.length - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      return { ...npc, x, y };
    });

    return (
      <div className="relative w-full h-[360px] bg-black/50 border border-[#bfa15f]/15 rounded-xl overflow-hidden select-none">
        {/* Dynamic Background Astrolabe Design */}
        <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-80 h-80 rounded-full border-4 border-amber-500 border-dashed animate-[spin_100s_linear_infinite]" />
          <div className="w-56 h-56 rounded-full border border-amber-500 border-dotted absolute animate-[spin_50s_linear_infinite]" />
        </div>

        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {graphNodes.map((node, idx) => {
            // Determine connector style based on favorability
            const isFriendly = node.relationVal >= 70;
            const isHostile = node.relationVal < 40;
            const strokeColor = isFriendly ? "rgba(244, 63, 94, 0.5)" : isHostile ? "rgba(59, 130, 246, 0.4)" : "rgba(191, 161, 95, 0.4)";
            return (
              <g key={idx}>
                {/* Connector line from Emperor to NPC */}
                <line 
                  x1={cx} 
                  y1={cy} 
                  x2={node.x} 
                  y2={node.y} 
                  stroke={strokeColor} 
                  strokeWidth={node.relationVal > 80 ? "2" : "1"}
                  strokeDasharray={node.loyalty < 50 ? "4,4" : "none"}
                />

                {/* Draw small arrows */}
                <circle cx={node.x} cy={node.y} r="2" fill={strokeColor} />

                {/* Midpoint relation text badge block */}
                <foreignObject 
                  x={(cx + node.x) / 2 - 25} 
                  y={(cy + node.y) / 2 - 9} 
                  width="50" 
                  height="18"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="bg-black/90 px-1 py-0.5 rounded text-[7px] text-amber-200 border border-[#bfa15f]/10 scale-90 select-none">
                      {node.relationship || "臣属"}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Emperor Center Node */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 select-none"
          style={{ left: `${cx}px`, top: `${cy}px` }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-600 to-amber-950 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center relative overflow-hidden">
            <span className="text-lg">👑</span>
          </div>
          <span className="text-[9.5px] font-black text-amber-300 font-serif bg-black/90 border border-amber-500/20 px-1.5 py-0.5 rounded-full mt-1.5 whitespace-nowrap shadow-md">
            至尊天子 (圣上)
          </span>
        </div>

        {/* NPC Satellite Nodes */}
        {graphNodes.map((node, idx) => {
          const isSelected = node.name === activeNpcName;
          const hasCustom = portraits && portraits[node.name];
          
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveNpcName(node.name)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer focus:outline-none transition-transform active:scale-95 text-center"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <div className={`p-0.5 rounded-full border-2 transition-all duration-300 ${
                isSelected 
                  ? "border-[#8c2c16] shadow-[0_0_12px_rgba(140,44,22,0.6)] scale-110" 
                  : "border-[#bfa15f]/30 hover:border-[#bfa15f] hover:scale-105"
              }`}>
                {hasCustom ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-900 border border-amber-500/10 shrink-0">
                    <img 
                      src={portraits[node.name]} 
                      alt={node.name} 
                      className="w-full h-full object-cover animate-fade-in" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  renderSilhouette(node.avatarSeed, "w-10 h-10")
                )}
              </div>
              <div className="bg-black/85 border border-[#bfa15f]/15 rounded px-1 mt-1 font-serif shadow-sm pointer-events-none scale-90 whitespace-nowrap">
                <p className="text-[8.5px] font-black text-[#fcfbfa] leading-none py-0.5">{node.name}</p>
                <p className="text-[6.5px] text-amber-300/80 leading-none pb-0.5">{node.relationVal}好感</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div id="new-npcs-panel-wrapper" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between min-h-[440px]">
      {/* Dynamic top tabs for View toggling */}
      <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-[#bfa15f]/20 z-10 select-none">
        <div className="text-[10px] text-[#e6c787] font-serif font-black uppercase tracking-widest block flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#bfa15f]" />
          <span>👥 朝政重臣画录谱</span>
          <span className="text-[9px] text-gray-500">({presentNPCs.length} 显位录)</span>
        </div>

        <div className="flex items-center bg-black border border-[#bfa15f]/25 rounded-md p-0.5 text-[8.5px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 ${
              viewMode === "list" 
                ? "bg-[#8c2c16] text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-2.5 h-2.5" />
            <span>臣僚折卷</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("graph")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 ${
              viewMode === "graph" 
                ? "bg-[#8c2c16] text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Network className="w-2.5 h-2.5" />
            <span>关系图谱</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 items-stretch">
        
        {/* Render column matching the active viewMode state */}
        <div className="md:col-span-6 flex flex-col justify-between">
          {viewMode === "list" ? (
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 flex-1">
              {presentNPCs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-16 font-serif italic">浮生未定，此际尚无在朝臣子在列面圣</p>
              ) : (
                presentNPCs.map((npc, idx) => {
                  const isSelected = npc.name === activeNpcName;
                  const hasCustom = portraits && portraits[npc.name];
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveNpcName(npc.name)}
                      className={`w-full text-left p-2.5 rounded-lg border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#8c2c16]/20 border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.1)]"
                          : "bg-black/40 border-[#bfa15f]/10 hover:border-[#bfa15f]/25 hover:bg-neutral-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 max-w-[85%]">
                        {hasCustom ? (
                          <div className="w-8 h-8 rounded-full border border-amber-500/20 overflow-hidden shrink-0">
                            <img 
                              src={portraits[npc.name]} 
                              alt={npc.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          renderSilhouette(npc.avatarSeed, "w-8 h-8")
                        )}

                        <div className="truncate">
                          <span className="block text-xs font-serif font-black text-[#fcfbfa]">{npc.name}</span>
                          <span className="block text-[8px] text-gray-400 font-bold truncate">{npc.role}</span>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-0.5 shrink-0 select-none">
                        <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                          {npc.relationVal}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}

              {/* Add Custom NPC Recruiting control */}
              {showAddNpc ? (
                <div className="bg-black/80 border border-[#bfa15f]/30 rounded-lg p-3.5 space-y-2 mt-2 animate-fade-in text-[10px]">
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                    🎯 敕召天下贤良重臣 (Recruit NPC)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-gray-400 block">贤士名讳:</label>
                      <input
                        type="text"
                        placeholder="如：诸葛孔明"
                        value={addName}
                        onChange={e => setAddName(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-400 block">预授高职:</label>
                      <input
                        type="text"
                        placeholder="如：中书令"
                        value={addRole}
                        onChange={e => setAddRole(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-gray-400 block">载寿岁数:</label>
                      <input
                        type="number"
                        value={addAge}
                        onChange={e => setAddAge(Number(e.target.value))}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-400 block">灵气身份:</label>
                      <select
                        value={addAvatarSeed}
                        onChange={e => setAddAvatarSeed(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9px] text-amber-300 outline-none cursor-pointer"
                      >
                        <option value="scholar">📜 文儒学士</option>
                        <option value="general">⚔️ 骁勇猛将</option>
                        <option value="female">🌸 红颜丽姬</option>
                        <option value="emperor">👑 天子宿卫</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <button
                      onClick={() => {
                        if (!addName.trim() || !addRole.trim()) {
                          alert("请填写贤士名讳与预授官职！");
                          return;
                        }
                        if (npcList.some(n => n.name === addName)) {
                          alert(`重臣「${addName}」已在仕，请勿重名录用。`);
                          return;
                        }
                        const newNpc: GameNPC = {
                          name: addName,
                          role: addRole,
                          age: addAge,
                          avatarSeed: addAvatarSeed,
                          relationVal: 60,
                          loyalty: 80,
                          isPresent: true,
                          relationship: "重信臣下",
                          location: "京城朝会阁",
                          currentThoughts: "圣上慧眼识金，臣必尽节竭力！",
                          statusText: `由圣皇敕旨诏令特擢的新晋朝臣。名讳为【${addName}】，身授【${addRole}】高职。`,
                          deeds: ["起家除仕：龙恩宣谕，擢拔任职。"],
                          playerImpression: "「新晋招纳之士，忠贞可用。」",
                          items: []
                        };
                        if (onUpdateNPCs) {
                          onUpdateNPCs([...npcList, newNpc]);
                        }
                        setActiveNpcName(addName);
                        setShowAddNpc(false);
                        setAddName("");
                        setAddRole("");
                        alert(`👑 【招贤圣旨】：擢授「${addName}」为「${addRole}」，钦赐入朝觐见！`);
                      }}
                      className="flex-1 py-1 bg-[#8c2c16] text-white text-[9px] font-black rounded cursor-pointer text-center"
                    >
                      🏛️ 拜官任用，颁旨上殿
                    </button>
                    <button
                      onClick={() => setShowAddNpc(false)}
                      className="px-2.5 py-1 bg-stone-905 border border-neutral-850 text-gray-400 text-[9px] rounded cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddNpc(true)}
                  className="w-full mt-2 py-1 border border-dashed border-[#bfa15f]/30 hover:border-amber-300 bg-neutral-900/30 hover:bg-neutral-900/60 rounded-lg text-[#bfa15f] hover:text-amber-200 text-[9px] font-bold cursor-pointer transition text-center animate-pulse"
                >
                  ➕ 敕旨招贤：特擢录用天下名臣
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-[360px]">
              {renderRelationshipGraph()}
            </div>
          )}
        </div>

        {/* Right column: Selected NPC Detailed Profile */}
        <div id="npc-detailed-profile-panel" className="md:col-span-6 bg-black/60 border border-[#bfa15f]/20 rounded-xl p-4.5 flex flex-col justify-between max-h-[365px] overflow-y-auto">
          {activeNpc ? (
            isEditing ? (
              <div className="space-y-3 font-serif text-[10px] animate-fade-in">
                <h4 className="text-[11px] font-black text-amber-300 border-b border-amber-500/10 pb-1 flex justify-between items-center">
                  <span>⚙️ 皇卷诏命：润色重臣底卷</span>
                  <button onClick={() => setIsEditing(false)} className="text-gray-500 text-[9px] hover:text-white">✕ 关闭</button>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-400 block">名讳：</label>
                    <input 
                      type="text" 
                      value={localName} 
                      onChange={e => setLocalName(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 block">官职：</label>
                    <input 
                      type="text" 
                      value={localRole} 
                      onChange={e => setLocalRole(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-400 block">岁数载寿：</label>
                    <input 
                      type="number" 
                      value={localAge} 
                      onChange={e => setLocalAge(Number(e.target.value))} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 block">驻留地方：</label>
                    <input 
                      type="text" 
                      value={localLocation} 
                      onChange={e => setLocalLocation(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded border border-neutral-900 border-dashed text-[8px]">
                  <div>
                    <label className="text-rose-300 block">深情恩遇 (好感: {localRelationVal})：</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={localRelationVal} 
                      onChange={e => setLocalRelationVal(Number(e.target.value))} 
                      className="w-full h-1 bg-neutral-900 rounded appearance-none cursor-pointer accent-rose-500" 
                    />
                  </div>
                  <div>
                    <label className="text-emerald-300 block">秉乾忠贞 (忠诚: {localLoyalty})：</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={localLoyalty} 
                      onChange={e => setLocalLoyalty(Number(e.target.value))} 
                      className="w-full h-1 bg-neutral-900 rounded appearance-none cursor-pointer accent-emerald-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[8px] text-gray-400 block">臣僚想法意识：</label>
                  <input 
                    type="text" 
                    value={localThoughts} 
                    onChange={e => setLocalThoughts(e.target.value)} 
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[8px] text-gray-400 block">风姿圣心印象：</label>
                  <input 
                    type="text" 
                    value={localImpression} 
                    onChange={e => setLocalImpression(e.target.value)} 
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-amber-200 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[8px] text-gray-400 block">重臣底册传记描述：</label>
                  <textarea 
                    rows={2} 
                    value={localStatusText} 
                    onChange={e => setLocalStatusText(e.target.value)} 
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded p-1 text-[9.5px] text-gray-300 outline-none resize-none leading-tight" 
                  />
                </div>

                <div className="flex gap-2 pt-1.5 justify-end">
                  <button 
                    onClick={() => {
                      if (!localName.trim() || !localRole.trim()) {
                        alert("重臣名讳与官职切不可敕改为空！");
                        return;
                      }
                      if (onUpdateNPCs) {
                        const updatedList = npcList.map(n => n.name === activeNpc.name ? {
                          ...n,
                          name: localName,
                          role: localRole,
                          age: localAge,
                          relationVal: localRelationVal,
                          loyalty: localLoyalty,
                          statusText: localStatusText,
                          location: localLocation,
                          currentThoughts: localThoughts,
                          playerImpression: localImpression
                        } : n);
                        onUpdateNPCs(updatedList);
                        setActiveNpcName(localName);
                        setIsEditing(false);
                        alert(`🔮 【敕谕颁下】：朝臣「${localName}」的仕途档案已改写完成！`);
                      }
                    }} 
                    className="bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded cursor-pointer"
                  >
                    💾 保存敕改
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="bg-stone-900 border border-stone-800 text-stone-400 hover:text-white text-[9px] px-2.5 py-1 rounded cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-serif">
                
                {/* Header profile: Name, Identity, Age */}
                <div className="flex items-stretch gap-4 border-b border-[#bfa15f]/10 pb-3">
                  {portraits && portraits[activeNpc.name] ? (
                    <div className="w-24 h-24 rounded-lg border-2 border-amber-400 shadow-xl shrink-0 overflow-hidden bg-neutral-950">
                      <img 
                        src={portraits[activeNpc.name]} 
                        alt={activeNpc.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    renderSilhouette(activeNpc.avatarSeed, "w-24 h-24")
                  )}

                  <div className="flex flex-col justify-between py-1 w-full">
                    <div className="w-full">
                      <div className="flex justify-between items-start w-full">
                        <h4 className="text-base font-black text-amber-200">{activeNpc.name}</h4>
                        {onUpdateNPCs && (
                          <button 
                            onClick={() => setIsEditing(true)} 
                            className="text-[#bfa15f] hover:text-amber-200 text-[8.5px] border border-[#bfa15f]/30 px-1 rounded flex items-center gap-0.5 cursor-pointer shadow active:scale-90"
                          >
                            ⚙️ 敕改
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] bg-[#8c2c16]/10 border border-[#8c2c16]/20 px-2 py-0.5 rounded text-amber-100 font-bold block mt-2 w-fit">
                        {activeNpc.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium pt-1">
                      <span>千秋载寿：<b className="text-white font-sans">{activeNpc.age}</b> 载</span>
                    </div>
                  </div>
                </div>

              {/* Specs: Favor/Loyalty Badges */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className={`p-2 rounded border flex flex-col justify-between ${getRelationBadge(activeNpc.relationVal)}`}>
                  <span className="text-[8.5px] font-bold block opacity-85">深情恩遇 (好感)</span>
                  <span className="text-xs font-bold block mt-1">{activeNpc.relationVal} / 100</span>
                </div>
                <div className={`p-2 rounded border flex flex-col justify-between ${getLoyaltyBadge(activeNpc.loyalty)}`}>
                  <span className="text-[8.5px] font-bold block opacity-85">秉乾忠贞 (忠诚)</span>
                  <span className="text-xs font-bold block mt-1">{activeNpc.loyalty} / 100</span>
                </div>
              </div>

              {/* Character Biography Section */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-amber-500/70 block tracking-wider uppercase">✦ 臣卿底册档案 biography</span>
                <p className="text-[10px] text-gray-300 leading-normal bg-neutral-950 p-2.5 rounded border border-neutral-900 text-justify">
                  {activeNpc.statusText || "这位重臣忠贞忧切朝局，恪尽厥职。在纷纭红尘劫中听候天子密旨传召。"}
                </p>
              </div>

              {/* Dynamic properties: Location, Thoughts, Impression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] leading-tight pt-1">
                <div className="bg-[#111110] border border-neutral-900 p-2 rounded">
                  <span className="text-[8.5px] text-gray-500 block">🗺️ 驻留地:</span>
                  <span className="text-gray-200 font-bold block mt-0.5">{activeNpc.location || "京城禁地科署"}</span>
                </div>
                <div className="bg-[#111110] border border-neutral-900 p-2 rounded">
                  <span className="text-[8.5px] text-gray-500 block">💭 灵识想法:</span>
                  <span className="text-gray-200 font-bold block mt-0.5">{activeNpc.currentThoughts || "参理文武，宿命护卫华夏新君"}</span>
                </div>
              </div>

              <div className="bg-[#100f0d] border border-amber-500/10 p-2 rounded text-[10px]">
                <span className="text-[8.5px] text-gray-500 block font-bold">👑 主公心志印象:</span>
                <span className="text-amber-200 block font-bold mt-0.5 text-justify">
                  {activeNpc.playerImpression || "「励精图治，实乃中兴盛世，吾当誓死效犬马之劳，护纲常万世！」"}
                </span>
              </div>

              {/* Historical Achievements */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-amber-500/70 block tracking-wider uppercase">📜 履历重臣事迹 history</span>
                <div className="space-y-1 bg-[#090908] p-2.5 border border-neutral-900 rounded max-h-[85px] overflow-y-auto">
                  {activeNpc.deeds && activeNpc.deeds.length > 0 ? (
                    activeNpc.deeds.map((de, idx) => (
                      <div key={idx} className="text-[9.5px] text-gray-300 leading-normal flex gap-1 items-start">
                        <span className="text-amber-500 font-sans select-none">•</span>
                        <span className="text-justify">{de}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[8.5px] text-gray-500 italic block text-center py-2">大卷开篇，履历尚待立功记事</span>
                  )}
                </div>
              </div>

            </div>
          )
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-xs font-serif italic text-center">
              <Users className="w-8 h-8 opacity-20 mb-2 animate-pulse" />
              <span>请在左侧谱录或图谱中点选臣子</span>
            </div>
          )}
        </div>

      </div>

      <div className="text-[8px] text-[#a09e97]/40 text-center font-serif mt-2 border-t border-neutral-900/60 pt-2 flex justify-between select-none">
        <span>中华九州 百官忠烈谱案册</span>
        <span>定鼎乾坤 承</span>
      </div>
    </div>
  );
}
