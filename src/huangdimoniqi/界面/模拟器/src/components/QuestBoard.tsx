import React from "react";
import { Quest } from "../types";
import { Scroll, Compass, Award, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

interface QuestBoardProps {
  quests: Quest[];
  onSubmitQuest?: (questId: string, status: "完美" | "标准" | "差强人意") => void;
  onAbandonQuest?: (questId: string) => void;
  onAddCustomQuest?: (title: string, desc: string) => void;
  onUpdateQuests?: (updated: Quest[]) => void;
}

export default function QuestBoard({
  quests,
  onSubmitQuest,
  onAbandonQuest,
  onAddCustomQuest,
  onUpdateQuests,
}: QuestBoardProps) {
  const [activeTab, setActiveTab] = React.useState<"uncompleted" | "completed">("uncompleted");
  const [selectedQuestId, setSelectedQuestId] = React.useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [customQuestTitle, setCustomQuestTitle] = React.useState("");
  const [customQuestDesc, setCustomQuestDesc] = React.useState("");

  // Local state for quest editing
  const [isEditingQuest, setIsEditingQuest] = React.useState<boolean>(false);
  const [localQuestTitle, setLocalQuestTitle] = React.useState<string>("");
  const [localQuestDesc, setLocalQuestDesc] = React.useState<string>("");
  const [localQuestDiff, setLocalQuestDiff] = React.useState<string>("丙等常务");
  const [localQuestRewards, setLocalQuestRewards] = React.useState<string>("");
  const [localQuestPenalties, setLocalQuestPenalties] = React.useState<string>("");
  const [localQuestStatus, setLocalQuestStatus] = React.useState<string>("");

  // Divide quests into active (uncompleted) and cleared (completed/failed/ended)
  const isCompletedFunc = (q: Quest) => {
    return q.status === "已达成" || q.status === "已失败" || q.detailedStatus === "已结束" || q.status?.includes("完美") || q.status?.includes("标准") || q.status?.includes("偏离") || q.status?.includes("差强人意");
  };

  const filteredQuests = quests.filter((q) => {
    const done = isCompletedFunc(q);
    return activeTab === "completed" ? done : !done;
  });

  const activeQuest = quests.find(q => q.id === selectedQuestId) || filteredQuests[0];

  React.useEffect(() => {
    if (activeQuest) {
      setLocalQuestTitle(activeQuest.title);
      setLocalQuestDesc(activeQuest.description);
      setLocalQuestDiff(activeQuest.difficulty || "丙等常务");
      setLocalQuestRewards(activeQuest.reward || "增加文治、威望等国力资源");
      setLocalQuestPenalties(activeQuest.failurePenalty || "气血与威望扣减，政权动荡风险上升");
      setLocalQuestStatus(activeQuest.status);
    }
  }, [activeQuest, isEditingQuest]);

  // Ensure starting selectedQuestId is set when tab changes
  React.useEffect(() => {
    if (filteredQuests.length > 0) {
      if (!selectedQuestId || !filteredQuests.some(q => q.id === selectedQuestId)) {
        setSelectedQuestId(filteredQuests[0].id);
      }
    } else {
      setSelectedQuestId(null);
    }
  }, [activeTab, quests]);

  const getDifficultyText = (q: Quest) => {
    return q.difficulty || "常规 (标准)";
  };

  const getStatusLabelText = (statusStr: string | undefined) => {
    const s = statusStr || "进行中";
    if (s.includes("完美") || s.includes("达成") || s.includes("标准") || s.includes("差强人意")) {
      return { text: s, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
    if (s.includes("失败") || s.includes("放弃")) {
      return { text: s, style: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }
    return { text: "天令进行中", style: "bg-amber-500/10 text-amber-450 border-amber-500/20 text-amber-400" };
  };

  const handleManualSubmission = (level: "完美" | "标准" | "差强人意") => {
    if (!activeQuest) return;
    if (onSubmitQuest) {
      onSubmitQuest(activeQuest.id, level);
    }
    setShowSubmitModal(false);
  };

  const handleAbandonment = () => {
    if (!activeQuest) return;
    const confirmAb = window.confirm(`卿家当真要割斩该天命诏令【${activeQuest.title}】并甘受失职惩罚吗？此举将被视为未遂失败。`);
    if (confirmAb && onAbandonQuest) {
      onAbandonQuest(activeQuest.id);
    }
  };

  return (
    <div id="new-quest-board-panel" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#bfa15f]/5 to-transparent pointer-events-none rounded-bl-full" />
      
      {/* Structural layout (Title has been simplified as requested) */}
      <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-2.5 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#bfa15f]/10 border border-[#bfa15f]/25">
            <Scroll className="w-4 h-4 text-amber-200" />
          </div>
          <h2 className="font-serif text-sm font-black text-[#fcfbfa]">天道使命之极</h2>
        </div>
        <span className="font-mono text-[9px] text-[#bfa15f]/85">诏令典藏册</span>
      </div>

      {/* Tabs Row for left list */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setActiveTab("uncompleted")}
          className={`flex-1 py-1 rounded text-xs font-serif font-black tracking-wider transition-all border text-center cursor-pointer ${
            activeTab === "uncompleted"
              ? "bg-[#bfa15f]/20 text-[#e6c787] border-[#bfa15f]"
              : "bg-black/40 text-[#a09e97] border-[#bfa15f]/10 hover:border-[#bfa15f]/20 hover:text-white"
          }`}
        >
          未完成 ({quests.filter(q => !isCompletedFunc(q)).length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-1 rounded text-xs font-serif font-black tracking-wider transition-all border text-center cursor-pointer ${
            activeTab === "completed"
              ? "bg-[#bfa15f]/20 text-[#e6c787] border-[#bfa15f]"
              : "bg-black/40 text-[#a09e97] border-[#bfa15f]/10 hover:border-[#bfa15f]/20 hover:text-white"
          }`}
        >
          已完成 ({quests.filter(q => isCompletedFunc(q)).length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 relative overflow-visible">
        
        {/* Left Side: Quest List Sidebar */}
        <div className="md:col-span-5 space-y-1.5 max-h-[330px] overflow-y-auto pr-1">
          <span className="text-[8.5px] text-[#e6c787] block font-serif uppercase tracking-wider pb-1 border-b border-[#bfa15f]/10">
            📌 天书敕命总览
          </span>
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-900 rounded bg-black/20">
              <Compass className="w-6 h-6 text-slate-800 mx-auto mb-1 animate-pulse" />
              <p className="text-[10px] text-gray-500 font-serif italic">暂无该分类的命途敕诏</p>
            </div>
          ) : (
            filteredQuests.map((q) => {
              const isSelected = q.id === selectedQuestId;
              const statusObj = getStatusLabelText(q.status);
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestId(q.id)}
                  className={`w-full text-left p-2.5 rounded-lg border flex flex-col gap-1 transition cursor-pointer relative ${
                    isSelected
                      ? "bg-[#8c2c16]/20 border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.1)]"
                      : "bg-black/40 border-[#bfa15f]/10 hover:border-neutral-700 hover:bg-neutral-900/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-1 rounded-[2px] border-[0.5px] text-[7.5px] leading-tight ${statusObj.style}`}>
                      {statusObj.text}
                    </span>
                    <span className="text-[8px] text-gray-500 font-mono scale-90">{q.type || "天诏"}</span>
                  </div>
                  <h3 className="font-serif font-black text-[11px] text-[#e6c787] truncate pr-4 mt-0.5">
                    {q.title}
                  </h3>
                </button>
              );
            })
          )}
        </div>

        {/* Right Side: Quest details displays (Includes Title, Info, Objectives, Status, Difficulty, Progress, Rewards, and Penalties) */}
        <div className="md:col-span-7 bg-[#0e0e0d] border border-[#bfa15f]/15 rounded-xl p-4 flex flex-col justify-between max-h-[330px] overflow-y-auto">
          {activeQuest ? (
            isEditingQuest ? (
              <div className="space-y-2.5 font-serif text-[10px] flex flex-col justify-between h-full animate-fade-in">
                <h4 className="text-[10px] font-black text-amber-300 border-b border-amber-500/10 pb-1 flex justify-between items-center">
                  <span>⚙️ 敕改天书命途敕令</span>
                  <button onClick={() => setIsEditingQuest(false)} className="text-gray-500 text-[8px] hover:text-white">✕</button>
                </h4>

                <div>
                  <label className="text-[8px] text-gray-400 block font-bold">敕命诏安标题：</label>
                  <input 
                    type="text" 
                    value={localQuestTitle} 
                    onChange={e => setLocalQuestTitle(e.target.value)} 
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-0.5 text-[9.5px] text-white outline-none font-serif" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">天旨难度类别：</label>
                    <input 
                      type="text" 
                      value={localQuestDiff} 
                      onChange={e => setLocalQuestDiff(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9.5px] text-white outline-none font-serif" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 block font-bold">当前敕命状态：</label>
                    <select
                      value={localQuestStatus}
                      onChange={e => setLocalQuestStatus(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded text-[9px] text-amber-300 outline-none cursor-pointer p-0.5 font-serif"
                    >
                      <option value="进行中">进行中</option>
                      <option value="已达成">已达成</option>
                      <option value="已失败">已失败</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[8px] text-gray-400 block font-bold">大任详情谕示：</label>
                  <textarea 
                    rows={2.5} 
                    value={localQuestDesc} 
                    onChange={e => setLocalQuestDesc(e.target.value)} 
                    className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-1 text-[9.5px] text-gray-300 outline-none resize-none leading-tight font-serif" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-[#4ade80] block font-bold">完美大赏奖励：</label>
                    <input 
                      type="text" 
                      value={localQuestRewards} 
                      onChange={e => setLocalQuestRewards(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none font-serif" 
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-[#f87171] block font-bold font-serif">天惩失职败损：</label>
                    <input 
                      type="text" 
                      value={localQuestPenalties} 
                      onChange={e => setLocalQuestPenalties(e.target.value)} 
                      className="w-full bg-[#121210] border border-[#bfa15f]/25 rounded p-0.5 text-[9px] text-white outline-none font-serif" 
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neutral-900 justify-end shrink-0">
                  <button 
                    onClick={() => {
                      if (!localQuestTitle.trim()) {
                        alert("敕诏标题不得不空！");
                        return;
                      }
                      if (onUpdateQuests) {
                        const updatedList: Quest[] = quests.map(q => q.id === activeQuest.id ? {
                          ...q,
                          title: localQuestTitle,
                          description: localQuestDesc,
                          difficulty: localQuestDiff,
                          status: localQuestStatus as Quest["status"],
                          reward: localQuestRewards,
                          failurePenalty: localQuestPenalties
                        } : q);
                        onUpdateQuests(updatedList);
                        setIsEditingQuest(false);
                        alert(`🔮 【敕封太乙】：帝言九鼎！你关于【${localQuestTitle}】的敕文底稿改写生效。`);
                      }
                    }} 
                    className="bg-emerald-800 hover:bg-emerald-700 text-white text-[9px] font-black px-2.5 py-1 rounded cursor-pointer transition shadow active:scale-95 p-0.5"
                  >
                    💾 谕旨改写
                  </button>
                  <button 
                    onClick={() => setIsEditingQuest(false)} 
                    className="bg-stone-900 border border-[#bfa15f]/15 text-stone-400 text-[9px] px-2.5 py-1 rounded cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 font-serif flex flex-col justify-between h-full">
                
                <div>
                  {/* Meta details Header row */}
                  <div className="border-b border-neutral-900 pb-2 flex justify-between items-start gap-2 relative">
                    {onUpdateQuests && (
                      <button 
                        onClick={() => setIsEditingQuest(true)} 
                        className="absolute top-0 right-16 text-[#bfa15f] hover:text-amber-200 text-[8px] border border-[#bfa15f]/25 px-1 rounded cursor-pointer shadow p-0.5 select-none shrink-0"
                        title="敕改此项天命任务"
                      >
                        ⚙️ 敕改
                      </button>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-amber-200">👑 【{activeQuest.title}】</h3>
                      <div className="flex gap-2 text-[9px] text-[#a09e97] mt-1 leading-none">
                        <span>难度等级: <b className="text-amber-400 font-sans">{getDifficultyText(activeQuest)}</b></span>
                        <span>•</span>
                        <span>任务等级: <b>{activeQuest.type || "主线政要"}</b></span>
                      </div>
                    </div>

                  <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase font-bold select-none ${getStatusLabelText(activeQuest.status).style}`}>
                    {getStatusLabelText(activeQuest.status).text}
                  </span>
                </div>

                {/* Subsections of files */}
                <div className="space-y-2.5 mt-3">
                  <div>
                    <span className="text-[8.5px] text-gray-550 font-bold block uppercase tracking-wide">✦ 敕卷大任谕示</span>
                    <p className="text-[10px] text-gray-250 leading-relaxed bg-[#141413] p-2 rounded-lg border border-neutral-900 text-justify">
                      {activeQuest.description}
                    </p>
                  </div>

                  {/* Progressive Objectives & Outcomes */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
                    <div className="bg-[#121211] border border-neutral-900 p-2 rounded-lg">
                      <span className="text-gray-500 text-[8px] block">🔍 命诏当前进展:</span>
                      <span className="text-amber-100 font-black block mt-1">{activeQuest.progress || "于红尘推演大势中自然逐步结印"}</span>
                    </div>
                    <div className="bg-[#121211] border border-neutral-900 p-2 rounded-lg">
                      <span className="text-gray-500 text-[8px] block">🏆 达成成效大赏:</span>
                      <span className="text-emerald-450 font-black text-emerald-300 block mt-1">{activeQuest.reward || "国运、兵饷增加，气血复原"}</span>
                    </div>
                  </div>

                  <div className="bg-[#111] p-2 border border-neutral-900 rounded-lg text-[9.5px]">
                    <span className="text-rose-450 text-rose-400/70 text-[8px] block uppercase">⚠️ 失败失职天规惩戒:</span>
                    <span className="text-gray-400 block mt-0.5">{activeQuest.failurePenalty || "国家防线崩坏，朝野流言骤起，威望扣减。"}</span>
                  </div>
                </div>
              </div>

              {/* Submit / Abandon controls row at the very bottom as requested */}
              {!isCompletedFunc(activeQuest) && (
                <div className="pt-2 border-t border-neutral-900/60 flex gap-2 font-bold select-none">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex-1 py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-[#fcfbfa] text-[10px] font-black rounded text-center cursor-pointer transition shadow active:scale-95 flex items-center justify-center gap-1"
                  >
                    🚀 下诏手动结算
                  </button>

                  <button
                    onClick={handleAbandonment}
                    className="flex-1 py-1.5 bg-black hover:bg-neutral-900 border border-neutral-850 text-rose-400 text-[10px] font-black rounded text-center cursor-pointer transition active:scale-95"
                  >
                    🗑️ 割舍放弃此诏
                  </button>
                </div>
              )}

            </div>
          )
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-[10px] italic py-12">
              <Scroll className="w-6 h-6 text-neutral-800 mb-1 animate-pulse" />
              <p>请点选左侧天道敕令查看具体诏令条目</p>
            </div>
          )}
        </div>

      </div>

      {/* Manual Settle completion degree selection popup */}
      {showSubmitModal && activeQuest && (
        <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center p-6 z-40 border border-amber-500/30 rounded-xl">
          <div className="bg-[#121210] border border-[#bfa15f]/40 p-4.5 rounded-xl max-w-sm w-full space-y-3.5 shadow-2x font-serif">
            <h3 className="text-xs font-black text-amber-200 border-b border-[#bfa15f]/15 pb-1 text-center flex items-center justify-center gap-1">
              🚀 天圣评定手动提交 (结算大计)
            </h3>
            
            <p className="text-[10px] text-gray-400 leading-normal text-justify">
              本手动评议将强制交由朝堂礼部太监与大理寺进行实事清核（AI将在下轮回复中自动进行相应的属性和功业折算）。<b>请选择您的自我阅历评议：</b>
            </p>

            <div className="space-y-1.5">
              <button
                onClick={() => handleManualSubmission("完美")}
                className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/30 rounded text-[10px] font-black cursor-pointer text-center"
              >
                ✨ 功不唐捐 · 完美达成
              </button>
              <button
                onClick={() => handleManualSubmission("标准")}
                className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 rounded text-[10px] font-black cursor-pointer text-center"
              >
                📜 循规蹈矩 · 标准完成
              </button>
              <button
                onClick={() => handleManualSubmission("差强人意")}
                className="w-full py-1.5 bg-zinc-900 hover:bg-neutral-800 border border-neutral-700 text-gray-300 rounded text-[10px] font-black cursor-pointer text-center"
              >
                ⛈️ 勉为其难 · 差强人意
              </button>
            </div>

            <button
              onClick={() => setShowSubmitModal(false)}
              className="w-full py-1 bg-black text-gray-600 rounded text-[9.5px] cursor-pointer text-center border border-neutral-900"
            >
              自认不足，返回继续锤炼
            </button>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="text-[8px] text-[#a09e97]/40 text-center font-serif mt-3 border-t border-neutral-900/60 pt-2 flex justify-between select-none">
        <span>天网恢恢 纲举目张 结缘宿命</span>
        <span>圣运长生 临天听 承</span>
      </div>
    </div>
  );
}
