import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Suspense, lazy } from "react";
import musicStyles from "~/styles/music.css?url";
import { SubPageRoutePreloader } from "~/components/common/RoutePreloader";

const MusicPageClient = lazy(() => import('~/components/music/MusicPageClient.client'));

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: musicStyles },
];

export const meta: MetaFunction = () => [
  { title: 'Music Page' },
  { name: 'description', content: 'Explore the world of music through our curated collection of songs and artists.' },
];

export async function loader() {
  const data = {
    initialDnaImages: [
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
    ],
    initialMusicImages: [
      { id: 'h', src: '/SVG/h.jpg', alt: 'Letting Go' },
      { id: 'q', src: '/SVG/q.jpg', alt: '群青' },
      { id: 'f', src: '/SVG/f.jpg', alt: 'Vivienne' },
      { id: 'ee', src: '/SVG/ee.jpg', alt: '四季音色' },
      { id: 'o', src: '/SVG/o.jpg', alt: 'FELT' },
    ],
    initialAlbums: [
      { id: 1, src: '/SVG/n.jpg', alt: 'FELT Album 1 Cover' },
      { id: 2, src: '/SVG/t.jpg', alt: 'FELT Album 2 Cover' },
      { id: 3, src: '/SVG/w.jpg', alt: 'FELT Album 3 Cover' },
      { id: 4, src: '/SVG/g.jpg', alt: 'FELT Album 4 Cover' }
    ],
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
      "Cache-Control": "public, max-age=60, s-maxage=600, stale-while-revalidate=30000"
    }
  });
}

export default function Music() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {/* 预加载首页，提升返回速度 */}
      <SubPageRoutePreloader />
      
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading Music Page...</div>
        </div>
      }>
        <MusicPageClient {...data} />
      </Suspense>
    </div>
  );
}