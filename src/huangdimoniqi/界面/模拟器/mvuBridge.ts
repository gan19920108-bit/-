import { MAP_REGIONS } from './src/gameData';
import type {
  Character,
  ChronicleLog,
  GameItem,
  GameNPC,
  GameScene,
  HistoryTurn,
  MapRegion,
  Quest,
  Skill,
} from './src/types';
import type { Schema } from '../../schema';

export interface GamePersistState {
  isInitialized: boolean;
  isMainMenu: boolean;
  currentCalendarDate: string;
  currentRegionId: string;
  dayStageIndex: number;
  playMode: 'autonomous' | 'quick';
  currentLocation: string;
  currentWeather: { name: string; desc: string; icon: string };
  selectedPresetId: string;
  isCustomMode: boolean;
  customDynasty: string;
  customIdentity: string;
  customStartingTime: string;
  customBackground: string;
  customAlreadyHappened: string;
  customNotYetHappened: string;
  character: Character;
  empireStats: {
    summary: string;
    officials: number;
    treasury: number;
    sentiment: number;
    military: number;
    grain: number;
    annualIncome: number;
    annualExpense: number;
  };
  quests: Quest[];
  skills: Skill[];
  items: GameItem[];
  npcs: GameNPC[];
  regions: MapRegion[];
  chronicles: ChronicleLog[];
  history: HistoryTurn[];
  currentScenario: GameScene;
}

function recordToArray<T extends { id: string }>(record: Record<string, T>): T[] {
  return Object.values(record);
}

function arrayToRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map(item => [item.id, item]));
}

function npcArrayToRecord(npcs: GameNPC[]): Record<string, GameNPC> {
  return Object.fromEntries(npcs.map((npc, index) => [`npc_${index}_${npc.name}`, npc]));
}

function npcRecordToArray(record: Record<string, GameNPC>): GameNPC[] {
  return Object.values(record);
}

export function mvuToGameState(data: Schema): Partial<GamePersistState> {
  const game = data.游戏;
  const attrs = data.角色.attributes;

  return {
    isInitialized: game.已初始化,
    isMainMenu: game.主菜单,
    currentCalendarDate: game.历法,
    currentRegionId: game.地域编号,
    dayStageIndex: game.日程阶段,
    playMode: game.游玩模式 === '快速' ? 'quick' : 'autonomous',
    currentLocation: game.地点,
    currentWeather: {
      name: game.天气.名称,
      desc: game.天气.描述,
      icon: game.天气.图标,
    },
    selectedPresetId: game.预设编号,
    isCustomMode: game.自定义模式,
    customDynasty: game.自定义朝代,
    customIdentity: game.自定义身份,
    customStartingTime: game.自定义历法,
    customBackground: game.自定义背景,
    customAlreadyHappened: game.自定义已发生,
    customNotYetHappened: game.自定义未发生,
    character: {
      ...data.角色,
      attributes: attrs,
    },
    empireStats: {
      summary: data.帝国.summary,
      officials: data.帝国.officials,
      treasury: data.帝国.treasury,
      sentiment: data.帝国.sentiment,
      military: data.帝国.military,
      grain: data.帝国.grain,
      annualIncome: data.帝国.annualIncome,
      annualExpense: data.帝国.annualExpense,
    },
    quests: recordToArray(data.任务),
    skills: recordToArray(data.技能),
    items: recordToArray(data.物品),
    npcs: npcRecordToArray(data.NPC),
    regions: Object.keys(data.地域).length > 0 ? recordToArray(data.地域) : [...MAP_REGIONS],
    chronicles: data.编年,
    history: data.对话历史,
    currentScenario: {
      story: data.当前剧情.story,
      choices: data.当前剧情.choices.map(c => ({
        id: c.id,
        text: c.text,
        attributeChanges: c.attributeChanges,
        questUpdate: c.questUpdate,
      })),
      worldEvent: data.当前剧情.worldEvent,
      foundItem: data.当前剧情.foundItem || undefined,
      attainedSkill: data.当前剧情.attainedSkill || undefined,
    },
  };
}

export function gameStateToMvu(state: GamePersistState): Schema {
  return Schema.parse({
    游戏: {
      已初始化: state.isInitialized,
      主菜单: state.isMainMenu,
      历法: state.currentCalendarDate,
      地域编号: state.currentRegionId,
      日程阶段: state.dayStageIndex,
      游玩模式: state.playMode === 'quick' ? '快速' : '自主',
      地点: state.currentLocation,
      天气: {
        名称: state.currentWeather.name,
        描述: state.currentWeather.desc,
        图标: state.currentWeather.icon,
      },
      预设编号: state.selectedPresetId,
      自定义模式: state.isCustomMode,
      自定义朝代: state.customDynasty,
      自定义身份: state.customIdentity,
      自定义历法: state.customStartingTime,
      自定义背景: state.customBackground,
      自定义已发生: state.customAlreadyHappened,
      自定义未发生: state.customNotYetHappened,
    },
    角色: state.character,
    帝国: state.empireStats,
    任务: arrayToRecord(state.quests),
    技能: arrayToRecord(state.skills),
    物品: arrayToRecord(state.items),
    NPC: npcArrayToRecord(state.npcs),
    地域: arrayToRecord(state.regions),
    编年: state.chronicles,
    对话历史: state.history,
    当前剧情: {
      story: state.currentScenario.story,
      choices: state.currentScenario.choices.map(c => ({
        id: c.id,
        text: c.text,
        category: c.id,
        attributeChanges: c.attributeChanges ?? {},
        questUpdate: c.questUpdate ?? '',
      })),
      worldEvent: state.currentScenario.worldEvent,
      foundItem: state.currentScenario.foundItem ?? '',
      attainedSkill: state.currentScenario.attainedSkill ?? '',
    },
  });
}

export function readMvuGameState(): Schema {
  const variables = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
  return Schema.parse(_.get(variables, 'stat_data', {}), { reportInput: true });
}

export function writeMvuGameState(state: GamePersistState): void {
  const data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
  const next = _.cloneDeep(data);
  _.set(next, 'stat_data', gameStateToMvu(state));
  Mvu.replaceMvuData(next, { type: 'message', message_id: getCurrentMessageId() });
}
