import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Suspense, lazy } from "react";
import gameStyles from "~/styles/game.css?url";
import { generateImageTokens } from "~/utils/imageToken.server";

// Import the client component using lazy loading for better bundle splitting
const GamePageClient = lazy(() => import("~/components/game/GamePageClient.client"));

// Import utils for platform validation and pagination logic
import { 
  getValidPlatformId, 
  paginateGames 
} from "~/lib/utils/gameUtils";

// --- Data (moved from Vue component) ---
const userStats = [
  { label: '游戏总数', value: '156' },
  { label: '完成度', value: '78%' },
  { label: '游戏时长', value: '1150h' },
  { label: '成就解锁', value: '1,204' }
];

const platforms = [
  {
    id: 'playstation',
    name: 'PlayStation',
    gradient: 'from-blue-600 to-blue-800',
    score: '219',
    motto: '努力取得更多奖杯吧',
    stats: [
      { label: '白金', value: '12' },
      { label: '黄金', value: '36' },
      { label: '白银', value: '172' },
      { label: '黄铜', value: '784' }
    ]
  },
  {
    id: 'switch',
    name: 'Switch',
    gradient: 'from-red-600 to-red-800',
    score: '156',
    motto: '享受便携游戏的乐趣',
    stats: [
      { label: '完成游戏', value: '2' },
      { label: '拥有游戏', value: '2' },
      { label: '游戏时长', value: '10h' },
      { label: '收藏', value: '12' }
    ]
  },
  {
    id: 'pc',
    name: 'PC',
    gradient: 'from-green-600 to-green-800',
    score: '342',
    motto: 'PC Master Race',
    stats: [
      { label: 'Steam游戏', value: '0' },
      { label: 'Epic游戏', value: '3' },
      { label: '总成就', value: '0' },
    ]
  }
];

const playstationGames = [
  { id: 1, name: '破晓传奇', playTime: '57h', progress: Math.round(22 / 59 * 100), trophies: { platinum: 1, gold: 2, silver: 19, bronze: 0 }, achievementsCurrent: 22, achievementsTotal: 59, rating: 9, review: '我也不知道我为啥玩儿了五十个小时', tags: ['JRPG', '剧情', '动画'], cover: 'game/pox.jpg' },
  { id: 2, name: '剑星', playTime: '51h', progress: Math.round(28 / 45 * 100), trophies: { platinum: 1, gold: 6, silver: 21, bronze: 0 }, achievementsCurrent: 28, achievementsTotal: 45, rating: 9, review: '还是代餐', tags: ['动作', 'RPG', '科幻'], cover: 'game/header_tchinese.jpg' },
  { id: 3, name: '碧蓝幻想 Relink', playTime: '48h', progress: Math.round(37 / 54 * 100), trophies: { platinum: 0, gold: 2, silver: 35, bronze: 0 }, achievementsCurrent: 37, achievementsTotal: 54, rating: 8, review: '二次元战斗游戏天花板', tags: ['联机', 'ARPG', '奇幻'], cover: 'game/bl.jpg' },
  { id: 4, name: '心灵杀手2', playTime: '45h', progress: Math.round(81 / 89 * 100), trophies: { platinum: 0, gold: 3, silver: 77, bronze: 1 }, achievementsCurrent: 81, achievementsTotal: 89, rating: 9, review: '音乐和创意剧情拉满画质也写实', tags: ['恐怖', '悬疑', '剧情'], cover: 'game/hertkinll.jpg' },
  { id: 5, name: '最终幻想16', playTime: '45h', progress: Math.round(29 / 69 * 100), trophies: { platinum: 1, gold: 2, silver: 26, bronze: 0 }, achievementsCurrent: 29, achievementsTotal: 69, rating: 9, review: 'boss战大型交响乐现场', tags: ['JRPG', '奇幻', '史诗'], cover: '/game/zz.jpg' },
  { id: 6, name: '伊苏8：达娜的安魂曲', playTime: '43h', progress: Math.round(28 / 55 * 100), trophies: { platinum: 0, gold: 3, silver: 25, bronze: 0 }, achievementsCurrent: 28, achievementsTotal: 55, rating: 9, review: 'jrpg我只玩伊苏系列本作剧情很棒', tags: ['ARPG', '冒险', '音乐'], cover: 'game/ys.jpg' },
  { id: 7, name: '漫威蜘蛛侠2', playTime: '35h', progress: Math.round(42 / 43 * 100), trophies: { platinum: 2, gold: 17, silver: 22, bronze: 1 }, achievementsCurrent: 42, achievementsTotal: 43, rating: 9, review: '剧情战斗爽中爽', tags: ['动作', '开放世界', '超级英雄'], cover: 'game/sp.jpg' },
  { id: 8, name: '最后生还者2', playTime: '34h', progress: Math.round(19 / 44 * 100), trophies: { platinum: 1, gold: 7, silver: 11, bronze: 0 }, achievementsCurrent: 19, achievementsTotal: 44, rating: 10, review: '说不好玩的都是云狗', tags: ['生存', '剧情', '末世'], cover: 'game/lost.jpg' },
  { id: 9, name: '艾尔登法环', playTime: '100h', progress: Math.round(42 / 42 * 100), trophies: { platinum: 3, gold: 14, silver: 24, bronze: 0 }, achievementsCurrent: 42, achievementsTotal: 42, rating: 10, review: '真正的史诗', tags: ['魂系', '开放世界', '动作'], cover: 'game/ring.jpg' },
  { id: 10, name: '地平线 西之绝境', playTime: '91h', progress: Math.round(72 / 80 * 100), trophies: { platinum: 2, gold: 9, silver: 60, bronze: 0 }, achievementsCurrent: 72, achievementsTotal: 80, rating: 9, review: '当今3a游戏画质第一', tags: ['开放世界', '动作', '冒险'], cover: 'game/forb.jpg' },
  { id: 11, name: '战神：诸神黄昏', playTime: '69h', progress: Math.round(36 / 48 * 100), trophies: { platinum: 4, gold: 15, silver: 16, bronze: 0 }, achievementsCurrent: 36, achievementsTotal: 48, rating: 10, review: '买ps5的玩的第一个游戏', tags: ['动作', '剧情', '冒险'], cover: 'game/hear.jpg' },
  { id: 12, name: '对马岛之魂：导演剪辑版', playTime: '65h', progress: Math.round(60 / 77 * 100), trophies: { platinum: 2, gold: 10, silver: 47, bronze: 0 }, achievementsCurrent: 60, achievementsTotal: 77, rating: 10, review: '美术意境堪称巅峰造极', tags: ['武士', '开放世界', '动作'], cover: 'game/ghost.jpg' },
  { id: 13, name: '地平线 零之曙光', playTime: '61h', progress: Math.round(71 / 79 * 100), trophies: { platinum: 2, gold: 10, silver: 58, bronze: 0 }, achievementsCurrent: 71, achievementsTotal: 79, rating: 9, review: '比原神画质强', tags: ['开放世界', '动作', '冒险'], cover: 'game/header.jpg' },
  { id: 14, name: '浪人崛起', playTime: '59h', progress: Math.round(51 / 51 * 100), trophies: { platinum: 2, gold: 9, silver: 39, bronze: 0 }, achievementsCurrent: 51, achievementsTotal: 51, rating: 9, review: '战斗爽战斗爽', tags: ['动作', '冒险', '历史'], cover: 'game/header_schinese.jpg' },
  { id: 15, name: '卧龙：苍天陨落', playTime: '29.9h', progress: 64, trophies: { platinum: 0, gold: 2, silver: 10, bronze: 38 }, achievementsCurrent: 32, achievementsTotal: 50, rating: 8, review: '有中文配音', tags: ['魂系', '动作', '三国'], cover: 'game/drong.jpg' },
  { id: 16, name: 'SEKIRO: SHADOWS DIE TWICE', playTime: '28.5h', progress: 100, trophies: { platinum: 1, gold: 4, silver: 11, bronze: 18 }, achievementsCurrent: 34, achievementsTotal: 34, rating: 10, review: '心中的义父已经无伤了', tags: ['魂系', '忍者', '动作'], cover: 'game/sekiro.jpg' },
  { id: 17, name: '刺客信条：影', playTime: '25.6h', progress: 30, trophies: { platinum: 0, gold: 2, silver: 17, bronze: 0 }, achievementsCurrent: 15, achievementsTotal: 50, rating: 8, review: '上当了浪费二十个小时', tags: ['潜行', '历史', '忍者'], cover: 'game/cike.jpg' },
  { id: 18, name: '宇宙机器人', playTime: '25.3h', progress: 100, trophies: { platinum: 1, gold: 2, silver: 17, bronze: 24 }, achievementsCurrent: 44, achievementsTotal: 44, rating: 9, review: '神中神2024tga冠军实至名归感觉比马里奥奥德赛好玩', tags: ['平台', '冒险', '可爱'], cover: 'game/robot.jpg' },
  { id: 19, name: '神秘海域：盗贼传奇合辑', playTime: '24.5h', progress: 19, trophies: { platinum: 0, gold: 2, silver: 23, bronze: 0 }, achievementsCurrent: 12, achievementsTotal: 63, rating: 9, review: '无敌了游戏还能这么做吗', tags: ['冒险', '动作', '剧情'], cover: 'game/thief.jpg' },
  { id: 20, name: '最后生还者1', playTime: '22.2h', progress: 28, trophies: { platinum: 0, gold: 2, silver: 8, bronze: 0 }, achievementsCurrent: 8, achievementsTotal: 29, rating: 10, review: '神，不用多说', tags: ['生存', '剧情', '末世'], cover: 'game/amz.jpg' },
  { id: 21, name: '瑞奇与叮当：时空跳转', playTime: '20.9h', progress: 100, trophies: { platinum: 1, gold: 3, silver: 7, bronze: 36 }, achievementsCurrent: 47, achievementsTotal: 47, rating: 9, review: 'PS5性能的完美体现', tags: ['平台', '冒险', '科幻'], cover: 'game/ruiqi.jpg' },
  { id: 22, name: '漫威蜘蛛侠：迈尔斯·莫拉莱斯', playTime: '17.2h', progress: 73, trophies: { platinum: 0, gold: 1, silver: 7, bronze: 31 }, achievementsCurrent: 28, achievementsTotal: 39, rating: 9, review: '代餐，不能当正餐吃', tags: ['动作', '开放世界', '超级英雄'], cover: 'game/sppppdr.jpg' }
];

const switchGames = [
  { id: 51, name: '塞尔达传说：王国之泪', playTime: '5h', progress: Math.round(45 / 60 * 100), trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 }, achievementsCurrent: 45, achievementsTotal: 60, rating: 10, review: '网站制作需要近期才购入switch2，等待后续更新', tags: ['开放世界', '冒险', '创造'], cover: 'game/sed.jpg' },
  { id: 52, name: '超级马力欧 奥德赛', playTime: '42h', progress: Math.round(520 / 590 * 100), trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 }, achievementsCurrent: 520, achievementsTotal: 590, rating: 9, review: '经典马力欧的完美进化', tags: ['平台', '收集', '家庭'], cover: 'game/maliao.jpg' }
];

const pcGames = [
  { id: 31, name: '荒野大镖客：救赎2', playTime: '89h', progress: null, trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 }, achievementsCurrent: null, achievementsTotal: null, rating: 10, review: '西部世界的巅峰之作', tags: ['开放世界', '西部', '剧情'], cover: 'game/red.jpg' },
  { id: 32, name: '战神', playTime: '45h', progress: null, trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 }, achievementsCurrent: null, achievementsTotal: null, rating: 10, review: '父子情深的神话史诗', tags: ['动作', '剧情', '北欧神话'], cover: 'game/zhanshen.jpg' }
];

const followedGames = [
  { id: 101, name: '羊蹄山之魂', releaseDate: '2024年10月', rating: 9.5, cover: 'game/yts.jpg' },
  { id: 102, name: 'GTA6', releaseDate: '2026年夏季', rating: 9.8, cover: 'game/gta6.jpg' }
];

const allGamesData = {
  playstation: playstationGames,
  switch: switchGames,
  pc: pcGames
};

type PlatformId = keyof typeof allGamesData;
const validPlatformIds = Object.keys(allGamesData) as PlatformId[];

// Loader function - 在服务端批量生成所有图片token
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const platformIdParam = url.searchParams.get("platform") || "playstation";
  const currentPage = parseInt(url.searchParams.get("page") || "1", 10);
  
  // 使用工具函数验证平台ID (纯算法逻辑已提取)
  const platformId = getValidPlatformId(platformIdParam, 'playstation') as PlatformId;
  
  // 使用工具函数进行分页计算 (纯算法逻辑已提取)
  const paginationResult = paginateGames(allGamesData[platformId], currentPage, 8);

  // 收集所有图片路径
  const allImagePaths = [
    'game/jkl.jpg', // 头像图片（使用2次）
    ...paginationResult.paginatedGames.map(game => game.cover),
    ...followedGames.map(game => game.cover),
  ];

  // 批量生成所有图片token
  const tokenResults = generateImageTokens(allImagePaths, 30);
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));

  // 替换所有游戏封面的src为带token的完整URL
  const paginatedGames = paginationResult.paginatedGames.map(game => ({
    ...game,
    cover: tokenMap.get(game.cover) || game.cover
  }));

  const followedGamesWithTokens = followedGames.map(game => ({
    ...game,
    cover: tokenMap.get(game.cover) || game.cover
  }));

  const avatarImageUrl = tokenMap.get('game/jkl.jpg') || 'game/jkl.jpg';

  const data = {
    userStats,
    platforms,
    platformId,
    paginatedGames,
    totalGames: paginationResult.totalGames,
    totalPages: paginationResult.totalPages,
    currentPage: paginationResult.currentPage,
    followedGames: followedGamesWithTokens,
    avatarImageUrl, // 传递头像URL给客户端
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=300", // token数据缓存5分钟
      "Content-Type": "application/json",
    },
  });
};

// --- Remix Meta ---
export const meta: MetaFunction = () => {
  return [
    { title: "游戏中心 - 我的游戏收藏" },
    { name: "description", content: "展示我的游戏收藏、成就和评分" },
  ];
};

// --- Remix Links ---
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: gameStyles },
];


// --- Main Component ---
export default function GameRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Dynamic background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Suspense fallback={<div className="text-white">Loading Game Page...</div>}>
          <GamePageClient {...data} />
        </Suspense>
      </div>
    </div>
  );
} 