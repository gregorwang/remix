import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useVideoToken } from "~/hooks/useVideoToken.client";
// Replaced heroicons with simple symbols for better performance

// Types
interface AnimeItem {
  id: number;
  name: string;
  rating: string;
  url: string | null;
}

interface AnimePageData {
  content: {
    title: string;
    subtitle: string;
    description: string;
    ranksTitle: string;
    audioModal: {
      title: string;
      description: string;
      playWithSound: string;
      playMuted: string;
    };
    loading: string;
  };
  animeList: AnimeItem[];
  videoSrc: string;
}

// Links function
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
];

// Meta function
export const meta: MetaFunction = () => [
  { title: "最喜欢的动漫 - 我的个人网站" },
  { name: "description", content: "分享我最喜欢的动漫作品，这些陪伴我成长的精彩故事" },
  { name: "keywords", content: "动漫,anime,推荐,排行榜,二次元" },
  { property: "og:title", content: "最喜欢的动漫 - 我的个人网站" },
  { property: "og:description", content: "分享我最喜欢的动漫作品，这些陪伴我成长的精彩故事" },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

// Loader function
export async function loader() {
  const data: AnimePageData = {
    content: {
      title: "最喜欢的动漫",
      subtitle: "人生中一部分时间由他们陪伴我度过",
      description: "这些动漫作品不仅仅是娱乐，更是陪伴我成长的重要回忆。每一部都有着独特的魅力和深刻的内涵。",
      ranksTitle: "我的动漫排行榜",
      audioModal: {
        title: "音频设置",
        description: "是否播放背景音乐？您可以选择有声播放或静音播放。",
        playWithSound: "🔊 播放声音",
        playMuted: "🔇 静音播放"
      },
      loading: "加载中..."
    },
    animeList: [
      { id: 1, name: '从零开始的异世界生活', rating: '9.2', url: null },
      { id: 2, name: '火影忍者', rating: '9.5', url: null },
      { id: 3, name: '进击的巨人', rating: '9.8', url: null },
      { id: 4, name: '鬼灭之刃', rating: '9.3', url: null },
      { id: 5, name: '斩！赤红之瞳', rating: '8.9', url: null },
      { id: 6, name: '来自多彩世界的明天', rating: '8.7', url: null },
      { id: 7, name: '擅长作弄的高木同学', rating: '8.5', url: null },
      { id: 8, name: '一拳超人', rating: '9.1', url: null },
      { id: 9, name: 'Fate系列', rating: '9.0', url: null },
      { id: 10, name: '钢之炼金术师', rating: '9.7', url: null },
      { id: 11, name: '樱花庄的宠物女孩', rating: '8.8', url: null }
    ],
    videoSrc: "you.mp4"
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
    },
  });
}

export default function AnimePage() {
  const { content, animeList, videoSrc: initialVideoSrc } = useLoaderData<typeof loader>();
  
  // Video token hook
  const { 
    initializeSingleVideoUrl, 
    handleVideoError,
    clearVideoErrorStates,
    getVideoCacheStats 
  } = useVideoToken();

  // State management - 为RSC准备，最小化客户端状态
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState(initialVideoSrc);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  // 防抖的菜单切换
  const toggleMenu = useCallback(() => {
    setIsMenuActive(prev => !prev);
  }, []);

  // 当侧边栏开启/关闭导致视频区域可能离开视口时，尝试恢复视频播放
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 如果视频被浏览器自动暂停（通常因为不可见），稍后尝试恢复播放
    if (video.paused) {
      // 等待过渡动画大致结束后再调用 play，以避免 play() 被立即暂停
      const timer = setTimeout(() => {
        video.play().catch(() => {
          /* 在某些浏览器策略下 play 可能被拒绝，这里静默处理 */
        });
      }, 400); // 与 CSS transition 500ms 保持接近，但略短一些
      return () => clearTimeout(timer);
    }
  }, [isMenuActive]);

  // 视频事件处理
  const handleVideoLoadStart = useCallback(() => {
    console.log('🎬 视频开始加载');
  }, []);

  const handleVideoLoaded = useCallback(() => {
    console.log('✅ 视频加载完成');
    setIsLoading(false);
  }, []);

  const handleVideoErrorEvent = useCallback((error: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('❌ 视频加载失败:', error);
    handleVideoError(error, 'anime-background-video');
    setIsLoading(false);
  }, [handleVideoError]);

  // 音频控制 - 优化性能，立即响应用户操作
  const handleAudioChoice = useCallback((withSound: boolean) => {
    console.log('🎵 音频选择:', withSound ? '有声播放' : '静音播放');
    
    // 立即关闭模态框，给用户即时反馈
    setShowAudioModal(false);
    
    // 异步处理视频设置，避免阻塞UI
    setTimeout(() => {
    const video = videoRef.current;
    if (!video) {
      console.warn('⚠️ 视频元素未找到');
      return;
    }

    try {
      // 设置音频状态
      if (withSound) {
        video.muted = false;
        video.volume = 0.8; // 设置为80%音量，避免过大
        console.log('🔊 启用音频播放');
      } else {
        video.muted = true;
        console.log('🔇 静音播放');
      }

      // 尝试播放视频
        video.play().catch((error) => {
          console.error('❌ 视频播放失败:', error);
        });
        console.log('✅ 视频播放设置完成');
    } catch (error) {
        console.error('❌ 视频设置失败:', error);
    }
    }, 0);
  }, []);

  // 模态框覆盖层点击
  const handleModalOverlayClick = useCallback(() => {
    // 点击覆盖层时选择静音播放
    handleAudioChoice(false);
  }, [handleAudioChoice]);

  // 动漫点击处理
  const handleAnimeClick = useCallback((anime: AnimeItem, event: React.MouseEvent) => {
    if (!anime.url) {
      event.preventDefault();
      console.log(`点击了: ${anime.name}`);
      // 这里可以添加更多交互逻辑
    }
  }, []);

  // 键盘事件处理
  const handleKeydown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (showAudioModal) {
          handleAudioChoice(false);
        } else if (isMenuActive) {
          setIsMenuActive(false);
        }
        break;
      case ' ':
        if (event.target === document.body) {
          event.preventDefault();
          toggleMenu();
        }
        break;
    }
  }, [showAudioModal, isMenuActive, handleAudioChoice, toggleMenu]);

  // 预加载资源
  const preloadAssets = useCallback(async () => {
    try {
      // 预加载视频文件 - 获取带token的URL
      if (initialVideoSrc) {
        console.log('🎬 开始预加载视频:', initialVideoSrc);
        const tokenizedVideoUrl = await initializeSingleVideoUrl(initialVideoSrc, '动漫背景视频');
        setVideoSrc(tokenizedVideoUrl);
        console.log('✅ 视频token获取成功:', tokenizedVideoUrl);
      }
      console.log('✅ 资源预加载完成');
    } catch (error) {
      console.warn('⚠️ 资源预加载失败:', error);
    }
  }, [initialVideoSrc, initializeSingleVideoUrl]);

  // 生命周期
  useEffect(() => {
    console.log('🎬 动漫页面初始化');
    
    // 清除视频错误状态，保留token缓存
    clearVideoErrorStates();
    
    // 打印视频缓存统计信息
    const videoStats = getVideoCacheStats();
    console.log('📊 视频缓存统计:', videoStats);
    
    // 预加载资源
    preloadAssets();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeydown);
    
    // 延迟显示音频模态框，确保页面已渲染
    const timer = setTimeout(() => {
      if (showAudioModal) {
        console.log('🎵 显示音频模态框');
      }
    }, 500);

    return () => {
      console.log('🧹 动漫页面清理');
      document.removeEventListener('keydown', handleKeydown);
      clearTimeout(timer);
      
      // 暂停视频
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [preloadAssets, handleKeydown, showAudioModal, clearVideoErrorStates, getVideoCacheStats]);

  return (
    <LazyMotion features={domAnimation}>
    <div className="anime-page relative w-full min-h-screen overflow-x-hidden font-sans bg-black">
      {/* 主展示区域 */}
      <section 
        ref={showcaseRef}
        className={`absolute right-0 w-full min-h-screen px-6 py-24 md:px-24 flex justify-between items-center bg-black text-white z-20 transition-all duration-500 ease-out ${
          isMenuActive ? 'md:right-80 right-full' : ''
        }`}
      >
        {/* 头部导航 */}
        <header className="absolute top-0 left-0 w-full p-6 md:p-10 z-50 flex justify-end">
          <button
            onClick={toggleMenu}
            className={`w-12 h-12 md:w-15 md:h-15 rounded-full cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white/10 focus:outline-2 focus:outline-white focus:outline-offset-4 flex items-center justify-center ${
              isMenuActive ? 'rotate-180' : ''
            }`}
            aria-label={isMenuActive ? '关闭菜单' : '打开菜单'}
          >
            {isMenuActive ? (
              <span className="w-6 h-6 md:w-8 md:h-8 text-white text-xl md:text-2xl flex items-center justify-center">✕</span>
            ) : (
              <span className="w-6 h-6 md:w-8 md:h-8 text-white text-xl md:text-2xl flex items-center justify-center">☰</span>
            )}
          </button>
        </header>

        {/* 背景视频 */}
        <video 
          ref={videoRef}
          src={videoSrc}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-80 -z-10"
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onLoadStart={handleVideoLoadStart}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoErrorEvent}
        />

        {/* 主要文本内容 */}
        <m.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-extrabold uppercase leading-none mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {content.title}
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-5xl font-bold uppercase leading-tight mb-6 text-gray-200">
            {content.subtitle}
          </h3>
          <p className="text-base md:text-lg leading-relaxed my-5 max-w-2xl text-gray-300">
            {content.description}
          </p>
        </m.div>
      </section>

      {/* 动漫排行榜侧边栏 */}
      <aside 
        className={`fixed top-0 w-80 md:w-80 h-screen bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-md transition-all duration-500 ease-out z-30 overflow-y-auto ${
          isMenuActive ? 'right-0' : '-right-80'
        }`}
      >
        <div className="p-6 md:p-8 h-full flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center border-b-2 border-gray-600 pb-4">
            {content.ranksTitle}
          </h3>
          <ul className="list-none p-0 m-0 flex-1 space-y-3">
            {animeList.map((anime, index) => (
              <m.li 
                key={anime.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1 + 0.5 
                }}
                className="mb-3"
              >
                <a 
                  href={anime.url || '#'}
                  className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 text-gray-200 bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:bg-white/10 hover:translate-x-2 hover:border-white/20 ${
                    !anime.url ? 'cursor-default opacity-80' : ''
                  }`}
                  onClick={(e) => handleAnimeClick(anime, e)}
                >
                  <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full font-bold text-xs md:text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-medium">
                    {anime.name}
                  </span>
                  <span className="text-xs md:text-sm text-yellow-400 font-semibold">
                    {anime.rating}
                  </span>
                </a>
              </m.li>
            ))}
          </ul>
        </div>
      </aside>

      {/* 音频控制模态框 */}
      <AnimatePresence>
        {showAudioModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={handleModalOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audio-modal-title"
          >
            <m.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white to-gray-50 p-6 md:p-10 rounded-2xl text-center max-w-lg mx-4 shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="audio-modal-title" className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                {content.audioModal.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 leading-relaxed">
                {content.audioModal.description}
              </p>
              
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
                <button 
                  onClick={() => handleAudioChoice(true)}
                  className="flex items-center justify-center gap-2 py-3 px-4 md:px-6 border-none rounded-xl text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/40"
                  type="button"
                >
                  <span className="w-4 h-4 md:w-5 md:h-5 text-lg flex items-center justify-center">🔊</span>
                  {content.audioModal.playWithSound}
                </button>
                
                <button 
                  onClick={() => handleAudioChoice(false)}
                  className="flex items-center justify-center gap-2 py-3 px-4 md:px-6 border-none rounded-xl text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-100 text-gray-800 border-2 border-gray-300 hover:bg-gray-200 hover:-translate-y-1 hover:shadow-md"
                  type="button"
                >
                  <span className="w-4 h-4 md:w-5 md:h-5 text-lg flex items-center justify-center">🔇</span>
                  {content.audioModal.playMuted}
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* 加载指示器 */}
      <AnimatePresence>
        {isLoading && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-40"
          >
            <div className="text-center text-white">
              <div className="w-12 h-12 md:w-15 md:h-15 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-base md:text-lg m-0">{content.loading}</p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 返回首页链接 */}
      <div className="fixed bottom-6 left-6 z-30">
        <Link
          to="/"
          prefetch="intent"
          className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-3 py-2 md:px-4 md:py-2 rounded-full hover:bg-black/70 transition-colors duration-200 border border-white/20 text-sm md:text-base"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
    </LazyMotion>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md w-full mx-4 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">动漫页面错误</h1>
          <p className="text-gray-300 mb-4">抱歉，动漫页面暂时无法加载。</p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 
