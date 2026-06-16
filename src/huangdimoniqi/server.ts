import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Gemini client on server (using recommended user-agent header and a high timeout)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 180000 // 3 minutes timeout to handle complex schema generation without premature Undici headers timeout
    }
  });

  // Game Endpoint API
  app.post("/api/game/generate", async (req: express.Request, res: express.Response) => {
    try {
      const {
        dynasty,
        identity,
        character,
        quests,
        items,
        skills,
        history, // Array of prior text/choices for contextual conversation
        actionTaken, // The choice or user typed custom text
        empireStats, // Empire structural simulation info
      } = req.body;

      // Construct system prompt for RPG Director
      const sysInstruction = `你是一位精通中国古代历史、朝堂权谋、宫廷秘辛以及东方虚构修真、江湖武侠RPG的首席游戏设计师与文案叙事导演。
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
大数值加减（比如 -10, +15, 或者 -5000两）仅可应用于气血（最高100）、威望（最高100）、黄金。国库两、常备军等帝国变量不在本接口 of 属性加减返回中处理（它由前端判定）。

你作为天道导演，必须基于玩家进行的『动作/分支抉择』：“${actionTaken}”，来推演下一步的命运造化。
如果玩家是皇帝，请紧密围绕朝堂、权臣、太监党争、边境等宏图推演。如果玩家是文人或修真高士，请切入市井风物与江湖侠影。
每一次，你必须生成刚好 4 条后续分支抉择，不能多不能少，每条分支必须简洁精炼，细节到位，紧密前文且自然推动剧情，不能带有“天意抉择”等前缀。
这四条选项必须严格遵循以下四类：
1. 参照历史的选择 (category: "historical")：符合真实历史事实、典故或顺应古代封建规律的传统妥善做法。
2. 积极选择 (category: "positive")：励精图治、迎难而上、果决英勇、改革世态的主动决策。
3. 消极选择 (category: "negative")：偏安避战、妥协退让、怠政贪乐、保守防备的被动决定。
4. 其他 (category: "alternative")：别出心裁、出奇其招、方外修身、或者是包含江湖奇遇、突发奇想、市井奇案的另类操作。

必须只返回纯粹的合法JSON字符串。`;

      // Structure historical context to help Gemini remember prior steps
      const contentsList: any[] = [];
      
      // Inject prior scenario outputs & user actions
      if (history && history.length > 0) {
        // Show up to the last 6 turns to avoid token inflation but keep sequence
        const recentHistory = history.slice(-6);
        for (const turn of recentHistory) {
          if (turn.role === 'assistant') {
            contentsList.push({ role: 'model', parts: [{ text: turn.text }] });
          } else if (turn.role === 'user') {
            contentsList.push({ role: 'user', parts: [{ text: turn.text }] });
          }
        }
      }

      // Add the final action taken by the user
      contentsList.push({
        role: 'user',
        parts: [{ text: `我做出了决定：${actionTaken}` }]
      });

      let response;
      let lastErr: any = null;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Calling Gemini SDK (Attempt ${attempt}/${maxRetries}) with history length:`, contentsList.length);
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contentsList,
            config: {
              systemInstruction: sysInstruction,
              temperature: 0.9,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  story: {
                    type: Type.STRING,
                    description: "以小说化的古风笔法撰写的约200字的故事下段演出，充满传统文学对场景、细节的精致刻画。紧密贴合前文剧情。"
                  },
                  choices: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "选择编号，如'historical', 'positive', 'negative', 'alternative'" },
                        category: { type: Type.STRING, description: "类别，必须对应：'historical', 'positive', 'negative', 'alternative'" },
                        text: { type: Type.STRING, description: "给玩家的分支选项，15-30字。不要包含'天意抉择'这样的字眼，单纯写出动作或选择，细节精炼、语言典雅。" },
                        attributeChanges: {
                          type: Type.OBJECT,
                          properties: {
                            health: { type: Type.NUMBER, description: "气血生命变动 (-10 ~ 10)" },
                            prestige: { type: Type.NUMBER, description: "威望变动 (-10 ~ 15)" },
                            gold: { type: Type.NUMBER, description: "黄金变动" },
                            military: { type: Type.NUMBER, description: "国家军力" },
                            defense: { type: Type.NUMBER, description: "城池防预" },
                            strength: { type: Type.NUMBER, description: "力量变动 (-0.5 ~ +0.5)" },
                            agility: { type: Type.NUMBER, description: "敏捷变动 (-0.5 ~ +0.5)" },
                            stamina: { type: Type.NUMBER, description: "耐力变动 (-0.5 ~ +0.5)" },
                            intelligence: { type: Type.NUMBER, description: "智力变动 (-0.5 ~ +0.5)" },
                            luck: { type: Type.NUMBER, description: "幸运变动 (-0.5 ~ +0.5)" },
                            perception: { type: Type.NUMBER, description: "感知变动 (-0.5 ~ +0.5)" },
                            resolve: { type: Type.NUMBER, description: "决心变动 (-0.5 ~ +0.5)" },
                            charm: { type: Type.NUMBER, description: "风度变动 (-0.5 ~ +0.5)" },
                            manipulation: { type: Type.NUMBER, description: "操控变动 (-0.5 ~ +0.5)" },
                            composure: { type: Type.NUMBER, description: "沉着变动 (-0.5 ~ +0.5)" }
                          }
                        },
                        questUpdate: { type: Type.STRING, description: "任务的细微反馈或触发叙述，没有可留空" }
                      },
                      required: ["id", "text", "category"]
                    },
                    description: "极富权衡的4个命运折片分支选项，必须刚好4个分类，分别对应 historical, positive, negative, alternative。"
                  },
                  worldEvent: {
                    type: Type.STRING,
                    description: "天下大势播报，描述游戏发生的这个时代当前由于玩家行为或天下大势产生的社会大事件，25-50字。"
                  },
                  newQuest: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "新大诏任务标题" },
                      description: { type: Type.STRING, description: "新任务说明" },
                      type: { type: Type.STRING, description: "任务种类：主线、支线或奇遇" },
                      reward: { type: Type.STRING, description: "达成成功后的奖励" },
                      failurePenalty: { type: Type.STRING, description: "失败后的代价" }
                    },
                    description: "本回合是否触发了重大的新使命或大任，没有则留空"
                  },
                  foundItem: {
                    type: Type.STRING,
                    description: "是否获得或失去了某些奇物，如：'辟邪玉佩'，若无则留空。"
                  },
                  attainedSkill: {
                    type: Type.STRING,
                    description: "武功或悟性神通技能大进，如：'木工秘法'，若无则留空。"
                  }
                },
                required: ["story", "choices", "worldEvent"]
              }
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Gemini SDK invocation attempt ${attempt} failed with error:`, err.message || err);
          if (attempt < maxRetries) {
            const delay = attempt * 1500; // incremental delay: 1.5s, 3s before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!response || !response.text) {
        throw lastErr || new Error("Failed to get response text from Gemini API after 3 attempts");
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini");
      }

      // Return the JSON response
      return res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Gemini API generation error:", err);
      // Return a 503 if it was a service unavailable error, otherwise 500
      const status = (err.status === 503 || err.message?.includes("503")) ? 503 : 500;
      return res.status(status).json({
        error: true,
        message: err.message || "天机紊乱，无法推演命理。"
      });
    }
  });

  // Serve static UI assets and route configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
