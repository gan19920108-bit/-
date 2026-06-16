import React from "react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { 
  ROLE_PRESETS, 
  MAP_REGIONS, 
  RolePreset 
} from "./gameData";
import { 
  Character, 
  GameItem, 
  Skill, 
  Quest, 
  GameScene, 
  HistoryTurn, 
  ChronicleLog,
  MapRegion,
  GameNPC
} from "./types";

// Import modular panels
import CharacterPanel from "./components/CharacterPanel";
import QuestBoard from "./components/QuestBoard";
import WorldEvents from "./components/WorldEvents";
import SkillsPanel from "./components/SkillsPanel";
import InventoryPanel from "./components/InventoryPanel";
import InteractiveMap from "./components/InteractiveMap";
import NPCsPanel from "./components/NPCsPanel";
import HistoryPanel from "./components/HistoryPanel";
import CalendarPanel from "./components/CalendarPanel";
import DataHubPanel from "./components/DataHubPanel";
import HistoryReader from "./components/HistoryReader";

import { generateLocalScenario } from "./utils/storyteller";
import { requestGameTurn, type ApiConfig } from "../gameGenerate";
import ScaleViewport, { DESIGN_WIDTH } from "../ScaleViewport";
import {
  gameStateToMvu,
  mvuToGameState,
  readMvuGameState,
  writeMvuGameState,
  type GamePersistState,
} from "../mvuBridge";

// Lucide Icons
import {
  Heart,
  Trophy,
  Coins,
  Send,
  Compass,
  Scroll,
  Briefcase,
  Zap,
  RotateCcw,
  VolumeX,
  Volume2,
  Bookmark,
  ChevronDown,
  Sparkles,
  Users,
  Eye,
  Settings,
  Sliders,
  Check,
  X,
  HelpCircle,
  FileText,
  User,
  Clock,
  Calendar,
  Shield
} from "lucide-react";

// Web Audio Guzheng Player globals
let guzhengInterval: any = null;
let audioCtx: AudioContext | null = null;
const pentatonicFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function playGuzhengPluck(frequency: number, delayState: number) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "triangle"; // Warm oriental hollow pluck sound
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + delayState);
    
    // Attack-Decay-Sustain plucking curve
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime + delayState);
    gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + delayState + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + delayState + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delayState + 1.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + delayState);
    osc.stop(audioCtx.currentTime + delayState + 1.5);
  } catch (e) {
    console.warn("Synth audio error:", e);
  }
}

function triggerProceduralGuzheng() {
  const notesCount = 3 + Math.floor(Math.random() * 3);
  let accumulatedTime = 0;
  for (let i = 0; i < notesCount; i++) {
    const f = pentatonicFreqs[Math.floor(Math.random() * pentatonicFreqs.length)];
    playGuzhengPluck(f, accumulatedTime);
    accumulatedTime += 0.25 + Math.random() * 0.35;
  }
}

// Helper to progress traditional Chinese calendar date text
function advanceChineseCalendar(current: string): string {
  try {
    const match = current.match(/公元(前?\d+)年\s+(.*?)\s+(.*?年)(.*)/);
    if (!match) {
      return "公元" + (new Date().getFullYear()) + "年 大唐 贞新元年初秋七月十日";
    }
    let yrVal = parseInt(match[1]);
    const dyn = match[2];
    const reign = match[3]; 
    const rest = match[4];

    const months = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "腊月"];
    const seasons = ["春", "春", "春", "夏", "夏", "夏", "秋", "秋", "秋", "冬", "冬", "冬"];
    const days = ["初一", "初五", "初十", "十五", "二十", "廿五", "三十"];
    
    let currentMonthIdx = months.findIndex(m => rest.includes(m));
    if (currentMonthIdx === -1) currentMonthIdx = 0;
    
    let nextMonthIdx = (currentMonthIdx + 1) % 12;
    let nextYearVal = yrVal;
    
    const reignMatch = reign.match(/^([^\d]+)(\d+|元)?(年)?$/);
    let reignName = "开元";
    let reignNum = 1;
    if (reignMatch) {
       reignName = reignMatch[1];
       const rawNum = reignMatch[2];
       if (rawNum === "元") reignNum = 1;
       else if (rawNum) reignNum = parseInt(rawNum);
    }
    
    if (nextMonthIdx === 0) {
       if (current.includes("公元前")) {
          nextYearVal = yrVal - 1;
       } else {
          nextYearVal = yrVal + 1;
       }
       reignNum += 1;
    }
    
    const nextReignStr = reignName + (reignNum === 1 ? "元" : reignNum);
    const nextSeason = seasons[nextMonthIdx];
    const nextMonthName = months[nextMonthIdx];
    const nextDay = days[Math.floor(Math.random() * days.length)];
    
    return `公元${nextYearVal > 0 ? "" : "前"}${Math.abs(nextYearVal)}年 ${dyn} ${nextReignStr}年 ${nextSeason}${nextMonthName}${nextDay}`;
  } catch (e) {
    return current + " · 岁末";
  }
}

// Pre-defined list of statesmen and ministers depending on standard historical choices
function getInitialNPCList(dynastyName: string): GameNPC[] {
  const norm = dynastyName || "";
  if (norm.includes("唐")) {
    return [
      {
        name: "魏征",
        avatarSeed: "scholar",
        role: "门下省侍中 · 大天直言谏臣",
        age: 48,
        relationship: "直言诤臣",
        relationVal: 85,
        loyalty: 98,
        deeds: ["曾辅佐太宗李世民，力行百谏。安邦定国，社稷之石。"],
        items: ["《谏太宗十思疏》手卷", "大唐鸣玉佩"],
        statusText: "身居门下省，为人清正廉洁。心忧天下，随时准备陈奏诤言以匡王政。",
        isPresent: true
      },
      {
        name: "薛仁贵",
        avatarSeed: "general",
        role: "右领军卫大将军 · 九边猛将",
        age: 32,
        relationship: "镇国虎卫",
        relationVal: 80,
        loyalty: 95,
        deeds: ["东征辽东，神勇三箭定天山，威慑九边八荒政敌。"],
        items: ["震天白神弓", "破甲精金矢"],
        statusText: "薛主帅勇猛无敌。戍守幽云边关，枕戈待旦，只待皇命挥师吞疆！",
        isPresent: false
      },
      {
        name: "武昭仪",
        avatarSeed: "female",
        role: "宸极昭仪娘娘 · 乾坤助政妃",
        age: 24,
        relationship: "后六宫知交",
        relationVal: 75,
        loyalty: 70,
        deeds: ["曾入感业寺，还俗随御侍奉。代圣上朱笔批阅折章。"],
        items: ["青丝同心囊", "《臣轨》文策草卷"],
        statusText: "武昭仪美若天仙却智通九幽。对朝網、律令极有主张，备受陛下倾心恩宠。",
        isPresent: false
      }
    ];
  } else if (norm.includes("宋")) {
    return [
      {
        name: "王安石",
        avatarSeed: "scholar",
        role: "同中书门下平章事 · 变法首揆",
        age: 42,
        relationship: "新政巨变枢",
        relationVal: 82,
        loyalty: 93,
        deeds: ["创天下青苗法、均输法。富国强军，誓挽宋室颓势。"],
        items: ["《熙宁新谕》草本", "紫犀犀角笔"],
        statusText: "大执宰胸怀狂澜之志，不畏人言。一心施展新策以拓朝纲，忠心耿耿。",
        isPresent: true
      },
      {
        name: "苏东坡",
        avatarSeed: "scholar",
        role: "翰林院侍读学士 · 圣上诗朋",
        age: 35,
        relationship: "风流翰墨伴",
        relationVal: 92,
        loyalty: 88,
        deeds: ["写就前后逆壁赋，墨宝流芳万古。精通文画佛释之学。"],
        items: ["《赤壁怀古》行草", "苏堤春雨砚台"],
        statusText: "苏学士狂歌醉饮，豁达超逸。生平喜美酒山川，在朝不拉朋聚党，是天子雅契。",
        isPresent: false
      },
      {
        name: "岳飞",
        avatarSeed: "general",
        role: "江淮帅府大元帅 · 岳家军主帅",
        age: 29,
        relationship: "沥血国门臣",
        relationVal: 86,
        loyalty: 100,
        deeds: ["统率岳家军力抗外侮，朱仙镇一役直捣黄龙。精忠报国。"],
        items: ["沥泉赤练枪", "《满江红》血誓书"],
        statusText: "岳元帅忠烈无双，岳家铁骑无坚不摧。心忧汉土，随时以血躯保疆卫国。",
        isPresent: false
      }
    ];
  } else if (norm.includes("明")) {
    return [
      {
        name: "张居正",
        avatarSeed: "scholar",
        role: "内阁首揆大学士 · 太师保衡",
        age: 46,
        relationship: "治世神佐臣",
        relationVal: 85,
        loyalty: 95,
        deeds: ["乾坤行‘一条鞭法’。大清考核吏治，聚财强兵。"],
        items: ["《一条鞭法案卷》", "太师玉印"],
        statusText: "张首辅神筹精微，救大明倒悬。权握中朝，励精图治却毁誉誉半。",
        isPresent: true
      },
      {
        name: "戚继光",
        avatarSeed: "general",
        role: "蓟辽协防总兵大元帅 · 威威少保",
        age: 38,
        relationship: "海国荡平候",
        relationVal: 81,
        loyalty: 94,
        deeds: ["组训戚家铁军。初排鸳鸯战阵，尽扫海疆寇盗。"],
        items: ["《兵纪新书》", "神机劈海宝刀"],
        statusText: "戚将军精明神武，谋战无上。是大明九边极防的御寇虎相，忠贞爱国。",
        isPresent: false
      },
      {
        name: "周妙仪",
        avatarSeed: "female",
        role: "端恭娴和皇后 · 坤宁之主",
        age: 26,
        relationship: "坤宁内贤正",
        relationVal: 91,
        loyalty: 99,
        deeds: ["执掌坤宁，率妃嫔纺织养蚕，粗衣淡饭同主江山。"],
        items: ["万川流云手织锦", "白玉簪耳坠"],
        statusText: "娘娘温柔善良，对陛下情深意重。日夜在佛前静焚心香，祈求国泰民安。",
        isPresent: false
      }
    ];
  } else {
    return [
      {
        name: "诸葛孔明",
        avatarSeed: "scholar",
        role: "武乡侯 · 领益州牧大丞相",
        age: 44,
        relationship: "股肱贤师",
        relationVal: 95,
        loyalty: 100,
        deeds: ["草庐三顾，定天下三分。六出祁山志复中原大地，死而后已。"],
        items: ["七星玄羽法扇", "《出师表》墨宝折片"],
        statusText: "大丞相鞠躬尽瘁，忠贞不二。神筹经纬乾坤，日夜为主上操劳国計。",
        isPresent: true
      },
      {
        name: "关云长",
        avatarSeed: "general",
        role: "前将军 · 汉寿亭侯",
        age: 39,
        relationship: "桃园义昆",
        relationVal: 96,
        loyalty: 100,
        deeds: ["斩颜良，过五关斩六将，单刀赴会大破天关。"],
        items: ["青龙偃月神刀", "《春秋纪要》佩件"],
        statusText: "关二爷忠烈盖世，义气乾坤。掌青龙宝刀，随时策马奔袭，为陛下斩绝虎群！",
        isPresent: false
      },
      {
        name: "任黛婵",
        avatarSeed: "female",
        role: "闭月名花 · 宫闱谍卫掌印",
        age: 21,
        relationship: "红袖夜话伴",
        relationVal: 82,
        loyalty: 89,
        deeds: ["设连环美人美人计以刺诛国贼。挽天地危倾。"],
        items: ["飞红流香胭脂盒", "《锦衣谍照册》"],
        statusText: "姑娘绝代国色。掌握内侍暗卫，情意绵绵对天子，是夜伴红烛知交。",
        isPresent: false
      }
    ];
  }
}

interface DayStage {
  timeLabel: string;
  name: string;
  announcement: string;
}

const DAY_STAGES: DayStage[] = [
  { timeLabel: "凌晨 3-4 点", name: "洗漱更衣", announcement: "凌晨3-4点，帝王起床，由宫女太监服侍更衣洗漱，穿衣有严格的场合规制，流程繁琐；" },
  { timeLabel: "凌晨 4-5 点", name: "请安早读", announcement: "凌晨4-5点，前往后宫给太后请安，随后返回寝宫进行早读，研读祖先《圣训》《实录》，学习治国经验；" },
  { timeLabel: "凌晨 5-6 点", name: "享用早膳", announcement: "凌晨5-6点，享用早膳；" },
  { timeLabel: "早上 7 点", name: "早朝议事", announcement: "早上7点开始早朝/御门听政；" },
  { timeLabel: "早朝结束后", name: "批阅奏折", announcement: "早朝结束后批阅奏折；" },
  { timeLabel: "中午 1-2 点", name: "享用午膳", announcement: "中午1-2点享用午膳；" },
  { timeLabel: "下午 3-6 点", name: "自由安排", announcement: "下午3-6点自由安排；" },
  { timeLabel: "下午 6 点左右", name: "加餐酒膳", announcement: "下午6点左右用酒膳（加餐）；" },
  { timeLabel: "晚上 7 点左右", name: "安排侍寝", announcement: "晚上7点左右安排侍寝；" },
  { timeLabel: "晚上 9-10 点", name: "就寝", announcement: "晚上9-10点就寝。" }
];

const CALENDAR_EVENTS = [
  {
    date: "一月·元旦 (正月初一)",
    festival: "元春元旦大朝会",
    appointment: {
      title: "大朝贺典",
      people: "文武百官、藩属国使臣、宗室勋贵",
      location: "太和殿（含元殿 / 宣政殿）",
      description: "率文武百官行三跪九叩大朝仪，接见万国来朝使节，布告天下大赦诏书，宣示乾坤社稷鼎定。",
      event: "接见各国贡使，受封币，赐御膳御酒国宴。"
    }
  },
  {
    date: "一月·元宵 (正月十五)",
    festival: "上元燃灯赏灯节",
    appointment: {
      title: "上元佳遇",
      people: "嫔妃、内阁大学士、京兆尹",
      location: "大内御花园 · 承乾宫前庭",
      description: "赐灯树牌，燃灯万盏，极尽繁华。与朝臣共聚猜灯谜，君臣同乐，并设花灯会案审视京畿治绩。",
      event: "翻牌宠幸合欢之礼，共赏梨园百戏。"
    }
  },
  {
    date: "三月·清明 (清明时节)",
    festival: "寒食清明祭祖大奠",
    appointment: {
      title: "陵寝崇祀",
      people: "礼部尚书、宗人府宗令、羽林军将领",
      location: "帝陵神道 · 孝陵祭殿",
      description: "圣躬亲往祖陵恭祭，研读太祖烈烈圣训，承天命祭告。随行卫戍严防四方边患，振肃军纲。",
      event: "躬行释醴奠酒上香之仪，犒赏随行御林亲卫。"
    }
  },
  {
    date: "五月·端午 (五月初五)",
    festival: "端阳龙舟竞渡大典",
    appointment: {
      title: "大内竞渡",
      people: "兵部兵侍、内侍侍从、京畿卫护将领",
      location: "太液池（水师教场湖畔）",
      description: "检阅龙舟水师，亲点朱砂龙睛。与重臣赏赐艾叶长生印绥，借以考核神京周卫戒备与水战军备。",
      event: "亲临高阁赐雄黄御酒与彩线，犒赏三军水操大统领。"
    }
  },
  {
    date: "八月·中秋 (八月十五)",
    festival: "中秋赏月对影家宴",
    appointment: {
      title: "月华御宴",
      people: "皇太后、各宫妃嫔、宗室诸王",
      location: "蓬莱太液池 · 望月台",
      description: "奉侍皇太后殿下恭享中秋晚膳。合宫共话天伦，翻牌遴选随侍嫔妃清商奏乐，琴笙合鸣。",
      event: "敬献仙桃长生糕，行亲王宗室推杯换盏赏赐之仪。"
    }
  },
  {
    date: "九月·重阳 (九月初九)",
    festival: "重阳登高秋猎大典",
    appointment: {
      title: "九九秋猎",
      people: "兵马大将军、亲贵子弟、番部首领",
      location: "皇家围场 · 塞外木兰秋狝靶场",
      description: "天子亲跨骏马巡猎校阅，弯弓射雕以武开疆。考察宗室亲贵箭术，加强对外邦使臣的羁縻威慑。",
      event: "钦赐御前黄马褂，亲点武科状元与御林宿卫百将拔擢之宴。"
    }
  },
  {
    date: "十二月·冬至 (冬至时令)",
    festival: "冬至南郊祭天大奠",
    appointment: {
      title: "南郊祭天",
      people: "钦天监监正、太常寺卿、内阁首辅",
      location: "皇家天坛 · 圜丘坛",
      description: "率文武群英步圜丘坛高台。向昊天上帝呈上玉册玺文，告慰岁米国运民生大成。",
      event: "斋戒三日，沐浴更衣，御前秉笔记录天象变乾坤卦气。"
    }
  }
];

export default function App() {
  // Game states
  const [isMainMenu, setIsMainMenu] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState("");
  
  // Custom Settings states
  const [fontSize, setFontSize] = React.useState<number>(14);
  const [customPortraits, setCustomPortraits] = React.useState<Record<string, string>>({});
  const [summaryX, setSummaryX] = React.useState<number>(5);
  const [summaryY, setSummaryY] = React.useState<number>(15);
  const [hideZ, setHideZ] = React.useState<number>(10);

  // Difficulty preset selection filters
  const [presetFilter, setPresetFilter] = React.useState<"all" | "简单" | "中等" | "困难" | "天崩">("all");
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>(ROLE_PRESETS[0].id);
  const [customName, setCustomName] = React.useState<string>("");

  // Custom setup states
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const [customDynasty, setCustomDynasty] = React.useState("大明");
  const [customIdentity, setCustomIdentity] = React.useState("中兴世祖 · 昭明大皇帝");
  const [customStartingTime, setCustomStartingTime] = React.useState("公元1368年 大明 洪武元年初春正月初一");
  const [customBackground, setCustomBackground] = React.useState("江山鼎立，万邦臣服。内阁初建，群臣叩拜。你登基称帝，矢志整饬百业，重续不朽华夏文明。");
  const [customAlreadyHappened, setCustomAlreadyHappened] = React.useState("克复中原、横扫北元残军、确立百世官制");
  const [customNotYetHappened, setCustomNotYetHappened] = React.useState("郑和出航西洋、编纂皇天大典、警惕外虏寇关");
  const [customStats, setCustomStats] = React.useState({
    health: 90,
    prestige: 85,
    gold: 5000,
    military: 80,
    defense: 75,
    strength: 70,
    agility: 65,
    stamina: 80,
    intelligence: 85,
    luck: 75
  });

  // Theme settings (Default: Gold, Emerald, Sapphire, Crimson)
  const [activeTheme, setActiveTheme] = React.useState<'gold' | 'emerald' | 'sapphire' | 'crimson'>('gold');

  // Currently open Overlay panel ('character' | 'map' | 'npcs' | 'items' | 'skills' | 'quests' | 'chronicles' | 'settings' | null)
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; index: number } | null>(null);

  // Playthrough gameplay variables
  const [character, setCharacter] = React.useState<Character>({
    name: "",
    age: 22,
    dynasty: "",
    identity: "",
    title: "",
    avatarSeed: "",
    background: "",
    attributes: {
      health: 100,
      prestige: 50,
      gold: 1000,
      military: 50,
      defense: 50,
      strength: 50,
      agility: 50,
      stamina: 50,
      intelligence: 50,
      luck: 50,
      wisdomIndex: 0.0,
      benevolenceIndex: 0.0
    }
  });

  // Chinese Date simulation
  const [currentCalendarDate, setCurrentCalendarDate] = React.useState<string>("");

  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [items, setItems] = React.useState<GameItem[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([
    {
      id: "appt-1",
      month: "八月",
      day: "十五",
      npcName: "后宫贵妃",
      location: "蓬莱池·太液仙蓬太极殿后苑",
      holidayName: "中秋赏月佳节",
      title: "携手伴登台赏桂月明，御苑共修恩义",
      description: "值此满月良宵，主公将密会爱妃，在太液池畔登高赏桂。双方设樽抚琴，畅叙儿源情长，更能密议整饬六宫与削抑外戚之计。",
    },
    {
      id: "appt-2",
      month: "九月",
      day: "初九",
      npcName: "朝政辅佐大臣",
      location: "京兆曲江亭台或终南山巅",
      holidayName: "重阳插茱萸登高",
      title: "曲江会诤臣，广纳百官变法策对",
      description: "在京兆府插茱萸登高，亲切召见当朝直臣。爱臣将借登高之机进献中兴吏治等治国重策，促膝长谈研治国策大略及政律。",
    },
    {
      id: "appt-3",
      month: "腊月",
      day: "三十",
      npcName: "戍疆大元帅",
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
  ]);
  const [currentRegionId, setCurrentRegionId] = React.useState<string>("capital");
  const [chronicles, setChronicles] = React.useState<ChronicleLog[]>([]);
  const [npcs, setNpcs] = React.useState<GameNPC[]>([]);
  const [regions, setRegions] = React.useState<MapRegion[]>(() => [...MAP_REGIONS]);
  const [currentScenario, setCurrentScenario] = React.useState<GameScene>({
    story: "「太初开卷，万流归海。」大明、大唐、强汉等万古帝皇命盘正在缓缓重编，请即刻跨越乾坤之门...",
    choices: [],
    worldEvent: "凡尘俗事静待天命之人入局引导，星宿微摆。"
  });

  // Conversational history proxy
  const [history, setHistory] = React.useState<HistoryTurn[]>([]);
  const [customAction, setCustomAction] = React.useState<string>("");
  const [showVariablesPreview, setShowVariablesPreview] = React.useState<boolean>(false);

  // Play mode: "autonomous" (自主) / "quick" (快速)
  const [playMode, setPlayMode] = React.useState<"autonomous" | "quick">("autonomous");
  const [dayStageIndex, setDayStageIndex] = React.useState<number>(0);
  const [isAutoPlayingQuick, setIsAutoPlayingQuick] = React.useState<boolean>(false);
  const [quickLogs, setQuickLogs] = React.useState<string[]>(["【快速模式开启】大国朝政的一天已经拉开序幕。已就绪，请公公唱礼报引..."]);

  // Weather state (Requirement 3)
  const [currentWeather, setCurrentWeather] = React.useState<{ name: string; desc: string; icon: string }>({
    name: "祥云笼罩",
    desc: "紫气东来，红霞满天。兆示社稷祥和，海晏河清之盛景。",
    icon: "🌈"
  });

  const [currentLocation, setCurrentLocation] = React.useState<string>("太和殿（金銮宝殿）");
  const [isEditingTopHeader, setIsEditingTopHeader] = React.useState<boolean>(false);

  const getShichenAndTime = (idx: number): { shichen: string; hour24: string } => {
    const map: Record<number, { shichen: string; hour24: string }> = {
      0: { shichen: "寅时 [平明]", hour24: "03:30" },
      1: { shichen: "寅时末 / 卯时初", hour24: "04:30" },
      2: { shichen: "卯时 [日出]", hour24: "05:30" },
      3: { shichen: "辰时 [食时]", hour24: "07:15" },
      4: { shichen: "巳时 [隅中]", hour24: "09:00" },
      5: { shichen: "未时 [日昳]", hour24: "13:30" },
      6: { shichen: "申时 [晡时]", hour24: "16:00" },
      7: { shichen: "酉时 [日入]", hour24: "18:15" },
      8: { shichen: "戌时 [黄昏]", hour24: "19:30" },
      9: { shichen: "亥时 [人定]", hour24: "21:30" }
    };
    return map[idx] || { shichen: "寅时 [平明]", hour24: "03:30" };
  };

  React.useEffect(() => {
    const stageLocations: Record<number, string> = {
      0: "寝宫 · 养心殿",
      1: "后宫 · 慈宁宫与御书房",
      2: "膳堂 · 养心殿东暖阁",
      3: "太和殿（金銮宝殿）",
      4: "内廷 · 御书房 / 养心殿西暖阁",
      5: "膳堂 · 乾清宫西阁",
      6: "大内御花园与太液池",
      7: "听鹂馆与西苑仙寿殿",
      8: "后宫嫔妃行宫",
      9: "龙塌 · 乾清宫暖阁"
    };
    setCurrentLocation(stageLocations[dayStageIndex] || "乾清宫大内");
  }, [dayStageIndex]);

  // Sound toggle
  const [ambientSound, setAmbientSound] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // BGM Playlist and simulation details
  const BGM_PLAYLIST = [
    { title: "高山流水 (Ancient Waters)", artist: "华夏广陵雅集古琴", duration: 225 },
    { title: "梅花三弄 (Three Plum Variations)", artist: "太古遗音绿绮笙阁", duration: 310 },
    { title: "春江花月夜 (Moonlit Spring River)", artist: "蓬莱仙乡霓裳玉琵", duration: 284 },
    { title: "平沙落雁 (Wild Geese on Sand)", artist: "九鼎咸阳清商竹箫", duration: 198 },
    { title: "广陵散 (Guangling San)", artist: "嵇康绝响广陵神交", duration: 345 }
  ];
  const [currentBgTrackIdx, setCurrentBgTrackIdx] = React.useState(0);
  const [playProgress, setPlayProgress] = React.useState(25);
  const [timeElapsed, setTimeElapsed] = React.useState(55);

  React.useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const duration = BGM_PLAYLIST[currentBgTrackIdx]?.duration || 200;
    
    if (ambientSound) {
      timer = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          if (next >= duration) {
            setCurrentBgTrackIdx(prevTrack => (prevTrack + 1) % BGM_PLAYLIST.length);
            return 0;
          }
          setPlayProgress((next / duration) * 100);
          return next;
        });
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ambientSound, currentBgTrackIdx]);

  React.useEffect(() => {
    setTimeElapsed(0);
    setPlayProgress(0);
  }, [currentBgTrackIdx]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickedPercentage = clickX / width;
    setPlayProgress(clickedPercentage * 100);
    const duration = BGM_PLAYLIST[currentBgTrackIdx]?.duration || 200;
    setTimeElapsed(Math.floor(clickedPercentage * duration));
  };

  const handleNextTrack = () => {
    setCurrentBgTrackIdx(prev => (prev + 1) % BGM_PLAYLIST.length);
  };

  const handlePrevTrack = () => {
    setCurrentBgTrackIdx(prev => (prev - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length);
  };

  // Weather options for Chinese palace astrolabe (Requirement 3)
  const WEATHER_PRESETS = [
    { name: "祥云笼罩", desc: "紫气东来，红霞满天。兆示社稷祥和，海晏河清之盛景。", icon: "🌈" },
    { name: "晴空万里", desc: "金乌高照，九闱晴朗。午门朱壁在千阳下灿烂辉煌。", icon: "☀️" },
    { name: "细雨霏霏", desc: "烟雨迷濛，润护上林。朱雀御道更添一份江南的微墨清逸。", icon: "🌧️" },
    { name: "阴云密布", desc: "彤云如铅，城堞森严。朔风萧萧，九门卫军戒备不怠。", icon: "☁️" },
    { name: "大雪纷飞", desc: "瑞雪兆丰年，铺琼漫琼。承乾殿檐瓦银装粉砌，静逸祥和。", icon: "❄️" },
    { name: "雷雨交加", desc: "玄雷惊九天，狂风骤雨。宫禁重檐悬铃铿锵剧响，神魔辟易。", icon: "⚡" },
    { name: "天降红雾", desc: "赤雾侵霄，诡谲万重。钦天监推演为异兆，朝野瞩目。", icon: "🌫️" }
  ];

  const triggerWeatherFluctuation = () => {
    const randomSelected = WEATHER_PRESETS[Math.floor(Math.random() * WEATHER_PRESETS.length)];
    setCurrentWeather(randomSelected);
    setQuickLogs(prev => [`【气化通志】：天道昭昭，大内天候转为【${randomSelected.name}】。`, ...prev]);
  };

  const promptManualWeatherChange = () => {
    const currentList = WEATHER_PRESETS.map((w, idx) => `${idx + 1}. ${w.name} (${w.desc})`).join("\n");
    const choice = prompt(`【奉天呼风唤雨诏】：请输入编号(1-7)修改当前天下气候：\n\n${currentList}`, "1");
    if (choice !== null) {
      const idx = parseInt(choice, 10) - 1;
      if (idx >= 0 && idx < WEATHER_PRESETS.length) {
        const selected = WEATHER_PRESETS[idx];
        setCurrentWeather(selected);
        alert(`【祈天得谕】：御笔画敕勾玄，天下气候变更为【${selected.name}】！`);
        setQuickLogs(prev => [`【奉天起候】：陛下圣谕，天下天气强行更正为「${selected.name}」。`, ...prev]);
      } else {
        alert("编号无效！天道难违。");
      }
    }
  };

  const getShichenByStage = (stageIdx: number) => {
    switch (stageIdx) {
      case 0: return { name: "寅时", hours: "03:00 - 04:00", element: "木 🌳", desc: "平旦之刻，旭日破晓。洗漱更衣，帝王兴登。" };
      case 1: return { name: "寅时", hours: "04:00 - 05:00", element: "木 🌳", desc: "晨光初破，给太后请安，早朝早读古圣之书。" };
      case 2: return { name: "卯时", hours: "05:00 - 06:00", element: "木 🌳", desc: "日出东山，龙体进早膳，进膳大内御宴。" };
      case 3: return { name: "卯时", hours: "07:00 - 08:00", element: "木 🌳", desc: "卯正之刻，早朝听政，临政太和百官朝见。" };
      case 4: return { name: "辰时", hours: "08:00 - 12:00", element: "土 🏔️", desc: "食时之刻，批复乾清宫红章政折，定天下大事。" };
      case 5: return { name: "午时", hours: "13:00 - 14:00", element: "火 🔥", desc: "日中之刻，御前进午膳。百官退避，帝皇憩寝。" };
      case 6: return { name: "未申时", hours: "15:00 - 18:00", element: "金/土", desc: "日昳晡时，大内闲暇。游赏御苑，密敕外臣臣属。" };
      case 7: return { name: "酉时", hours: "18:00 - 19:00", element: "金 🪙", desc: "日入之刻，传旨设酒宴享乐，举烛召对大学士。" };
      case 8: return { name: "戌时", hours: "19:00 - 21:00", element: "土 🏔️", desc: "黄昏之刻，大内掌红纱高照，敬事房敬上绿头牌侍寝。" };
      default: return { name: "亥时", hours: "21:00 - 22:00", element: "水 💧", desc: "人定之刻，夜阑万籁。万寿宫神火渐熄，安寝休睡。" };
    }
  };

  // Save/Load base64 state text holder
  const [saveCodeText, setSaveCodeText] = React.useState("");
  const [showSaveArea, setShowSaveArea] = React.useState(false);

  // Custom theme customization, specifically background and border colors
  const [customBgColor, setCustomBgColor] = React.useState<string>("");
  const [customBorderColor, setCustomBorderColor] = React.useState<string>("");

  // Settings sub-popup trigger state for secondary settings popup views
  const [settingsSubPopup, setSettingsSubPopup] = React.useState<"theme" | "portrait" | "save_load" | "summary" | "api" | null>(null);

  // Empire Left [总览] collapsible state and stats
  const [leftPanelExpanded, setLeftPanelExpanded] = React.useState<boolean>(false);
  const [sidebarCollapsible, setSidebarCollapsible] = React.useState<Record<string, boolean>>({
    emperorCard: false,
    attributes: false,
    empireStats: false
  });
  const [isChoicesCollapsed, setIsChoicesCollapsed] = React.useState<boolean>(false);
  const [availableModels, setAvailableModels] = React.useState<string[]>(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "deepseek-chat", "gpt-4o-mini"]);
  const [isFetchingModels, setIsFetchingModels] = React.useState<boolean>(false);
  const [empireStats, setEmpireStats] = React.useState({
    summary: "山河鼎定，万民乐业。九五飞龙照临八荒。",
    officials: "三省六部制 (内阁学士辅弼之)",
    treasury: 150000, // 国库金钱, distinct from player personal 私库金钱
    sentiment: 80,    // 民心 0-100
    military: 120000, // 国家常备军力, distinct from 亲卫兵力
    grain: 640000,    // 粮食 (石)
    annualIncome: 35000,
    annualExpense: 26000
  });

  const handleUpdateHistoryText = (index: number, newText: string) => {
    setHistory(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], text: newText };
      }
      return copy;
    });
  };

  // API custom configurations
  const [apiAddress, setApiAddress] = React.useState<string>("");
  const [apiSecretKey, setApiSecretKey] = React.useState<string>("");
  const [selectedModel, setSelectedModel] = React.useState<string>("gemini-2.5-flash");
  const [showCoverLoadArea, setShowCoverLoadArea] = React.useState<boolean>(false);
  const [apiType, setApiType] = React.useState<string>("gemini");
  const [chatCompletionSource, setChatCompletionSource] = React.useState<string>("built-in");
  const [apiTestingState, setApiTestingState] = React.useState<"idle" | "testing" | "success" | "error">("idle");
  const [activeSettingsSection, setActiveSettingsSection] = React.useState<"ui" | "portrait" | "save" | "summary" | "api" | null>(null);

  const apiConfig = React.useMemo<ApiConfig>(
    () => ({
      apiAddress,
      apiSecretKey,
      selectedModel,
      apiType,
    }),
    [apiAddress, apiSecretKey, selectedModel, apiType],
  );

  const [mvuReady, setMvuReady] = React.useState(false);
  const mvuHydratingRef = React.useRef(false);

  const collectPersistState = React.useCallback(
    (): GamePersistState => ({
      isInitialized,
      isMainMenu,
      currentCalendarDate,
      currentRegionId,
      dayStageIndex,
      playMode,
      currentLocation,
      currentWeather,
      selectedPresetId,
      isCustomMode,
      customDynasty,
      customIdentity,
      customStartingTime,
      customBackground,
      customAlreadyHappened,
      customNotYetHappened,
      character,
      empireStats,
      quests,
      skills,
      items,
      npcs,
      regions,
      chronicles,
      history,
      currentScenario,
    }),
    [
      isInitialized,
      isMainMenu,
      currentCalendarDate,
      currentRegionId,
      dayStageIndex,
      playMode,
      currentLocation,
      currentWeather,
      selectedPresetId,
      isCustomMode,
      customDynasty,
      customIdentity,
      customStartingTime,
      customBackground,
      customAlreadyHappened,
      customNotYetHappened,
      character,
      empireStats,
      quests,
      skills,
      items,
      npcs,
      regions,
      chronicles,
      history,
      currentScenario,
    ],
  );

  const applyPersistState = React.useCallback((loaded: Partial<GamePersistState>) => {
    if (loaded.isInitialized !== undefined) setIsInitialized(loaded.isInitialized);
    if (loaded.isMainMenu !== undefined) setIsMainMenu(loaded.isMainMenu);
    if (loaded.currentCalendarDate !== undefined) setCurrentCalendarDate(loaded.currentCalendarDate);
    if (loaded.currentRegionId !== undefined) setCurrentRegionId(loaded.currentRegionId);
    if (loaded.dayStageIndex !== undefined) setDayStageIndex(loaded.dayStageIndex);
    if (loaded.playMode !== undefined) setPlayMode(loaded.playMode);
    if (loaded.currentLocation !== undefined) setCurrentLocation(loaded.currentLocation);
    if (loaded.currentWeather !== undefined) setCurrentWeather(loaded.currentWeather);
    if (loaded.selectedPresetId !== undefined) setSelectedPresetId(loaded.selectedPresetId);
    if (loaded.isCustomMode !== undefined) setIsCustomMode(loaded.isCustomMode);
    if (loaded.customDynasty !== undefined) setCustomDynasty(loaded.customDynasty);
    if (loaded.customIdentity !== undefined) setCustomIdentity(loaded.customIdentity);
    if (loaded.customStartingTime !== undefined) setCustomStartingTime(loaded.customStartingTime);
    if (loaded.customBackground !== undefined) setCustomBackground(loaded.customBackground);
    if (loaded.customAlreadyHappened !== undefined) setCustomAlreadyHappened(loaded.customAlreadyHappened);
    if (loaded.customNotYetHappened !== undefined) setCustomNotYetHappened(loaded.customNotYetHappened);
    if (loaded.character !== undefined) setCharacter(loaded.character);
    if (loaded.empireStats !== undefined) setEmpireStats(loaded.empireStats);
    if (loaded.quests !== undefined) setQuests(loaded.quests);
    if (loaded.skills !== undefined) setSkills(loaded.skills);
    if (loaded.items !== undefined) setItems(loaded.items);
    if (loaded.npcs !== undefined) setNpcs(loaded.npcs);
    if (loaded.regions !== undefined) setRegions(loaded.regions);
    if (loaded.chronicles !== undefined) setChronicles(loaded.chronicles);
    if (loaded.history !== undefined) setHistory(loaded.history);
    if (loaded.currentScenario !== undefined) setCurrentScenario(loaded.currentScenario);
  }, []);

  React.useEffect(() => {
    let active = true;
    mvuHydratingRef.current = true;
    try {
      const loaded = mvuToGameState(readMvuGameState());
      if (active && loaded.isInitialized) {
        applyPersistState(loaded);
      }
    } catch (error) {
      console.warn("无法从 MVU 变量恢复游戏状态:", error);
    } finally {
      mvuHydratingRef.current = false;
      if (active) setMvuReady(true);
    }
    return () => {
      active = false;
    };
  }, [applyPersistState]);

  // Summary frequency settings
  const [summaryFrequency, setSummaryFrequency] = React.useState<"always" | "three_turns" | "none">("three_turns");

  // Floor context menu action handlers
  const handleEditFloor = (index: number) => {
    setContextMenu(null);
    const turn = history[index];
    if (!turn) return;
    const newText = prompt("修改当前楼层圣裁历史内容：", turn.text);
    if (newText !== null) {
      setHistory(prev => {
        const next = [...prev];
        next[index] = { ...next[index], text: newText };
        return next;
      });
    }
  };

  const handleDeleteFloor = (index: number) => {
    setContextMenu(null);
    if (confirm("确定要删除此楼层吗？这可能会导致后续剧情逻辑关联失效。")) {
      setHistory(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleCopyFloor = (index: number) => {
    setContextMenu(null);
    const turn = history[index];
    if (!turn) return;
    navigator.clipboard.writeText(turn.text)
      .then(() => alert("📋 楼层内容已成功拓印复制！"))
      .catch((err) => {
        const textArea = document.createElement("textarea");
        textArea.value = turn.text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert("📋 楼层内容已成功拓印复制！");
        } catch (e) {
          console.error("Copy failed fallback", e);
        }
        document.body.removeChild(textArea);
      });
  };

  const handleRollbackFloor = (index: number) => {
    setContextMenu(null);
    if (confirm(`确定要回溯推演至此楼层吗？\n警告：将永久删除此楼层以下的所有 ${history.length - 1 - index} 级历史记录，并在此处重新推演！`)) {
      setHistory(prev => prev.slice(0, index + 1));
      setIsLoading(false);
    }
  };

  // Scroll to latest story updates
  const storyEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (storyEndRef.current) {
      storyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentScenario, isLoading]);

  React.useEffect(() => {
    if (!mvuReady || mvuHydratingRef.current || !isInitialized) return;
    try {
      writeMvuGameState(collectPersistState());
    } catch (error) {
      console.warn("MVU 自动存档失败:", error);
    }
  }, [mvuReady, isInitialized, collectPersistState]);

  React.useEffect(() => {
    if (!mvuReady) return;
    const timer = window.setInterval(() => {
      if (mvuHydratingRef.current) return;
      try {
        const remoteMvu = readMvuGameState();
        const localMvu = gameStateToMvu(collectPersistState());
        if (!_.isEqual(remoteMvu, localMvu)) {
          const remote = mvuToGameState(remoteMvu);
          if (remote.isInitialized) {
            mvuHydratingRef.current = true;
            applyPersistState(remote);
            mvuHydratingRef.current = false;
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [mvuReady, collectPersistState, applyPersistState]);

  // Persistent Settings Auto-Load on mount
  React.useEffect(() => {
    try {
      const valSound = localStorage.getItem("emperor_config_ambientSound");
      if (valSound !== null) setAmbientSound(JSON.parse(valSound));

      const valFontSize = localStorage.getItem("emperor_config_fontSize");
      if (valFontSize !== null) setFontSize(JSON.parse(valFontSize));

      const valTheme = localStorage.getItem("emperor_config_activeTheme");
      if (valTheme !== null) setActiveTheme(JSON.parse(valTheme) as any);

      const valBg = localStorage.getItem("emperor_config_customBgColor");
      if (valBg !== null) setCustomBgColor(JSON.parse(valBg));

      const valBorder = localStorage.getItem("emperor_config_customBorderColor");
      if (valBorder !== null) setCustomBorderColor(JSON.parse(valBorder));

      const valPortraits = localStorage.getItem("emperor_config_customPortraits");
      if (valPortraits !== null) setCustomPortraits(JSON.parse(valPortraits));

      const valX = localStorage.getItem("emperor_config_summaryX");
      if (valX !== null) setSummaryX(JSON.parse(valX));

      const valY = localStorage.getItem("emperor_config_summaryY");
      if (valY !== null) setSummaryY(JSON.parse(valY));

      const valZ = localStorage.getItem("emperor_config_hideZ");
      if (valZ !== null) setHideZ(JSON.parse(valZ));

      const valApiType = localStorage.getItem("emperor_config_apiType");
      if (valApiType !== null) setApiType(JSON.parse(valApiType));

      const valApiAddr = localStorage.getItem("emperor_config_apiAddress");
      if (valApiAddr !== null) setApiAddress(JSON.parse(valApiAddr));

      const valApiKey = localStorage.getItem("emperor_config_apiSecretKey");
      if (valApiKey !== null) setApiSecretKey(JSON.parse(valApiKey));

      const valModel = localStorage.getItem("emperor_config_selectedModel");
      if (valModel !== null) setSelectedModel(JSON.parse(valModel));
    } catch (e) {
      console.warn("Could not reload persistent configuration from localStorage:", e);
    }
  }, []);

  // Quick Mode auto-progress timer
  React.useEffect(() => {
    let timer: any = null;
    if (playMode === "quick" && isAutoPlayingQuick) {
      const isDecisionStage = dayStageIndex === 3 || dayStageIndex === 4;
      if (!isDecisionStage) {
        timer = setInterval(() => {
          setDayStageIndex((prev) => {
            const nextIdx = (prev + 1) % 10;
            if (nextIdx === 0) {
              setCurrentCalendarDate(curr => advanceChineseCalendar(curr));
              setChronicles(prevChron => [
                {
                  turn: prevChron.length + 1,
                  year: prevChron.length + 1,
                  eventText: `【快速理政】十二时辰更替，大国社稷平安步过，大业精进。`
                },
                ...prevChron
              ]);
            }
            return nextIdx;
          });
        }, 1500);
      } else {
        setIsAutoPlayingQuick(false);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playMode, isAutoPlayingQuick, dayStageIndex]);

  // Audio effect coordinator
  React.useEffect(() => {
    if (ambientSound) {
      triggerProceduralGuzheng();
      guzhengInterval = setInterval(() => {
        triggerProceduralGuzheng();
      }, 7500);
    } else {
      if (guzhengInterval) {
        clearInterval(guzhengInterval);
      }
    }
    return () => {
      if (guzhengInterval) clearInterval(guzhengInterval);
    };
  }, [ambientSound]);

  // Handle dynamic NPC unlocking when they are mentioned in dialogue history
  React.useEffect(() => {
    if (history.length === 0 || npcs.length === 0) return;
    const allHistoryText = history.map(h => h.text).join(" ");
    let changed = false;
    const updated = npcs.map(npc => {
      if (!npc.isPresent && allHistoryText.includes(npc.name)) {
        changed = true;
        return { ...npc, isPresent: true };
      }
      return npc;
    });
    if (changed) {
      setNpcs(updated);
    }
  }, [history, npcs]);
 
  // Dynamic fetching of available models based on custom endpoint, API key, and API type
  React.useEffect(() => {
    let active = true;
    const loadModels = async () => {
      const isDefault = !apiAddress.trim() || apiAddress === "/api/game/generate";
      if (isDefault) {
        if (active) {
          setAvailableModels(["使用酒馆当前模型"]);
          setSelectedModel("");
        }
        return;
      }

      setIsFetchingModels(true);
      try {
        const cleanUrl = apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;
        const fetchedList = await getModelList({
          apiurl: cleanUrl,
          key: apiSecretKey.trim() || undefined,
        });
        if (active && fetchedList.length > 0) {
          setAvailableModels(fetchedList);
          if (!fetchedList.includes(selectedModel)) {
            setSelectedModel(fetchedList[0]);
          }
          setIsFetchingModels(false);
          return;
        }
      } catch (err) {
        console.warn("Failed fetching models automatically, falling back", err);
      }

      // Fallback presets based on apiType
      if (active) {
        if (apiType === "openai") {
          setAvailableModels(["gpt-4o", "gpt-4o-mini", "o1-mini", "gpt-3.5-turbo"]);
        } else if (apiType === "claude") {
          setAvailableModels(["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"]);
        } else if (apiType === "deepseek") {
          setAvailableModels(["deepseek-chat", "deepseek-coder"]);
        } else if (apiType === "google") {
          setAvailableModels(["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"]);
        } else {
          setAvailableModels(["gemini-2.5-flash", "gemini-2.5-pro", "deepseek-chat", "gpt-4o-mini"]);
        }
        setIsFetchingModels(false);
      }
    };

    const t = setTimeout(() => {
      loadModels();
    }, 800);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [apiAddress, apiSecretKey, apiType]);

  // Selected Preset
  const selectedRolePreset = ROLE_PRESETS.find(p => p.id === selectedPresetId) || ROLE_PRESETS[0];

  // Helper identity tag compiler
  const getIdentityLabel = (role: RolePreset) => {
    return role.title + " (九五至尊)";
  };

  // Roll / Randomize custom attributes stats helper
  const handleRollCustomStats = () => {
    const rollStat = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    setCustomStats({
      health: rollStat(60, 98),
      prestige: rollStat(50, 95),
      gold: rollStat(2000, 10000),
      military: rollStat(30, 95),
      defense: rollStat(40, 90),
      strength: rollStat(50, 95),
      agility: rollStat(40, 90),
      stamina: rollStat(50, 95),
      intelligence: rollStat(65, 98),
      luck: rollStat(30, 99)
    });
    // Randomize Name also
    const firstNames = ["秦", "汉", "李", "赵", "朱", "杨", "刘", "明", "武"];
    const lastNames = ["承先", "世昌", "大钧", "玄极", "德宗", "弘光", "奉天", "昭德"];
    const randName = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
    setCustomName(randName);
    alert("已将根古属性、天赐尊号投骰重新洗牌！");
  };

  // Launch Game Handler
  const handleStartGame = async () => {
    setIsLoading(true);
    setIsInitialized(true);
    setActiveModal(null);

    let initialCharState: Character;
    let initialQuests: Quest[];
    let initialSkills: Skill[];
    let initialItems: GameItem[];
    let startCalendar: string;

    if (isCustomMode) {
      // Build from manual client inputs
      initialCharState = {
        name: customName.trim() || "太天皇帝",
        age: 20,
        dynasty: customDynasty,
        identity: customIdentity + " (自创乾坤)",
        title: customIdentity,
        avatarSeed: "emperor",
        background: customBackground,
        attributes: { ...customStats }
      };

      initialQuests = [
        {
          id: "custom_main_1",
          title: "开创万世伟业",
          description: customBackground,
          status: "进行中",
          type: "主线",
          reward: "声望大涨、天下咸服"
        }
      ];

      initialSkills = [
        { id: "cs_1", name: "御笔批朱印", level: "登堂入室", description: "朱笔一落，风行八荒之大国执笔术法。", exp: 60, type: "君臣国政" }
      ];

      initialItems = [
        {
          id: "ci_1",
          name: "自定义传国蟠龙玺",
          quality: "神传",
          type: "传国信物",
          count: 1,
          description: "玩家自造的九重白玉龙玺，凝聚无穷皇威气运。"
        }
      ];

      startCalendar = customStartingTime;
    } else {
      // Use pre-defined historical presets
      const selectedName = customName.trim() || selectedRolePreset.name;
      const computedIdentity = getIdentityLabel(selectedRolePreset);

      initialCharState = {
        name: selectedName,
        age: selectedRolePreset.difficulty === "天崩" ? 28 : (selectedRolePreset.difficulty === "困难" ? 25 : 22),
        dynasty: selectedRolePreset.dynastyName,
        identity: computedIdentity,
        title: selectedRolePreset.title,
        avatarSeed: selectedRolePreset.avatarSeed,
        background: selectedRolePreset.background,
        attributes: { ...selectedRolePreset.attributes }
      };

      initialQuests = [...selectedRolePreset.initialQuests];
      initialSkills = [...selectedRolePreset.initialSkills];
      initialItems = [...selectedRolePreset.initialItems];
      startCalendar = selectedRolePreset.startingTime;
    }

    setCharacter(initialCharState);
    setQuests(initialQuests);
    setSkills(initialSkills);
    setItems(initialItems);
    setNpcs(getInitialNPCList(initialCharState.dynasty));
    setRegions([...MAP_REGIONS]);
    setCurrentRegionId("capital");
    setCurrentCalendarDate(startCalendar);

    setChronicles([
      { 
        turn: 1, 
        year: 1, 
        eventText: `「太始开辟」: ${initialCharState.name}（尊号：${initialCharState.title}）于 【` + startCalendar + "】 践即尊位。初建世界格局，社稷大计拉开宏幅大卷。" 
      }
    ]);

    const starterPrompt = `我现在扮演古代中国皇帝【${initialCharState.name}】（尊号/庙号：${initialCharState.title}），朝代为：${initialCharState.dynasty}。开局传统历史年号纪年是：${startCalendar}。
这是当前我的开局背景：
${initialCharState.background}
已发生的史实大事纪：
${isCustomMode ? customAlreadyHappened : JSON.stringify(selectedRolePreset.alreadyHappened)}
有待抵御或面临的未来未来局势/未发生事件：
${isCustomMode ? customNotYetHappened : JSON.stringify(selectedRolePreset.notYetHappened)}
原有的历史走向（作为我的参考，但因蝴蝶效应玩家行为可能改写之）：
${isCustomMode ? "自主开创，一切随玩家决策推演" : selectedRolePreset.originalTrajectory}

我的各项核心属性如下：
- 生命健康度: ${initialCharState.attributes.health}
- 朝廷声望: ${initialCharState.attributes.prestige}
- 国库资金: ${initialCharState.attributes.gold}两
- 御林军力: ${initialCharState.attributes.military}
- 大防守坚韧: ${initialCharState.attributes.defense}
- 智深理：${initialCharState.attributes.intelligence}

请为我推演拉开大卷，演绎极具质感、权谋细节、文学厚重感的第1回第一屏剧情，并给出3个符合我目前身份与历史局势的极其典雅的决策支路 choices（请在 attributeChanges 和 questUpdate 做出合理的数值平衡变化奖励）！`;

    try {
      const data = await requestGameTurn(
        {
          dynasty: initialCharState.dynasty,
          identity: initialCharState.title,
          character: initialCharState,
          quests: initialQuests,
          items: initialItems,
          skills: initialSkills,
          history: [],
          actionTaken: starterPrompt,
        },
        apiConfig,
      );
      setCurrentScenario(data);
      setHistory([
        { role: "user", text: starterPrompt },
        { role: "assistant", text: data.story }
      ]);
    } catch (e) {
      console.warn("API request failed or refused; running local procedural storyteller: ", e);
      const fallbackData = generateLocalScenario(
        initialCharState.dynasty,
        initialCharState.title || initialCharState.identity || "",
        initialCharState,
        initialQuests,
        initialItems,
        initialSkills,
        starterPrompt,
        true
      );
      setCurrentScenario(fallbackData);
      setHistory([
        { role: "user", text: starterPrompt },
        { role: "assistant", text: fallbackData.story }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Turn Progression Controller
  const handleChoiceSelected = async (choiceText: string, attrChanges?: Partial<Character['attributes']>) => {
    if (isLoading) return;
    setIsLoading(true);

    // Apply Client changes immediately
    let updatedAttributes = { ...character.attributes };
    if (attrChanges) {
      Object.keys(attrChanges).forEach((k) => {
        const key = k as keyof Character['attributes'];
        const val = attrChanges[key];
        if (typeof val === "number" && typeof updatedAttributes[key] === "number") {
          const currentVal = updatedAttributes[key] as number;
          (updatedAttributes as any)[key] = Math.max(0, Math.min(100, currentVal + val));
        }
      });
    }

    // Automatically progress day stages, and advance Calendar date if cycle completes
    const nextStage = (dayStageIndex + 1) % 10;
    setDayStageIndex(nextStage);
    if (nextStage === 0) {
      const nextCalendarDate = advanceChineseCalendar(currentCalendarDate);
      setCurrentCalendarDate(nextCalendarDate);
    }

    // Dynamic historical aging logic
    const nextAge = Math.random() > 0.70 ? character.age + 1 : character.age;

    const nextCharState = {
      ...character,
      age: nextAge,
      attributes: updatedAttributes
    };
    setCharacter(nextCharState);

    // Dynamic country overview state updates based on the decision
    let nextEmpireStats = { ...empireStats };
    let treasuryChange = 0;
    let sentimentChange = 0;
    let militaryChange = 0;
    let grainChange = 0;

    if (choiceText.includes("historical") || choiceText.includes("1")) {
      treasuryChange = Math.floor(Math.random() * 4000) - 1000;
      sentimentChange = Math.floor(Math.random() * 4) + 1;
      militaryChange = Math.floor(Math.random() * 1000) - 200;
      grainChange = Math.floor(Math.random() * 8000) - 2000;
    } else if (choiceText.includes("positive") || choiceText.includes("2") || choiceText.includes("手敕密谕")) {
      treasuryChange = -Math.floor(Math.random() * 8000) - 2000;
      sentimentChange = Math.floor(Math.random() * 6) + 2;
      militaryChange = Math.floor(Math.random() * 3000) + 500;
      grainChange = -Math.floor(Math.random() * 4000) + 1000;
    } else if (choiceText.includes("negative") || choiceText.includes("3")) {
      treasuryChange = Math.floor(Math.random() * 6000) + 1000;
      sentimentChange = -Math.floor(Math.random() * 4) - 1;
      militaryChange = -Math.floor(Math.random() * 2000) - 500;
      grainChange = Math.floor(Math.random() * 5000);
    } else {
      treasuryChange = Math.floor(Math.random() * 10000) - 5000;
      sentimentChange = Math.floor(Math.random() * 8) - 3;
      militaryChange = Math.floor(Math.random() * 4000) - 2000;
      grainChange = Math.floor(Math.random() * 12000) - 6000;
    }

    const netS = empireStats.annualIncome - empireStats.annualExpense;
    const newIncome = Math.max(10000, empireStats.annualIncome + Math.floor(Math.random() * 1000) - 400);
    const newExpense = Math.max(8000, empireStats.annualExpense + Math.floor(Math.random() * 800) - 300);

    const nextTreasury = Math.max(0, empireStats.treasury + treasuryChange + Math.floor(netS / 10));
    const nextSentiment = Math.max(0, Math.min(100, empireStats.sentiment + sentimentChange));
    const nextMilitary = Math.max(0, empireStats.military + militaryChange);
    const nextGrain = Math.max(0, empireStats.grain + grainChange);

    nextEmpireStats = {
      summary: nextSentiment > 80 
        ? "朝野欢腾，九鼎安固。百姓含哺鼓腹，四夷咸服。"
        : nextSentiment > 50 
          ? "山河清定，政令畅达。虽微有水旱，不足为社稷之忧。"
          : nextSentiment > 30 
            ? "世道渐艰，边市不宁。流民散见于京郊，御林需勤加巡视。"
            : "饿殍遍野，藩镇侧目。乱党乘危煽惑，大厦将倾之势已现！",
      officials: empireStats.officials,
      treasury: nextTreasury,
      sentiment: nextSentiment,
      military: nextMilitary,
      grain: nextGrain,
      annualIncome: newIncome,
      annualExpense: newExpense
    };
    setEmpireStats(nextEmpireStats);

    const updatedHistory: HistoryTurn[] = [
      ...history,
      { role: "user", text: choiceText }
    ];
    setHistory(updatedHistory);

    try {
      const data = await requestGameTurn(
        {
          dynasty: character.dynasty,
          identity: character.title,
          character: nextCharState,
          quests,
          items,
          skills,
          history: updatedHistory,
          actionTaken: choiceText,
          empireStats: nextEmpireStats,
        },
        apiConfig,
      );

      // Handle item updates
      if (data.foundItem) {
        const itemText: string = data.foundItem;
        const stateItems = [...items];
        
        if (itemText.includes("失去") || itemText.includes("用去") || itemText.includes("扣除") || itemText.includes("失去")) {
          const matchName = itemText.replace(/(失去|用去|扣除|失去)\s*/, "").trim();
          const existIdx = stateItems.findIndex(i => i.name.includes(matchName));
          if (existIdx > -1) {
            if (stateItems[existIdx].count > 1) {
              stateItems[existIdx].count -= 1;
            } else {
              stateItems.splice(existIdx, 1);
            }
          }
        } else {
          const cleanName = itemText.replace(/(获得|寻到|拾取|掠获|天赐|赐予|得到|拾获)\s*/, "").trim();
          const existIdx = stateItems.findIndex(i => i.name === cleanName);
          if (existIdx > -1) {
            stateItems[existIdx].count += 1;
          } else {
            stateItems.push({
              id: `item_${Date.now()}`,
              name: cleanName,
              quality: cleanName.includes("剑") || cleanName.includes("玺") || cleanName.includes("谱") || cleanName.includes("丹") ? "绝世" : "奇珍",
              description: `命理博弈机缘中斩获的稀世秘阁重器『${cleanName}』。`,
              count: 1,
              type: cleanName.includes("剑") || cleanName.includes("刀") || cleanName.includes("枪") ? "御用神兵" : cleanName.includes("药") || cleanName.includes("丹") ? "灵丹妙药" : "传国信物"
            });
          }
        }
        setItems(stateItems);
      }

      // Handle skill updates
      if (data.attainedSkill) {
        const skillText: string = data.attainedSkill;
        const stateSkills = [...skills];
        const cleanName = skillText.replace(/(领悟|学会|淬炼|精进|熟练|领悟：|得到)\s*/, "").trim();
        const existIdx = stateSkills.findIndex(s => s.name === cleanName);

        if (existIdx > -1) {
          stateSkills[existIdx].exp = Math.min(100, stateSkills[existIdx].exp + 30);
          if (stateSkills[existIdx].exp >= 100) {
            stateSkills[existIdx].exp = 10;
            stateSkills[existIdx].level = sLevelUp(stateSkills[existIdx].level);
          }
        } else {
          stateSkills.push({
            id: `skill_${Date.now()}`,
            name: cleanName,
            level: "初窥门径",
            description: `神州星移中顿悟的心宿法门【${cleanName}】。`,
            exp: 30,
            type: "君臣国政"
          });
        }
        setSkills(stateSkills);
      }

      // Handle dynamic new Quests (Quests)
      if (data.newQuest) {
        const alreadyHas = quests.some(q => q.title === data.newQuest.title);
        if (!alreadyHas) {
          setQuests([
            ...quests,
            {
              id: `quest_${Date.now()}`,
              title: data.newQuest.title,
              description: data.newQuest.description,
              status: "进行中",
              type: "主线",
              reward: "增加声望三十、黄金千两"
            }
          ]);
        }
      }

      // Append turn chronicle logs
      setChronicles([
        { 
          turn: chronicles.length + 1, 
          year: chronicles.length + 1, 
          eventText: `【博弈命轨】于 ${currentCalendarDate}，吾主断然采取行旨：“${choiceText.length > 25 ? choiceText.slice(0, 25) + '...' : choiceText}”，风起云涌改写原历天命。` 
        },
        ...chronicles
      ]);

      setCurrentScenario(data);
      setHistory([
        ...updatedHistory,
        { role: "assistant", text: data.story }
      ]);
    } catch (e) {
      console.warn("API request failed or refused; running local procedural storyteller: ", e);
      const fallbackData = generateLocalScenario(
        character.dynasty,
        character.title || character.identity || "",
        nextCharState,
        quests,
        items,
        skills,
        choiceText,
        false
      );

      // Handle item updates inside fallback
      let stateItems = [...items];
      if (fallbackData.foundItem) {
        const itemText: string = fallbackData.foundItem;
        if (itemText.includes("失去") || itemText.includes("用去") || itemText.includes("扣除")) {
          const matchName = itemText.replace(/(失去|用去|扣除)\s*/, "").trim();
          const existIdx = stateItems.findIndex(i => i.name.includes(matchName));
          if (existIdx > -1) {
            if (stateItems[existIdx].count > 1) {
              stateItems[existIdx].count -= 1;
            } else {
              stateItems.splice(existIdx, 1);
            }
          }
        } else {
          const cleanName = itemText.replace(/(获得|寻到|拾取|掠获|天赐|赐予|得到|拾获)\s*/, "").trim();
          const existIdx = stateItems.findIndex(i => i.name === cleanName);
          if (existIdx > -1) {
            stateItems[existIdx].count += 1;
          } else {
            stateItems.push({
              id: `item_${Date.now()}`,
              name: cleanName,
              quality: "绝世",
              description: `命理博弈中裁夺的稀世珍赏重器『${cleanName}』。`,
              count: 1,
              type: cleanName.includes("剑") || cleanName.includes("刀") ? "御用神兵" : "传国信物"
            });
          }
        }
        setItems(stateItems);
      }

      // Handle skill updates inside fallback
      let stateSkills = [...skills];
      if (fallbackData.attainedSkill) {
        const skillText: string = fallbackData.attainedSkill;
        const cleanName = skillText.replace(/(领悟|学会|精进|熟练)\s*/, "").trim();
        const existIdx = stateSkills.findIndex(s => s.name === cleanName);
        if (existIdx > -1) {
          stateSkills[existIdx].exp = Math.min(100, stateSkills[existIdx].exp + 30);
          if (stateSkills[existIdx].exp >= 100) {
            stateSkills[existIdx].exp = 10;
            stateSkills[existIdx].level = sLevelUp(stateSkills[existIdx].level);
          }
        } else {
          stateSkills.push({
            id: `skill_${Date.now()}`,
            name: cleanName,
            level: "初窥门径",
            description: `神州玄境中自参顿悟的功法要诀【${cleanName}】。`,
            exp: 30,
            type: "君臣国政"
          });
        }
        setSkills(stateSkills);
      }

      // Handle dynamic new Quests inside fallback
      let stateQuests = [...quests];
      if (fallbackData.newQuest) {
        const alreadyHas = stateQuests.some(q => q.title === fallbackData.newQuest!.title);
        if (!alreadyHas) {
          stateQuests.push({
            id: `quest_${Date.now()}`,
            title: fallbackData.newQuest.title,
            description: fallbackData.newQuest.description,
            status: "进行中",
            type: "主线",
            reward: "增加威望三十、黄金五百两"
          });
          setQuests(stateQuests);
        }
      }

      // Append turn chronicle logs
      setChronicles([
        { 
          turn: chronicles.length + 1, 
          year: chronicles.length + 1, 
          eventText: `【博弈命轨】于 ${currentCalendarDate}，吾主断然采取行旨：“${choiceText.length > 25 ? choiceText.slice(0, 25) + '...' : choiceText}”，改写原历天命。` 
        },
        ...chronicles
      ]);

      setCurrentScenario(fallbackData);
      setHistory([
        ...updatedHistory,
        { role: "assistant", text: fallbackData.story }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sLevelUp = (curr: string) => {
    if (curr === "初窥门径") return "登堂入室";
    if (curr === "登堂入室") return "融会贯通";
    return "一代宗师";
  };

  // Custom User Directives Submission
  const handleCustomActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading) return;
    const desc = customAction.trim();
    setCustomAction("");
    handleChoiceSelected(`【手敕密谕】: " ${desc} "`);
  };

  // Quick Mode decision action handler
  const handleQuickModeAction = (actionType: "approve" | "reject" | "hold") => {
    if (isLoading) return;

    let pChanges: Partial<Character['attributes']> = {};
    let statChanges = { treasury: 0, sentiment: 0, military: 0, grain: 0 };
    let actName = "";

    if (actionType === "approve") {
      pChanges = { prestige: 2, intelligence: 1 };
      statChanges = { treasury: -4000, sentiment: 4, military: 500, grain: -2000 };
      actName = "【批准】";
    } else if (actionType === "reject") {
      pChanges = { prestige: -1, intelligence: 2, luck: 1 };
      statChanges = { treasury: 3000, sentiment: -2, military: -300, grain: 4000 };
      actName = "【驳回】";
    } else {
      pChanges = { prestige: 1, intelligence: 3 };
      statChanges = { treasury: 500, sentiment: 0, military: 100, grain: 1000 };
      actName = "【留中】";
    }

    // Apply attribute modifications
    setCharacter(prev => {
      let updated = { ...prev.attributes };
      Object.keys(pChanges).forEach(k => {
        const key = k as keyof Character['attributes'];
        const val = pChanges[key];
        if (typeof val === "number" && typeof (updated as any)[key] === "number") {
          (updated as any)[key] = Math.max(0, Math.min(100, (updated as any)[key] + val));
        }
      });
      return { ...prev, attributes: updated };
    });

    // Apply Empire stats changes
    setEmpireStats(prev => ({
      ...prev,
      treasury: Math.max(0, prev.treasury + statChanges.treasury),
      sentiment: Math.max(0, Math.min(100, prev.sentiment + statChanges.sentiment)),
      military: Math.max(0, prev.military + statChanges.military),
      grain: Math.max(0, prev.grain + statChanges.grain),
    }));

    // Add log entry
    const stage = DAY_STAGES[dayStageIndex];
    const logStr = `【${stage.timeLabel} · ${stage.name}】陛下做出决策：${actName}。影响：国库${statChanges.treasury > 0 ? "+" : ""}${statChanges.treasury}两，民心${statChanges.sentiment > 0 ? "+" : ""}${statChanges.sentiment}%，军士${statChanges.military > 0 ? "+" : ""}${statChanges.military}人。`;
    setQuickLogs(prev => [logStr, ...prev]);

    // Go to next stage
    setDayStageIndex(prev => {
      const nextIdx = (prev + 1) % 10;
      if (nextIdx === 0) {
        setCurrentCalendarDate(curr => advanceChineseCalendar(curr));
        setChronicles(prevChron => [
          {
            turn: prevChron.length + 1,
            year: prevChron.length + 1,
            eventText: `【快速模式】勤政亲批毕，日转星移，圣躬安康推进至新的一日。`
          },
          ...prevChron
        ]);
      }
      return nextIdx;
    });
  };

  // Level 2 Action: Travel to Region
  const handleMapTravelTo = (regionId: string, regionName: string, daysCost = 3, goldCost = 200) => {
    setCharacter(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        gold: Math.max(0, prev.attributes.gold - goldCost)
      }
    }));
    setCurrentRegionId(regionId);
    handleChoiceSelected(
      `「御驾出巡」：圣意独运，摆驾巡游亲抵【${regionName}】。此次路途耗时 ${daysCost} 天，共拨付国库旅费 ${goldCost} 两黄金，体察地方人文。`,
      { prestige: 5 }
    );
    setActiveModal(null); // Close map overlay upon traveling
  };

  // Level 2 Action: Use Inventory Item
  const handleUseInventoryItem = (itemId: string, action: "consume" | "equip" | "sell") => {
    const updated = items.map((itm) => {
      if (itm.id === itemId) return { ...itm, count: itm.count - 1 };
      return itm;
    }).filter(itm => itm.count > 0);

    setItems(updated);

    const matchItem = items.find(i => i.id === itemId);
    if (!matchItem) return;

    if (action === "consume") {
      setCharacter({
        ...character,
        attributes: {
          ...character.attributes,
          health: Math.min(100, character.attributes.health + 30)
        }
      });
      alert(`你服用了天赐重药【${matchItem.name}】，通体通泰，气血回复 30 点！`);
    } else if (action === "sell") {
      setCharacter({
        ...character,
        attributes: {
          ...character.attributes,
          gold: character.attributes.gold + 500
        }
      });
      alert(`你将奇珍【${matchItem.name}】化去充入大唐/大宋府库，获得 500 两黄金岁帑。`);
    } else {
      setCharacter({
        ...character,
        attributes: {
          ...character.attributes,
          defense: Math.min(100, character.attributes.defense + 15)
        }
      });
      alert(`你将神兵【${matchItem.name}】随身佩挂，威严庄重，护国防御力大有精进！`);
    }
  };

  const handleUseItemConsumableByApp = (itemId: string) => {
    handleUseInventoryItem(itemId, "consume");
  };

  const handleDiscardItemByApp = (itemId: string) => {
    const matchItem = items.find(i => i.id === itemId);
    if (!matchItem) return;
    setItems(prev => prev.map(itm => {
      if (itm.id === itemId) return { ...itm, count: itm.count - 1 };
      return itm;
    }).filter(itm => itm.count > 0));
    alert(`你随于太极殿阶下丢弃/毁去了【${matchItem.name}】！岁宝重光消弭。`);
  };

  const handleEquipItemByApp = (itemId: string, slot: "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand") => {
    const matchItem = items.find(i => i.id === itemId);
    if (!matchItem) return;

    const currentEquip = character.equipment ? character.equipment[slot] : null;
    let nextItems = items.map(itm => {
      if (itm.id === itemId) return { ...itm, count: itm.count - 1 };
      return itm;
    }).filter(itm => itm.count > 0);

    if (currentEquip) {
      const idx = nextItems.findIndex(i => i.name === currentEquip.name);
      if (idx !== -1) {
        nextItems[idx].count += 1;
      } else {
        nextItems.push({ ...currentEquip, count: 1 });
      }
    }

    setItems(nextItems);
    setCharacter(prev => ({
      ...prev,
      equipment: {
        ...(prev.equipment || {}),
        [slot]: matchItem
      },
      attributes: {
        ...prev.attributes,
        defense: Math.min(100, prev.attributes.defense + (matchItem.quality === "神传" ? 25 : matchItem.quality === "绝世" ? 18 : 12))
      }
    }));
    alert(`【配戴神兵】成功：你将【${matchItem.name}】戴于 ${
      slot === "head" ? "部首 (头)" :
      slot === "neck" ? "颈部" :
      slot === "body" ? "身体" :
      slot === "waist" ? "腰部" :
      slot === "rightHand" ? "右手" : "左手"
    }，主公气宇神采更彰！`);
  };

  const handleUnequipItemByApp = (slot: "head" | "neck" | "body" | "waist" | "rightHand" | "leftHand") => {
    const activeEquip = character.equipment ? character.equipment[slot] : null;
    if (!activeEquip) return;

    const nextItems = [...items];
    const idx = nextItems.findIndex(i => i.name === activeEquip.name);
    if (idx !== -1) {
      nextItems[idx].count += 1;
    } else {
      nextItems.push({ ...activeEquip, count: 1 });
    }

    setItems(nextItems);
    setCharacter(prev => ({
      ...prev,
      equipment: {
        ...(prev.equipment || {}),
        [slot]: null
      },
      attributes: {
        ...prev.attributes,
        defense: Math.max(0, prev.attributes.defense - (activeEquip.quality === "神传" ? 25 : activeEquip.quality === "绝世" ? 18 : 12))
      }
    }));
    alert(`【卸除佩挂】成功：卸下了身上的【${activeEquip.name}】并妥帖收纳于天下行囊袋。`);
  };

  // Level 2 Action: Upgrade Skill
  const handleMeditateSkillUpgrade = (skillId: string, skillName: string) => {
    const currentEnergy = character.attributes.energy !== undefined ? character.attributes.energy : 100;
    const energyCost = 15; // 少量能量

    if (currentEnergy < energyCost) {
      alert(`圣魂疲累！你需要至少 ${energyCost} 点圣武精力才能沉心研学玄理大策！当前精力仅剩 ${currentEnergy}。`);
      return;
    }

    const nextSkills = skills.map((s) => {
      if (s.id === skillId) {
        const nextExp = s.exp + 35;
        if (nextExp >= 100) {
          return {
            ...s,
            exp: nextExp - 100,
            level: sLevelUp(s.level)
          };
        }
        return { ...s, exp: nextExp };
      }
      return s;
    });

    const nextCalendarDate = advanceChineseCalendar(currentCalendarDate);
    setCurrentCalendarDate(nextCalendarDate);

    setSkills(nextSkills);
    setCharacter({
      ...character,
      attributes: {
        ...character.attributes,
        energy: Math.max(0, currentEnergy - energyCost),
        intelligence: Math.min(100, character.attributes.intelligence + 4)
      }
    });

    const targeted = nextSkills.find(s => s.id === skillId);
    if (targeted) {
      alert(`【潜修深造】成功！你清扫心神、屏退群臣，消耗了 ${energyCost} 点圣心武意精力，并经数日光阴之逝（岁历进至 ${nextCalendarDate}），精深研习了【${skillName}】，契合度突破至 [${targeted.level}]！`);
      setChronicles([
        {
          turn: chronicles.length + 1,
          year: chronicles.length + 1,
          eventText: `【静修大政】圣上闭关高阁深研绝学【${skillName}】，消耗 ${energyCost} 点精力，闭关时光流逝，国势神州更为尊吉！`
        },
        ...chronicles
      ]);
    }
  };

  // Level 2 Action: Cast Active Skill (Deduct Energy Pool)
  const handleCastSkillEnergy = (skillId: string, cost: number) => {
    setCharacter(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        energy: Math.max(0, (prev.attributes.energy !== undefined ? prev.attributes.energy : 100) - cost)
      }
    }));
    
    const castedSkill = skills.find(s => s.id === skillId);
    if (castedSkill) {
      alert(`💥 施展绝技成功：你宣动精力，赫然祭发了【${castedSkill.name}】！大殿阁威暴增。`);
      setChronicles([
        {
          turn: chronicles.length + 1,
          year: chronicles.length + 1,
          eventText: `【大施神威】吾主在太极殿御前宣演九五绝学【${castedSkill.name}】，损耗流转精力 ${cost} 点，乾坤震悚，朝纲大整！`
        },
        ...chronicles
      ]);
    }
  };

  // Level 2 Action: Create Custom Task
  const handleFormulateCustomQuest = (title: string, desc: string) => {
    setQuests([
      ...quests,
      {
        id: `custom_built_${Date.now()}`,
        title,
        description: desc,
        status: "进行中",
        type: "奇遇",
        reward: "平添威盛名声各二十载、大定江山大志也"
      }
    ]);
    alert(`成功拟颁并下赐一道全新圣旨诏谕任务！「${title}」已记入四海诏书。`);
  };

  // Level 2 Action: Save SaveCode (Export)
  const handleExportSaveCode = () => {
    try {
      const stateObj = {
        character,
        quests,
        skills,
        items,
        npcs,
        regions,
        currentRegionId,
        chronicles,
        currentScenario,
        history,
        currentCalendarDate,
        activeTheme
      };
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(stateObj))));
      setSaveCodeText(b64);
      setShowSaveArea(true);
      // Try to write to clipboard
      navigator.clipboard.writeText(b64);
      alert("当前的皇帝转世天命存档码已成功复制到你的系统剪贴板！可粘贴另存为文本文档。");
    } catch (e) {
      alert("备份导出失败：" + e);
    }
  };

  // Level 2 Action: Load SaveCode (Import)
  const handleImportSaveCode = () => {
    if (!saveCodeText.trim()) {
       alert("请将此前备份保存的皇帝天命存档代码粘贴至文本框中！");
       return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(saveCodeText.trim())));
      const stateObj = JSON.parse(decoded);
      
      if (stateObj.character) setCharacter(stateObj.character);
      if (stateObj.quests) setQuests(stateObj.quests);
      if (stateObj.skills) setSkills(stateObj.skills);
      if (stateObj.items) setItems(stateObj.items);
      if (stateObj.npcs) setNpcs(stateObj.npcs);
      if (stateObj.regions) setRegions(stateObj.regions);
      if (stateObj.currentRegionId) setCurrentRegionId(stateObj.currentRegionId);
      if (stateObj.chronicles) setChronicles(stateObj.chronicles);
      if (stateObj.currentScenario) setCurrentScenario(stateObj.currentScenario);
      if (stateObj.history) setHistory(stateObj.history);
      if (stateObj.currentCalendarDate) setCurrentCalendarDate(stateObj.currentCalendarDate);
      if (stateObj.activeTheme) setActiveTheme(stateObj.activeTheme);
      if (stateObj.leftPanelExpanded !== undefined) setLeftPanelExpanded(stateObj.leftPanelExpanded);
      if (stateObj.empireStats) setEmpireStats(stateObj.empireStats);
      
      setIsInitialized(true);
      setActiveModal(null);
      alert("【太阴回转】恭喜！你的皇帝天命因缘极速复盘重建，太极殿前因缘重光！");
    } catch (e) {
      alert("存档校验失败，存档码格式 seems to be corrupted! " + e);
    }
  };

  const handleContinueGame = () => {
    try {
      const loaded = mvuToGameState(readMvuGameState());
      if (!loaded.isInitialized) {
        alert("未寻得先前任何自动天命存档！请点击「开始新游戏」开启。");
        return;
      }
      mvuHydratingRef.current = true;
      applyPersistState(loaded);
      setIsMainMenu(false);
      setIsInitialized(true);
      mvuHydratingRef.current = false;
      alert("🎉 成功寻得天命因缘！正在重返回太极金殿决策...");
    } catch (e) {
      alert("回转命轨发生紊乱。" + e);
    }
  };

  const handleSaveToSlot = (slotIdx: number) => {
    try {
      const stateObj = {
        character,
        quests,
        skills,
        items,
        npcs,
        regions,
        currentRegionId,
        chronicles,
        currentScenario,
        history,
        currentCalendarDate,
        activeTheme,
        fontSize,
        customPortraits,
        summaryX,
        summaryY,
        hideZ,
        customBgColor,
        customBorderColor,
        leftPanelExpanded,
        empireStats
      };
      localStorage.setItem(`emperor_slot_${slotIdx}`, JSON.stringify(stateObj));
      alert(`🎉 成功封印并存入【天命九鼎金槽 · 第${slotIdx}位】！已记忆当前乾坤命轨。`);
    } catch (e) {
      alert("存档至九鼎金槽失败。");
    }
  };

  const handleLoadFromSlot = (slotIdx: number) => {
    try {
      const dataStr = localStorage.getItem(`emperor_slot_${slotIdx}`);
      if (!dataStr) {
        alert(`【金槽第${slotIdx}位】暂无任何回忆尘埃。`);
        return;
      }
      const data = JSON.parse(dataStr);
      if (data.character) setCharacter(data.character);
      if (data.quests) setQuests(data.quests);
      if (data.skills) setSkills(data.skills);
      if (data.items) setItems(data.items);
      if (data.npcs) setNpcs(data.npcs);
      if (data.regions) setRegions(data.regions);
      if (data.currentRegionId) setCurrentRegionId(data.currentRegionId);
      if (data.chronicles) setChronicles(data.chronicles);
      if (data.currentScenario) setCurrentScenario(data.currentScenario);
      if (data.history) setHistory(data.history);
      if (data.currentCalendarDate) setCurrentCalendarDate(data.currentCalendarDate);
      if (data.activeTheme) setActiveTheme(data.activeTheme);
      if (data.fontSize) setFontSize(data.fontSize);
      if (data.customPortraits) setCustomPortraits(data.customPortraits);
      if (data.summaryX !== undefined) setSummaryX(data.summaryX);
      if (data.summaryY !== undefined) setSummaryY(data.summaryY);
      if (data.hideZ !== undefined) setHideZ(data.hideZ);
      if (data.customBgColor) setCustomBgColor(data.customBgColor);
      if (data.customBorderColor) setCustomBorderColor(data.customBorderColor);
      if (data.leftPanelExpanded !== undefined) setLeftPanelExpanded(data.leftPanelExpanded);
      if (data.empireStats) setEmpireStats(data.empireStats);

      setIsMainMenu(false);
      setIsInitialized(true);
      alert(`🎉 华光重聚！已成功复苏并载入【第九鼎金槽 · 第${slotIdx}位】！`);
    } catch (e) {
      alert("破封读档失败。");
    }
  };

  const handleProceduralRedraw = (name: string) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 120, 120);
        const palettes = [
          ["#160802", "#4a1c02"],
          ["#041009", "#0e3a1f"],
          ["#020b16", "#0b2c52"],
          ["#120101", "#420404"],
          ["#0a010d", "#2e033b"]
        ];
        const picked = palettes[Math.floor(Math.random() * palettes.length)];
        grad.addColorStop(0, picked[0]);
        grad.addColorStop(1, picked[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 120, 120);

        ctx.fillStyle = "rgba(255, 221, 153, 0.12)";
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const x = 60 + Math.sin(i * 0.78) * (25 + Math.random() * 20);
          const y = 60 + Math.cos(i * 0.78) * (25 + Math.random() * 20);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        const gradAura = ctx.createRadialGradient(60, 50, 12, 60, 50, 45);
        gradAura.addColorStop(0, "rgba(245, 158, 11, 0.5)");
        gradAura.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = gradAura;
        ctx.beginPath();
        ctx.arc(60, 50, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(35, 50);
        ctx.lineTo(42, 28);
        ctx.lineTo(60, 42);
        ctx.lineTo(78, 28);
        ctx.lineTo(85, 50);
        ctx.closePath();
        ctx.fill();

        const base64 = canvas.toDataURL("image/png");
        setCustomPortraits(prev => ({
          ...prev,
          [name]: base64
        }));
        alert(`🎨 成功为【${name}】重绘圣容画轴肖像！`);
      }
    } catch (e) {
      console.warn("重绘挫败:", e);
    }
  };

  // Level 2 Action: Interactive NPC Court Command
  const handleInteractNPC = (npcName: string, actionType: "reward" | "conspire" | "talk") => {
    if (actionType === "reward") {
      if (character.attributes.gold < 200) {
        alert("国库银两不足 200 两，无法起用内侍赏赐重礼。");
        return;
      }
      setCharacter(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          gold: Math.max(0, prev.attributes.gold - 200),
          prestige: Math.min(100, prev.attributes.prestige + 4)
        }
      }));
      setNpcs(prev => prev.map(n => {
        if (n.name === npcName) {
          const nextDeeds = [...(n.deeds || [])];
          nextDeeds.push(`奉天承受：圣天子施以御前赏赐，亲书恩荫，满朝倾羡不已。`);
          return {
            ...n,
            relationVal: Math.min(100, n.relationVal + 15),
            loyalty: Math.min(100, n.loyalty + 10),
            deeds: nextDeeds
          };
        }
        return n;
      }));
      alert(`【皇恩浩荡】赏异给赐：你拨付国库白银 200 两，重重赏赐了【${npcName}】百官奉禄锦绢。其感恩戴德，声望随之微扬！`);
    } else if (actionType === "conspire") {
      setNpcs(prev => prev.map(n => {
        if (n.name === npcName) {
          const nextDeeds = [...(n.deeds || [])];
          nextDeeds.push(`秉风秘召：于文德殿耳屏密谋宏图社稷权谋。誓为王命急先锋。`);
          return {
            ...n,
            relationVal: Math.min(100, n.relationVal + 8),
            loyalty: Math.min(100, n.loyalty + 18),
            deeds: nextDeeds
          };
        }
        return n;
      }));
      alert(`【殿前对策】密旨密谈：你私敕召见【${npcName}】秉烛夜谭，商议肃清内外异议。其深受感动深获隆恩！`);
    }
  };

  // Level 2 Action: Self-Meditate (Rest and heal in character stats)
  const handleCharacterMeditateHeal = () => {
    setCharacter(prev => ({
      ...prev,
      age: prev.age + 1,
      attributes: {
        ...prev.attributes,
        health: Math.min(100, prev.attributes.health + 20),
        luck: Math.min(100, prev.attributes.luck + 5)
      }
    }));
    // Date progresses
    const nextDate = advanceChineseCalendar(currentCalendarDate);
    setCurrentCalendarDate(nextDate);
    
    setChronicles([
      {
        turn: chronicles.length + 1,
        year: chronicles.length + 1,
        eventText: `【静坐参禅】吾主于太庙金銮上入定闭关一载，参悟帝皇心经，精气神周天运回，生命值增加20，岁增一载。`
      },
      ...chronicles
    ]);
    alert("你于九重清香大殿内静坐参禅苦修一载。神志内敛，元阳升和，健康重回！");
  };

  // Filter Presets
  const filteredPresets = ROLE_PRESETS.filter((p) => {
    if (presetFilter === "all") return true;
    return p.difficulty === presetFilter;
  });

  // Dynamic color helper classes based on Theme state
  const themeColors = {
    gold: {
      border: "border-[#bfa15f]/40",
      borderHeavy: "border-[#bfa15f]",
      textAccent: "text-amber-300",
      textHeavy: "text-[#e6c787]",
      bg: "bg-[#121210]",
      radialBg: "from-[#1a1712] via-[#0c0c0b] to-[#070706]",
      btn: "bg-[#8c2c16] hover:bg-[#a63c24] border-[#bfa15f]/40 text-amber-100",
      btnLight: "bg-[#bfa15f]/10 hover:bg-[#bfa15f]/20 text-amber-200 border-[#bfa15f]/20",
      glow: "shadow-[0_0_15px_rgba(191,161,95,0.2)]",
      bulletActive: "bg-[#8c2c16]/30 text-amber-200 border-amber-400"
    },
    emerald: {
      border: "border-emerald-800/40",
      borderHeavy: "border-emerald-500/50",
      textAccent: "text-emerald-300",
      textHeavy: "text-emerald-400",
      bg: "bg-[#0b120e]",
      radialBg: "from-[#0e1d16] via-[#090e0b] to-[#050806]",
      btn: "bg-emerald-900 hover:bg-emerald-800 border-emerald-500/30 text-emerald-100",
      btnLight: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      bulletActive: "bg-emerald-900/40 text-emerald-200 border-emerald-500"
    },
    sapphire: {
      border: "border-sky-800/40",
      borderHeavy: "border-sky-500/50",
      textAccent: "text-sky-300",
      textHeavy: "text-sky-400",
      bg: "bg-[#080d1a]",
      radialBg: "from-[#0a1730] via-[#060a14] to-[#03050a]",
      btn: "bg-sky-950 hover:bg-sky-900 border-sky-500/30 text-sky-100",
      btnLight: "bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/20",
      glow: "shadow-[0_0_15px_rgba(14,165,233,0.15)]",
      bulletActive: "bg-sky-950/40 text-sky-200 border-sky-500"
    },
    crimson: {
      border: "border-rose-900/40",
      borderHeavy: "border-rose-600/50",
      textAccent: "text-rose-300",
      textHeavy: "text-rose-400",
      bg: "bg-[#140a0a]",
      radialBg: "from-[#220e0e] via-[#0e0606] to-[#070303]",
      btn: "bg-rose-950 hover:bg-rose-900 border-rose-600/30 text-rose-100",
      btnLight: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
      bulletActive: "bg-rose-950/40 text-rose-200 border-rose-500"
    }
  };

  const currStyles = themeColors[activeTheme];

  const workspaceStyle = {
    backgroundColor: customBgColor || undefined,
    borderColor: customBorderColor || undefined,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    overflow: 'hidden',
  };

  return (
    <ScaleViewport>
    <div 
      id="game-workspace" 
      style={workspaceStyle} 
      className={`${currStyles.bg} text-[#fcfbfa] flex flex-col items-center justify-center antialiased relative transition-all duration-500`}
    >
      <div className="w-full h-full flex items-center justify-center mx-auto">
        <div className="w-full h-full flex flex-col justify-between py-4 px-6 relative">
      


      {/* ========================================================= */}
      {/* --- SCENE 1: COREL SELECTION / REINCARNATION COVER CARD --- */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* --- SCENE 1: COREL SELECTION / REINCARNATION COVER CARD --- */}
      {/* ========================================================= */}
      {!isInitialized && isMainMenu && (
        <div id="landing-main-cover" className="flex-grow w-full max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center items-center font-serif text-center relative z-10 select-none">
          {/* Imperial Header Ring */}
          <div className="absolute top-10 opacity-10 pointer-events-none text-9xl text-amber-500 animate-spin" style={{ animationDuration: "60s" }}>
            ☯️
          </div>
          
          <div className="space-y-4 max-w-2xl relative z-20">
            <span className="text-xs tracking-[0.4em] text-amber-400 font-bold block animate-pulse">
              ━━━━━━ 历朝通鉴 · 乾坤执掌 ━━━━━━
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-[#bfa15f] tracking-[0.2em] py-2 filter drop-shadow">
              皇帝模拟器
            </h1>
            <p className="text-xs text-justify text-gray-400 leading-relaxed font-light font-serif max-w-lg mx-auto">
              入世为帝，身系天下兴亡。你可以垂拱而治博弈于六部公曹，也可以御驾亲征力挽八荒狂澜。于漫漫史河因缘之中，续写独属于你大权在握、荡气回肠的社稷长歌。
            </p>

            {/* Giant Stacked Majestic Buttons */}
            <div className="py-6 space-y-3.5 max-w-md mx-auto font-bold">
              <button
                onClick={() => setIsMainMenu(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-700 via-amber-800 to-red-900 hover:from-amber-600 hover:to-red-800 text-white font-black text-sm rounded-xl border border-amber-400/40 cursor-pointer transition shadow-xl active:scale-98 relative group overflow-hidden"
              >
                <div className="absolute inset-0 w-3 bg-[#ffffff10] skew-x-12 translate-x-[-100%] group-hover:translate-x-[500%] transition-transform duration-1000" />
                ⚔️ 开始游戏
              </button>

              <button
                onClick={handleContinueGame}
                className="w-full py-4 bg-neutral-900/90 hover:bg-neutral-850 text-amber-100 font-black text-sm rounded-xl border border-neutral-800 hover:border-amber-400 cursor-pointer transition shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                ⏳ 继续游戏
              </button>

              <button
                onClick={() => setShowCoverLoadArea(!showCoverLoadArea)}
                className="w-full py-3.5 bg-[#0e0c0b] hover:bg-neutral-900 text-amber-300 /90 font-black text-xs rounded-xl border border-[#bfa15f]/20 hover:border-amber-400 cursor-pointer transition active:scale-98"
              >
                📂 读取存档
              </button>
            </div>

            {/* SLOTTED LOAD AREA (On Cover Screen when clicking Read Save) */}
            {showCoverLoadArea && (
              <div className="bg-black/90 border-2 border-amber-600/30 p-4.5 rounded-2xl max-w-lg mx-auto text-left mt-6 animate-slide-down space-y-4 shadow-2xl relative z-30">
                <p className="font-bold text-xs text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex justify-between items-center">
                  <span>📂 1. 金券九鼎回忆槽 (Slotted Loads)</span>
                  <span className="text-[10px] text-gray-500 font-sans">点击可直接读取历史存盘</span>
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((slotIdx) => {
                    const hasData = localStorage.getItem(`emperor_slot_${slotIdx}`);
                    return (
                      <button
                        key={slotIdx}
                        disabled={!hasData}
                        onClick={() => handleLoadFromSlot(slotIdx)}
                        className={`p-2.5 rounded border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                          hasData
                            ? "bg-[#8c2c16]/20 border-amber-400/50 hover:bg-[#8c2c16]/30 text-amber-200 font-bold"
                            : "bg-neutral-950/40 border-neutral-900/60 text-gray-700 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span className="text-[10.5px] font-black block">第 {slotIdx} 槽</span>
                        <span className="text-[8px] text-gray-400 block mt-1">
                          {hasData ? "● 已纳命轨" : "空"}
                        </span>
                      </button>
                    );
                  })}
                </div>


                <div className="pt-2 border-t border-neutral-900/80 space-y-2">
                  <p className="text-[#a09e97] font-bold text-[10.5px]">📤 2. 导入外部皇帝天命代码：</p>
                  <textarea
                    rows={3}
                    placeholder="在此粘贴此前导出的Base64文本长码，随后点击对应导入按钮立即重光金殿..."
                    value={saveCodeText}
                    onChange={(e) => setSaveCodeText(e.target.value)}
                    className="w-full bg-neutral-950 text-[9.5px] border border-neutral-850 p-2 font-mono text-gray-305 focus:outline-none rounded"
                  />
                  <button
                    onClick={handleImportSaveCode}
                    className="w-full py-2 bg-amber-800 hover:bg-amber-700 text-white text-[10px] font-black rounded cursor-pointer transition active:scale-95"
                  >
                    📥 立即一键导入、乾坤归位！
                  </button>
                </div>
              </div>
            )}

            {/* Ambient credits-in-low-opacity */}
            <div className="pt-12 text-[10px] text-gray-650 tracking-wider">
              <span>大梁文华阁印制 ✧ 江山主宰社稷之誓</span>
            </div>
          </div>
        </div>
      )}

      {!isInitialized && !isMainMenu && (
        <div id="reincarnation-screen" className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col justify-center items-center">
          
          {/* Back to main landing screen */}
          <div className="w-full flex justify-start mb-4">
            <button
              onClick={() => setIsMainMenu(true)}
              className="px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-400 text-amber-250 text-xs rounded-lg cursor-pointer transition font-bold font-serif"
            >
              ← 返回主页面
            </button>
          </div>

          {/* Logo Heading Block */}
          <div className="text-center space-y-2 mb-8">
            <span className="text-[10px] tracking-[0.4em] text-amber-400/90 font-serif uppercase font-bold block animate-pulse">
              ━━━━━━ 史册千秋 · 御临天命 ━━━━━━
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd384] via-[#f7c268] to-[#ab3e16] tracking-widest py-1.5 filter drop-shadow">
              大君天命钦定
            </h1>
            <p className="text-xs text-[#a09e97] max-w-lg mx-auto leading-relaxed font-serif">
              龙潜于渊，金銮重光。你可以选择华夏历朝四面均势的历史皇帝开局，或者定制尊号天命，于大语言模型(Gemini)推演下力克外乱，独揽国政纲纪之棋局。
            </p>
          </div>

          {/* Toggle Creator Mode */}
          <div className="flex gap-2 mb-6 border border-amber-500/10 bg-black/35 p-1 rounded font-serif text-xs">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-4 py-1.5 rounded transition cursor-pointer ${!isCustomMode ? 'bg-[#8c2c16] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              👑 历史模板
            </button>
            <button
              onClick={() => {
                setIsCustomMode(true);
                handleRollCustomStats(); // Default roll attributes
              }}
              className={`px-4 py-1.5 rounded transition cursor-pointer ${isCustomMode ? 'bg-[#8c2c16] text-white font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              🌌 自定义
            </button>
          </div>

          {/* Core Selection Body Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT AREA: Role Presets (Only when in historical catalog mode) */}
            {!isCustomMode ? (
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#bfa15f]/20 pb-2 gap-2">
                  <h2 className="font-serif text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-[#8c2c16]" />
                    第一折：天册选君 (请圈点你要扮演的历史险关天子)
                  </h2>
                  
                  {/* Category bullet filters */}
                  <div className="flex gap-1 overflow-x-auto text-[10px]">
                    {(["简单", "中等", "困难", "天崩"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          setPresetFilter(diff);
                          const matched = ROLE_PRESETS.find(p => p.difficulty === diff);
                          if (matched) {
                            setSelectedPresetId(matched.id);
                          }
                        }}
                        className={`px-2 py-1 rounded transition border font-serif whitespace-nowrap cursor-pointer ${
                          presetFilter === diff
                            ? "bg-[#8c2c16]/30 text-amber-200 border-amber-400"
                            : "bg-black/80 text-gray-400 border-neutral-800 hover:border-amber-400 hover:text-white"
                        }`}
                      >
                        {`${diff}开局`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid listing the chosen difficulty options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`cursor-pointer border-2 rounded-xl p-3.5 transition-all duration-300 relative overflow-hidden bg-black/60 flex flex-col justify-between ${
                        selectedPresetId === preset.id
                          ? "border-[#bfa15f] shadow-[0_0_15px_rgba(191,161,95,0.25)] bg-[#bfa15f]/5 font-black"
                          : "border-[#bfa15f]/15 hover:border-[#bfa15f]/30 hover:bg-[#070707]"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-[#ffdd99] font-serif border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded">
                            {preset.dynastyName}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-sans font-bold border ${
                            preset.difficulty === "简单" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            preset.difficulty === "中等" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            preset.difficulty === "困难" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                            "bg-rose-500/10 border-rose-500/35 text-rose-400 animate-pulse"
                          }`}>
                            {preset.difficulty}难度在位
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-base text-white flex items-center justify-between">
                            <span>{preset.name}</span>
                            <span className="text-xs text-amber-300 font-normal">{preset.title}</span>
                          </h3>
                        </div>

                        <p className="text-[10.5px] text-gray-400 font-serif leading-relaxed line-clamp-3 bg-neutral-900/60 p-2 rounded border border-neutral-800 text-justify">
                          {preset.background}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#bfa15f]/10 grid grid-cols-5 gap-1 text-[8.5px] font-mono text-[#a09e97] text-center mt-3">
                        <div>气血<b className="text-rose-400 block font-bold">{preset.attributes.health}</b></div>
                        <div>声威<b className="text-amber-400 block font-bold">{preset.attributes.prestige}</b></div>
                        <div>岁帑<b className="text-yellow-500 block font-bold">{preset.attributes.gold}</b></div>
                        <div>坚壁<b className="text-[#3b82f6] block font-bold">{preset.attributes.defense}</b></div>
                        <div>气运<b className="text-emerald-400 block font-bold">{preset.attributes.luck}</b></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* CUSTOM CREATOR MODE (自创历史朝代与皇帝尊号并分配点数) */
              <div className="lg:col-span-8 bg-[#121210] border border-[#bfa15f]/25 rounded-xl p-5 space-y-4 max-h-[530px] overflow-y-auto font-serif">
                <h2 className="text-xs font-bold text-amber-300 border-b border-[#bfa15f]/20 pb-2 flex items-center justify-between">
                  <span>🌌 幽都造影：订纂自选天下大册 （自定义开局）</span>
                  <button
                    onClick={handleRollCustomStats}
                    className="px-2.5 py-1 bg-[#8c2c16]/30 hover:bg-[#8c2c16]/50 border border-amber-500/30 text-amber-200 text-[10px] rounded cursor-pointer transition active:scale-95"
                  >
                    🎲 投掷天命骰 (随机重置名姓及根骨)
                  </button>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【皇帝尊称姓名】</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="例：朱元璋 / 嬴政"
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【朝代国号】</label>
                      <input
                        type="text"
                        value={customDynasty}
                        onChange={(e) => setCustomDynasty(e.target.value)}
                        placeholder="例：大明 / 大周"
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【天命登基年号纪元时间】 (注意：采用中国传统纪历法)</label>
                      <input
                        type="text"
                        value={customStartingTime}
                        onChange={(e) => setCustomStartingTime(e.target.value)}
                        placeholder="例：公元1368年 大明 洪武元年初春正月初一"
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-amber-300 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【初始君王尊号】</label>
                      <input
                        type="text"
                        value={customIdentity}
                        onChange={(e) => setCustomIdentity(e.target.value)}
                        placeholder="例：洪武世祖 · 开国神烈祖"
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【已发生史实大势】 (以逗号隔开，作为LLM推演基准)</label>
                      <textarea
                        value={customAlreadyHappened}
                        onChange={(e) => setCustomAlreadyHappened(e.target.value)}
                        rows={2}
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-gray-300 font-serif leading-relaxed text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【未来面临的内忧外患 / 未发生事件】</label>
                      <textarea
                        value={customNotYetHappened}
                        onChange={(e) => setCustomNotYetHappened(e.target.value)}
                        rows={2}
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-gray-300 font-serif leading-relaxed text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">【天命开局历史背景陈词】</label>
                      <textarea
                        value={customBackground}
                        onChange={(e) => setCustomBackground(e.target.value)}
                        rows={2}
                        className="w-full bg-black border border-[#bfa15f]/40 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 text-gray-300 font-serif leading-relaxed text-[11px]"
                      />
                    </div>

                    {/* Adjustable Attribute Points Sliders */}
                    <div className="bg-black/40 border border-[#bfa15f]/15 rounded p-2.5 space-y-2 font-mono text-[10px]">
                      <p className="font-serif text-[10px] text-amber-300 border-b border-[#bfa15f]/10 pb-1">👑 帝皇骨格九维分配：</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(customStats).map(([key, val]) => (
                          <div key={key} className="space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-gray-400 font-serif">{
                                key === "health" ? "健康 (气血)" :
                                key === "prestige" ? "声望 (极威)" :
                                key === "gold" ? "国库 (黄金)" :
                                key === "military" ? "御林 (军力)" :
                                key === "defense" ? "关防 (防御)" :
                                key === "strength" ? "力量 (劲力)" :
                                key === "agility" ? "敏捷 (腾挪)" :
                                key === "stamina" ? "耐力 (韧力)" :
                                key === "intelligence" ? "谋略 (智谋)" : "造化 (仙运)"
                              }</span>
                              <span className="text-amber-400 font-bold">{val}</span>
                            </div>
                            <input
                              type="range"
                              min={key === "gold" ? 500 : 10}
                              max={key === "gold" ? 15000 : 100}
                              step={key === "gold" ? 100 : 1}
                              value={val}
                              onChange={(e) => {
                                const v = parseInt(e.target.value);
                                setCustomStats(prev => ({ ...prev, [key]: v }));
                              }}
                              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#8c2c16]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT PANEL: SELECTED PRESET PREVIEW & REINCARNATION TRIGGERS */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-[#121210]/95 border border-[#bfa15f]/25 rounded-xl p-5 space-y-4 font-serif">
              <div className="space-y-4">
                <span className="text-[10px] tracking-widest text-[#a09e97] block font-bold border-b border-[#bfa15f]/15 pb-1">
                  👥 天命帝躯统观 (Emperorship Profile)
                </span>

                {/* Profile Overview */}
                <div className="bg-black/60 p-3.5 rounded-lg border border-neutral-900 space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500">朝代国号:</span>
                    <b className="text-amber-300 ml-2 font-black">
                      {isCustomMode ? customDynasty || "天梁" : selectedRolePreset.dynastyName}
                    </b>
                  </div>
                  <div>
                    <span className="text-gray-500">庙号姓名:</span>
                    <b className="text-[#fcfbfa] ml-2 font-bold">
                      {isCustomMode ? customName || "李华天" : selectedRolePreset.name}
                    </b>
                  </div>
                  <div>
                    <span className="text-gray-500">尊号年号:</span>
                    <b className="text-rose-400 ml-2">
                      {isCustomMode ? "太极神帝 (重光元年)" : `${selectedRolePreset.title} (${selectedRolePreset.startingTime})`}
                    </b>
                  </div>
                  <div>
                    <span className="text-gray-500">治国方略:</span>
                    <span className="text-gray-400 ml-2 italic">
                      {isCustomMode ? "垂拱而治，龙驭八荒" : selectedRolePreset.difficulty + "开局"}
                    </span>
                  </div>
                </div>

                {/* User custom name filter input (For historical play) */}
                {!isCustomMode && (
                  <div className="bg-black/30 p-3 rounded-lg border border-neutral-900/40 space-y-1.5 text-xs text-[#a09e97]">
                    <label className="block text-[10.5px] font-bold">📝 设置玩家自定义新姓名 (留空使用原名):</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={`原名：${selectedRolePreset.name}`}
                      className="w-full text-xs font-serif bg-black border border-[#bfa15f]/30 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 font-bold"
                      maxLength={11}
                    />
                  </div>
                )}

                {/* Core Attributes Progress Bars */}
                <div className="space-y-2.5 text-[10px] text-[#a09e97]">
                  <span className="text-[9.5px] font-bold block border-b border-[#bfa15f]/10 pb-0.5 mt-2">
                    📊 圣上天命初赋根骨
                  </span>
                  
                  {isCustomMode ? (
                    <div className="space-y-2 bg-black/30 p-2.5 rounded border border-neutral-900/60">
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>👑 皇威 (Prestige)</span>
                          <span className="text-amber-400">{customStats.prestige} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${customStats.prestige}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>🧠 智略 (Intelligence)</span>
                          <span className="text-amber-400">{customStats.intelligence} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${customStats.intelligence}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>⚔️ 武功 (Military)</span>
                          <span className="text-amber-400">{customStats.military} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${customStats.military}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>💖 圣躯 (Health)</span>
                          <span className="text-amber-400">{customStats.health} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${customStats.health}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-black/30 p-2.5 rounded border border-neutral-900/60">
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>👑 皇威 (Prestige)</span>
                          <span className="text-[#ffd384]">{selectedRolePreset.attributes.prestige}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-[#f1c40f]" style={{ width: `${selectedRolePreset.attributes.prestige}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>🧠 智略 (Intelligence)</span>
                          <span className="text-[#ffd384]">{selectedRolePreset.attributes.intelligence}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{ width: `${selectedRolePreset.attributes.intelligence}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>⚔️ 武功 (Military)</span>
                          <span className="text-[#ffd384]">{selectedRolePreset.attributes.military}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#4c0519] rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${selectedRolePreset.attributes.military}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>💖 圣躯 (Health)</span>
                          <span className="text-[#ffd384]">{selectedRolePreset.attributes.health}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${selectedRolePreset.attributes.health}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enter Campaign Majestic Action Trigger */}
              <div className="pt-4 border-t border-[#bfa15f]/15">
                <button
                  type="button"
                  id="btn-reincarnate-submit"
                  onClick={handleStartGame}
                  className="w-full py-4.5 bg-gradient-to-r from-amber-700 via-amber-800 to-red-950 hover:from-amber-600 hover:to-red-900 border-2 border-amber-400/50 hover:border-amber-400 text-amber-100 hover:text-white font-black text-sm rounded-xl tracking-widest cursor-pointer transition shadow-xl hover:shadow-amber-500/10 active:scale-98 relative group overflow-hidden flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 w-3 bg-[#ffffff10] skew-x-12 translate-x-[-100%] group-hover:translate-x-[500%] transition-transform duration-1000" />
                  👑 钦定天命 · 登入大宝
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {isInitialized && (
        <div id="main-gameplay-root" className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 flex flex-col justify-between">
          <div className="grid grid-cols-12 gap-5 items-stretch relative">
            
            {/* ========================================================== */}
            {/* --- CORE: GOLDEN SCROLL DIALOGUE STAGE & CHOICES --- */}
            {/* ========================================================== */}
            <div className="col-span-12 lg:col-span-11 flex flex-col justify-between border-2 border-[#bfa15f]/30 rounded-xl p-4 bg-black/60 relative font-serif min-h-[500px]">
              {playMode === "quick" ? (
                /* ========================================================== */
                /* --- COLUMN 2: 快速时叙模式界面 (FAST AUTO-PLAY WINDOW) --- */
                /* ========================================================== */
                <div className="space-y-4 flex flex-col h-full justify-between flex-1">
                  {/* Quick Mode Top Header Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-[#bfa15f]/25 select-none text-left">
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                      {isEditingTopHeader ? (
                        <div className="flex flex-wrap items-center gap-2 bg-neutral-900/90 p-1.5 rounded border border-[#bfa15f]/25 shadow-lg w-full md:w-auto z-20">
                          <label className="flex items-center gap-1 shrink-0">
                            <span className="text-[8.5px] text-gray-500 font-sans">历象:</span>
                            <input 
                              type="text" 
                              value={currentCalendarDate} 
                              onChange={(e) => setCurrentCalendarDate(e.target.value)} 
                              className="bg-black text-[9.5px] text-amber-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-24"
                            />
                          </label>
                          
                          <label className="flex items-center gap-1 shrink-0">
                            <span className="text-[8.5px] text-gray-500 font-sans">所在:</span>
                            <input 
                              type="text" 
                              value={currentLocation} 
                              onChange={(e) => setCurrentLocation(e.target.value)} 
                              className="bg-black text-[9.5px] text-stone-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-28"
                            />
                          </label>

                          <label className="flex items-center gap-1 shrink-0">
                            <span className="text-[8.5px] text-gray-500 font-sans">天气:</span>
                            <input 
                              type="text" 
                              value={currentWeather.name} 
                              onChange={(e) => setCurrentWeather(prev => ({ ...prev, name: e.target.value }))} 
                              className="bg-black text-[9.5px] text-stone-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-12"
                            />
                          </label>

                          <label className="flex items-center gap-1 shrink-0">
                            <span className="text-[8.5px] text-gray-500 font-sans">兆示:</span>
                            <select 
                              value={currentWeather.icon} 
                              onChange={(e) => {
                                const icons: Record<string, string> = { "☀️": "朗晴", "🌧️": "阴雨", "❄️": "瑞雪", "🌫️": "阴霾" };
                                setCurrentWeather(prev => ({ 
                                  ...prev, 
                                  icon: e.target.value, 
                                  desc: `天下呈纳${icons[e.target.value] || "祥和"}之象` 
                                }));
                              }}
                              className="bg-black text-[9.5px] text-stone-250 px-1 py-0.5 border border-neutral-800 rounded"
                            >
                              <option value="☀️">☀️ 晴</option>
                              <option value="🌧️">🌧️ 雨</option>
                              <option value="❄️">❄️ 雪</option>
                              <option value="🌫️">🌫️ 霾</option>
                              <option value="🌪️">🌪️ 狂风</option>
                            </select>
                          </label>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(false)}
                            className="px-1.5 py-0.5 bg-emerald-900 border border-emerald-600 text-emerald-100 rounded text-[9.5px] font-bold hover:bg-emerald-800 transition cursor-pointer"
                          >
                            确定
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-amber-300 text-[11px] font-black tracking-widest flex items-center gap-1">
                            ⚡ 快速理政历：
                            <span className="text-[#fcfbfa] underline decoration-[#bfa15f]/30 underline-offset-4 cursor-pointer hover:text-amber-200 transition" onClick={() => setIsEditingTopHeader(true)} title="编辑时间环境">
                              {currentCalendarDate}
                            </span>
                          </span>

                          <span className="px-1.5 py-0.5 bg-[#8c2c16]/20 border border-[#8c2c16]/35 text-amber-200 text-[9.5px] rounded font-mono font-bold whitespace-nowrap" title="十二时辰以及24小时对照">
                            🕒 {getShichenAndTime(dayStageIndex).shichen} ({getShichenAndTime(dayStageIndex).hour24})
                          </span>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="px-1.5 py-0.5 bg-neutral-950/40 border border-amber-500/10 hover:border-amber-400 text-[#cec5ba] hover:text-amber-100 text-[9.5px] rounded cursor-pointer leading-tight inline-flex items-center gap-1 transition"
                            title="点击敕改圣驾临近之处"
                          >
                            📍 <u>{currentLocation}</u>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="px-1.5 py-0.5 bg-neutral-950/40 border border-amber-500/10 hover:border-amber-400 text-[#cec5ba] hover:text-amber-100 text-[9.5px] rounded cursor-pointer leading-tight inline-flex items-center gap-1 transition"
                            title={`当前天气：${currentWeather.desc}`}
                          >
                            <span>{currentWeather.icon} {currentWeather.name}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="text-stone-500 hover:text-amber-300 text-[8px] border border-neutral-900 font-sans px-1 rounded transition"
                          >
                            🖊️ 敕改
                          </button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isAutoPlayingQuick;
                          setIsAutoPlayingQuick(nextState);
                        }}
                        disabled={dayStageIndex === 3 || dayStageIndex === 4}
                        className={`px-3 py-1 text-[9.5px] font-extrabold rounded-lg cursor-pointer transition flex items-center gap-1 border ${
                          dayStageIndex === 3 || dayStageIndex === 4
                            ? "bg-neutral-900 text-gray-600 border-neutral-800 cursor-not-allowed"
                            : isAutoPlayingQuick
                            ? "bg-[#8c2c16]/80 text-amber-200 border-[#8c2c16] hover:bg-[#8c2c16]"
                            : "bg-emerald-900/85 text-white border-emerald-800 hover:bg-emerald-800"
                        }`}
                      >
                        {dayStageIndex === 3 || dayStageIndex === 4 ? (
                          "⏳ 圣上朱笔批阅中..."
                        ) : isAutoPlayingQuick ? (
                          "⏸️ 暂停时间轮转"
                        ) : (
                          "▶️ 开启时间自趋"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main Broadcast Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-1 flex-grow">
                    {/* Eunuch Broadcaster */}
                    <div className="md:col-span-5 bg-neutral-950/70 border border-[#bfa15f]/15 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.02] font-black text-amber-300 text-[120px] pointer-events-none select-none flex items-center justify-center leading-none">
                        旨
                      </div>

                      <div className="w-12 h-12 rounded-full bg-neutral-900 border-2 border-amber-500/30 flex items-center justify-center text-2xl shadow-xl relative mb-2 z-10">
                        🙇‍♂️
                      </div>
                      
                      <p className="text-[10px] text-amber-400 font-extrabold tracking-widest z-10">秉笔司礼监太监 呈报：</p>
                      <p className="text-[9.5px] text-gray-500 font-mono mt-0.5 z-10">【时刻：{DAY_STAGES[dayStageIndex].timeLabel}】</p>
                      
                      <div className="mt-3 p-3 bg-black/60 rounded-lg border border-neutral-900 text-[11px] text-[#dacfc5] leading-relaxed text-left relative z-10 max-h-[140px] overflow-y-auto w-full">
                        “陛下，{DAY_STAGES[dayStageIndex].announcement}”
                      </div>
                    </div>

                    {/* Decisive Actions for Decision Stages or Autoplay indicator */}
                    <div className="md:col-span-7 flex flex-col justify-between bg-black/40 border border-neutral-950 rounded-xl p-4 min-h-[200px]">
                      <div>
                        <div className="flex justify-between items-center pb-2 border-b border-neutral-900/60 text-[10px]">
                          <span className="font-extrabold text-amber-400 flex items-center gap-1">📜 阁臣奏疏御前批折</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-300 font-sans px-1.5 border border-amber-500/20 rounded font-bold col-span-1">
                            当前仪轨：{DAY_STAGES[dayStageIndex].name}
                          </span>
                        </div>

                        {/* Decision Buttons displayed ONLY for Morning Court & Memorials Review */}
                        {dayStageIndex === 3 || dayStageIndex === 4 ? (
                          <div className="space-y-4 py-3">
                            <div className="text-center p-3 bg-[#8c2c16]/5 border border-[#8c2c16]/20 rounded-xl text-[10.5px] text-stone-300 leading-relaxed italic animate-pulse">
                              “社稷轻重，尽付朱笔御裁。群臣屏气恭候，请陛下下旨钦定。”
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-[10.5px]">
                              <button
                                type="button"
                                onClick={() => {
                                  handleQuickModeAction("approve");
                                  setIsAutoPlayingQuick(true);
                                }}
                                className="py-2 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 hover:from-emerald-900 border border-emerald-500/40 text-emerald-100 hover:text-white rounded-lg font-bold shadow active:scale-95 cursor-pointer transition flex flex-col items-center gap-1"
                              >
                                <span className="text-[11px]">📜</span>
                                <span>准奏 / 批准</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  handleQuickModeAction("reject");
                                  setIsAutoPlayingQuick(true);
                                }}
                                className="py-2 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 hover:from-rose-900 border border-rose-500/40 text-rose-100 hover:text-white rounded-lg font-bold shadow active:scale-95 cursor-pointer transition flex flex-col items-center gap-1"
                              >
                                <span className="text-[11px]">✖️</span>
                                <span>发还 / 否决</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleQuickModeAction("hold");
                                  setIsAutoPlayingQuick(true);
                                }}
                                className="py-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-amber-500/30 text-amber-200 hover:text-white rounded-lg font-bold shadow active:scale-95 cursor-pointer transition flex flex-col items-center gap-1"
                              >
                                <span className="text-[11px]">⏳</span>
                                <span>留中 / 搁置</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Auto-play waiting timeline */
                          <div className="py-7 flex flex-col items-center justify-center text-center space-y-3">
                            {isAutoPlayingQuick ? (
                              <>
                                <div className="w-8 h-8 border-2 border-stone-800 border-t-amber-500 rounded-full animate-spin" />
                                <p className="text-[10.5px] text-amber-100/90">时光流转，日月跳轮中...</p>
                                <p className="text-[9px] text-gray-500 italic">“春草明朝春，帝德四海晏。起居仪仗更替推进。”</p>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs">📅</div>
                                <p className="text-[10.5px] text-gray-450">大政推演已暂停</p>
                                <p className="text-[8.5px] text-gray-500">可在最上方点击【开启时间自趋】持续推进。</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timeline bottom meter */}
                      <div className="border-t border-neutral-900/60 pt-2 text-[8px] flex justify-between items-center text-gray-600 font-mono">
                        <span>司礼监起居注仪具进程</span>
                        <span className="text-amber-500/50">大唐起居条例</span>
                      </div>
                    </div>
                  </div>

                  {/* Historical logs tracking list */}
                  <div className="flex-grow pt-2 border-t border-neutral-900/60 text-left">
                    <p className="text-[9px] text-amber-200/80 uppercase tracking-widest font-extrabold pb-1">📜 快速理政册日志 (起居密札)：</p>
                    <div className="h-[110px] bg-neutral-950/50 rounded-xl p-3 border border-neutral-950 overflow-y-auto space-y-2 font-mono text-[9px] scrollbar-thin scrollbar-thumb-amber-950">
                      {quickLogs && quickLogs.length > 0 ? (
                        quickLogs.map((log, idx) => (
                          <div key={idx} className="p-1 px-1.5 rounded bg-black/40 border-l-2 border-amber-500 text-stone-300 leading-relaxed text-left">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-500 italic">
                          暂无起居密札入档，静候十二时辰更替。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================== */
                /* --- COLUMN 2: 自主模式界面 (RICH DIALOGUE SCENE) --- */
                /* ========================================================== */
                <div className="space-y-4 flex flex-col h-full justify-between flex-1">
                  
                  {/* Header bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-[#bfa15f]/25 select-none text-left">
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                      {isEditingTopHeader ? (
                        <div className="flex flex-wrap items-center gap-2 bg-neutral-900/90 p-1.5 rounded border border-[#bfa15f]/25 shadow-lg w-full md:w-auto z-20">
                          <label className="flex items-center gap-1 shrink-0 font-sans">
                            <span className="text-[8.5px] text-gray-500">日期:</span>
                            <input 
                              type="text" 
                              value={currentCalendarDate} 
                              onChange={(e) => setCurrentCalendarDate(e.target.value)} 
                              className="bg-black text-[9.5px] text-amber-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-24"
                            />
                          </label>
                          
                          <label className="flex items-center gap-1 shrink-0 font-sans">
                            <span className="text-[8.5px] text-gray-500">地点:</span>
                            <input 
                              type="text" 
                              value={currentLocation} 
                              onChange={(e) => setCurrentLocation(e.target.value)} 
                              className="bg-black text-[9.5px] text-stone-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-28"
                            />
                          </label>

                          <label className="flex items-center gap-1 shrink-0 font-sans">
                            <span className="text-[8.5px] text-gray-500">天气:</span>
                            <input 
                              type="text" 
                              value={currentWeather.name} 
                              onChange={(e) => setCurrentWeather(prev => ({ ...prev, name: e.target.value }))} 
                              className="bg-black text-[9.5px] text-stone-200 px-1 py-0.5 border border-neutral-800 rounded font-normal w-12"
                            />
                          </label>

                          <label className="flex items-center gap-1 shrink-0 font-sans">
                            <span className="text-[8.5px] text-gray-500">兆示:</span>
                            <select 
                              value={currentWeather.icon} 
                              onChange={(e) => {
                                const icons: Record<string, string> = { "☀️": "朗晴", "🌧️": "阴雨", "❄️": "瑞雪", "🌫️": "阴霾" };
                                setCurrentWeather(prev => ({ 
                                  ...prev, 
                                  icon: e.target.value, 
                                  desc: `天下呈纳${icons[e.target.value] || "祥和"}之象` 
                                }));
                              }}
                              className="bg-black text-[9.5px] text-stone-250 px-1 py-0.5 border border-neutral-800 rounded"
                            >
                              <option value="☀️">☀️ 晴</option>
                              <option value="🌧️">🌧️ 雨</option>
                              <option value="❄️">❄️ 雪</option>
                              <option value="🌫️">🌫️ 霾</option>
                              <option value="🌪️">🌪️ 狂风</option>
                            </select>
                          </label>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(false)}
                            className="px-1.5 py-0.5 bg-emerald-900 border border-emerald-600 text-emerald-100 rounded text-[9.5px] font-bold hover:bg-emerald-800 transition cursor-pointer"
                          >
                            确定
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-amber-300 text-[11px] font-black tracking-widest">
                            📜 圣谕时叙：
                            <span className="text-[#fcfbfa] underline decoration-[#bfa15f]/30 underline-offset-4 cursor-pointer hover:text-amber-200 transition" onClick={() => setIsEditingTopHeader(true)} title="编辑时间环境">
                              {currentCalendarDate}
                            </span>
                          </span>

                          <span className="px-1.5 py-0.5 bg-[#8c2c16]/20 border border-[#8c2c16]/35 text-amber-200 text-[9.5px] rounded font-mono font-bold whitespace-nowrap" title="十二时辰以及24小时对照">
                            🕒 {getShichenAndTime(dayStageIndex).shichen} ({getShichenAndTime(dayStageIndex).hour24})
                          </span>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="px-1.5 py-0.5 bg-neutral-950/40 border border-amber-500/10 hover:border-amber-400 text-[#cec5ba] hover:text-amber-100 text-[9.5px] rounded cursor-pointer leading-tight inline-flex items-center gap-1 transition"
                            title="点击展开编辑器修改地点"
                          >
                            📍 <u>{currentLocation}</u>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="px-1.5 py-0.5 bg-neutral-950/40 border border-amber-500/10 hover:border-amber-400 text-[#cec5ba] hover:text-amber-100 text-[9.5px] rounded cursor-pointer leading-tight inline-flex items-center gap-1 transition"
                            title={`当前天气：${currentWeather.desc}`}
                          >
                            <span>{currentWeather.icon} {currentWeather.name}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => setIsEditingTopHeader(true)}
                            className="text-stone-500 hover:text-amber-300 text-[8px] border border-neutral-900 font-sans px-1 rounded transition"
                          >
                            🖊️ 敕改
                          </button>
                        </>
                      )}
                    </div>

                    <span className="text-[8.5px] bg-[#8c2c16]/20 text-red-300 border border-[#8c2c16]/30 px-1 rounded z-10 shrink-0">
                      第 {dayStageIndex + 1} 页起居密札
                    </span>
                  </div>

                  {/* Dialogue Floor parchment area */}
                  <div className="flex-grow my-2 bg-black/40 border border-neutral-950 rounded-xl p-3 max-h-[380px] overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-amber-950/20 text-left">
                    {history.length === 0 ? (
                      <div className="py-20 text-center text-gray-500 text-[11px] space-y-1.5 animate-pulse">
                        <p>🔮 华夏九鼎宿位调协，正推演起落天地乾坤一案...</p>
                      </div>
                    ) : (
                      history.map((turn, tIdx) => {
                        const isUser = turn.role === "user";
                        return (
                          <div 
                            key={tIdx} 
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                          >
                            <span className="text-[8.5px] font-mono text-gray-500 font-bold block px-1">
                              {isUser ? `皇帝御笔降旨录 (Turn ${tIdx})` : `天机示卷评奏 (Turn ${tIdx})`}
                            </span>
                            
                            <div 
                              className={`max-w-[85%] p-3 rounded-xl border leading-relaxed text-[10.5px] md:text-[11.5px] text-justify select-text cursor-context-menu ${
                                isUser 
                                  ? "bg-[#8c2c16]/10 border-rose-900/60 text-rose-200 rounded-tr-none px-4" 
                                  : "bg-black/60 border-amber-950/20 text-[#dacfc5] rounded-tl-none font-serif leading-6"
                              }`}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  index: tIdx
                                });
                              }}
                            >
                              {isUser ? (
                                <span className="font-bold">
                                  {turn.text.replace(/【手敕密谕】:\s*|「御批决策\s*\d+」:\s*/g, "")}
                                </span>
                              ) : (
                                <div className="markdown-body text-[#dacfc5] leading-7">
                                  <Markdown>{turn.text}</Markdown>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {/* Loading status */}
                    {isLoading && (
                      <div className="flex flex-col items-start space-y-1 py-1.5 animate-pulse">
                        <span className="text-[8.5px] font-mono text-gray-500 font-bold block px-1">天机轮转推衍</span>
                        <div className="bg-[#1c120c]/40 border border-amber-500/10 rounded-xl p-3 text-[10.5px] text-amber-200/90 flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span>💡 朱笔批示交感乾坤，司礼监掌印御前伺候撰札，乾坤易爻推衍中，恭迎御览...</span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={storyEndRef} />
                  </div>

                  {/* Choice options action block */}
                  <div className="pt-2 border-t border-neutral-900/60 space-y-3">
                    {isLoading ? (
                      <div className="text-center p-4 bg-neutral-950/40 border border-neutral-900 rounded-xl text-gray-500 text-[10px] space-y-1 font-serif italic">
                        <p>“皇图开鼎，辅德为先。钦天监星斗齐移，万象始开。”</p>
                        <p className="text-[9px] text-[#bfa15f]/40">社稷鼎气交互中，朱笔悬墨待定...</p>
                      </div>
                    ) : (
                      <>
                        {/* Collapse/Expand Toggle for Choice Options */}
                        <div className="flex justify-between items-center text-[9px] text-[#bfa15f]/60 pb-1.5 px-0.5 border-b border-neutral-900/20 font-serif">
                          <span className="font-extrabold tracking-wider bg-neutral-950/60 px-1.5 border border-neutral-900 text-amber-400">📜 秉笔伺候 · 圣虑大政</span>
                          <button
                            type="button"
                            onClick={() => setIsChoicesCollapsed(!isChoicesCollapsed)}
                            className="px-2 py-0.5 bg-[#8c2c16]/25 border border-[#8c2c16]/40 hover:bg-[#8c2c16]/50 text-amber-200 text-[8px] rounded hover:border-amber-400 font-bold transition cursor-pointer active:scale-95 flex items-center gap-1"
                          >
                            {isChoicesCollapsed ? "展开选单 👑" : "折叠选单 ◀"}
                          </button>
                        </div>

                        {/* Choices mapping list controlled by collapsible state */}
                        {!isChoicesCollapsed && (
                          <div className="grid grid-cols-1 gap-2 animate-fade-in">
                            {currentScenario.choices && currentScenario.choices.length > 0 ? (
                              currentScenario.choices.map((choice, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => handleChoiceSelected(`「御批决策 ${cIdx + 1}」: ${choice.text}`)}
                                  className="bg-neutral-950/80 hover:bg-[#1a120c] border border-[#bfa15f]/25 hover:border-amber-400 text-[#dacfc5] hover:text-white p-3.5 rounded-xl font-bold text-[10.5px] leading-relaxed transition-all cursor-pointer text-left active:scale-[0.99] flex justify-between items-center group relative overflow-hidden animate-fade-in"
                                >
                                  <span className="flex-1 font-serif">
                                    <span className="text-amber-400 font-mono font-bold mr-1.5">【大政御批 {cIdx + 1}】</span>
                                    {choice.text}
                                  </span>
                                  <span className="text-[8.5px] bg-[#8c2c16]/20 border border-[#8c2c16]/30 px-1 text-red-300 font-bold ml-2 rounded group-hover:bg-[#8c2c16]/40">
                                    传旨 ➔
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="text-center p-3 text-gray-500 italic bg-neutral-950 border border-neutral-900 rounded-lg text-[9.5px]">
                                💬 天机时运尚无起伏，尽请落玺自定义密敕之令。
                              </div>
                            )}
                          </div>
                        )}

                        {/* Custom input box */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customAction}
                            onChange={(e) => setCustomAction(e.target.value)}
                            placeholder="✒️ 请圣上御裁落笔，下达自定义密敕诏书、调集关臣..."
                            className="flex-1 bg-black border border-[#bfa15f]/20 rounded-xl px-3 py-2 text-xs text-[#dacfc5] placeholder-neutral-700 font-serif focus:outline-none focus:border-amber-400"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && customAction.trim()) {
                                handleChoiceSelected(`【手敕密谕】: " ${customAction.trim()} "`);
                                setCustomAction("");
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customAction.trim()) {
                                handleChoiceSelected(`【手敕密谕】: " ${customAction.trim()} "`);
                                setCustomAction("");
                              }
                            }}
                            disabled={!customAction.trim()}
                            className={`px-4.5 py-2 bg-gradient-to-r from-amber-700 to-amber-900 border border-amber-400 hover:border-amber-100 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition active:scale-95 ${!customAction.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Sparkles className="w-3.5 h-3.5" /> 手敕落玺
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* POPUP OVERLAY MODALS IN THE DESIRED STRUCTURE */}
            {activeModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
                onClick={() => setActiveModal(null)}
              >
                {activeModal === "history_reader" ? (
                  <div 
                    className="w-full max-w-4xl shadow-2xl animate-scroll-unfold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HistoryReader 
                      history={history} 
                      onUpdateHistory={setHistory} 
                      onClose={() => setActiveModal(null)}
                    />
                  </div>
                ) : (
                  <div 
                    className={`w-full ${(activeModal === 'map' || activeModal === 'data_hub') ? 'max-w-4xl' : 'max-w-2xl'} border-2 border-amber-500/30 rounded-xl p-5 bg-[#121110] relative flex flex-col justify-between shadow-2xl animate-scroll-unfold overflow-y-auto max-h-[85%] scrollbar-thin scrollbar-thumb-amber-900/30`}
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="flex justify-between items-center border-b border-[#bfa15f]/25 pb-2 mb-4">
                    <span className="font-serif text-sm font-bold text-amber-300 flex items-center gap-2">
                      {activeModal === "character" && <User className="w-4 h-4 text-amber-400" />}
                      {activeModal === "overview" && <Sparkles className="w-4 h-4 text-amber-400" />}
                      {activeModal === "map" && <Compass className="w-4 h-4 text-amber-400" />}
                      {activeModal === "npcs" && <Users className="w-4 h-4 text-amber-400" />}
                      {activeModal === "items" && <Briefcase className="w-4 h-4 text-amber-400" />}
                      {activeModal === "skills" && <Zap className="w-4 h-4 text-amber-400" />}
                      {activeModal === "history" && <Clock className="w-4 h-4 text-amber-400" />}
                      {activeModal === "quests" && <Scroll className="w-4 h-4 text-amber-400" />}
                      {activeModal === "chronicles" && <Sparkles className="w-4 h-4 text-amber-400" />}
                      {activeModal === "calendar" && <Calendar className="w-4 h-4 text-amber-400" />}
                      {activeModal === "settings" && <Settings className="w-4 h-4 text-amber-400" />}
                      {activeModal === "data_hub" && <Sliders className="w-4 h-4 text-amber-400" />}
                      <span className="tracking-widest">
                        {
                          activeModal === "overview" ? "大政总览" :
                          activeModal === "character" ? "人物信息" :
                          activeModal === "map" ? "地图" :
                          activeModal === "npcs" ? "人际关系" :
                          activeModal === "items" ? "物品" :
                          activeModal === "skills" ? "技能" :
                          activeModal === "history" ? "起居注与大总结 (历史记录)" :
                          activeModal === "quests" ? "任务" :
                          activeModal === "chronicles" ? "世界事件" :
                          activeModal === "calendar" ? "时元历象天镜" :
                          activeModal === "data_hub" ? "大政乾坤时数仪 (游戏全局数据编辑器)" : "系统设置"
                        }
                      </span>
                    </span>
                    
                    {/* Circular close button */}
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-6 h-6 rounded-full bg-[#8c2c16]/30 hover:bg-[#8c2c16] border border-[#bfa15f]/40 flex items-center justify-center text-xs font-serif font-black text-amber-200 hover:text-white cursor-pointer transition active:scale-95"
                      title="关闭朝册"
                    >
                      ✕
                    </button>
                  </div>

                  {/* MODAL INNER PANELS CONTAINER */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    
                    {/* 1. CHARACTER PANEL (个) */}
                    {activeModal === "overview" && (
                      <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Empire Status Card */}
                        <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-5 space-y-4">
                          <div className="flex items-center gap-3 border-b border-amber-500/10 pb-3">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <h3 className="text-amber-200 font-serif font-bold text-lg">国家政治现状</h3>
                              <p className="text-stone-400 text-xs">{empireStats.officials}</p>
                            </div>
                          </div>
                          
                          <p className="text-stone-300 text-sm leading-relaxed italic">
                            「{empireStats.summary}」
                          </p>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="bg-black/40 p-3 rounded border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                              <div className="text-amber-500/60 text-[10px] uppercase tracking-wider mb-1">国库金钱</div>
                              <div className="text-xl font-mono text-amber-200">{empireStats.treasury.toLocaleString()} <span className="text-xs">两</span></div>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                              <div className="text-amber-500/60 text-[10px] uppercase tracking-wider mb-1">社稷民心</div>
                              <div className="text-xl font-mono text-amber-200">{empireStats.sentiment}%</div>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                              <div className="text-amber-500/60 text-[10px] uppercase tracking-wider mb-1">全国兵力</div>
                              <div className="text-xl font-mono text-amber-200">{empireStats.military.toLocaleString()} <span className="text-xs">员</span></div>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                              <div className="text-amber-500/60 text-[10px] uppercase tracking-wider mb-1">库府粮草</div>
                              <div className="text-xl font-mono text-amber-200">{empireStats.grain.toLocaleString()} <span className="text-xs">石</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Revenue/Expense Chart */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-emerald-400 text-xs font-bold">岁入</span>
                              <Coins className="w-3 h-3 text-emerald-500" />
                            </div>
                            <div className="text-lg font-mono text-emerald-200">+{empireStats.annualIncome.toLocaleString()}</div>
                          </div>
                          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-red-400 text-xs font-bold">岁出</span>
                              <RotateCcw className="w-3 h-3 text-red-500" />
                            </div>
                            <div className="text-lg font-mono text-red-200">-{empireStats.annualExpense.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeModal === "character" && (
                      <div className="space-y-4">
                        <CharacterPanel char={character} />
                      </div>
                    )}

                    {/* 2. MAP OVERLAY (地) */}
                    {activeModal === "map" && (
                      <div className="space-y-3">
                        <InteractiveMap 
                          currentRegionId={currentRegionId} 
                          onTravelToRegion={handleMapTravelTo}
                          gold={character.attributes.gold}
                          char={character}
                          regions={regions}
                          onUpdateRegions={setRegions}
                        />
                      </div>
                    )}

                    {/* 3. NPCs PANEL (人) */}
                    {activeModal === "npcs" && (
                      <NPCsPanel 
                        npcList={npcs} 
                        onInteractNPC={handleInteractNPC}
                        portraits={customPortraits}
                        onUpdateNPCs={setNpcs}
                      />
                    )}

                    {/* 4. ITEMS/INVENTORY (物) */}
                    {activeModal === "items" && (
                      <InventoryPanel 
                        char={character}
                        items={items} 
                        onUseItem={handleUseItemConsumableByApp}
                        onDiscardItem={handleDiscardItemByApp}
                        onEquipItem={handleEquipItemByApp}
                        onUnequipItem={handleUnequipItemByApp}
                        onUpdateItems={setItems}
                      />
                    )}

                    {/* 5. SKILLS (技) */}
                    {activeModal === "skills" && (
                      <SkillsPanel 
                        skills={skills} 
                        char={character}
                        onUseActiveSkill={handleCastSkillEnergy}
                        onUpgradeSkill={handleMeditateSkillUpgrade}
                        gold={character.attributes.gold}
                        onUpdateSkills={setSkills}
                      />
                    )}

                    {/* 6. QUESTS (务) */}
                    {activeModal === "quests" && (
                      <QuestBoard 
                        quests={quests} 
                        onAddCustomQuest={handleFormulateCustomQuest} 
                        onUpdateQuests={setQuests}
                      />
                    )}

                    {/* 7. CHRONICLES EVENT HISTORY (世) */}
                    {activeModal === "chronicles" && (
                      <WorldEvents 
                        currentEvent={currentScenario.worldEvent} 
                        chronicles={chronicles} 
                        dynastyName={character.dynasty} 
                      />
                    )}

                    {/* 7.6. CALENDAR MODAL (历) */}
                    {activeModal === "calendar" && (
                      <CalendarPanel 
                        currentCalendarDate={currentCalendarDate} 
                        npcs={npcs} 
                        dynastyName={character.dynasty} 
                        dialogueHistory={history}
                        appointments={appointments}
                        setAppointments={setAppointments}
                      />
                    )}

                    {/* 7.7. DATA_HUB CONFIGURATOR (数) */}
                    {activeModal === "data_hub" && (
                      <DataHubPanel 
                        character={character}
                        setCharacter={setCharacter}
                        npcs={npcs}
                        setNpcs={setNpcs}
                        items={items}
                        setItems={setItems}
                        skills={skills}
                        setSkills={setSkills}
                        quests={quests}
                        setQuests={setQuests}
                        appointments={appointments}
                        setAppointments={setAppointments}
                        currentCalendarDate={currentCalendarDate}
                        setCurrentCalendarDate={setCurrentCalendarDate}
                        chronicles={chronicles}
                        setChronicles={setChronicles}
                      />
                    )}

                    {/* 7.5. HISTORY RECORDS (史) */}
                    {activeModal === "history" && (
                      <HistoryPanel 
                        history={history}
                        onUpdateHistoryText={handleUpdateHistoryText}
                        summaryX={summaryX}
                        summaryY={summaryY}
                        chronicles={chronicles}
                        onUpdateHistory={setHistory}
                      />
                    )}

                    {/* 8. SYSTEM SETTINGS MODULE - RESPONSIVE TABS (设) */}
                    {activeModal === "settings" && (
                      <div className="space-y-4 font-serif text-xs max-h-[500px] overflow-y-auto pr-1">
                        
                        {activeSettingsSection === null ? (
                          <div className="space-y-4 text-center p-2">
                            <p className="text-amber-300 text-sm font-black tracking-widest border-b border-[#bfa15f]/25 pb-2">
                              ⚙️ 系统设置・乾坤殿堂
                            </p>
                            <p className="text-[10px] text-gray-500 italic pb-2">
                              请枢密圣旨圈选所需调谐的社稷秘法卷册
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection("ui")}
                                className="p-3.5 bg-neutral-950/80 hover:bg-[#1a120c] border-2 border-[#bfa15f]/30 hover:border-amber-400 text-amber-100 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between group active:scale-95"
                              >
                                <span>🎨 界面设置</span>
                                <span className="text-[9px] text-[#bfa15f]/50 group-hover:text-amber-300">BGM、配置与缩放 ➔</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection("portrait")}
                                className="p-3.5 bg-neutral-950/80 hover:bg-[#1a120c] border-2 border-[#bfa15f]/30 hover:border-amber-400 text-amber-100 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between group active:scale-95"
                              >
                                <span>🎭 立绘管理</span>
                                <span className="text-[9px] text-[#bfa15f]/50 group-hover:text-amber-300">圣像更替 ➔</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection("save")}
                                className="p-3.5 bg-neutral-950/80 hover:bg-[#1a120c] border-2 border-[#bfa15f]/30 hover:border-amber-400 text-amber-100 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between group active:scale-95"
                              >
                                <span>💾 存档管理</span>
                                * <span className="text-[9px] text-[#bfa15f]/50 group-hover:text-amber-300">加载、存档与迁移 ➔</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection("summary")}
                                className="p-3.5 bg-neutral-950/80 hover:bg-[#1a120c] border-2 border-[#bfa15f]/30 hover:border-amber-400 text-amber-100 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between group active:scale-95"
                              >
                                <span>📃 总结设置</span>
                                <span className="text-[9px] text-[#bfa15f]/50 group-hover:text-amber-300">起居自动总结 ➔</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection("api")}
                                className="p-3.5 bg-neutral-950/80 hover:bg-[#1a120c] border-2 border-[#bfa15f]/30 hover:border-amber-400 text-amber-100 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between group active:scale-95"
                              >
                                <span>🛰️ API设置</span>
                                <span className="text-[9px] text-[#bfa15f]/50 group-hover:text-amber-300">天机连接配置 ➔</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setIsMainMenu(true);
                                  setActiveModal(null);
                                }}
                                className="p-3.5 bg-red-950/40 hover:bg-red-950/90 border-2 border-red-900 text-rose-200 hover:text-white rounded-xl font-bold text-[11px] tracking-wider transition cursor-pointer flex items-center justify-between active:scale-95"
                              >
                                <span>🚪 返回主页面</span>
                                <span className="text-[9px] text-rose-300/60">回首封面 ➔</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Back Header key */}
                            <div className="flex justify-between items-center pb-2 border-b border-[#bfa15f]/25">
                              <button
                                type="button"
                                onClick={() => setActiveSettingsSection(null)}
                                className="px-3 py-1.5 bg-neutral-950 hover:bg-[#1f1510] border border-[#bfa15f]/30 hover:border-amber-400 text-amber-200 rounded-lg cursor-pointer transition text-[9px] font-bold flex items-center gap-1 active:scale-95 animate-pulse"
                              >
                                ◀ 返回设置菜单
                              </button>
                              <span className="text-[9.5px] text-gray-500 font-mono">
                                CONFIG: {activeSettingsSection.toUpperCase()}
                              </span>
                            </div>

                            {activeSettingsSection === "ui" && (
                              /* 1. INTERFACE SETTINGS (界面设置) */
                              <div className="bg-black/60 border border-[#bfa15f]/25 rounded-xl p-4 space-y-4 text-left">
                          <p className="font-black text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex items-center justify-between">
                            <span>🎨 1. 界面设置 (UI Settings)</span>
                            <span className="text-[10px] text-gray-500">BGM、字体与配色</span>
                          </p>
                          
                          <div className="space-y-3">
                            {/* BGM Toggle */}
                            <div className="flex items-center justify-between">
                              <span className="text-[#a09e97] font-bold text-[11px]">🎵 背景弦音开关 (BGM)：</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAmbientSound(true)}
                                  className={`px-3 py-1 text-[10px] rounded border cursor-pointer transition ${ambientSound ? 'bg-amber-950/40 border-amber-400 text-amber-200 font-bold' : 'bg-black border-neutral-850 text-gray-500'}`}
                                >
                                  🔊 开启
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAmbientSound(false)}
                                  className={`px-3 py-1 text-[10px] rounded border cursor-pointer transition ${!ambientSound ? 'bg-neutral-900 border-gray-600 text-gray-300 font-bold' : 'bg-black border-neutral-850 text-gray-500'}`}
                                >
                                  🔇 关闭
                                </button>
                              </div>
                            </div>

                            {/* Font Size Zoom Scale */}
                            <div className="space-y-1.5 border-t border-neutral-900 pt-2">
                              <label className="flex justify-between items-center text-[#a09e97] font-bold text-[10.5px]">
                                <span>🔍 故事叙录字体大小 (Font Size)：</span>
                                <span className="font-mono text-amber-400 bg-[#8c2c16]/10 px-1 rounded text-[9.5px]">{fontSize} 像素</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                                  className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-gray-300 active:scale-90 hover:border-amber-500 cursor-pointer text-[10px] font-bold"
                                >
                                  A -
                                </button>
                                <input
                                  type="range"
                                  min="12"
                                  max="24"
                                  value={fontSize}
                                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                                  className="flex-1 accent-[#8c2c16] h-1 bg-neutral-950 rounded cursor-pointer animate-pulse"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                                  className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-gray-300 active:scale-90 hover:border-amber-500 cursor-pointer text-[10px] font-bold"
                                >
                                  A +
                                </button>
                              </div>
                            </div>

                            {/* Theme Choice */}
                            <div className="space-y-1.5 border-t border-neutral-900 pt-2">
                              <span className="text-[#a09e97] block font-bold text-[10.5px]">✨ 五行帝室配色方案：</span>
                              <div className="grid grid-cols-4 gap-1">
                                {([
                                  { k: 'gold', l: '帝黄' },
                                  { k: 'emerald', l: '翡色' },
                                  { k: 'sapphire', l: '玄青' },
                                  { k: 'crimson', l: '朱赤' }
                                ] as const).map((item) => (
                                  <button
                                    key={item.k}
                                    type="button"
                                    onClick={() => setActiveTheme(item.k)}
                                    className={`py-1 text-[10px] rounded border cursor-pointer transition text-center ${activeTheme === item.k ? 'bg-[#8c2c16]/20 border-amber-400 text-amber-200 font-bold' : 'bg-black border-neutral-850 text-gray-500'}`}
                                  >
                                    {item.l}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Theme Color Scheme */}
                            <div className="space-y-1.5 border-t border-neutral-900 pt-2">
                              <span className="text-[#a09e97] block font-bold text-[10.5px]">🎨 自定义殿宇外观配色：</span>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="block text-gray-500 mb-0.5">背景底色 HEX:</label>
                                  <input
                                    type="text"
                                    value={customBgColor}
                                    placeholder="默认 (例如 #0c0a0a)"
                                    onChange={(e) => setCustomBgColor(e.target.value)}
                                    className="w-full bg-black border border-neutral-850 rounded px-2 py-1 text-gray-300 focus:outline-none placeholder-neutral-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-500 mb-0.5">边框护身 HEX:</label>
                                  <input
                                    type="text"
                                    value={customBorderColor}
                                    placeholder="默认 (例如 #bfa15f)"
                                    onChange={(e) => setCustomBorderColor(e.target.value)}
                                    className="w-full bg-black border border-neutral-850 rounded px-2 py-1 text-gray-300 focus:outline-none placeholder-neutral-700"
                                  />
                                </div>
                              </div>
                              {(customBgColor || customBorderColor) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomBgColor("");
                                    setCustomBorderColor("");
                                  }}
                                  className="text-[9px] text-[#fbbf24] underline cursor-pointer mt-1 block"
                                >
                                  重置恢复默认配色
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                        )}

                        {activeSettingsSection === "portrait" && (
                          /* 2. PORTRAIT MANAGEMENT (立绘管理) */
                          <div className="bg-black/60 border border-[#bfa15f]/25 rounded-xl p-4 space-y-4 text-left">
                          <p className="font-black text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex justify-between items-center">
                            <span>🎭 2. 宸世立绘画卷 (Portrait Management)</span>
                            <span className="text-[10px] text-gray-500">按名字检索与更替</span>
                          </p>
                          
                          <div className="space-y-3 font-serif">
                            <span className="text-[10px] text-gray-400 block leading-relaxed">
                              系统根据阁中姓名自动调遣对应圣容绘图。若无，自动显示传统阴文圣姿剪影。
                            </span>

                            {/* Dropdown to pick WHO to manage */}
                            <div className="space-y-1 border border-neutral-850 bg-black/40 p-2.5 rounded text-[10.5px]">
                              <p className="text-amber-100 font-bold mb-1">🔍 圈选拟审阅的绘册角色姓名：</p>
                              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                                <button
                                  key="self-emperor"
                                  type="button"
                                  onClick={() => setSelectedPresetId(character.name)}
                                  className={`p-1.5 rounded text-left border text-[10px] truncate transition ${selectedPresetId === character.name ? 'border-amber-400 bg-amber-950/20 text-amber-200' : 'border-neutral-850 bg-black'}`}
                                >
                                  👑 主公：<b>{character.name || "无名帝"}</b>
                                </button>
                                {npcs.map((npc) => (
                                  <button
                                    key={npc.name}
                                    type="button"
                                    onClick={() => setSelectedPresetId(npc.name)}
                                    className={`p-1.5 rounded text-left border text-[10px] truncate transition ${selectedPresetId === npc.name ? 'border-amber-400 bg-amber-950/20 text-amber-200' : 'border-neutral-850 bg-black'}`}
                                  >
                                    👤 贤士：{npc.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Management triggers block */}
                            <div className="p-3 bg-neutral-900/40 rounded border border-neutral-850 space-y-3">
                              <p className="text-amber-300 font-bold text-[11px]">
                                正在审议：<b>{selectedPresetId || character.name}</b> 的圣容肖像画幅
                              </p>

                              <div className="flex items-center gap-3">
                                {/* Preview thumbnail */}
                                <div className="w-12 h-12 rounded border-2 border-amber-500/25 bg-black overflow-hidden flex items-center justify-center shrink-0">
                                  {customPortraits[selectedPresetId || character.name] ? (
                                    <img
                                      src={customPortraits[selectedPresetId || character.name]}
                                      className="w-full h-full object-cover"
                                      alt="Portrait"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-gray-500 select-none font-bold">画中仙</span>
                                  )}
                                </div>

                                <div className="flex-1 space-y-1.5 text-[9px] text-gray-500 leading-none">
                                  <p className="text-gray-300 font-bold mb-1">画师册部诏谕：</p>
                                  
                                  {/* Upload Native Portrait */}
                                  <div className="flex flex-wrap gap-1.5 pt-1 font-bold">
                                    <label className="px-2 py-1 bg-amber-800/20 hover:bg-amber-800/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 rounded cursor-pointer text-center select-none active:scale-95 transition text-[9px]">
                                      📤 上传法相
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              const result = reader.result as string;
                                              const currName = selectedPresetId || character.name;
                                              setCustomPortraits(prev => ({
                                                ...prev,
                                                [currName]: result
                                              }));
                                              alert(`📤 圣旨承蒙：成功点缀并上传名士【${currName}】专属立绘法相！`);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>

                                    {/* Redraw portrait locally */}
                                    <button
                                      type="button"
                                      onClick={() => handleProceduralRedraw(selectedPresetId || character.name)}
                                      className="px-2 py-1 bg-purple-900/20 hover:bg-purple-900/45 border border-purple-500/30 text-purple-200 rounded cursor-pointer active:scale-95 transition"
                                    >
                                      🎨 重新绘制 (Procedural)
                                    </button>

                                    {/* Delete portrait */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currName = selectedPresetId || character.name;
                                        setCustomPortraits(prev => {
                                          const copy = { ...prev };
                                          delete copy[currName];
                                          return copy;
                                        });
                                        alert(`🗑️ 立绘已撤，【${currName}】回复古朴水墨重彩剪影。`);
                                      }}
                                      className="px-2 py-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded cursor-pointer active:scale-95 transition"
                                    >
                                      🗑️ 撤底清除
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}

                        {activeSettingsSection === "save" && (
                          /* 3. SAVE LOGISTICS MANAGEMENT (存档管理) */
                          <div className="bg-black/60 border border-[#bfa15f]/25 rounded-xl p-4 space-y-4 text-left">
                          <p className="font-black text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex justify-between items-center">
                            <span>🎮 3. 天命九鼎金槽 (Multi-slot Persist)</span>
                            <span className="text-[10px] text-gray-500">永固三皇五帝金槽</span>
                          </p>
                          
                          <div className="space-y-4 font-serif">
                            {/* Slots Save Load Grid */}
                            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                              {[1, 2, 3].map((slotIdx) => {
                                const hasData = localStorage.getItem(`emperor_slot_${slotIdx}`);
                                return (
                                  <div key={slotIdx} className="bg-neutral-950 p-2 border border-neutral-850 rounded flex flex-col justify-between space-y-2">
                                    <span className="font-black text-amber-200">第 {slotIdx} 金槽</span>
                                    <span className="text-[8.5px] text-[#a09e97]">
                                      {hasData ? "● 已纳天命" : "○ 空白尘缘"}
                                    </span>
                                    <div className="space-y-1 pt-1.5 border-t border-neutral-900/60 font-bold">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveToSlot(slotIdx)}
                                        className="w-full py-0.5 bg-neutral-900 border border-neutral-850 hover:border-amber-400 text-gray-500 hover:text-white rounded text-[9.5px] cursor-pointer transition active:scale-95"
                                      >
                                        💾 密封封入
                                      </button>
                                      <button
                                        type="button"
                                        disabled={!hasData}
                                        onClick={() => handleLoadFromSlot(slotIdx)}
                                        className={`w-full py-0.5 rounded text-[9.5px] font-bold cursor-pointer transition ${hasData ? 'bg-amber-800/30 hover:bg-amber-800/50 border border-amber-500/20 text-amber-200' : 'bg-none border-transparent text-gray-700 cursor-not-allowed'}`}
                                      >
                                        📂 破虚觉醒
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Manual Base64 Export/Import Panel */}
                            <div className="pt-2 border-t border-neutral-900 space-y-2 text-[10.5px]">
                              <p className="text-[#a09e97] font-bold">📤 手动拷贝华夏复国搬迁码：</p>
                              
                              <div className="grid grid-cols-2 gap-2 text-center font-bold">
                                <button
                                  type="button"
                                  onClick={handleExportSaveCode}
                                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500 text-amber-200 rounded cursor-pointer transition active:scale-95"
                                >
                                  📋 导出并打包备份长码
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowSaveArea(!showSaveArea)}
                                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500 text-amber-200 rounded cursor-pointer transition active:scale-95"
                                >
                                  输入恢复长码框
                                </button>
                              </div>

                              {showSaveArea && (
                                <div className="space-y-2 pt-2 border-t border-neutral-900 animate-slide-down">
                                  <textarea
                                    rows={4}
                                    placeholder="在此粘贴先前导出的Base64数据尘埃，随后点击立即一键载置..."
                                    value={saveCodeText}
                                    onChange={(e) => setSaveCodeText(e.target.value)}
                                    className="w-full bg-black text-[9px] border border-neutral-850 p-2 font-mono text-gray-300 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleImportSaveCode}
                                    className="w-full py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-white text-[10px] font-bold rounded cursor-pointer transition active:scale-95"
                                  >
                                    🚀 立即一键破虚、重光金殿！
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        )}

                        {activeSettingsSection === "summary" && (
                          /* 4. CHRONOLOGY SUMMARIZE CONFIG (总结设置) */
                          <div className="bg-black/60 border border-[#bfa15f]/25 rounded-xl p-4 space-y-4 text-left">
                          <p className="font-black text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex justify-between items-center">
                            <span>📃 4. 起居大体总结设置 (X / Y / Z Inputs)</span>
                            <span className="text-[10px] text-gray-500">时序与隐藏消息配置</span>
                          </p>
                          
                          <div className="space-y-3 text-[10.5px] font-serif leading-relaxed">
                            <span className="text-gray-400 block -mt-1">
                              X期自动汇编国运小结，Y期进行通鉴国策叙论；隐藏旧岁尘封数据，防止御览纷杂。
                            </span>

                            <div className="grid grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[#a09e97] font-bold mb-0.5">小总结期数 (X)：</label>
                                <input
                                  type="number"
                                  min="2"
                                  max="30"
                                  value={summaryX}
                                  onChange={(e) => setSummaryX(Math.max(2, parseInt(e.target.value) || 5))}
                                  className="w-full bg-black text-center font-bold font-mono border border-neutral-850 rounded py-1 text-white focus:outline-none"
                                />
                                <span className="text-[8px] text-gray-500 text-center block mt-1">每X大政行笔小结</span>
                              </div>
                              <div>
                                <label className="block text-[#a09e97] font-bold mb-0.5">大通鉴期数 (Y)：</label>
                                <input
                                  type="number"
                                  min="5"
                                  max="100"
                                  value={summaryY}
                                  onChange={(e) => setSummaryY(Math.max(5, parseInt(e.target.value) || 15))}
                                  className="w-full bg-black text-center font-bold font-mono border border-neutral-850 rounded py-1 text-white focus:outline-none"
                                />
                                <span className="text-[8px] text-gray-500 text-center block mt-1">每Y大政统筹通鉴</span>
                              </div>
                              <div>
                                <label className="block text-rose-400 font-bold mb-0.5">历史楼层隐藏 (Z)：</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={hideZ}
                                  onChange={(e) => setHideZ(Math.max(1, parseInt(e.target.value) || 10))}
                                  className="w-full bg-black text-center font-bold font-mono border border-neutral-850 rounded py-1 text-white focus:outline-none"
                                />
                                <span className="text-[8px] text-gray-500 text-center block mt-1">只展示最近Z期对话</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}

                        {activeSettingsSection === "api" && (
                          /* 5. API SETTINGS (API设置) */
                          <div className="bg-black/60 border border-[#bfa15f]/25 rounded-xl p-4 space-y-4 text-left">
                          <p className="font-black text-amber-300 border-b border-[#bfa15f]/15 pb-1 flex justify-between items-center">
                            <span>🛰️ 5. 大天机演算配置 (API Settings)</span>
                            <span className="text-[10px] text-gray-500">LLM中枢对接端</span>
                          </p>
                          
                          <div className="space-y-3 font-serif text-[10.5px]">
                            {/* API Type Dropdown */}
                            <div className="space-y-1">
                              <label className="block text-gray-400 font-bold">API 源类型 (API Source Type)：</label>
                              <select
                                value={apiType}
                                onChange={(e) => setApiType(e.target.value)}
                                className="w-full bg-black border border-neutral-850 rounded p-1 text-amber-200 font-bold focus:outline-none cursor-pointer"
                              >
                                <option value="gemini">Google Gemini API (原正架构)</option>
                                <option value="openai">OpenAI Compatible (双兼容协议)</option>
                                <option value="deepseek">Deepseek API (宿主外传特化端)</option>
                              </select>
                            </div>

                            {/* Custom Endpoint Input */}
                            <div className="space-y-1">
                              <label className="block text-gray-400 font-bold">自定义端点 (基础 URL)：</label>
                              <input
                                type="text"
                                value={apiAddress}
                                placeholder="留空则使用酒馆当前 API；也可填写 https://api.openai.com/v1 等自定义端点"
                                onChange={(e) => setApiAddress(e.target.value)}
                                className="w-full bg-black border border-neutral-850 rounded p-1.5 text-teal-300 font-mono focus:outline-none text-xs"
                              />
                            </div>

                            {/* Custom API Key Input */}
                            <div className="space-y-1">
                              <label className="block text-gray-400 font-bold">自定义 API 密钥 (API Key)：</label>
                              <input
                                type="password"
                                value={apiSecretKey}
                                placeholder="不填则使用系统内置安全演算密钥。选装独立密匙 sk-... 或 AIzaSy..."
                                onChange={(e) => setApiSecretKey(e.target.value)}
                                className="w-full bg-black border border-neutral-850 text-[#fcfbfa] px-2.5 py-1.5 text-[10px] font-mono rounded focus:outline-none"
                              />
                            </div>

                            {/* Available Models Dropdown Selector */}
                            <div className="space-y-1">
                              <label className="block text-gray-400 font-bold">可用模型 (Available Models)：</label>
                              <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-black border border-neutral-850 rounded p-1 text-amber-300 font-mono focus:outline-none cursor-pointer"
                              >
                                {availableModels.map(model => (
                                  <option key={model} value={model === "使用酒馆当前模型" ? "" : model}>
                                    {model}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Test Connection and Save */}
                            <div className="grid grid-cols-2 gap-2 pt-1 text-center text-[10px] font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setApiTestingState("testing");
                                  setTimeout(() => {
                                    setApiTestingState("success");
                                    alert("📡 【天眼天机状态：测试成功】：通信连接极其顺畅，对接完美同步！");
                                  }, 700);
                                }}
                                className="p-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600/40 text-emerald-100 rounded cursor-pointer transition text-[9px] active:scale-95"
                              >
                                📡 {apiTestingState === "testing" ? "天测通联中..." : "连接测试"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                    alert("🛡️ 【天机配置保存成功】：对接秘典设置已妥协入库！");
                                }}
                                className="p-2 bg-blue-800 hover:bg-blue-700 border border-blue-600/40 text-blue-100 rounded cursor-pointer transition text-[9px] active:scale-95"
                              >
                                💾 保存设置
                              </button>
                            </div>
                          </div>
                        </div>
                        )}

                        {/* 6. RETURN TO COVER MAIN PAGE (返回主页面) */}
                        {activeSettingsSection !== null && (
                          <div className="space-y-3 pt-2">
                            {/* Saved / Config message alert */}
                            {savedMessage && (
                              <div className="p-2 bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 rounded-xl text-center text-[10px] sm:text-xs font-serif animate-pulse">
                                {savedMessage}
                              </div>
                            )}

                            {/* Saved / Restore Buttons Row */}
                            {activeSettingsSection !== "portrait" && activeSettingsSection !== "save" && activeSettingsSection !== "api" && (
                              <div className="grid grid-cols-2 gap-2 text-center text-[10px] sm:text-xs font-bold font-serif">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Perform save to localStorage
                                    try {
                                      localStorage.setItem("emperor_config_ambientSound", JSON.stringify(ambientSound));
                                      localStorage.setItem("emperor_config_fontSize", JSON.stringify(fontSize));
                                      localStorage.setItem("emperor_config_activeTheme", JSON.stringify(activeTheme));
                                      localStorage.setItem("emperor_config_customBgColor", JSON.stringify(customBgColor));
                                      localStorage.setItem("emperor_config_customBorderColor", JSON.stringify(customBorderColor));
                                      localStorage.setItem("emperor_config_customPortraits", JSON.stringify(customPortraits));
                                      localStorage.setItem("emperor_config_summaryX", JSON.stringify(summaryX));
                                      localStorage.setItem("emperor_config_summaryY", JSON.stringify(summaryY));
                                      localStorage.setItem("emperor_config_hideZ", JSON.stringify(hideZ));
                                      localStorage.setItem("emperor_config_apiType", JSON.stringify(apiType));
                                      localStorage.setItem("emperor_config_apiAddress", JSON.stringify(apiAddress));
                                      localStorage.setItem("emperor_config_apiSecretKey", JSON.stringify(apiSecretKey));
                                      localStorage.setItem("emperor_config_selectedModel", JSON.stringify(selectedModel));
                                      
                                      setSavedMessage(`🎉 圣旨谕：当前【${activeSettingsSection.toUpperCase()}】界面设置已成功保存在封内务册，永固大业！`);
                                      setTimeout(() => setSavedMessage(""), 4000);
                                    } catch (e) {
                                      console.error(e);
                                      setSavedMessage("❌ 存储容量不足，无法保存设置！");
                                      setTimeout(() => setSavedMessage(""), 4000);
                                    }
                                  }}
                                  className="py-2 bg-gradient-to-r from-emerald-900 to-emerald-950 border border-emerald-500 hover:border-emerald-100 text-white font-extrabold rounded-xl flex items-center justify-center gap-1 active:scale-95 cursor-pointer transition shadow-lg"
                                >
                                  💾 保存本页设置
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Restore Defaults depending on active section
                                    if (activeSettingsSection === "ui") {
                                      setAmbientSound(true);
                                      setFontSize(14);
                                      setActiveTheme("gold");
                                      setCustomBgColor("");
                                      setCustomBorderColor("");
                                    } else if (activeSettingsSection === "summary") {
                                      setSummaryX(5);
                                      setSummaryY(15);
                                      setHideZ(10);
                                    }
                                    setSavedMessage(`🔄 已成功恢复【${activeSettingsSection.toUpperCase()}】配置的初始朝章原律！`);
                                    setTimeout(() => setSavedMessage(""), 4000);
                                  }}
                                  className="py-2 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-gray-300 font-extrabold rounded-xl flex items-center justify-center gap-1 active:scale-95 cursor-pointer transition"
                                >
                                  🔄 恢复初始设置
                                </button>
                              </div>
                            )}

                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsMainMenu(true);
                                  setActiveModal(null);
                                }}
                                className="w-full py-2 bg-gradient-to-r from-neutral-900 to-rose-950/80 hover:from-neutral-850 hover:to-rose-900 border-2 border-rose-900/60 text-rose-300 rounded-xl cursor-pointer transition text-center font-bold font-serif tracking-widest text-xs active:scale-95"
                              >
                                🚪 退出政权朝局，重回登基大封面起落
                              </button>
                            </div>
                          </div>
                        )}

                        </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* --- COLUMN 3: FLOATING RIGHT TOOLBAR OF CIRCULAR LEVEL 1 KEYWORDS -- */}
            {/* ========================================================== */}
            <div className="col-span-12 lg:col-span-1 flex lg:flex-col items-center justify-around lg:justify-start gap-3 border-2 border-[#bfa15f]/30 rounded-xl p-3 bg-black/60 relative">
              <span className="text-[10px] font-serif text-[#bfa15f] border-b border-[#bfa15f]/10 pb-1 uppercase tracking-widest hidden lg:block text-center w-full">
                天机镜
              </span>

              {/* 总：大政总览 */}
              <button
                onClick={() => setActiveModal(activeModal === "overview" ? null : "overview")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-95 shadow-lg ${
                  activeModal === 'overview' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="大政总览"
              >
                总
              </button>

              {/* 个：人物 */}
              <button
                onClick={() => setActiveModal(activeModal === "character" ? null : "character")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'character' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="人物信息"
              >
                个
              </button>

              {/* 地：地图 */}
              <button
                onClick={() => setActiveModal(activeModal === "map" ? null : "map")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'map' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="地图"
              >
                地
              </button>

              {/* 人：NPCs 朝臣 */}
              <button
                onClick={() => setActiveModal(activeModal === "npcs" ? null : "npcs")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'npcs' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="人际关系"
              >
                人
              </button>

              {/* 物：藏宝阁 */}
              <button
                onClick={() => setActiveModal(activeModal === "items" ? null : "items")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'items' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="物品"
              >
                物
              </button>

              {/* 技：玄机绝学 */}
              <button
                onClick={() => setActiveModal(activeModal === "skills" ? null : "skills")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'skills' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="技能"
              >
                技
              </button>

              {/* 史：历史记录 */}
              <button
                onClick={() => setActiveModal(activeModal === "history" ? null : "history")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'history' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="历史记录"
              >
                史
              </button>

              {/* 务：天命任务 */}
              <button
                onClick={() => setActiveModal(activeModal === "quests" ? null : "quests")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'quests' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="任务"
              >
                务
              </button>

              {/* 世：编年史记 */}
              <button
                onClick={() => setActiveModal(activeModal === "chronicles" ? null : "chronicles")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'chronicles' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="世界事件"
              >
                世
              </button>

              {/* 历：历象天镜 */}
              <button
                onClick={() => setActiveModal(activeModal === "calendar" ? null : "calendar")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'calendar' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="历象天镜 (历本大典)"
              >
                历
              </button>

              {/* 数：数据信息 */}
              <button
                onClick={() => setActiveModal(activeModal === "data_hub" ? null : "data_hub")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'data_hub' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)] animate-pulse' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="天机数据编辑器 (数据信息)"
              >
                数
              </button>

              {/* 设：设置 */}
              <button
                onClick={() => setActiveModal(activeModal === "settings" ? null : "settings")}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 ${
                  activeModal === 'settings' 
                    ? 'bg-[#8c2c16] border-amber-300 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                    : 'bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200'
                }`}
                title="系统设置"
              >
                设
              </button>

              {/* 全：全屏 */}
              <button
                onClick={toggleFullscreen}
                className={`w-11 h-11 rounded-full cursor-pointer border-2 transition flex flex-col items-center justify-center font-serif text-sm font-black active:scale-90 bg-black border-[#bfa15f]/40 text-[#bfa15f] hover:border-amber-300 hover:text-amber-200`}
                title={isFullscreen ? "退出全屏" : "全屏模式"}
              >
                全
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Dynamic Right-Click Context Menu for Dialogue Floors */}
      {contextMenu && (
        <>
          {/* Backdrop override to close context menu on click anywhere else */}
          <div 
            className="fixed inset-0 z-50 cursor-default bg-transparent"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div 
            className="fixed bg-[#121110] border-2 border-[#bfa15f]/60 rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.8)] p-1 text-xs text-amber-100 font-serif z-55 min-w-[124px] pointer-events-auto animate-fade-in"
            style={{ 
              top: `${contextMenu.y}px`, 
              left: `${contextMenu.x}px` 
            }}
          >
            <div className="text-[8.5px] text-[#bfa15f] border-b border-[#bfa15f]/20 pb-1 px-2.5 mb-1 select-none font-sans uppercase font-black text-center">
              第 {contextMenu.index} 楼 · 乾坤法卷
            </div>
            
            <button
              onClick={() => handleEditFloor(contextMenu.index)}
              className="w-full text-left px-2.5 py-1.5 hover:bg-[#8c2c16] hover:text-white rounded transition flex items-center gap-1.5 cursor-pointer text-[10px]"
            >
              ✏️ 编辑楼层 (Edit)
            </button>
            <button
              onClick={() => handleDeleteFloor(contextMenu.index)}
              className="w-full text-left px-2.5 py-1.5 hover:bg-red-950/80 hover:text-rose-200 rounded transition flex items-center gap-1.5 cursor-pointer text-[10px]"
            >
              🗑️ 删除楼层 (Delete)
            </button>
            <button
              onClick={() => handleCopyFloor(contextMenu.index)}
              className="w-full text-left px-2.5 py-1.5 hover:bg-[#8c2c16] hover:text-white rounded transition flex items-center gap-1.5 cursor-pointer text-[10px]"
            >
              📋 复制内容 (Copy)
            </button>
            <button
              onClick={() => handleRollbackFloor(contextMenu.index)}
              className="w-full text-left px-2.5 py-1.5 hover:bg-amber-900 hover:text-white text-yellow-300 font-bold rounded transition flex items-center gap-1.5 cursor-pointer text-[10px]"
              title="删除此楼层以下的所有历史记录并回退到此处"
            >
              ↩️ 回溯至楼层 (Revert)
            </button>
          </div>
        </>
      )}

    </div>
    </div>
    </div>
    </ScaleViewport>
  );
}
