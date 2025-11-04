# Remix 最佳实践快速参考

## 🎯 核心原则

> Remix 已经在**路由级别**自动进行代码分割，不需要手动使用 `React.lazy()`

---

## 📁 文件结构

```
app/
├── routes/
│   └── music.tsx              # ✅ 路由 + loader + clientLoader + HydrateFallback
├── components/
│   └── music/
│       └── MusicPageClient.client.tsx  # ✅ 客户端组件（.client.tsx 后缀）
├── hooks/
│   └── useMusicAnimations.client.ts    # ✅ 客户端 hook（.client.ts 后缀）
└── utils/
    └── imageToken.server.ts            # ✅ 服务端工具（.server.ts 后缀）
```

---

## 🚀 路由文件标准模板

```tsx
// app/routes/your-route.tsx
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// ✅ 直接导入，不使用 lazy()
import YourPageClient from '~/components/YourPageClient.client';

// 1️⃣ Links
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: yourStyles },
  { rel: 'preload', href: '/important-image.jpg', as: 'image' }, // 预加载关键资源
];

// 2️⃣ Meta
export const meta: MetaFunction = () => [
  { title: 'Your Page Title' },
  { name: 'description', content: 'Your page description' },
];

// 3️⃣ Server Loader
export async function loader() {
  const data = await fetchYourData();
  
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600", // 1小时缓存
    }
  });
}

// 4️⃣ Client Loader（可选，用于缓存）
export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const CACHE_KEY = 'your-page-data';
  const CACHE_VERSION = 'v1';
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  try {
    const cachedItem = sessionStorage.getItem(CACHE_KEY);
    
    if (cachedItem) {
      const { data, timestamp, version } = JSON.parse(cachedItem);
      if (version === CACHE_VERSION && Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('读取缓存失败:', error);
  }

  const serverData = await serverLoader();

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      data: serverData,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }));
  } catch (error) {
    console.warn('保存缓存失败:', error);
  }

  return serverData;
}
clientLoader.hydrate = true;

// 5️⃣ Hydration Fallback
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
}

// 6️⃣ 主组件
export default function YourRoute() {
  const data = useLoaderData<typeof loader>();
  return <YourPageClient {...data} />;
}
```

---

## 🎨 客户端组件标准模板

```tsx
// app/components/YourPageClient.client.tsx
import { useRef, useEffect, useState } from 'react';
import type { loader } from '~/routes/your-route';
import type { SerializeFrom } from '@remix-run/node';

type LoaderData = SerializeFrom<typeof loader>;

export default function YourPageClient(loaderData: LoaderData) {
  // ✅ 确保只在客户端运行
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 你的组件逻辑...
  
  return (
    <div>
      {/* 你的 JSX */}
    </div>
  );
}
```

---

## ⚡ 动画最佳实践

### ✅ 正确的做法

```tsx
// 1. 明确指定动画属性
<button className="
  transition-transform duration-300 ease-expo-out
  hover:-translate-y-0.5
  active:translate-y-0
">

// 2. 使用 Expo Out 缓动
<div className="transition-opacity duration-600 ease-expo-out">

// 3. 添加 GPU 加速
<img className="
  transition-transform duration-300 ease-expo-out
  hover:scale-110
  transform-gpu
">

// 4. 多个属性
<div className="
  transition-[background-color,transform] 
  duration-300 ease-expo-out
">
```

### ❌ 避免的做法

```tsx
// ❌ 不要使用 transition-all
<div className="transition-all duration-300">

// ❌ 不要使用错误的时长
<div className="transition-transform duration-500">  // 应该用 300 或 600

// ❌ 不要忘记缓动函数
<div className="transition-transform duration-300">  // 缺少 ease-expo-out

// ❌ 不要动画会触发重排的属性
<div className="transition-[width,height]">  // 应该用 transform: scale()
```

---

## 🎯 动画时长选择

```tsx
// 300ms - 微交互
<button className="transition-transform duration-300 ease-expo-out">

// 600ms - 展开动画
<div className="transition-[opacity,transform] duration-600 ease-expo-out">
```

---

## ♿ 可访问性

### 全局设置（已添加到 `app/tailwind.css`）

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  
  /* 保留必要的动画 */
  .animate-spin {
    animation-duration: 1s !important;
  }
}
```

---

## 🚫 常见错误

### 1. 使用 React.lazy()

❌ **错误**:
```tsx
const MyComponent = lazy(() => import('./MyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <MyComponent />
</Suspense>
```

✅ **正确**:
```tsx
import MyComponent from './MyComponent';

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Route() {
  return <MyComponent />;
}
```

---

### 2. 忘记 .client.tsx 后缀

❌ **错误**:
```tsx
// app/components/MyComponent.tsx
import { useState } from 'react';

// 可能包含浏览器特定代码
```

✅ **正确**:
```tsx
// app/components/MyComponent.client.tsx
import { useState } from 'react';

// 明确标记为客户端组件
```

---

### 3. 没有缓存策略

❌ **错误**:
```tsx
export async function loader() {
  return json(data);  // 没有 Cache-Control
}
```

✅ **正确**:
```tsx
export async function loader() {
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    }
  });
}

// 可选：添加 clientLoader 进行客户端缓存
export async function clientLoader({ serverLoader }) {
  // 实现缓存逻辑
}
```

---

### 4. 使用 transition-all

❌ **错误**:
```tsx
<div className="transition-all duration-300">
```

✅ **正确**:
```tsx
<div className="transition-transform duration-300 ease-expo-out">
<div className="transition-[opacity,transform] duration-300 ease-expo-out">
```

---

## 📊 性能优化清单

- [ ] ✅ 使用 `HydrateFallback` 替代 `Suspense`
- [ ] ✅ 移除 `React.lazy()`
- [ ] ✅ 添加 `clientLoader` 缓存
- [ ] ✅ 服务端响应添加 `Cache-Control`
- [ ] ✅ 使用 `.client.tsx` / `.server.ts` 后缀
- [ ] ✅ 只动画 `transform` 和 `opacity`
- [ ] ✅ 使用 `transform-gpu` 类
- [ ] ✅ 添加 `prefers-reduced-motion` 支持
- [ ] ✅ 图片使用 `loading="lazy"`
- [ ] ✅ 关键图片使用 `fetchPriority="high"`

---

## 🔧 调试技巧

### 检查缓存是否工作

```tsx
export async function clientLoader({ serverLoader }) {
  // 添加日志
  console.log('🔍 clientLoader 运行');
  
  if (cachedData) {
    console.log('✅ 使用缓存数据');
  } else {
    console.log('📡 从服务器加载');
  }
}
```

### 检查 hydration

```tsx
export default function YourComponent() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    console.log('✅ 客户端 hydration 完成');
    setIsClient(true);
  }, []);
}
```

---

## 📚 相关资源

- [Remix v2 文档](https://v2.remix.run)
- [Client Data Guide](https://v2.remix.run/docs/guides/client-data)
- [设计系统 - 动画](./design-system/06-animation.md)
- [Music Page 重构案例](./MUSIC_PAGE_REFACTORING.md)

---

**保持这些最佳实践，构建更快、更好的 Remix 应用！🚀**

