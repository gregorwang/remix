import { useState, useEffect, useRef, useCallback } from 'react';

// 全局缓存状态 - 为RSC做准备，保持最小化
const imageTokensCache = new Map<string, { imageUrl: string; expires: number }>();
const imageLoadingStates = new Map<string, 'loading' | 'loaded' | 'error'>();
const imageErrorCounts = new Map<string, number>();
// 添加请求去重Map，防止同时发起多个相同请求
const pendingRequests = new Map<string, Promise<string>>();

// 持久化缓存配置
const CACHE_KEY = 'image-tokens-cache';
const CACHE_EXPIRES_KEY = 'image-tokens-expires';

export interface ImageData {
  id: number | string;
  src: string;
  alt?: string;
}

interface ImageTokenResponse {
  success: boolean;
  data: {
    imageUrl: string;
    expires: number;
  };
  error?: string;
}

/**
 * 从 sessionStorage 恢复缓存
 */
const restoreCache = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    const cachedExpires = sessionStorage.getItem(CACHE_EXPIRES_KEY);
    
    if (cachedData && cachedExpires) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresTime = parseInt(cachedExpires);
      
      // 如果整个缓存还没过期（设置为1小时）
      if (currentTime < expiresTime) {
        const parsedData = JSON.parse(cachedData);
        // 恢复到 Map 结构
        imageTokensCache.clear();
        Object.entries(parsedData).forEach(([key, value]) => {
          imageTokensCache.set(key, value as { imageUrl: string; expires: number });
        });
        console.log('🔄 从缓存恢复图片token', imageTokensCache.size, '个');
      } else {
        // 缓存已过期，清除
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_EXPIRES_KEY);
        console.log('🧹 缓存已过期，已清除');
      }
    }
  } catch (error) {
    console.warn('恢复图片缓存失败:', error);
    // 清除损坏的缓存
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_EXPIRES_KEY);
  }
};

/**
 * 保存缓存到 sessionStorage
 */
const saveCache = (): void => {
  if (typeof window === 'undefined' || imageTokensCache.size === 0) return;
  
  try {
    // 转换 Map 为普通对象用于存储
    const dataToStore = Object.fromEntries(imageTokensCache);
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(dataToStore));
    
    // 设置整个缓存1小时后过期
    const expiresTime = Math.floor(Date.now() / 1000) + 3600;
    sessionStorage.setItem(CACHE_EXPIRES_KEY, expiresTime.toString());
    
    console.log('💾 保存图片缓存', imageTokensCache.size, '个');
  } catch (error) {
    console.warn('保存图片缓存失败:', error);
  }
};

/**
 * 图片token管理Hook - 为React 19/RSC准备
 * 遵循rule.md规范，最小化客户端状态，准备RSC迁移
 */
export const useImageToken = () => {
  // 最小化状态，为RSC准备
  const [cacheSize, setCacheSize] = useState(0);
  const isInitialized = useRef(false);

  // 初始化缓存
  useEffect(() => {
    if (!isInitialized.current && typeof window !== 'undefined') {
      restoreCache();
      setCacheSize(imageTokensCache.size);
      isInitialized.current = true;
    }
  }, []);

  /**
   * 获取图片名称从URL
   */
  const getImageNameFromUrl = useCallback((url: string | null): string | null => {
    if (!url) return null;
    if (!url.startsWith('http')) {
      return url.replace(/^\/+/, '');
    }
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/^\/+/, '');
    } catch (e) {
      console.error('Invalid URL:', url);
      return null;
    }
  }, []);

  /**
   * 获取带token的图片URL - 核心功能
   */
  const getImageWithToken = useCallback(async (originalUrl: string): Promise<string> => {
    if (!originalUrl) return originalUrl;

    const imageName = getImageNameFromUrl(originalUrl);
    if (!imageName) return originalUrl;

    // 检查错误次数，超过3次直接返回原始URL，避免无限重试
    const errorCount = imageErrorCounts.get(imageName) || 0;
    if (errorCount >= 3) {
      console.warn(`⚠️ 图片${imageName}错误次数过多(${errorCount})，停止重试`);
      return originalUrl;
    }

    // 如果之前已经标记为 error，检查是否需要重试
    if (imageLoadingStates.get(imageName) === 'error') {
      // 只有在错误次数少于3次时才重试
      if (errorCount < 3) {
        console.log(`🔄 重试获取token (错误次数: ${errorCount}):', imageName`);
        imageLoadingStates.delete(imageName); // 清除错误状态，允许重试
      } else {
        return originalUrl;
      }
    }

    // 检查是否已有缓存的token
    if (imageTokensCache.has(imageName)) {
      const cachedData = imageTokensCache.get(imageName)!;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 如果token还有5分钟以上才过期，直接使用
      if (cachedData.expires - currentTime > 300) {
        console.log('✅ 使用缓存token:', imageName);
        return cachedData.imageUrl;
      } else {
        console.log('⏰ Token即将过期，重新获取:', imageName);
        // 移除即将过期的缓存
        imageTokensCache.delete(imageName);
      }
    }

    // 检查是否已有正在进行的请求，避免重复请求
    if (pendingRequests.has(imageName)) {
      console.log('⏳ 等待现有请求完成:', imageName);
      return await pendingRequests.get(imageName)!;
    }

    // 创建新的请求Promise
    const requestPromise = (async (): Promise<string> => {
    try {
      imageLoadingStates.set(imageName, 'loading');
      console.log('🔄 请求新token:', imageName);
      
      // 使用 API 路由进行 token 生成
      const response = await fetch('/api/image-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          imageName,
          expiresInMinutes: 30,
        }),
      });

      // 若非 2xx 响应，直接抛错，防止解析无效正文
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // 确保返回内容为 JSON，避免 HTML 错误页触发 SyntaxError
      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        const preview = (await response.text()).slice(0, 120);
        throw new Error(`Unexpected content-type: ${contentType}. Preview: ${preview}`);
      }

      const result = await response.json() as ImageTokenResponse;

      if (result.success) {
        imageTokensCache.set(imageName, {
          imageUrl: result.data.imageUrl,
          expires: result.data.expires
        });
        imageLoadingStates.set(imageName, 'loaded');
        // 成功时重置错误计数
        imageErrorCounts.delete(imageName);
        
        // 保存到持久化缓存
        saveCache();
        setCacheSize(imageTokensCache.size);
        
        console.log('✅ 获取新token成功:', imageName);
        return result.data.imageUrl;
      } else {
        throw new Error(result.error || 'Token获取失败');
      }
    } catch (error) {
      // 增加错误计数
      const currentErrorCount = imageErrorCounts.get(imageName) || 0;
      imageErrorCounts.set(imageName, currentErrorCount + 1);
      
      // Token请求失败，记录错误并返回原始URL
      console.error('❌ Token请求异常:', imageName, error);
      imageLoadingStates.set(imageName, 'error');
      return originalUrl;
      }
    })();

    pendingRequests.set(imageName, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 无论成功还是失败，都要清除pending请求
      pendingRequests.delete(imageName);
    }
  }, [getImageNameFromUrl]);

  /**
   * 批量初始化图片token URLs - 优化并发
   */
  const initializeImageUrls = useCallback(async (
    images: ImageData[], 
    setImages: (images: ImageData[]) => void,
    logPrefix = '图片'
  ) => {
    console.log(`🔄 开始初始化${logPrefix}token...`);
    
    // 并发限制，避免同时发送过多请求
    const concurrencyLimit = 5;
    const chunks = [];
    for (let i = 0; i < images.length; i += concurrencyLimit) {
      chunks.push(images.slice(i, i + concurrencyLimit));
    }

    const updatedImages = [...images];

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (image) => {
        if (image.src && !image.src.includes('token=')) {
          try {
            const tokenUrl = await getImageWithToken(image.src);
            const globalIndex = images.findIndex(img => img.id === image.id);
            if (globalIndex !== -1) {
              updatedImages[globalIndex] = { ...updatedImages[globalIndex], src: tokenUrl };
            }
          } catch (error) {
            console.warn(`Failed to get token for ${image.alt || image.id}:`, error);
          }
        }
      }));
    }
    
    setImages(updatedImages);
    console.log(`✅ ${logPrefix}token初始化完成`);
  }, [getImageWithToken]);

  /**
   * 初始化单个图片token URL
   */
  const initializeSingleImageUrl = useCallback(async (
    src: string, 
    logName = '图片'
  ): Promise<string> => {
    if (!src || src.includes('token=')) {
      return src;
    }

    try {
      return await getImageWithToken(src);
    } catch (error) {
      console.warn(`Failed to get token for ${logName}:`, error);
      return src;
    }
  }, [getImageWithToken]);

  /**
   * 处理图片错误，防止无限循环
   */
  const handleImageError = useCallback((
    event: React.SyntheticEvent<HTMLImageElement>, 
    imageId: string | number
  ) => {
    const img = event.target as HTMLImageElement;
    const errorKey = `${imageId}_${img.src}`;
    
    // 获取当前错误次数
    const errorCount = imageErrorCounts.get(errorKey) || 0;
    
    // 如果错误次数超过2次，显示占位符并停止重试
    if (errorCount >= 2) {
      img.style.display = 'none';
      if (img.parentElement) {
        img.parentElement.innerHTML = `
          <div class="w-full h-full bg-gray-300 rounded flex items-center justify-center text-gray-500">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
          </div>
        `;
      }
      return;
    }
    
    // 增加错误计数
    imageErrorCounts.set(errorKey, errorCount + 1);
    
    // 只有在第一次错误时才尝试设置备用图片
    if (errorCount === 0) {
      console.warn(`图片加载失败: ${img.src}`);
    }
  }, []);

  /**
   * 创建Intersection Observer实现懒加载
   */
  const createImageObserver = useCallback((
    images: ImageData[],
    setImages: (images: ImageData[]) => void,
    dataAttribute: string = 'data-image-id',
    logPrefix = '图片'
  ) => {
    if (typeof window === 'undefined') return null;

    const visibleImages = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const imageId = img.getAttribute(dataAttribute);
            const imageSrc = img.getAttribute(`${dataAttribute.replace('-id', '-src')}`);
            
            // 如果已经处理过这张图片，跳过
            if (!imageId || visibleImages.has(imageId)) return;
            
            visibleImages.add(imageId);
            
            // 如果需要token验证
            if (imageSrc && !imageSrc.includes('token=')) {
              try {
                const tokenUrl = await getImageWithToken(imageSrc);
                img.src = tokenUrl;
                
                // 更新对应图片的src
                const updatedImages = images.map(image => 
                  image.id.toString() === imageId 
                    ? { ...image, src: tokenUrl }
                    : image
                );
                setImages(updatedImages);
                
              } catch (error) {
                console.warn(`${logPrefix}懒加载失败 ${imageSrc}:`, error);
              }
            }
            
            // 停止观察这个元素
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px' // 提前50px开始加载
      }
    );
    
    return observer;
  }, [getImageWithToken]);

  /**
   * 智能清除图片缓存状态 - 只清除错误状态，保留token缓存
   */
  const clearImageErrorStates = useCallback(() => {
    imageLoadingStates.clear();
    imageErrorCounts.clear();
    console.log('🧹 清除图片错误状态');
  }, []);

  /**
   * 强制清除所有缓存（谨慎使用）
   */
  const forceCleanCache = useCallback(() => {
    imageTokensCache.clear();
    imageLoadingStates.clear();
    imageErrorCounts.clear();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_EXPIRES_KEY);
    }
    setCacheSize(0);
    console.log('🧹 强制清除所有图片缓存');
  }, []);

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    return {
      tokenCacheSize: imageTokensCache.size,
      loadingStatesSize: imageLoadingStates.size,
      errorCountsSize: imageErrorCounts.size,
      cacheHitRate: imageTokensCache.size > 0 ? 
        (imageTokensCache.size / (imageTokensCache.size + imageLoadingStates.size)) * 100 : 0
    };
  }, []);

  return {
    // 核心函数
    getImageWithToken,
    getImageNameFromUrl,
    initializeImageUrls,
    initializeSingleImageUrl,
    handleImageError,
    clearImageErrorStates,
    forceCleanCache,
    getCacheStats,
    createImageObserver,
    
    // 状态（最小化，为RSC准备）
    cacheSize
  };
}; 