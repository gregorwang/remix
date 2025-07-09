import { useEffect } from "react";
import { Link } from "@remix-run/react";

interface RoutePreloaderProps {
  routes?: string[];
  priority?: 'high' | 'low';
  // 新增：预取首页数据的选项
  preloadIndexData?: boolean;
  // 新增：延迟时间配置
  delay?: number;
  // 新增：是否启用错误处理
  enableErrorHandling?: boolean;
}

export function RoutePreloader({ 
  routes = ['/chat', '/game', '/music'], 
  priority = 'low',
  preloadIndexData = false,
  delay,
  enableErrorHandling = true
}: RoutePreloaderProps) {
  useEffect(() => {
    // 计算延迟时间
    const delayTime = delay ?? (priority === 'high' ? 100 : 2000); // 增加默认延迟到2秒
    
    // 延迟预加载，避免阻塞当前页面
    const timeoutId = setTimeout(() => {
      routes.forEach(route => {
        try {
          // 预加载路由
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          
          // 添加错误处理
          if (enableErrorHandling) {
            link.onerror = () => {
              console.warn(`[RoutePreloader] Failed to prefetch route: ${route}`);
              // 移除失败的 link 元素
              if (link.parentNode) {
                link.parentNode.removeChild(link);
              }
            };
            
            link.onload = () => {
              console.log(`[RoutePreloader] Successfully prefetched route: ${route}`);
            };
          }
          
          document.head.appendChild(link);
        } catch (error) {
          console.warn(`[RoutePreloader] Error creating prefetch link for ${route}:`, error);
        }
      });

      // 预取首页数据 - 帮助用户快速返回首页
      if (preloadIndexData) {
        try {
          const indexLink = document.createElement('link');
          indexLink.rel = 'prefetch';
          indexLink.href = '/';
          
          if (enableErrorHandling) {
            indexLink.onerror = () => {
              console.warn('[RoutePreloader] Failed to prefetch index page');
            };
          }
          
          document.head.appendChild(indexLink);

          // 预加载首页关键资源
          const resourcesPreload = [
            { href: '/favicon.ico', as: 'image' },
            { href: '/build/assets/index-route.css', as: 'style' }
          ];

          resourcesPreload.forEach(({ href, as }) => {
            try {
              const link = document.createElement('link');
              link.rel = 'preload';
              link.href = href;
              link.as = as;
              
              if (enableErrorHandling) {
                link.onerror = () => {
                  console.warn(`[RoutePreloader] Failed to preload resource: ${href}`);
                };
              }
              
              document.head.appendChild(link);
            } catch (error) {
              console.warn(`[RoutePreloader] Error preloading resource ${href}:`, error);
            }
          });
        } catch (error) {
          console.warn('[RoutePreloader] Error in index data preloading:', error);
        }
      }
    }, delayTime);

    return () => clearTimeout(timeoutId);
  }, [routes, priority, preloadIndexData, delay, enableErrorHandling]);

  return null;
}

// 默认路由预加载器 - 用于首页（现在使用更长的延迟）
export function DefaultRoutePreloader() {
  return <RoutePreloader 
    routes={['/chat']} 
    priority="low" 
    delay={3000} // 3秒后才预加载，避免影响首页加载
    enableErrorHandling={true}
  />;
}

// 子页面路由预加载器 - 用于子页面，预加载首页
export function SubPageRoutePreloader() {
  return <RoutePreloader 
    routes={['/', '/chat']} 
    priority="low" 
    preloadIndexData={true}
    delay={1000} // 子页面延迟1秒预加载
    enableErrorHandling={true}
  />;
}

// 新增：智能悬停预加载组件
interface HoverPreloadLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: 'intent' | 'render' | 'none';
}

export function HoverPreloadLink({ 
  to, 
  children, 
  className, 
  prefetch = 'intent' 
}: HoverPreloadLinkProps) {
  const handleMouseEnter = () => {
    // 悬停时预加载
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = to;
      
      link.onerror = () => {
        console.warn(`[HoverPreloadLink] Failed to prefetch: ${to}`);
      };
      
      // 检查是否已经存在相同的预加载链接
      const existingLink = document.head.querySelector(`link[rel="prefetch"][href="${to}"]`);
      if (!existingLink) {
        document.head.appendChild(link);
      }
    } catch (error) {
      console.warn(`[HoverPreloadLink] Error prefetching ${to}:`, error);
    }
  };

  return (
    <Link 
      to={to} 
      className={className}
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}