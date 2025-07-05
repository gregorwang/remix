`markdown
#  Remix 开发规范文档（React 19 升级路径指南）

本项目遵循 Remix 最新架构规范，并准备向 React Router v7 和 React 19 迁移。<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference> **开发目标是充分发挥 Remix 的性能特性，同时为未来的技术栈升级做好准备。**

请确保以下要求被严格执行：

---

## 🚀 React 19 & React Router v7 迁移准备

### 升级路径概述

根据 Remix 官方路线图：<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>
- **Remix v2 → React Router v7**：非破坏性升级
- **React Router v7** 将包含当前 Remix 的所有功能
- **未来的 Remix**（代号 "Reverb"）将基于 React 19 RSC 重新设计
- 支持渐进式迁移，新旧版本可并行运行

### 当前开发策略

1. **保持 Future Flags 更新**：确保使用最新的 Remix v2 future flags
2. **遵循标准模式**：使用标准的 loader/action 模式，便于未来迁移
3. **准备 RSC 兼容**：避免过度依赖客户端状态管理
4. **Vite 插件优先**：当前 Remix 本质上是 React Router + Vite 插件<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>

### 新特性预览

React Router v7 将带来：<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>
- **React Server Components (RSC)**
- **Server Actions**
- **静态预渲染**
- **增强的类型安全**
- **React 18 和 React 19 双重支持**

---

##  必须使用 Remix 的三大性能机制

### 1. 路由级数据加载（loader/action）

- 所有页面都必须使用 `loader()` 提前获取数据，而不是客户端 useEffect。
- 表单提交必须使用 `<Form method="post">` 和 `action()` 实现，而不是手动 fetch。
- 所有数据加载必须是 SSR 优先，不能依赖客户端 JS。

 示例：

```ts
export async function loader({ params }) {
  const data = await fetchData()
  return json(data)
}
```

---

### 2. 标准 HTTP 缓存控制

- 所有 `loader()` 和 `action()` 的返回必须支持 `Cache-Control` 或其他 HTTP 缓存头。
- 重要的接口必须能被浏览器和 CDN 缓存。

 示例：

```ts
return json(data, {
  headers: {
    "Cache-Control": "max-age=60, stale-while-revalidate=300"
  }
})
```

---

### 3. 渐进增强支持（Progressive Enhancement）

- 所有表单必须使用 `<Form>` 组件，避免 JS-only 提交逻辑。
- 所有页面跳转必须使用 `<Link>`，并支持无 JS 情况下能正常工作。
- 不允许在页面中依赖 `useEffect` 进行首次数据加载。

---

## 🧱 额外结构要求

- 所有页面必须使用 Remix 的嵌套路由系统，将布局与页面解耦。
- 不允许将所有逻辑塞进 `root.tsx`，应该按 Remix 的约定分层组织。
- 组件逻辑分离，但业务逻辑应靠 loader/action 完成，不靠前端状态管理。

---

##  不允许的做法（反模式）

-  所有数据都写在组件内部的 useEffect 中
-  表单用 HTML 原生 `<form>` 手动绑定 fetch
-  没有设置 HTTP 缓存头的 loader
-  所有逻辑都集中写在 `app/root.tsx`
-  页面依赖 JS 才能正常工作

---

## 🚀 Remix 2024 新特性 & React 19 准备

> 本节依据 Remix 官方文档 `v2.16.x`、React Router v7 路线图以及社区最佳实践整理，供后续 AI 代码生成时参考。<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>

### 1. 文件路由命名约定（Nested Routes）
- 目录即路由，使用 `.` 表示布局边界，例如 `routes/dashboard._index.tsx`。
- 动态段使用 `$param.tsx`；可选段使用 `($param).tsx`。
- 在布局路由中导出 `links`, `meta`, `loader`, `action` 仅影响当前层级及其子路由。

### 2. `LinksFunction` 与资源优化
- 在每个路由导出 `links()` 并返回 `preload`/`prefetch` link，避免内联 `<style>`。
```ts
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => [
  { rel: "preload", as: "image", href: heroImg },
  { rel: "stylesheet", href: styles },
];
```

### 3. 数据 Streaming (`defer`) & Suspense
- 在 `loader` 中使用 `defer()` 返回慢数据，SSR 首帧立即发送，慢数据用 `<Await>` 兜底。
```ts
export async function loader() {
  return defer({ user: getUser(), stats: getStatsSlow() });
}
```

### 4. `<Link prefetch="intent">`
- 为所有导航链接添加 `prefetch="intent"`，让 Remix 在 hover/触摸时并行拉取目标路由代码 & 数据。

### 5. Error & Catch Boundaries
- 每个路由都应导出 `ErrorBoundary`／`CatchBoundary`，返回 `<StatusHandler>` 或自定义 UI，防止整站白屏。

### 6. `.client.tsx / .server.ts` 分离
- 重型动画或仅客户端依赖放在 `xxx.client.tsx`，并使用动态 `import()`；Node-only 逻辑放 `xxx.server.ts`，避免被打进浏览器包。

### 7. Remix ⇄ React 18 Streaming 协议
- 切勿在组件内使用 `fetch()` 触发额外网络请求，会破坏流式响应；数据应该全部在 `loader()` 中准备。

### 8. HTTP 缓存示例更新
```ts
return json(data, {
  headers: {
    "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  },
});
```

### 9. TypeScript 严格模式
- `tsconfig.json` 需开启 `strict`, `noImplicitAny`, `isolatedModules`，保证 AI 生成代码可即时被 ESLint/TS 报错捕获。

### 10. Vite 构建
- 在 `vite.config.ts` 使用 `remix()` 插件官方 preset，自动处理 HMR 与生产 chunk-split，无需手写 `react()` 插件。
- 为 React Router v7 迁移做准备，Vite 插件将成为核心特性<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>

### 11. Future Flags 配置
- 启用所有当前可用的 future flags，确保平滑升级到 React Router v7：
```ts
// remix.config.js
export default {
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
};
```

### 12. RSC 准备模式
- 减少客户端状态依赖，为 React Server Components 做准备
- 数据获取逻辑集中在 loader 中，避免复杂的客户端状态管理
- 组件保持纯函数特性，便于未来 RSC 迁移

### 13. 渐进式升级策略
- 当 React Router v7 发布时，可以无缝升级（非破坏性）<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>
- 未来 Remix "Reverb" 版本可与当前版本并行运行
- 支持按路由渐进式迁移到新架构

---

## 📋 迁移检查清单

### 当前阶段（Remix v2）
- [ ] 所有 future flags 已启用
- [ ] 使用标准 loader/action 模式
- [ ] HTTP 缓存策略已实施
- [ ] 渐进增强已实现
- [ ] TypeScript 严格模式已开启

### React Router v7 准备
- [ ] 代码符合当前最佳实践
- [ ] 无破坏性依赖
- [ ] Vite 配置标准化
- [ ] 类型安全覆盖完整

### 未来 RSC 准备
- [ ] 最小化客户端状态
- [ ] 组件纯函数化
- [ ] 服务端优先数据流
- [ ] 静态预渲染兼容

---

> **执行要求**：后续所有 PR/自动化改动必须严格遵循本文件规则，CI 将对 `loader`、`links`、`Cache-Control`、future flags 等要点做静态检查。违反规则的代码将被拒绝合并。
> 
> **升级提醒**：密切关注 React Router v7 发布动态，准备进行无缝升级。<mcreference link="https://remix.run/blog/incremental-path-to-react-19" index="0">0</mcreference>

`markdown
#  Remix Migration 说明文档（必须遵循 Remix 的性能架构）

本项目是从 Nuxt3 项目迁移到 Remix。**转换目标不仅是代码语法匹配，更重要的是充分发挥 Remix 的三大性能特性。**

请确保以下要求被严格执行：

---

##  必须使用 Remix 的三大性能机制

### 1. 路由级数据加载（loader/action）

- 所有页面都必须使用 `loader()` 提前获取数据，而不是客户端 useEffect。
- 表单提交必须使用 `<Form method="post">` 和 `action()` 实现，而不是手动 fetch。
- 所有数据加载必须是 SSR 优先，不能依赖客户端 JS。

 示例：

```ts
export async function loader({ params }) {
  const data = await fetchData()
  return json(data)
}
```

---

### 2. 标准 HTTP 缓存控制

- 所有 `loader()` 和 `action()` 的返回必须支持 `Cache-Control` 或其他 HTTP 缓存头。
- 重要的接口必须能被浏览器和 CDN 缓存。

 示例：

```ts
return json(data, {
  headers: {
    "Cache-Control": "max-age=60, stale-while-revalidate=300"
  }
})
```

---

### 3. 渐进增强支持（Progressive Enhancement）

- 所有表单必须使用 `<Form>` 组件，避免 JS-only 提交逻辑。
- 所有页面跳转必须使用 `<Link>`，并支持无 JS 情况下能正常工作。
- 不允许在页面中依赖 `useEffect` 进行首次数据加载。

---

## 🧱 额外结构要求

- 所有页面必须使用 Remix 的嵌套路由系统，将布局与页面解耦。
- 不允许将所有逻辑塞进 `root.tsx`，应该按 Remix 的约定分层组织。
- 组件逻辑分离，但业务逻辑应靠 loader/action 完成，不靠前端状态管理。

---

##  不允许的做法（反模式）

-  所有数据都写在组件内部的 useEffect 中
-  表单用 HTML 原生 `<form>` 手动绑定 fetch
-  没有设置 HTTP 缓存头的 loader
-  所有逻辑都集中写在 `app/root.tsx`
-  页面依赖 JS 才能正常工作

---

## 🚀 Remix 2024 新特性 & 必知注意点

> 本节依据 Remix 官方文档 `v2.16.x` 以及社区最佳实践整理，供后续 AI 代码生成时参考。

### 1. 文件路由命名约定（Nested Routes）
- 目录即路由，使用 `.` 表示布局边界，例如 `routes/dashboard._index.tsx`。
- 动态段使用 `$param.tsx`；可选段使用 `($param).tsx`。
- 在布局路由中导出 `links`, `meta`, `loader`, `action` 仅影响当前层级及其子路由。

### 2. `LinksFunction` 与资源优化
- 在每个路由导出 `links()` 并返回 `preload`/`prefetch` link，避免内联 `<style>`。
```ts
import type { LinksFunction } from "@remix-run/node";
export const links: LinksFunction = () => [
  { rel: "preload", as: "image", href: heroImg },
  { rel: "stylesheet", href: styles },
];
```

### 3. 数据 Streaming (`defer`) & Suspense
- 在 `loader` 中使用 `defer()` 返回慢数据，SSR 首帧立即发送，慢数据用 `<Await>` 兜底。
```ts
export async function loader() {
  return defer({ user: getUser(), stats: getStatsSlow() });
}
```

### 4. `<Link prefetch="intent">`
- 为所有导航链接添加 `prefetch="intent"`，让 Remix 在 hover/触摸时并行拉取目标路由代码 & 数据。

### 5. Error & Catch Boundaries
- 每个路由都应导出 `ErrorBoundary`／`CatchBoundary`，返回 `<StatusHandler>` 或自定义 UI，防止整站白屏。

### 6. `.client.tsx / .server.ts` 分离
- 重型动画或仅客户端依赖放在 `xxx.client.tsx`，并使用动态 `import()`；Node-only 逻辑放 `xxx.server.ts`，避免被打进浏览器包。

### 7. Remix ⇄ React 18 Streaming 协议
- 切勿在组件内使用 `fetch()` 触发额外网络请求，会破坏流式响应；数据应该全部在 `loader()` 中准备。

### 8. HTTP 缓存示例更新
```ts
return json(data, {
  headers: {
    "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  },
});
```

### 9. TypeScript 严格模式
- `tsconfig.json` 需开启 `strict`, `noImplicitAny`, `isolatedModules`，保证 AI 生成代码可即时被 ESLint/TS 报错捕获。

### 10. Vite 构建
- 在 `vite.config.ts` 使用 `remix()` 插件官方 preset，自动处理 HMR 与生产 chunk-split，无需手写 `react()` 插件。

---

> **执行要求**：后续所有 PR/自动化改动必须严格遵循本文件规则，CI 将对 `loader`、`links`、`Cache-Control` 等要点做静态检查。若违反将拒绝合并。
