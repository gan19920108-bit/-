import React from "react";
import { Globe, BookOpen, Footprints, ShieldAlert } from "lucide-react";

interface ChronicleLog {
  turn: number;
  year: number;
  eventText: string;
}

interface WorldEventsProps {
  currentEvent: string;
  chronicles: ChronicleLog[];
  dynastyName: string;
}

export default function WorldEvents({ currentEvent, chronicles, dynastyName }: WorldEventsProps) {
  // Generate public world news rumors
  const getPublicRumors = (dyn: string) => {
    const list = [
      {
        id: "r1",
        title: "📢 江南行省风物谣",
        text: "江南富商豪掷万金收购关防批文。传闻市井中隐隐有江湖逸能之士，随剧情交织隐现金陵城邑。",
        tag: "官方告示"
      },
      {
        id: "r2",
        title: "📢 关外斥哨飞羽急",
        text: "边区走卒夜见朔风沙暴之中有披甲哨骑夜驰。烽火台上尘烟微动，互市胡商流言四起。",
        tag: "安防传书"
      }
    ];

    if (dyn.includes("唐")) {
      list.push({
        id: "rt1",
        title: "📢 长安御市征药令",
        text: "传百官正暗搜延寿奇珍献上六宫。凡有仙草秘药者，赏黄金千两，赐封开国男爵衔印。",
        tag: "京畿急讯"
      });
    } else if (dyn.includes("明")) {
      list.push({
        id: "rm1",
        title: "📢 九边集市互税改",
        text: "互市番商蜡制母钱在坊间出现，辽东重镇铁饷隐有紧落，商贩畏缩，九边军防疑虑骤升。",
        tag: "九边传言"
      });
    } else {
      list.push({
        id: "ro1",
        title: "📢 瑞兆白玉出陇西",
        text: "陇西猎户忽献天然白璞一尊，上有隐纹‘天开辟易，万民安康’，百官将上表尊崇圣威。",
        tag: "祥瑞志述"
      });
    }
    return list;
  };

  // Generate parallel classified private incidents
  const getParallelEvents = (dyn: string) => {
    const list = [
      {
        id: "p1",
        title: "🕵️‍♂️ 【大理寺秘谍报】",
        text: "密宗行文：有白莲余党假充番僧暗潜金陵、洛阳等首要州郡。正伺机拉拢朝野重臣策反，无关百官皆不得知。",
        source: "暗卫密折"
      },
      {
        id: "p2",
        title: "🕵️‍♂️ 【北庭汗单密照】",
        text: "绝密烽线：漠北诸部大汗于黄金帐中暗聚。秘密签订借道西突厥突袭秦关之盟，江南守军尚无所觉。",
        source: "北疆秘听"
      }
    ];

    if (dyn.includes("唐")) {
      list.push({
        id: "pt1",
        title: "🕵️‍♂️ 【天宝内廷惊蛰之谋】",
        text: "宫廷密影：后宫正谋划与外戚暗结连阁。此行干系江山神器、国政中枢大统，属于蝴蝶效应之绝迹暗线。",
        source: "内省密牒"
      });
    } else if (dyn.includes("明")) {
      list.push({
        id: "pt2",
        title: "🕵️‍♂️ 【东厂緹尉通关文移】",
        text: "内门秘刺：番子截获蜡丸内信。称蓟辽督师与山海关内镇监太监交往甚密，图谋封疆大计，内阁尚全无觉察。",
        source: "东厂飞密"
      });
    } else {
      list.push({
        id: "pt3",
        title: "🕵️‍♂️ 【方修仙家谶言】",
        text: "天机推演：昆仑山道真测算天下二十八宿发生偏移。称将有天命本源神格降于明君圣体，凡庸之辈绝不可察也。",
        source: "玄牝密演"
      });
    }
    return list;
  };

  const rumors = getPublicRumors(dynastyName);
  const parallels = getParallelEvents(dynastyName);

  return (
    <div id="reconstructed-world-events" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#bfa15f]/5 to-transparent pointer-events-none rounded-bl-full" />
      
      <div>
        {/* Simple elegant header without clutters */}
        <div className="flex items-center justify-between border-b border-[#bfa15f]/15 pb-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#8c2c16]/10 border border-[#8c2c16]/25">
              <Globe className="w-4 h-4 text-[#8c2c16]" />
            </div>
            <h2 className="font-serif text-sm font-black text-[#fcfbfa]">世界事件</h2>
          </div>
          <span className="text-[10px] font-mono text-amber-300 font-bold bg-[#1d1a13] px-2.5 py-0.5 border border-[#bfa15f]/15 rounded">
            当朝世事：{dynastyName}
          </span>
        </div>

        {/* Dynamic Split Layout: Left Column = News, Right Column = Parallel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          
          {/* LEFT COLUMN: 世界新闻 (Includes '天下大事汇' Headline and City rumours as requested) */}
          <div className="bg-black/25 rounded-lg border border-neutral-900 p-3 space-y-3 flex flex-col justify-between min-h-[310px]">
            <div>
              <div className="text-[10px] text-[#e6c787] font-serif font-black flex justify-between items-center border-b border-neutral-900 pb-1 mb-2.5">
                <span>📢 世界新闻 (World News)</span>
                <span className="text-[8px] bg-red-950/20 text-orange-400 border border-red-900/30 px-1 rounded">快讯</span>
              </div>

              {/* Headline Banner merged inside World News column strictly */}
              <div className="bg-gradient-to-r from-red-950/25 to-neutral-900/60 border-l-2 border-red-500 p-2 text-[10.5px] font-serif space-y-1 rounded mb-3 shadow-inner">
                <span className="text-[8.5px] font-sans text-amber-400 font-black tracking-wider uppercase block select-none">【今日要务 · 天下大事汇】</span>
                <p className="text-gray-150 text-justify leading-relaxed font-serif">
                  {currentEvent || "天机承平，海内无战。各省秋收在即，圣上可下诏安心训兵拓土。"}
                </p>
              </div>

              {/* Public Rumors Lists */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {rumors.map((rumor) => (
                  <div key={rumor.id} className="bg-neutral-950 p-2.5 rounded border border-neutral-900 text-[10.5px] font-serif space-y-1 leading-relaxed">
                    <div className="flex justify-between items-center text-[8px] leading-none mb-0.5">
                      <span className="text-amber-300/90 font-black">{rumor.title}</span>
                      <span className="text-gray-500 font-sans">{rumor.tag}</span>
                    </div>
                    <p className="text-gray-300 text-justify">{rumor.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 平行事件 (Includes Secret files and Timeline Chronicles strictly) */}
          <div className="bg-black/25 rounded-lg border border-neutral-900 p-3 space-y-3 flex flex-col justify-between min-h-[310px]">
            <div>
              <div className="text-[10px] text-rose-450 text-rose-300 font-serif font-black flex justify-between items-center border-b border-neutral-900 pb-1 mb-2.5">
                <span>🕵️‍♂️ 平行事件 (Parallel Events)</span>
                <span className="text-[8px] bg-stone-900 text-gray-500 border border-neutral-800 px-1 rounded">秘史</span>
              </div>

              {/* Parallel / Classified lists */}
              <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
                {parallels.map((par) => (
                  <div key={par.id} className="bg-neutral-950 p-2.5 rounded border border-red-950/20 text-[10.5px] font-serif space-y-1 leading-normal">
                    <div className="flex justify-between items-center text-[8px] leading-none mb-0.5">
                      <span className="text-rose-450 text-rose-400 font-black">{par.title}</span>
                      <span className="text-rose-350 font-mono scale-90">{par.source}</span>
                    </div>
                    <p className="text-gray-300 text-justify">{par.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Chronicles nested uniquely inside Parallel / Historic column */}
            <div className="pt-2 border-t border-neutral-900 mt-2">
              <span className="text-[9.5px] font-serif text-[#bfa15f] font-black flex items-center gap-1">
                <Footprints className="w-3 h-3 text-[#bfa15f]" /> 历史编年大事记 (太史纪)
              </span>
              <div className="mt-2 max-h-[90px] overflow-y-auto space-y-1.5 text-[10px] font-serif pr-1">
                {chronicles.length === 0 ? (
                  <p className="italic text-gray-650 text-[9px] text-center text-gray-500 py-1">明君临沧海，历史纪本草创于此...</p>
                ) : (
                  chronicles.map((ch, idx) => (
                    <div key={idx} className="border-l border-[#bfa15f]/20 pl-2 space-y-0.5 pb-1 last:pb-0 relative leading-tight">
                      <span className="text-amber-500 font-bold block text-[8.5px]">第 {ch.turn} 节大事备忘：</span>
                      <p className="text-gray-300 bg-neutral-950/60 p-1.5 rounded border border-neutral-900/60">{ch.eventText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="text-[8px] text-[#a09e97]/40 text-center font-serif mt-3 pt-2 border-t border-neutral-900/60 flex justify-between select-none">
        <span>太史大局鉴 九州八荒气象</span>
        <span>史书笔录 承</span>
      </div>
    </div>
  );
}
