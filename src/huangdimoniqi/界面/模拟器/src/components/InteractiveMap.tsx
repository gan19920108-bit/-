import React from "react";
import { MapRegion, Character } from "../types";
import { Compass, MapPin, Eye, Edit3, ZoomIn, ZoomOut, RotateCcw, Shield, Map as MapIcon, ChevronDown, Sparkles } from "lucide-react";

interface InteractiveMapProps {
  currentRegionId: string;
  onTravelToRegion?: (regionId: string, regionName: string, daysCost: number, goldCost: number) => void;
  gold: number;
  char: Character;
  regions: MapRegion[];
  onUpdateRegions: (updatedRegions: MapRegion[]) => void;
}

interface MediumSubNode {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  localActors: string[];
  regionalInfo: string;
}

interface SmallSceneNode {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  sceneItems: string[];
  activeCharacters: string[];
}

export default function InteractiveMap({
  currentRegionId,
  onTravelToRegion,
  gold,
  char,
  regions,
  onUpdateRegions,
}: InteractiveMapProps) {
  const [mapTier, setMapTier] = React.useState<"large" | "medium" | "small">("large");
  
  // Selected locations across tiers
  const [selectedLargeId, setSelectedLargeId] = React.useState<string>(currentRegionId || "capital");
  const [selectedMediumId, setSelectedMediumId] = React.useState<string>("m_office");
  const [selectedSmallId, setSelectedSmallId] = React.useState<string>("s_throne");

  // Zooming & Draggable Panning states
  const [zoom, setZoom] = React.useState<number>(1.0);
  const [panOffset, setPanOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Location details editing states
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editedName, setEditedName] = React.useState<string>("");
  const [editedStatus, setEditedStatus] = React.useState<"太平" | "匪患" | "干旱" | "繁荣" | "戒严">("太平");
  const [editedDescription, setEditedDescription] = React.useState<string>("");

  // Map sub-tabs state for editing / raw JSON control
  const [activeSubTab, setActiveSubTab] = React.useState<"info" | "editor">("info");

  // New location interactive states
  const [addLocId, setAddLocId] = React.useState<string>("");
  const [addLocName, setAddLocName] = React.useState<string>("");
  const [addLocStatus, setAddLocStatus] = React.useState<"太平" | "匪患" | "干旱" | "繁荣" | "戒严">("太平");
  const [addLocDesc, setAddLocDesc] = React.useState<string>("");
  const [addLocX, setAddLocX] = React.useState<number>(50);
  const [addLocY, setAddLocY] = React.useState<number>(50);
  const [addLocDynasty, setAddLocDynasty] = React.useState<string>(char?.dynasty || "大梁朝廷");

  // Raw JSON stream state
  const [rawMapJson, setRawMapJson] = React.useState<string>("");

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fallback defaults if no regions loaded
  const baseLargeRegion = regions.find(r => r.id === selectedLargeId) || regions[0] || {
    id: "capital",
    name: "京畿万年都",
    description: "天子御宇，九五之尊安顿万国邦交重都，驻防京营重兵。",
    status: "繁荣",
    coordinates: { x: 50, y: 35 },
    dynastyAffiliation: "大梁朝廷"
  };

  // Sync edits when Large Node changes
  React.useEffect(() => {
    if (baseLargeRegion) {
      setEditedName(baseLargeRegion.name);
      setEditedStatus(baseLargeRegion.status as any);
      setEditedDescription(baseLargeRegion.description);
    }
    setIsEditing(false);
  }, [selectedLargeId]);

  // Sync raw JSON string on regions change or tab change
  React.useEffect(() => {
    setRawMapJson(JSON.stringify(regions, null, 2));
  }, [regions, activeSubTab]);

  // Nested nodes generators matching the description
  const getMediumSubNodes = (largeId: string): MediumSubNode[] => {
    switch (largeId) {
      case "jiangnan":
        return [
          {
            id: "m_jiang_office",
            name: "两浙转运营茶马使署",
            description: "总揽江南漕运、海关盐税税票的官署，为朝廷开辟饷金之咽喉要脉。",
            coordinates: { x: 40, y: 35 },
            localActors: ["盐商总行首", "两浙转运使"],
            regionalInfo: "管辖江南十四府粮税厘捐，商客熙来攘往"
          },
          {
            id: "m_qinhuai",
            name: "秦淮夜泊坊船",
            description: "繁华盖世的画舫酒楼，流连着豪门士大夫、青楼词客，在此可探听朝野流言。",
            coordinates: { x: 65, y: 65 },
            localActors: ["绝世清倌人", "微服儒侠"],
            regionalInfo: "钟鸣鼎食，歌舞升平，藏风聚气之所"
          }
        ];
      case "borders":
        return [
          {
            id: "m_border_pass",
            name: "蓟辽塞边雄关口",
            description: "御敌九百里的孤城要塞，守御关防大军，外御契丹胡靼奇袭铁骑。",
            coordinates: { x: 45, y: 40 },
            localActors: ["关防标兵卫", "漠北斥候哨"],
            regionalInfo: "朔风烈烈，沙场金鼓，九边军防铁血要冲"
          },
          {
            id: "m_caravan",
            name: "互市番商榷集",
            description: "各族马商、贩茶郎君易货贸易边陲集镇，黑市走私火器在此交易频频。",
            coordinates: { x: 70, y: 55 },
            localActors: ["塞外马贾", "商税务司官"],
            regionalInfo: "榷集黑货多，关卡哨查严厉"
          }
        ];
      default: // "capital"
        return [
          {
            id: "m_office",
            name: "大理寺法度正堂",
            description: "大梁朝堂司惩、决录、死囚昭雪之重惩衙门，亦是暗探对质机密之廷。",
            coordinates: { x: 35, y: 40 },
            localActors: ["大理寺正卿", "待罪死徒书生"],
            regionalInfo: "森严壁垒，铜门重木，判天下公道大理"
          },
          {
            id: "m_guards",
            name: "神策九统军营校场",
            description: "驻防京督的御林亲卫军校场，飞骑百战、挽百担神弓，戍守禁省金銮。",
            coordinates: { x: 60, y: 55 },
            localActors: ["神策中军裨将", "禁城近卫金吾"],
            regionalInfo: "战旗猎猎，羽箭如雨，九五禁防铁卫之核"
          }
        ];
    }
  };

  const mediumNodesList = getMediumSubNodes(selectedLargeId);
  const activeMediumNode = mediumNodesList.find(m => m.id === selectedMediumId) || mediumNodesList[0] || {
    id: "m_office",
    name: "重熙门内府",
    description: "天官办事官曹书院。",
    coordinates: { x: 45, y: 45 },
    localActors: ["大内总管"],
    regionalInfo: "森严幽静"
  };

  const getSmallSceneNodes = (): SmallSceneNode[] => {
    return [
      {
        id: "s_throne",
        name: "金鸾内廷 · 九龙飞陛宝座",
        description: "九五至尊临朝、万邦叩拜的大梁中枢。龙雕漆金，朱底御匾高悬，吞吐六合帝王威严。",
        coordinates: { x: 50, y: 35 },
        sceneItems: ["九龙漆金宝座", "青铜山河鼎", "江山万代金画屏"],
        activeCharacters: ["司礼秉笔太监", "当廷宿卫大将"]
      },
      {
        id: "s_study",
        name: "御书斋 · 沉香朱笔阅榻",
        description: "天子私宅，沉香木雕，文阁书卷绕屏，天听奏笔批阅机要红文的宁谧静堂。",
        coordinates: { x: 30, y: 65 },
        sceneItems: ["九龙端溪紫砚", "《禹贡中国图》玉铺", "大内九幽烛灯"],
        activeCharacters: ["秉笔内阁行走首揆", "御前执事淑仪女史"]
      },
      {
        id: "s_zen",
        name: "养修内禅阁",
        description: "香火袅袅，紫檀大床，龙袍御榻休憩或与亲信老臣密谋要务之极室，安全备至。",
        coordinates: { x: 70, y: 65 },
        sceneItems: ["千年海南紫檀御榻", "龙涎名香熏盆", "冰丝流苏罗帐"],
        activeCharacters: ["贴身秉笔掌印太监", "太医院院判"]
      }
    ];
  };

  const smallNodesList = getSmallSceneNodes();
  const activeSmallNode = smallNodesList.find(s => s.id === selectedSmallId) || smallNodesList[0];

  // Zooming Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(3.0, prev + 0.25));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(0.6, prev - 0.25);
      if (next <= 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };
  const handleZoomReset = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1.0) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const limit = 200 * (zoom - 1);
    setPanOffset({
      x: Math.min(limit, Math.max(-limit, newX)),
      y: Math.min(limit, Math.max(-limit, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Travel calculation
  const calculateDistance = (fromId: string, toId: string) => {
    if (fromId === toId) return { days: 0, gold: 0 };
    const rFrom = regions.find(r => r.id === fromId) || regions[0];
    const rTo = regions.find(r => r.id === toId) || regions[0];
    if (!rFrom || !rTo) return { days: 3, gold: 120 };
    const dx = rTo.coordinates.x - rFrom.coordinates.x;
    const dy = rTo.coordinates.y - rFrom.coordinates.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const days = Math.max(2, Math.round(dist * 0.45));
    const travelGold = Math.max(50, Math.round(dist * 3));
    return { days, gold: travelGold };
  };

  const travelInfo = calculateDistance(currentRegionId, selectedLargeId);

  const handleTravel = () => {
    if (selectedLargeId === currentRegionId) return;
    if (gold < travelInfo.gold) {
      alert(`行营备马库金不足！需要花费 ${travelInfo.gold} 两黄金，当前仅存 ${gold} 两。`);
      return;
    }
    if (onTravelToRegion) {
      onTravelToRegion(selectedLargeId, baseLargeRegion.name, travelInfo.days, travelInfo.gold);
    }
  };

  const handleModifyGeographics = () => {
    if (!editedName.trim()) {
      alert("方邑命名不能修之为空。");
      return;
    }
    const modified = regions.map(r => r.id === baseLargeRegion.id ? {
      ...r,
      name: editedName,
      status: editedStatus,
      description: editedDescription
    } : r);
    onUpdateRegions(modified);
    setIsEditing(false);
    alert(`【山河修志钦印】：地理风民考【${editedName}】重光定鼎！`);
  };

  // Location dropdown items depend on active map tier
  const getDropdownOptions = () => {
    if (mapTier === "large") {
      return regions.map(r => ({ id: r.id, name: `⛩️ | ${r.name} (${r.status})` }));
    } else if (mapTier === "medium") {
      return mediumNodesList.map(m => ({ id: m.id, name: `🏢 | ${m.name}` }));
    } else {
      return smallNodesList.map(s => ({ id: s.id, name: `🛋️ | ${s.name}` }));
    }
  };

  const activeDropdownVal = mapTier === "large" ? selectedLargeId : mapTier === "medium" ? selectedMediumId : selectedSmallId;

  const handleDropdownSelect = (id: string) => {
    if (mapTier === "large") {
      setSelectedLargeId(id);
    } else if (mapTier === "medium") {
      setSelectedMediumId(id);
    } else {
      setSelectedSmallId(id);
    }
  };

  return (
    <div id="new-map-stage-root" className="bg-[#121210] border-2 border-[#bfa15f]/40 rounded-xl p-4 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Visual map background pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[size:25px_25px] bg-[linear-gradient(to_right,rgba(191,161,95,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(191,161,95,0.2)_1px,transparent_1px)]" />

      {/* Title Header bar */}
      <div className="flex justify-between items-center border-b border-[#bfa15f]/15 pb-2 mb-3 z-10 font-serif select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#bfa15f]/10 border border-[#bfa15f]/25">
            <Compass className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#fcfbfa] tracking-widest">
              🗺️ 华夏八荒乾坤古舆图
            </h3>
          </div>
        </div>
        <div className="text-[9.5px] text-[#a09e97] font-bold">
          驻极行在: <span className="text-amber-300 font-black">{(regions.find(r => r.id === currentRegionId) || regions[0])?.name}</span>
        </div>
      </div>

      {/* Requirement 3 Main Layout: Left-Hand Map, Right-Hand Information Panel */}
      <div className="grid grid-cols-12 gap-3.5 flex-1 items-stretch min-h-[360px] md:min-h-[400px]">
        
        {/* Left column: Interactive Map Canvas (Occupying 8 columns) */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="col-span-12 md:col-span-8 bg-[#0b0b0a] border border-[#bfa15f]/20 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 select-none"
        >
          
          {/**********************************************************
           * TOP BAR INSTRUMENTS: SELECT MAP TIER AND LOCATIONS DROPDOWN
           **********************************************************/}
          <div className="absolute top-2.5 left-2.5 z-30 flex flex-wrap gap-1.5 max-w-[85%] font-serif">
            {/* Map Tier Selector Dropdown */}
            <div className="bg-black/95 p-1 rounded-lg border border-[#bfa15f]/40 shadow-xl flex items-center gap-1.5 leading-none shrink-0">
              <span className="text-[8.5px] text-[#e6c787] font-black pl-0.5">舆图天盘:</span>
              <select
                value={mapTier}
                onChange={(e) => setMapTier(e.target.value as any)}
                className="bg-[#121210] border-0 outline-none text-[#fcfbfa] text-[9.5px] font-black py-0.5 px-1 rounded cursor-pointer text-amber-100"
              >
                <option value="large">一级 · 八荒势力古疆舆图</option>
                <option value="medium">二级 · 属地省郡街闾府署</option>
                <option value="small">三级 · 禁省内殿陈设清室</option>
              </select>
            </div>

            {/* Requirement 3: 地点下拉框 (Dynamic Location Selection Dropdown) */}
            <div className="bg-black/95 p-1 rounded-lg border border-[#bfa15f]/40 shadow-xl flex items-center gap-1.5 leading-none shrink-0">
              <span className="text-[8.5px] text-[#e6c787] font-black pl-0.5">点位阅视:</span>
              <select
                value={activeDropdownVal}
                onChange={(e) => handleDropdownSelect(e.target.value)}
                className="bg-[#121210] border-0 outline-none text-white text-[9.5px] font-black py-0.5 px-1 rounded cursor-pointer max-w-[120px] truncate hover:text-amber-200"
              >
                {getDropdownOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/**********************************************************
           * RIGHT TOP INTERACTIVE BUTTONS
           **********************************************************/}
          <div className="absolute top-2.5 right-2.5 z-30 flex gap-1 font-mono shrink-0">
            <button
              onClick={handleZoomIn}
              className="w-5.5 h-5.5 bg-black/95 hover:bg-neutral-850 text-amber-200 border border-[#bfa15f]/30 rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:border-amber-400 active:scale-90"
              title="放大"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-5.5 h-5.5 bg-black/95 hover:bg-neutral-850 text-amber-200 border border-[#bfa15f]/30 rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:border-amber-400 active:scale-90"
              title="缩小"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={handleZoomReset}
              className="w-5.5 h-5.5 bg-black/95 hover:bg-neutral-850 text-amber-200 border border-[#bfa15f]/30 rounded flex items-center justify-center text-[7px] font-black cursor-pointer hover:border-amber-400 active:scale-90"
              title="复原"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Draggable Layer stage */}
          <div className="relative w-full h-full bg-[#050504] border border-neutral-900 rounded-lg overflow-hidden flex-grow flex flex-col justify-center items-center mt-9">
            
            <div
              className="absolute inset-0 w-full h-full origin-center transition-transform duration-75"
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`
              }}
            >
              {/***************************************
               * TIER 1: LARGE ANCIENT CHINA AND PERIPHERIES
               ***************************************/}
              {mapTier === "large" && (
                <>
                  <div className="absolute left-6 top-8 font-serif text-[7.5px] text-amber-500/10 uppercase tracking-widest select-none">【漠北胡虏汗庭】</div>
                  <div className="absolute left-4 bottom-8 font-serif text-[7.5px] text-amber-500/10 uppercase tracking-widest select-none">【吐蕃旷远高川】</div>
                  <div className="absolute right-6 bottom-6 font-serif text-[7.5px] text-sky-500/10 uppercase tracking-widest select-none">【万里太溟苍波】</div>

                  {/* Draw connection line to current location if selected different one */}
                  {selectedLargeId !== currentRegionId && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      <line
                        x1={`${(regions.find(r => r.id === currentRegionId) || regions[0])?.coordinates.x}%`}
                        y1={`${(regions.find(r => r.id === currentRegionId) || regions[0])?.coordinates.y}%`}
                        x2={`${baseLargeRegion.coordinates.x}%`}
                        y2={`${baseLargeRegion.coordinates.y}%`}
                        className="stroke-[#c2410c] stroke-2 opacity-40"
                        strokeDasharray="4 3"
                      />
                    </svg>
                  )}

                  {regions.map((region) => {
                    const isCurrent = region.id === currentRegionId;
                    const isSelected = region.id === selectedLargeId;
                    return (
                      <button
                        key={region.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLargeId(region.id);
                        }}
                        className="absolute group -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none transition z-10"
                        style={{ left: `${region.coordinates.x}%`, top: `${region.coordinates.y}%` }}
                      >
                        <div className="relative flex flex-col items-center">
                          {isCurrent && <div className="absolute -inset-3.5 rounded-full bg-amber-500/15 animate-ping border border-amber-400/30" />}
                          {isSelected && <div className="absolute -inset-3 rounded-full bg-[#8c2c16]/30 border-2 border-amber-400/50" />}

                          <div className={`w-7-5 h-7-5 rounded-full border shadow-lg flex items-center justify-center font-serif text-sm transition duration-200 ${
                            isCurrent
                              ? "bg-[#8c2c16] border-[#e6c787] text-white scale-110 font-bold"
                              : isSelected
                              ? "bg-amber-600 border-amber-200 text-white"
                              : "bg-black border-[#bfa15f]/25 text-amber-200/80 group-hover:bg-amber-950/40 group-hover:border-amber-400"
                          }`}>
                            ⛩️
                          </div>
                          
                          <span className="mt-1 px-1 py-0.5 rounded text-[8.5px] bg-[#121110]/95 border border-[#bfa15f]/20 text-white font-serif font-black tracking-wide whitespace-nowrap">
                            {region.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {/***************************************
               * TIER 2: CITY INTERNAL DISTRICT LAYOUT
               ***************************************/}
              {mapTier === "medium" && (
                <>
                  <div className="absolute top-2 w-full text-center font-serif text-[8px] text-[#e6c787]/55 select-none">
                    🧭 【{baseLargeRegion.name}】省郡县 · 坊郭街闾布局
                  </div>

                  {mediumNodesList.map((mNode) => {
                    const isSelected = mNode.id === selectedMediumId;
                    return (
                      <button
                        key={mNode.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMediumId(mNode.id);
                        }}
                        className="absolute group -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none transition z-10"
                        style={{ left: `${mNode.coordinates.x}%`, top: `${mNode.coordinates.y}%` }}
                      >
                        <div className="relative flex flex-col items-center">
                          {isSelected && <div className="absolute -inset-2.5 rounded-full bg-cyan-500/20 animate-pulse border border-cyan-400/40" />}

                          <div className={`w-7 h-7 rounded-lg border shadow-md flex items-center justify-center text-xs transition duration-200 ${
                            isSelected
                              ? "bg-cyan-950 border-cyan-400 text-cyan-200 scale-105"
                              : "bg-black border-[#bfa15f]/20 text-[#a09e97]"
                          }`}>
                            🏢
                          </div>

                          <span className="mt-1 px-1 py-0.5 rounded text-[8px] bg-black/90 border border-[#bfa15f]/15 text-gray-200 font-serif font-black whitespace-nowrap">
                            {mNode.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {/***************************************
               * TIER 3: SCENE INTERNAL INTERIOR
               ***************************************/}
              {mapTier === "small" && (
                <>
                  <div className="absolute top-2 w-full text-center font-serif text-[8px] text-[#e6c787]/55 select-none font-bold">
                    🕯️ 禁宫御苑 · 精细陈设居阁
                  </div>

                  {smallNodesList.map((sNode) => {
                    const isSelected = sNode.id === selectedSmallId;
                    return (
                      <button
                        key={sNode.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSmallId(sNode.id);
                        }}
                        className="absolute group -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none transition z-10"
                        style={{ left: `${sNode.coordinates.x}%`, top: `${sNode.coordinates.y}%` }}
                      >
                        <div className="relative flex flex-col items-center">
                          {isSelected && <div className="absolute -inset-2.5 rounded-full bg-indigo-500/20 border border-indigo-400/40" />}

                          <div className={`w-7 h-7 rounded-full border-2 shadow-md flex items-center justify-center text-xs transition duration-200 ${
                            isSelected
                              ? "bg-indigo-950 border-indigo-400 text-indigo-400 scale-105"
                              : "bg-black border-[#bfa15f]/20 text-indigo-200"
                          }`}>
                            🛋️
                          </div>

                          <span className="mt-1 px-1 py-0.5 rounded text-[8px] bg-black/90 border border-indigo-800/20 text-[#fcfbfa] font-serif font-black whitespace-nowrap">
                            {sNode.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

            </div>
            
            {/* Small Legend label */}
            <div className="absolute left-2.5 bottom-2.5 text-[8px] text-[#a09e97] bg-black/75 px-1.5 py-0.5 rounded border border-[#bfa15f]/15 z-10 cursor-default pointer-events-none uppercase font-semibold">
              {mapTier === "large" ? "🏛️ 一级：山河图" : mapTier === "medium" ? "🏢 二级：郡邑坊" : "🕯️ 三级：华殿轩"}
            </div>

          </div>

        </div>

        {/* Right column: Details and Info Panel (Occupying 4 columns) */}
        <div id="map-right-details-panel" className="col-span-12 md:col-span-4 bg-black/40 border border-[#bfa15f]/25 rounded-xl p-3.5 flex flex-col justify-between max-h-[480px] overflow-y-auto">
          
          <div className="space-y-4 font-serif">
            {/* Top tabs switcher for Map details vs editing */}
            <div className="flex bg-black/80 border border-[#bfa15f]/30 rounded p-1 text-[10px] w-full font-serif select-none">
              <button
                type="button"
                onClick={() => { setActiveSubTab("info"); setIsEditing(false); }}
                className={`flex-1 py-1 rounded text-center cursor-pointer transition text-[9px] ${activeSubTab === "info" ? "bg-[#8c2c16] text-white font-bold" : "text-gray-400 hover:text-gray-200"}`}
              >
                ℹ️ 点位看析 (Info)
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("editor")}
                className={`flex-1 py-1 rounded text-center cursor-pointer transition text-[9px] ${activeSubTab === "editor" ? "bg-[#8c2c16] text-white font-bold" : "text-gray-400 hover:text-gray-200"}`}
              >
                🛠️ 舆图编纂 (Editor)
              </button>
            </div>

            {activeSubTab === "info" ? (
              isEditing ? (
                /* Administrative edit form */
                <div className="space-y-3">
                  <span className="text-[9.5px] text-[#e6c787] block uppercase border-b border-white/5 pb-1 font-bold">✎ 修缮山河地志簿</span>
                  
                  <div className="space-y-1">
                    <label className="text-[8.5px] text-gray-400 block font-bold">行政名称/城防名称:</label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/20 rounded p-1.5 text-[10.5px] text-[#fcfbfa] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] text-gray-400 block font-bold">地方安危状态:</label>
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value as any)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/20 rounded p-1.5 text-[10.5px] text-amber-200 outline-none cursor-pointer"
                    >
                      <option value="太平">太平 (治安平靖)</option>
                      <option value="繁荣">繁荣 (商贸兴顺)</option>
                      <option value="戒严">戒严 (宿卫森严)</option>
                      <option value="匪患">匪患 (盗匪啸聚)</option>
                      <option value="干旱">干旱 (岁饥粮歉)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] text-gray-400 block font-bold">地方舆情风俗记说:</label>
                    <textarea
                      rows={4}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/20 rounded p-1.5 text-[10px] text-gray-300 outline-none resize-none leading-relaxed text-justify"
                    />
                  </div>

                  <div className="flex gap-1.5 font-bold pt-1 text-[9.5px]">
                    <button
                      onClick={handleModifyGeographics}
                      className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded cursor-pointer text-center border border-emerald-600/30 font-black"
                    >
                      钦定钤印
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-750 text-gray-400 rounded cursor-pointer hover:text-white"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                /* Informational display cards showing Location current situation (当前情况) */
                <div className="space-y-3.5">
                  
                  {/* TIER 1 displays */}
                  {mapTier === "large" && (
                    <div className="space-y-3">
                      <div className="bg-[#121110] border-2 border-[#bfa15f]/20 p-2.5 rounded text-center">
                        <h4 className="text-[#fcfbfa] text-xs font-black tracking-widest">{baseLargeRegion.name}</h4>
                        <span className="text-[8.5px] bg-[#8c2c16]/30 text-orange-200 border border-[#8c2c16]/50 px-2.5 py-0.5 rounded block mt-1.5 font-serif mx-auto w-fit leading-none">
                          当前局势：{baseLargeRegion.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 bg-black/60 p-2.5 border border-[#bfa15f]/15 rounded text-[10px] space-y-1">
                        <span className="text-[8.5px] text-[#e6c787] font-black block border-b border-white/5 pb-0.5 uppercase tracking-wider">🗺️ 华夏郡邑当前情况:</span>
                        <div className="flex justify-between">
                          <span className="text-gray-400">社稷定位:</span>
                          <span className="text-stone-300 font-mono">X: {baseLargeRegion.coordinates.x}%, Y: {baseLargeRegion.coordinates.y}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">归属版图:</span>
                          <span className="text-[#e6c787] font-bold">{baseLargeRegion.dynastyAffiliation || "大梁 (中原朝廷)"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">行营预算:</span>
                          <span className="text-amber-300">⌛ {travelInfo.days} 天余 | 🪙 {travelInfo.gold} 两</span>
                        </div>
                      </div>

                      {/* Detailed Location Situation Display (Requirement 4) */}
                      <div className="bg-[#1a1511] border border-[#bfa15f]/30 p-2.5 rounded-xl space-y-1.5 font-serif select-none">
                        <span className="text-[8.5px] text-[#e6c787] font-extrabold uppercase block border-b border-[#bfa15f]/15 pb-1 flex items-center gap-1">
                          📊 行政地缘当前情况报告 (Civic Situation)
                        </span>
                        
                        <div className="space-y-1 text-[9.5px]">
                          {baseLargeRegion.status === "太平" && (
                            <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/40 text-justify leading-relaxed">
                              <b>🌾 【清平治安】：</b> 地方官佐清廉，万民安居，商贾交错而无犬吠之惊。各里弄夜不闭户，秋毫无犯。
                            </div>
                          )}
                          {baseLargeRegion.status === "繁荣" && (
                            <div className="text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-900/40 text-justify leading-relaxed">
                              <b>🪙 【商贾大兴】：</b> 大贾巨商辐辏，四塞之货汇聚，税课金盈仓溢。茶楼酒肆昼夜不熄，万家灯火。
                            </div>
                          )}
                          {baseLargeRegion.status === "戒严" && (
                            <div className="text-indigo-300 bg-indigo-950/20 p-2 rounded border border-indigo-900/40 text-justify leading-relaxed">
                              <b>⚔️ 【卫戍戒严】：</b> 府兵甲胄林立，巡逻铁骑交颈。关隘设拒马审查甚苛，群邪敛迹，肃杀威严。
                            </div>
                          )}
                          {baseLargeRegion.status === "匪患" && (
                            <div className="text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/40 text-justify leading-relaxed">
                              <b>☠️ 【响马横行】：</b> 盗匪呼啸山泽，劫掠官塘。流民失所，城堞闭锁，商旅侧目不敢裹足前跨。
                            </div>
                          )}
                          {baseLargeRegion.status === "干旱" && (
                            <div className="text-orange-300 bg-orange-950/20 p-2 rounded border border-orange-900/40 text-justify leading-relaxed">
                              <b>🏜️ 【赤地岁饥】：</b> 骄阳似火，禾稼枯焦。渠枯井涸，库无余粟。流丐塞道，民情躁郁，急需圣笔赈济。
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-amber-500/70 block tracking-wider uppercase">✦ 九州风物舆情 map trajectory</span>
                        <p className="text-[10.5px] text-gray-200 leading-relaxed text-justify bg-neutral-950/70 py-2.5 px-3 rounded border border-neutral-900">
                          {baseLargeRegion.description}
                        </p>
                      </div>

                      {/* Travel functionality */}
                      {selectedLargeId !== currentRegionId ? (
                        <button
                          onClick={handleTravel}
                          className="w-full py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-white text-[10px] font-black rounded border border-[#bfa15f]/30 cursor-pointer flex items-center justify-center gap-1 shadow-lg transition active:scale-95"
                        >
                          🏰 传旨 · 御驾巡游前往其地
                        </button>
                      ) : (
                        <div className="bg-[#111110]/80 border border-neutral-900 border-dashed text-center py-2.5 text-[9px] text-gray-500 uppercase rounded">
                          ✨ 行在圣指已驾临此郡行宫 ✨
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setEditedName(baseLargeRegion.name);
                          setEditedStatus(baseLargeRegion.status as any);
                          setEditedDescription(baseLargeRegion.description);
                          setIsEditing(true);
                        }}
                        className="w-full py-1.5 bg-black hover:bg-neutral-900 border border-[#bfa15f]/20 text-[9px] text-amber-300 rounded cursor-pointer text-center font-bold"
                      >
                        ✎ 亲政修纂地方舆图记载
                      </button>
                    </div>
                  )}

                  {/* TIER 2 displays */}
                  {mapTier === "medium" && (
                    <div className="space-y-3">
                      <div className="bg-[#121110] border border-cyan-800/25 p-2 rounded text-center">
                        <h4 className="text-cyan-300 text-xs font-black">{activeMediumNode.name}</h4>
                        <span className="text-[8px] text-gray-400 mt-1 block">
                          二级城市坊郭 · 本省：{baseLargeRegion.name}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-cyan-400 block tracking-wider uppercase">✦ 省理大理及周边考记:</span>
                        <p className="text-[10px] text-gray-200 leading-relaxed bg-[#0a0a09] p-2.5 rounded border border-neutral-900 text-justify">
                          {activeMediumNode.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-cyan-450 text-cyan-400 block tracking-wider uppercase">🎯 本省群生英烈:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeMediumNode.localActors.map((actor, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-neutral-950 text-[#fcfbfa] border border-[#bfa15f]/15 text-[8px] font-bold rounded">
                              {actor}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[8.5px] text-[#e6c787]/70 italic bg-neutral-950/65 p-2 rounded border border-neutral-900 text-justify">
                        📌 考纪录: {activeMediumNode.regionalInfo}
                      </div>

                      <button
                        onClick={() => {
                          const newDesc = prompt("修改二级地点描述：", activeMediumNode.description);
                          if (newDesc !== null) {
                            activeMediumNode.description = newDesc;
                            // Trigger render
                            onUpdateRegions([...regions]);
                            alert(`二级点位【${activeMediumNode.name}】描述已修改！`);
                          }
                        }}
                        className="w-full py-1 bg-black hover:bg-neutral-900 border border-neutral-850 text-[8.5px] text-gray-450 text-gray-400 hover:text-white rounded transition cursor-pointer"
                      >
                        ✏️ 修改二级点位备忘
                      </button>
                    </div>
                  )}

                  {/* TIER 3 displays */}
                  {mapTier === "small" && (
                    <div className="space-y-3">
                      <div className="bg-indigo-950/15 border border-indigo-900/40 p-2 rounded text-center">
                        <h4 className="text-indigo-300 text-xs font-black">{activeSmallNode.name}</h4>
                        <span className="text-[8px] text-gray-400 block mt-1">三级禁苑居阁精细陈设</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-indigo-400 block tracking-wider uppercase">✦ 场景防御及安全简况:</span>
                        <p className="text-[10px] text-gray-200 leading-relaxed bg-[#0a0a0a] p-2.5 rounded border border-neutral-900 text-justify">
                          {activeSmallNode.description}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-indigo-450 text-[#bfa15f]/80 block tracking-wider uppercase">🏺 御玺及重宝物件:</span>
                        <div className="space-y-1 bg-[#050510]/30 p-2.5 border border-neutral-900 rounded text-[9px] text-[#e6c787]">
                          {activeSmallNode.sceneItems.map((item, idx) => (
                            <div key={idx} className="flex gap-1 items-center leading-none">
                              <span className="text-[8px] font-mono text-amber-500">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-indigo-455 text-indigo-400 block font-black">👥 内殿在此在值人物:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeSmallNode.activeCharacters.map((ac, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-indigo-950/25 text-[#fcfbfa] border border-indigo-500/15 text-[8px] rounded">
                              {ac}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const newName = prompt("重新赐名这起陈设宝贝 (用逗号隔开)：", activeSmallNode.sceneItems.join(", "));
                          if (newName !== null) {
                            activeSmallNode.sceneItems = newName.split(/[，,]/).map(x => x.trim()).filter(Boolean);
                            onUpdateRegions([...regions]);
                            alert(`御宝陈设已重新登记！`);
                          }
                        }}
                        className="w-full py-1 bg-black hover:bg-neutral-900 border border-neutral-850 text-[8.5px] text-gray-400 hover:text-white rounded transition cursor-pointer"
                      >
                        ✏️ 重新整顿殿中重宝陈设
                      </button>
                    </div>
                  )}

                </div>
              )
            ) : (
              /* ACTIVE MOOD TAB: EDITOR PANEL (Requirement 4 & 5 EDIT/ADD/DELETE/JSON-IMPORT-EXPORT) */
              <div className="space-y-4 animate-fade-in text-[10.5px]">
                
                {/* 1. Add Location Layout */}
                <div className="bg-black/40 border border-[#bfa15f]/20 rounded p-2.5 space-y-2.5">
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 leading-none">
                    🎯 敕封开拓新郡邑 (Add Location)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <label className="text-[8px] text-gray-400 block">点位唯一 ID:</label>
                      <input
                        type="text"
                        placeholder="e.g. sichuan"
                        value={addLocId}
                        onChange={(e) => setAddLocId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-1 text-[9px] text-white outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] text-gray-400 block">敕置郡地名称:</label>
                      <input
                        type="text"
                        placeholder="e.g. 蜀中剑门关"
                        value={addLocName}
                        onChange={(e) => setAddLocName(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-1 text-[9px] text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-0.5">
                      <label className="text-[8px] text-gray-400 block">割据隶属势力:</label>
                      <input
                        type="text"
                        value={addLocDynasty}
                        onChange={(e) => setAddLocDynasty(e.target.value)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-1 text-[9px] text-amber-200 outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] text-gray-400 block">常置局势状态:</label>
                      <select
                        value={addLocStatus}
                        onChange={(e) => setAddLocStatus(e.target.value as any)}
                        className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded px-1.5 py-1 text-[9px] text-amber-300 outline-none cursor-pointer"
                      >
                        <option value="太平">太平 (安居乐业)</option>
                        <option value="繁荣">繁荣 (商贸兴顺)</option>
                        <option value="戒严">戒严 (宿卫森严)</option>
                        <option value="匪患">匪患 (群蛮啸聚)</option>
                        <option value="干旱">干旱 (旱涝赤地)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1.5 rounded border border-neutral-900 border-dashed text-[8px] text-stone-400">
                    <div className="space-y-1">
                      <span>横 X 坐标点 ({addLocX}%):</span>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={addLocX}
                        onChange={(e) => setAddLocX(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-900 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>纵 Y 坐标点 ({addLocY}%):</span>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={addLocY}
                        onChange={(e) => setAddLocY(Number(e.target.value))}
                        className="w-full h-1 bg-neutral-900 rounded appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[8px] text-gray-400 block">地方风情舆学记要 (点位详情):</label>
                    <textarea
                      rows={2}
                      placeholder="编写此地的民生状况、重兵防守..."
                      value={addLocDesc}
                      onChange={(e) => setAddLocDesc(e.target.value)}
                      className="w-full bg-[#121210] border border-[#bfa15f]/30 rounded p-1 text-[9.5px] text-gray-300 outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!addLocId || !addLocName || !addLocDesc) {
                        alert("请将开拓新邦的 ID 序号、增设地名、风物描述填写完整！");
                        return;
                      }
                      if (regions.some(r => r.id === addLocId)) {
                        alert(`主键 [${addLocId}] 已经入册，请另赐主键名称！`);
                        return;
                      }
                      const newLoc: MapRegion = {
                        id: addLocId,
                        name: addLocName,
                        status: addLocStatus,
                        coordinates: { x: addLocX, y: addLocY },
                        description: addLocDesc,
                        dynastyAffiliation: addLocDynasty
                      };
                      onUpdateRegions([...regions, newLoc]);
                      setSelectedLargeId(addLocId);
                      setActiveSubTab("info");
                      // Reset values
                      setAddLocId("");
                      setAddLocName("");
                      setAddLocDesc("");
                      alert(`【太初诏制】：您成功开疆拓土新城【${addLocName}】并钤盖御印！`);
                    }}
                    className="w-full py-1.5 bg-[#8c2c16] hover:bg-[#a63c24] text-white hover:text-amber-100 rounded text-[9.5px] font-black cursor-pointer border border-[#bfa15f]/40 text-center transition"
                  >
                    🏛️ 钦此 · 宣谕开拓山河版图
                  </button>
                </div>

                {/* 2. Map JSON Import & Export */}
                <div className="bg-black/40 border border-[#bfa15f]/20 rounded p-2.5 space-y-2.5">
                  <span className="text-[10px] text-amber-300 font-extrabold flex items-center gap-1 leading-none">
                    📥 疆域图地理 JSON 导入与导出 (Import & Export)
                  </span>
                  <p className="text-[8px] text-gray-400 leading-normal mb-1">
                    在此可一键克隆或回载整个地图的点位。数据格式为 `MapRegion[]` 数组。
                  </p>
                  <textarea
                    rows={4}
                    value={rawMapJson}
                    onChange={(e) => setRawMapJson(e.target.value)}
                    placeholder="可粘入包含地名与坐标的 MapRegion[] 数组..."
                    className="w-full bg-black border border-neutral-900 text-[8px] p-2 rounded text-stone-300 font-mono resize-none leading-relaxed"
                  />
                  
                  <div className="grid grid-cols-3 gap-1 shadow">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(rawMapJson);
                          if (!Array.isArray(parsed)) throw new Error("JSON 格式必须是一个包含各方郡县的数组结构！");
                          for (const r of parsed) {
                            if (!r.id || !r.name || !r.coordinates) {
                              throw new Error(`缺少点位必须元素！[${r.name || "无名地"}] 格式须含有 id, name, coordinates{x,y} 属性。`);
                            }
                          }
                          onUpdateRegions(parsed);
                          alert("🔮 大乾九鼎舆图完美归藏！疆版成功重划！");
                          if (parsed.length > 0) setSelectedLargeId(parsed[0].id);
                          setActiveSubTab("info");
                        } catch (err: any) {
                          alert(`导入失败。舆官勘验出错误信息：${err.message || err}`);
                        }
                      }}
                      className="py-1 bg-amber-900 hover:bg-amber-800 text-stone-100 font-bold rounded text-[8.5px] cursor-pointer text-center"
                    >
                      📂 确定导入
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(rawMapJson);
                        alert("📋 成功复制大舆图 JSON 坐标配置到剪贴板！");
                      }}
                      className="py-1 bg-[#121210] hover:bg-neutral-950 text-stone-300 rounded text-[9px] border border-[#bfa15f]/20 cursor-pointer text-center"
                    >
                      📋 复制配置
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("是否重置当前输入框中的 JSON 文本为系统最新数据？")) {
                          setRawMapJson(JSON.stringify(regions, null, 2));
                        }
                      }}
                      className="py-1 bg-amber-955/20 hover:bg-amber-955/40 text-amber-200/80 border border-neutral-800 rounded text-[8.5px] cursor-pointer text-center"
                    >
                      🔄 还原文本
                    </button>
                  </div>
                </div>

                {regions.length > 1 && (
                  <div className="bg-black/40 border border-red-900/35 rounded p-2.5 space-y-2">
                    <span className="text-[10px] text-red-400 font-extrabold flex items-center gap-1 leading-none">
                      ⚠️ 废撤削封荒废郡邑 (Danger Zone)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`确定彻底从山河版图上废除并除名「${baseLargeRegion.name}」地方城邑吗？此举不可逆！`)) {
                          const remainingRegions = regions.filter(r => r.id !== baseLargeRegion.id);
                          onUpdateRegions(remainingRegions);
                          setSelectedLargeId(remainingRegions[0].id);
                          setActiveSubTab("info");
                          alert(`【废城朱诏】：您下旨在古舆图中废除了「${baseLargeRegion.name}」的所有疆界。`);
                        }
                      }}
                      className="w-full py-1 bg-red-950/80 hover:bg-red-900 border border-red-800/40 text-red-200 text-[9px] rounded font-black cursor-pointer text-center active:scale-95 transition"
                    >
                      🗑️ 废除裁撤当前郡治：{baseLargeRegion.name}
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          <div className="text-[7.5px] text-[#a09e97]/30 text-center font-sans mt-3 border-t border-neutral-900/50 pt-1.5 block select-none uppercase tracking-wide">
            大梁乾清政舆 舆地司勘纂
          </div>
        </div>

      </div>

    </div>
  );
}
