/*
  Universal wrapper for useImageToken hook.
  – 在浏览器环境调用真正的 useImageToken.client 实现。
  – 在 Node/SSR 环境返回安全的 no-op stub，避免访问 window。
*/

import { useImageToken as useImageTokenClient } from "./useImageToken.client";
import type { ImageData } from "./useImageToken.client";

// 浏览器环境：直接导出真实实现
// SSR：导出降级 stub，字段保持一致，防止 undefined 错误

export const useImageToken: typeof useImageTokenClient =
  typeof window !== "undefined"
    ? useImageTokenClient
    : () => ({
        // 与真实现形状保持一致，返回尽可能简单的占位实现
        getImageWithToken: async (url: string) => url,
        getImageNameFromUrl: (url: string | null) => url ?? "",
        initializeImageUrls: async (
          imgs: ImageData[],
          setImgs: (imgs: ImageData[]) => void
        ) => {
          setImgs(imgs);
        },
        initializeSingleImageUrl: async (src: string) => src,
        handleImageError: () => {},
        clearImageErrorStates: () => {},
        forceCleanCache: () => {},
        getCacheStats: () => ({ 
          tokenCacheSize: 0,
          loadingStatesSize: 0,
          errorCountsSize: 0,
          cacheHitRate: 0
        }),
        createImageObserver: () => null,
        cacheSize: 0,
      });

export type { ImageData }; 