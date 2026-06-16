const clamp100 = z.coerce.number().transform(v => _.clamp(v, 0, 100));
const clamp10 = z.coerce.number().transform(v => _.clamp(v, 1, 10));
const nonNeg = z.coerce.number().transform(v => Math.max(0, v));

const AttributesSchema = z
  .object({
    health: clamp100.prefault(100),
    prestige: clamp100.prefault(50),
    gold: nonNeg.prefault(1000),
    military: clamp100.prefault(50),
    defense: clamp100.prefault(50),
    strength: clamp10.prefault(2),
    agility: clamp10.prefault(2),
    stamina: clamp10.prefault(2),
    intelligence: clamp10.prefault(2),
    luck: clamp10.prefault(2),
    fitness: clamp100.prefault(100),
    satiety: clamp100.prefault(100),
    energy: nonNeg.prefault(0),
    energyMax: nonNeg.prefault(0),
    perception: clamp10.prefault(2),
    resolve: clamp10.prefault(2),
    charm: clamp10.prefault(2),
    manipulation: clamp10.prefault(2),
    composure: clamp10.prefault(2),
    illness: z.string().prefault(''),
    wisdomIndex: z.coerce.number().transform(v => _.clamp(v, -5, 5)).prefault(0),
    benevolenceIndex: z.coerce.number().transform(v => _.clamp(v, -5, 5)).prefault(0),
  })
  .prefault({});

const CharacterSchema = z
  .object({
    name: z.string().prefault(''),
    age: z.coerce.number().prefault(22),
    dynasty: z.string().prefault(''),
    identity: z.string().prefault(''),
    title: z.string().prefault(''),
    avatarSeed: z.string().prefault(''),
    avatarUrl: z.string().prefault(''),
    background: z.string().prefault(''),
    attributes: AttributesSchema,
    status: z.array(z.string()).prefault([]),
    illness: z.string().prefault(''),
    experience: z.coerce.number().prefault(0),
  })
  .prefault({});

const QuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['进行中', '已达成', '已失败']).prefault('进行中'),
  type: z.enum(['主线', '支线', '奇遇']).prefault('支线'),
  reward: z.string().prefault(''),
  progress: z.string().prefault(''),
  failurePenalty: z.string().prefault(''),
  difficulty: z.string().prefault(''),
});

const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
  description: z.string(),
  exp: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
  type: z.enum(['武林秘籍', '君臣国政', '修真方术', '风雅杂世']).prefault('君臣国政'),
});

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  quality: z.enum(['神传', '绝世', '奇珍', '凡器']).prefault('凡器'),
  type: z.enum(['御用神兵', '传国信物', '灵丹妙药', '武学残册', '俗世细软']).prefault('俗世细软'),
  count: z.coerce.number().transform(v => Math.max(0, v)).prefault(1),
  effect: z.string().prefault(''),
});

const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string().prefault(''),
  attributeChanges: z.record(z.string(), z.coerce.number()).prefault({}),
  questUpdate: z.string().prefault(''),
});

const ScenarioSchema = z
  .object({
    story: z.string().prefault(''),
    choices: z.array(ChoiceSchema).prefault([]),
    worldEvent: z.string().prefault(''),
    foundItem: z.string().prefault(''),
    attainedSkill: z.string().prefault(''),
  })
  .prefault({});

const HistorySchema = z.object({
  role: z.enum(['assistant', 'user']),
  text: z.string(),
});

const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['太平', '匪患', '干旱', '繁荣', '戒严']).prefault('太平'),
  coordinates: z.object({ x: z.coerce.number(), y: z.coerce.number() }),
  dynastyAffiliation: z.string().prefault(''),
});

const NpcSchema = z.object({
  name: z.string(),
  avatarSeed: z.string().prefault(''),
  role: z.string().prefault(''),
  age: z.coerce.number().prefault(30),
  relationship: z.string().prefault(''),
  relationVal: z.coerce.number().prefault(50),
  loyalty: z.coerce.number().prefault(50),
  deeds: z.array(z.string()).prefault([]),
  items: z.array(z.string()).prefault([]),
  statusText: z.string().prefault(''),
  location: z.string().prefault(''),
  currentThoughts: z.string().prefault(''),
  playerImpression: z.string().prefault(''),
  isPresent: z.boolean().prefault(false),
});

const ChronicleSchema = z.object({
  turn: z.coerce.number(),
  year: z.coerce.number(),
  eventText: z.string(),
});

const EmpireSchema = z
  .object({
    summary: z.string().prefault(''),
    officials: z.coerce.number().prefault(0),
    treasury: nonNeg.prefault(0),
    sentiment: clamp100.prefault(50),
    military: nonNeg.prefault(0),
    grain: nonNeg.prefault(0),
    annualIncome: nonNeg.prefault(0),
    annualExpense: nonNeg.prefault(0),
  })
  .prefault({});

export const Schema = z
  .object({
    游戏: z
      .object({
        已初始化: z.boolean().prefault(false),
        主菜单: z.boolean().prefault(true),
        历法: z.string().prefault(''),
        地域编号: z.string().prefault('capital'),
        日程阶段: z.coerce.number().prefault(0),
        游玩模式: z.enum(['自主', '快速']).prefault('自主'),
        地点: z.string().prefault('太和殿（金銮宝殿）'),
        天气: z
          .object({
            名称: z.string().prefault('晴'),
            描述: z.string().prefault('天朗气清，紫气东来'),
            图标: z.string().prefault('☀️'),
          })
          .prefault({}),
        预设编号: z.string().prefault(''),
        自定义模式: z.boolean().prefault(false),
        自定义朝代: z.string().prefault('大明'),
        自定义身份: z.string().prefault(''),
        自定义历法: z.string().prefault(''),
        自定义背景: z.string().prefault(''),
        自定义已发生: z.string().prefault(''),
        自定义未发生: z.string().prefault(''),
      })
      .prefault({}),
    角色: CharacterSchema,
    帝国: EmpireSchema,
    任务: z.record(z.string(), QuestSchema).prefault({}),
    技能: z.record(z.string(), SkillSchema).prefault({}),
    物品: z.record(z.string(), ItemSchema).prefault({}),
    NPC: z.record(z.string(), NpcSchema).prefault({}),
    地域: z.record(z.string(), RegionSchema).prefault({}),
    编年: z.array(ChronicleSchema).prefault([]),
    对话历史: z.array(HistorySchema).prefault([]),
    当前剧情: ScenarioSchema,
  })
  .prefault({});

export type Schema = z.output<typeof Schema>;
