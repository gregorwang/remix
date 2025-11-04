import type { LinksFunction, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import musicStyles from "~/styles/music.css?url";
import { generateImageTokens } from "~/utils/imageToken.server";

// 直接导入，移除 lazy() - Remix 已经在路由级别自动进行代码分割
import MusicPageClient from '~/components/music/MusicPageClient.client';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: musicStyles },
];

export const meta: MetaFunction = () => [
  { title: 'Music Page' },
  { name: 'description', content: 'Explore the world of music through our curated collection of songs and artists.' },
];

export async function loader() {
  // 原始图片数据
  const rawDnaImages = [
    { id: 'dd', src: '/SVG/dd.jpg', alt: '梦醒时分 - 梁静茹' },
    { id: 'i', src: '/SVG/i.jpg', alt: 'Killer Song - 麻枝准' },
    { id: 'd', src: '/SVG/d.jpg', alt: 'The Ray of Light - Vivienne' },
    { id: 'a', src: '/SVG/a.jpg', alt: 'Headlight - MONKEY MAJIK' },
    { id: 'r', src: '/SVG/r.jpg', alt: 'Renaissance - Steve James' },
    { id: 'u', src: '/SVG/u.jpg', alt: '小满 - 音阙诗听' },
    { id: 'v', src: '/SVG/v.jpg', alt: 'SLUMP - Stray Kids' },
    { id: 'bb', src: '/SVG/bb.jpg', alt: 'Phantom - Vivienne' },
    { id: 'h', src: '/SVG/h.jpg', alt: 'Letting Go - 蔡健雅' },
    { id: 'm', src: '/SVG/m.jpg', alt: 'Somebody That I Used To - TRONICBOX' },
    { id: 'y', src: '/SVG/y.jpg', alt: 'rich-man - 林ゆうき' }
  ];
  const rawMusicImages = [
    { id: 'h', src: '/SVG/h.jpg', alt: 'Letting Go' },
    { id: 'q', src: '/SVG/q.jpg', alt: '群青' },
    { id: 'f', src: '/SVG/f.jpg', alt: 'Vivienne' },
    { id: 'ee', src: '/SVG/ee.jpg', alt: '四季音色' },
    { id: 'o', src: '/SVG/o.jpg', alt: 'FELT' },
  ];
  const rawAlbums = [
    { id: 1, src: '/SVG/n.jpg', alt: 'FELT Album 1 Cover' },
    { id: 2, src: '/SVG/t.jpg', alt: 'FELT Album 2 Cover' },
    { id: 3, src: '/SVG/w.jpg', alt: 'FELT Album 3 Cover' },
    { id: 4, src: '/SVG/g.jpg', alt: 'FELT Album 4 Cover' }
  ];

  // 收集所有图片路径（去重，因为有些图片被重复使用）
  const allImagePaths = [
    ...rawDnaImages.map(img => img.src),
    ...rawMusicImages.map(img => img.src),
    ...rawAlbums.map(img => img.src),
  ];
  const uniqueImagePaths = [...new Set(allImagePaths)];

  // 批量生成所有图片token
  const tokenResults = generateImageTokens(uniqueImagePaths, 30);
  
  // 创建tokenMap：使用规范化后的路径作为key（因为generateImageToken已经规范化了）
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));
  
  // 辅助函数：规范化路径（去掉前导斜杠），与generateImageToken的逻辑一致
  const normalizePath = (path: string) => path.replace(/^\/+/, '');

  // 替换所有src为带token的完整URL（查找时使用规范化路径）
  const initialDnaImages = rawDnaImages.map(img => ({
    ...img,
    src: tokenMap.get(normalizePath(img.src)) || img.src
  }));

  const initialMusicImages = rawMusicImages.map(img => ({
    ...img,
    src: tokenMap.get(normalizePath(img.src)) || img.src
  }));

  const initialAlbums = rawAlbums.map(img => ({
    ...img,
    src: tokenMap.get(normalizePath(img.src)) || img.src
  }));

  const data = {
    initialDnaImages,
    initialMusicImages,
    initialAlbums,
    selectedLyricsData: [
        { text: "我是离开，无名的人啊，我敬你一杯酒，敬你的沉默和每一声怒吼", song: "孙楠/陈楚生《无名之辈》" },
        { text: "I will never gonna leave you never wanna lose you，we'll make it in the end", song: "前島麻由《longshot》" },
        { text: "まっしろまっしろ まっしろな雪が降る", song: "水瀬ましろ《まっしろな雪》" },
        { text: "Petals dance for our valediction，And synchronize to your frozen pulsation", song: "mili《Nine Point Eight》" },
        { text: "That since then I've found my way back...but I'll miss you", song: "Vivienne《Goodbye》" },
        { text: "And now that I understand, have I the courage to try", song: "Vivienne《Phantom》" },
        { text: "The fate plays a amazing trick on you，You can't hold it steady", song: "FELT《Beautiful Trick》" },
        { text: "我看见希望闪耀在虹之间，光芒凝结于你我的那片天", song: "王赫野/姚晓棠《虹之间 (Live版)》" },
        { text: "敬你弯着腰，上山往高处走，头顶苍穹，努力地生活", song: "孙楠/陈楚生《无名之辈》" },
        { text: "Take me to where your soul may live in peace", song: "mili《Nine Point Eight》" },
        { text: "不再追问你为何不能停留，微笑看见爱的浮现", song: "王赫野/姚晓棠《虹之间 (Live版)》" },
        { text: "Not backing down for real", song: "前島麻由《longshot》" }
    ],
    statsData: [
        { value: '2500+', label: '总听歌' },
        { value: '750+', label: '不同艺人' },
        { value: 'Top 1%', label: '听歌品味' },
    ],
    keywordsData: ['J-POP', 'OST', '治愈', 'FELT', 'mili', 'Vivienne'],
    mainArtistData: {
      name: 'Vivienne',
      style: '独立·原创',
      description: '她的音乐如同在浩瀚宇宙中的一次孤独旅行，旋律深邃而富有感染力，总能触及灵魂深处最柔软的地方。',
      imageId: 'f'
    },
    otherArtistsData: [
        { name: 'mili', style: '古典/电音', imageId: 'o' },
        { name: 'FELT', style: '东方Project', imageId: 'ee' },
    ],
    mainArtistSongsData: [
        'Nine Point Eight',
        'world.execute(me);',
        'Phantom',
        'Imagined Flight',
        'Ga1ahad and Scientific Witchery',
    ],
  };
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600", // token数据缓存1小时
    }
  });
}

// 🎉 Remix 最佳实践：使用 clientLoader 实现客户端缓存
export async function clientLoader({ 
  serverLoader 
}: ClientLoaderFunctionArgs) {
  const CACHE_KEY = 'music-page-data';
  const CACHE_VERSION = 'v1';
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  try {
    // 尝试从 sessionStorage 读取缓存
    const cachedItem = sessionStorage.getItem(CACHE_KEY);
    
    if (cachedItem) {
      const { data, timestamp, version } = JSON.parse(cachedItem);
      const now = Date.now();
      
      // 检查缓存是否有效（版本匹配且未过期）
      if (version === CACHE_VERSION && now - timestamp < CACHE_DURATION) {
        console.log('✅ 使用缓存数据');
        return data;
      }
    }
  } catch (error) {
    console.warn('读取缓存失败:', error);
  }

  // 缓存无效或不存在，从服务器加载
  console.log('📡 从服务器加载数据');
  const serverData = await serverLoader();

  // 保存到 sessionStorage
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data: serverData,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }));
  } catch (error) {
    console.warn('保存缓存失败:', error);
  }

  return serverData;
}
// 在初始hydration时也运行 clientLoader
clientLoader.hydrate = true;

// Remix v2 推荐：使用 HydrateFallback 替代 Suspense
export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-xl font-medium">Loading Music Page...</p>
        </div>
      </div>
    </div>
  );
}

export default function Music() {
  const data = useLoaderData<typeof loader>();

  return <MusicPageClient {...data} />;
}