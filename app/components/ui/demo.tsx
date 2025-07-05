"use client";

// this is a client component
import { useEffect, useRef, useState } from "react";

// Simple Plus icon component to replace DIcons.Plus
const PlusIcon = ({ strokeWidth = 4, className = "" }) => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export function Hero() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 延迟加载Canvas - 只在用户交互后加载
  const initCanvas = async () => {
    if (!showCanvas && canvasRef.current) {
      try {
        const { renderCanvas } = await import("~/components/ui/canvas");
        renderCanvas();
        setShowCanvas(true);
      } catch (error) {
        console.warn("Canvas加载失败，使用静态背景", error);
      }
    }
  };

  // 用户交互时触发Canvas
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      initCanvas();
    }
  };

  // Intersection Observer - 只在可见时准备Canvas
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showCanvas) {
          // 预加载但不立即执行
          import("~/components/ui/canvas").catch(() => {
            console.warn("Canvas预加载失败");
          });
        }
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [showCanvas]);

  return (
    <section 
      id="home" 
      ref={heroRef}
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onClick={handleUserInteraction}
    >
      <div className="animation-delay-8 animate-fadeIn mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20">
        <div className="mb-10 mt-4 md:mt-6">
          <div className="px-2">
            <div className="border-ali relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] md:px-12 md:py-20">
              <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                <PlusIcon
                  strokeWidth={4}
                  className="text-ali absolute -left-5 -top-5 h-10 w-10"
                />
                <PlusIcon
                  strokeWidth={4}
                  className="text-ali absolute -bottom-5 -left-5 h-10 w-10"
                />
                <PlusIcon
                  strokeWidth={4}
                  className="text-ali absolute -right-5 -top-5 h-10 w-10"
                />
                <PlusIcon
                  strokeWidth={4}
                  className="text-ali absolute -bottom-5 -right-5 h-10 w-10"
                />
                AI织经纬，我赋其山海
              </h1>
              <div className="flex items-center justify-center gap-1">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">Available Now</p>
              </div>
              
              {/* 提示用户交互 */}
              {!userInteracted && (
                <div className="mt-4 text-xs text-gray-500 opacity-60">
                  悬停或点击以启用交互动画
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-8 text-2xl md:text-2xl">
            欢迎来到我的数字伊甸园，我是{" "}
            <span className="text-ali font-bold">汪家俊 </span>
          </h1>

          <p className="md:text-md mx-auto mb-16 mt-2 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
            在这里，代码与思想交织，现实与虚拟的边界随之消融。这片由我与AI共同编织的领域，收藏着我的光影瞬间、心动旋律、热血故事，以及通往未来的足迹
          </p>
        </div>
      </div>
      
      {/* Canvas - 只在用户交互后显示 */}
      <canvas
        ref={canvasRef}
        className={`bg-skin-base pointer-events-none absolute inset-0 mx-auto transition-opacity duration-1000 ${
          showCanvas ? 'opacity-100' : 'opacity-0'
        }`}
        id="canvas"
      />
      
      {/* 静态背景 - 在Canvas加载前显示 */}
      {!showCanvas && (
        <div className="absolute inset-0 mx-auto pointer-events-none bg-gradient-to-br from-purple-50 via-transparent to-blue-50 opacity-30" />
      )}
    </section>
  );
}

 
