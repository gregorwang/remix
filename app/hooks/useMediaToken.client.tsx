import { useState, useEffect, useCallback } from 'react';
import { useLazyLoad } from './useLazyLoad.client';

// 通用媒体数据接口
export interface MediaData {
  id: number | string;
  src: string;
  alt?: string;
}

interface MediaTokenResponse {
  success: boolean;
  data: {
    imageUrl: string;
    expires: number;
  };
  error?: string;
}

type MediaType = 'image' | 'video';

// 为每种媒体类型创建独立的缓存
const createMediaCache = () => ({
  tokensCache: new Map<string, { url: string; expires: number }>(),
  loadingStates: new Map<string, 'loading' | 'loaded' | 'error'>(),
  errorCounts: new Map<string, number>(),
  pendingRequests: new Map<string, Promise<string>>(),
});

// 全局缓存管理
const mediaCaches = {
  image: createMediaCache(),
  video: createMediaCache(),
};

/**
 * 统一的媒体Token管理Hook
 * 支持图片和视频的token获取、缓存管理、错误处理等功能
 */
export const useMediaToken = (type: MediaType = 'image') => {
  const [cacheSize, setCacheSize] = useState(0);
  
  // 获取当前类型的缓存
  const cache = mediaCaches[type];
  
  // 使用独立的懒加载Hook
  const { createMediaObserver: createLazyLoadObserver } = useLazyLoad();

  // 初始化缓存大小
  useEffect(() => {
    setCacheSize(cache.tokensCache.size);
  }, [cache.tokensCache]);

  /**
   * 获取媒体名称从URL
   */
  const getMediaNameFromUrl = useCallback((url: string | null): string | null => {
    if (!url) return null;
    if (!url.startsWith('http')) {
      return url.replace(/^\/+/, '');
    }
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/^\/+/, '');
    } catch (e) {
      console.error(`Invalid ${type} URL:`, url);
      return null;
    }
  }, [type]);

  /**
   * 获取带token的媒体URL - 核心功能
   */
  const getMediaWithToken = useCallback(async (originalUrl: string): Promise<string> => {
    if (!originalUrl) return originalUrl;

    const mediaName = getMediaNameFromUrl(originalUrl);
    if (!mediaName) return originalUrl;

    // 简化错误处理：检查错误次数，超过3次直接返回原始URL，避免无限重试
    const errorCount = cache.errorCounts.get(mediaName) || 0;
    if (errorCount >= 3) {
      console.warn(`⚠️ ${type}${mediaName}错误次数过多(${errorCount})，停止重试`);
      return originalUrl;
    }

    // 如果之前标记为错误，清除错误状态以允许重试
    if (cache.loadingStates.get(mediaName) === 'error') {
      cache.loadingStates.delete(mediaName);
      if (errorCount > 0) {
        console.log(`🔄 重试获取token (错误次数: ${errorCount}):`, mediaName);
      }
    }

    // 检查是否已有缓存的token
    if (cache.tokensCache.has(mediaName)) {
      const cachedData = cache.tokensCache.get(mediaName)!;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 如果token还有5分钟以上才过期，直接使用
      if (cachedData.expires - currentTime > 300) {
        console.log(`✅ 使用缓存${type}token:`, mediaName);
        return cachedData.url;
      } else {
        console.log(`⏰ ${type} Token即将过期，重新获取:`, mediaName);
        // 移除即将过期的缓存
        cache.tokensCache.delete(mediaName);
      }
    }

    // 检查是否已有正在进行的请求，避免重复请求
    if (cache.pendingRequests.has(mediaName)) {
      console.log(`⏳ 等待现有请求完成:`, mediaName);
      return await cache.pendingRequests.get(mediaName)!;
    }

    // 创建新的请求Promise
    const requestPromise = (async (): Promise<string> => {
      try {
        cache.loadingStates.set(mediaName, 'loading');
        console.log(`🔄 请求新${type}token:`, mediaName);
        
        // 使用 API 路由进行 token 生成
        const response = await fetch('/api/image-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            imageName: mediaName,
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

        const result = await response.json() as MediaTokenResponse;

        if (result.success) {
          cache.tokensCache.set(mediaName, {
            url: result.data.imageUrl,
            expires: result.data.expires
          });
          cache.loadingStates.set(mediaName, 'loaded');
          // 成功时重置错误计数
          cache.errorCounts.delete(mediaName);
          
          setCacheSize(cache.tokensCache.size);
          
          console.log(`✅ 获取新${type}token成功:`, mediaName);
          return result.data.imageUrl;
        } else {
          throw new Error(result.error || 'Token获取失败');
        }
      } catch (error) {
        // 增加错误计数
        const currentErrorCount = cache.errorCounts.get(mediaName) || 0;
        cache.errorCounts.set(mediaName, currentErrorCount + 1);
        
        // Token请求失败，记录错误并返回原始URL
        console.error(`❌ ${type} Token请求异常:`, mediaName, error);
        cache.loadingStates.set(mediaName, 'error');
        return originalUrl;
      }
    })();

    cache.pendingRequests.set(mediaName, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 无论成功还是失败，都要清除pending请求
      cache.pendingRequests.delete(mediaName);
    }
  }, [type, getMediaNameFromUrl, cache]);

  /**
   * 批量初始化媒体token URLs - 优化并发
   */
  const initializeMediaUrls = useCallback(async (
    items: MediaData[], 
    setItems: (items: MediaData[]) => void,
    logPrefix = type
  ) => {
    console.log(`🔄 开始初始化${logPrefix}token...`);
    
    // 并发限制，避免同时发送过多请求
    const concurrencyLimit = 5;
    const chunks = [];
    for (let i = 0; i < items.length; i += concurrencyLimit) {
      chunks.push(items.slice(i, i + concurrencyLimit));
    }

    const updatedItems = [...items];

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (item) => {
        if (item.src && !item.src.includes('token=')) {
          try {
            const tokenUrl = await getMediaWithToken(item.src);
            const globalIndex = items.findIndex(i => i.id === item.id);
            if (globalIndex !== -1) {
              updatedItems[globalIndex] = { ...updatedItems[globalIndex], src: tokenUrl };
            }
          } catch (error) {
            console.warn(`Failed to get token for ${item.alt || item.id}:`, error);
          }
        }
      }));
    }
    
    setItems(updatedItems);
    console.log(`✅ ${logPrefix}token初始化完成`);
  }, [type, getMediaWithToken]);

  /**
   * 初始化单个媒体token URL
   */
  const initializeSingleMediaUrl = useCallback(async (
    src: string, 
    logName = type
  ): Promise<string> => {
    if (!src || src.includes('token=')) {
      return src;
    }

    try {
      return await getMediaWithToken(src);
    } catch (error) {
      console.warn(`Failed to get token for ${logName}:`, error);
      return src;
    }
  }, [type, getMediaWithToken]);

  /**
   * 处理媒体错误，防止无限循环
   * 简化版本：跟踪错误次数，超过阈值时显示占位符
   */
  const handleMediaError = useCallback((
    event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>, 
    mediaId: string | number
  ) => {
    const element = event.target as HTMLImageElement | HTMLVideoElement;
    const errorKey = `${mediaId}_${element.src}`;
    const errorCount = (cache.errorCounts.get(errorKey) || 0) + 1;
    
    // 更新错误计数
    cache.errorCounts.set(errorKey, errorCount);
    
    // 第一次错误时记录日志
    if (errorCount === 1) {
      console.warn(`${type}加载失败:`, element.src);
      return;
    }
    
    // 错误次数超过阈值（2次），显示占位符并停止重试
    if (errorCount >= 2) {
      element.style.display = 'none';
      if (element.parentElement) {
        const isVideo = type === 'video';
        element.parentElement.innerHTML = `
          <div class="w-full h-full ${isVideo ? 'bg-gray-900' : 'bg-gray-300'} rounded flex items-center justify-center text-gray-${isVideo ? '400' : '500'}">
            <div class="text-center">
              <svg class="w-${isVideo ? '16' : '8'} h-${isVideo ? '16' : '8'} mx-auto ${isVideo ? 'mb-4' : ''}" fill="currentColor" viewBox="0 0 20 20">
                ${isVideo 
                  ? '<path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />'
                  : '<path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />'
                }
              </svg>
              ${isVideo ? '<p class="text-sm">视频加载失败</p>' : ''}
            </div>
          </div>
        `;
      }
    }
  }, [type, cache.errorCounts]);

  /**
   * 创建Intersection Observer实现懒加载
   * 使用独立的 useLazyLoad Hook
   */
  const createMediaObserver = useCallback((
    items: MediaData[],
    setItems: (items: MediaData[]) => void,
    dataAttribute: string = `data-${type}-id`,
    logPrefix = type
  ) => {
    // 创建一个包装函数来处理items更新
    return createLazyLoadObserver(
      async (src, itemId) => {
        const tokenUrl = await getMediaWithToken(src);
        
        // 根据itemId更新对应项的src
        const updatedItems = items.map(item => 
          item.id.toString() === itemId 
            ? { ...item, src: tokenUrl }
            : item
        );
        setItems(updatedItems);
        
        return tokenUrl;
      },
      dataAttribute,
      logPrefix
    );
  }, [type, getMediaWithToken, createLazyLoadObserver]);

  /**
   * 智能清除媒体缓存状态 - 只清除错误状态，保留token缓存
   */
  const clearMediaErrorStates = useCallback(() => {
    cache.loadingStates.clear();
    cache.errorCounts.clear();
    console.log(`🧹 清除${type}错误状态`);
  }, [type, cache]);

  /**
   * 强制清除所有缓存（谨慎使用）
   */
  const forceCleanCache = useCallback(() => {
    cache.tokensCache.clear();
    cache.loadingStates.clear();
    cache.errorCounts.clear();
    setCacheSize(0);
    console.log(`🧹 强制清除所有${type}缓存`);
  }, [type, cache]);

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    return {
      tokenCacheSize: cache.tokensCache.size,
      loadingStatesSize: cache.loadingStates.size,
      errorCountsSize: cache.errorCounts.size,
      cacheHitRate: cache.tokensCache.size > 0 ? 
        (cache.tokensCache.size / (cache.tokensCache.size + cache.loadingStates.size)) * 100 : 0
    };
  }, [cache]);

  return {
    // 核心函数
    getMediaWithToken,
    getMediaNameFromUrl,
    initializeMediaUrls,
    initializeSingleMediaUrl,
    handleMediaError,
    clearMediaErrorStates,
    forceCleanCache,
    getCacheStats,
    createMediaObserver,
    
    // 状态（最小化，为RSC准备）
    cacheSize
  };
};

// 导出专用hooks，保持向后兼容
export const useImageToken = () => {
  const mediaHook = useMediaToken('image');
  
  return {
    ...mediaHook,
    // 为了向后兼容，保留旧的命名
    getImageWithToken: mediaHook.getMediaWithToken,
    getImageNameFromUrl: mediaHook.getMediaNameFromUrl,
    initializeImageUrls: mediaHook.initializeMediaUrls,
    initializeSingleImageUrl: mediaHook.initializeSingleMediaUrl,
    handleImageError: mediaHook.handleMediaError,
    clearImageErrorStates: mediaHook.clearMediaErrorStates,
    createImageObserver: mediaHook.createMediaObserver,
  };
};

export const useVideoToken = () => {
  const mediaHook = useMediaToken('video');
  
  return {
    ...mediaHook,
    // 为了向后兼容，保留旧的命名
    getVideoWithToken: mediaHook.getMediaWithToken,
    getVideoNameFromUrl: mediaHook.getMediaNameFromUrl,
    initializeSingleVideoUrl: mediaHook.initializeSingleMediaUrl,
    handleVideoError: mediaHook.handleMediaError,
    clearVideoErrorStates: mediaHook.clearMediaErrorStates,
    forceCleanVideoCache: mediaHook.forceCleanCache,
    getVideoCacheStats: mediaHook.getCacheStats,
  };
};

// 为了向后兼容，导出类型别名
export type { MediaData as ImageData, MediaData as VideoData };

