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
    { id: 13, src: 'camera/m.jpg', alt: '人像摄影 1' },
    { id: 14, src: 'camera/n.jpg', alt: '人像摄影 2' },
    { id: 15, src: 'camera/o.jpg', alt: '人像摄影 3' },
    { id: 16, src: 'camera/p.jpg', alt: '人像摄影 4' },
    { id: 17, src: 'camera/q.jpg', alt: '人像摄影 5' },
    { id: 18, src: 'camera/r.jpg', alt: '人像摄影 6' },
    { id: 19, src: 'camera/s.jpg', alt: '人像摄影 7' },
    { id: 20, src: 'camera/t.jpg', alt: '人像摄影 8' },
    { id: 21, src: 'camera/u.jpg', alt: '人像摄影 9' },
    { id: 22, src: 'camera/v.jpg', alt: '人像摄影 10' },
    { id: 23, src: 'camera/w.jpg', alt: '人像摄影 11' },
    { id: 24, src: 'camera/x.jpg', alt: '人像摄影 12' }
  ];

  const imagePaths = rawPhotos.map(photo => photo.src);
  const tokenResults = generateImageTokens(imagePaths, 30);
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));

  const photos = rawPhotos.map(photo => ({
    ...photo,
    src: tokenMap.get(photo.src) || photo.src
  }));

  return json({ photos, galleryName: '光影留痕' }, {
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
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ aspectRatio: '4/3' }}
        />
      )}
      
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
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <span className="text-gray-500 text-sm">加载失败</span>
        </div>
      )}
    </div>
  );
};

export default function PortraitGallery() {
  const { photos, galleryName } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
      <div className="gallery-section py-16 px-3 bg-gray-50">
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
        <div className="text-center mt-16 flex justify-center gap-4">
          <Link
            to="/photo/street"
            prefetch="intent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            上一个：随拍即景
          </Link>
          <Link
            to="/photo/landscape"
            prefetch="intent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
          >
            下一个：静看时光
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </LazyMotion>
  );
}

