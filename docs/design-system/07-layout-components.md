# 页面布局与组件设计规范

## 📋 文档信息
- **版本**: 1.0
- **更新日期**: 2025-11-04
- **依赖**: 所有基础设计系统文档
- **目标**: 为 AI 编程工具（Cursor）提供完整的页面和组件设计指导

---

## 🎯 设计原则总览

### 核心设计哲学
1. **一致性优先**: 所有页面遵循统一的布局模式
2. **内容为王**: 布局服务于内容展示，不过度设计
3. **渐进式增强**: 移动优先，逐步适配大屏
4. **视觉层次**: 清晰的信息架构和视觉引导
5. **用户体验**: 快速加载、平滑交互、无障碍访问

### 设计系统应用优先级
```
内容结构 → 间距系统 → 颜色系统 → 字体系统 → 圆角系统 → 动画系统
```

---

## 📐 页面布局模式

### 模式1：标准页面布局（推荐）

```
┌─────────────────────────────────────────┐
│           Header (固定高度)              │
├─────────────────────────────────────────┤
│        Hero Section (可选)               │
│      section-page-top spacing           │
├─────────────────────────────────────────┤
│      Main Content Section 1              │
│        section-main spacing             │
├─────────────────────────────────────────┤
│      Main Content Section 2              │
│        section-main spacing             │
├─────────────────────────────────────────┤
│           Footer                         │
└─────────────────────────────────────────┘
```

#### 应用场景
- 首页、关于页、功能页等标准内容页面

#### 代码实现
```jsx
<div className="font-sans">
  {/* Header - 白色背景，固定导航 */}
  <Header />

  {/* Hero Section - 大间距顶部 */}
  <section className="py-section-page-top bg-gradient-to-br from-purple-900 to-indigo-900">
    <div className="container mx-auto px-6 max-w-main">
      <h1 className="text-5xl font-bold text-white mb-4">主标题</h1>
      <p className="text-lg text-white/80">副标题描述</p>
    </div>
  </section>

  {/* Content Sections - 标准section间距 */}
  <section className="py-section-main bg-white">
    <div className="container mx-auto px-6 max-w-main">
      {/* 内容 */}
    </div>
  </section>

  {/* Footer */}
  <Footer />
</div>
```

#### 关键参数
- **最大宽度**: `max-w-main` (1440px)
- **页面边距**: `px-6` (响应式，移动端更小)
- **顶部间距**: `section-page-top` (208-240px)
- **section间距**: `section-main` (96-128px)

---

### 模式2：全屏沉浸式布局

```
┌─────────────────────────────────────────┐
│    Floating Header (半透明/白色)          │
├─────────────────────────────────────────┤
│                                          │
│     Full Screen Content Area             │
│     (背景图/渐变/视频)                    │
│                                          │
│         min-h-screen                     │
│                                          │
├─────────────────────────────────────────┤
│      Scrollable Content Sections         │
└─────────────────────────────────────────┘
```

#### 应用场景
- 游戏页面、音乐页面、作品集等视觉驱动页面

#### 代码实现
```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
  {/* 背景装饰 */}
  <div className="absolute inset-0">
    {/* 粒子效果或背景元素 */}
  </div>

  {/* 主内容 */}
  <div className="relative z-10">
    <div className="container mx-auto px-6 py-20">
      {/* 页面内容 */}
    </div>
  </div>
</div>
```

---

### 模式3：卡片网格布局

```
┌─────────────────────────────────────────┐
│              Page Header                 │
├─────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │Card │  │Card │  │Card │  │Card │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │Card │  │Card │  │Card │  │Card │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
└─────────────────────────────────────────┘
```

#### 代码实现
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <div
      key={item.id}
      className="
        bg-white rounded-lg p-4
        transition-all duration-300 ease-expo-out
        hover:-translate-y-1 hover:shadow-2xl
      "
    >
      {/* 卡片内容 */}
    </div>
  ))}
</div>
```

#### 响应式断点
- **移动端**: 1列 (`grid-cols-1`)
- **平板**: 2列 (`md:grid-cols-2`)
- **桌面**: 4列 (`lg:grid-cols-4`)

---

## 🎨 组件设计规范

### 1. Header 导航栏

#### 设计规范
```css
背景: 白色 (#ffffff)
高度: 固定（基于内容）
边距: px-6 lg:px-8
字体: text-sm font-semibold
颜色: text-gray-900 (主色)
悬停: hover:text-gray-600 + transition-colors
```

#### 结构标准
```jsx
<header className="bg-white">
  <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
    {/* Logo区域 */}
    <div className="flex lg:flex-1">
      <Link to="/" className="-m-1.5 p-1.5">
        <div className="text-3xl font-bold text-gray-900">
          LOGO<span className="text-accent">TEXT</span>
        </div>
      </Link>
    </div>

    {/* 桌面导航 */}
    <div className="hidden lg:flex lg:gap-x-12">
      {navigation.map(item => (
        <Link
          key={item.name}
          to={item.href}
          className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </div>

    {/* 用户操作区域 */}
    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
      {/* 登录/用户信息 */}
    </div>
  </nav>
</header>
```

#### 移动端适配
- 汉堡菜单按钮
- 全屏侧边栏弹出
- 导航项垂直堆叠

---

### 2. Hero 区块

#### 设计规范
```css
背景: 渐变 (from-purple-900 to-indigo-900)
间距: py-section-page-top (208-240px)
最大宽度: max-w-main
标题: text-5xl font-bold
副标题: text-lg text-white/80
```

#### 代码模板
```jsx
<section className="py-section-page-top bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
  <div className="container mx-auto px-6 max-w-main">
    <div className="text-center">
      {/* 主标题 */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
        欢迎来到我的网站
      </h1>

      {/* 副标题 */}
      <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
        这是一段描述文字，介绍网站的主要功能和特点
      </p>

      {/* CTA 按钮 */}
      <div className="mt-8 flex gap-4 justify-center">
        <button className="
          px-6 py-3 rounded bg-accent text-white font-medium
          transition-all duration-300 ease-expo-out
          hover:-translate-y-0.5 hover:shadow-lg
        ">
          立即开始
        </button>
      </div>
    </div>
  </div>
</section>
```

#### 变体
- **居中式**: 标题、描述、按钮都居中
- **左对齐式**: 内容左对齐，右侧可放图片
- **全屏式**: `min-h-screen flex items-center`

---

### 3. Section 内容区块

#### 设计规范
```css
间距: py-section-main (96-128px)
背景: 交替使用 bg-white 和 bg-gray-50
最大宽度: max-w-main
标题: text-4xl md:text-5xl font-bold mb-16
```

#### 标准结构
```jsx
<section className="py-section-main bg-white">
  <div className="container mx-auto px-6 max-w-main">
    {/* Section标题 */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
        功能特性
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        探索网站的核心功能
      </p>
    </div>

    {/* Section内容 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 内容卡片 */}
    </div>
  </div>
</section>
```

#### 背景交替模式
```jsx
{/* 第一个section - 白色 */}
<section className="py-section-main bg-white">...</section>

{/* 第二个section - 浅灰 */}
<section className="py-section-main bg-gray-50">...</section>

{/* 第三个section - 白色 */}
<section className="py-section-main bg-white">...</section>
```

---

### 4. Card 卡片组件

#### 基础卡片
```jsx
<div className="
  bg-white rounded-lg p-6 shadow-sm
  border border-gray-200
  transition-all duration-300 ease-expo-out
  hover:-translate-y-1 hover:shadow-xl
">
  {/* 卡片头部 - 图片 */}
  <div className="mb-4">
    <img
      src={image}
      alt={title}
      className="w-full h-48 object-cover rounded-lg"
    />
  </div>

  {/* 卡片标题 */}
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    {title}
  </h3>

  {/* 卡片描述 */}
  <p className="text-base text-gray-600 leading-relaxed">
    {description}
  </p>

  {/* 卡片底部 - 标签或按钮 */}
  <div className="mt-4 flex gap-2">
    {tags.map(tag => (
      <span
        key={tag}
        className="px-2 py-1 text-xs font-semibold rounded-xs bg-gray-100 text-gray-700"
      >
        {tag}
      </span>
    ))}
  </div>
</div>
```

#### 卡片变体

**1. 图片卡片（游戏、相册）**
```jsx
<div className="group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-300">
  <div className="relative overflow-hidden">
    <img
      src={cover}
      className="w-full h-64 object-cover transition-transform duration-600 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
    </div>
  </div>
  <div className="p-4">
    <p className="text-sm text-gray-600">{description}</p>
  </div>
</div>
```

**2. 统计卡片**
```jsx
<div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white">
  <div className="text-4xl font-bold mb-2">{value}</div>
  <div className="text-sm text-white/80">{label}</div>
</div>
```

**3. 特色卡片（高亮）**
```jsx
<div className="
  bg-gradient-to-br from-accent to-accent-hover
  text-white rounded-2xl p-8
  transform hover:scale-105 transition-all duration-300
">
  <div className="text-2xl font-bold mb-4">{title}</div>
  <p className="text-white/90 leading-relaxed">{content}</p>
</div>
```

---

### 5. Button 按钮组件

#### 主要按钮
```jsx
<button className="
  px-6 py-3 rounded
  bg-accent text-white font-medium text-sm
  transition-all duration-300 ease-expo-out
  hover:-translate-y-0.5 hover:shadow-lg
  active:translate-y-0 active:shadow-sm
  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
">
  主要操作
</button>
```

#### 次要按钮
```jsx
<button className="
  px-6 py-3 rounded
  bg-gray-200 text-gray-800 font-medium text-sm
  transition-all duration-300 ease-expo-out
  hover:bg-gray-300
">
  次要操作
</button>
```

#### 文字按钮
```jsx
<button className="
  px-4 py-2
  text-accent font-medium text-sm
  transition-colors duration-300
  hover:text-accent-hover
">
  文字按钮
</button>
```

#### 按钮尺寸
```jsx
// 大按钮
<button className="px-8 py-4 text-base">大按钮</button>

// 标准按钮
<button className="px-6 py-3 text-sm">标准按钮</button>

// 小按钮
<button className="px-4 py-2 text-xs">小按钮</button>
```

---

### 6. Form 表单组件

#### 输入框
```jsx
<div className="space-y-2">
  <label className="block text-sm font-semibold text-gray-700">
    用户名
  </label>
  <input
    type="text"
    className="
      w-full px-4 py-3 rounded
      border border-gray-300
      bg-white text-gray-900
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
      transition-all duration-300
    "
    placeholder="请输入用户名"
  />
</div>
```

#### 文本域
```jsx
<textarea
  className="
    w-full px-4 py-3 rounded
    border border-gray-300
    bg-white text-gray-900
    placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
    transition-all duration-300
    resize-none
  "
  rows={4}
  placeholder="请输入内容"
/>
```

#### 表单布局
```jsx
<form className="space-y-4 max-w-md mx-auto">
  {/* 输入框 */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">标签</label>
    <input type="text" className="..." />
  </div>

  {/* 提交按钮 */}
  <button type="submit" className="w-full px-6 py-3 rounded bg-accent text-white">
    提交
  </button>
</form>
```

---

### 7. List 列表组件

#### 垂直列表
```jsx
<div className="space-y-4">
  {items.map(item => (
    <div
      key={item.id}
      className="
        p-4 rounded-lg bg-white border border-gray-200
        hover:border-accent hover:shadow-md
        transition-all duration-300
      "
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
        <div className="text-sm text-gray-500">{item.meta}</div>
      </div>
    </div>
  ))}
</div>
```

#### 网格列表
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
      {/* 列表项内容 */}
    </div>
  ))}
</div>
```

---

### 8. Footer 页脚组件

#### 标准页脚
```jsx
<footer className="bg-gray-900 text-white py-12">
  <div className="container mx-auto px-6 max-w-main">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* 列1: Logo和简介 */}
      <div className="col-span-2">
        <div className="text-2xl font-bold mb-4">LOGO</div>
        <p className="text-gray-400 leading-relaxed max-w-sm">
          网站简介和描述文字
        </p>
      </div>

      {/* 列2: 快速链接 */}
      <div>
        <h3 className="font-semibold mb-4">快速链接</h3>
        <ul className="space-y-2 text-gray-400">
          <li><Link to="/about" className="hover:text-white transition-colors">关于</Link></li>
          <li><Link to="/contact" className="hover:text-white transition-colors">联系</Link></li>
        </ul>
      </div>

      {/* 列3: 社交媒体 */}
      <div>
        <h3 className="font-semibold mb-4">关注我们</h3>
        <div className="flex gap-4">
          {/* 社交图标 */}
        </div>
      </div>
    </div>

    {/* 版权信息 */}
    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
      © 2025 Your Company. All rights reserved.
    </div>
  </div>
</footer>
```

---

## 📱 响应式设计规范

### 断点系统
```javascript
// Tailwind 默认断点
sm: 640px   // 小屏幕
md: 768px   // 平板
lg: 1024px  // 桌面
xl: 1280px  // 大桌面
2xl: 1536px // 超大屏
```

### 响应式模式

#### 1. 移动优先
```jsx
{/* 默认移动端样式，然后逐步增强 */}
<div className="
  grid grid-cols-1          {/* 移动端1列 */}
  md:grid-cols-2            {/* 平板2列 */}
  lg:grid-cols-4            {/* 桌面4列 */}
  gap-4
">
```

#### 2. 隐藏/显示元素
```jsx
{/* 移动端隐藏，桌面显示 */}
<div className="hidden lg:block">桌面内容</div>

{/* 移动端显示，桌面隐藏 */}
<div className="lg:hidden">移动端内容</div>
```

#### 3. 文字缩放
```jsx
<h1 className="
  text-3xl              {/* 移动端 */}
  md:text-4xl           {/* 平板 */}
  lg:text-5xl           {/* 桌面 */}
  font-bold
">
```

#### 4. 间距调整
```jsx
<section className="
  py-12               {/* 移动端 */}
  md:py-16            {/* 平板 */}
  lg:py-section-main  {/* 桌面 */}
">
```

---

## 🎨 色彩应用规范

### 页面背景色
```jsx
// 主背景 - 白色
<section className="bg-white">

// 次背景 - 浅灰
<section className="bg-gray-50">

// 品牌背景 - 渐变
<section className="bg-gradient-to-br from-purple-900 to-indigo-900">

// 深色背景 - 暗色
<section className="bg-gray-900">
```

### 文字颜色
```jsx
// 主文字
<p className="text-gray-900">

// 次文字
<p className="text-gray-600">

// 辅助文字
<p className="text-gray-500">

// 品牌色文字
<p className="text-accent">

// 白色文字（深色背景）
<p className="text-white">
```

### 颜色对比度
确保文字可读性：
- 主文字 vs 白色背景: 对比度 ≥ 7:1
- 次文字 vs 白色背景: 对比度 ≥ 4.5:1
- 按钮文字 vs 按钮背景: 对比度 ≥ 4.5:1

---

## 📏 间距应用规范

### 组件内部间距
```jsx
// 小间距 - 元素之间
<div className="space-y-2">  // 8px

// 标准间距 - 内容组之间
<div className="space-y-4">  // 16px

// 大间距 - 区块之间
<div className="space-y-8">  // 32px
```

### 容器内边距
```jsx
// 小容器
<div className="p-4">  // 16px

// 标准容器
<div className="p-6">  // 24px

// 大容器
<div className="p-8">  // 32px
```

### Section间距
```jsx
// 小section
<section className="py-section-small">  // 64-96px

// 标准section
<section className="py-section-main">   // 96-128px

// 大section
<section className="py-section-large">  // 128-200px
```

---

## ✨ 动画应用规范

### 悬停效果
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

// 文字悬停
<a className="
  transition-colors duration-300
  hover:text-accent
">
```

### 展开动画
```jsx
<div className={`
  transition-all duration-600 ease-expo-out
  ${isOpen
    ? 'opacity-100 translate-y-0 max-h-96'
    : 'opacity-0 -translate-y-2 max-h-0'
  }
`}>
```

### 加载动画
```jsx
// 淡入
<div className="animate-fade-in">

// 滑入
<div className="animate-slide-down">

// 缩放
<div className="animate-scale-in">
```

---

## 📋 页面检查清单

### 设计一致性检查
- [ ] 使用了设计系统中的颜色
- [ ] 使用了设计系统中的字体大小
- [ ] 使用了设计系统中的间距
- [ ] 使用了设计系统中的圆角
- [ ] 使用了统一的动画缓动

### 响应式检查
- [ ] 在移动端（375px）正常显示
- [ ] 在平板（768px）正常显示
- [ ] 在桌面（1440px）正常显示
- [ ] 文字在所有尺寸下可读
- [ ] 按钮在所有尺寸下可点击

### 可访问性检查
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 所有交互元素可键盘访问
- [ ] 表单有明确的标签
- [ ] 图片有 alt 文字
- [ ] 链接有明确的文字描述

### 性能检查
- [ ] 图片使用懒加载
- [ ] 动画只使用 transform 和 opacity
- [ ] 没有过度复杂的嵌套
- [ ] CSS 类名没有冗余

---

## 🚀 Cursor 使用指南

### 1. 创建新页面时

**提示词模板**:
```
@docs/design-system/07-layout-components.md
@docs/design-system/01-colors.md
@docs/design-system/02-typography.md
@docs/design-system/03-spacing.md

创建一个【页面名称】页面，包含以下内容：
1. Header导航栏
2. Hero区块，标题为【标题】
3. 主内容区域，展示【内容描述】
4. Footer页脚

要求：
- 使用标准页面布局模式
- 遵循颜色、字体、间距规范
- 添加适当的悬停动画
- 确保响应式设计
```

### 2. 创建组件时

**提示词模板**:
```
@docs/design-system/07-layout-components.md
@docs/design-system/04-radius.md
@docs/design-system/06-animation.md

创建一个【组件名称】组件，功能是【功能描述】

要求：
- 使用卡片设计规范
- 添加悬停动画效果
- 使用设计系统的圆角和间距
- 包含响应式设计
```

### 3. 修改现有布局时

**提示词模板**:
```
@docs/design-system/07-layout-components.md

请优化【页面/组件名称】的布局，参考设计规范：
1. 调整间距符合section间距规范
2. 统一颜色使用
3. 添加悬停动画
4. 优化响应式表现
```

---

## 💡 设计建议

### DO（推荐做法）
✅ **使用一致的间距**: 所有section使用 `section-main` 或 `section-large`
✅ **保持视觉层次**: 标题、副标题、正文有明确的字号差异
✅ **适度使用动画**: 悬停效果提升交互感，不要过度
✅ **响应式优先**: 所有设计考虑移动端体验
✅ **颜色克制**: 主色60%、辅色30%、点缀色10%

### DON'T（避免做法）
❌ **硬编码数值**: 不要使用 `px-[23px]` 这样的任意值
❌ **过度设计**: 避免复杂的嵌套和花哨的效果
❌ **忽略对比度**: 确保文字在背景上清晰可读
❌ **不一致的风格**: 不要在同一页面使用多种设计风格
❌ **忽略性能**: 避免大量的动画和重排

---

## 📚 完整示例：标准页面

```jsx
import Header from "~/components/ui/Header";
import Footer from "~/components/ui/foot";

export default function ExamplePage() {
  return (
    <div className="font-sans">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-section-page-top bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-6 max-w-main">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              页面主标题
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              这是页面的副标题或描述文字，介绍页面的主要内容
            </p>
          </div>
        </div>
      </section>

      {/* Content Section 1 */}
      <section className="py-section-main bg-white">
        <div className="container mx-auto px-6 max-w-main">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              功能特性
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              探索核心功能
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  bg-white rounded-lg p-6 shadow-sm border border-gray-200
                  transition-all duration-300 ease-expo-out
                  hover:-translate-y-1 hover:shadow-xl
                "
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  特性 {item}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  这是特性的详细描述文字
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section 2 */}
      <section className="py-section-main bg-gray-50">
        <div className="container mx-auto px-6 max-w-main">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              关于我们
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              这是关于部分的内容，可以放置更多的描述信息
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
```

---

## 🔗 相关文档

- **基础系统**: [01-colors.md](./01-colors.md) - 颜色系统
- **基础系统**: [02-typography.md](./02-typography.md) - 字体系统
- **基础系统**: [03-spacing.md](./03-spacing.md) - 间距系统
- **基础系统**: [04-radius.md](./04-radius.md) - 圆角系统
- **基础系统**: [05-grid.md](./05-grid.md) - 网格系统
- **基础系统**: [06-animation.md](./06-animation.md) - 动画系统

---

**文档结束** | 返回: [README.md](./README.md)
