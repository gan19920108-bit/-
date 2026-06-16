import React from "react";
import { Character, GameNPC, GameItem, Skill, Quest, ChronicleLog } from "../types";
import { Users, Shield, Wrench, UserPlus, BookOpen, Clock, Settings, Trash2, Plus, FileText, Sparkles, AlertCircle } from "lucide-react";

interface DataHubPanelProps {
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  npcs: GameNPC[];
  setNpcs: React.Dispatch<React.SetStateAction<GameNPC[]>>;
  items: GameItem[];
  setItems: React.Dispatch<React.SetStateAction<GameItem[]>>;
  skills: Skill[];
  setSkills: React.Dispatch<React.SetStateAction<Skill[]>>;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  appointments: any[];
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  currentCalendarDate: string;
  setCurrentCalendarDate: (d: string) => void;
  chronicles: ChronicleLog[];
  setChronicles: React.Dispatch<React.SetStateAction<ChronicleLog[]>>;
}

export default function DataHubPanel({
  character,
  setCharacter,
  npcs,
  setNpcs,
  items,
  setItems,
  skills,
  setSkills,
  quests,
  setQuests,
  appointments,
  setAppointments,
  currentCalendarDate,
  setCurrentCalendarDate,
  chronicles,
  setChronicles
}: DataHubPanelProps) {
  
  type TabType = "appointments" | "general" | "npcs" | "memos" | "items" | "skills" | "quests";
  const [activeTab, setActiveTab] = React.useState<TabType>("appointments");
  const [feedback, setFeedback] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // 1. GENERAL SETTINGS AND EMBEDDED ATTRIBUTES
  const handleCharChange = (key: string, value: any) => {
    setCharacter(prev => ({
      ...prev,
      [key]: value
    }));
    triggerFeedback(`✨ 皇帝根大宝之【${key}】已顺利更正归档！`);
  };

  const handleAttrChange = (key: keyof typeof character.attributes, val: number) => {
    setCharacter(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: val
      }
    }));
    triggerFeedback(`✨ 统御神骨属性【${String(key)}】已调整为 ${val}！`);
  };

  // 2. NPCs MANAGEMENT
  const handleNpcChange = (index: number, key: keyof GameNPC, value: any) => {
    const updated = [...npcs];
    updated[index] = { ...updated[index], [key]: value };
    setNpcs(updated);
    triggerFeedback(`✨ 人际臣僚【${updated[index].name}】的${String(key)}已更新！`);
  };

  const [newNpc, setNewNpc] = React.useState<Partial<GameNPC>>({
    name: "",
    role: "廷臣省政御笔",
    age: 32,
    relationship: "敬重",
    relationVal: 60,
    loyalty: 80,
    deeds: ["初入仕途，谨守朝章"],
    items: [],
    statusText: "中立，正躬身候旨",
    location: "太和殿宣政司",
    currentThoughts: "圣上神鉴澄澈，微臣誓死勤勉社稷。",
    playerImpression: "初有才学实绩之臣",
    isPresent: true,
    avatarSeed: "advisor"
  });

  const handleAddNpc = () => {
    if (!newNpc.name?.trim()) {
      alert("请输入人物名号！");
      return;
    }
    const npcToAdd: GameNPC = {
      name: newNpc.name,
      avatarSeed: newNpc.avatarSeed || "general",
      role: newNpc.role || "游侠野贤",
      age: Number(newNpc.age) || 30,
      relationship: newNpc.relationship || "知遇",
      relationVal: Number(newNpc.relationVal) || 50,
      loyalty: Number(newNpc.loyalty) || 50,
      deeds: newNpc.deeds || [],
      items: newNpc.items || [],
      statusText: newNpc.statusText || "山野隐修",
      location: newNpc.location || "京兆外苑",
      currentThoughts: newNpc.currentThoughts || "静观风起云落",
      playerImpression: newNpc.playerImpression || "无甚过往瓜葛之辈",
      isPresent: newNpc.isPresent !== undefined ? newNpc.isPresent : true
    };
    setNpcs(prev => [...prev, npcToAdd]);
    setNewNpc({
      name: "",
      role: "廷臣省政御笔",
      age: 30,
      relationship: "知遇",
      relationVal: 50,
      loyalty: 50,
      deeds: ["初登仕宦"],
      items: [],
      statusText: "无病无碍",
      location: "京兆府邸",
      currentThoughts: "",
      playerImpression: "",
      isPresent: true,
      avatarSeed: "general"
    });
    triggerFeedback(`🎉 已经成功册封并敕召了新人物：【${npcToAdd.name}】！`);
  };

  const handleDeleteNpc = (actualIdx: number) => {
    const victim = npcs[actualIdx];
    if (confirm(`确定要放逐并删除人物 【${victim.name}】 吗？`)) {
      setNpcs(prev => prev.filter((_, idx) => idx !== actualIdx));
      triggerFeedback(`❌ 已废止荡平人物：【${victim.name}】！`);
    }
  };

  // 3. APPOINTMENTS (WORLD EVENTS)
  const handleApptChange = (index: number, key: string, value: string) => {
    const updated = [...appointments];
    updated[index] = { ...updated[index], [key]: value };
    setAppointments(updated);
    triggerFeedback(`✨ 世界事件【${updated[index].holidayName}】之【${key}】已诏改！`);
  };

  const [newAppt, setNewAppt] = React.useState({
    month: "一月",
    day: "初一",
    holidayName: "新岁朝贡大典",
    npcName: "太尉",
    location: "太极金殿",
    title: "万国来朝大典",
    description: "群臣齐聚太极金殿，万国使节敬献贡礼，共庆新岁大运昌隆。"
  });

  const handleAddAppt = () => {
    if (!newAppt.holidayName?.trim() || !newAppt.title?.trim()) {
      alert("请输入事件名称和标题！");
      return;
    }
    const apptToAdd = {
      id: `custom-appt-${Date.now()}`,
      ...newAppt
    };
    setAppointments(prev => [...prev, apptToAdd]);
    setNewAppt({
      month: "一月",
      day: "初一",
      holidayName: "朝贺",
      npcName: "群臣",
      location: "宣政殿",
      title: "新大礼贺",
      description: "宣政殿受百官贺。"
    });
    triggerFeedback(`🎉 已在星历下刻书新的世界事件：【${apptToAdd.holidayName}】！`);
  };

  const handleDeleteAppt = (actualIdx: number) => {
    const victim = appointments[actualIdx];
    if (confirm(`确定要废除这档世界事件 【${victim.holidayName}】 吗？`)) {
      setAppointments(prev => prev.filter((_, idx) => idx !== actualIdx));
      triggerFeedback(`❌ 已废弃除去该桩世界事件记载！`);
    }
  };

  // 4. ITEMS/BACKPACK
  const handleItemChange = (index: number, key: keyof GameItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value } as GameItem;
    setItems(updated);
    triggerFeedback(`✨ 龙库御藏物品【${updated[index].name}】的${String(key)}已敕改！`);
  };

  const [newItem, setNewItem] = React.useState<Partial<GameItem>>({
    id: "",
    name: "",
    description: "天命造化之圣器",
    quality: "奇珍",
    type: "传国信物",
    count: 1,
    effect: "皇威+10, 幸运+10"
  });

  const handleAddItem = () => {
    if (!newItem.name?.trim()) {
      alert("请输入物品名讳！");
      return;
    }
    const itemToAdd: GameItem = {
      id: newItem.id || `custom-item-${Date.now()}`,
      name: newItem.name,
      description: newItem.description || "",
      quality: newItem.quality as any || "凡器",
      type: newItem.type as any || "俗世细软",
      count: Number(newItem.count) || 1,
      effect: newItem.effect || ""
    };
    setItems(prev => [...prev, itemToAdd]);
    setNewItem({
      id: "",
      name: "",
      description: "",
      quality: "奇珍",
      type: "传国信物",
      count: 1,
      effect: ""
    });
    triggerFeedback(`🎉 已增铸法器宝贝放入国库：【${itemToAdd.name}】！`);
  };

  const handleDeleteItem = (actualIdx: number) => {
    const victim = items[actualIdx];
    setItems(prev => prev.filter((_, idx) => idx !== actualIdx));
    triggerFeedback(`🗑️ 已销毁御仓珍稀：【${victim.name}】！`);
  };

  // 5. SKILLS
  const handleSkillChange = (index: number, key: keyof Skill, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [key]: value } as Skill;
    setSkills(updated);
    triggerFeedback(`✨ 玄门绝学【${updated[index].name}】的${String(key)}已昭改！`);
  };

  const [newSkill, setNewSkill] = React.useState<Partial<Skill>>({
    id: "",
    name: "",
    level: "初窥门径",
    description: "吞吐天地灵华之大道秘典",
    exp: 20,
    type: "君臣国政"
  });

  const handleAddSkill = () => {
    if (!newSkill.name?.trim()) {
      alert("请输入绝学技能名！");
      return;
    }
    const skillToAdd: Skill = {
      id: newSkill.id || `custom-sk-${Date.now()}`,
      name: newSkill.name,
      level: newSkill.level || "初窥门径",
      description: newSkill.description || "",
      exp: Number(newSkill.exp) || 0,
      type: newSkill.type as any || "君臣国政"
    };
    setSkills(prev => [...prev, skillToAdd]);
    setNewSkill({
      id: "",
      name: "",
      level: "初窥门径",
      description: "",
      exp: 0,
      type: "君臣国政"
    });
    triggerFeedback(`🎉 圣主神台参悟并添加新技能：【${skillToAdd.name}】！`);
  };

  const handleDeleteSkill = (actualIdx: number) => {
    const victim = skills[actualIdx];
    setSkills(prev => prev.filter((_, idx) => idx !== actualIdx));
    triggerFeedback(`🗑️ 废除圣意玄理精修：【${victim.name}】！`);
  };

  // 6. QUESTS
  const handleQuestChange = (index: number, key: keyof Quest, value: any) => {
    const updated = [...quests];
    updated[index] = { ...updated[index], [key]: value } as Quest;
    setQuests(updated);
    triggerFeedback(`✨ 社稷宏纲任务【${updated[index].title}】的${String(key)}已改字！`);
  };

  const [newQuest, setNewQuest] = React.useState<Partial<Quest>>({
    id: "",
    title: "",
    description: "中兴大业之重道天命",
    status: "进行中",
    type: "主线",
    reward: "皇威 +20, 国库存存存金 +2000 两",
    progress: "推演中",
    failurePenalty: "民怨沸腾，朝纲崩塌",
    difficulty: "困难"
  });

  const handleAddQuest = () => {
    if (!newQuest.title?.trim()) {
      alert("请输入天命任务的名号！");
      return;
    }
    const questToAdd: Quest = {
      id: newQuest.id || `custom-q-${Date.now()}`,
      title: newQuest.title,
      description: newQuest.description || "",
      status: newQuest.status as any || "进行中",
      type: newQuest.type as any || "主线",
      reward: newQuest.reward || "",
      progress: newQuest.progress || "0%",
      failurePenalty: newQuest.failurePenalty || "",
      difficulty: newQuest.difficulty || "中等"
    };
    setQuests(prev => [...prev, questToAdd]);
    setNewQuest({
      id: "",
      title: "",
      description: "",
      status: "进行中",
      type: "主线",
      reward: "",
      progress: "",
      failurePenalty: "",
      difficulty: "困难"
    });
    triggerFeedback(`🎉 已经成功颁布并在乾坤大印中登记新圣差：【${questToAdd.title}】！`);
  };

  const handleDeleteQuest = (actualIdx: number) => {
    const victim = quests[actualIdx];
    setQuests(prev => prev.filter((_, idx) => idx !== actualIdx));
    triggerFeedback(`🗑️ 已将圣谕天命除名：【${victim.title}】！`);
  };

  // 7. CHRONICLES (MEMOS)
  const handleChronicleChange = (index: number, key: keyof ChronicleLog, value: any) => {
    const updated = [...chronicles];
    updated[index] = { ...updated[index], [key]: key === "turn" || key === "year" ? parseInt(value) || 0 : value } as ChronicleLog;
    setChronicles(updated);
    triggerFeedback(`✨ 编年史记【第 ${updated[index].year} 载】之【${String(key)}】已更正！`);
  };

  const [newChron, setNewChron] = React.useState<Partial<ChronicleLog>>({
    turn: 1,
    year: 1,
    eventText: ""
  });

  const handleAddChron = () => {
    if (!newChron.eventText?.trim()) {
      alert("请输入编年大事记实！");
      return;
    }
    const chronToAdd: ChronicleLog = {
      turn: Number(newChron.turn) || chronicles.length + 1,
      year: Number(newChron.year) || chronicles.length + 1,
      eventText: newChron.eventText
    };
    setChronicles(prev => [chronToAdd, ...prev]);
    setNewChron({
      turn: chronicles.length + 2,
      year: chronicles.length + 2,
      eventText: ""
    });
    triggerFeedback(`🎉 备忘录内，已成功纂刻新正史：【${chronToAdd.eventText.substring(0, 8)}】！`);
  };

  const handleDeleteChron = (actualIdx: number) => {
    const victim = chronicles[actualIdx];
    if (confirm(`确定要永久毁灭这段 【第 ${victim.year} 载】 历史变迁记录吗？`)) {
      setChronicles(prev => prev.filter((_, idx) => idx !== actualIdx));
      triggerFeedback(`🗑️ 已将此页修史撕毁烧却！`);
    }
  };

  // Helper to render pagination bar
  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-900/40 text-[10px]">
        <span className="text-gray-500 font-serif">
          共 {totalItems} 条记录分册 ｜ 第 {currentPage} / {totalPages} 页
        </span>
        <div className="flex items-center gap-1.5 font-sans">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-2.5 py-1 rounded bg-purple-950/20 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            ◀ 上一册
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-2.5 py-1 rounded bg-purple-950/20 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            下一册 ▶
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="data-hub-panel-outer" className="space-y-4 font-serif text-[#dacfc5]">
      
      {/* Description */}
      <div className="p-3.5 bg-neutral-950/60 border border-purple-500/20 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-purple-300 font-extrabold tracking-widest flex items-center gap-1.5 animate-pulse">
            🛸 大政乾坤时数仪 · 天机数据编辑器 (Omni Divine Sandboxed Configurator)
          </p>
          <p className="text-[10px] text-gray-500 italic mt-0.5">
            “大帝神纲在此纵览。游戏数据因错漏而偏失时，圣上自可手执朱笔，点红墨更张天地律法气运。”
          </p>
        </div>
        <button
          onClick={() => {
            triggerFeedback("🔄 乾坤万法星数盘已瞬息同步更新！");
          }}
          className="p-1 px-2.5 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-[9.5px] cursor-pointer text-purple-300 transition"
        >
          ☯️ 重统轮台
        </button>
      </div>

      {/* Floating Feedback Alert */}
      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-[10.5px] font-sans font-bold flex items-center gap-1.5 animate-slide-down">
          <span>●</span> {feedback}
        </div>
      )}

      {/* Modern Split View: Navigation on Left, Interactive Lists on Right */}
      <div className="grid grid-cols-12 gap-5 items-stretch min-h-[460px]">
        
        {/* LEFT COLUMN: Vertical Navigation Tab List */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-1 md:pr-4 md:border-r border-[#bfa15f]/15">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "appointments" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>📅 世界事件</span>
          </button>

          <button
            onClick={() => setActiveTab("general")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "general" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>👑 全局设定</span>
          </button>

          <button
            onClick={() => setActiveTab("npcs")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "npcs" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>👥 全局人物</span>
          </button>

          <button
            onClick={() => setActiveTab("memos")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "memos" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>📖 备忘录</span>
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "items" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>🎒 你的背包</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "skills" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>⚡ 你的技能</span>
          </button>

          <button
            onClick={() => setActiveTab("quests")}
            className={`px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer flex items-center gap-2 text-[10.5px] font-bold border ${activeTab === "quests" ? "bg-purple-950/50 text-[#fcfbfa] border-purple-500/40 shadow-inner" : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-neutral-950/50"}`}
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>⚔️ 你的任务</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Tab Detail Panels List */}
        <div className="col-span-12 md:col-span-9 bg-black/45 border border-neutral-900 rounded-xl p-4 text-left flex flex-col justify-between overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-amber-950/20">
          
          <div className="space-y-4 flex-grow">
            
            {/* 1. APPOINTMENTS -> 世界事件 */}
            {activeTab === "appointments" && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-[#bfa15f]/15 pb-1.5 flex justify-between items-center">
                  <h3 className="text-xs font-extrabold text-amber-300">
                    📅 四时岁时节令 · 天下世界事件书 (Active World Events & Calendars)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {appointments.length} 件</span>
                </div>

                {/* Add Appt form */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 space-y-2.5">
                  <div className="text-[10px] text-purple-300 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 谱写敕命新世界事件 (Create Scenario Appointment)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">月份 Month</span>
                      <input
                        type="text"
                        value={newAppt.month}
                        onChange={(e) => setNewAppt(p => ({...p, month: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">吉日 Day</span>
                      <input
                        type="text"
                        value={newAppt.day}
                        onChange={(e) => setNewAppt(p => ({...p, day: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">佳节名称 Holiday</span>
                      <input
                        type="text"
                        value={newAppt.holidayName}
                        onChange={(e) => setNewAppt(p => ({...p, holidayName: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">约期人物 NPC</span>
                      <input
                        type="text"
                        value={newAppt.npcName}
                        onChange={(e) => setNewAppt(p => ({...p, npcName: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-teal-300 block w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">约定地点 Location</span>
                      <input
                        type="text"
                        value={newAppt.location}
                        onChange={(e) => setNewAppt(p => ({...p, location: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">大典主题 Title</span>
                      <input
                        type="text"
                        value={newAppt.title}
                        onChange={(e) => setNewAppt(p => ({...p, title: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5 text-[10px]">
                    <span className="text-gray-500 block">事件机密详纲 Description</span>
                    <textarea
                      value={newAppt.description}
                      onChange={(e) => setNewAppt(p => ({...p, description: e.target.value}))}
                      rows={1}
                      className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAddAppt}
                      className="py-1 px-3 bg-purple-900 border border-purple-500 hover:bg-purple-800 text-white rounded text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" /> 各向敕命
                    </button>
                  </div>
                </div>

                {/* Paginated list */}
                <div className="space-y-3 font-serif text-[10.5px]">
                  {appointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((appt, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="p-3 bg-neutral-900/40 border border-neutral-900 rounded-lg space-y-2 relative group hover:border-purple-800/40 transition">
                        <button
                          onClick={() => handleDeleteAppt(actualIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="废除事件"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-gray-500 block text-[9px]">时序月份:</span>
                            <input
                              type="text"
                              value={appt.month}
                              onChange={(e) => handleApptChange(actualIdx, "month", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">具体吉日:</span>
                            <input
                              type="text"
                              value={appt.day}
                              onChange={(e) => handleApptChange(actualIdx, "day", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">岁时佳节/事宜标号:</span>
                            <input
                              type="text"
                              value={appt.holidayName}
                              onChange={(e) => handleApptChange(actualIdx, "holidayName", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">约定关联人物:</span>
                            <input
                              type="text"
                              value={appt.npcName}
                              onChange={(e) => handleApptChange(actualIdx, "npcName", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-teal-300 block w-full text-[10px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500 block text-[9px]">会盟案桌 location:</span>
                            <input
                              type="text"
                              value={appt.location}
                              onChange={(e) => handleApptChange(actualIdx, "location", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">大典誓约名讳：</span>
                            <input
                              type="text"
                              value={appt.title}
                              onChange={(e) => handleApptChange(actualIdx, "title", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 font-bold block w-full text-[10px]"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500 block text-[9px]">契书细目与社稷枢机：</span>
                          <textarea
                            value={appt.description}
                            onChange={(e) => handleApptChange(actualIdx, "description", e.target.value)}
                            rows={1}
                            className="bg-black border border-neutral-850 rounded p-1 text-gray-300 block w-full text-[10px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(appointments.length)}
              </div>
            )}

            {/* 2. GENERAL SETTINGS -> 全局设定 */}
            {activeTab === "general" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-extrabold text-amber-300 border-b border-[#bfa15f]/15 pb-1.5 flex items-center gap-1.5">
                  👑 九真尊位大帝与社稷大盘全局设定 (Emperor & Blueprint State)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[10.5px]">
                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">圣上尊姓大名 (Emperor Name):</label>
                    <input
                      type="text"
                      value={character.name}
                      onChange={(e) => handleCharChange("name", e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-amber-100 font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">王朝天号朝代 (Dynasty Name):</label>
                    <input
                      type="text"
                      value={character.dynasty}
                      onChange={(e) => handleCharChange("dynasty", e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-amber-100 font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">圣德帝号庙号 (Emperor Title):</label>
                    <input
                      type="text"
                      value={character.title || ""}
                      onChange={(e) => handleCharChange("title", e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-amber-100 font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">大帝帝龄星岁 (Emperor Age):</label>
                    <input
                      type="number"
                      value={character.age}
                      onChange={(e) => handleCharChange("age", parseInt(e.target.value) || character.age)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-amber-100 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">历象当前天元时辰 (Current Game Date):</label>
                    <input
                      type="text"
                      value={currentCalendarDate}
                      onChange={(e) => setCurrentCalendarDate(e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-teal-300 font-serif focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 font-bold">大统身份标签 (Identity):</label>
                    <input
                      type="text"
                      value={character.identity}
                      onChange={(e) => handleCharChange("identity", e.target.value)}
                      className="w-full bg-black border border-neutral-850 rounded px-2.5 py-1 text-amber-100 font-serif focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="pt-2">
                  <h4 className="text-[11px] font-extrabold text-amber-300 border-b border-neutral-900 pb-1 mb-2">
                    📈 圣躯天命八卦骨格大变数 (Emperor Core Attributes)
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                    {Object.entries(character.attributes).map(([attrKey, attrVal]) => {
                      if (typeof attrVal !== "number") return null;
                      return (
                        <div key={attrKey} className="bg-black/30 p-2 border border-neutral-850 rounded space-y-1">
                          <span className="text-gray-400 block font-bold capitalize">
                            {attrKey === "health" && "💖 生命 (Health)"}
                            {attrKey === "prestige" && "👑 皇威 (Prestige)"}
                            {attrKey === "gold" && "🪙 国库存金 (Gold)"}
                            {attrKey === "military" && "⚔️ 军力力量 (Military)"}
                            {attrKey === "defense" && "🛡️ 京畿城防 (Defense)"}
                            {attrKey === "strength" && "💪 肉身力量 (Strength)"}
                            {attrKey === "agility" && "💨 行步敏捷 (Agility)"}
                            {attrKey === "stamina" && "🔋 帝精力魄 (Stamina)"}
                            {attrKey === "intelligence" && "🧠 圣谋内阁 (Intelligence)"}
                            {attrKey === "luck" && "🍀 天护气运 (Luck)"}
                            {!["health", "prestige", "gold", "military", "defense", "strength", "agility", "stamina", "intelligence", "luck"].includes(attrKey) && attrKey}
                          </span>
                          <input
                            type="number"
                            value={attrVal}
                            onChange={(e) => handleAttrChange(attrKey as any, parseInt(e.target.value) || 0)}
                            className="w-full bg-[#121110] border border-neutral-900 rounded p-1 text-amber-300 text-center font-mono focus:outline-none focus:border-purple-500 text-[10.5px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Background Narrative */}
                <div className="space-y-1 pt-2">
                  <label className="block text-gray-400 font-bold text-[10.5px]">华夏世界背景大势设定 (Active World Setting Background):</label>
                  <textarea
                    value={character.background}
                    onChange={(e) => handleCharChange("background", e.target.value)}
                    rows={4}
                    className="w-full bg-black border border-neutral-850 rounded p-2.5 text-[#dacfc5] text-[10px] leading-relaxed focus:outline-none focus:border-purple-500 font-serif"
                    placeholder="在此编辑大地图天下背景设定..."
                  />
                </div>
              </div>
            )}

            {/* 3. NPCS -> 全局人物 */}
            {activeTab === "npcs" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1.5">
                  <h3 className="text-xs font-extrabold text-amber-300">
                    👥 天下百官谱与姬妾姻亲 (Active Characters Matrix)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {npcs.length} 位</span>
                </div>

                {/* Add Npc Form */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3.5 space-y-3">
                  <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> 册命朝政新僚属/红颜势力 (Create Custom NPC Item)
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">名尊 (Name):</label>
                      <input
                        type="text"
                        placeholder="例如 诸葛辅嗣"
                        value={newNpc.name}
                        onChange={(e) => setNewNpc(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">职司身份 (Role):</label>
                      <input
                        type="text"
                        placeholder="卫国大将军"
                        value={newNpc.role}
                        onChange={(e) => setNewNpc(p => ({ ...p, role: e.target.value }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">帝心好恶 (RelationVal):</label>
                      <input
                        type="number"
                        value={newNpc.relationVal}
                        onChange={(e) => setNewNpc(p => ({ ...p, relationVal: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">忠心臣节 (Loyalty):</label>
                      <input
                        type="number"
                        value={newNpc.loyalty}
                        onChange={(e) => setNewNpc(p => ({ ...p, loyalty: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="text-[10px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">心理活动 Thoughts:</label>
                      <input
                        type="text"
                        value={newNpc.currentThoughts}
                        onChange={(e) => setNewNpc(p => ({ ...p, currentThoughts: e.target.value }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 block pb-0.5">据守城池 location:</label>
                      <input
                        type="text"
                        value={newNpc.location}
                        onChange={(e) => setNewNpc(p => ({ ...p, location: e.target.value }))}
                        className="w-full bg-black border border-neutral-850 rounded p-1 text-white text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleAddNpc}
                      className="py-1 px-3 bg-purple-900 border border-purple-500 text-white rounded hover:bg-purple-800 text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 诏引封候
                    </button>
                  </div>
                </div>

                {/* List NPCs paginated */}
                <div className="space-y-3.5 pr-1">
                  {npcs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((npc, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="bg-neutral-900/40 border border-neutral-900 p-3 rounded-lg space-y-2 relative group hover:border-[#bfa15f]/30 transition">
                        <button
                          onClick={() => handleDeleteNpc(actualIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-300 p-1 rounded hover:bg-neutral-950 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="废黜放逐NPC"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">名号:</span>
                            <input
                              type="text"
                              value={npc.name}
                              onChange={(e) => handleNpcChange(actualIdx, "name", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 font-bold block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">身份官阶:</span>
                            <input
                              type="text"
                              value={npc.role}
                              onChange={(e) => handleNpcChange(actualIdx, "role", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">信任眷宠 (0-100):</span>
                            <input
                              type="number"
                              value={npc.relationVal}
                              onChange={(e) => handleNpcChange(actualIdx, "relationVal", parseInt(e.target.value) || 0)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-400 block w-full text-[10px] font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">忠心臣节 (0-100):</span>
                            <input
                              type="number"
                              value={npc.loyalty}
                              onChange={(e) => handleNpcChange(actualIdx, "loyalty", parseInt(e.target.value) || 0)}
                              className="bg-black border border-neutral-850 rounded p-1 text-rose-350 block w-full text-[10px] font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <span className="text-gray-500 block text-[9px]">驻地位所 Location:</span>
                            <input
                              type="text"
                              value={npc.location || ""}
                              onChange={(e) => handleNpcChange(actualIdx, "location", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-gray-300 block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">心理活动 Thoughts:</span>
                            <input
                              type="text"
                              value={npc.currentThoughts || ""}
                              onChange={(e) => handleNpcChange(actualIdx, "currentThoughts", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-gray-300 block w-full text-[10px]"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-black/10 px-2 rounded-md border border-neutral-850">
                            <span className="text-gray-400 text-[8.5px]">显化曝光 (isPresent):</span>
                            <button
                              onClick={() => handleNpcChange(actualIdx, "isPresent", !npc.isPresent)}
                              className={`text-[8.5px] px-2 py-0.5 rounded border transition cursor-pointer font-bold ${npc.isPresent ? "bg-purple-900/40 border-purple-500/40 text-purple-200" : "bg-neutral-900/20 border-neutral-800 text-gray-500"}`}
                            >
                              {npc.isPresent ? "已觐见" : "锁藏"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(npcs.length)}
              </div>
            )}

            {/* 4. CHRONICLES -> 备忘录 */}
            {activeTab === "memos" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1.5">
                  <h3 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                    📖 帝室起居注编年变局 · 大政备忘录历史 (Active Chronicle Memo Historiography)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {chronicles.length} 页</span>
                </div>

                {/* Add chronicle entry */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3.5 space-y-2.5">
                  <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 纂修增补史官起居注记事 (Inscribe Custom Chronicle Item)
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">回合序数 (Turn Index):</span>
                      <input
                        type="number"
                        value={newChron.turn}
                        onChange={(e) => setNewChron(p => ({ ...p, turn: parseInt(e.target.value) || 0 }))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px] font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block">昭信纪元 (Year Index):</span>
                      <input
                        type="number"
                        value={newChron.year}
                        onChange={(e) => setNewChron(p => ({ ...p, year: parseInt(e.target.value) || 0 }))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <span className="text-gray-500 block">圣听大事记实纲目 (Chronicle eventText):</span>
                    <textarea
                      value={newChron.eventText}
                      onChange={(e) => setNewChron(p => ({ ...p, eventText: e.target.value }))}
                      placeholder="修录大帝在此元辰中，一举平定乱党，扫洗乾坤..."
                      rows={1}
                      className="bg-black border border-neutral-850 rounded p-1.5 text-white block w-full text-[10px]"
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={handleAddChron}
                      className="py-1 px-3 bg-purple-900 border border-purple-500 text-white rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 各录编年
                    </button>
                  </div>
                </div>

                {/* Chronicles list */}
                <div className="space-y-3.5 pr-1">
                  {chronicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((chron, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="bg-neutral-900/40 border border-neutral-900 p-3 rounded-lg space-y-2 relative group hover:border-[#bfa15f]/20 transition text-[10.5px]">
                        <button
                          onClick={() => handleDeleteChron(actualIdx)}
                          className="absolute top-2.5 right-2 text-red-500 hover:text-red-300 opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer rounded"
                          title="毁灭本回合史考"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">回合 Turn:</span>
                            <input
                              type="number"
                              value={chron.turn}
                              onChange={(e) => handleChronicleChange(actualIdx, "turn", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full text-[10px] font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9.5px]">年份 Year:</span>
                            <input
                              type="number"
                              value={chron.year}
                              onChange={(e) => handleChronicleChange(actualIdx, "year", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full text-[10px] font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500 block text-[9.5px]">大事记录：</span>
                          <textarea
                            value={chron.eventText}
                            onChange={(e) => handleChronicleChange(actualIdx, "eventText", e.target.value)}
                            rows={1}
                            className="bg-black border border-neutral-850 rounded p-1.5 text-[#dacfc5] block w-full text-[10px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(chronicles.length)}
              </div>
            )}

            {/* 5. ITEMS -> 你的背包 */}
            {activeTab === "items" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1.5">
                  <h3 className="text-xs font-extrabold text-amber-300">
                    🎒 皇帝御用珍赏藏宝大府阁 (Empire Treasures & Backpack)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {items.length} 档</span>
                </div>

                {/* Add Item form */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] text-purple-300 font-bold">💎 熔铸制造圣物珍奇 (Create Custom Artifact)</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">圣物名讳</span>
                      <input
                        type="text"
                        placeholder="物品名,如传国玉玺"
                        value={newItem.name}
                        onChange={(e) => setNewItem(p => ({...p, name: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">物品品质</span>
                      <select
                        value={newItem.quality}
                        onChange={(e) => setNewItem(p => ({...p, quality: e.target.value as any}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full cursor-pointer text-[10px]"
                      >
                        <option value="神传">神传 (Gold)</option>
                        <option value="绝世">绝世 (Orange)</option>
                        <option value="奇珍">奇珍 (Purple)</option>
                        <option value="凡器">凡器 (Green)</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">功用法宝类型</span>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem(p => ({...p, type: e.target.value as any}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-[#dacfc5] block w-full cursor-pointer text-[10px]"
                      >
                        <option value="御用神兵">御用神兵</option>
                        <option value="传国信物">传国信物</option>
                        <option value="灵丹妙药">灵丹妙药</option>
                        <option value="武学残册">武学残册</option>
                        <option value="俗世细软">俗世细软</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">数量 Count</span>
                      <input
                        type="number"
                        placeholder="数量"
                        value={newItem.count}
                        onChange={(e) => setNewItem(p => ({...p, count: parseInt(e.target.value) || 1}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <input
                      type="text"
                      placeholder="属性附加效果,例如：皇威+10,健康+5"
                      value={newItem.effect}
                      onChange={(e) => setNewItem(p => ({ ...p, effect: e.target.value }))}
                      className="bg-black border border-neutral-850 rounded p-1 text-teal-300 block w-full font-serif"
                    />
                    <input
                      type="text"
                      placeholder="物品通俗和奥理描述"
                      value={newItem.description}
                      onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))}
                      className="bg-black border border-neutral-850 rounded p-1 text-gray-400 block w-full font-serif"
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={handleAddItem}
                      className="py-1 px-3 bg-purple-900 hover:bg-purple-800 border border-purple-500 rounded text-white text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> 熔铸入库
                    </button>
                  </div>
                </div>

                {/* Exisiting Items list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 text-[10.5px]">
                  {items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="bg-neutral-900/40 border border-neutral-900 p-2.5 rounded-lg space-y-1.5 relative group hover:border-[#bfa15f]/25 transition">
                        <button
                          onClick={() => handleDeleteItem(actualIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-350 opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer rounded"
                          title="废弃销毁物品"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-3 gap-1">
                          <div className="col-span-2">
                            <span className="text-gray-500 text-[8.5px] block font-mono">圣物名讳</span>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(actualIdx, "name", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-amber-200 font-bold block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8.5px] block font-mono">数量 Count</span>
                            <input
                              type="number"
                              value={item.count}
                              onChange={(e) => handleItemChange(actualIdx, "count", parseInt(e.target.value) || 1)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-center text-teal-300 font-mono block w-full text-[10px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[9px]">
                          <div>
                            <span className="text-gray-500 block">品质 Quality</span>
                            <select
                              value={item.quality}
                              onChange={(e) => handleItemChange(actualIdx, "quality", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-amber-100 font-serif block w-full"
                            >
                              <option value="神传">神传</option>
                              <option value="绝世">绝世</option>
                              <option value="奇珍">奇珍</option>
                              <option value="凡器">凡器</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-gray-500 block">附加效果 Effect</span>
                            <input
                              type="text"
                              value={item.effect || ""}
                              onChange={(e) => handleItemChange(actualIdx, "effect", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-teal-300 font-sans block w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5 text-[9px]">
                          <span className="text-gray-500">记事描述 Description:</span>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(actualIdx, "description", e.target.value)}
                            className="bg-black border border-neutral-850 rounded p-0.5 text-[#dacfc5] block w-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(items.length)}
              </div>
            )}

            {/* 6. SKILLS -> 你的技能 */}
            {activeTab === "skills" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1.5">
                  <h3 className="text-xs font-extrabold text-amber-300">
                    ⚡ 大帝玄门内劲与君臣经天纬地绝活 (Abilities & Divine Skills)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {skills.length} 门</span>
                </div>

                {/* Add Skill form */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] text-purple-300 font-bold">🧘 灌顶领悟神功秘诀 (Aquire Custom Secret Skill)</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <input
                      type="text"
                      placeholder="武学/国政名"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(p => ({...p, name: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-white block w-full"
                    />
                    <input
                      type="text"
                      placeholder="境界(一代宗师/初学)"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill(p => ({...p, level: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full"
                    />
                    <select
                      value={newSkill.type}
                      onChange={(e) => setNewSkill(p => ({...p, type: e.target.value as any}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-[#dacfc5] block w-full cursor-pointer"
                    >
                      <option value="武林秘籍">武林秘籍</option>
                      <option value="君臣国政">君臣国政</option>
                      <option value="修真方术">修真方术</option>
                      <option value="风雅杂世">风雅杂世</option>
                    </select>
                    <input
                      type="number"
                      placeholder="精熟度EXP (0-100)"
                      value={newSkill.exp}
                      onChange={(e) => setNewSkill(p => ({...p, exp: parseInt(e.target.value) || 0}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-teal-300 block w-full font-mono"
                    />
                  </div>

                  <div className="text-[10px] space-y-1">
                    <input
                      type="text"
                      placeholder="功用技能神妙说明"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill(p => ({...p, description: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-gray-400 block w-full"
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={handleAddSkill}
                      className="py-1 px-3 bg-purple-900 border border-purple-500 rounded text-white text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> 圣祖灌顶
                    </button>
                  </div>
                </div>

                {/* Skills list paginated */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 text-[10.5px]">
                  {skills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((skill, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="bg-neutral-900/40 border border-neutral-900 p-2.5 rounded-lg space-y-1.5 relative group hover:border-[#bfa15f]/25 transition">
                        <button
                          onClick={() => handleDeleteSkill(actualIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-300 opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer rounded"
                          title="遗忘该门绝活功底"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-3 gap-1">
                          <div className="col-span-2">
                            <span className="text-gray-500 text-[8.5px] block font-mono">功法名讳</span>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleSkillChange(actualIdx, "name", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-amber-200 font-bold block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 text-[8.5px] block font-mono">境界/重数</span>
                            <input
                              type="text"
                              value={skill.level}
                              onChange={(e) => handleSkillChange(actualIdx, "level", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-center text-[#dacfc5] block w-full text-[10px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                          <div>
                            <span className="text-gray-500 block">修炼流派</span>
                            <select
                              value={skill.type}
                              onChange={(e) => handleSkillChange(actualIdx, "type", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-amber-100 font-serif block w-full"
                            >
                              <option value="武林秘籍">武林秘籍</option>
                              <option value="君臣国政">君臣国政</option>
                              <option value="修真方术">修真方术</option>
                              <option value="风雅杂世">风雅杂世</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-gray-500 block">圆满精纯度 (0-100)</span>
                            <input
                              type="number"
                              value={skill.exp}
                              onChange={(e) => handleSkillChange(actualIdx, "exp", parseInt(e.target.value) || 0)}
                              className="bg-black border border-neutral-850 rounded p-0.5 text-teal-300 font-mono block w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5 text-[9px]">
                          <span className="text-gray-500">神妙奥理:</span>
                          <input
                            type="text"
                            value={skill.description}
                            onChange={(e) => handleSkillChange(actualIdx, "description", e.target.value)}
                            className="bg-black border border-neutral-850 rounded p-0.5 text-[#dacfc5] block w-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(skills.length)}
              </div>
            )}

            {/* 7. QUESTS -> 你的任务 */}
            {activeTab === "quests" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-1.5">
                  <h3 className="text-xs font-extrabold text-amber-300">
                    ⚙️ 圣皇御敕社稷复兴大天命纲目表 (Core Quests Console)
                  </h3>
                  <span className="text-[9.5px] text-gray-500">共 {quests.length} 项</span>
                </div>

                {/* Add Quest Form */}
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] text-purple-300 font-bold">📜 发布敕诏新天命 (Inscribe Epic Dynasty Mission)</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">任务名称</span>
                      <input
                        type="text"
                        placeholder="任务名称,如郑和下西洋"
                        value={newQuest.title}
                        onChange={(e) => setNewQuest(p => ({...p, title: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full text-[10px]"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">任务状态 Status</span>
                      <select
                        value={newQuest.status}
                        onChange={(e) => setNewQuest(p => ({...p, status: e.target.value as any}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-amber-200 block w-full cursor-pointer text-[10px]"
                      >
                        <option value="进行中">进行中 (Active)</option>
                        <option value="已达成">已达成 (Achieved)</option>
                        <option value="已失败">已失败 (Failed)</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">圣差天纲分类</span>
                      <select
                        value={newQuest.type}
                        onChange={(e) => setNewQuest(p => ({...p, type: e.target.value as any}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-[#dacfc5] block w-full cursor-pointer text-[10px]"
                      >
                        <option value="主线">主线大运</option>
                        <option value="支线政略">支线政略</option>
                        <option value="奇遇异闻">奇遇异闻</option>
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-gray-500 block text-[8.5px]">艰涉难度评级</span>
                      <input
                        type="text"
                        placeholder="难度评级,如 极难"
                        value={newQuest.difficulty}
                        onChange={(e) => setNewQuest(p => ({...p, difficulty: e.target.value}))}
                        className="bg-black border border-neutral-850 rounded p-1 text-white block w-full font-serif text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <input
                      type="text"
                      placeholder="达成恩赐奖励描述"
                      value={newQuest.reward}
                      onChange={(e) => setNewQuest(p => ({...p, reward: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-[#dacfc5] block w-full font-serif"
                    />
                    <input
                      type="text"
                      placeholder="失败民生惩戒说明"
                      value={newQuest.failurePenalty}
                      onChange={(e) => setNewQuest(p => ({...p, failurePenalty: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-rose-300 block w-full font-serif"
                    />
                  </div>

                  <div className="text-[10px] space-y-1">
                    <input
                      type="text"
                      placeholder="天命天诏详意详情描述"
                      value={newQuest.description}
                      onChange={(e) => setNewQuest(p => ({...p, description: e.target.value}))}
                      className="bg-black border border-neutral-850 rounded p-1 text-gray-400 block w-full"
                    />
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      onClick={handleAddQuest}
                      className="py-1 px-3 bg-purple-900 border border-purple-500 rounded text-white text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> 天敕登记
                    </button>
                  </div>
                </div>

                {/* Quests mapping list */}
                <div className="space-y-3.5 pr-1 text-[10.5px]">
                  {quests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((q, pagIdx) => {
                    const actualIdx = (currentPage - 1) * itemsPerPage + pagIdx;
                    return (
                      <div key={actualIdx} className="bg-neutral-900/40 border border-neutral-900 p-3 rounded-lg space-y-2 relative group hover:border-[#bfa15f]/45 transition">
                        <button
                          onClick={() => handleDeleteQuest(actualIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-300 opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer rounded"
                          title="废除天命"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <span className="text-gray-500 block text-[9px]">大运命题 Title:</span>
                            <input
                              type="text"
                              value={q.title}
                              onChange={(e) => handleQuestChange(actualIdx, "title", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-100 font-bold block w-full text-[10px]"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">圣差天纲分类:</span>
                            <select
                              value={q.type}
                              onChange={(e) => handleQuestChange(actualIdx, "type", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-[#dacfc5] block w-full cursor-pointer text-[10px]"
                            >
                              <option value="主线">主线</option>
                              <option value="支线">支线</option>
                              <option value="奇遇">奇遇</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px]">天威气盖进展:</span>
                            <select
                              value={q.status}
                              onChange={(e) => handleQuestChange(actualIdx, "status", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-teal-300 block w-full cursor-pointer text-[10px]"
                            >
                              <option value="进行中">进行中</option>
                              <option value="已达成">已达成</option>
                              <option value="已失败">已失败</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5px]">
                          <div>
                            <span className="text-gray-500 block">达成恩赐奖励 Reward:</span>
                            <input
                              type="text"
                              value={q.reward}
                              onChange={(e) => handleQuestChange(actualIdx, "reward", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-amber-300 block w-full"
                            />
                          </div>
                          <div>
                            <span className="text-gray-500 block">失败民生惩戒 Penalty:</span>
                            <input
                              type="text"
                              value={q.failurePenalty || ""}
                              onChange={(e) => handleQuestChange(actualIdx, "failurePenalty", e.target.value)}
                              className="bg-black border border-neutral-850 rounded p-1 text-red-300 block w-full"
                            />
                          </div>
                        </div>

                        <div className="text-[9.5px]">
                          <span className="text-gray-500 block">天诏细纲 description:</span>
                          <textarea
                            value={q.description}
                            onChange={(e) => handleQuestChange(actualIdx, "description", e.target.value)}
                            rows={1}
                            className="bg-black border border-neutral-850 rounded p-1 text-gray-300 block w-full text-[10px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderPagination(quests.length)}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
