import React from "react";
import { GameNPC, HistoryTurn } from "../types";
import { Calendar, Clock, MapPin, User, Tag, ChevronLeft, ChevronRight, Eye, Grid, List, Lock, LockOpen } from "lucide-react";

interface CalendarPanelProps {
  currentCalendarDate: string;
  npcs: GameNPC[];
  dynastyName: string;
  dialogueHistory?: HistoryTurn[]; // Pass narrative logs to verify unlocked agreements
  appointments?: any[]; // Passed from App state to be fully editable
  setAppointments?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function CalendarPanel({ 
  currentCalendarDate, 
  npcs, 
  dynastyName, 
  dialogueHistory = [], 
  appointments: propsAppointments,
  setAppointments 
}: CalendarPanelProps) {
  
  // Traditional 12 lunar months
  const MONTHS = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "腊月"];

  // Traditional holidays list mapped to month/days
  const FESTIVALS: Record<string, string> = {
    "正月-初一": "元旦佳节 (万象更始)",
    "正月-十五": "元宵灯会 (上元佳宴)",
    "三月-初三": "上巳祓禊 (修禊临水)",
    "五月-初五": "端阳重五 (角黍悬艾)",
    "七月-初七": "七夕乞巧 (乞福双星)",
    "七月-十五": "中元祭祖 (幽都放灯)",
    "八月-十五": "中秋赏月 (金风桂魄)",
    "九月-初九": "重阳登高 (插莱避祸)",
    "腊月-初八": "腊八粥会 (五谷成香)",
    "腊月-三十": "除夕守岁 (一岁岁暮)"
  };

  const [localFestivals, setLocalFestivals] = React.useState<Record<string, string>>(() => FESTIVALS);

  // Appt Creator Forms Local States
  const [showAddForm, setShowAddForm] = React.useState<boolean>(false);
  const [newTitle, setNewTitle] = React.useState<string>("");
  const [newNpc, setNewNpc] = React.useState<string>("");
  const [newLocName, setNewLocName] = React.useState<string>("");
  const [newDesc, setNewDesc] = React.useState<string>("");

  const [editingFest, setEditingFest] = React.useState<boolean>(false);
  const [festText, setFestText] = React.useState<string>("");

  // Base list of historical plot appointments/agreements if props not available
  const defaultAppointments = [
    {
      id: "appt-1",
      month: "八月",
      day: "十五",
      npcName: npcs[2]?.name || "后宫贵妃",
      location: "蓬莱池·太液仙蓬太极殿后苑",
      holidayName: "中秋赏月佳节",
      title: "携手伴登台赏桂月明，御苑共修恩义",
      description: "值此满月良宵，主公将密会爱妃，在太液池畔登高赏桂。双方设樽抚琴，畅叙儿女情长，更能密议整饬六宫与削抑外戚之计。",
    },
    {
      id: "appt-2",
      month: "九月",
      day: "初九",
      npcName: npcs[0]?.name || "朝政辅佐大臣",
      location: "京兆曲江亭台或终南山巅",
      holidayName: "重阳插茱萸登高",
      title: "曲江会诤臣，广纳百官变法策对",
      description: "在京兆府插茱萸登高，亲切召见当朝直臣。爱臣将借登高之机进献中兴吏治等治国重策，促膝长谈研治国策大略及政律。",
    },
    {
      id: "appt-3",
      month: "腊月",
      day: "三十",
      npcName: npcs[1]?.name || "戍疆大元帅",
      location: "西北九边防守要塞卫所",
      holidayName: "大岁除夕守岁",
      title: "九边三军夜宴，慰劳十万戍守将士",
      description: "除夕跨年夜，圣上御驾微服亲临西北边塞防线前沿，御赐温酒佳膳，安抚苦寒守疆将士，谨防外敌大雪夜发兵突袭。",
    },
    {
      id: "appt-4",
      month: "三月",
      day: "初三",
      npcName: "太清上人 (方外道长)",
      location: "神州仙山之楼观台灵溪瀑",
      holidayName: "上巳浴佛祓禊",
      title: "仙溪祓禊修真，参悟大周天命之术",
      description: "在上巳祓禊日，与隐世道长在灵溪瀑旁洗烦祓除。修心养性，共同探讨命理格局变幻与太极数术之精微，参透帝皇心志机运。",
    }
  ];

  const appointments = propsAppointments || defaultAppointments;

  // Helper parser for lunar date string
  const parseFullDate = (dateStr: string) => {
    const matchYear = dateStr.match(/公元(\d+)年/);
    const yearNum = matchYear ? parseInt(matchYear[1]) : 712;

    let month = "七月";
    for (const m of MONTHS) {
      if (dateStr.includes(m)) {
        month = m;
        break;
      }
    }

    const dayWords = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", 
                      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                      "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
    let day = "十日";
    for (const d of dayWords) {
      if (dateStr.includes(d)) {
        day = d;
        break;
      }
    }
    if (day === "十日") {
      const match = dateStr.match(/([初廿十][一二三四五六七八九十]|二十|三十)日/);
      if (match) {
        day = match[1];
      }
    }

    let era = dynastyName || "大朝";
    const cleaned = dateStr.replace(/公元\d+年\s*/, "");
    const monthIndex = cleaned.indexOf(month);
    if (monthIndex !== -1) {
      era = cleaned.substring(0, monthIndex).trim();
    }

    return { yearNum, era, month, day };
  };

  const activeGameDate = parseFullDate(currentCalendarDate);

  // Viewed date state (Can be navigated independently of game state)
  const [viewedYear, setViewedYear] = React.useState<number>(activeGameDate.yearNum);
  const [viewedMonth, setViewedMonth] = React.useState<string>(activeGameDate.month);
  const [viewMode, setViewMode] = React.useState<"month" | "year">("month");

  // Clicking an element triggers a detailed popover modal state
  const [activeDayData, setActiveDayData] = React.useState<{
    dayName: string;
    monthName: string;
    festival: string | null;
    appointments: any[];
  } | null>(null);

  // Keep in sync when the actual underlying game clock steps forward
  React.useEffect(() => {
    const fresh = parseFullDate(currentCalendarDate);
    setViewedYear(fresh.yearNum);
    setViewedMonth(fresh.month);
  }, [currentCalendarDate]);

  // Helper check to verify if character appointment has "appeared in dialogue plot logs"
  const isAppointmentUnlocked = (appt: typeof appointments[0]) => {
    // 1. Check if associated character is unlocked (isPresent === true)
    const matchedNpc = npcs.find(n => n.name === appt.npcName || appt.npcName.includes(n.name));
    if (matchedNpc && matchedNpc.isPresent) {
       return true;
    }

    // 2. Scan narratives or dialogue logs text for references as fallback
    const apptTitleLower = appt.title.toLowerCase();
    const npcNameLower = appt.npcName.toLowerCase();
    const hasAppearanceText = dialogueHistory.some(h => {
      const logLower = h.text.toLowerCase();
      return logLower.includes(npcNameLower) || logLower.includes(apptTitleLower) || logLower.includes(appt.holidayName.toLowerCase());
    });

    return hasAppearanceText;
  };

  // Nav month functions
  const prevMonth = () => {
    const idx = MONTHS.indexOf(viewedMonth);
    if (idx === 0) {
      setViewedMonth(MONTHS[11]);
      setViewedYear(prev => Math.max(1, prev - 1));
    } else {
      setViewedMonth(MONTHS[idx - 1]);
    }
  };

  const nextMonth = () => {
    const idx = MONTHS.indexOf(viewedMonth);
    if (idx === 11) {
      setViewedMonth(MONTHS[0]);
      setViewedYear(prev => prev + 1);
    } else {
      setViewedMonth(MONTHS[idx + 1]);
    }
  };

  // Day click handler
  const handleDayClick = (dayName: string) => {
    const festival = localFestivals[`${viewedMonth}-${dayName}`] || null;
    const dayAppts = appointments.filter(a => a.month === viewedMonth && a.day === dayName);
    
    // Always open detailed popup for clicking any day
    setActiveDayData({
      dayName,
      monthName: viewedMonth,
      festival,
      appointments: dayAppts
    });

    // Reset forms
    setShowAddForm(false);
    setNewTitle("");
    setNewNpc("");
    setNewLocName("");
    setNewDesc("");
    setEditingFest(false);
    setFestText(festival || "");
  };

  // Traditional 30 days in a month representation
  const lunarDays = [
    "初一", "初二", "初三", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
  ];

  return (
    <div className="space-y-4 relative" id="calendar-canvas-panel">
      {activeDayData && (
        <div className="absolute inset-0 bg-black/95 p-4 border-2 border-[#bfa15f]/50 rounded-xl flex flex-col justify-between z-40 animate-fade-in text-left overflow-y-auto">
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#bfa15f]/20 pb-2">
              <span className="text-amber-300 font-extrabold text-sm flex items-center gap-1">
                ⛩️ {activeDayData.monthName}月 · {activeDayData.dayName}日
              </span>
              <span className="text-[9px] text-[#dacfc5]/50">御起居占天数与时序修改</span>
            </div>

            {/* Festival Section / Custom Festival Modifier */}
            <div className="space-y-1.5">
              {editingFest ? (
                <div className="bg-[#8c2c16]/10 border border-[#8c2c16]/40 rounded p-2.5 space-y-2">
                  <span className="text-[10px] text-amber-300 font-bold block">🔧 编纂今日时时节俗：</span>
                  <input
                    type="text"
                    value={festText}
                    onChange={(e) => setFestText(e.target.value)}
                    className="w-full bg-black border border-amber-500/30 p-1.5 text-xs text-amber-200 font-serif focus:outline-none"
                    placeholder="例如：元宵灯会 (上元佳宴) 或 自定义盛典"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const key = `${activeDayData.monthName}-${activeDayData.dayName}`;
                        const updatedFestivals = { ...localFestivals, [key]: festText };
                        setLocalFestivals(updatedFestivals);
                        setActiveDayData(prev => prev ? { ...prev, festival: festText || null } : null);
                        setEditingFest(false);
                      }}
                      className="py-0.5 px-2 bg-emerald-800 text-white rounded text-[9px] font-bold cursor-pointer hover:bg-emerald-700"
                    >
                      确定修撰
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFest(false)}
                      className="py-0.5 px-2 bg-neutral-800 text-gray-300 rounded text-[9px] font-bold cursor-pointer hover:bg-neutral-700"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#8c2c16]/10 border border-[#8c2c16]/30 rounded p-2.5 flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <span className="text-amber-400 text-xs font-black flex items-center gap-1">
                      🎏 {activeDayData.festival || "平淡无奇 (无世俗令节)"}
                    </span>
                    <p className="text-[9.5px] text-gray-400 leading-normal">
                      {activeDayData.festival 
                        ? "此时乃祖制传延吉庆佳辰，主公可于此日与百官或后宫偕乐，固万邦之大信。"
                        : "此时平淡清奇，四时无甚世俗特定大型祭俗节令。主公亦可点击右侧自行修撰创制节气名分。"
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFestText(activeDayData.festival || "");
                      setEditingFest(true);
                    }}
                    className="shrink-0 p-1 bg-black/60 border border-[#bfa15f]/30 hover:border-amber-400 rounded text-[8px] text-amber-200 cursor-pointer select-none transition"
                  >
                    修改令节
                  </button>
                </div>
              )}
            </div>

            {/* Appointments Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-0.5">
                <span className="text-[10px] text-amber-400/80 font-bold block">
                  📜 日历备忘录誓约信息:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="py-0.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-600/30 hover:border-amber-400 text-amber-300 rounded text-[8.5px] font-bold cursor-pointer select-none transition"
                >
                  {showAddForm ? "✕ 隐藏表单" : "➕ 新拟本日盟誓"}
                </button>
              </div>

              {/* Add Appointment form */}
              {showAddForm && (
                <div className="bg-neutral-950 p-3 rounded-lg border border-amber-600/30 space-y-2 text-[10px]" id="calendar-add-appt-form">
                  <span className="text-amber-400 font-bold block">✒️ 纳新盟约备忘圣册：</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 block">盟会主旨在册名称</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="例如：御花园夜宴共修世好"
                        className="w-full bg-black border border-neutral-800 p-1 text-xs text-amber-200 h-7 rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 block">会面随行随扈臣将/红颜</label>
                      <input
                        type="text"
                        value={newNpc}
                        onChange={(e) => setNewNpc(e.target.value)}
                        placeholder="例如：当朝首辅 或 贵妃"
                        className="w-full bg-black border border-neutral-800 p-1 text-xs text-amber-200 h-7 rounded"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 block">行会处所地理名</label>
                      <input
                        type="text"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        placeholder="例如：御苑蓬莱池"
                        className="w-full bg-black border border-neutral-800 p-1 text-xs text-amber-200 h-7 rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-gray-400 block">盟契细节</label>
                      <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="例如：密议整饬禁军与御书房理政之机宜..."
                        className="w-full bg-black border border-neutral-800 p-1 text-xs text-amber-200 h-7 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTitle.trim() || !newNpc.trim()) {
                          alert("誓约主旨及同会人物不可为空！");
                          return;
                        }
                        const newAppt = {
                          id: `appt-custom-${Date.now()}`,
                          month: activeDayData.monthName,
                          day: activeDayData.dayName,
                          npcName: newNpc,
                          location: newLocName || "皇廷禁苑",
                          holidayName: "圣躬亲定大誓约",
                          title: newTitle,
                          description: newDesc || "承圣意临此，理政备忘天下事。",
                          forceUnlocked: true
                        };
                        if (setAppointments) {
                          setAppointments([...appointments, newAppt]);
                        }
                        setActiveDayData(prev => prev ? {
                          ...prev,
                          appointments: [...prev.appointments, newAppt]
                        } : null);
                        setNewTitle("");
                        setNewNpc("");
                        setNewLocName("");
                        setNewDesc("");
                        setShowAddForm(false);
                      }}
                      className="py-1 px-3 bg-[#8c2c16] hover:bg-red-800 border border-amber-600/30 text-white rounded font-bold cursor-pointer transition text-[9px]"
                    >
                      敕笔裁定盟约
                    </button>
                  </div>
                </div>
              )}
              
              {activeDayData.appointments.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic py-2">本日尚无起居注神会，山河清平。</p>
              ) : (
                activeDayData.appointments.map((appt, i) => {
                  const unlocked = appt.forceUnlocked || isAppointmentUnlocked(appt);
                  if (!unlocked) {
                    return (
                      <div key={i} className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-lg flex items-center gap-3 relative">
                        <Lock className="w-4 h-4 text-gray-650 shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-[11px] font-bold text-gray-500">🔒 冥冥起于尘劫中的隐世誓约</h4>
                          <p className="text-[9px] text-gray-600 leading-relaxed mt-0.5">
                            尚未在天命剧情中遭遇【{appt.npcName}】或触及相关宏大图册。剧情展开后此处备忘录细目即可昭示天下。
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (setAppointments) {
                              setAppointments(appointments.filter(a => a.id !== appt.id));
                            }
                            setActiveDayData(prev => prev ? {
                              ...prev,
                              appointments: prev.appointments.filter(a => a.id !== appt.id)
                            } : null);
                          }}
                          className="absolute top-2 right-2 text-neutral-800 hover:text-red-500 transition p-1 hover:bg-black rounded"
                          title="删除本日誓约备忘"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="bg-neutral-900/60 border border-purple-900/50 rounded-lg p-3 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (setAppointments) {
                            setAppointments(appointments.filter(a => a.id !== appt.id));
                          }
                          setActiveDayData(prev => prev ? {
                            ...prev,
                            appointments: prev.appointments.filter(a => a.id !== appt.id)
                          } : null);
                        }}
                        className="absolute top-2.5 right-2.5 text-neutral-600 hover:text-red-500 transition p-1 rounded-md hover:bg-black/40 text-[9px] font-bold border border-transparent hover:border-neutral-800 cursor-pointer"
                        title="删除本日誓约"
                      >
                        ✕ 删除
                      </button>

                      <div className="flex justify-between items-center text-[10px] border-b border-neutral-950 pb-1 pr-14">
                        <span className="text-purple-300 font-bold">🤝 {appt.holidayName || "本朝敕谕誓约"} · 誓约践约</span>
                        <span className="bg-emerald-900/20 text-emerald-400 px-1 border border-emerald-950 rounded text-[8px]">显化</span>
                      </div>
                      <h4 className="text-xs text-amber-200 font-extrabold font-serif pr-12">“{appt.title}”</h4>
                      
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] text-gray-400">
                        <div className="bg-black/40 p-1 rounded font-serif">
                          <span className="text-amber-500 font-bold">人物:</span> {appt.npcName}
                        </div>
                        <div className="bg-black/40 p-1 rounded font-serif truncate">
                          <span className="text-red-400 font-bold">处所:</span> {appt.location}
                        </div>
                      </div>

                      <div className="text-[9.5px] text-[#dacfc5] leading-relaxed font-serif bg-black/20 p-2 rounded">
                        <span className="text-[#bfa15f] font-bold">修政密文:</span> {appt.description}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Accept / Close */}
          <div className="pt-2 border-t border-neutral-950 flex justify-end">
            <button
              onClick={() => setActiveDayData(null)}
              className="py-1 px-4 text-[10px] bg-[#8c2c16] hover:bg-[#a63c22] border border-amber-500/30 text-white rounded cursor-pointer transition font-bold"
            >
              ✕ 返回历表
            </button>
          </div>
        </div>
      )}

      {/* Calendar header with navigation and View switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#bfa15f]/25 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-black tracking-widest text-[#fcfbfa]">大天历纪 · 历元象天镜</h3>
            <p className="text-[9px] text-[#a09e97]/60 block -mt-0.5">日月星辰 备忘时数符机仪</p>
          </div>
        </div>

        {/* View togglers: Month vs Year format */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center bg-black border border-[#bfa15f]/20 rounded p-0.5 text-[8.5px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                viewMode === "month" ? "bg-[#8c2c16] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-2.5 h-2.5" />
              <span>月别细格</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("year")}
              className={`px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 ${
                viewMode === "year" ? "bg-[#8c2c16] text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid className="w-2.5 h-2.5" />
              <span>九华年历</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigator Header for viewed year and month */}
      <div className="bg-black/55 border border-[#bfa15f]/15 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewedYear(prev => Math.max(1, prev - 1))}
            className="p-1 hover:bg-neutral-900 border border-neutral-800 rounded text-gray-400 hover:text-[#fbbf24] cursor-pointer transition active:scale-90"
            title="上一年"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-black text-amber-200 bg-[#8c2c16]/5 border border-[#8c2c16]/20 px-2 py-1 rounded font-sans">
            公元 {viewedYear} 年
          </span>
          <button
            type="button"
            onClick={() => setViewedYear(prev => prev + 1)}
            className="p-1 hover:bg-neutral-900 border border-neutral-800 rounded text-gray-400 hover:text-[#fbbf24] cursor-pointer transition active:scale-90"
            title="下一年"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Indicator */}
        <div className="text-center font-serif">
          {viewedYear === activeGameDate.yearNum && viewedMonth === activeGameDate.month ? (
            <span className="text-[8.5px] bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full blinking-fast">
              ● 御览今日
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setViewedYear(activeGameDate.yearNum);
                setViewedMonth(activeGameDate.month);
              }}
              className="text-[8.5px] bg-[#8c2c16]/30 border border-amber-500/10 text-amber-300 hover:text-white hover:border-amber-500/50 px-2 py-0.5 rounded cursor-pointer transition active:scale-95"
            >
              ↩ 归位当轴
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 hover:bg-neutral-900 border border-neutral-800 rounded text-gray-400 hover:text-[#fbbf24] cursor-pointer transition active:scale-90"
            title="上一月"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-black text-amber-200 bg-neutral-950 border border-neutral-900 px-2.5 py-1 rounded font-serif w-14 text-center">
            {viewedMonth}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 hover:bg-neutral-900 border border-neutral-800 rounded text-gray-400 hover:text-[#fbbf24] cursor-pointer transition active:scale-90"
            title="下一月"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render selected viewMode: Month Grid vs Full Year Calendar Grid */}
      {viewMode === "month" ? (
        /* MONTHLY CALENDAR VIEW */
        <div className="bg-neutral-950/80 border border-[#bfa15f]/15 rounded-xl p-3.5 space-y-2 text-left">
          <p className="font-bold text-[11px] text-amber-400 border-b border-neutral-900 pb-1.5 flex justify-between">
            <span>📅 {viewedMonth}月大仪轮转（本期行历三十日）</span>
            <span className="text-[9px] text-[#dacfc5]/50 italic">👉 点击特定日期，查看备忘录详细信息与尘契</span>
          </p>
          
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 pt-1">
            {lunarDays.map(dayName => {
              const hasFestival = localFestivals[`${viewedMonth}-${dayName}`];
              const apptsInThisDay = appointments.filter(a => a.month === viewedMonth && a.day === dayName);
              const unlockedAppts = apptsInThisDay.filter(isAppointmentUnlocked);
              const hasActualAppt = unlockedAppts.length > 0;
              const hasLockedAppt = apptsInThisDay.length > 0 && !hasActualAppt;

              // Check if today matches exactly in the universe
              const isToday = viewedYear === activeGameDate.yearNum && 
                              viewedMonth === activeGameDate.month && 
                              activeGameDate.day.includes(dayName);

              return (
                <div 
                  key={dayName}
                  onClick={() => handleDayClick(dayName)}
                  className={`relative p-1.5 rounded border transition-all duration-300 flex flex-col justify-between h-14 cursor-pointer select-none hover:scale-103 hover:shadow-[0_0_10px_rgba(251,191,36,0.15)] ${
                    isToday 
                      ? "bg-[#8c2c16]/30 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.2)]" 
                      : hasActualAppt
                        ? "bg-purple-950/20 border-purple-800/80 hover:bg-purple-950/35"
                        : hasLockedAppt
                          ? "bg-neutral-900 border-neutral-950 hover:border-neutral-800"
                          : hasFestival
                            ? "bg-amber-950/20 border-amber-900/60 hover:bg-amber-950/30"
                            : "bg-black/60 border-neutral-900 hover:border-neutral-700 hover:bg-neutral-950"
                  }`}
                >
                  <span className={`text-[10px] font-bold block ${isToday ? "text-amber-300 font-extrabold" : "text-gray-400"}`}>
                    {dayName}
                  </span>

                  <div className="space-y-0.5">
                    {isToday && (
                      <span className="text-[8px] bg-red-800 text-white font-sans rounded px-1 scale-90 inline-block font-black leading-none transform -translate-x-0.5">
                        今日
                      </span>
                    )}
                    {hasFestival && (
                      <span className="text-[7px] text-[#fbbf24] bg-amber-950/40 border border-amber-900/45 rounded px-0.5 block truncate leading-none">
                        🎏 {hasFestival.split(" ")[0]}
                      </span>
                    )}
                    {hasActualAppt && (
                      <span className="text-[7px] text-purple-300 bg-purple-900/40 border border-purple-800/60 rounded px-0.5 block truncate leading-none font-bold" title="已显现神策约定">
                        🤝 {unlockedAppts[0].holidayName.slice(0, 4)}
                      </span>
                    )}
                    {hasLockedAppt && (
                      <span className="text-[7px] text-gray-500 bg-neutral-950 border border-neutral-900 rounded px-0.5 block truncate leading-none italic" title="尚有幽契未决">
                        🔒 尘封契
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* YEAR CALENDAR OVERVIEW GRID */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MONTHS.map(monthName => {
            const isCurrentMonth = monthName === viewedMonth;
            
            // Collect holidays and appointments in this month
            const holidays = Object.entries(localFestivals)
              .filter(([key]) => key.startsWith(`${monthName}-`))
              .map(([, val]) => val.split(" ")[0]);

            const apptsThisMonth = appointments.filter(a => a.month === monthName);
            const unlockedThisMonth = apptsThisMonth.filter(isAppointmentUnlocked);
            const lockedCount = apptsThisMonth.length - unlockedThisMonth.length;

            return (
              <button
                key={monthName}
                type="button"
                onClick={() => {
                  setViewedMonth(monthName);
                  setViewMode("month");
                }}
                className={`text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isCurrentMonth 
                    ? "bg-[#8c2c16]/15 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.1)]" 
                    : "bg-black/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-950"
                }`}
              >
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1 mb-1.5 select-none">
                  <span className="text-xs font-black text-amber-200">{monthName}</span>
                  {monthName === activeGameDate.month && viewedYear === activeGameDate.yearNum && (
                    <span className="text-[7.5px] bg-[#8c2c16] text-white px-1 py-0.2 rounded-sm font-sans font-bold scale-90">当令</span>
                  )}
                </div>

                <div className="space-y-1.5 select-none text-[8.5px] leading-tight">
                  {holidays.length > 0 && (
                    <div className="text-gray-400">
                      <span className="text-amber-400/80 mr-1">🎏</span> {holidays.join(", ")}
                    </div>
                  )}

                  {unlockedThisMonth.length > 0 && (
                    <div className="text-purple-300 font-bold flex items-center gap-0.5">
                      <LockOpen className="w-2.5 h-2.5 shrink-0" />
                      <span>约：{unlockedThisMonth.map(u => u.npcName).join(", ")}</span>
                    </div>
                  )}

                  {lockedCount > 0 && (
                    <div className="text-gray-600 italic flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5 shrink-0 text-neutral-700" />
                      <span>{lockedCount} 桩誓约尘封未显</span>
                    </div>
                  )}

                  {holidays.length === 0 && apptsThisMonth.length === 0 && (
                    <div className="text-gray-600 block py-1.5 italic text-center text-[7.5px]">四时无扰，山下清平</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
