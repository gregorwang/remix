import { useCallback, useRef } from 'react';

export interface LazyLoadOptions {
  /**
   * 提前开始加载的距离（px）
   * @default 50
   */
  rootMargin?: string;
  
  /**
   * 可见性阈值
   * @default 0.1
   */
  threshold?: number;
}

/**
 * 懒加载Hook - 使用 Intersection Observer 实现元素懒加载
 * 拆分自 useMediaToken，专注于懒加载逻辑
 */
export function useLazyLoad(options: LazyLoadOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
  } = options;

  const visibleItemsRef = useRef<Set<string>>(new Set());

  /**
   * 创建 Intersection Observer
   * @param onLoad 当元素可见时触发的回调函数
   * @param dataAttribute 用于识别元素的 data 属性名称
   */
  const createObserver = useCallback((
    onLoad: (element: HTMLElement, itemId: string, itemSrc: string | null) => void | Promise<void>,
    dataAttribute: string = 'data-id'
  ): IntersectionObserver | null => {
    if (typeof window === 'undefined') return null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const itemId = element.getAttribute(dataAttribute);
            const itemSrc = element.getAttribute(dataAttribute.replace('-id', '-src'));

            // 如果已经处理过这个元素，跳过
            if (!itemId || visibleItemsRef.current.has(itemId)) return;

            visibleItemsRef.current.add(itemId);

            // 调用回调函数处理加载逻辑
            try {
              await onLoad(element, itemId, itemSrc);
            } catch (error) {
              console.warn('Lazy load failed:', error);
            }

            // 停止观察这个元素
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    return observer;
  }, [rootMargin, threshold]);

  /**
   * 创建专门用于媒体（图片/视频）的懒加载观察器
   * @param onTokenUrlReady 当获取到token URL时的回调 (src, itemId) => Promise<tokenUrl>
   * @param dataAttribute 用于识别媒体的 data 属性名称
   * @param logPrefix 日志前缀
   */
  const createMediaObserver = useCallback((
    onTokenUrlReady: (src: string, itemId: string) => Promise<string>,
    dataAttribute: string = 'data-media-id',
    logPrefix: string = 'media'
  ): IntersectionObserver | null => {
    return createObserver(
      async (element, itemId, itemSrc) => {
        // 如果需要token验证
        if (itemSrc && !itemSrc.includes('token=')) {
          try {
            const tokenUrl = await onTokenUrlReady(itemSrc, itemId);

            // 根据类型更新元素
            if (element instanceof HTMLImageElement) {
              element.src = tokenUrl;
            } else if (element instanceof HTMLVideoElement) {
              element.src = tokenUrl;
            }
          } catch (error) {
            console.warn(`${logPrefix}懒加载失败 ${itemSrc}:`, error);
          }
        }
      },
      dataAttribute
    );
  }, [createObserver]);

  /**
   * 重置可见项集合（用于重新加载等场景）
   */
  const resetVisibleItems = useCallback(() => {
    visibleItemsRef.current.clear();
  }, []);

  return {
    createObserver,
    createMediaObserver,
    resetVisibleItems,
  };
}

