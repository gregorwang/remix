# Claude 设计系统 - 网格系统 (Grid System)

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-03
- **依赖**: spacing.md (流体间距算法)
- **适配AI工具**: Cursor, Copilot, Continue, Codeium

---

## 📋 概述

一个基于 CSS Grid 的高级流体响应式网格系统，具备流体排版、命名网格线和突破性布局等先进特性。

---

## 🏗️ 核心架构

### 1. 网格基础配置

#### 基本参数

```css
--_grid---column-count: 12                /* 12列网格基础 */
--_grid---gutter: 2rem                    /* 固定间距 32px */
--site--viewport-min: 20                  /* 最小视口 20rem = 320px */
--site--viewport-max: 90                  /* 最大视口 90rem = 1440px */
```

#### 列宽自动计算公式

```css
--_grid---column-width: calc(
  (min(var(--max-width--main), 100% - var(--site--margin) * 2) 
   - (var(--site--gutter) * (var(--site--column-count) - 1)))
  / var(--site--column-count)
)
```

**公式拆解：**

1. 获取容器宽度：`min(最大宽度, 100% - 左右边距)`
2. 减去总间距空间：`间距 × (列数 - 1)`
3. 除以列数得到单列宽度

**优势：** 一次计算，全局使用，完美分配空间

---

### 2. 流体间距系统

#### 响应式边距缩放

```css
--site--margin: clamp(
  2 * 1rem,                                    /* 最小值：32px */
  ((2 - ((4 - 2) / (90 - 20) * 20)) * 1rem     /* 插值计算 */
   + ((4 - 2) / (90 - 20)) * 100vw),
  4 * 1rem                                     /* 最大值：64px */
)
```

**工作原理：**

- 手机端（20rem）：边距 = 2rem（32px）
- 平板端（55rem）：边距 = 3rem（48px）
- 桌面端（90rem）：边距 = 4rem（64px）
- 平滑过渡，无断点跳跃

#### 完整间距标尺

```css
--_spacing---space--0-25rem: 0.25rem    /* 4px  - 微小间距 */
--_spacing---space--0-5rem: 0.5rem      /* 8px  - 小间距 */
--_spacing---space--0-75rem: 0.75rem    /* 12px - 紧凑间距 */
--_spacing---space--1rem: 1rem          /* 16px - 基础单位 */
--_spacing---space--1-5rem: 1.5rem      /* 24px - 标准间距 */
--_spacing---space--2rem: clamp(1.75rem, ..., 2rem)    /* 28-32px 流体 */
--_spacing---space--3rem: clamp(2.5rem, ..., 3rem)     /* 40-48px 流体 */
--_spacing---space--4rem: clamp(3.25rem, ..., 4rem)    /* 52-64px 流体 */
```

---

### 3. 命名网格线系统（高级特性）

#### 突破性网格模板

```css
--grid-breakout: 
  [full-start] minmax(0, 1fr) 
  [content-start] repeat(var(--_grid---column-count), minmax(0, var(--_grid---column-width))) 
  [content-end] minmax(0, 1fr) 
  [full-end]
```

**布局区域可视化：**

```
|←— full-start ————————————————————————————————— full-end —→|
    |←— 边距 —→| [content-start ——— content-end] |←— 边距 —→|
                        ←— 12列内容区 —→
```

#### 单列突破模板

```css
--grid-breakout-single: 
  [full-start] minmax(0, 1fr) 
  [content-start] minmax(0, calc(100% - var(--site--margin) * 2)) 
  [content-end] minmax(0, 1fr) 
  [full-end]
```

#### 实际应用案例

```css
.page-container {
  display: grid;
  grid-template-columns: var(--grid-breakout);
}

.normal-content { 
  grid-column: content;    /* 限制在内容区 */
}

.hero-section { 
  grid-column: full;       /* 全宽突破布局 */
}

.featured-article {
  grid-column: content-start / span 8;  /* 从内容起点占8列 */
}
```

---

### 4. 最大宽度约束体系

```css
--max-width--full: 100%              /* 无限制 - 全宽 */
--max-width--small: 60rem            /* 960px  - 窄内容（文章、表单） */
--max-width--medium: 74.5rem         /* 1192px - 中等布局（标准页面） */
--max-width--main: calc(90 * 1rem)   /* 1440px - 主容器（默认最大） */
```

#### 使用场景映射

| 宽度类型 | 适用场景 | 示例 |
|---------|---------|------|
| small | 长文本阅读 | 博客文章、文档、登录表单 |
| medium | 标准页面 | 产品页、关于页 |
| main | 完整布局 | 首页、仪表板 |
| full | 沉浸式内容 | 轮播图、视频背景 |

---

## 🛠️ Cursor 开发实施指南

### 步骤1️⃣：设置 CSS 自定义属性

```css
:root {
  /* ===== 网格核心配置 ===== */
  --grid-columns: 12;
  --grid-gutter: 2rem;
  --viewport-min: 20;  /* rem 单位 */
  --viewport-max: 90;  /* rem 单位 */
  
  /* ===== 最大宽度设定 ===== */
  --max-width-main: calc(var(--viewport-max) * 1rem);
  --max-width-medium: 74.5rem;
  --max-width-small: 60rem;
  
  /* ===== 流体边距计算 ===== */
  --site-margin: clamp(
    2rem,
    calc(2rem + (4 - 2) * ((100vw - 20rem) / (90 - 20))),
    4rem
  );
  
  /* ===== 列宽自动计算 ===== */
  --column-width: calc(
    (min(var(--max-width-main), 100% - var(--site-margin) * 2) 
     - var(--grid-gutter) * (var(--grid-columns) - 1))
    / var(--grid-columns)
  );
  
  /* ===== 命名网格线模板 ===== */
  --grid-template: 
    [full-start] minmax(0, 1fr)
    [content-start] repeat(var(--grid-columns), minmax(0, var(--column-width)))
    [content-end] minmax(0, 1fr)
    [full-end];
}
```

---

### 步骤2️⃣：创建基础网格容器

```css
/* 主网格容器 */
.grid-container {
  display: grid;
  grid-template-columns: var(--grid-template);
  gap: var(--grid-gutter);
  width: 100%;
}

/* 内容区域（默认） */
.grid-content {
  grid-column: content;
}

/* 全宽突破区域 */
.grid-full {
  grid-column: full;
}

/* 从内容起点到结束 */
.grid-content-wide {
  grid-column: content-start / content-end;
}
```

---

### 步骤3️⃣：列跨度工具类

```css
/* 单列跨度 */
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-5  { grid-column: span 5; }
.col-6  { grid-column: span 6; }
.col-7  { grid-column: span 7; }
.col-8  { grid-column: span 8; }
.col-9  { grid-column: span 9; }
.col-10 { grid-column: span 10; }
.col-11 { grid-column: span 11; }
.col-12 { grid-column: span 12; }

/* 常用组合 */
.col-two-thirds { grid-column: span 8; }   /* 8/12 = 66.67% */
.col-one-third  { grid-column: span 4; }   /* 4/12 = 33.33% */
.col-three-quarters { grid-column: span 9; } /* 9/12 = 75% */
.col-quarter { grid-column: span 3; }      /* 3/12 = 25% */
```

---

### 步骤4️⃣：响应式断点

```css
/* 移动优先方法 */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: var(--grid-gutter);
}

/* 平板断点 (768px) */
@media (min-width: 48rem) {
  .col-md-6 { grid-column: span 6; }
  .col-md-4 { grid-column: span 4; }
  .col-md-8 { grid-column: span 8; }
}

/* 桌面断点 (1024px) */
@media (min-width: 64rem) {
  .col-lg-3 { grid-column: span 3; }
  .col-lg-4 { grid-column: span 4; }
  .col-lg-8 { grid-column: span 8; }
  .col-lg-9 { grid-column: span 9; }
}

/* 大屏断点 (1440px) */
@media (min-width: 90rem) {
  .col-xl-2 { grid-column: span 2; }
  .col-xl-10 { grid-column: span 10; }
}
```

---

## 💡 高级应用模式

### 模式1：突破性布局（全宽/限宽混合）

```html
<div class="grid-container">
  <header class="grid-full bg-primary">
    <!-- 全宽页眉 - 延伸到边缘 -->
    <div class="max-w-main mx-auto px-8">
      导航内容
    </div>
  </header>
  
  <main class="grid-content">
    <!-- 限宽主内容 - 标准内容区 -->
    <article>正文内容</article>
  </main>
  
  <section class="grid-full bg-accent">
    <!-- 全宽特色区域 - 背景延伸 -->
    <div class="max-w-main mx-auto px-8">
      特色内容
    </div>
  </section>
</div>
```

---

### 模式2：不对称布局（8+4、9+3）

```html
<!-- 经典博客布局 -->
<div class="grid-container grid-content">
  <article class="col-8">
    <h1>文章标题</h1>
    <p>主要内容区域占8列...</p>
  </article>
  
  <aside class="col-4">
    <div class="sticky top-4">
      <h3>相关文章</h3>
      <!-- 侧边栏占4列 -->
    </div>
  </aside>
</div>

<!-- 突出主内容布局 -->
<div class="grid-container grid-content">
  <main class="col-9">重点内容</main>
  <aside class="col-3">次要信息</aside>
</div>
```

---

### 模式3：嵌套网格

```css
.nested-grid-parent {
  grid-column: span 8;  /* 父级占8列 */
  display: grid;
  grid-template-columns: repeat(8, 1fr);  /* 内部再分8列 */
  gap: var(--grid-gutter);
}

.nested-item {
  grid-column: span 4;  /* 占父网格的一半 */
}
```

```html
<div class="grid-container grid-content">
  <div class="nested-grid-parent">
    <div class="nested-item">子项目1</div>
    <div class="nested-item">子项目2</div>
  </div>
  <aside class="col-4">侧边栏</aside>
</div>
```

---

### 模式4：卡片网格（自适应）

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--grid-gutter);
}

/* 或使用固定列数 */
.card-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--grid-gutter);
}

@media (max-width: 64rem) {
  .card-grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 48rem) {
  .card-grid-4 { grid-template-columns: 1fr; }
}
```

---

## 📊 快速参考表

### 常用列组合

| 列数 | 占比 | 用途 | 示例场景 |
|-----|------|------|---------|
| 12 | 100% | 全宽 | 页眉、页脚、横幅 |
| 9 | 75% | 主要内容 | 突出文章+窄侧栏 |
| 8 | 66.67% | 主内容 | 博客文章+侧边栏 |
| 6 | 50% | 对半分 | 双栏布局、特性对比 |
| 4 | 33.33% | 三分之一 | 三栏布局、侧边栏 |
| 3 | 25% | 四分之一 | 四栏卡片、产品网格 |

### 间距系统

| 变量 | 值 | 像素 | 用途 |
|------|---|------|------|
| `--_spacing---space--0-25rem` | 0.25rem | 4px | 微间距 |
| `--_spacing---space--0-5rem` | 0.5rem | 8px | 紧凑间距 |
| `--_spacing---space--1rem` | 1rem | 16px | 基础单位 |
| `--_spacing---space--1-5rem` | 1.5rem | 24px | 标准间距 |
| `--_grid---gutter` | 2rem | 32px | 网格间距 |
| `--site--margin` | 2-4rem | 32-64px | 页面边距（流体） |

### 最大宽度

| 变量 | 值 | 像素 | 用途 |
|------|---|------|------|
| `--max-width--small` | 60rem | 960px | 文章、表单 |
| `--max-width--medium` | 74.5rem | 1192px | 标准页面 |
| `--max-width--main` | 90rem | 1440px | 主容器 |
| `--max-width--full` | 100% | 无限 | 全宽内容 |

---

## 🚀 性能优化建议

### 1. 使用 CSS 变量层叠

```css
.component {
  --local-gutter: calc(var(--grid-gutter) * 0.5);
  gap: var(--local-gutter);
}
```

### 2. 避免过度嵌套网格

- 最多3层嵌套
- 使用 flexbox 处理简单情况

### 3. 合理使用 will-change

```css
.animated-grid-item {
  will-change: grid-column;
}
```

### 4. 延迟加载网格图片

```html
<img loading="lazy" src="image.jpg" alt="描述">
```

---

## 🔗 相关文档

- **依赖**: [03-spacing.md](./03-spacing.md) - 流体间距算法
- **配合使用**: [04-radius.md](./04-radius.md) - 容器圆角
- **配合使用**: [02-typography.md](./02-typography.md) - 文字排版

---

## 💡 Cursor 使用提示

### 快速引用
```
@docs/design-system/05-grid.md 使用这个网格系统创建一个博客布局
```

### Rules for AI (.cursorrules)
```markdown
# 网格系统规则
- 使用12列网格系统作为基础
- 主内容区域使用 grid-column: content
- 全宽区域使用 grid-column: full
- 标准布局使用 8+4 列（主内容+侧边栏）
- 卡片网格使用 repeat(auto-fit, minmax(20rem, 1fr))
- 网格间距使用 --grid-gutter (2rem)
- 页面边距使用 --site-margin (2-4rem 流体)
```

---

**文档结束** | 下一步: [06-animation.md](./06-animation.md)