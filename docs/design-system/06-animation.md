# Claude 设计系统 - 动画系统 (Animation System)

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-03
- **依赖**: colors.md (颜色过渡)
- **配合使用**: 所有组件

---

## 🎨 核心动画技术解析

### 1. Expo Out 缓动曲线

```css
cubic-bezier(0.16, 1, 0.3, 1)
```

**特点**: 开始快速→结束缓慢，有"弹性回落"感  
**对比**: 比标准 ease-out (0.25, 0.1, 0.25, 1) 更夸张  
**适用**: 所有UI交互，营造"有重量感"的动效

---

### 2. 双时长策略

```css
快速反馈: 300ms  /* 按钮悬停、菜单收起 */
展开动画: 600ms  /* 下拉框展开、开关切换 */
```

#### 使用规则
- **300ms**: 微交互、反馈、收起动画
- **600ms**: 展开动画、状态切换、大组件

---

### 3. 组合变换技巧

```css
/* 按钮悬停 */
transform: translateY(-2px) + box-shadow

/* 下拉菜单 */
opacity + translateY + scale

/* 列表项 */
transition-delay: calc(index * 50ms)
```

---

### 4. 状态切换变量

```css
--_trigger---on: 1;
--_trigger---off: 0;

/* 使用 calc 动态计算 */
opacity: calc(var(--_trigger---on));
```

---

## 🎯 核心动画系统

这就是Claude官网的完整动画系统！🚀  
**核心**: 统一的Expo缓动 + 双时长策略 + 巧妙的组合变换

---

## 📐 CSS 变量定义

```css
:root {
  /* 缓动函数 */
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 时长 */
  --duration-fast: 300ms;
  --duration-normal: 600ms;
  
  /* 组合变换 */
  --transform-hover-lift: translateY(-2px);
  --transform-scale-in: scale(0.95);
  --transform-scale-out: scale(1);
  
  /* 状态变量 */
  --state-on: 1;
  --state-off: 0;
}
```

---

## 🎨 常用动画模式

### 模式1: 按钮悬停

```css
.button {
  transition: all var(--duration-fast) var(--ease-expo-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
```

#### Tailwind 实现

```jsx
<button className="
  transition-all duration-300 ease-expo-out
  hover:-translate-y-0.5 hover:shadow-lg
  active:translate-y-0 active:shadow-sm
">
  点击按钮
</button>
```

---

### 模式2: 下拉菜单展开

```css
.dropdown {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
  transition: all var(--duration-normal) var(--ease-expo-out);
  pointer-events: none;
}

.dropdown.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
```

#### React + Tailwind 实现

```jsx
<div className={`
  transition-all duration-600 ease-expo-out
  ${isOpen 
    ? 'opacity-100 translate-y-0 scale-100' 
    : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
  }
`}>
  菜单内容
</div>
```

---

### 模式3: 列表项交错动画

```css
.list-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all var(--duration-normal) var(--ease-expo-out);
  transition-delay: calc(var(--index) * 50ms);
}

.list-item.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### React 实现

```jsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="opacity-0 translate-y-5 transition-all duration-600"
    style={{ 
      transitionDelay: `${index * 50}ms`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
    }}
  >
    {item.content}
  </div>
))}
```

---

### 模式4: 开关切换

```css
.toggle {
  --state: var(--state-off);
  transition: all var(--duration-normal) var(--ease-expo-out);
}

.toggle-thumb {
  transform: translateX(calc(var(--state) * 20px));
  transition: transform var(--duration-normal) var(--ease-expo-out);
}

.toggle.on {
  --state: var(--state-on);
  background-color: var(--theme-accent);
}
```

---

### 模式5: 卡片悬停

```css
.card {
  transition: all var(--duration-fast) var(--ease-expo-out);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card:hover .card-image {
  transform: scale(1.05);
}

.card-image {
  transition: transform var(--duration-normal) var(--ease-expo-out);
}
```

#### Tailwind 实现

```jsx
<div className="
  card transition-all duration-300 ease-expo-out
  hover:-translate-y-1 hover:shadow-2xl
  overflow-hidden
">
  <img 
    className="transition-transform duration-600 ease-expo-out
               group-hover:scale-105"
    src="image.jpg" 
    alt="卡片图片"
  />
</div>
```

---

### 模式6: 淡入淡出

```css
.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-expo-out);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 模式7: 加载旋转

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 🎯 Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '300': '300ms',
        '600': '600ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
}
```

---

## 📊 动画使用速查表

### 按场景选择

| 场景 | 时长 | 缓动 | 示例 |
|------|------|------|------|
| 按钮悬停 | 300ms | Expo Out | 按钮抬起效果 |
| 卡片悬停 | 300ms | Expo Out | 卡片抬起+阴影 |
| 下拉菜单 | 600ms | Expo Out | 菜单展开 |
| Modal弹出 | 600ms | Expo Out | 对话框出现 |
| Toast通知 | 600ms | Expo Out | 通知滑入 |
| 列表加载 | 600ms | Expo Out | 交错淡入 |
| 页面切换 | 600ms | Expo Out | 内容切换 |

### 按组件选择

| 组件 | 动画效果 | Tailwind类 |
|------|---------|------------|
| 按钮 | 悬停抬起 | `hover:-translate-y-0.5 transition-300` |
| 链接 | 颜色渐变 | `hover:text-accent transition-300` |
| 输入框 | 聚焦边框 | `focus:ring-2 transition-300` |
| 下拉菜单 | 展开+淡入 | `animate-slide-down` |
| Modal | 缩放+淡入 | `animate-scale-in` |
| Toast | 滑入 | `animate-slide-down` |
| 卡片 | 抬起+缩放 | `hover:-translate-y-1 hover:scale-105` |

---

## ✅ 最佳实践

### 正确用法

```css
/* ✅ 使用统一缓动函数 */
.element {
  transition: all var(--duration-fast) var(--ease-expo-out);
}

/* ✅ 组合多个属性 */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* ✅ 使用交错延迟 */
.list-item {
  transition-delay: calc(var(--index) * 50ms);
}

/* ✅ 响应式动画（移动端关闭） */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 错误用法

```css
/* ❌ 不要使用过长时长 */
.element {
  transition: all 2s;  /* 太慢了 */
}

/* ❌ 不要过度动画 */
.element {
  transition: all 300ms;
  animation: rotate 1s infinite;  /* 过于花哨 */
}

/* ❌ 不要忘记性能优化 */
.element {
  transition: width 300ms;  /* width 会触发重排，应该用 transform: scaleX() */
}

/* ❌ 不要混用不同缓动 */
.element {
  transition: opacity 300ms ease-in,
              transform 300ms ease-out;  /* 不一致 */
}
```

---

## ⚡ 性能优化建议

### 1. 使用 transform 和 opacity

```css
/* ✅ 高性能 - 仅触发合成 */
.element {
  transform: translateY(-2px);
  opacity: 0.8;
}

/* ❌ 低性能 - 触发重排/重绘 */
.element {
  top: -2px;
  background-color: rgba(0, 0, 0, 0.8);
}
```

### 2. 使用 will-change

```css
.element {
  will-change: transform, opacity;
}

/* 动画结束后移除 */
.element.animated {
  will-change: auto;
}
```

### 3. 避免同时动画多个属性

```css
/* ✅ 只动画需要的属性 */
.element {
  transition: transform 300ms, opacity 300ms;
}

/* ❌ 动画所有属性 */
.element {
  transition: all 300ms;
}
```

### 4. 响应式动画控制

```css
/* 移动端关闭复杂动画 */
@media (max-width: 768px) {
  .complex-animation {
    animation: none;
  }
}

/* 尊重用户偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎨 完整示例

### 示例1: 交互式按钮

```jsx
<button className="
  px-4 py-2 rounded
  bg-accent text-white font-medium
  transition-all duration-300 ease-expo-out
  hover:-translate-y-0.5 hover:shadow-lg
  active:translate-y-0 active:shadow-sm
  focus:outline-none focus:ring-2 focus:ring-accent
">
  立即开始
</button>
```

### 示例2: 动画卡片

```jsx
<div className="
  group rounded-lg overflow-hidden
  transition-all duration-300 ease-expo-out
  hover:-translate-y-1 hover:shadow-2xl
">
  <img 
    className="
      w-full h-48 object-cover
      transition-transform duration-600 ease-expo-out
      group-hover:scale-105
    "
    src="image.jpg" 
    alt="卡片"
  />
  <div className="p-4">
    <h3 className="text-xl font-semibold">标题</h3>
    <p className="text-gray-600">描述文字</p>
  </div>
</div>
```

### 示例3: 下拉菜单

```jsx
function Dropdown({ isOpen }) {
  return (
    <div className={`
      absolute top-full mt-2
      bg-white rounded-lg shadow-lg
      transition-all duration-600 ease-expo-out
      ${isOpen 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      }
    `}>
      <ul className="py-2">
        <li className="px-4 py-2 hover:bg-gray-100 transition-colors duration-300">
          选项1
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 transition-colors duration-300">
          选项2
        </li>
      </ul>
    </div>
  );
}
```

---

## 🔗 相关文档

- **配合使用**: [01-colors.md](./01-colors.md) - 颜色过渡
- **配合使用**: [03-spacing.md](./03-spacing.md) - 间距变化
- **配合使用**: [04-radius.md](./04-radius.md) - 圆角动画

---

## 💡 Cursor 使用提示

### 快速引用
```
@docs/design-system/06-animation.md 给这个组件添加悬停动画
```

### Rules for AI (.cursorrules)
```markdown
# 动画系统规则
- 所有动画使用 Expo Out 缓动 (cubic-bezier(0.16, 1, 0.3, 1))
- 微交互使用 300ms，展开动画使用 600ms
- 按钮悬停使用 translateY(-2px) + shadow
- 只动画 transform 和 opacity (性能优化)
- 列表项使用交错延迟 (50ms间隔)
- 添加 prefers-reduced-motion 媒体查询
- 避免使用 all 过渡，明确指定属性
```

---

**文档结束** | 返回: [README.md](./README.md)