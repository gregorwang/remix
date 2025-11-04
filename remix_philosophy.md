# 图片Token重构 - 分步执行指南

## 🎯 目标
将photo.tsx和xiao.TSX从客户端获取token改为服务端生成token

## ⚠️ 重要提醒
- 每完成一步，立即测试验证
- 不要一次性修改所有文件
- 遇到问题立即回滚

---

## 第1步: 创建服务端工具函数 ✨

**目标**: 创建可复用的token生成工具

**执行**:
```bash
# 让Cursor执行:
"创建文件 app/utils/imageToken.server.ts，内容如下:"
```

**关键代码**:
```typescript
// app/utils/imageToken.server.ts
import crypto from 'crypto';

export interface TokenResult {
  imageName: string;
  imageUrl: string;
  token: string;
  expires: number;
}

export function generateImageToken(
  imageName: string,
  expiresInMinutes: number = 30
): TokenResult {
  const secret = process.env.AUTH_KEY_SECRET;
  if (!secret) throw new Error('AUTH_KEY_SECRET required');
  
  const baseUrl = process.env.IMAGE_BASE_URL || 'https://oss.wangjiajun.asia';
  const expires = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
  
  const message = `${imageName}:${expires}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(message).digest('hex');
  
  const token = Buffer.from(`${expires}:${signature}`).toString('base64url');
  const imageUrl = `${baseUrl}/${imageName}?token=${token}`;
  
  return { imageName, imageUrl, token, expires };
}

export function generateImageTokens(
  imageNames: string[],
  expiresInMinutes: number = 30
): TokenResult[] {
  return imageNames.map(name => generateImageToken(name, expiresInMinutes));
}
```

**验证**:
```bash
npm run build
# 应该没有报错
```

---

## 第2步: 修改photo.tsx的loader 🔧

**目标**: 在服务端批量生成所有图片token

**给Cursor的指令**:
```
修改 app/routes/photo.tsx 的 loader 函数(大约第70行):
1. 导入 generateImageTokens
2. 收集所有图片路径到一个数组
3. 批量生成token
4. 用带token的URL替换原始src
5. 返回数据时设置Cache-Control为 "public, max-age=300"
```

**核心改动**:
```typescript
import { generateImageTokens } from '~/utils/imageToken.server';

export async function loader() {
  // 1. 原始数据
  const rawHeroImage = { src: 'camera/ss.jpg', ... };
  const rawGalleries = [...];
  
  // 2. 收集所有路径
  const allPaths = [
    rawHeroImage.src,
    ...rawGalleries.flatMap(g => g.photos.map(p => p.src))
  ];
  
  // 3. 批量生成token
  const tokenResults = generateImageTokens(allPaths, 30);
  const tokenMap = new Map(tokenResults.map(r => [r.imageName, r.imageUrl]));
  
  // 4. 替换src
  const heroImage = { ...rawHeroImage, src: tokenMap.get(rawHeroImage.src)! };
  const photoGalleries = rawGalleries.map(g => ({
    ...g,
    photos: g.photos.map(p => ({ ...p, src: tokenMap.get(p.src)! }))
  }));
  
  // 5. 返回
  return json({ heroImage, photoGalleries, content: {...} }, {
    headers: { "Cache-Control": "public, max-age=300" }
  });
}
```

**验证**:
```bash
npm run dev
# 访问 /photo
# 打开DevTools → Network
# 应该看到loader返回的数据中src已经包含token
```

---

## 第3步: 简化OptimizedImage组件 ✂️

**目标**: 移除客户端token获取逻辑

**给Cursor的指令**:
```
修改 app/routes/photo.tsx 的 OptimizedImage 组件(大约第161行):
1. 删除 useImageToken 相关代码
2. 删除 useEffect 中的 getImageWithToken 调用
3. 删除 currentSrc state
4. 直接使用 props.src
5. 保留 loading 和 error 处理
```

**改造后的组件**:
```typescript
const OptimizedImage = ({ 
  src, // 现在已经是完整URL
  alt, 
  className = "",
  loading = "lazy" 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  loading?: "lazy" | "eager";
}) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img
      src={src}  // ✅ 直接使用
      alt={alt}
      className={`transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={loading}
      onLoad={() => setLoaded(true)}
      onError={(e) => console.error('Image failed:', src)}
    />
  );
};
```

**验证**:
```bash
# 刷新 /photo 页面
# 图片应该正常显示
# Network面板不应该有 /api/image-token 请求
```

---

## 第4步: 移除ClientOnly包裹 🗑️

**目标**: 支持服务端渲染

**给Cursor的指令**:
```
在 app/routes/photo.tsx 中:
1. 找到 <ClientOnly> 包裹 Hero 图片的地方(约第312行)
2. 删除 <ClientOnly> 和它的闭包函数，直接渲染内容
3. 找到 <ClientOnly> 包裹 Gallery 的地方(约第352行)  
4. 删除 <ClientOnly> 和 ClientOnlyGallery，直接渲染画廊
5. Hero图片设置 loading="eager"
6. 画廊图片保持 loading="lazy"
```

**改造示例**:
```typescript
// ❌ 改造前
<ClientOnly>
  {() => <OptimizedImage src={heroImage.src} ... />}
</ClientOnly>

// ✅ 改造后
<OptimizedImage 
  src={heroImage.src} 
  alt="Hero Image"
  loading="eager"  // ← 立即加载
/>
```

**验证**:
```bash
# 1. 查看页面源代码(右键→查看网页源代码)
# 应该能看到 <img src="...?token=..." />

# 2. 禁用JavaScript(DevTools → Settings → Debugger → Disable JavaScript)
# 刷新页面，图片应该仍然显示
```

---

## 第5步: 清理代码 🧹

**目标**: 删除不再需要的导入和代码

**给Cursor的指令**:
```
在 app/routes/photo.tsx 中:
1. 删除 import { useImageToken } from "~/hooks/useMediaToken.client"
2. 删除 import { ClientOnly } from "~/components/common/ClientOnly"
3. 如果有 action 函数且不再使用，删除它
4. 不要删除 ClientOnlyGallery 组件定义(可能其他地方用到)
```

**⚠️ 不要删除的文件**:
- ❌ `app/hooks/useMediaToken.client.tsx` - 其他页面可能在用
- ❌ `app/routes/api.image-token.tsx` - 保留作为通用API

**验证**:
```bash
npm run build
# 应该没有报错
# 如果报错"xxx is not used"，检查是否有其他文件依赖
```

---

## 🧪 最终测试清单

完成所有步骤后，执行以下测试:

### 功能测试
- [ ] 访问 /photo 页面正常显示
- [ ] Hero图片立即加载
- [ ] 画廊图片懒加载(滚动到才加载)
- [ ] 所有图片都能正常显示
- [ ] 图片加载失败时有错误处理

### 性能测试
- [ ] Network面板只有1个loader请求
- [ ] 没有 /api/image-token 请求
- [ ] 首屏加载时间 < 1秒

### SEO测试
- [ ] 查看网页源代码，能看到完整图片URL
- [ ] 禁用JS，图片仍然显示

### 回归测试
- [ ] music页面仍然正常(如果它用了useMediaToken)
- [ ] game页面仍然正常
- [ ] 其他使用图片的页面正常

---

## 🚨 常见问题排查

### 问题1: 图片不显示
```bash
# 检查:
1. 浏览器Console有无报错
2. Network面板中图片请求状态码
3. 环境变量 AUTH_KEY_SECRET 是否设置
```

### 问题2: Token invalid
```bash
# 检查:
1. AUTH_KEY_SECRET 与OSS配置是否一致
2. token生成逻辑是否与api.image-token.tsx一致
3. 服务器时间是否准确
```

### 问题3: 构建报错
```bash
# 常见错误:
❌ "Cannot import .server.ts in client component"
→ 检查是否在客户端组件中导入了.server.ts

❌ "crypto is not defined"  
→ crypto只能在服务端用，检查是否泄漏到客户端
```

---

## 🔄 回滚方案

如果出现问题:

```bash
# 方案1: Git回滚
git checkout HEAD -- app/routes/photo.tsx
git clean -fd app/utils/

# 方案2: 使用备份
cp app/routes/photo.tsx.backup app/routes/photo.tsx

# 方案3: 只回滚某一步
# 比如回滚第3步，恢复OptimizedImage的旧逻辑
```

---

## 📊 预期效果

| 指标 | 改造前 | 改造后 | 提升 |
|------|--------|--------|------|
| 网络请求 | 37次 | 1次 | -97% |
| 首屏时间 | 2.5s | 0.8s | -68% |
| SEO友好 | ❌ | ✅ | - |

---

## 🎯 给Cursor的完整指令模板

复制下面的文字给Cursor:

```
我需要重构photo.tsx的图片token获取逻辑，从客户端获取改为服务端生成。

请分5步执行，每步完成后等我确认再继续:

【第1步】创建 app/utils/imageToken.server.ts
- 导出 generateImageToken 和 generateImageTokens 函数
- 使用crypto生成HMAC签名
- 返回完整的带token的URL

【第2步】修改 photo.tsx 的 loader
- 导入 generateImageTokens
- 收集所有图片路径
- 批量生成token
- 替换所有src为完整URL
- Cache-Control设为 max-age=300

【第3步】简化 OptimizedImage 组件
- 删除 useImageToken 和相关逻辑
- 直接使用 props.src
- 保留 loading 和 onError

【第4步】移除 ClientOnly
- Hero图片直接渲染，loading="eager"
- 画廊直接渲染，loading="lazy"

【第5步】清理导入
- 删除 useImageToken 导入
- 删除 ClientOnly 导入
- 不要删除其他文件

请先执行第1步，完成后告诉我。
```