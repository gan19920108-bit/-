import { Character, Quest, Skill, GameItem } from "../types";

// Procedural Scenario model format matching the central sandbox RPG
export interface StoryScenario {
  story: string;
  choices: Array<{
    id: string;
    category: "historical" | "positive" | "negative" | "alternative";
    text: string;
    attributeChanges?: Partial<Character["attributes"]>;
    questUpdate?: string;
  }>;
  worldEvent: string;
  newQuest?: {
    title: string;
    description: string;
    type: string;
    reward: string;
    failurePenalty: string;
  };
  foundItem?: string;
  attainedSkill?: string;
}

interface TemplateScenario {
  story: string;
  choices: Array<{
    id: string;
    category: "historical" | "positive" | "negative" | "alternative";
    text: string;
    attributeChanges?: Partial<Character["attributes"]>;
  }>;
  event: string;
}

const IMPERIAL_TEMPLATES: TemplateScenario[] = [
  {
    story: "朱红宫门前白玉阶层层叠扣，塞外密折卷着寒沙在阁臣手中簌簌抖动。宰相深锁眉头叩首谏言：两淮道遭逢黄河漫溢之灾，哀鸿千里。朝中守旧权臣意欲借大灾削吞州兵，而拥兵自重的边疆都护却趁机向朝廷讨取万石军粮，乾坤命途皆在吾主朱笔决策之间。",
    choices: [
      { id: "historical", category: "historical", text: "遵循古制，特遣特使携大批赈灾款项按律弹抚，微调地方卫军节制权势。", attributeChanges: { prestige: 2, intelligence: 1, gold: -200 } },
      { id: "positive", category: "positive", text: "励精图治！怒斥权相，强开内江府司仓储粮越境赈饥，强行震慑边疆军阀。", attributeChanges: { health: -5, prestige: 10, gold: -400, military: 10 } },
      { id: "negative", category: "negative", text: "避战自保，推迟两淮御防，允准都护之粮饷以换地方短局安泰。", attributeChanges: { prestige: -8, luck: 5, gold: -100 } },
      { id: "alternative", category: "alternative", text: "别出心裁，借江湖方外奇门异术行风水排涝，并引大商大贾以私解公灾。", attributeChanges: { prestige: 5, luck: 12, gold: 300 } }
    ],
    event: "【社稷编年】黄陂水患改道，关内粮价腾涨，部分寒门学子集结上书评议朝政中枢。"
  },
  {
    story: "殿外更漏沉重，幽凉晚风将烛火压得极低。太医署送来密信：御林军副统统领行迹诡秘，近日与边地党羽书信频繁，似有谋犯中禁之兆。与此同时，南疆神主之使携带着传说能延寿二十载的『九星长生玉髓』密见，声称只要朝廷在朝贡法度上让步三州，此丹当即奉上御案。",
    choices: [
      { id: "historical", category: "historical", text: "按祖宗成法，由内侍太监密调御林忠勇卫戍营，布下防卫，按兵徐徐探查。", attributeChanges: { prestige: 3, intelligence: 2, defense: 10 } },
      { id: "positive", category: "positive", text: "圣心雷霆！密旨锦衣死士当夜扣押御林谋逆叛将，连夜抄家削其羽翼。", attributeChanges: { health: -8, prestige: 15, military: -5, intelligence: 5 } },
      { id: "negative", category: "negative", text: "含忍避让，姑且好言笼络该将，并允准南疆贡使之议，极速换取长生丹药。", attributeChanges: { health: 15, prestige: -12, gold: -150 } },
      { id: "alternative", category: "alternative", text: "布局连环，借刀杀人。暗传逆将南疆刺客入袭之谣，命其剿刺首当其冲以辨忠奸。", attributeChanges: { prestige: 8, luck: 8, intelligence: 3 } }
    ],
    event: "【宫闱震动】九御亲卫防卫连夜换防，市井流传朝廷正开展暗流涌动之肃逆大整顿。"
  },
  {
    story: "天镜大政，乾坤一局。今日户部主事呈递大疏：西域番属名将率使团入朝贡献神骏与秘宝，而大宛古都却传言叛贼已暗中颠覆藩王，此时献礼恐为行刺诱敌之局。殿下，朝堂之上文武百官面面相觑，有的主张以雷霆天威扣押番使，有的则认为不应因虚言自失泱泱大国风骨礼仪。",
    choices: [
      { id: "historical", category: "historical", text: "以大汉唐礼仪大开宣德门迎接，但暗藏甲士于两庑，从容校对赐爵礼章。", attributeChanges: { prestige: 5, intelligence: 2, defense: 5 } },
      { id: "positive", category: "positive", text: "披挂亲御！龙骧大军陈兵神武门，天子亲自按剑召见其首脑，当殿挫其锐气。", attributeChanges: { health: -3, prestige: 12, military: 8 } },
      { id: "negative", category: "negative", text: "称疾不朝，将接见大任全权付予副相处理，避免刺杀大险，静观变迁局势。", attributeChanges: { prestige: -5, luck: 6, gold: 50 } },
      { id: "alternative", category: "alternative", text: "设奇门百戏！引入塞外古幻术傀儡与天罗金网将大殿化为幻阵，使番使心惊自首。", attributeChanges: { prestige: 4, luck: 15, intelligence: 5 } }
    ],
    event: "【邦交异变】西域诸藩惊于吾皇无上威烈或神奥布置，互派密谍打勘朝廷底牌虚实。"
  }
];

const WUXIA_TEMPLATES: TemplateScenario[] = [
  {
    story: "细雨沥沥，寒鸦栖息于竹林枯梢。你在翠微山古道旁的破落茶寮歇脚，忽听得一阵急促的马蹄声。数名自称『神霄天剑阁』的劲装剑客策马合围，腰间古铜短刃在雨幕中泛着惨白寒光。为首之人冷笑道：‘阁下便是近来名震江南的那位大侠？交出你身上的残卷，否则这无名荒冢便是你的归宿！’",
    choices: [
      { id: "historical", category: "historical", text: "江湖险恶，按剑起落，朗声以江南剑盟成规与之盘旋，试图寻找空门漏洞。", attributeChanges: { prestige: 3, agility: 0.1, intelligence: 1 } },
      { id: "positive", category: "positive", text: "一剑惊雷！拔剑直刺，身随风动，凭浩然内劲在数人合围中杀出一条血盟生路。", attributeChanges: { health: -15, prestige: 8, strength: 0.3, agility: 0.2 } },
      { id: "negative", category: "negative", text: "好汉不吃眼前亏，虚与委蛇，假意交出一份拓印伪卷，抽身向林木深处退避掠走。", attributeChanges: { prestige: -5, luck: 4, stamina: 0.1 } },
      { id: "alternative", category: "alternative", text: "不走寻常路！将身侧茶寮沸水与奇门竹影相合，引出竹海潜伏的异蛇惊散来敌。", attributeChanges: { luck: 8, intelligence: 3, agility: 0.3 } }
    ],
    event: "【武林风波】江南神霄阁连夜遭遇神秘无名剑客斩伤，江湖上开始传扬阁下的不凡名讳。"
  },
  {
    story: "夜半寒霜极重。你在风尘大漠的龙门孤驿中调息，忽见客栈屋瓦上传来微弱的瓦裂移响，似有绝顶夜行人飞檐掠过。随之而来的，是一股浓烈刺鼻的腐尸百草之气。你睁开灵眸，只见雕花窗棂被指劲弹开，一封浸润了黑血的『天罗追杀铁敕』悄无声息地落在了你身侧的玄金案机之上，上写名讳赤红如血。",
    choices: [
      { id: "historical", category: "historical", text: "以逸待劳，按道门吐纳之法闭口御毒，默运玄功固守床榻，神识散发提防夜袭。", attributeChanges: { defense: 8, stamina: 0.2, intelligence: 1 } },
      { id: "positive", category: "positive", text: "破窗追击！雷霆一掌轰碎阁板，施展天仙飘渺身法直跃屋脊，誓要揪出投敕恶徒。", attributeChanges: { health: -10, prestige: 10, agility: 0.4 } },
      { id: "negative", category: "negative", text: "大漠狂沙深奥，此帖定是死士圈套。当即易容换装，悄然越窗折向大漠深处暂避锋芒。", attributeChanges: { prestige: -4, luck: 6, composure: 0.2 } },
      { id: "alternative", category: "alternative", text: "妙着金蝉脱壳！以稻草傀儡披挂行装佯作歇息，暗中把那追魂血帖转塞入邪派掌柜怀中。", attributeChanges: { luck: 12, composure: 0.2, intelligence: 2 } }
    ],
    event: "【塞外大哗】龙门黑店客栈爆发惊天大混战，邪派夜行百鬼死士死伤枕藉，大漠黑羽卫出动调查。"
  }
];

const MAGIC_TEMPLATES: TemplateScenario[] = [
  {
    story: "幽深晦暗的奥术遗迹地宫中，墙上的星斑荧光苔藓因你体内的法力波动而忽明忽暗。在古旧的智慧之神祭坛中央，一尊受深渊黑浊腐染的『巨龙魔眼石核』正在散发着狂野的元素磁力。一旁断折的精灵石碑上警示：若以精神共鸣强行汲取，可获冠星大法力，惟可能引来噩梦古神的不可视凝视。",
    choices: [
      { id: "historical", category: "historical", text: "依据古典魔法学院的安全解析规范，铺设三重元素隔离咒网，徐徐探求奥秘本质。", attributeChanges: { prestige: 2, intelligence: 0.2, wisdomIndex: 0.1 } },
      { id: "positive", category: "positive", text: "魔道争锋！强行燃烧自身魂力本源，直面古神呓语，以大无畏气魄将石核魔力掠夺占有。", attributeChanges: { health: -20, prestige: 12, intelligence: 0.5, resolve: 0.4 } },
      { id: "negative", category: "negative", text: "退避黑暗，退却出核心地殿，在安全回廊处搜集散碎魔能粉尘，求稳而图徐进。", attributeChanges: { health: 5, prestige: -3, stamina: 0.1 } },
      { id: "alternative", category: "alternative", text: "反向操作。不吸法力反将神圣灵丹异水灌入龙眼，逼得腐化魔眼逆向流转，吐露古代遗器。", attributeChanges: { luck: 15, gold: 300, charm: 0.2 } }
    ],
    event: "【元素异爆】高魔遗迹外围奥能潮汐激增，帝国大魔导高塔的观星仪疯狂回旋预兆宿命降临。"
  }
];

const CYBER_TEMPLATES: TemplateScenario[] = [
  {
    story: "人造霓虹酸雨顺着破损的废钢管不断滴落，砸在你那泛着钛合金冷光的义体腕刃上。下城区贫民窟的黑巷尽头，两名重度义体化的『荒坂野性帮』改造兵堵住了去路， their 电子机械义眼在重霾中闪烁着暴虐的红光。接入端传来脑机超频警示：附近有高能信号拦截，黑客中继器正遭受赛博疯子的反向侵入！",
    choices: [
      { id: "historical", category: "historical", text: "调用标准废土佣兵联络条例，向终端发送行会豁免编码，并调动底层协议反扰脑波。", attributeChanges: { prestige: 3, intelligence: 0.2, composure: 0.3 } },
      { id: "positive", category: "positive", text: "暴虐超频！腕部金刚利刃轰然出鞘，瞬间启动内置军用级斯安威斯坦组件，连环冷切！", attributeChanges: { health: -15, prestige: 10, agility: 0.4, strength: 0.2 } },
      { id: "negative", category: "negative", text: "抛射高爆电磁屏蔽爆弹迷乱视线，拖拽伤退，滑入下水道错综复杂的管网潜藏避祸。", attributeChanges: { prestige: -5, luck: 5, composure: 0.2 } },
      { id: "alternative", category: "alternative", text: "逆向入侵。反烧自己脑桥回路，强行通过街头霓虹全息广告牌的播映端投射闪屏，瘫痪其视觉。", attributeChanges: { luck: 10, agility: 0.3, composure: 0.4 } }
    ],
    event: "【荒漠惊飙】下城区贫民窟爆发猛烈义体火并，高能磁暴让多栋摩天建筑陷入暂时虚无瘫痪。"
  }
];

// Fallback high-quality scenario generator
export function generateLocalScenario(
  dynasty: string,
  identity: string,
  character: Character,
  quests: Quest[],
  items: GameItem[],
  skills: Skill[],
  actionTaken: string,
  isStart: boolean = false
): StoryScenario {
  // Determine standard templates list based on genre
  let templates = IMPERIAL_TEMPLATES;
  const idStr = (identity || "").toLowerCase();
  const titleStr = (character.title || "").toLowerCase();
  const bgStr = (character.background || "").toLowerCase();

  if (idStr.includes("侠") || idStr.includes("剑") || titleStr.includes("宗师") || bgStr.includes("侠") || bgStr.includes("武") || bgStr.includes("江湖")) {
    templates = WUXIA_TEMPLATES;
  } else if (idStr.includes("魔") || titleStr.includes("法法") || titleStr.includes("精灵") || bgStr.includes("魔") || bgStr.includes("神")) {
    templates = MAGIC_TEMPLATES;
  } else if (idStr.includes("赛博") || titleStr.includes("客") || bgStr.includes("霓虹") || bgStr.includes("义体") || bgStr.includes("荒原")) {
    templates = CYBER_TEMPLATES;
  }

  // Pick deterministic/pseudo-random index based on actionTaken length of history
  const seed = (actionTaken || "").length + (character.age || 20) + (quests.length || 0);
  const picked = templates[seed % templates.length];

  // Derive customized story details substituting character name
  let story = picked.story;
  if (!isStart && actionTaken) {
    const cleanAction = actionTaken.replace(/【[^\]]+】:/g, "").trim();
    story = `阁下断然颁令：“${cleanAction.length > 30 ? cleanAction.slice(0, 30) + "..." : cleanAction}”！\n\n随着这道坚决命令的流转，形势急速演变。${story}`;
  }

  // Generate an optional rewarding random drop or quest progress indicator
  let foundItem: string | undefined = undefined;
  let attainedSkill: string | undefined = undefined;
  let newQuest: any = undefined;

  const rand = Math.random();
  if (rand > 0.85) {
    const dropItems = [
      "盘龙碧玉玦", "太乙聚气灵丹", "锦衣御卫指挥铁符", "九华镇岳古剑", "天髓固元散", "秦淮香艳手札"
    ];
    foundItem = `获得 ${dropItems[seed % dropItems.length]}`;
  } else if (rand > 0.70 && rand <= 0.85) {
    const skillsToIncorporate = [
      "紫气纯阳天经", "龙游幽海剑诀", "朱笔敕令审断术", "奇门遁甲化雾局", "金丹淬肌内息功"
    ];
    attainedSkill = `领悟 ${skillsToIncorporate[seed % skillsToIncorporate.length]}`;
  } else if (rand > 0.60 && rand <= 0.70 && quests.length < 4) {
    newQuest = {
      title: "肃清潜隐乱局",
      description: "世局多波。有逆臣或邪派余孽暗中潜回各道行省意欲生乱，必须在其起势前迅速委派能员干吏铁血剿袭镇压。",
      type: "支线",
      reward: "社稷稳定度上升、私人黄金三百两天赐大赏",
      failurePenalty: "丢失两江府行台税金封锁、威望气运大损"
    };
  }

  return {
    story: story,
    choices: picked.choices.map(c => ({
      id: c.id,
      category: c.category,
      text: c.text,
      attributeChanges: c.attributeChanges
    })),
    worldEvent: picked.event,
    foundItem,
    attainedSkill,
    newQuest
  };
}
