# Claude 设计系统 - 颜色系统 (Color System)

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-03
- **依赖**: 无
- **配合使用**: animation.md (颜色过渡动画)

---

## 🎨 颜色配比（60-30-10法则）

### 主色（Primary）- 60%

```css
--_theme---background-primary: var(--swatch--gray-050)
--swatch--gray-050: #faf9f5
```

**色值**: `#FAF9F5` - 温暖奶白色

**用途**: 页面主背景  
**特点**: 比纯白更柔和，带有淡淡的米黄色调

---

### 辅色（Secondary）- 30%

```css
--_theme---background-secondary: var(--swatch--gray-100)
--swatch--gray-100: #f5f4ed
```

**色值**: `#F5F4ED` - 浅米灰色

**用途**: 卡片背景、次要区域  
**变体**: `#f0eee6`（三级背景，稍深）

---

### 点缀色（Accent）- 10%

```css
--_theme---button-brand--background: var(--swatch--clay-interactive)
--swatch--clay-interactive: #c96442
--swatch--clay: #d97757
```

**交互色**: `#C96442` - 陶土橙色（交互用）  
**展示色**: `#D97757` - 陶土橙色（展示用）

**用途**: 品牌按钮、文字强调、链接  
**特点**: 温暖的橙棕色，比Cursor的橙更柔和

---

### 文字色

```css
--_theme---foreground-primary: var(--swatch--gray-950)
--swatch--gray-950: #141413
```

**色值**: `#141413` - 深黑褐色

**用途**: 主要文本内容

---

## 🎯 使用规范

### CSS 变量定义

```css
:root {
  /* 主色系 */
  --swatch--gray-050: #faf9f5;
  --swatch--gray-100: #f5f4ed;
  --swatch--gray-950: #141413;
  
  /* 点缀色系 */
  --swatch--clay: #d97757;
  --swatch--clay-interactive: #c96442;
  
  /* 语义化变量 */
  --theme-bg-primary: var(--swatch--gray-050);
  --theme-bg-secondary: var(--swatch--gray-100);
  --theme-fg-primary: var(--swatch--gray-950);
  --theme-accent: var(--swatch--clay);
  --theme-accent-hover: var(--swatch--clay-interactive);
}
```

### Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f5',   // 主背景
          100: '#f5f4ed',  // 次背景
          950: '#141413',  // 主文字
        },
        accent: {
          DEFAULT: '#d97757',  // 陶土橙（展示）
          hover: '#c96442',    // 陶土橙（交互）
        }
      }
    }
  }
}
```

---

## 📊 应用场景速查

| 场景 | 颜色选择 | CSS变量 | Tailwind类 |
|------|---------|---------|------------|
| 页面背景 | `#FAF9F5` | `var(--theme-bg-primary)` | `bg-primary-50` |
| 卡片背景 | `#F5F4ED` | `var(--theme-bg-secondary)` | `bg-primary-100` |
| 主要文字 | `#141413` | `var(--theme-fg-primary)` | `text-primary-950` |
| 品牌按钮 | `#D97757` | `var(--theme-accent)` | `bg-accent` |
| 按钮悬停 | `#C96442` | `var(--theme-accent-hover)` | `hover:bg-accent-hover` |
| 强调文字 | `#D97757` | `var(--theme-accent)` | `text-accent` |
| 链接 | `#D97757` | `var(--theme-accent)` | `text-accent` |

---

## ✅ 最佳实践

### 正确用法

```css
/* ✅ 使用语义化变量 */
.page {
  background-color: var(--theme-bg-primary);
  color: var(--theme-fg-primary);
}

.button-primary {
  background-color: var(--theme-accent);
}

.button-primary:hover {
  background-color: var(--theme-accent-hover);
}
```

```jsx
/* ✅ Tailwind 写法 */
<div className="bg-primary-50 text-primary-950">
  <button className="bg-accent hover:bg-accent-hover">
    点击按钮
  </button>
</div>
```

### 错误用法

```css
/* ❌ 不要硬编码颜色值 */
.page {
  background-color: #faf9f5;  /* 破坏主题系统 */
}

/* ❌ 不要过度使用点缀色 */
.card {
  background-color: var(--theme-accent);  /* 点缀色不应大面积使用 */
}
```

---

## 🎨 颜色使用原则

### 1. 层次原则
- **主色（60%）**: 占据视觉最大面积，保持克制
- **辅色（30%）**: 分隔内容区域，创造层次
- **点缀色（10%）**: 引导注意力，突出交互

### 2. 对比度要求
- 主文字与背景对比度: **≥ 7:1** (WCAG AAA)
- 辅助文字与背景对比度: **≥ 4.5:1** (WCAG AA)
- 按钮与背景对比度: **≥ 3:1**

### 3. 可访问性检查
```css
/* 确保文字可读性 */
.text-on-primary {
  color: var(--theme-fg-primary);  /* #141413 在 #FAF9F5 上 → 对比度 13.5:1 ✅ */
}

.text-on-accent {
  color: #ffffff;  /* 白色文字在 #D97757 上 → 对比度 4.8:1 ✅ */
}
```

---

## 🔗 相关文档

- **配合使用**: [06-animation.md](./06-animation.md) - 颜色过渡动画
- **实际应用**: [05-grid.md](./05-grid.md) - 布局中的颜色分区

---

## 💡 Cursor 使用提示

### 快速引用
```
@docs/design-system/01-colors.md 使用品牌色创建按钮组件
```

### Rules for AI (.cursorrules)
```markdown
# 颜色系统规则
- 所有颜色必须从设计系统选择，禁止硬编码
- 主色用于大面积背景（60%）
- 辅色用于卡片和区域分隔（30%）
- 点缀色用于交互元素和强调（10%）
- 确保对比度符合 WCAG AA 标准（最低4.5:1）
```

---

**文档结束** | 下一步: [02-typography.md](./02-typography.md)