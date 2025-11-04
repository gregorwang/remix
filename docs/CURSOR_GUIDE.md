# 🚀 Cursor 开发快速指南

## 📖 这份文档是给谁的？

这是一份专为 **设计小白 + AI 驱动开发** 量身定制的指南。如果你：
- ✅ 不太懂设计，但想让网站看起来专业
- ✅ 使用 Cursor AI 来编写代码
- ✅ 想要统一、美观的页面和组件
- ✅ 需要一个完整的设计标准来指导 AI

那么这份指南就是为你准备的！

---

## 🎯 快速开始（3分钟）

### 你已经有什么？

你的项目已经包含了**完整的设计系统**：

```
/docs/design-system/
├── 01-colors.md          # 颜色规范（暖色调，柔和）
├── 02-typography.md      # 字体规范（流体响应式）
├── 03-spacing.md         # 间距规范（统一的间距）
├── 04-radius.md          # 圆角规范（柔和的圆角）
├── 05-grid.md            # 网格系统（12列布局）
├── 06-animation.md       # 动画规范（平滑过渡）
└── 07-layout-components.md  # 页面和组件规范 ⭐重点
```

### 关键文档

**99%的情况下，你只需要用这一个：**
👉 `07-layout-components.md` - 页面布局与组件设计规范

这个文档包含：
- ✅ 3种页面布局模式（标准页面、全屏页面、卡片网格）
- ✅ 8种核心组件（Header、Hero、Section、Card、Button、Form、List、Footer）
- ✅ 响应式设计标准
- ✅ 完整的代码示例

---

## 💡 如何在 Cursor 中使用？

### 场景1：创建一个新页面

#### Step 1: 在 Cursor Chat 中输入

```
@docs/design-system/07-layout-components.md

创建一个"关于我"页面，包含：
1. 导航栏
2. Hero区块，标题是"关于我"，副标题是"一个热爱技术的开发者"
3. 个人简介区块（3个特点卡片）
4. 技能展示区块
5. 页脚

要求：
- 使用标准页面布局模式
- 确保响应式设计
- 添加悬停动画
```

#### Step 2: Cursor 会自动

- ✅ 读取设计规范
- ✅ 使用正确的颜色、字体、间距
- ✅ 创建符合规范的组件
- ✅ 添加响应式和动画

---

### 场景2：创建一个组件

#### 在 Cursor 中输入：

```
@docs/design-system/07-layout-components.md

创建一个产品卡片组件，包含：
- 产品图片（封面）
- 产品名称
- 产品价格
- 购买按钮

要求：
- 使用卡片设计规范
- 悬停时有抬起效果
- 图片悬停时有缩放效果
```

---

### 场景3：修改现有页面布局

#### 在 Cursor 中输入：

```
@docs/design-system/07-layout-components.md

请优化首页的布局：
1. 调整间距符合设计规范
2. 统一颜色使用（主色60%、辅色30%、点缀色10%）
3. 为所有按钮添加悬停动画
4. 确保在移动端和桌面端都能正常显示
```

---

### 场景4：创建表单

#### 在 Cursor 中输入：

```
@docs/design-system/07-layout-components.md

创建一个联系表单，包含：
- 姓名输入框
- 邮箱输入框
- 留言文本域
- 提交按钮

要求：
- 使用表单组件规范
- 输入框聚焦时有边框高亮
- 按钮有悬停动画
```

---

## 📋 设计系统核心概念（5分钟速览）

### 1. 颜色系统（60-30-10法则）

```css
主色（60%）: #FAF9F5  /* 温暖奶白色 - 用于主背景 */
辅色（30%）: #F5F4ED  /* 浅米灰色 - 用于卡片背景 */
点缀色（10%）: #D97757  /* 陶土橙色 - 用于按钮、链接 */
文字色: #141413  /* 深黑褐色 - 用于主文字 */
```

**使用方法**：
```jsx
// 页面背景
<div className="bg-white">  // 主色

// 卡片背景
<div className="bg-gray-50">  // 辅色

// 按钮
<button className="bg-accent">  // 点缀色
```

---

### 2. 字体系统

```jsx
// 大标题（Hero）
<h1 className="text-5xl font-bold">

// 页面标题
<h1 className="text-4xl font-bold">

// 章节标题
<h2 className="text-3xl font-semibold">

// 正文
<p className="text-base leading-relaxed">

// 按钮
<button className="text-sm font-medium">
```

---

### 3. 间距系统

```jsx
// Section间距（页面级）
<section className="py-section-main">  // 96-128px

// 卡片间距
<div className="p-6">  // 24px

// 内容间距
<div className="space-y-4">  // 16px
```

---

### 4. 动画系统

```jsx
// 按钮悬停
<button className="
  transition-all duration-300 ease-expo-out
  hover:-translate-y-0.5 hover:shadow-lg
">

// 卡片悬停
<div className="
  transition-all duration-300 ease-expo-out
  hover:-translate-y-1 hover:shadow-2xl
">
```

---

## 🎨 3种页面布局模式

### 模式1：标准页面（最常用）⭐

```
┌─────────────────┐
│    Header       │  ← 白色导航栏
├─────────────────┤
│    Hero         │  ← 大标题区域（深色背景）
├─────────────────┤
│   Section 1     │  ← 白色背景
├─────────────────┤
│   Section 2     │  ← 浅灰背景
├─────────────────┤
│    Footer       │  ← 深色页脚
└─────────────────┘
```

**适用于**：首页、关于页、功能页

**Cursor 提示词**：
```
@docs/design-system/07-layout-components.md
创建一个标准页面，包含Header、Hero、2个Content Section和Footer
```

---

### 模式2：全屏沉浸式

```
┌─────────────────┐
│ Floating Header │  ← 半透明/浮动导航
├─────────────────┤
│                 │
│  Full Screen    │  ← 全屏内容（渐变背景）
│    Content      │
│                 │
└─────────────────┘
```

**适用于**：游戏页面、音乐页面、作品集

**Cursor 提示词**：
```
@docs/design-system/07-layout-components.md
创建一个全屏沉浸式页面，深色渐变背景
```

---

### 模式3：卡片网格

```
┌────────────────────────┐
│  Header                │
├────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ │
│  │Card│ │Card│ │Card│ │
│  └────┘ └────┘ └────┘ │
│  ┌────┐ ┌────┐ ┌────┐ │
│  │Card│ │Card│ │Card│ │
│  └────┘ └────┘ └────┘ │
└────────────────────────┘
```

**适用于**：产品展示、图片画廊

**Cursor 提示词**：
```
@docs/design-system/07-layout-components.md
创建一个卡片网格页面，移动端1列，平板2列，桌面4列
```

---

## ✅ 检查清单：确保你的页面符合规范

创建完页面后，让 Cursor 帮你检查：

```
@docs/design-system/07-layout-components.md

请检查这个页面是否符合设计规范：
1. 颜色使用是否正确（主色60%、辅色30%、点缀色10%）
2. 字体大小是否符合规范
3. 间距是否统一
4. 是否有悬停动画
5. 响应式设计是否完整
```

---

## 🎯 常见问题

### Q1: 我不知道该用什么颜色？
**A**: 只用这4个：
- 白色背景：`bg-white`
- 卡片背景：`bg-gray-50`
- 按钮：`bg-accent`（橙色）
- 文字：`text-gray-900`

### Q2: 间距怎么选？
**A**: 记住3个：
- 小间距：`space-y-4`（元素之间）
- 中间距：`p-6`（卡片内部）
- 大间距：`py-section-main`（Section之间）

### Q3: 怎么让卡片有悬停效果？
**A**: 复制这段：
```jsx
className="
  transition-all duration-300 ease-expo-out
  hover:-translate-y-1 hover:shadow-2xl
"
```

### Q4: 怎么让页面响应式？
**A**: 使用这个模式：
```jsx
className="
  grid
  grid-cols-1          // 移动端1列
  md:grid-cols-2       // 平板2列
  lg:grid-cols-4       // 桌面4列
  gap-4
"
```

---

## 🚀 进阶使用

### 1. 如果需要特殊颜色

先在 Cursor 中问：
```
@docs/design-system/01-colors.md
我想用一个深色背景，应该用什么颜色？
```

### 2. 如果需要复杂动画

参考动画文档：
```
@docs/design-system/06-animation.md
创建一个下拉菜单，有展开动画
```

### 3. 如果需要复杂布局

参考网格系统：
```
@docs/design-system/05-grid.md
创建一个博客布局，8列文章+4列侧边栏
```

---

## 📚 完整工作流程示例

### 场景：创建一个作品集页面

#### Step 1: 规划页面结构
```
1. Hero区块（标题+简介）
2. 作品展示区（卡片网格）
3. 技能展示区
4. 联系方式区
```

#### Step 2: 在 Cursor 中输入
```
@docs/design-system/07-layout-components.md

创建一个作品集页面：

1. Hero区块：
   - 标题："我的作品集"
   - 副标题："展示我的设计和开发作品"
   - 深色渐变背景

2. 作品展示区：
   - 卡片网格布局（移动端1列，桌面3列）
   - 每个作品卡片包含：图片、标题、描述、标签
   - 悬停时卡片抬起，图片缩放

3. 技能展示区：
   - 3个技能卡片（HTML/CSS、JavaScript、React）
   - 统计数字显示

4. 联系方式：
   - 邮箱、GitHub、LinkedIn链接
   - 深色背景

要求：
- 使用标准页面布局
- 符合颜色、字体、间距规范
- 添加所有悬停动画
- 确保响应式设计
```

#### Step 3: 检查和调整
```
@docs/design-system/07-layout-components.md

请检查这个页面，确保：
1. Section间距使用 py-section-main
2. 颜色对比度足够
3. 所有按钮和卡片有悬停动画
4. 移动端体验良好
```

---

## 🎉 总结

### 你需要记住的：

1. **一个核心文档**：`07-layout-components.md`
2. **三种布局模式**：标准、全屏、卡片网格
3. **四个核心颜色**：白色、浅灰、橙色、深色
4. **简单的提示词模板**：
   ```
   @docs/design-system/07-layout-components.md
   创建一个【页面名称】，包含【具体需求】
   ```

### 下一步：

1. ✅ 打开 Cursor
2. ✅ 在 Chat 中 @ 引用文档
3. ✅ 描述你想要的页面/组件
4. ✅ 让 AI 帮你实现
5. ✅ 检查是否符合规范

---

**现在就开始用 Cursor 创建你的第一个符合规范的页面吧！** 🚀

有任何问题，随时在 Cursor 中 @ 相关文档，AI 会帮你解决。
