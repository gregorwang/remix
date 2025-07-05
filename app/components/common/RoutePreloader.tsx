import { useEffect } from "react";
import { Link } from "@remix-run/react";

interface RoutePreloaderProps {
  routes?: string[];
  priority?: 'high' | 'low';
  // 新增：预取首页数据的选项
  preloadIndexData?: boolean;
}

export function RoutePreloader({ 
  routes = ['/chat', '/game', '/music'], 
  priority = 'low',
  preloadIndexData = false 
}: RoutePreloaderProps) {
  useEffect(() => {
    // 延迟预加载，避免阻塞当前页面
    const timeoutId = setTimeout(() => {
      routes.forEach(route => {
        // 预加载路由
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });

      // 预取首页数据 - 帮助用户快速返回首页
      if (preloadIndexData) {
        const indexLink = document.createElement('link');
        indexLink.rel = 'prefetch';
        indexLink.href = '/';
        document.head.appendChild(indexLink);

        // 预加载首页关键资源
        const resourcesPreload = [
          { href: '/favicon.ico', as: 'image' },
          { href: '/build/assets/index-route.css', as: 'style' }
        ];

        resourcesPreload.forEach(({ href, as }) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = href;
          link.as = as;
          document.head.appendChild(link);
        });
      }
    }, priority === 'high' ? 100 : 1000);

    return () => clearTimeout(timeoutId);
  }, [routes, priority, preloadIndexData]);

  return null;
}

// 默认路由预加载器 - 用于首页
export function DefaultRoutePreloader() {
  return <RoutePreloader routes={['/chat', '/game', '/music']} priority="low" />;
}

// 子页面路由预加载器 - 用于子页面，预加载首页
export function SubPageRoutePreloader() {
  return <RoutePreloader 
    routes={['/', '/chat', '/game', '/music']} 
    priority="low" 
    preloadIndexData={true}
  />;
}