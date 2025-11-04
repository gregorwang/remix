# Claude 设计系统 - 间距系统 (Spacing System)

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-03
- **依赖**: 无
- **配合使用**: grid.md (布局间距), typography.md (文字间距)

---

## 📐 核心参数

```css
--site--viewport-min: 20;  /* 20rem = 320px */
--site--viewport-max: 90;  /* 90rem = 1440px */
```

---

## 🧮 流体间距算法

### CSS 实现

```css
/* 通用公式模板 */
clamp(
  [MIN_VALUE] * 1rem,
  (([MIN_VALUE] - (([MAX_VALUE] - [MIN_VALUE]) / (90 - 20) * 20)) * 1rem + 
   (([MAX_VALUE] - [MIN_VALUE]) / (90 - 20)) * 100vw),
  [MAX_VALUE] * 1rem
)
```

### JavaScript 实现

```javascript
function fluidSpace(min, max, currentViewport) {
  const VIEWPORT_MIN = 20;  // rem
  const VIEWPORT_MAX = 90;  // rem
  
  if (currentViewport <= VIEWPORT_MIN) return min;
  if (currentViewport >= VIEWPORT_MAX) return max;
  
  const slope = (max - min) / (VIEWPORT_MAX - VIEWPORT_MIN);
  const intercept = min - (slope * VIEWPORT_MIN);
  return intercept + (slope * currentViewport);
}
```

### Tailwind Config 实现

```javascript
// tailwind.config.js
const fluid = (min, max) => 
  `clamp(${min}rem, calc(${min}rem + (${max} - ${min}) * ((100vw - 20rem) / (90 - 20))), ${max}rem)`;

module.exports = {
  theme: {
    spacing: {
      // Component Level (固定值)
      '0.25': '0.25rem',
      '0.5': '0.5rem',
      '0.75': '0.75rem',
      '1': '1rem',
      '1.5': '1.5rem',
      
      // Component Level (流体值)
      '2': fluid(1.75, 2),      // 28-32px
      '2.5': fluid(2, 2.5),     // 32-40px
      '3': fluid(2.5, 3),       // 40-48px
      '4': fluid(3.25, 4),      // 52-64px
      
      // Page Level (页面级间距)
      'section-none': '0',
      'section-sm': fluid(4, 6),      // 64-96px
      'section-md': fluid(6, 8),      // 96-128px
      'section-lg': fluid(8, 12.5),   // 128-200px
      'section-xl': fluid(13, 15),    // 208-240px
    }
  }
}
```

---

## 📊 间距规范表

### Component Level (组件级间距)

| Token Name | Min | Max | 类型 | 用途 |
|------------|-----|-----|------|------|
| 0.25rem | 0.25 | 0.25 | 固定 | 最小间隙 (按钮边框等) |
| 0.5rem | 0.5 | 0.5 | 固定 | 小间距 (图标与文字) |
| 0.75rem | 0.75 | 0.75 | 固定 | 紧凑padding |
| 1rem | 1 | 1 | 固定 | 基准间距 |
| 1.5rem | 1.5 | 1.5 | 固定 | 标准padding |
| 2rem | 1.75 | 2 | 流体 | 卡片间距 |
| 2.5rem | 2 | 2.5 | 流体 | 中等间距 |
| 3rem | 2.5 | 3 | 流体 | 大间距 |
| 4rem | 3.25 | 4 | 流体 | 超大间距 |

### Page Level (页面级间距)

| Token Name | Min | Max | 用途 |
|------------|-----|-----|------|
| section-none | 0 | 0 | 无间距 |
| section-small | 4 | 6 | 小型section间距 |
| section-main | 6 | 8 | 标准section间距 |
| section-large | 8 | 12.5 | 大型section间距 |
| section-page-top | 13 | 15 | 页面顶部间距 |

---

## 🎯 使用规则

### 1. 选择性流体原则

```
≤ 1.5rem  → 固定值 (精确控制)
≥ 2rem    → 流体值 (自适应缩放)
```

### 2. 应用场景

```css
/* ✅ 正确 - 组件内部用固定值 */
.button {
  padding: 0.75rem 1.5rem;
  gap: 0.5rem;
}

/* ✅ 正确 - 组件外部用流体值 */
.card {
  margin-bottom: var(--_spacing---space--2rem);  /* 1.75-2rem */
  padding: var(--_spacing---space--2rem);
}

/* ✅ 正确 - Section间距用Page Level */
.section {
  margin-top: var(--_spacing---section-space--main);  /* 6-8rem */
}
```

---

## 📱 响应式断点参考

```javascript
const breakpoints = {
  mobile: '20rem - 48rem',   // 320px - 768px
  tablet: '48rem - 64rem',   // 768px - 1024px
  desktop: '64rem - 90rem',  // 1024px - 1440px
};
```

---

## 🔧 实际代码示例

### React + Tailwind

```jsx
// 使用自定义spacing
<div className="p-2 mb-2.5 space-y-section-md">
  <h1 className="text-4xl mb-3">标题</h1>
  <p className="text-base">内容</p>
</div>
```

### 纯CSS

```css
.hero-section {
  padding-top: var(--_spacing---section-space--page-top);
  padding-bottom: var(--_spacing---section-space--large);
}

.card {
  padding: var(--_spacing---space--2rem);
  gap: var(--_spacing---space--1rem);
}
```

---

## ⚡ 性能说明

- ✅ 使用CSS原生 `clamp()`，无JS运行时开销
- ✅ 浏览器硬件加速支持
- ✅ 兼容性：Chrome 79+, Safari 13.1+, Firefox 75+
- ⚠️ 不支持IE11（需要PostCSS降级）

---

## 🎨 设计原则

1. **双层系统**: Component内精确，Layout间流体
2. **数学精确**: 线性插值，无跳跃式断点
3. **语义化命名**: 按大小而非用途命名
4. **渐进增强**: 移动优先，逐步扩大

---

## 📊 间距使用速查表

### 组件内部间距 (Component Level)

| 场景 | 间距选择 | Tailwind类 |
|------|---------|------------|
| 按钮内边距 | 0.75rem × 1.5rem | `px-1.5 py-0.75` |
| 图标与文字 | 0.5rem | `gap-0.5` |
| 表单字段间距 | 1rem | `space-y-1` |
| 卡片内边距 | 2rem | `p-2` |
| 卡片外边距 | 2rem | `mb-2` |

### 页面布局间距 (Page Level)

| 场景 | 间距选择 | CSS变量 |
|------|---------|---------|
| Section之间 | section-main | `--_spacing---section-space--main` |
| 页面顶部留白 | section-page-top | `--_spacing---section-space--page-top` |
| Hero区域 | section-large | `--_spacing---section-space--large` |
| 紧凑布局 | section-small | `--_spacing---section-space--small` |

---

## ✅ 最佳实践

### 正确用法

```jsx
/* ✅ 按钮 - 使用固定值 */
<button className="px-1.5 py-0.75">
  点击
</button>

/* ✅ 卡片 - 使用流体值 */
<div className="p-2 mb-2.5">
  卡片内容
</div>

/* ✅ Section - 使用Page Level */
<section className="py-section-md">
  区域内容
</section>

/* ✅ 堆叠间距 - space-y */
<div className="space-y-2">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
</div>
```

### 错误用法

```jsx
/* ❌ 硬编码间距 */
<div style={{ padding: '32px' }}>
  不要这样做
</div>

/* ❌ 小组件使用流体间距 */
<button className="p-2">
  按钮不需要流体间距
</button>

/* ❌ 大布局使用固定间距 */
<section className="py-1">
  Section间距太小了
</section>

/* ❌ 使用任意值 */
<div className="p-[23px]">
  破坏系统一致性
</div>
```

---

## 🧪 流体间距计算示例

### 示例1: 2rem (1.75-2rem)

```css
/* 手机端 (320px): 1.75rem = 28px */
/* 平板端 (768px): 1.875rem = 30px */
/* 桌面端 (1440px): 2rem = 32px */

clamp(
  1.75rem,
  calc(1.75rem + 0.25 * ((100vw - 20rem) / 70)),
  2rem
)
```

### 示例2: section-main (6-8rem)

```css
/* 手机端 (320px): 6rem = 96px */
/* 平板端 (768px): 7rem = 112px */
/* 桌面端 (1440px): 8rem = 128px */

clamp(
  6rem,
  calc(6rem + 2 * ((100vw - 20rem) / 70)),
  8rem
)
```

---

## 💡 给 Cursor 使用的最佳实践

### 📂 推荐的文件结构

```
/docs
  /design-system
    ├── 01-colors.md
    ├── 02-typography.md
    ├── 03-spacing.md ← 当前文档
    ├── 04-radius.md
    ├── 05-grid.md
    └── 06-animation.md

/src
  /styles
    ├── spacing.css ← CSS变量定义
    └── tailwind.config.js ← Tailwind配置
```

### 🤖 在 Cursor 中如何使用

#### 1. 添加到上下文
```
@docs/design-system/03-spacing.md 使用这个间距系统创建一个卡片组件
```

#### 2. Composer模式
```
参考 spacing.md 中的 Component Level 规范，
给这个组件添加正确的间距
```

#### 3. Rules for AI（.cursorrules文件）

```markdown
# 间距系统规则
- 组件内部(padding/gap)使用固定值: 0.25/0.5/0.75/1/1.5rem
- 组件外部(margin)使用流体值: 2/2.5/3/4rem
- Section间距使用Page Level变量
- 所有间距必须从设计系统选择，不使用任意值
```

---

## 🔗 相关文档

- **配合使用**: [05-grid.md](./05-grid.md) - 网格布局间距
- **配合使用**: [02-typography.md](./02-typography.md) - 文字行高间距
- **应用**: [04-radius.md](./04-radius.md) - 圆角尺寸

---

## 📚 完整CSS变量定义

```css
:root {
  /* 视口参数 */
  --site--viewport-min: 20;
  --site--viewport-max: 90;
  
  /* Component Level - 固定值 */
  --_spacing---space--0-25rem: 0.25rem;
  --_spacing---space--0-5rem: 0.5rem;
  --_spacing---space--0-75rem: 0.75rem;
  --_spacing---space--1rem: 1rem;
  --_spacing---space--1-5rem: 1.5rem;
  
  /* Component Level - 流体值 */
  --_spacing---space--2rem: clamp(1.75rem, calc(1.75rem + 0.25 * ((100vw - 20rem) / 70)), 2rem);
  --_spacing---space--2-5rem: clamp(2rem, calc(2rem + 0.5 * ((100vw - 20rem) / 70)), 2.5rem);
  --_spacing---space--3rem: clamp(2.5rem, calc(2.5rem + 0.5 * ((100vw - 20rem) / 70)), 3rem);
  --_spacing---space--4rem: clamp(3.25rem, calc(3.25rem + 0.75 * ((100vw - 20rem) / 70)), 4rem);
  
  /* Page Level */
  --_spacing---section-space--none: 0;
  --_spacing---section-space--small: clamp(4rem, calc(4rem + 2 * ((100vw - 20rem) / 70)), 6rem);
  --_spacing---section-space--main: clamp(6rem, calc(6rem + 2 * ((100vw - 20rem) / 70)), 8rem);
  --_spacing---section-space--large: clamp(8rem, calc(8rem + 4.5 * ((100vw - 20rem) / 70)), 12.5rem);
  --_spacing---section-space--page-top: clamp(13rem, calc(13rem + 2 * ((100vw - 20rem) / 70)), 15rem);
}
```

---

**文档结束** | 下一步: [04-radius.md](./04-radius.md)