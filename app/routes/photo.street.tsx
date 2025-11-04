import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateImageTokens } from "~/utils/imageToken.server";

interface ImageData {
  id: string | number;
  src: string;
  alt?: string;
}

export async function loader() {
  const rawPhotos = [
    { id: 1, src: 'camera/a.jpg', alt: '街拍摄影 1' },
    { id: 2, src: 'camera/b.jpg', alt: '街拍摄影 2' },
    { id: 3, src: 'camera/c.jpg', alt: '街拍摄影 3' },
    { id: 4, src: 'camera/d.jpg', alt: '街拍摄影 4' },
    { id: 5, src: 'camera/e.jpg', alt: '街拍摄影 5' },
    { id: 6, src: 'camera/f.jpg', alt: '街拍摄影 6' },
    { id: 7, src: 'camera/g.jpg', alt: '街拍摄影 7' },
    { id: 8, src: 'camera/h.jpg', alt: '街拍摄影 8' },
    { id: 9, src: 'camera/i.jpg', alt: '街拍摄影 9' },
    { id: 10, src: 'camera/j.jpg', alt: '街拍摄影 10' },
    { id: 11, src: 'camera/k.jpg', alt: '街拍摄影 11' },
    { id: 12, src: 'camera/l.jpg', alt: '街拍摄影 12' }
  ];

  const imagePaths = rawPhotos.map(photo => photo.src);
  const tokenResults = generateImageTokens(imagePaths, 30);
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));

  const photos = rawPhotos.map(photo => ({
    ...photo,
    src: tokenMap.get(photo.src) || photo.src
  }));

  return json({ photos, galleryName: '随拍即景' }, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}

// 优化的图片组件 - 使用Intersection Observer实现真正的懒加载
const LazyImage = ({ 
  src, 
  alt,
  className = ""
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* 占位符 */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ aspectRatio: '4/3' }}
        />
      )}
      
      {/* 实际图片 - 只有在可见时才加载 */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ aspectRatio: '4/3' }}
          onLoad={() => setLoaded(true)}
          onError={() => {
            console.error('图片加载失败:', src);
            setError(true);
          }}
        />
      )}
      
      {/* 错误占位 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <span className="text-gray-500 text-sm">加载失败</span>
        </div>
      )}
    </div>
  );
};

export default function StreetGallery() {
  const { photos, galleryName } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
      <div className="gallery-section py-16 px-3">
        {/* Header */}
        <div className="text-center mb-16">
          <Link 
            to="/photo" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回画廊选择
          </Link>
          
          <m.h1 
            className="text-4xl md:text-5xl font-bold text-gray-700 uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {galleryName}
          </m.h1>
        </div>

        {/* 照片网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-7xl mx-auto">
          {photos.map((photo, index) => (
            <m.div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer aspect-square bg-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <LazyImage
                src={photo.src}
                alt={photo.alt || `照片 ${photo.id}`}
                className="h-full transition-transform duration-300 ease-out group-hover:scale-110"
              />
            </m.div>
          ))}
        </div>

        {/* 导航 */}
        <div className="text-center mt-16 space-x-4">
          <Link
            to="/photo/portrait"
            prefetch="intent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            下一个画廊：光影留痕
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </LazyMotion>
  );
}

