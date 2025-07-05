import { useState, useEffect, useRef, useCallback } from 'react';

// 全局视频token缓存，在所有组件间共享 - 为RSC做准备，保持最小化
let videoTokensCache = new Map<string, { videoUrl: string; expires: number }>();
const videoLoadingStates = new Map<string, 'loading' | 'loaded' | 'error'>();
const videoErrorCounts = new Map<string, number>();

// 持久化缓存键名
const VIDEO_CACHE_KEY = 'video-tokens-cache';
const VIDEO_CACHE_EXPIRES_KEY = 'video-tokens-expires';

export interface VideoData {
  id: number | string;
  src: string;
  alt?: string;
}

/**
 * 从 sessionStorage 恢复视频缓存
 */
const restoreVideoCache = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const cachedData = sessionStorage.getItem(VIDEO_CACHE_KEY);
    const cachedExpires = sessionStorage.getItem(VIDEO_CACHE_EXPIRES_KEY);
    
    if (cachedData && cachedExpires) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresTime = parseInt(cachedExpires);
      
      // 如果整个缓存还没过期（设置为1小时）
      if (currentTime < expiresTime) {
        const parsedData = JSON.parse(cachedData);
        // 恢复到 Map 结构
        videoTokensCache = new Map(Object.entries(parsedData));
        console.log('🔄 从缓存恢复视频token', videoTokensCache.size, '个');
      } else {
        // 缓存已过期，清除
        sessionStorage.removeItem(VIDEO_CACHE_KEY);
        sessionStorage.removeItem(VIDEO_CACHE_EXPIRES_KEY);
        console.log('🧹 视频缓存已过期，已清除');
      }
    }
  } catch (error) {
    console.warn('恢复视频缓存失败:', error);
    // 清除损坏的缓存
    sessionStorage.removeItem(VIDEO_CACHE_KEY);
    sessionStorage.removeItem(VIDEO_CACHE_EXPIRES_KEY);
  }
};

/**
 * 保存视频缓存到 sessionStorage
 */
const saveVideoCache = (): void => {
  if (typeof window === 'undefined' || videoTokensCache.size === 0) return;
  
  try {
    // 转换 Map 为普通对象用于存储
    const dataToStore = Object.fromEntries(videoTokensCache);
    sessionStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(dataToStore));
    
    // 设置整个缓存1小时后过期
    const expiresTime = Math.floor(Date.now() / 1000) + 3600;
    sessionStorage.setItem(VIDEO_CACHE_EXPIRES_KEY, expiresTime.toString());
    
    console.log('💾 保存视频缓存', videoTokensCache.size, '个');
  } catch (error) {
    console.warn('保存视频缓存失败:', error);
  }
};

/**
 * 获取视频名称从URL
 */
const getVideoNameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (!url.startsWith('http')) {
    return url.replace(/^\/+/, '');
  }
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.replace(/^\/+/, '');
  } catch (e) {
    console.error('Invalid video URL:', url);
    return null;
  }
};

/**
 * 视频token验证Hook - 为React 19/RSC准备
 * 遵循rule.md规范，最小化客户端状态，准备RSC迁移
 * 提供视频token获取、缓存管理、错误处理等功能
 */
export const useVideoToken = () => {
  // 最小化状态，为RSC准备
  const [cacheSize, setCacheSize] = useState(0);
  const isInitialized = useRef(false);

  // 初始化时恢复缓存
  useEffect(() => {
    if (!isInitialized.current && typeof window !== 'undefined') {
      restoreVideoCache();
      setCacheSize(videoTokensCache.size);
      isInitialized.current = true;
    }
  }, []);

  /**
   * 获取带token的视频URL
   */
  const getVideoWithToken = useCallback(async (originalUrl: string): Promise<string> => {
    if (!originalUrl) {
      return originalUrl;
    }

    const videoName = getVideoNameFromUrl(originalUrl);
    if (!videoName) {
      return originalUrl;
    }

    // 检查是否已有缓存的token
    if (videoTokensCache.has(videoName)) {
      const cachedData = videoTokensCache.get(videoName)!;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 如果token还有5分钟以上才过期，直接使用
      if (cachedData.expires - currentTime > 300) {
        console.log('✅ 使用缓存视频token:', videoName);
        return cachedData.videoUrl;
      } else {
        console.log('⏰ 视频Token即将过期，重新获取:', videoName);
        // 移除即将过期的缓存
        videoTokensCache.delete(videoName);
      }
    }

    try {
      videoLoadingStates.set(videoName, 'loading');
      console.log('🔄 请求新视频token:', videoName);
      
      // 使用 API 路由进行 token 生成
      const response = await fetch('/api/image-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageName: videoName, // API中使用imageName参数，但实际可以处理视频
          expiresInMinutes: 30
        })
      });

      const result = await response.json();

      if (result.success) {
        videoTokensCache.set(videoName, {
          videoUrl: result.data.imageUrl, // API返回的是imageUrl，但实际是带token的完整URL
          expires: result.data.expires
        });
        videoLoadingStates.set(videoName, 'loaded');
        
        // 保存到持久化缓存
        saveVideoCache();
        setCacheSize(videoTokensCache.size);
        
        console.log('✅ 获取视频token成功:', videoName);
        return result.data.imageUrl;
      } else {
        videoLoadingStates.set(videoName, 'error');
        console.error('❌ 视频Token获取失败:', videoName, result);
        return originalUrl;
      }
    } catch (error) {
      console.error('❌ 视频Token请求异常:', videoName, error);
      videoLoadingStates.set(videoName, 'error');
      return originalUrl;
    }
  }, []);

  /**
   * 初始化单个视频token URL
   */
  const initializeSingleVideoUrl = useCallback(async (
    src: string, 
    logName = '视频'
  ): Promise<string> => {
    if (!src || src.includes('token=')) {
      return src;
    }

    try {
      return await getVideoWithToken(src);
    } catch (error) {
      console.warn(`Failed to get token for ${logName}:`, error);
      return src;
    }
  }, [getVideoWithToken]);

  /**
   * 处理视频错误，防止无限循环
   */
  const handleVideoError = useCallback((
    event: React.SyntheticEvent<HTMLVideoElement>, 
    videoId: string | number
  ) => {
    const video = event.target as HTMLVideoElement;
    const errorKey = `${videoId}_${video.src}`;
    
    // 获取当前错误次数
    const errorCount = videoErrorCounts.get(errorKey) || 0;
    
    // 如果错误次数超过2次，显示占位符并停止重试
    if (errorCount >= 2) {
      console.error('❌ 视频加载失败次数过多，停止重试:', video.src);
      video.style.display = 'none';
      if (video.parentElement) {
        video.parentElement.innerHTML = `
          <div class="w-full h-full bg-gray-900 rounded flex items-center justify-center text-gray-400">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <p class="text-sm">视频加载失败</p>
            </div>
          </div>
        `;
      }
      return;
    }
    
    // 增加错误计数
    videoErrorCounts.set(errorKey, errorCount + 1);
    
    // 只有在第一次错误时才尝试重新获取token
    if (errorCount === 0) {
      console.warn(`视频加载失败，尝试重新获取token: ${video.src}`);
    }
  }, []);

  /**
   * 智能清除视频缓存状态 - 只清除错误状态，保留token缓存
   */
  const clearVideoErrorStates = useCallback(() => {
    videoLoadingStates.clear();
    videoErrorCounts.clear();
    console.log('🧹 清除视频错误状态');
  }, []);

  /**
   * 强制清除所有视频缓存（谨慎使用）
   */
  const forceCleanVideoCache = useCallback(() => {
    videoTokensCache.clear();
    videoLoadingStates.clear();
    videoErrorCounts.clear();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(VIDEO_CACHE_KEY);
      sessionStorage.removeItem(VIDEO_CACHE_EXPIRES_KEY);
    }
    setCacheSize(0);
    console.log('🧹 强制清除所有视频缓存');
  }, []);

  /**
   * 获取视频缓存统计信息
   */
  const getVideoCacheStats = useCallback(() => {
    return {
      tokenCacheSize: videoTokensCache.size,
      loadingStatesSize: videoLoadingStates.size,
      errorCountsSize: videoErrorCounts.size,
      cacheHitRate: videoTokensCache.size > 0 ? 
        (videoTokensCache.size / (videoTokensCache.size + videoLoadingStates.size)) * 100 : 0
    };
  }, []);

  return {
    // 核心函数
    getVideoWithToken,
    getVideoNameFromUrl,
    initializeSingleVideoUrl,
    handleVideoError,
    clearVideoErrorStates,
    forceCleanVideoCache,
    getVideoCacheStats,
    
    // 缓存管理
    saveVideoCache,
    restoreVideoCache,
    
    // 状态（最小化，为RSC准备）
    cacheSize
  };
}; 