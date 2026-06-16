import React from "react";
import { HistoryTurn } from "../types";
import { BookOpen, Edit3, Save, X, Layers, CalendarRange, Star, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import HistoryReader from "./HistoryReader";

interface HistoryPanelProps {
  history: HistoryTurn[];
  onUpdateHistoryText: (index: number, newText: string) => void;
  summaryX: number;
  summaryY: number;
  chronicles: { turn: number; year: number; eventText: string }[];
  onUpdateHistory: (updated: HistoryTurn[]) => void;
}

export default function HistoryPanel({
  history,
  onUpdateHistoryText,
  summaryX,
  summaryY,
  chronicles,
  onUpdateHistory
}: HistoryPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"messages" | "summary">("messages");

  // Filter assistant responses
  const baseAssistantTurns = history
    .map((turn, index) => ({ turn, index }))
    .filter((item) => item.turn.role === "assistant");

  // Generate mock small/large periodic summaries based on chronicles and current turn length for added immersion
  const totalTurns = baseAssistantTurns.length;
  const smallSummaryCount = Math.floor(totalTurns / summaryX);
  const largeSummaryCount = Math.floor(totalTurns / summaryY);

  return (
    <div className="space-y-4 font-serif text-xs">
      
      {/* TABS SELECTOR */}
      <div className="flex border-b border-[#bfa15f]/25 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("messages");
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 border-b-2 font-bold cursor-pointer transition text-[11px] ${
            activeTab === "messages"
              ? "border-amber-400 text-amber-200"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          📜 历史消息与精品史卷 (Dialogue Floors)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-1.5 px-4 py-1.5 border-b-2 font-bold cursor-pointer transition text-[11px] ${
            activeTab === "summary"
              ? "border-amber-400 text-amber-200"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          📖 查看国运总结 (Periodic Summaries)
        </button>
      </div>

      {activeTab === "messages" ? (
        <HistoryReader history={history} onUpdateHistory={onUpdateHistory} />
      ) : (
        /* SUMMARY PERSPECTIVE VIEW */
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-left scrollbar-thin scrollbar-thumb-amber-950/20">
          <div className="p-3 bg-[#1e140d]/30 border border-amber-950/40 rounded-xl space-y-2">
            <span className="text-amber-300 font-bold font-serif text-[11px] block">
              📊 历朝时序总结检录
            </span>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              根据您的秘旨大典配置：当前系统设为每 <b className="text-amber-200">{summaryX} 层</b> 进行一次朝政起居小结，
              每 <b className="text-amber-200">{summaryY} 层</b> 进行一次国运社稷大总结。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Left Box: Small summaries */}
            <div className="bg-black/40 border border-neutral-900 rounded-xl p-3 space-y-3">
              <span className="font-extrabold text-[#bfa15f] border-b border-neutral-900 pb-1 flex justify-between items-center bg-black/10">
                <span>🏮 国政起居小结 ({smallSummaryCount} 回)</span>
                <span className="text-[9px] font-mono text-gray-500">每 {summaryX} 楼</span>
              </span>

              {smallSummaryCount === 0 ? (
                <p className="text-[10px] text-gray-600 py-6 text-center">
                  历史天机回复目前尚未达到第 {summaryX} 层，暂无自动起居小总结。
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {Array.from({ length: smallSummaryCount }).map((_, idx) => {
                    const floorNum = (idx + 1) * summaryX;
                    return (
                      <div key={idx} className="p-2 border border-amber-950/25 bg-[#8c2c16]/5 rounded text-[10px] space-y-1">
                        <div className="flex justify-between text-amber-200/90 font-bold border-b border-amber-950/10 pb-0.5">
                          <span>第 {idx + 1} 卷 · 执笔御批小结</span>
                          <span>楼层：{floorNum} 楼层碑位</span>
                        </div>
                        <p className="text-gray-400 text-[9px] leading-relaxed">
                          皇帝批谕第 {floorNum} 轮朝纲已定。期间国库、民心与常备宿军经受跌宕洗礼，内阁太师协助处理边疆，使江山永固定轴。
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Box: Big Summaries */}
            <div className="bg-black/40 border border-neutral-900 rounded-xl p-3 space-y-3">
              <span className="font-extrabold text-amber-400 border-b border-neutral-900 pb-1 flex justify-between items-center bg-black/10">
                <span>🏯 国计通鉴大总结 ({largeSummaryCount} 折)</span>
                <span className="text-[9px] font-mono text-gray-500">每 {summaryY} 楼</span>
              </span>

              {largeSummaryCount === 0 ? (
                <p className="text-[10px] text-gray-600 py-6 text-center">
                  历史大天机响应尚未满 {summaryY} 期，无法汇总社稷通鉴大论。
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {Array.from({ length: largeSummaryCount }).map((_, idx) => {
                    const floorNum = (idx + 1) * summaryY;
                    return (
                      <div key={idx} className="p-2 border border-amber-500/10 bg-amber-900/5 rounded text-[10px] space-y-1">
                        <div className="flex justify-between text-yellow-300 font-bold border-b border-amber-500/10 pb-0.5">
                          <span>第 {idx + 1} 折 · 万古社稷通鉴大典</span>
                          <span>楼层：{floorNum} 绝天柱</span>
                        </div>
                        <p className="text-yellow-100/80 text-[9px] leading-relaxed italic">
                          帝皇政绩巍峨，每历 {summaryY} 期天命推演，千古史官大笔落成：“至治之世，君贤臣直，四夷宾服，府库金银满溢。”此大总结永载华夏光环。
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chronicles reference inline list at bottom */}
          <div className="p-2.5 border border-neutral-900 bg-neutral-950 rounded-xl">
            <span className="text-gray-400 text-[9.5px] font-bold block pb-1 border-b border-neutral-900 mb-1.5 uppercase tracking-wide">
              📜 编年名录大事年记
            </span>
            <div className="space-y-1">
              {chronicles.slice(0, 3).map((log, lIter) => (
                <div key={lIter} className="text-[9px] text-gray-500 flex gap-2">
                  <span className="text-amber-400 font-bold shrink-0">Turn {log.turn}:</span>
                  <span className="truncate">{log.eventText}</span>
                </div>
              ))}
              {chronicles.length > 3 && (
                <span className="text-[8.5px] text-amber-500/60 block pt-1">
                  ※ 还有 {chronicles.length - 3} 项重大编年史志事，可打开「世」字圆形神台镜审阅详细。
                </span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
