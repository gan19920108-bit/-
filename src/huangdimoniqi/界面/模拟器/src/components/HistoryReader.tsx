import React from "react";
import { HistoryTurn } from "../types";
import { 
  BookOpen, Star, Menu, Edit, Trash2, X, ChevronLeft, ChevronRight, Check, Sparkles, Pin
} from "lucide-react";

interface HistoryReaderProps {
  history: HistoryTurn[];
  onUpdateHistory: (updated: HistoryTurn[]) => void;
  onClose?: () => void;
}

export default function HistoryReader({ history, onUpdateHistory, onClose }: HistoryReaderProps) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState<boolean>(false);
  const [favorites, setFavorites] = React.useState<number[]>([]); // favorited turn indices
  const [showEditSubMenu, setShowEditSubMenu] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editText, setEditText] = React.useState<string>("");

  // Sync edit text when current index moves
  React.useEffect(() => {
    if (history[currentIndex]) {
      setEditText(history[currentIndex].text || "");
    }
    setIsEditing(false);
    setShowEditSubMenu(false);
  }, [currentIndex, history]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleFavorite = () => {
    if (favorites.includes(currentIndex)) {
      setFavorites(favorites.filter(idx => idx !== currentIndex));
    } else {
      setFavorites([...favorites, currentIndex]);
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      alert("内容不能修之为空。");
      return;
    }
    const updated = [...history];
    updated[currentIndex] = {
      ...updated[currentIndex],
      text: editText
    };
    onUpdateHistory(updated);
    setIsEditing(false);
    setShowEditSubMenu(false);
    alert(`【起居密编】：第 ${currentIndex + 1} 楼记录已纂改落成！`);
  };

  const handleDeleteFloor = () => {
    if (history.length === 0) return;
    if (confirm(`⚠️ 圣上息怒：确定彻底抹去并焚毁「第 ${currentIndex + 1} 楼」的起居注记录吗？此举不可逆！`)) {
      const updated = history.filter((_, idx) => idx !== currentIndex);
      onUpdateHistory(updated);
      setShowEditSubMenu(false);
      // Adjust currentIndex down if we deleted the last item
      if (currentIndex >= updated.length && updated.length > 0) {
        setCurrentIndex(updated.length - 1);
      } else if (updated.length === 0) {
        setCurrentIndex(0);
      }
      alert(`【焚册削除】：已被圣旨敕谕从帝皇起居注中消去。`);
    }
  };

  // Helper to extract preview summary for directory items
  const getTurnSummary = (turn: HistoryTurn, idx: number) => {
    const raw = turn.text || "";
    // Clean some markdown or headers inside the text
    const clean = raw.replace(/#+\s+.*|[*_`~]|\[.*?\]|\(.*?\)/g, "").trim();
    const preview = clean.length > 25 ? clean.slice(0, 25) + "..." : clean;
    const roleText = turn.role === "user" ? "皇帝旨意" : "天机奏答";
    return `［第 ${idx + 1} 楼］ ${roleText} | ${preview || "空册"}`;
  };

  return (
    <div id="history-reader-root" className={onClose ? "bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-4 shadow-2xl relative overflow-hidden h-[480px] md:h-[520px] flex flex-col justify-between font-serif select-none text-stone-100" : "bg-transparent border-0 p-0 relative overflow-hidden min-h-[380px] flex flex-col justify-between font-serif select-none text-stone-100"}>
      {/* Background traditional imperial design pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[size:40px_40px] bg-[radial-gradient(#bfa15f_1.5px,transparent_1.5px)]" />

      {/**********************************************************
       * HEADER BAR: Directory, Favorite, Floor Index, Edit, Close
       **********************************************************/}
      <div className="flex justify-between items-center border-b border-[#bfa15f]/25 pb-2 mb-3.5 z-30 bg-[#121210] relative select-none">
        
        {/* Left Side: Directory/Catalog Button (目录) */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`px-3 py-1 bg-black border hover:border-amber-400 text-amber-200 hover:text-white rounded text-[9px] font-black cursor-pointer transition flex items-center gap-1 active:scale-95 ${
            isSidebarOpen ? "border-amber-400 bg-neutral-900" : "border-[#bfa15f]/30"
          }`}
          title="呼出历史楼层目录"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>目录</span>
        </button>

        {/* Left-Middle: Favorite/Star Button (收藏) */}
        <button
          type="button"
          onClick={toggleFavorite}
          className={`px-3 py-1 bg-black border rounded text-[9px] font-black cursor-pointer transition flex items-center gap-1 active:scale-95 ${
            favorites.includes(currentIndex)
              ? "border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.2)]"
              : "border-[#bfa15f]/30 text-stone-400 hover:text-amber-200 hover:border-amber-400"
          }`}
          title={favorites.includes(currentIndex) ? "取消收藏" : "标记该楼层为收藏"}
        >
          <Star className={`w-3.5 h-3.5 ${favorites.includes(currentIndex) ? "fill-amber-400 text-amber-300" : ""}`} />
          <span>{favorites.includes(currentIndex) ? "已收录" : "收藏"}</span>
        </button>

        {/* CENTER POSITION: Floor Numbers (楼层数) */}
        <div className="absolute left-1/2 -translate-x-1/2 text-[10.5px] font-black tracking-widest text-center text-[#e6c787] bg-neutral-950 px-3 py-1 border border-[#bfa15f]/20 rounded-full font-serif flex items-center gap-1 leading-none">
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>第 {history.length > 0 ? currentIndex + 1 : 0} 楼 / 共 {history.length} 楼</span>
        </div>

        {/* Right Side Part: Edit Trigger (编辑按钮) -> revealing sub-menu underneath */}
        <div className="relative flex items-center gap-1.5 font-sans z-40">
          <button
            type="button"
            onClick={() => {
              if (history.length === 0) return;
              setShowEditSubMenu(!showEditSubMenu);
            }}
            disabled={history.length === 0}
            className={`px-3 py-1 bg-black border rounded text-[9px] font-black cursor-pointer transition flex items-center gap-1 active:scale-95 ${
              showEditSubMenu ? "border-amber-400 text-amber-200" : "border-[#bfa15f]/30 text-stone-400 hover:border-amber-400 hover:text-white"
            }`}
            title="起居注编纂与删除录"
          >
            <Edit className="w-3.2 h-3.2 text-amber-300" />
            <span>编纂</span>
            <span className="text-[7.5px] opacity-75">{showEditSubMenu ? "▲" : "▼"}</span>
          </button>

          {/* RIGHTMOST: Close Button (关闭按钮) */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-5.5 h-5.5 rounded-full bg-[#8c2c16]/30 hover:bg-[#8c2c16] border border-[#bfa15f]/40 text-[#dacfc5] hover:text-white flex items-center justify-center text-[9px] font-bold transition cursor-pointer active:scale-90"
              title="关闭起居纪视窗"
            >
              ✕
            </button>
          )}

          {/* Edit sub-menu absolute position underneath the button */}
          {showEditSubMenu && (
            <div className="absolute right-0 top-[26px] bg-[#1a1917] border border-[#bfa15f]/50 rounded-lg shadow-2xl p-1.5 space-y-1.5 w-[140px] z-50 animate-fade-in font-serif">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setShowEditSubMenu(false);
                }}
                className="w-full text-left px-2.5 py-1 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 text-[10px] text-amber-100/90 hover:text-white rounded flex items-center gap-1.5 cursor-pointer"
              >
                📝 修改此楼文字
              </button>
              <button
                type="button"
                onClick={handleDeleteFloor}
                className="w-full text-left px-2.5 py-1 hover:bg-red-950/40 text-red-300/95 hover:text-red-200 rounded flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-red-900/40"
              >
                🗑️ 彻底削改此楼
              </button>
            </div>
          )}
        </div>
      </div>

      {/**********************************************************
       * CENTRAL SPLIT AREA: Left Directory drawer, Right-Hand content page
       **********************************************************/}
      <div className="flex-1 relative flex gap-3.5 items-stretch min-h-[300px] overflow-hidden z-10">

        {/* 1. Directory Sidebar Drawer (目录的作用是从界面的左侧呼出历史楼层的目录，方便玩家快速锁定楼层) */}
        {isSidebarOpen && (
          <div className="w-[180px] md:w-[220px] bg-black/90 border border-[#bfa15f]/25 rounded-lg flex flex-col justify-between p-2 shrink-0 animate-fade-in h-full z-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1.5 text-[9px] font-black text-amber-300 tracking-wider">
              <span>📖 古起居注九宫目录</span>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin scrollbar-thumb-amber-950">
              {history.length > 0 ? (
                history.map((turn, idx) => {
                  const isFav = favorites.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left p-1.5 rounded transition text-[9px] font-sans flex justify-between items-center gap-1.5 ${
                        idx === currentIndex
                          ? "bg-[#8c2c16]/30 border border-rose-900 font-black text-amber-200"
                          : "bg-neutral-950/40 border border-neutral-900 hover:bg-neutral-900 text-stone-300 hover:text-white"
                      }`}
                    >
                      <span className="truncate pr-1">{getTurnSummary(turn, idx)}</span>
                      {isFav && <span className="text-amber-400 select-none">★</span>}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500 italic text-[9px]">
                  九天起居尚无墨迹，待起章听政。
                </div>
              )}
            </div>
            <div className="text-[7.5px] text-gray-500 border-t border-neutral-950 pt-1 text-center font-mono uppercase">
              共设收藏点: {favorites.length}
            </div>
          </div>
        )}

        {/* 2. Main Floor Display Page & Scrolling parchment */}
        <div className="flex-1 bg-black/50 border border-neutral-955 rounded-xl p-3.5 flex flex-col justify-between overflow-y-auto select-text relative h-full">
          
          <div className="flex-1 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-[11px] space-y-1">
                <p>📖 暂无华夏理政日志</p>
                <p className="text-[9.5px]">请圣上先在主堂下达自主或快速起居政权决策。</p>
              </div>
            ) : isEditing ? (
              /* Inline edits box */
              <div className="space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] text-amber-300 font-extrabold block">📝 正在修订 第 {currentIndex + 1} 楼记录文本：</span>
                  <textarea
                    rows={8}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded-lg p-2.5 text-[11px] text-stone-200 outline-none resize-none font-sans leading-relaxed flex-1"
                    placeholder="编辑此楼起居细节..."
                  />
                </div>
                <div className="flex gap-2 text-[9.5px] font-bold">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex-1 py-1 px-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-black border border-emerald-600 cursor-pointer text-center"
                  >
                    💾 保存御批修改
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditText(history[currentIndex].text || "");
                      setIsEditing(false);
                    }}
                    className="px-3.5 py-1 bg-stone-900 text-gray-400 hover:text-white rounded border border-stone-850 cursor-pointer"
                  >
                    关闭
                  </button>
                </div>
              </div>
            ) : (
              /* Normal readable parchment page */
              <div className="space-y-3 select-text">
                <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-1">
                  <span className="text-[9px] text-[#e6c787] font-black tracking-widest flex items-center gap-1 bg-[#8c2c16]/10 px-1 border border-[#8c2c16]/30 rounded">
                    {history[currentIndex].role === "user" ? "👑 皇帝御笔亲降手敕" : "✨ 天机示卦批复记说"}
                  </span>
                  {favorites.includes(currentIndex) && (
                    <span className="text-[8.5px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 rounded flex items-center gap-0.5 leading-none font-black animate-pulse">
                      ★ 帝苑收录
                    </span>
                  )}
                </div>

                <div className="p-2 sm:p-3 bg-neutral-950/20 rounded-xl leading-7 text-[11px] sm:text-[11.5px] text-justify font-serif text-stone-200 select-text font-serif leading-7 selection:bg-amber-800 selection:text-white">
                  {history[currentIndex].text.replace(/【手敕密谕】:\s*|「御批决策\s*\d+」:\s*/g, "")}
                </div>
              </div>
            )}
          </div>

          {/* Page bottom control pointers */}
          {!isEditing && history.length > 1 && (
            <div className="border-t border-dashed border-neutral-900/60 pt-2 flex justify-between items-center text-[9px] text-gray-500 font-mono select-none">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex items-center gap-0.5 hover:text-white transition cursor-pointer ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>前一章 (前一楼)</span>
              </button>

              <span className="text-[8.5px] text-[#bfa15f]/40 uppercase tracking-widest leading-none">中国宣纸御印装订</span>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === history.length - 1}
                className={`flex items-center gap-0.5 hover:text-white transition cursor-pointer ${currentIndex === history.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <span>下一章 (下一楼)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

      <div className="text-[7.5px] text-[#a09e97]/30 text-center font-sans mt-3.5 border-t border-neutral-900/50 pt-1.5 block select-none uppercase tracking-wide">
        大梁起居府九重龙光 宣徽殿大鉴
      </div>
    </div>
  );
}
