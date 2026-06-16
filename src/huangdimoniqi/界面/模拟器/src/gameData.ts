import { Character, GameItem, Skill, Quest, MapRegion } from "./types";

export interface DynastyPreset {
  id: string;
  name: string;
  description: string;
  eraName: string;
}

export const DYNASTIES: DynastyPreset[] = [
  { id: "tang", name: "大唐盛世", eraName: "贞观/开元", description: "万国来朝，风骨猎猎。丰腴繁华与铁骑扬沙并在。" },
  { id: "song", name: "大宋华章", eraName: "汴京风华", description: "重文轻武，墨香满城。宋词温婉，清明上河之景。" },
  { id: "ming", name: "大明帝国", eraName: "洪武/永乐", description: "天子守国门，君王死社稷。权谋深重，锦衣巡按。" },
  { id: "han", name: "强汉风骨", eraName: "元朔年间", description: "犯我强汉者，虽远必诛。开拓西域，连通丝路。" },
  { id: "sui", name: "大隋帝国", eraName: "大业年间", description: "开运河，创科举，横跨南北，暴烈而宏阔之大变局。" },
  { id: "三国", name: "三国乱世", eraName: "建安年间", description: "天下分裂，群雄并起，忠良悲歌，谋臣猛将如群星灿烂。" },
  { id: "xijin", name: "西晋王朝", eraName: "泰始/元康", description: "九九归一，西晋短暂一统，然八王争鼎，乱华端倪已现。" },
  { id: "dongjin", name: "东晋偏安", eraName: "建武年间", description: "衣冠南渡，偏安江左。王与马共天下，北伐悲歌。" },
  { id: "nanchao", name: "南朝刘宋", eraName: "永初年间", description: "金戈铁马，气吞万里如虎。气焰激越而朝代更替频乃。" },
  { id: "beichao", name: "北朝北魏", eraName: "太和年间", description: "拓跋雄风，孝文改革。胡汉熔铸，魏碑雄浑。" },
  { id: "yuan", name: "大元帝国", eraName: "至元初年", description: "横跨欧亚，吞吐日月。至元盛世，空前辽阔之版图。" }
];

export interface RolePreset {
  id: string;
  name: string;
  dynastyId: string;
  dynastyName: string;
  difficulty: "简单" | "中等" | "困难" | "天崩";
  difficultyDesc: string;
  title: string;
  background: string;
  avatarSeed: string;
  startingTime: string; // "公元xxx年  唐朝  开元初年正月十五"
  alreadyHappened: string[];
  notYetHappened: string[];
  originalTrajectory: string;
  attributes: {
    health: number;
    prestige: number;
    gold: number;
    military: number;
    defense: number;
    strength: number;
    agility: number;
    stamina: number;
    intelligence: number;
    luck: number;
  };
  initialSkills: Skill[];
  initialItems: GameItem[];
  initialQuests: Quest[];
}

export const ROLE_PRESETS: RolePreset[] = [
  // ==================== 简单难度 ====================
  {
    id: "emperor_li_zhi",
    name: "唐高宗 李治",
    dynastyId: "tang",
    dynastyName: "大唐盛世",
    difficulty: "简单",
    difficultyDesc: "【永徽之治】高宗即位，府库极其充盈之治世。大唐版图处于历史顶峰。",
    title: "高宗大帝 · 永徽天子",
    avatarSeed: "emperor",
    startingTime: "公元650年 大唐 永徽元年初春正月初一",
    background: "你自太极殿高阳王座醒来。此时国家府库充盈，万国称臣，薛仁贵、苏定方东征西讨，社稷稳如磐石，属于极易上手的治世开局。",
    alreadyHappened: [
      "太宗李世民驾崩，遗诏辅政大臣辅助辅国大位",
      "册立新君登位，废王皇后提议初生端倪"
    ],
    notYetHappened: [
      "册立武昭仪武媚娘为皇后（废王立武）",
      "薛仁贵神勇三箭定天山",
      "收复辽东、大破西突厥以极尽大唐版图"
    ],
    originalTrajectory: "因患风疾逐渐委政于武皇后，最终武后深度掌权代唐，创立周朝。",
    attributes: { health: 85, prestige: 92, gold: 9000, military: 95, defense: 70, strength: 65, agility: 60, stamina: 75, intelligence: 82, luck: 90 },
    initialSkills: [
      { id: "s1", name: "永徽新律", level: "融会贯通", description: "整理《唐律疏议》，依法治国，天下清正开明。", exp: 80, type: "君臣国政" },
      { id: "s2", name: "神策军调度", level: "初窥门径", description: "调遣御林军精宿，守护京畿安宁。", exp: 35, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i1", name: "《唐律疏议》卷本", quality: "绝世", type: "传国信物", count: 1, description: "大唐法制至宝，平息社会纷争，削免内政隐患。" }
    ],
    initialQuests: [
      { id: "q1", title: "平定辽东残部", description: "调遣薛仁贵等边防守将，彻底一统海内，巩固东疆。", status: "进行中", type: "主线", reward: "威望、白金、军力增加" }
    ]
  },
  {
    id: "emperor_li_longji",
    name: "唐玄宗 李隆基",
    dynastyId: "tang",
    dynastyName: "大唐盛世",
    difficulty: "简单",
    difficultyDesc: "【开元盛世】励精图治，长安万国来朝。商品贸易极盛，无内部匪患之扰。",
    title: "开元圣皇 · 梨园天子",
    avatarSeed: "emperor",
    startingTime: "公元712年 大唐 先天元年重阳九月初九",
    background: "风花雪月，霓裳羽衣。你于大明宫兴庆楼醒来。此时贤相姚崇、宋璟竭力辅政，天下升平，斗米三四钱，乃东方文明极盛之世。",
    alreadyHappened: [
      "唐睿宗禅让帝位，李隆基登基为帝",
      "平定韦氏政变，肃清朝堂外戚干政"
    ],
    notYetHappened: [
      "清除太平公主等拥兵自重夺权势力",
      "改元开元，任用贤相，创造开元之治极盛",
      "晚年宠幸杨玉环，安禄山反叛（安史之乱）"
    ],
    originalTrajectory: "成功清除太平公主势力，励精图治前中期达到开元极盛，晚年怠政致安史大乱偏安入蜀。",
    attributes: { health: 90, prestige: 98, gold: 12000, military: 92, defense: 60, strength: 62, agility: 72, stamina: 78, intelligence: 95, luck: 88 },
    initialSkills: [
      { id: "s3", name: "贤相维新策", level: "融会贯通", description: "提倡重用姚宋贤相，整治官场腐败与铺张。", exp: 75, type: "君臣国政" },
      { id: "s4", name: "霓裳乐曲", level: "一代宗师", description: "以深厚音乐艺术造诣，化解天下焦躁，休养人心文明。", exp: 90, type: "风雅杂世" }
    ],
    initialItems: [
      { id: "i3", name: "开元通宝母金鼎", quality: "绝世", type: "传国信物", count: 1, description: "象征财源不绝的极品金尊。" }
    ],
    initialQuests: [
      { id: "q2", title: "万邦岁贡大典", description: "在大明宫举行百胡各国觐见，封赏众酋长，确立天可汗秩序。", status: "进行中", type: "主线", reward: "岁贡黄金5000两" }
    ]
  },
  {
    id: "emperor_liu_xiu",
    name: "汉光武帝 刘秀",
    dynastyId: "han",
    dynastyName: "强汉风骨",
    difficulty: "简单",
    difficultyDesc: "【光武中兴】重兴汉室，昆阳大捷之后登基称帝。虽然群雄未完全削平，但王莽已灭，正理新纪。",
    title: "光武皇帝 · 位面之子",
    avatarSeed: "emperor",
    startingTime: "公元25年 东汉 建武元年六月二十二",
    background: "你于鄗县千秋亭筑坛即皇帝位，再建大汉。王莽乱军覆灭，你率绿林与昆阳精锐万众，正欲在满室焦土上，重整社稷浩荡。",
    alreadyHappened: [
      "昆阳之战中刘秀以少胜多，神兵大破王莽百万雄师",
      "长安更始帝政权走向失序，刘秀登基重建汉室"
    ],
    notYetHappened: [
      "收复并安抚关中百万赤眉义军",
      "征召云台二十八将，扫平陇西隗嚣、蜀地公孙述等天下群雄",
      "精兵简政，轻徭薄赋，建立东汉之治"
    ],
    originalTrajectory: "耗时十余年东征西讨一统天下，偃武修文，恢复汉室尊严，开启“建武之治”（光武中兴）。",
    attributes: { health: 95, prestige: 90, gold: 8000, military: 88, defense: 75, strength: 80, agility: 75, stamina: 85, intelligence: 90, luck: 99 },
    initialSkills: [
      { id: "s101", name: "云台将才御", level: "融会贯通", description: "收服各路英杰，云台名将誓忠拥戴，统驱百万雄兵。", exp: 80, type: "君臣国政" },
      { id: "s102", name: "兵贵韬光诀", level: "融会贯通", description: "刘秀百战枪术，以柔克刚，避敌精锐袭其背腹。", exp: 70, type: "武林秘籍" }
    ],
    initialItems: [
      { id: "i101", name: "云台神武印玺", quality: "绝世", type: "传国信物", count: 1, description: "东汉中兴玺，象征重华复辟，凝聚天下义士之雄心。" }
    ],
    initialQuests: [
      { id: "q101", title: "收服幽夏将领", description: "说服并收编渔阳、上谷之突骑劲旅，为下一步横扫群雄奠定军防实力。", status: "进行中", type: "主线", reward: "获得：大批天汉突骑，名宿降附" }
    ]
  },
  {
    id: "emperor_zhu_di",
    name: "明成祖 朱棣",
    dynastyId: "ming",
    dynastyName: "大明帝国",
    difficulty: "简单",
    difficultyDesc: "【靖康大定】靖难大捷，永乐夺鼎改元。朱棣掌握整个旧大明全境，北击瓦剌，意吞沧溟。",
    title: "永乐大帝 · 靖难洪武",
    avatarSeed: "general",
    startingTime: "公元1402年 大明 永乐元年初春正月初一",
    background: "紫禁城内白雪皑皑。建文帝大火自焚不知所踪，你以燕王藩王之尊夺其神器。天下初定，五边强军正摩拳擦掌，郑和宝船正于江南整装起锚。",
    alreadyHappened: [
      "燕兵起起兵『清君侧』，发动靖难之役大败李景隆",
      "攻破南京，建文帝失落火海。朱棣践即皇帝位"
    ],
    notYetHappened: [
      "派遣郑和率神州宝船七下西洋，向万国扬圣威",
      "营建且迁都北京顺天府，修筑不朽紫禁城",
      "御驾亲征五征漠北残元势力，并编纂《永乐大典》"
    ],
    originalTrajectory: "迁都北京，加强内阁权柄，重编大典，五征漠北，威慑西洋各邦。最终病逝于榆木川征途。",
    attributes: { health: 88, prestige: 91, gold: 8500, military: 96, defense: 68, strength: 88, agility: 75, stamina: 85, intelligence: 89, luck: 82 },
    initialSkills: [
      { id: "s103", name: "五征安国策", level: "一代宗师", description: "朱棣戎马半生之战阵指挥。克敌制胜，所向披靡。", exp: 90, type: "君臣国政" },
      { id: "s104", name: "锦衣夜行探", level: "融会贯通", description: "调辖锦衣卫缇骑，刺搜百臣，对不轨行为料敌机先。", exp: 72, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i102", name: "永乐天子斩蛟剑", quality: "绝世", type: "御用神兵", count: 1, description: "真武大帝金顶开光的天子重剑，重四十二斤，见血辟邪。" }
    ],
    initialQuests: [
      { id: "q102", title: "起航西洋首测", description: "拨白银三千两，修造三十艘海船，任命郑和出使南海诸邦大开丝路。", status: "进行中", type: "主线", reward: "获取胡商异宝、海外朝岁贡图印" }
    ]
  },

  // ==================== 中等难度 ====================
  {
    id: "emperor_liu_che",
    name: "汉武帝 刘彻",
    dynastyId: "han",
    dynastyName: "强汉风骨",
    difficulty: "中等",
    difficultyDesc: "【征伐匈奴】百战强军，名将卫霍齐出。然而边境袭扰剧烈，国家财用耗空、征伐惨烈。",
    title: "武帝雄主 · 汉家天子",
    avatarSeed: "general",
    startingTime: "公元前141年 西汉 建元元年二月初一",
    background: "你自建章未央醒来。祖宗三代休养生息，国家仓廪皆实。然而匈奴在边，时常入侵。你命卫青、霍去病练新军，矢志倾举国之力一雪和亲耻辱！",
    alreadyHappened: [
      "景帝逝世，十七岁刘彻正式承袭汉天子位",
      "窦太后秉政大权，主张黄老学说避战"
    ],
    notYetHappened: [
      "太后驾崩，汉武帝罢黜百家、独尊儒术",
      "推行推恩令折切藩王，实现中央大集权",
      "发兵扫击漠北，大通河西走廊，张骞凿穿西域"
    ],
    originalTrajectory: "武功显赫，完全击溃匈奴单于主力，然而常年穷兵黩武虚耗国库，晚年因巫蛊之祸及抗折，下《轮台罪己诏》反思。",
    attributes: { health: 80, prestige: 86, gold: 5000, military: 89, defense: 75, strength: 82, agility: 70, stamina: 80, intelligence: 88, luck: 70 },
    initialSkills: [
      { id: "s5", name: "推恩削藩令", level: "融会贯通", description: "分封异姓，温水煮青蛙，使其无力对抗朝廷。", exp: 85, type: "君臣国政" },
      { id: "s6", name: "北伐铁骑调度", level: "登堂入室", description: "调配羽林虎贲，逐水草长图，奔突合围。", exp: 60, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i5", name: "御赏尚方斩马重剑", quality: "绝世", type: "御用神兵", count: 1, description: "宫廷造办处不灭宝刃，能先斩后奏阻慑奸贼。" }
    ],
    initialQuests: [
      { id: "q3", title: "北击漠北大捷", description: "调配战甲边饷，令霍去病突击匈奴龙城，封狼居胥，削灭左右贤王。", status: "进行中", type: "主线", reward: "大破匈奴单于，声名大振，军力+20" }
    ]
  },
  {
    id: "emperor_zhao_zhen",
    name: "宋仁宗 赵祯",
    dynastyId: "song",
    dynastyName: "大宋华章",
    difficulty: "中等",
    difficultyDesc: "【庆历新政】重文抑武，四海承平，但面临西夏、辽兵均势威胁，国库经常吃紧，需守成制横。",
    title: "仁宗贤君 · 儒雅大皇帝",
    avatarSeed: "scholar",
    startingTime: "公元1022年 北宋 乾兴元年二月二十",
    background: "宣德楼外汴河春水。西夏李元昊反乱建国，辽国十万精兵屯在边境。朝中范仲淹、包拯、狄青等千古忠良在列，然而大宋文官政治掣肘极强，需在政治平衡中谋存谋盛。",
    alreadyHappened: [
      "真宗崩，十三岁仁宗受太后辅政登极",
      "澶渊之盟后国家历经数十载无大战火，社会丰饶"
    ],
    notYetHappened: [
      "仁宗亲政，任范朱富等文良开启『庆历新政』",
      "任用神勇大将狄青，大败侬智高及西夏李元昊叛军",
      "确立开封府包青天司法清誉秩序"
    ],
    originalTrajectory: "包容异见，百家争鸣，虽深受西夏掣肘和三冗重负（冗兵/冗官/冗费），但因其温仁，死后朝野哀恸，谓之“仁宗盛世”。",
    attributes: { health: 75, prestige: 92, gold: 7500, military: 58, defense: 62, strength: 50, agility: 58, stamina: 70, intelligence: 90, luck: 76 },
    initialSkills: [
      { id: "s7", name: "庆历儒家论说", level: "融会贯通", description: "崇儒抑官，善护天下寒门儒士风雅节操。", exp: 70, type: "君臣国政" },
      { id: "s8", name: "岁币地缘消解", level: "初窥门径", description: "用白银、绢绸等财货进行辽夏离间外交，买断战争。", exp: 45, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i7", name: "范文正公《忧国疏》", quality: "绝世", type: "武学残册", count: 1, description: "先天下之忧而忧之风骨，护佑朝臣清正纲纪。" }
    ],
    initialQuests: [
      { id: "q4", title: "平御三川口之捷", description: "西夏李元昊围攻边防，需起用狄青重整大宋三军，大破强夏。", status: "进行中", type: "主线", reward: "挽回边防危机，狄青大枪一振" }
    ]
  },
  {
    id: "emperor_yang_guang",
    name: "隋炀帝 杨广",
    dynastyId: "sui",
    dynastyName: "大隋帝国",
    difficulty: "中等",
    difficultyDesc: "【开运大江】大隋立国不久，杨广初登宝座。若停止劳役三夷乱打，大隋将拥万载极富根基。",
    title: "隋大业帝 · 暴风雄主",
    avatarSeed: "alchemist",
    startingTime: "公元604年 隋朝 大业大年初春正月",
    background: "你从仁寿宫的沉香宝座上惊醒。皇父文帝杨坚病卒。虽然有越国公杨素、名将韩擒虎镇边，大隋府库天下第一，然而关陇阀极度骄狂，征讨之诏隐有大变。",
    alreadyHappened: [
      "文帝驾崩，晋王杨广正式承袭北周继承的大隋大统",
      "平定汉王杨谅等举兵反乱叛乱"
    ],
    notYetHappened: [
      "大掘百万民役，沟通南北‘隋唐大运河’",
      "设置武科、进士科，历史性正式确立华夏科举帝制",
      "亲率二十一万大军绝大出塞西巡，三征高丽，激变天下农民军民起义"
    ],
    originalTrajectory: "大发民役修长城、开大运河引发天下群雄（李渊、瓦岗）大起义，自困江都，最终被近卫缢杀，隋亡。",
    attributes: { health: 85, prestige: 70, gold: 15000, military: 88, defense: 60, strength: 75, agility: 62, stamina: 70, intelligence: 92, luck: 65 },
    initialSkills: [
      { id: "s105", name: "科举帝令创", level: "融会贯通", description: "开科举取大才，打破门阀阀阅士族垄断，广聚天下寒士之力。", exp: 80, type: "君臣国政" },
      { id: "s106", name: "九夷广纳外交", level: "融会贯通", description: "陈列百戏珍兽招徕西域众酋，穷奢极豪彰显华夏圣威。", exp: 68, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i103", name: "隋朝大仓粮籍契", quality: "绝世", type: "传国信物", count: 1, description: "天下第一洛口大仓契书。储蓄米粮千万石，隋亡五十年后依然满囤。" }
    ],
    initialQuests: [
      { id: "q103", title: "京杭运河决策", description: "斟酌是否大修运河贯通南北，若缓期并减免重税，能极大赢取苍生民心，巩固江山。", status: "进行中", type: "主线", reward: "江南贡盐运通、气血回溯、国泰民安" }
    ]
  },
  {
    id: "emperor_li_shimin",
    name: "唐太宗 李世民",
    dynastyId: "tang",
    dynastyName: "大唐盛世",
    difficulty: "中等",
    difficultyDesc: "【玄武初登】血染东宫，玄武门变刚息。颉利突厥乘机率大军围困长安。背水一战，命有千钧危局。",
    title: "天可汗 · 贞观太宗",
    avatarSeed: "general",
    startingTime: "公元626年 大唐 武德九年仲夏八月二十",
    background: "你一身血铠，端在李渊让位的弘义太和殿。突厥颉利可汗知晓唐廷内乱，正率铁骑二十万呼啸直抵泾阳，兵骑逼在渭水桥畔，挽弓只在弦上！",
    alreadyHappened: [
      "玄武门兵围并诛杀李建成、李元吉党羽",
      "高祖李渊下诏退位太上皇，禅让秦王李世民即位"
    ],
    notYetHappened: [
      "渭水桥头，太宗退突厥合围（渭水之盟）",
      "重用李靖、柴绍，兵雪国耻，生擒突厥颉利可汗",
      "重用房谋杜断文武百贤，开创『贞观之治』"
    ],
    originalTrajectory: "靠惊天胆识结盟渭水，之后励精图治恢复民生，发大军生擒颉利震服诸胡，被推尊为华夏“天可汗”。",
    attributes: { health: 90, prestige: 85, gold: 4000, military: 94, defense: 55, strength: 90, agility: 80, stamina: 88, intelligence: 96, luck: 80 },
    initialSkills: [
      { id: "s107", name: "天策府天将诀", level: "一代宗师", description: "天策上将李世民横刀百战枪法。威震三军，一扫万贼。", exp: 95, type: "武林秘籍" },
      { id: "s108", name: "镜鉴纳谏言", level: "融会贯通", description: "礼贤魏征进行死谏反思，清正德范，化解人言怨叹。", exp: 78, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i104", name: "天策玄甲金兵牌", quality: "绝世", type: "传国信物", count: 1, description: "李世民御制军令牌。一声令下，数万百战‘玄甲精骑’随命死拼。" }
    ],
    initialQuests: [
      { id: "q104", title: "退渭水二十万骑", description: "如何利用空城之虚，对付颉利可汗逼宫？可用金库大开贿之、亦可突袭斩首，全在玩家博弈一步。", status: "进行中", type: "主线", reward: "突厥退兵、免亡国之耻、开启大唐贞观卷" }
    ]
  },

  // ==================== 困难难度 ====================
  {
    id: "emperor_zhu_youjian",
    name: "明思宗 朱由检",
    dynastyId: "ming",
    dynastyName: "大明帝国",
    difficulty: "困难",
    difficultyDesc: "【崇祯之叹】国势飘零，李自成反乱卷天下，萨尔浒后清兵压辽东，崇祯帝痛苦夺一线天生机。",
    title: "崇祯天子 · 孤悬烈帝",
    avatarSeed: "scholar",
    startingTime: "公元1627年 大明 天启七年九月初七",
    background: "太和高阳正殿风凄云寒。皇兄熹宗驾崩，魏忠贤阉党仍盘根错节。国库岁饷因万历三大征大损已至冰点，陕北荒旱颗粒无收、李自成揭竿而起，大劫就在阁下股掌！",
    alreadyHappened: [
      "天启帝崩逝，无嗣，信王朱由检继任大统",
      "魏忠贤厂卫大权达到颠峰，祸乱东林朝中文武常纲"
    ],
    notYetHappened: [
      "计诛魏忠贤，全面剪除阉党",
      "抗击努尔哈赤、皇太极八旗兵，九边防线岌岌可危",
      "李自成攻破北京开沙，崇祯殉国大难"
    ],
    originalTrajectory: "多疑且频繁撤换首辅与督师，最终因李自成攻破北京内城，在景山歪脖槐树上，用龙袍悬颈，留下罪己书，大明亡。",
    attributes: { health: 65, prestige: 50, gold: 1500, military: 42, defense: 50, strength: 58, agility: 64, stamina: 75, intelligence: 76, luck: 25 },
    initialSkills: [
      { id: "s9", name: "鹰犬抄没法", level: "融会贯通", description: "用厂卫特务突袭查抄叛臣藏银，大充国帑，然而易寒百臣归降之心。", exp: 68, type: "君臣国政" },
      { id: "s10", name: "凭坚守御守", level: "初窥门径", description: "利用孙承宗、袁崇焕构筑宁锦大防线，抵御八旗猛攻。", exp: 40, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i9", name: "锦衣卫白骨牙牌", quality: "奇珍", type: "传国信物", count: 1, description: "不夺自威的鹰犬密令，能够强查贪污与不臣之心。" }
    ],
    initialQuests: [
      { id: "q5", title: "铲除魏党魏阉", description: "在不激起九边叛乱的同时，如何巧递御批，除掉专权的魏忠贤阉党？", status: "进行中", type: "主线", reward: "重掌大权、收买民心、提升智力/声望" }
    ]
  },
  {
    id: "emperor_liu_shan",
    name: "蜀汉后主 刘禅",
    dynastyId: "三国",
    dynastyName: "三国乱世",
    difficulty: "困难",
    difficultyDesc: "【乐不思蜀】先帝凄凉逝于白帝，托孤诸葛相父。蜀国偏安一隅，曹魏雄师在北，大夏倾崩近在眼前。",
    title: "季汉后主 · 愚鲁阿斗",
    avatarSeed: "alchemist",
    startingTime: "公元223年 蜀汉 建兴元年五月初五",
    background: "白帝城涛声激浪。昭烈皇帝刘备夺天下未果，夷陵大溃，兵败病殁。你十七岁登位继承残军，群贤失魂，唯靠诸葛亮鞠躬尽瘁大兴北伐。",
    alreadyHappened: [
      "夷陵之战被陆逊火烧连营，刘备大惨白帝城，病重白帝托孤",
      "张飞关羽相继殒命，蜀中仅存两成国都地疆"
    ],
    notYetHappened: [
      "诸葛丞相南征孟获平定南中作乱",
      "相父六出祁山北伐魏国，病逝五丈原秋风星落",
      "魏国邓艾偷渡阴平小路袭击成都"
    ],
    originalTrajectory: "完全依靠诸葛亮、费祎、董允、姜维守得小朝廷四十年。相父兵解后，黄皓擅权，邓艾入蜀，刘禅降魏，被封安乐公。",
    attributes: { health: 80, prestige: 40, gold: 2000, military: 45, defense: 55, strength: 40, agility: 50, stamina: 60, intelligence: 55, luck: 48 },
    initialSkills: [
      { id: "s11", name: "无为安邦说", level: "登堂入室", description: "事事委任相父决定，安心休养后方，降低政治损耗。", exp: 55, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i11", name: "武侯亲手撰《出师表》", quality: "绝世", type: "传国信物", count: 1, description: "字字泣血不枉人臣绝笔，内含诸葛之神魄妙局。" }
    ],
    initialQuests: [
      { id: "q6", title: "安定川汉后方", description: "给相父拨发粮草饷银以安抚地方叛羌乱民，坚稳成都宗庙。" , status: "进行中", type: "主线", reward: "民心稳定，库银增加" }
    ]
  },
  {
    id: "emperor_liu_xie",
    name: "汉献帝 刘协",
    dynastyId: "三国",
    dynastyName: "三国乱世",
    difficulty: "困难",
    difficultyDesc: "【挟持汉鼎】诸侯夺权，逆贼董卓入京。被废立为傀儡少主，虎狼在侧，谋有一线生还契机。",
    title: "九岁汉献天子 · 百战傀儡",
    avatarSeed: "scholar",
    startingTime: "公元189年 东汉 永汉元年九月初一",
    background: "你以九岁稚龄被凉州军阀董卓擅自安在皇位之上。大汉皇都刀兵林立，胞兄弘农王被药杀。董卓佩剑践上未央宝殿，顺我者死逆我者亡！",
    alreadyHappened: [
      "大将军何进谋诛内侍不成反被截杀，爆发十常侍之大乱",
      "西凉董卓率数万虎狼魔将入京重度控制汉室宗庙，并废少帝李辩"
    ],
    notYetHappened: [
      "曹操、袁绍等十七路群雄诸侯兵合酸枣讨董卓",
      "董卓震惧，火烧神都洛阳劫迁汉朝长安",
      "王允美人连环计刺杀董卓，曹操挟天子以令诸侯许昌"
    ],
    originalTrajectory: "遭遇李傕郭汜叛乱沦为流民，逃逸中在许昌投奔曹操，汉鼎为曹操垄断，最终被曹丕受禅废立安为山阳公。",
    attributes: { health: 70, prestige: 35, gold: 1000, military: 5, defense: 15, strength: 35, agility: 42, stamina: 58, intelligence: 72, luck: 35 },
    initialSkills: [
      { id: "s109", name: "写衣带血手诏", level: "初窥门径", description: "咬破指尖在朝袍下暗缝手敕，呼吁四海豪杰勤君一死博弈。", exp: 50, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i105", name: "天汉断折九龙御剑", quality: "绝世", type: "御用神兵", count: 1, description: "先祖高天子斩白蛇神武断剑。象征汉鼎倾崩而骨犹在。" }
    ],
    initialQuests: [
      { id: "q105", title: "求联曹操袁绍", description: "暗派近侍持断瓦暗信，投奔山东各路各雄纠召天下讨逆军防力量。", status: "进行中", type: "主线", reward: "群雄讨董大局催生、皇帝幸免刀兵遇刺" }
    ]
  },
  {
    id: "emperor_zhu_qizhen",
    name: "明英宗 朱祁镇",
    dynastyId: "ming",
    dynastyName: "大明帝国",
    difficulty: "困难",
    difficultyDesc: "【土木之耻】朱祁镇遭遇瓦剌大围攻，大军溃败，被生擒并虏去北狩。北京危在旦夕之劫。",
    title: "正统天子 · 北狩囚君",
    avatarSeed: "general",
    startingTime: "公元1449年 大明 正统十四年八月十五",
    background: "你惊坐在瓦剌大将也先的黑营军帐中。土木堡漫天黄沙塞血，护驾群臣死难，王振伏诛。你竟然成了瓦剌俘虏，背后的北京城中，于谦正要拥立新帝死博守卫！",
    alreadyHappened: [
      "明英宗宠幸太监王振，率精兵二十万仓促北上亲征瓦剌",
      "土木堡被也先精骑大加合击，军民彻底崩溃，英宗被俘"
    ],
    notYetHappened: [
      "太后召少保于谦辅佐，拥立郕王朱祁钰称帝（景泰帝）",
      "瓦剌大兵挟朱祁镇威逼北京城，于谦开展绝顶北京保卫战",
      "英宗放归南宫幽禁八载，最终发动夺门之变夺回帝位"
    ],
    originalTrajectory: "北狩因谦和获得也先释放。返回被景泰帝幽禁，利用景泰崩病危，发动武将夺权夺门成功复辟削于谦。",
    attributes: { health: 75, prestige: 22, gold: 1200, military: 15, defense: 20, strength: 52, agility: 48, stamina: 82, intelligence: 68, luck: 45 },
    initialSkills: [
      { id: "s110", name: "夺门乘巧术", level: "初窥门径", description: "擅在幽闭中观察局势，伺隙联合京畿武勋夺玺复位。", exp: 45, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i106", name: "血书残破南宫砚", quality: "奇珍", type: "俗世细软", count: 1, description: "幽禁南宫时所持的玉砚，上带崇圣写血之红印。" }
    ],
    initialQuests: [
      { id: "q106", title: "暗修绝境归华", description: "如何巧言说服瓦剌将领也先放归、并买断关防近前重回大明京师？", status: "进行中", type: "主线", reward: "重归京城、气运与智谋大幅变动、夺回社稷端倪" }
    ]
  },

  // ==================== 天崩难度 ====================
  {
    id: "emperor_zhao_huan",
    name: "宋钦宗 赵桓",
    dynastyId: "song",
    dynastyName: "大宋华章",
    difficulty: "天崩",
    difficultyDesc: "【靖康耻劫】金兵强围汴京东京开封府。六甲神棍骗局不攻而破，满朝皇戚跪求偷生在雪泥边缘。",
    title: "靖康天子 · 风雪废帝",
    avatarSeed: "scholar",
    startingTime: "公元1126年 北宋 靖康元年正月初三",
    background: "东京开封府大雪伴血，狂风凛冽。金朝东路完颜帅二十万兵锋合围外城。宋徽宗禅位后跑避江南，把这亿兆生灵与破败汴京作为绝局留给你，满地哀泣！",
    alreadyHappened: [
      "徽宗面对金大军犯塞胆战心悸，仓促把帝位传子赵桓",
      "李纲死守第一次逼退围攻，朝中投降派群臣乘隙破坏防守"
    ],
    notYetHappened: [
      "朝廷误信神棍郭京之“六甲神兵”妖术，开朱雀门迎敌致大溃",
      "金兵突冲攻克内城，掳取徽钦二帝及妃嫔十万北上入塞（靖康之役）",
      "赵构建立南宋抗金政权"
    ],
    originalTrajectory: "两度犹疑削去李纲，轻信神棍导致东京彻底失守，被强虏前往漠北五国城，受牵羊之礼折磨受辱凄凉死在远荒塞下。",
    attributes: { health: 48, prestige: 15, gold: 500, military: 10, defense: 12, strength: 30, agility: 35, stamina: 40, intelligence: 45, luck: 10 },
    initialSkills: [
      { id: "s12", name: "割地议和词", level: "登堂入室", description: "求饶于完颜金营，掠搜东京百姓资产以贿合贼将。", exp: 60, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i13", name: "徽宗瘦金体手绘梅竹", quality: "奇珍", type: "俗世细软", count: 1, description: "瘦骨仙骨、墨宝孤画，然而对抵抗金贼暴卒毫无卵用。" }
    ],
    initialQuests: [
      { id: "q7", title: "击退虎狼金师", description: "死死坚守并重用李纲督师外城御防，派出死命血书飞骑召集宗泽等抗金勤王大军解围！", status: "进行中", type: "主线", reward: "击退金奴主力、改写灭国命数、复大宋元气" }
    ]
  },
  {
    id: "emperor_zhao_bing",
    name: "南宋少帝 赵昺",
    dynastyId: "song",
    dynastyName: "大宋华章",
    difficulty: "天崩",
    difficultyDesc: "【崖山滔浪】十万军民连锁海上。张世杰连锁千艘巨木舰船抗飙，背波海大风最后一决！",
    title: "八岁幼帝 · 崖山大悲祭",
    avatarSeed: "scholar",
    startingTime: "公元1278年 南宋 祥兴元五月初一",
    background: "南海怒涛，暴雨连绵。陆秀夫、张世杰拥立八岁太子于惊涛海波上。蒙古名将张弘范率大舰包围水域，火流烈战，大宋江山皆失，唯剩这一方孤涛浮木！",
    alreadyHappened: [
      "临安沦亡，端宗死海。陆秀夫身负年仅八岁的赵昺登立海上",
      "北方中原所有宋土地江皆被元朝汗庭彻底并吞占领"
    ],
    notYetHappened: [
      "文天祥宁死不屈零丁洋死成悲歌",
      "张世杰连锁海巨船遇火包围大崩溃",
      "陆秀夫负少帝赵昺，跳海同殉崖山"
    ],
    originalTrajectory: "海战败阵，陆秀夫背起八岁少帝跳入南海巨澜淹死殉节，十万军民随死，南宋彻底覆灭，华夏神州第一次完全陆沉。",
    attributes: { health: 60, prestige: 90, gold: 300, military: 28, defense: 35, strength: 65, agility: 45, stamina: 95, intelligence: 92, luck: 12 },
    initialSkills: [
      { id: "s13", name: "海浪连锁长啸阵", level: "一代宗师", description: "张世杰与陆秀夫所练死战决心，十万宋军水师一息尚存便死斗绝境。", exp: 95, type: "武林秘籍" },
      { id: "s14", name: "正气歌怒吼", level: "融会贯通", description: "传诵文相《正气歌》，九九英魄，极大激发死战死魄。", exp: 80, type: "风雅杂世" }
    ],
    initialItems: [
      { id: "i14", name: "天宋幼帝龙襟传国玺", quality: "神传", type: "传国信物", count: 1, description: "纯金龙钮印，挂于八岁幼太子胸袍龙襟之上，沉入海中则江山灰寂。" }
    ],
    initialQuests: [
      { id: "q8", title: "重开出海海路", description: "击破元军张弘范在南海海口的铁索火箭重障，突围南海巨浪，前往占城仙界海外求生。", status: "进行中", type: "主线", reward: "突围成功、获『重开汉海大天命』、声威大振" }
    ]
  },
  {
    id: "emperor_li_heng",
    name: "唐肃宗 李亨",
    dynastyId: "tang",
    dynastyName: "大唐盛世",
    difficulty: "天崩",
    difficultyDesc: "【灵武中兴】安禄山叛军践踏长安洛阳。李隆基避难流亡蜀道，唐肃宗在朔方朔野艰辛撑鼎大逆袭。",
    title: "肃宗天子 · 灵武救时帝",
    avatarSeed: "general",
    startingTime: "公元756年 大唐 至德元年七月十二",
    background: "朔野荒漠，风劲沙怒。公元756年，安禄山范阳八镇叛军攻陷两京，玄宗在马嵬坡兵变贵妃上吊后遁入蜀地。你在马嵬坡与父亲分道扬镳，于灵武仓促自立，孤撑危局！",
    alreadyHappened: [
      "潼关失守，大唐洛阳、长安相继大惨沦落叛军贼子手中",
      "马嵬坡刀兵逼宫，玄宗缢杨贵妃，自此遁去西蜀避开锋芒"
    ],
    notYetHappened: [
      "李亨在灵武自行登基称帝，遥尊李隆基为皇太上皇",
      "大将军郭子仪、李光弼等收拢朔方镇雄军开展收复两京",
      "唐朝引入回鹘盟约精锐，中兴大反击，彻底肃清安史乱贼"
    ],
    originalTrajectory: "灵武称帝后依靠郭子仪等大将连续攻破叛将安守忠，功高一成中兴两京。然而急于求成，过度用太监鱼朝恩李辅国，为晚唐祸端留伏笔。",
    attributes: { health: 68, prestige: 55, gold: 1000, military: 68, defense: 45, strength: 66, agility: 58, stamina: 75, intelligence: 84, luck: 38 },
    initialSkills: [
      { id: "s15", name: "朔方边戎铁律", level: "融会贯通", description: "调用百战朔方军镇，精制步阵，誓死死拼悍将史思明安禄山部。", exp: 82, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i16", name: "郭子仪征辽乌金劈山大刀", quality: "绝世", type: "御用神兵", count: 1, description: "令公沙场重斩劈山宝刃，带满宿敌之妖炎血尘。" }
    ],
    initialQuests: [
      { id: "q9", title: "灵武重整复两京", description: "说服并收编周围流散郡兵与回鹘，在陕州一举大败叛贼，合围合击复位西京京师长安。", status: "进行中", type: "主线", reward: "克复长安洛阳、皇帝气运/威望大振、续唐中兴命" }
    ]
  },
  {
    id: "emperor_zhu_yousong",
    name: "南明弘光帝 朱由崧",
    dynastyId: "ming",
    dynastyName: "大明帝国",
    difficulty: "天崩",
    difficultyDesc: "【江南残雨】李自成已死，清朝多尔衮大军借关防引兵渡江。满朝文武争权不息，史可法扬州誓死死守。",
    title: "弘光天子 · 孤悬江南雨皇",
    avatarSeed: "alchemist",
    startingTime: "公元1644年 南明 弘光元年五月十五",
    background: "金陵宫阙，凄雨纷纷。崇祯帝殉国，吴三桂引清军屠戮中原。福王朱由崧被江南名相马士英扶上南京皇位。大军步步逼在扬州前线上，江南兵防弱等！",
    alreadyHappened: [
      "闯贼攻陷顺天，崇祯自缢煤山。吴三桂山海关放八旗骑兵扫灭大顺军入京",
      "福王于南京即位自建南明，史可法督师扬州"
    ],
    notYetHappened: [
      "史可法血战扬州不克，多铎纵屠掠‘扬州十日’大祸",
      "清精骑渡江，南京陷落，叛将解送朱由崧于京郊处死",
      "江南江东剃发大惨，南明分化多王覆灭"
    ],
    originalTrajectory: "荒淫不治，马阮倾轧异己，江防全无章法。一年内南京城破被俘幽解北虏处斩，留下弘光之惨梦。",
    attributes: { health: 65, prestige: 25, gold: 1800, military: 20, defense: 25, strength: 48, agility: 52, stamina: 55, intelligence: 62, luck: 20 },
    initialSkills: [
      { id: "s16", name: "联虏平贼虚与论", level: "初窥门径", description: "南明昏策，妄图许地纳贡贿借八旗以抗寇，白耗国力。", exp: 50, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i17", name: "秦淮夜泊青纱熏炉", quality: "凡器", type: "俗世细软", count: 1, description: "画舫清风、落花香盒，轻闻能够化解朝政绝境中一阵烦痛。" }
    ],
    initialQuests: [
      { id: "q10", title: "援守扬州死防", description: "倾尽库银白银，火速特谴徐州、金陵等江防五哨，前往扬州增援史可法，在扬州城周打铁桩阻击精骑。", status: "进行中", type: "主线", reward: "击碎清贼合围在扬州关卡、声威夺回江南大中兴" }
    ]
  },
  {
    id: "emperor_sima_zhong",
    name: "晋惠帝 司马衷",
    dynastyId: "xijin",
    dynastyName: "西晋王朝",
    difficulty: "天崩",
    difficultyDesc: "【何不食肉糜】皇后贾南风专权，八王之乱一触即发，关外五胡厉兵秣马。",
    title: "晋惠帝 · 痴愚天子",
    avatarSeed: "alchemist",
    startingTime: "公元290年 西晋 永熙元年四月二十",
    background: "你自洛阳显阳殿醒来。父皇武帝司马炎开皇极之世而终。然而朝廷空虚，群臣斗富，皇后贾南风野心勃勃。边境外游牧部族拥兵自重，而你天生痴讷，臣子们正窃窃私语：“今岁天下荒歉，百姓无粮，何不食肉糜？”",
    alreadyHappened: [
      "晋武帝司马炎病逝，惠帝司马衷继任帝位",
      "外戚杨骏总揽朝政，皇后贾南风密谋密夺大权"
    ],
    notYetHappened: [
      "贾南风联络楚王司马玮捕杀杨骏，引爆『八王之乱』",
      "匈奴刘渊、羯族石勒自关外大举起兵，永嘉之乱危亡",
      "西晋神州陆沉，洛阳长安失守"
    ],
    originalTrajectory: "贾皇后乱政引爆八王争夺神器，导致边关空虚被羯奴侵凌，洛阳沦陷，惠帝被囚最终毒死，西晋覆灭。",
    attributes: { health: 80, prestige: 25, gold: 3000, military: 35, defense: 30, strength: 40, agility: 45, stamina: 70, intelligence: 20, luck: 15 },
    initialSkills: [
      { id: "s_xj1", name: "顺水推舟言", level: "融会贯通", description: "装疯卖傻，随波逐流，降低朝中权贵对你谋反夺位的警觉度。", exp: 80, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i_xj1", name: "绿釉陶楼食盒", quality: "凡器", type: "俗世细软", count: 1, description: "晋朝奢华贵族进贡的食盘，内含肉羹热气，供主公御览消遣。" }
    ],
    initialQuests: [
      { id: "q_xj1", title: "中和贾后之权", description: "联合辅政张华、宗室司马亮，阻止贾南风独掌朝纲，并在八王争锋前平整武卫劲旅。", status: "进行中", type: "主线", reward: "朝中声望+30，保得帝体常安" }
    ]
  },
  {
    id: "emperor_sima_rui",
    name: "晋元帝 司马睿",
    dynastyId: "dongjin",
    dynastyName: "东晋偏安",
    difficulty: "困难",
    difficultyDesc: "【王马共治】衣冠南渡偏安江左，王导王敦把持军政，主弱臣强，世家门阀鼎立。",
    title: "晋元帝 · 偏安江左祖",
    avatarSeed: "scholar",
    startingTime: "公元318年 东晋 建武二年三月初九",
    background: "建康台城凄风夜雨。传统神州碎成焦土，士族衣冠南渡，百废待兴。宰辅王导掌控百官，大将军王敦手握荆湘雄兵。世人盛传“王与马共天下”，名为天子，身不由己。",
    alreadyHappened: [
      "洛阳沦陷，西晋完结，宗室南渡建康避祸三江",
      "琅琊王司马睿被王氏世族拥立，正式称帝重建江右晋室"
    ],
    notYetHappened: [
      "武昌领兵的王敦借口清君侧，挥兵突袭并攻破建康台城",
      "名将祖逖中流击楫，誓师孤军北伐，试图收复黄河关山失地",
      "五胡乱方，东晋面临胡族步步南侵，王师防线吃紧"
    ],
    originalTrajectory: "因王敦兵变逼宫、名将祖逖北伐夭折忧愤交加而死，皇权长年受制于南方与北方大族之均势。",
    attributes: { health: 70, prestige: 45, gold: 2500, military: 40, defense: 55, strength: 52, agility: 48, stamina: 65, intelligence: 80, luck: 42 },
    initialSkills: [
      { id: "s_dj1", name: "王马均势术", level: "融会贯通", description: "在建康大族与琅琊王氏之间博弈均势，维系台城帝威。", exp: 75, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i_dj1", name: "《中流击楫手卷》", quality: "奇珍", type: "俗世细软", count: 1, description: "记录着祖逖击楫誓言的北伐悲情画轴，激励王师抗御强侮。" }
    ],
    initialQuests: [
      { id: "q_dj1", title: "笼络南方旧臣", description: "在王导协助下，平息南方本土豪强对南渡侨姓大族的怨气，并防备王敦的兵变攻城。", status: "进行中", type: "主线", reward: "南方士族归心，守防提升+20" }
    ]
  },
  {
    id: "emperor_liu_yu",
    name: "宋武帝 刘裕",
    dynastyId: "nanchao",
    dynastyName: "南朝刘宋",
    difficulty: "中等",
    difficultyDesc: "【气吞万里】寒人称雄，兵圣临朝。挥师北伐，力克群胡，然高龄践祚，世族门阀暗中掣肘。",
    title: "宋高祖 · 寄奴天子",
    avatarSeed: "general",
    startingTime: "公元420年 南朝 宋永初元年端午",
    background: "你自建康金銮殿上醒来。你出身孤苦，寒微耕渔，一柄砍刀于乱世百战中斩桓玄、诛卢循，两度北伐灭南燕后秦，收复河洛。如今受晋禅重建刘宋皇朝，门阀豪强咬牙切齿，北方胡寇战云密布。",
    alreadyHappened: [
      "刘裕北伐长驱，横扫关中、中原，打通洛阳长安",
      "顺应边军百将拥立，东晋恭帝禅让大玺，建立大宋（刘宋）"
    ],
    notYetHappened: [
      "颁行铁血“土断制”改革，清算门阀匿藏偷税人丁",
      "北魏拓跋兵锋南侵，虎视黄河界线",
      "朝堂嫡庶相轧，太子与诸王暗地中刀光剑影"
    ],
    originalTrajectory: "篡晋即位两年后面临重疾崩逝。其土断新法、以武压儒极大地延续了南国兵运，被誉为“南朝第一雄帝”。",
    attributes: { health: 92, prestige: 88, gold: 5000, military: 96, defense: 62, strength: 95, agility: 82, stamina: 90, intelligence: 85, luck: 75 },
    initialSkills: [
      { id: "s_nc1", name: "气吞万里刀", level: "一代宗师", description: "寄奴百战沙场练就的荡寇重刀法，万军莫当。", exp: 95, type: "武林秘籍" },
      { id: "s_nc2", name: "土断法理整", level: "融会贯通", description: "强行重新厘定户口，清查被世族偷藏的隐丁游侠，增加税收武库。", exp: 80, type: "君臣国政" }
    ],
    initialItems: [
      { id: "i_nc1", name: "寄奴淬火黑玄铁斩蛟刀", quality: "绝世", type: "御用神兵", count: 1, description: "长年伴身，浴血无数的屠锋重刃，斩煞辟妖。" }
    ],
    initialQuests: [
      { id: "q_nc1", title: "扼守大河防线", description: "分遣百战精骑扼守滑台、彭城核心防线，粉碎北魏拓跋鲜卑骑兵的大起南袭。", status: "进行中", type: "主线", reward: "军意大涨，国库资金提升+1500" }
    ]
  },
  {
    id: "emperor_yuan_hong",
    name: "北魏孝文帝 元宏",
    dynastyId: "beichao",
    dynastyName: "北朝北魏",
    difficulty: "中等",
    difficultyDesc: "【太和中兴】迁都洛阳，自残血骨，强令鲜卑全员汉化，守旧旧将虎视，时刻阴谋起兵反叛。",
    title: "魏高祖 · 孝文大帝",
    avatarSeed: "scholar",
    startingTime: "公元494年 北朝 魏太和十八年深秋",
    background: "你伫立在残缺古雅的洛阳太极殿下。平城寒荒，守旧六镇将领盘根错节。你妙设计谋打着南伐大纛，强迁三十万臣民定鼎中原。下令穿汉衣、用汉姓、说汉语、胡汉通婚。鲜卑旧部马刀闪烁，正密谋要将你碎尸万段。",
    alreadyHappened: [
      "冯太后崩驾，元宏乾纲独断，全面推行太和均田新律",
      "巧以南伐萧齐为名，率步骑三十万，排除守旧派死谏强迁洛阳"
    ],
    notYetHappened: [
      "全面禁绝鲜卑姓，皇族拓跋氏改姓为元氏，改穿汉官冠服",
      "皇太子元恂（拓跋恂）不赞同汉法，联合守旧勋贵暗中出走谋反",
      "跟萧梁萧齐王朝频繁爆发两淮地界的拉锯血战"
    ],
    originalTrajectory: "汉化运动完成了北国文化血肉重构，但鲜卑勋门与中央政权极剧隔裂，诱发了后续悲壮的‘六镇兵乱’。",
    attributes: { health: 76, prestige: 85, gold: 6000, military: 82, defense: 70, strength: 65, agility: 60, stamina: 70, intelligence: 92, luck: 60 },
    initialSkills: [
      { id: "s_bc1", name: "太和均田法", level: "融会贯通", description: "分配官田，推广均田一统，实现北方底层民力大振。", exp: 88, type: "君臣国政" },
      { id: "s_bc2", name: "龙门石窟梵音", level: "登堂入室", description: "召募胡汉名工开凿大窟，以慈悲神像中和胡汉将士的征伐血气。", exp: 65, type: "风雅杂世" }
    ],
    initialItems: [
      { id: "i_bc1", name: "《大同平城古卷》", quality: "奇珍", type: "传国信物", count: 1, description: "记录着鲜卑北国旧营祖地，蕴含塞外六镇铁马狂歌的铁血意志。" }
    ],
    initialQuests: [
      { id: "q_bc1", title: "化解宗室分裂", description: "在太子元恂勾结守旧部将起事叛乱前，提前布置玄甲武卫，将其软禁，扑灭守旧幽火。", status: "进行中", type: "主线", reward: "朝廷稳健，智力/内政极度增和" }
    ]
  },
  {
    id: "emperor_kublai_khan",
    name: "元世祖 忽必烈",
    dynastyId: "yuan",
    dynastyName: "大元帝国",
    difficulty: "中等",
    difficultyDesc: "【至元吞陆】草原大汗相残，一统大势在胸。既要挥戈灭宋，又要对付漠北阿里不哥夺权。",
    title: "元世祖 · 薛禅大汗",
    avatarSeed: "general",
    startingTime: "公元1260年 元朝 中统元年五月",
    background: "开平蔚蓝长空，狂风卷雕。皇兄蒙哥汗战崩合州。同族阿弟阿里不哥受漠北保守王侯拥立，誓要起万骑杀你。你抢先在开平即汗位，并宣谕汉法。旧派鲜卑与蒙古勋贵斥责你背弃草原血运，大举弯弓南下！",
    alreadyHappened: [
      "蒙哥突逝。忽必烈北旋开平，率先即位，招徐衡、刘秉忠等多位名儒辅弼",
      "推行部分汉法，建立草原商钞银币与内阁省治之格局"
    ],
    notYetHappened: [
      "与阿里不哥爆发持续四周载的同族激战，以彻底平定草原汗位",
      "定国号为‘大元’，大兴土木营建不朽之都‘元大都（北京）’",
      "合围襄阳要塞，攻渡长江，大举并吞江南，剿灭陆秀夫少帝残部"
    ],
    originalTrajectory: "消灭草原乱逆并一统华夏，创设元行省管辖乾坤。但晚年受制于远征挫折（东渡日本、南征安南）和朝堂争斗。",
    attributes: { health: 88, prestige: 85, gold: 9000, military: 94, defense: 60, strength: 85, agility: 75, stamina: 88, intelligence: 88, luck: 80 },
    initialSkills: [
      { id: "s_y1", name: "行中书省制", level: "融会贯通", description: "创立行省层级节制地方，架设天下马驿，畅捷贡财商路。", exp: 80, type: "君臣国政" },
      { id: "s_y2", name: "怯薛亲军步射", level: "融会贯通", description: "统调大汗心腹怯薛精锐铁骑，百步穿杨，横扫叛藩。", exp: 78, type: "风雅杂世" }
    ],
    initialItems: [
      { id: "i_y1", name: "八思巴文御赐金虎符", quality: "绝世", type: "传国信物", count: 1, description: "铸刻万岁金字之军事圣物，号御一出，蒙古与汉军总管皆俯首死拼。" }
    ],
    initialQuests: [
      { id: "q_y1", title: "荡平偏军宗王", description: "死拒开平咽喉，抵挡并消灭阿里不哥突击荆襄之游骑，为南灭宋创造大后方均势。", status: "进行中", type: "主线", reward: "蒙古大汗汗统正位，战马增加" }
    ]
  }
];

export const MAP_REGIONS: MapRegion[] = [
  {
    id: "capital",
    name: "京畿中原",
    description: "巍巍帝都，黄河汤汤。九重宫阙，权贵汇聚之所。大内密卷、藏宝金库与国脉威严所在。",
    status: "繁荣",
    coordinates: { x: 50, y: 35 },
    dynastyAffiliation: "帝国枢纽"
  },
  {
    id: "jiangnan",
    name: "江南烟雨",
    description: "绿柳拂画船，运河通衢。江南富庶，名士文儒极多，米盐贡绸税赋核心重镇。",
    status: "繁荣",
    coordinates: { x: 72, y: 65 },
    dynastyAffiliation: "财赋之水"
  },
  {
    id: "borders",
    name: "漠北极寒",
    description: "北风呼裂，烽火长照。匈奴、突厥、女真剽悍，常有狼兵袭塞，华夏防御拒敌之死关要道。",
    status: "戒严",
    coordinates: { x: 45, y: 15 },
    dynastyAffiliation: "军防边疆"
  },
  {
    id: "shuchuan",
    name: "蜀道天险",
    description: "蜀道天险，高山急流。天回崇岭，易守难攻。深山常有隐修和古之灵草藏匿，为奇遇大中天。",
    status: "太平",
    coordinates: { x: 28, y: 55 },
    dynastyAffiliation: "仙山福地"
  },
  {
    id: "south_sea",
    name: "南海沧溟",
    description: "巨浪万丈，舶商来往。海风惊天，海寇倭洋暗中夺运，亦是流民少帝偏居或下海出航要冲港。",
    status: "匪患",
    coordinates: { x: 65, y: 88 },
    dynastyAffiliation: "海防交汇"
  }
];
