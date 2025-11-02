2. RoutePreloader.tsx (173 行)
过度设计表现:

配置参数过多:
interface RoutePreloaderProps {
  routes?: string[];           // 1
  priority?: 'high' | 'low';   // 2
  preloadIndexData?: boolean;  // 3
  delay?: number;              // 4
  enableErrorHandling?: boolean; // 5
}
5 个参数 = 2^5 = 32 种可能的组合! 太复杂了!

手动创建 Link 元素:
// Line 31-50: 手动操作 DOM
const link = document.createElement('link');
link.rel = 'prefetch';
link.href = route;
document.head.appendChild(link);
但 Remix 已经提供了:

<Link to="/chat" prefetch="intent" /> // 鼠标悬停时预加载
<Link to="/game" prefetch="render" /> // 渲染时预加载
为什么 Remix 的方案更好:

框架知道路由系统,预加载更精准
自动处理错误
不需要手动操作 DOM
简化建议: 删除 RoutePreloader,在 Header 组件的导航链接上添加 prefetch="intent"

3. useImageToken Hook (451 行!)
过度设计的功能:

sessionStorage 持久化 (Line 32-86)

实现了手动缓存保存/恢复
但浏览器已经会缓存 HTTP 响应!
去重请求 Map (Line 166-243)

防止同时请求相同 token
但可以用简单的 Promise 缓存
错误计数器 (Line 132-148)

跟踪每个图片的错误次数
但 3 次重试逻辑可以更简单实现
Intersection Observer 集成 (Line 344-397)

混合了懒加载逻辑
应该拆分到独立 Hook
451 行可以缩减到多少? 估计 150-200 行,通过:

移除 sessionStorage 逻辑(用 HTTP 缓存)
简化错误处理
拆分 Intersection Observer 到 useLazyLoad Hook
4. 服务端缓存内存管理 (server-cache.ts)
问题代码 (Line 191-210):

if (heapUsedMB > 100) {
  const itemsToDelete = Math.floor(this.cache.size / 2);
  let deleted = 0;
  
  for (const key of this.cache.keys()) {
    if (deleted >= itemsToDelete) break;
    this.cache.delete(key);
    deleted++;
  }
}
问题:

固定 100MB 阈值 - 但服务器内存可能是 512MB 或 8GB
删除顺序是任意的,不是 LRU (最少使用)
一次删除 50% 太激
