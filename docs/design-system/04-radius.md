# Claude 设计系统 - 圆角系统 (Border Radius System)

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-03
- **依赖**: 无
- **配合使用**: spacing.md (组件尺寸), colors.md (边框颜色)

---

## 🏗️ 系统架构

### 核心变量定义

```css
:root {
  /* 静态圆角 - 固定尺寸 */
  --radius--x-small: 0.25rem;    /* 4px */
  --radius--small: 0.5rem;       /* 8px */
  --radius--main: 0.75rem;       /* 12px - 默认标准 */
  --radius--large: 1rem;         /* 16px */
  
  /* 响应式圆角 - 流体尺寸 */
  --radius--x-large: clamp(1rem, 0.857rem + 0.714vw, 1.5rem);     /* 16-24px */
  --radius--xx-large: clamp(1rem, 0.714rem + 1.429vw, 2rem);      /* 16-32px */
}
```

---

## 🎯 设计理念

### 1. 分级逻辑

- **基础递增**: 前4级采用 `0.25rem` (4px) 均匀递增
- **渐进式**: 4→8→12→16px 形成视觉节奏
- **响应式扩展**: 大尺寸采用 `clamp()` 实现流体缩放

### 2. 语义化命名

```
x-small → small → main → large → x-large → xx-large
微小     小      标准    大      超大      特大
```

### 3. 核心优势

✅ **视觉连贯性**
- 0.25rem 等差递增确保视觉和谐
- 避免圆角尺寸跳跃造成的不协调

✅ **开发效率**
- 6个选项覆盖99%场景，减少决策成本
- 命名直观，无需查文档即可使用

✅ **响应式智能**
- x-large/xx-large 自动适配视口
- 无需手写媒体查询

✅ **可维护性**
- CSS变量集中管理
- 修改一处，全局生效

---

## 📊 应用规范

### 场景映射表

| 圆角规格 | 数值 | 适用场景 | 示例组件 |
|---------|------|---------|----------|
| x-small | 4px | 微小元素、内嵌标签 | Badge、Tag、Chip、状态点 |
| small | 8px | 小型交互元素 | 小按钮、Dropdown、Tooltip |
| main | 12px | 标准UI控件（最常用） | 按钮、输入框、选择器 |
| large | 16px | 中大型容器 | Card、Panel、Modal |
| x-large | 16-24px | 大型容器（响应式） | 特色卡片、侧边栏 |
| xx-large | 16-32px | 页面级容器（响应式） | Hero区块、大型对话框 |

---

## 🎨 Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    borderRadius: {
      'xs': '0.25rem',    // 4px
      'sm': '0.5rem',     // 8px
      'DEFAULT': '0.75rem', // 12px - main作为默认值
      'lg': '1rem',       // 16px
      'xl': 'clamp(1rem, 0.857rem + 0.714vw, 1.5rem)',
      '2xl': 'clamp(1rem, 0.714rem + 1.429vw, 2rem)',
    }
  }
}
```

---

## 🔧 使用示例

### CSS Modules用法

```css
.card {
  border-radius: var(--radius--large);
}

.tag {
  border-radius: var(--radius--x-small);
}

.hero-section {
  border-radius: var(--radius--xx-large);
}
```

### Tailwind 用法

```jsx
// Badge - 最小圆角
<span className="rounded-xs">NEW</span>

// 按钮 - 标准圆角
<button className="rounded">点击</button>

// 卡片 - 大圆角
<div className="rounded-lg">卡片内容</div>

// Hero区域 - 响应式圆角
<section className="rounded-2xl">Hero内容</section>
```

---

## 📐 响应式公式解析

### clamp() 函数结构

```css
clamp(最小值, 理想值, 最大值)
```

### x-large 圆角计算

```css
--radius--x-large: clamp(
  1rem,                              /* 最小 16px */
  0.857rem + 0.714vw,                /* 流体计算 */
  1.5rem                             /* 最大 24px */
);
```

**计算逻辑**:
- 视口宽度 320px 时 ≈ 16px
- 视口宽度 1440px 时 ≈ 24px
- 中间视口平滑过渡

### xx-large 圆角计算

```css
--radius--xx-large: clamp(
  1rem,                              /* 最小 16px */
  0.714rem + 1.429vw,                /* 流体计算 */
  2rem                               /* 最大 32px */
);
```

---

## 🎯 最佳实践

### ✅ 推荐做法

#### 1. 优先使用main作为默认值

```css
.default-element {
  border-radius: var(--radius--main); /* 12px 适合大多数场景 */
}
```

#### 2. 嵌套元素递减原则

```css
.card {
  border-radius: var(--radius--large); /* 外层 16px */
}

.card-tag {
  border-radius: var(--radius--x-small); /* 内层 4px */
}
```

#### 3. 响应式容器使用x-large/xx-large

```css
.hero-container {
  border-radius: var(--radius--xx-large); /* 自动响应 */
}
```

### ❌ 避免做法

```css
/* ❌ 不要混用固定值 */
.bad-example {
  border-radius: 10px; /* 破坏系统一致性 */
}

/* ❌ 不要过度使用大圆角 */
.button {
  border-radius: var(--radius--xx-large); /* 按钮不需要32px圆角 */
}

/* ❌ 不要忽略语义 */
.small-tag {
  border-radius: var(--radius--large); /* 小标签用大圆角不合理 */
}
```

---

## 📋 圆角使用速查表

### 按组件类型选择

| 组件类型 | 圆角选择 | Tailwind类 |
|---------|---------|------------|
| Badge/Tag | x-small (4px) | `rounded-xs` |
| 状态指示点 | x-small (4px) | `rounded-xs` |
| 小按钮 | small (8px) | `rounded-sm` |
| Tooltip | small (8px) | `rounded-sm` |
| 标准按钮 | main (12px) | `rounded` |
| 输入框 | main (12px) | `rounded` |
| 下拉菜单 | main (12px) | `rounded` |
| 卡片 | large (16px) | `rounded-lg` |
| Modal | large (16px) | `rounded-lg` |
| 侧边栏 | x-large (16-24px) | `rounded-xl` |
| Hero区块 | xx-large (16-32px) | `rounded-2xl` |

### 按尺寸选择

| 元素大小 | 推荐圆角 | 视觉效果 |
|---------|---------|---------|
| 极小 (< 20px) | x-small (4px) | 微圆角 |
| 小 (20-40px) | small (8px) | 轻圆角 |
| 中 (40-80px) | main (12px) | 标准圆角 |
| 大 (80-200px) | large (16px) | 明显圆角 |
| 超大 (200-500px) | x-large (16-24px) | 柔和圆角 |
| 页面级 (> 500px) | xx-large (16-32px) | 强烈圆角 |

---

## 🎨 实际应用案例

### 案例1: 按钮组件

```jsx
// 主按钮 - 标准圆角
<button className="rounded px-4 py-2 bg-accent">
  主要操作
</button>

// 小按钮 - 小圆角
<button className="rounded-sm px-2 py-1 text-sm">
  次要操作
</button>

// 大按钮 - 大圆角
<button className="rounded-lg px-6 py-3 text-lg">
  突出操作
</button>
```

### 案例2: 卡片组件

```jsx
<div className="rounded-lg overflow-hidden">
  {/* 外层大圆角 */}
  <img src="cover.jpg" alt="封面" />
  <div className="p-4">
    <h3>卡片标题</h3>
    <span className="rounded-xs px-2 py-1 bg-accent">
      {/* 内层小圆角标签 */}
      NEW
    </span>
  </div>
</div>
```

### 案例3: Hero 区块

```jsx
<section className="rounded-2xl overflow-hidden">
  {/* 响应式圆角：手机16px → 桌面32px */}
  <div className="p-section-lg">
    <h1>欢迎标题</h1>
    <button className="rounded">开始使用</button>
  </div>
</section>
```

### 案例4: 表单输入

```jsx
<form className="space-y-2">
  <input 
    type="text" 
    className="rounded px-3 py-2 w-full"
    placeholder="用户名"
  />
  <input 
    type="password" 
    className="rounded px-3 py-2 w-full"
    placeholder="密码"
  />
  <button className="rounded w-full py-2">
    登录
  </button>
</form>
```

---

## 🧪 流体圆角计算示例

### 计算 x-large (16-24px)

```
手机端 (320px):
0.857rem + 0.714 * (3.2vw) ≈ 0.857 + 0.023 ≈ 0.88rem ≈ 14px
但 clamp 最小值限制为 1rem (16px)

平板端 (768px):
0.857rem + 0.714 * (7.68vw) ≈ 0.857 + 0.055 ≈ 0.91rem ≈ 14.5px
但 clamp 最小值限制为 1rem (16px)

桌面端 (1440px):
0.857rem + 0.714 * (14.4vw) ≈ 0.857 + 0.103 ≈ 0.96rem ≈ 15.4px
逐渐接近最大值 1.5rem (24px)
```

---

## ⚙️ CSS 变量完整定义

```css
:root {
  /* 固定圆角 */
  --radius--x-small: 0.25rem;    /* 4px */
  --radius--small: 0.5rem;       /* 8px */
  --radius--main: 0.75rem;       /* 12px */
  --radius--large: 1rem;         /* 16px */
  
  /* 流体圆角 */
  --radius--x-large: clamp(
    1rem, 
    calc(0.857rem + 0.714vw), 
    1.5rem
  );
  
  --radius--xx-large: clamp(
    1rem, 
    calc(0.714rem + 1.429vw), 
    2rem
  );
  
  /* 语义化别名 (可选) */
  --radius-default: var(--radius--main);
  --radius-button: var(--radius--main);
  --radius-card: var(--radius--large);
  --radius-modal: var(--radius--large);
}
```

---

## 🔗 相关文档

- **配合使用**: [03-spacing.md](./03-spacing.md) - 圆角与内边距配合
- **配合使用**: [01-colors.md](./01-colors.md) - 边框颜色
- **应用**: [05-grid.md](./05-grid.md) - 容器圆角

---

## 💡 Cursor 使用提示

### 快速引用
```
@docs/design-system/04-radius.md 给这个组件添加合适的圆角
```

### Rules for AI (.cursorrules)
```markdown
# 圆角系统规则
- 所有圆角必须从设计系统选择 (xs/sm/DEFAULT/lg/xl/2xl)
- 小组件(Badge/Tag)使用 rounded-xs (4px)
- 按钮使用 rounded (12px)
- 卡片使用 rounded-lg (16px)
- Hero区块使用 rounded-2xl (16-32px 响应式)
- 嵌套元素外大内小 (外层 lg, 内层 xs)
- 禁止使用任意值如 rounded-[10px]
```

---

**文档结束** | 下一步: [05-grid.md](./05-grid.md)