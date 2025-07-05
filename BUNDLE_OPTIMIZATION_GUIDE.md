## 1. Remix-专向清单：进阶补完

| 范畴 | 检查点 | 一句理由 | 可用工具 |
|------|--------|----------|-----------|
| 路由拆包 | `route.toString().length < 25 kB` <br>动态段 **不** 落在顶层 | 避免单一路由巨型 bundle | `remix routes`, `webpack-bundle-analyzer` |
| 数据加载 | `loader` 返回值可序列化 (`JSON.stringify` 无异常) | 防止 `Date`, `Map` 被隐式丢失 | Jest snapshot |
| Mutations | `action` 必须显式校验 → `invariant()` / `zod` | 拦截脏数据 | eslint-plugin-zod |
| 浏览器缓存 | `headers:{ "Cache-Control": "max-age=…" }` 出现频率 ≥ 80 % | 利用 304 / SWR | CodeQL custom query |
| 边缘部署 | `export const config = { runtime: "edge" }` 只在静态 GET 路由使用 | 降低冷启动 | lint rule |
| 错误追踪 | `ErrorBoundary` 内调用 `Sentry.captureException` | 统一栈追踪 | grep & CI |
| 资产策略 | `link[rel*="preload"][as="font"]` ≥ 1 | 首屏文字闪现 | axe + Lighthouse |
| i18n | `useLocale()` / `t()` 不出现在 `loader` | 避免服务端冲突 | eslint rule |
| 表单 | `<Form replace method="post">` 默认加 `replace` | 削减历史栈 | ESLint fixer |
| Suspense | 只对“列表页”包裹 `<Await />` | 滚动作废风险低 | CodeMod + Review |

---

## 2. 通用前端性能/可维护性清单（框架无关）

| 类别 | KPI/阈值 | 核心思路 | 典型工具 |
|------|----------|----------|-----------|
| JS 体积 | ≤ 150 kB gzip 首屏 | 体积＝下载＋解析＋执行 | `source-map-explorer` |
| CSS | ≤ 50 kB gzip；无未使用率>30 % | 样式分区＋按需加载 | `purgecss` |
| 网络 | < 100 req 首屏；< 3 RTT 到 FCP | 合并/懒加载/HTTP2 | Chrome devtools |
| 运行时 | Main Thread Block < 50 ms p95 | 划分微任务/Worker | `Performance Tab` |
| 动画 | 60 fps；JS animation < 100 µs/frame | 只让 CSS 驱动 | `performance.mark()` |
| 可访问性 | Lighthouse A11y ≥ 90 | 把无障碍当 SEO | axe-core |
| 复杂度 | 圈复杂度 < 15；函数 < 75 行 | 可读＞可写 | `plato`, `SonarQube` |
| 依赖 | 依赖树深度 ≤ 5；孤儿包=0 | 失控的 npm 地狱 | `depcruise` |
| 测试 | 行覆盖 ≥ 70 %；E2E 场景关键路径 = 1 | 不追求 100 %，追求关键 | Jest + Playwright |
| 安全 | npm audit 高危=0；XSS 审计通过 | 安全债＝技术债² | Snyk, CodeQL |

---

## 3. “代码优化”方法论（框架可拔插）

1. **Define — 设预算**  
   • FCP ≤ 1 s；LCP ≤ 2.5 s；P75 Error Rate < 0.1 %  
   • Cyclomatic Complexity < 15；PR 通过率 100 %

2. **Instrument — 布探针**  
   • 浏览器：`web-vitals`, `performance.mark()`  
   • Node：`--prof`, `clinic flame`  
   • 数据库：`EXPLAIN`, `pg_stat_statements`

3. **Profile — 抓热点**  
   • 90/10 原则：90 % 性能浪费在 10 % 代码  
   • JS CPU ⇒ React render？SQL latency ⇒ N+1 查询？

4. **Hypothesize — 出假设**  
   • “移除 lodash/cloneDeep 可减 40 kB gzip”  
   • “改用 prepared statements 可降 p95 70 ms”

5. **Optimize — 实施**  
   • 代码层：Inlining / memo / algorithm O(n²)→O(n log n)  
   • 架构层：Edge cache / CQRS / Background jobs

6. **Regress-test — 防倒退**  
   • Playwright + Lighthouse-CI 固化指标  
   • Git hook `pre-push npm run type:check && npm run vitals`

7. **Document — 写 ADR**  
   • 更新 `adr-2024-07-03-remove-lodash.md`  
   • 说明权衡、影响面、回滚方案

遵循 **MAO 循环**（Measure → Analyse → Optimize）而非 “感觉式” 调参。

---

## 4. 典型反模式速查

| 反模式 | 现象 | 替代策略 |
|--------|------|----------|
| GIGANTIC COMPONENT | 单文件 600 行、五个 `useEffect` | 分粒度、搬逻辑到 `loader`  `action` |
| DATA-MISSING-CACHE | 每次导航全量 fetch `/api/posts` | Stale-While-Revalidate + partial hydration |
| BLIND IMPORT | `import _ from 'lodash'` | `import debounce from 'lodash/debounce'` or `radash` |
| CSS CHAOS | 80% 选择器未命中 | 原子类、CSS-in-JS 或 Tailwind purge |
| PROMISE-HELL | `await Promise.all([...]).then(...)` 勾连 | async/await + error boundary |
| LEAKED STATE | `window.__data = ...` 调试遗留 | Devtools / Redux DevTools plugin |

---

## 5. 端到端优化示例（伪代码版）

```ts
// Before
export async function loader() {
  const posts = await db.post.findMany();          // 300 rows
  return json({ posts });
}

// After
export async function loader({ request }) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const posts = await redisCache(
    `posts:p${page}`,                               // key
    () => db.post.findMany({                        // origin
          take: 20, skip: (page - 1) * 20,
          select: { id: true, title: true }         // 列裁剪
    }),
    60                                              // ttl seconds
  );
  return defer({ posts, page });                    // 流式
}
```

结果：  
• 首屏传输 `≈ 3 kB` → `≈ 27 kB`  
• p95 TTFB 320 ms → 62 ms  
• 用户感知 LCP 2.9 s → 1.2 s

---

## 6. 把 Checklist ➜ 自动化

1. **静态分析**：ESLint / SonarQube rule 覆盖 70 % 清单  
2. **持续度量**：Lighthouse-CI + Web-Vitals RUM 满足预算  
3. **管控流程**：Danger.js / GitHub Actions 阻止回归  
4. **人工审计**：双周 Review，聚焦无法自动化的架构决策

> 最佳状态：机器做重复判断，人类做价值判断。

---

### 结语

• **清单** ＝ 显性知识  
• **度量** ＝ 反馈循环  
• **文档** ＝ 组织记忆  

让这三者闭环，AI 与人协作的项目才能在复杂度螺旋中保持可控、可演进、可优化。祝你把 Remix 或任何栈都写出“久经风霜仍清爽”的质感。
