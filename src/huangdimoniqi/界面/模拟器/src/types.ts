export interface Attributes {
  health: number;       // 生命值 (Health, 0-100)
  prestige: number;     // 声望 (Prestige, 0-100)
  gold: number;         // 资金 (Gold/Money in Tael/两)
  military: number;     // 军力 (Military/Troop strength, 0-100)
  defense: number;      // 防御值 (Defense score, 0-100)
  strength: number;     // 力量 (Physical strength, 0-100)
  agility: number;      // 敏捷 (Agility/Action speed, 0-100)
  stamina: number;      // 耐力 (Stamina/Struggle capacity, 0-100)
  intelligence: number; // 智力 (Intelligence/Cunning, 0-100)
  luck: number;         // 幸运 (Luck/Providence, 0-100)
  
  // Custom enhanced attributes for detailed simulation
  fitness?: number;      // 健康 (Fitness, default 100/100, lower if has illness)
  satiety?: number;     // 饱食度 (Satiety, default 100/100, hunger triggers effects)
  energy?: number;      // 能量 (Current energy, default 0)
  energyMax?: number;   // 最大能量 (Max energy, default 0)
  perception?: number;  // 感知 (Perception, 0-100)
  resolve?: number;     // 决心 (Resolve, 0-100)
  charm?: number;       // 风度 (Presence/Charm, 0-100)
  manipulation?: number;// 操控 (Manipulation, 0-100)
  composure?: number;   // 沉着 (Composure, 0-100)
  illness?: string;     // 疾病名称 (Name of current illness / e.g. "风疾", "风寒")
  wisdomIndex?: number;      // 昏庸/中庸/贤明 (-5.0 to 5.0)
  benevolenceIndex?: number; // 残暴/中庸/仁德 (-5.0 to 5.0)
}

export interface BaseSkills {
  // 生理技能
  athletics: number;    // 运动
  brawl: number;        // 肉搏
  driving: number;      // 驾驶
  firearms: number;      // 枪械
  larceny: number;      // 手上功夫
  stealth: number;      // 隐藏
  survival: number;     // 求生
  melee: number;        // 白刃
  archery: number;      // 弓箭
  // 心智技能
  academics: number;    // 学识
  computers: number;    // 电脑
  crafts: number;       // 手艺
  investigation: number;// 调查
  medicine: number;     // 医学
  occult: number;       // 神秘学
  science: number;      // 科学
  // 互动技能
  animalKen: number;    // 动物沟通
  empathy: number;      // 感受
  expression: number;   // 表达
  intimidation: number; // 胁迫
  socialize: number;    // 交际
  subterfuge: number;   // 掩饰
}

export interface Character {
  name: string;
  age: number;
  dynasty: string;
  identity: string;
  title: string;
  avatarSeed: string; // Used for customized graphics/avatars
  avatarUrl?: string; // Loaded from 立绘管理
  attributes: Attributes;
  background: string;
  baseSkills?: BaseSkills; // Base skills mapping
  status?: string[];       // e.g., ["寒冷", "健康较弱"]
  illness?: string;
  experience?: number;     // 经验值 (Experience points)
  // Equipment slots
  equipment?: {
    head?: GameItem | null;
    neck?: GameItem | null;
    body?: GameItem | null;
    waist?: GameItem | null;
    rightHand?: GameItem | null;
    leftHand?: GameItem | null;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: "进行中" | "已达成" | "已失败";
  detailedStatus?: "未开始" | "进行中" | "已暂停" | "已结束";
  type: "主线" | "支线" | "奇遇";
  reward: string;
  progress?: string;       // 当前进展
  failurePenalty?: string; // 失败惩罚
  difficulty?: string;     // 易度评级 (e.g., 极难/九死一生/举国功德)
}

export interface Skill {
  id: string;
  name: string;
  level: string; // e.g., "初窥门径", "登堂入室", "融会贯通", "一代宗师"
  description: string;
  exp: number; // 0-100 progress
  type: "武林秘籍" | "君臣国政" | "修真方术" | "风雅杂世";
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  quality: "神传" | "绝世" | "奇珍" | "凡器"; // Gold, Orange, Purple, Green
  type: "御用神兵" | "传国信物" | "灵丹妙药" | "武学残册" | "俗世细软";
  count: number;
  effect?: string;
}

export interface Choice {
  id: string;
  text: string;
  attributeChanges?: Partial<Attributes>;
  questUpdate?: string;
}

export interface GameScene {
  story: string;
  choices: Choice[];
  worldEvent: string;
  newQuest?: {
    title: string;
    description: string;
  };
  foundItem?: string;
  attainedSkill?: string;
}

export interface HistoryTurn {
  role: "assistant" | "user";
  text: string;
}

export interface MapRegion {
  id: string;
  name: string;
  description: string;
  status: "太平" | "匪患" | "干旱" | "繁荣" | "戒严";
  coordinates: { x: number; y: number }; // Percentage position on our custom rendered vector map
  dynastyAffiliation: string;
}

export interface ChronicleLog {
  turn: number;
  year: number;
  eventText: string;
}

export interface GameNPC {
  name: string;
  avatarSeed: string;
  role: string;
  age: number;
  relationship: string;
  relationVal: number;
  loyalty: number;
  deeds: string[];
  items: string[];
  statusText: string;
  location?: string;
  currentThoughts?: string;
  playerImpression?: string;
  isPresent?: boolean; // Label character as present on-screen or unrevealed at game start
}
