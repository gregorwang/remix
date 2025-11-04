# Claude 设计系统 - 字体系统 (Typography System)

## 📋 文档信息
- **版本**: 2.0
- **更新日期**: 2025-11-03
- **依赖**: 无
- **配合使用**: spacing.md (文字间距), colors.md (文字颜色)

---

## 🔤 字体族 (Font Families)

### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Han Sans CN"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Source Han Serif CN"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
    }
  }
}
```

### 应用场景
- **Sans (无衬线)**: 界面文本、正文内容、按钮、导航
- **Serif (衬线)**: 长文阅读、标题强调、品牌文案
- **Mono (等宽)**: 代码块、数据表格、技术文档

---

## 📏 字号系统 (Font Size)

### 固定字号 (≤ 0.875rem)

```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],   // 12px
  sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],        // 14px
}
```

### 流体字号 (≥ 1rem)

视口范围: `20rem - 90rem` (320px - 1440px)

```javascript
fontSize: {
  // 基础正文 (16-18px)
  base: ['clamp(1rem, calc(1rem + 0.125 * ((100vw - 20rem) / 70)), 1.125rem)', 
         { lineHeight: '1.6', letterSpacing: '0' }],
  
  // 大正文 (18-20px)
  lg: ['clamp(1.125rem, calc(1.125rem + 0.125 * ((100vw - 20rem) / 70)), 1.25rem)', 
       { lineHeight: '1.5', letterSpacing: '0' }],
  
  // H5-H4 (20-24px)
  xl: ['clamp(1.25rem, calc(1.25rem + 0.25 * ((100vw - 20rem) / 70)), 1.5rem)', 
       { lineHeight: '1.4', letterSpacing: '-0.025em' }],
  
  // H3 (24-32px)
  '2xl': ['clamp(1.5rem, calc(1.5rem + 0.5 * ((100vw - 20rem) / 70)), 2rem)', 
          { lineHeight: '1.3', letterSpacing: '-0.025em' }],
  
  // H2 (30-40px)
  '3xl': ['clamp(1.875rem, calc(1.875rem + 0.625 * ((100vw - 20rem) / 70)), 2.5rem)', 
          { lineHeight: '1.2', letterSpacing: '-0.05em' }],
  
  // H1 (36-56px)
  '4xl': ['clamp(2.25rem, calc(2.25rem + 1.25 * ((100vw - 20rem) / 70)), 3.5rem)', 
          { lineHeight: '1.1', letterSpacing: '-0.05em' }],
  
  // Hero (48-72px)
  '5xl': ['clamp(3rem, calc(3rem + 1.5 * ((100vw - 20rem) / 70)), 4.5rem)', 
          { lineHeight: '1', letterSpacing: '-0.05em' }],
}
```

---

## 🎯 字号选择决策树

```
开始选择字号 →

├─ 这是标题吗？
│  ├─ 是 Hero 区域？ → text-5xl + font-bold + tracking-tighter
│  ├─ 是页面主标题？ → text-4xl + font-bold + leading-tight
│  ├─ 是章节标题？   → text-3xl + font-semibold + leading-tight
│  └─ 是小节标题？   → text-2xl + font-semibold
│
├─ 这是正文内容吗？
│  ├─ 长文章？       → text-base + leading-relaxed + max-w-2xl
│  ├─ 卡片描述？     → text-base + leading-normal
│  ├─ 引言/重点？    → text-lg + font-medium + leading-relaxed
│  └─ 列表项？       → text-base + leading-normal
│
├─ 这是界面控件吗？
│  ├─ 按钮？         → text-sm + font-medium
│  ├─ 表单标签？     → text-sm + font-semibold
│  ├─ 菜单项？       → text-sm + font-normal
│  ├─ 标签/徽章？    → text-xs + font-semibold + uppercase + tracking-wider
│  └─ 工具提示？     → text-xs + font-normal
│
└─ 这是数据展示吗？
   ├─ 大数字？       → text-4xl + font-bold + tabular-nums
   ├─ 统计指标？     → text-2xl + font-semibold + tabular-nums
   ├─ 表格数据？     → text-sm + font-mono
   └─ 单位/标签？    → text-sm + text-gray-500
```

---

## ⚖️ 字重系统 (Font Weight)

```javascript
fontWeight: {
  light: 300,      // 很少使用
  normal: 400,     // 正文默认 ⭐
  medium: 500,     // 按钮、导航 ⭐
  semibold: 600,   // 小标题、强调 ⭐
  bold: 700,       // 大标题 ⭐
  black: 900,      // 特殊场景
}
```

### 字重搭配规则
- **标题**: `font-bold` (700)
- **强调**: `font-semibold` (600)
- **按钮/导航**: `font-medium` (500)
- **正文**: `font-normal` (400)

---

## 📐 行高系统 (Line Height)

```javascript
lineHeight: {
  none: '1',           // 超大标题
  tight: '1.2',        // 大标题
  snug: '1.3',         // 中标题
  normal: '1.5',       // 界面文本 ⭐
  relaxed: '1.6',      // 正文阅读 ⭐
  loose: '1.8',        // 长文本
}
```

### 行高规则
- **大标题**: `leading-none` / `leading-tight` (1-1.2)
- **界面文本**: `leading-normal` (1.5)
- **长文本**: `leading-relaxed` (1.6-1.8)

---

## 🔤 字距系统 (Letter Spacing)

```javascript
letterSpacing: {
  tighter: '-0.05em',   // 超大标题
  tight: '-0.025em',    // 大标题
  normal: '0em',        // 正文 ⭐
  wide: '0.025em',      // 小字
  wider: '0.05em',      // 全大写
}
```

### 字距调整规则
- **大标题**: `tracking-tighter` (-0.05em)
- **小标题**: `tracking-tight` (-0.025em)
- **正文**: `tracking-normal` (0)
- **小字**: `tracking-wide` (0.025em)
- **全大写**: `tracking-wider` (0.05em)

---

## 📊 字体系统速查表

```
┌─────────────────────────────────────────────────┐
│  字体系统速查表 v2.0                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  字号选择：                                      │
│  ├─ Hero标题      text-5xl  (48-72px)           │
│  ├─ H1            text-4xl  (36-56px)           │
│  ├─ H2            text-3xl  (30-40px)           │
│  ├─ H3            text-2xl  (24-32px)           │
│  ├─ H4-H5         text-xl   (20-24px)           │
│  ├─ 正文          text-base (16-18px) ⭐        │
│  ├─ 说明文字      text-sm   (14px)              │
│  └─ 脚注          text-xs   (12px)              │
│                                                 │
│  字重搭配：                                      │
│  ├─ 标题          font-bold (700)               │
│  ├─ 强调          font-semibold (600)           │
│  ├─ 按钮/导航     font-medium (500)              │
│  └─ 正文          font-normal (400)             │
│                                                 │
│  行高规则：                                      │
│  ├─ 大标题        leading-none/tight (1-1.2)    │
│  ├─ 界面文本      leading-normal (1.5)          │
│  └─ 长文本        leading-relaxed (1.6-1.8)     │
│                                                 │
│  字距调整：                                      │
│  ├─ 大标题        tracking-tighter (-0.05em)    │
│  ├─ 小标题        tracking-tight (-0.025em)     │
│  ├─ 正文          tracking-normal (0)           │
│  ├─ 小字          tracking-wide (0.025em)       │
│  └─ 全大写        tracking-wider (0.05em)       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ 使用示例

### React + Tailwind

```jsx
// Hero 区域
<h1 className="text-5xl font-bold tracking-tighter leading-none">
  欢迎使用 Claude
</h1>

// 页面主标题
<h1 className="text-4xl font-bold leading-tight tracking-tight">
  产品功能介绍
</h1>

// 章节标题
<h2 className="text-3xl font-semibold leading-tight tracking-tight">
  核心特性
</h2>

// 正文内容
<p className="text-base leading-relaxed max-w-2xl">
  这是一段长文本内容，使用较宽松的行高提升阅读体验...
</p>

// 按钮
<button className="text-sm font-medium">
  立即开始
</button>

// 标签
<span className="text-xs font-semibold uppercase tracking-wider">
  NEW
</span>

// 大数字
<div className="text-4xl font-bold tabular-nums">
  1,234,567
</div>
```

### CSS 原生写法

```css
/* Hero 标题 */
.hero-title {
  font-size: clamp(3rem, calc(3rem + 1.5 * ((100vw - 20rem) / 70)), 4.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
}

/* 正文 */
.body-text {
  font-size: clamp(1rem, calc(1rem + 0.125 * ((100vw - 20rem) / 70)), 1.125rem);
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0;
  max-width: 42rem;
}

/* 按钮 */
.button {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
}
```

---

## 🎨 最佳实践

### ✅ 正确用法

```jsx
/* ✅ 标题组合 - 字号 + 字重 + 行高 + 字距 */
<h1 className="text-4xl font-bold leading-tight tracking-tight">
  完整配置
</h1>

/* ✅ 长文本 - 限制宽度提升可读性 */
<article className="text-base leading-relaxed max-w-2xl">
  文章内容...
</article>

/* ✅ 数字 - 使用等宽数字对齐 */
<div className="text-2xl font-semibold tabular-nums">
  $1,234.56
</div>
```

### ❌ 错误用法

```jsx
/* ❌ 硬编码字号 */
<h1 style={{ fontSize: '32px' }}>
  不要这样做
</h1>

/* ❌ 标题使用正文行高 */
<h1 className="text-4xl leading-relaxed">
  行高太大了
</h1>

/* ❌ 正文使用标题字重 */
<p className="text-base font-bold">
  正文不应该这么粗
</p>

/* ❌ 长文本无宽度限制 */
<article className="text-base w-full">
  阅读体验差，一行太长了...
</article>
```

---

## 🔧 流体字号公式解析

### 通用公式
```
font-size = clamp(
  MIN_SIZE,
  MIN_SIZE + (MAX_SIZE - MIN_SIZE) * ((100vw - MIN_VIEWPORT) / (MAX_VIEWPORT - MIN_VIEWPORT)),
  MAX_SIZE
)
```

### 参数说明
- `MIN_SIZE`: 最小字号 (手机端)
- `MAX_SIZE`: 最大字号 (桌面端)
- `MIN_VIEWPORT`: 最小视口 (20rem = 320px)
- `MAX_VIEWPORT`: 最大视口 (90rem = 1440px)

### 示例：text-base
```css
/* 16px (手机) → 18px (桌面) */
font-size: clamp(
  1rem,                                    /* 最小 16px */
  calc(1rem + 0.125 * ((100vw - 20rem) / 70)),  /* 流体计算 */
  1.125rem                                 /* 最大 18px */
);
```

---

## 🔗 相关文档

- **配合使用**: [03-spacing.md](./03-spacing.md) - 文字间距
- **配合使用**: [01-colors.md](./01-colors.md) - 文字颜色
- **应用**: [05-grid.md](./05-grid.md) - 排版布局

---

## 💡 Cursor 使用提示

### 快速引用
```
@docs/design-system/02-typography.md 创建一个标题和正文的组件
```

### Rules for AI (.cursorrules)
```markdown
# 字体系统规则
- 所有字号必须从设计系统选择 (xs/sm/base/lg/xl/2xl/3xl/4xl/5xl)
- 标题使用 font-bold (700) 或 font-semibold (600)
- 正文使用 font-normal (400)
- 按钮使用 font-medium (500)
- 大标题配合 tracking-tight 或 tracking-tighter
- 长文本配合 leading-relaxed 和 max-w-2xl
- 数字使用 tabular-nums 保持对齐
```

---

**文档结束** | 下一步: [03-spacing.md](./03-spacing.md)