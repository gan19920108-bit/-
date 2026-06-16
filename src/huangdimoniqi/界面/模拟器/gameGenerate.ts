import { jsonrepair } from 'jsonrepair';
import type { Character, GameItem, HistoryTurn, Quest, Skill } from './src/types';
import type { StoryScenario } from './src/utils/storyteller';

export interface EmpireStats {
  summary: string;
  officials: number;
  treasury: number;
  sentiment: number;
  military: number;
  grain: number;
  annualIncome: number;
  annualExpense: number;
}

export interface GameTurnRequest {
  dynasty: string;
  identity: string;
  character: Character;
  quests: Quest[];
  items: GameItem[];
  skills: Skill[];
  history: HistoryTurn[];
  actionTaken: string;
  empireStats?: EmpireStats;
}

export interface ApiConfig {
  apiAddress?: string;
  apiSecretKey?: string;
  selectedModel?: string;
  apiType?: string;
}

const GAME_JSON_SCHEMA: JsonSchema = {
  name: 'huangdi_game_turn',
  description: '皇帝模拟器单回合剧情与分支选项',
  value: {
    type: 'object',
    properties: {
      story: {
        type: 'string',
        description:
          '以小说化的古风笔法撰写的约200字的故事下段演出，充满传统文学对场景、细节的精致刻画。紧密贴合前文剧情。',
      },
      choices: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: "选择编号，如'historical', 'positive', 'negative', 'alternative'",
            },
            category: {
              type: 'string',
              description: "类别，必须对应：'historical', 'positive', 'negative', 'alternative'",
            },
            text: {
              type: 'string',
              description:
                "给玩家的分支选项，15-30字。不要包含'天意抉择'这样的字眼，单纯写出动作或选择，细节精炼、语言典雅。",
            },
            attributeChanges: {
              type: 'object',
              properties: {
                health: { type: 'number', description: '气血生命变动 (-10 ~ 10)' },
                prestige: { type: 'number', description: '威望变动 (-10 ~ 15)' },
                gold: { type: 'number', description: '黄金变动' },
                military: { type: 'number', description: '国家军力' },
                defense: { type: 'number', description: '城池防预' },
                strength: { type: 'number', description: '力量变动 (-0.5 ~ +0.5)' },
                agility: { type: 'number', description: '敏捷变动 (-0.5 ~ +0.5)' },
                stamina: { type: 'number', description: '耐力变动 (-0.5 ~ +0.5)' },
                intelligence: { type: 'number', description: '智力变动 (-0.5 ~ +0.5)' },
                luck: { type: 'number', description: '幸运变动 (-0.5 ~ +0.5)' },
                perception: { type: 'number', description: '感知变动 (-0.5 ~ +0.5)' },
                resolve: { type: 'number', description: '决心变动 (-0.5 ~ +0.5)' },
                charm: { type: 'number', description: '风度变动 (-0.5 ~ +0.5)' },
                manipulation: { type: 'number', description: '操控变动 (-0.5 ~ +0.5)' },
                composure: { type: 'number', description: '沉着变动 (-0.5 ~ +0.5)' },
              },
            },
            questUpdate: { type: 'string', description: '任务的细微反馈或触发叙述，没有可留空' },
          },
          required: ['id', 'text', 'category'],
        },
        description:
          '极富权衡的4个命运折片分支选项，必须刚好4个分类，分别对应 historical, positive, negative, alternative。',
      },
      worldEvent: {
        type: 'string',
        description: '天下大势播报，描述游戏发生的这个时代当前由于玩家行为或天下大势产生的社会大事件，25-50字。',
      },
      newQuest: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '新大诏任务标题' },
          description: { type: 'string', description: '新任务说明' },
          type: { type: 'string', description: '任务种类：主线、支线或奇遇' },
          reward: { type: 'string', description: '达成成功后的奖励' },
          failurePenalty: { type: 'string', description: '失败后的代价' },
        },
        description: '本回合是否触发了重大的新使命或大任，没有则留空',
      },
      foundItem: {
        type: 'string',
        description: "是否获得或失去了某些奇物，如：'辟邪玉佩'，若无则留空。",
      },
      attainedSkill: {
        type: 'string',
        description: "武功或悟性神通技能大进，如：'木工秘法'，若无则留空。",
      },
    },
    required: ['story', 'choices', 'worldEvent'],
  },
};

function mapApiSource(apiType?: string): string | undefined {
  switch (apiType) {
    case 'gemini':
    case 'google':
      return 'makersuite';
    case 'deepseek':
      return 'deepseek';
    case 'claude':
      return 'claude';
    case 'openai':
      return 'openai';
    default:
      return undefined;
  }
}

function buildCustomApi(apiConfig?: ApiConfig): CustomApiConfig | undefined {
  const apiAddress = apiConfig?.apiAddress?.trim();
  if (!apiAddress || apiAddress === '/api/game/generate') {
    return apiConfig?.selectedModel?.trim()
      ? { model: apiConfig.selectedModel.trim() }
      : undefined;
  }

  return {
    apiurl: apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress,
    key: apiConfig?.apiSecretKey?.trim() || undefined,
    model: apiConfig?.selectedModel?.trim() || undefined,
    source: mapApiSource(apiConfig?.apiType),
  };
}

function buildSystemInstruction(request: GameTurnRequest): string {
  const { dynasty, identity, character, quests, items, skills, actionTaken } = request;

  return `你是一位精通中国古代历史、朝堂权谋、宫廷秘辛以及东方虚构修真、江湖武侠RPG的首席游戏设计师与文案叙事导演。
你正在主导一款『穿越古代模拟人生』的纯中文文字交互扮演游戏。玩家穿越至中国古代。
当前游戏的背景信息：
- 朝代：${dynasty}
- 玩家身份：${identity}
- 玩家姓名：${character.name}，年龄：${character.age}岁
- 玩家基础状态数值（帝王个人核心属性）：
  * 气血 (100分制生命健康度): ${character.attributes.health}
  * 威望 (100分制朝命声威/权威): ${character.attributes.prestige}
  * 私人黄金 (皇帝个人随意调度赐予的私房资产额): ${character.attributes.gold}两
  * 贴身御林军卫力 (100分制御前亲卫防线): ${character.attributes.military}
  * 帝城备防 (100分制内廷防灾抗灾度): ${character.attributes.defense}
  * 力量 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.strength}
  * 敏捷 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.agility}
  * 耐力 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.stamina}
  * 智力 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.intelligence || 2}
  * 幸运 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.luck || 2}
  * 感知 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.perception || 2}
  * 决心 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.resolve || 2}
  * 风度 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.charm || 2}
  * 操控 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.manipulation || 2}
  * 沉着 (核心属性，1-10分制，2.0代表常规，10.0代表极限): ${character.attributes.composure || 2}
- 已有绝学与技能：${JSON.stringify(skills)}
- 藏宝背包物品：${JSON.stringify(items)}
- 挂载在身任务：${JSON.stringify(quests)}

注意核心属性采用严格的 1.0 - 10.0 分制（2.0代表平庸的普通人，10.0代表人体极限）。对这些核心属性的每一次修改应当非常微量，增减在 -0.5 到 +0.5 的浮点数之间。通常普通一次事件提升 0.1 或 0.2 即可。
大数值加减（比如 -10, +15, 或者 -5000两）仅可应用于气血（最高100）、威望（最高100）、黄金。

你作为天道导演，必须基于玩家进行的『动作/分支抉择』：“${actionTaken}”，来推演下一步的命运造化。
如果玩家是皇帝，请紧密围绕朝堂、权臣、太监党争、边境等宏图推演。如果玩家是文人或修真高士，请切入市井风物与江湖侠影。
每一次，你必须生成刚好 4 条后续分支抉择，不能多不能少，每条分支必须简洁精炼，细节到位，紧密前文且自然推动剧情，不能带有“天意抉择”等前缀。
这四条选项必须严格遵循以下四类：
1. 参照历史的选择 (category: "historical")：符合真实历史事实、典故或顺应古代封建规律的传统妥善做法。
2. 积极选择 (category: "positive")：励精图治、迎难而上、果决英勇、改革世态的主动决策。
3. 消极选择 (category: "negative")：偏安避战、妥协退让、怠政贪乐、保守防备的被动决定。
4. 其他 (category: "alternative")：别出心裁、出奇其招、方外修身、或者是包含江湖奇遇、突发奇想、市井奇案的另类操作。

必须只返回纯粹的合法JSON字符串。`;
}

function buildUserInput(actionTaken: string): string {
  if (actionTaken.includes('请为我推演拉开大卷') || actionTaken.length > 120) {
    return actionTaken;
  }
  return `我做出了决定：${actionTaken}`;
}

function parseGameTurnResult(raw: string): StoryScenario {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) {
    throw new Error('模型未返回合法 JSON');
  }

  const parsed = JSON.parse(jsonrepair(jsonText)) as StoryScenario;
  if (!parsed.story || !Array.isArray(parsed.choices) || !parsed.worldEvent) {
    throw new Error('模型返回的 JSON 缺少必要字段');
  }
  return parsed;
}

export async function requestGameTurn(request: GameTurnRequest, apiConfig?: ApiConfig): Promise<StoryScenario> {
  const historyPrompts: RolePrompt[] = [];
  const recentHistory = request.history.slice(-6);
  for (const turn of recentHistory) {
    historyPrompts.push({
      role: turn.role === 'assistant' ? 'assistant' : 'user',
      content: turn.text,
    });
  }

  const userInput = buildUserInput(request.actionTaken);
  const custom_api = buildCustomApi(apiConfig);

  const result = await generateRaw({
    user_input: userInput,
    ordered_prompts: [{ role: 'system', content: buildSystemInstruction(request) }, ...historyPrompts, 'user_input'],
    json_schema: GAME_JSON_SCHEMA,
    should_silence: true,
    custom_api,
  });

  if (typeof result !== 'string') {
    throw new Error('模型返回了工具调用结果，而非剧情 JSON');
  }

  return parseGameTurnResult(result);
}
