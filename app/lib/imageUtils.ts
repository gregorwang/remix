// 图片处理工具函数

// 默认占位符SVG
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

// 图片数据接口
export interface ImageData {
  id: string;
  src: string;
  alt: string;
}

// 获取DNA图片URL
export const getDnaImageSrc = (id: string, dnaImages: ImageData[]): string => {
  const image = dnaImages.find(img => img.id === id);
  if (!image) return DEFAULT_PLACEHOLDER;
  
  // 直接返回占位符，因为实际图片文件不存在
  return DEFAULT_PLACEHOLDER;
};

// 获取音乐图片URL
export const getMusicImageSrc = (id: string, musicImages: ImageData[]): string => {
  const image = musicImages.find(img => img.id === id);
  if (!image) return DEFAULT_PLACEHOLDER;
  
  // 直接返回占位符，因为实际图片文件不存在
  return DEFAULT_PLACEHOLDER;
};

// 获取专辑封面URL
export const getAlbumCoverSrc = (cover: string): string => {
  // 直接返回占位符，因为实际图片文件不存在
  return DEFAULT_PLACEHOLDER;
};

// 图片错误处理函数
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, imageId: string): void {
  const img = event.currentTarget;
  console.warn(`图片加载失败: ${imageId}`);
  
  // 设置占位符
  img.src = DEFAULT_PLACEHOLDER;
  
  // 添加错误样式
  img.classList.add('image-error');
  
  // 可选：显示错误提示
  img.title = `图片加载失败: ${imageId}`;
}

// 图片懒加载处理
export function createImageObserver(callback?: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
      
      if (callback) {
        callback(entries);
      }
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
    }
  );
  
  return observer;
}

// 预加载关键图片
export function preloadImages(imageSrcs: string[]): Promise<void[]> {
  const promises = imageSrcs.map((src) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`预加载图片失败: ${src}`);
        resolve(); // 即使失败也继续
      };
      img.src = src;
    });
  });
  
  return Promise.all(promises);
}

// 生成粒子样式
export function getParticleStyle(index: number): React.CSSProperties {
  const size = Math.random() * 3 + 1;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const animationDelay = Math.random() * 20;
  const animationDuration = Math.random() * 10 + 10;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
  };
}

// 生成歌词流动样式
export function getLyricStreamStyle(index: number): React.CSSProperties {
  const delays = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33];
  const speeds = [20, 24, 18, 26, 22, 19, 23, 17, 25, 21, 27, 20];
  const heights = [8, 15, 22, 29, 36, 43, 50, 57, 64, 71, 78, 85];
  
  return {
    top: `${heights[index % heights.length]}%`,
    left: '100%',
    animationDelay: `${delays[index % delays.length]}s`,
    animationDuration: `${speeds[index % speeds.length]}s`,
  };
}

// 检查图片是否可访问
export async function checkImageAccessibility(src: string): Promise<boolean> {
  try {
    const response = await fetch(src, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// 图片格式优化建议
export function getOptimizedImageSrc(src: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}): string {
  // 在实际项目中，这里可以集成图片CDN的优化参数
  // 例如：Cloudinary, ImageKit, 或自定义图片服务
  
  if (!options) return src;
  
  // 示例：如果使用Cloudinary
  // return src.replace('/upload/', `/upload/w_${options.width},h_${options.height},q_${options.quality},f_${options.format}/`);
  
  return src;
}

// 响应式图片srcSet生成
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  return sizes
    .map(size => `${getOptimizedImageSrc(baseSrc, { width: size })} ${size}w`)
    .join(', ');
}

// 图片尺寸计算
export function calculateImageDimensions(aspectRatio: number, maxWidth: number): { width: number; height: number } {
  const width = Math.min(maxWidth, window.innerWidth * 0.9);
  const height = width / aspectRatio;
  
  return { width, height };
}