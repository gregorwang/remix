# Remix 项目治理清单与自动化护栏（深度版）

## 1. 代码审计清单（深度版）

> **建议：**  
> 每两周进行一次「架构盘点」会议，将下列表格打印出来，逐项打  / 。如发现 ，立即开 issue 跟进。

| 维度         | 检查点                                                                                                                                                                                                  | 典型工具 / 方法                        |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| 路由结构     | 1. 所有动态段都用 `$param.tsx` 而不是 `:param` 或模糊 catch-all<br>2. 嵌套路由层级 ≤ 3                                                                           | `remix routes` CLI 输出 / 目测        |
| 数据加载     | 1. `loader` / `action` 只做 I/O，不做纯算法<br>2. 每个 `loader` 都有显式 `json({…}, { headers })`，利用浏览器缓存                                                  | CodeQL / AST grep                     |
| 组件设计     | 1. `useLoaderData` 不下穿两层以上<br>2. 使用 `<Suspense>` / `defer()` 时有 fallback UI                                                                             | Storybook / eslint-plugin-remix        |
| 资源预取     | 1. `<Link prefetch="intent">` 存在且仅在首层导航使用<br>2. 路由组件内无多余 `prefetch`，避免浪费带宽                                                              | Playwright hover 测试                  |
| 可访问性     | 1. 所有交互元素 `role`、`aria-*` 完整<br>2. 颜色对比度 ≥ 4.5:1                                                                                                  | axe DevTools / jest-axe                |
| 性能预算     | 1. 首次 JS payload ≤ 150 kB gzip<br>2. `Largest Contentful Paint` ≤ 2.5 s (95th percentile)                                                                      | Lighthouse-CI                          |
| 安全         | 1. `action`/`loader` 严格校验用户输入（zod, yup）<br>2. 无 `any` 绕过 TS 类型                                                                                    | eslint-plugin-security                 |
| 依赖治理     | 1. 仅在 `root.tsx` 引入 polyfill<br>2. 没有「只用 1 个函数」却引入整包（lodash-es → lodash.pick）                                                                 | `import-cost`, `webpack-bundle-analyzer`|
| 错误边界     | 1. 每个路由文件都有 `ErrorBoundary` 导出<br>2. `Boundary` 内部日志上报（Sentry 等）                                                                               | grep `'export function ErrorBoundary'` |
| 文档 & ADR   | 1. `docs/adr-XXXX-*.md` 跟随改动更新<br>2. Readme 中更新时间 < 14 d                                                                                              | md-lint                                |
Remix `loader` 是否只做数据，不做业务逻辑？  
- [ ] `<Link prefetch="intent">` 是否仍在？  
- [ ] 路由拆分是否引入了重复 bundle？  
- [ ] 依赖树里有无只为一个小函数而引入的大库？  

> **落地建议**  
> - 将这些检查项写成 GitHub Issue 模板或 Notion CheckList，每轮审计复用。

---

## 2. 自动化护栏（Guardrails）

### 2.1 Lint / Type / Test 三板斧

#### 1. ESLint + TypeScript

安装依赖：

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-remix
