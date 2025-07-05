import type { LoaderFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useImageToken } from "~/hooks/useImageToken";
import { useVideoToken } from "~/hooks/useVideoToken.client";

// Types for demo data
interface MediaDemoData {
  sampleImages: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  sampleVideos: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
}

// Links function for resource optimization - 符合rule.md要求
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
];

// Meta function for SEO - 符合rule.md要求
export const meta: MetaFunction = () => [
  { title: "媒体Token演示 - 安全访问控制系统" },
  { name: "description", content: "演示图片和视频安全访问token的生成、缓存和使用功能" },
  { name: "keywords", content: "媒体,token,安全,缓存,演示" },
  { name: "robots", content: "noindex, nofollow" }, // 演示页面不需要索引
];

// Loader function - 符合rule.md的路由级数据加载要求
export async function loader({ request }: LoaderFunctionArgs) {
  // 模拟媒体数据 - 在真实应用中这些将从数据库或API获取
  const data: MediaDemoData = {
    sampleImages: [
      { id: "img1", src: "https://example.com/secure/image1.jpg", alt: "安全图片1" },
      { id: "img2", src: "https://example.com/secure/image2.png", alt: "安全图片2" },
      { id: "img3", src: "photos/gallery/photo1.jpg", alt: "相册照片1" },
      { id: "img4", src: "photos/gallery/photo2.jpg", alt: "相册照片2" },
    ],
    sampleVideos: [
      { id: "vid1", src: "https://example.com/secure/video1.mp4", alt: "安全视频1" },
      { id: "vid2", src: "https://example.com/secure/video2.webm", alt: "安全视频2" },
      { id: "vid3", src: "videos/content/demo1.mp4", alt: "演示视频1" },
      { id: "vid4", src: "videos/content/demo2.mp4", alt: "演示视频2" },
    ]
  };

  return json(data, {
    headers: {
      // HTTP缓存控制 - 符合rule.md要求
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}

// Client component for media token demonstration
function MediaTokenDemo() {
  const { sampleImages, sampleVideos } = useLoaderData<typeof loader>();
  
  // 使用自定义hooks - 为RSC做准备，最小化客户端状态
  const {
    getImageWithToken,
    initializeImageUrls,
    handleImageError,
    getCacheStats: getImageCacheStats,
    clearImageErrorStates,
    cacheSize: imageCacheSize
  } = useImageToken();

  const {
    getVideoWithToken,
    initializeSingleVideoUrl,
    handleVideoError,
    getVideoCacheStats,
    clearVideoErrorStates,
    cacheSize: videoCacheSize
  } = useVideoToken();

  // 最小化状态，为RSC准备
  const [processedImages, setProcessedImages] = useState(sampleImages);
  const [processedVideos, setProcessedVideos] = useState(sampleVideos);
  const [isInitializing, setIsInitializing] = useState(false);
  const [stats, setStats] = useState({ image: 0, video: 0 });

  // 初始化媒体token
  useEffect(() => {
    const initializeMedia = async () => {
      setIsInitializing(true);
      
      try {
        // 并行初始化图片和视频token
        await Promise.all([
          initializeImageUrls(sampleImages, setProcessedImages, '演示图片'),
          Promise.all(sampleVideos.map(async (video, index) => {
            const tokenUrl = await initializeSingleVideoUrl(video.src, `演示视频${index + 1}`);
            setProcessedVideos(prev => 
              prev.map(v => v.id === video.id ? { ...v, src: tokenUrl } : v)
            );
          }))
        ]);
      } catch (error) {
        console.error('媒体初始化失败:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeMedia();
  }, [sampleImages, sampleVideos, initializeImageUrls, initializeSingleVideoUrl]);

  // 更新统计信息
  useEffect(() => {
    setStats({
      image: imageCacheSize,
      video: videoCacheSize
    });
  }, [imageCacheSize, videoCacheSize]);

  // 手动获取单个媒体token
  const handleGetSingleImageToken = async (imageSrc: string) => {
    try {
      const tokenUrl = await getImageWithToken(imageSrc);
      console.log('获取到图片token URL:', tokenUrl);
      // 这里可以更新UI或执行其他操作
    } catch (error) {
      console.error('获取图片token失败:', error);
    }
  };

  const handleGetSingleVideoToken = async (videoSrc: string) => {
    try {
      const tokenUrl = await getVideoWithToken(videoSrc);
      console.log('获取到视频token URL:', tokenUrl);
      // 这里可以更新UI或执行其他操作
    } catch (error) {
      console.error('获取视频token失败:', error);
    }
  };

  const handleClearErrors = () => {
    clearImageErrorStates();
    clearVideoErrorStates();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            媒体Token系统演示
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            展示图片和视频安全访问控制系统的缓存管理、批量处理和错误恢复功能
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Link
              to="/"
              prefetch="intent"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← 返回首页
            </Link>
            <Link
              to="/image-demo"
              prefetch="intent"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Token生成演示 →
            </Link>
          </div>
        </div>

        {/* 状态显示 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">系统状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.image}</div>
              <div className="text-sm text-blue-800">图片Token缓存</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.video}</div>
              <div className="text-sm text-green-800">视频Token缓存</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {isInitializing ? '初始化中...' : '就绪'}
              </div>
              <div className="text-sm text-purple-800">系统状态</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleClearErrors}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              清除错误状态
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 图片演示 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              安全图片展示
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {processedImages.map((image) => (
                <div key={image.id} className="relative">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, image.id)}
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-700">{image.alt}</div>
                    <button
                      onClick={() => handleGetSingleImageToken(image.src)}
                      className="mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      重新获取Token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 视频演示 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              安全视频播放
            </h2>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {processedVideos.map((video) => (
                <div key={video.id} className="relative">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      src={video.src}
                      className="w-full h-full object-cover"
                      onError={(e) => handleVideoError(e, video.id)}
                      controls
                      preload="metadata"
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-700">{video.alt}</div>
                    <button
                      onClick={() => handleGetSingleVideoToken(video.src)}
                      className="mt-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      重新获取Token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">功能特性</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">智能缓存</h3>
              <p className="text-sm text-gray-600">
                自动缓存token到sessionStorage，避免重复请求，提升加载速度
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">错误恢复</h3>
              <p className="text-sm text-gray-600">
                智能重试机制，失败时显示占位符，防止无限循环
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">批量处理</h3>
              <p className="text-sm text-gray-600">
                支持批量初始化媒体token，并发限制优化性能
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">安全保护</h3>
              <p className="text-sm text-gray-600">
                HMAC签名验证，时效性控制，确保媒体访问安全
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">React 19准备</h3>
              <p className="text-sm text-gray-600">
                最小化客户端状态，为未来RSC迁移做好准备
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">性能优化</h3>
              <p className="text-sm text-gray-600">
                懒加载支持，资源预加载，优化用户体验
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component export - 使用客户端组件模式
export default MediaTokenDemo;

// Error Boundary - 符合rule.md要求
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">媒体演示页面错误</h1>
          <p className="text-gray-600 mb-4">抱歉，媒体token演示页面暂时无法显示。</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 