import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "@remix-run/react";

interface IndexPageOptimizerProps {
  userId?: string;
}

// 客户端缓存管理
class IndexPageCache {
  private static instance: IndexPageCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new IndexPageCache();
    }
    return this.instance;
  }
  
  set(key: string, data: any, ttl: number = 300000) { // 默认5分钟TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  // 预热缓存
  preload(key: string, fetcher: () => Promise<any>, ttl?: number) {
    if (!this.get(key)) {
      fetcher().then(data => {
        this.set(key, data, ttl);
      }).catch(error => {
        console.warn(`Failed to preload ${key}:`, error);
      });
    }
  }
}

export function IndexPageOptimizer({ userId }: IndexPageOptimizerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const cache = IndexPageCache.getInstance();
  const hasOptimized = useRef(false);

  useEffect(() => {
    // 只在首次加载时执行优化
    if (hasOptimized.current) return;
    hasOptimized.current = true;

    const optimizeIndexPage = async () => {
      try {
        // 1. 预热关键数据缓存
        if (userId) {
          cache.preload('user-permissions', async () => {
            const response = await fetch('/api/user-permissions', {
              headers: { 'Cache-Control': 'max-age=300' }
            });
            return response.json();
          }, 300000); // 5分钟缓存
        }

        // 2. 预加载关键资源
        const criticalResources = [
          '/favicon.ico',
          '/chat',
          '/game', 
          '/music'
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = resource;
          document.head.appendChild(link);
        });

                  // 3. 预连接到关键服务
          const criticalOrigins = [
            'https://supabase.co'
          ];

        criticalOrigins.forEach(origin => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = origin;
          document.head.appendChild(link);
        });

        // 4. 启用Service Worker缓存（如果支持）
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
          try {
            await navigator.serviceWorker.register('/sw.js');
          } catch (error) {
            console.log('Service Worker registration failed:', error);
          }
        }

        // 5. 智能内存管理
        const handleMemoryPressure = () => {
          // 使用类型断言处理 performance.memory
          const perfMemory = (performance as any).memory;
          if (perfMemory && perfMemory.usedJSHeapSize > 50 * 1024 * 1024) {
            cache.clear();
            console.log('Memory pressure detected, cleared cache');
          }
        };

        // 监听内存压力
        if ('memory' in performance) {
          setInterval(handleMemoryPressure, 30000);
        }

      } catch (error) {
        console.warn('Index page optimization failed:', error);
      }
    };

    // 延迟执行优化，不阻塞初始渲染
    const timeoutId = setTimeout(optimizeIndexPage, 100);
    
    return () => clearTimeout(timeoutId);
  }, [userId, cache]);

  // 页面可见性优化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && location.pathname === '/') {
        // 页面重新可见且在首页时，预取最新数据
        const lastFetch = cache.get('last-index-fetch');
        if (!lastFetch || Date.now() - lastFetch > 30000) { // 30秒内不重复预取
          fetch('/', { 
            method: 'GET',
            headers: { 'Cache-Control': 'max-age=60' }
          }).then(() => {
            cache.set('last-index-fetch', Date.now(), 60000);
          }).catch(() => {
            // 忽略预取失败
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname, cache]);

  // 返回键优化
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.optimized) {
        // 这是一个优化过的导航，使用缓存数据
        const cachedData = cache.get('index-page-data');
        if (cachedData) {
          // 可以在这里使用缓存数据快速渲染
          console.log('Using cached data for navigation');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [cache]);

  return null; // 这是一个纯优化组件，不渲染任何内容
}

// 导出缓存实例供其他组件使用
export { IndexPageCache }; 