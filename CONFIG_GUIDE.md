# 🚀 配置指南

完整的Better Auth + Redis + SQLite配置教程

---

## 📦 1. 复制环境变量文件

```bash
cp .env.example .env
```

---

## ☁️ 2. 配置 Redis (Upstash)

### 2.1 注册Upstash账号
访问: https://upstash.com/
- 使用GitHub或Google账号登录（免费）

### 2.2 创建Redis数据库
1. 点击"Create Database"
2. 选择区域（推荐: `us-east-1` 或离你最近的）
3. 类型选择：`Regional`（免费层）
4. 点击"Create"

### 2.3 获取连接URL
1. 进入创建的数据库
2. 复制 **REST API URL** 或 **Redis URL**
3. 粘贴到 `.env` 文件：

```bash
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

✅ **配置完成！** Upstash免费层提供 10,000 请求/天。

---

## 🔑 3. 配置 Google OAuth

### 3.1 访问Google Cloud Console
https://console.cloud.google.com/

### 3.2 创建项目（如果没有）
1. 点击顶部项目选择器
2. 点击"新建项目"
3. 输入项目名称（如"我的个人网站"）
4. 点击"创建"

### 3.3 启用Google+ API
1. 左侧菜单 → "API和服务" → "启用的API和服务"
2. 点击"+ 启用API和服务"
3. 搜索"Google+ API"
4. 点击"启用"

### 3.4 创建OAuth 2.0凭据
1. 左侧菜单 → "凭据"
2. 点击"+ 创建凭据" → "OAuth 2.0 客户端ID"
3. 如果提示配置同意屏幕：
   - 用户类型选择"外部"
   - 应用名称填写你的网站名称
   - 支持电子邮件选择你的邮箱
   - 保存并继续

### 3.5 配置OAuth客户端
1. 应用类型：**Web应用**
2. 名称：`Remix App`
3. **授权的重定向URI**（重要！）添加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   生产环境还要添加：
   ```
   https://your-domain.com/api/auth/callback/google
   ```

4. 点击"创建"

### 3.6 复制凭据到.env
会弹出显示：
```
客户端ID: 123456789-abc.apps.googleusercontent.com
客户端密钥: GOCSPX-xxxxxxxxxxxxx
```

复制到 `.env`:
```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

✅ **Google OAuth配置完成！**

---

## 📧 4. 配置 Magic Link 邮件服务

### 方案A: Gmail（推荐，最简单）

#### 4.1 开启两步验证
1. 访问: https://myaccount.google.com/security
2. 找到"两步验证"
3. 按照指引开启

#### 4.2 生成应用专用密码
1. 访问: https://myaccount.google.com/apppasswords
2. 选择应用："邮件"
3. 选择设备："其他（自定义名称）"
4. 输入名称："Remix App"
5. 点击"生成"
6. 复制生成的16位密码（格式: `xxxx xxxx xxxx xxxx`）

#### 4.3 配置到.env
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 应用专用密码
```

### 方案B: 其他邮件服务商

<details>
<summary>QQ邮箱</summary>

1. 登录QQ邮箱 → 设置 → 账户
2. 开启"POP3/SMTP服务"
3. 获取授权码

```bash
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=your-qq@qq.com
EMAIL_PASSWORD=your-auth-code
```
</details>

<details>
<summary>163邮箱</summary>

1. 登录163邮箱 → 设置 → POP3/SMTP/IMAP
2. 开启"SMTP服务"
3. 获取授权密码

```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_USER=your-email@163.com
EMAIL_PASSWORD=your-auth-code
```
</details>

✅ **邮件服务配置完成！**

---

## 👨‍💼 5. 配置管理员邮箱

在 `.env` 文件中，添加管理员邮箱（逗号分隔多个）：

```bash
ADMIN_EMAILS=your-admin-email@gmail.com,another-admin@example.com
```

**这些邮箱的用户登录后可以访问 `/admin/messages` 审核留言。**

---

## 🧪 6. 测试配置

### 6.1 启动开发服务器

```bash
npm run dev
```

### 6.2 测试Magic Link登录
1. 访问: http://localhost:3000/auth
2. 输入你的邮箱
3. 点击"发送登录链接"
4. 检查控制台或邮箱，点击链接登录

**注意：** 开发环境如果未配置邮件，Magic Link会打印到终端。

### 6.3 测试Google登录
1. 访问: http://localhost:3000/auth
2. 点击"使用 Google 登录"
3. 应该会跳转到Google登录页面
4. 登录后自动回到首页

✅ **如果两个登录方式都成功，配置正确！**

---

## 🚀 7. 生产环境部署

### 7.1 更新环境变量

```bash
APP_URL=https://your-domain.com
NODE_ENV=production
```

### 7.2 更新Google OAuth回调URL

回到Google Cloud Console → 凭据 → 编辑OAuth客户端

添加生产环境回调URL：
```
https://your-domain.com/api/auth/callback/google
```

### 7.3 Cloudflare Pages 部署

```bash
# 构建命令
npm run build

# 输出目录
build/client
```

在Cloudflare Pages设置中添加所有环境变量：
- `REDIS_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `ADMIN_EMAILS`
- `APP_URL`

### 7.4 数据持久化

SQLite数据库文件位置：
- 开发环境: `./app.db`
- 生产环境: `./data/app.db`

确保生产环境的 `data` 目录有写权限。

---

## 🔧 常见问题

<details>
<summary><strong>Q: Magic Link邮件没收到？</strong></summary>

1. 检查邮箱拼写
2. 查看垃圾邮件文件夹
3. 检查 `.env` 中的 `EMAIL_USER` 和 `EMAIL_PASSWORD` 是否正确
4. 查看终端日志，看是否有SMTP错误
</details>

<details>
<summary><strong>Q: Google登录报错"redirect_uri_mismatch"？</strong></summary>

回调URL不匹配。确保Google Cloud Console中的重定向URI与你的应用URL完全一致：
```
http://localhost:3000/api/auth/callback/google  (开发)
https://your-domain.com/api/auth/callback/google  (生产)
```
</details>

<details>
<summary><strong>Q: Redis连接失败？</strong></summary>

1. 检查 `REDIS_URL` 格式是否正确
2. 确保使用的是Upstash提供的URL（不是自建Redis）
3. 检查网络连接
</details>

<details>
<summary><strong>Q: 数据库文件在哪里？</strong></summary>

SQLite数据库文件：
- 开发: 项目根目录的 `app.db`
- 生产: `data/app.db`

可以用任何SQLite客户端打开查看（如DB Browser for SQLite）。
</details>

---

## 📚 更多资源

- [Better Auth文档](https://www.better-auth.com/docs)
- [Upstash文档](https://docs.upstash.com/)
- [Google OAuth配置](https://developers.google.com/identity/protocols/oauth2)
- [Nodemailer文档](https://nodemailer.com/)

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查所有环境变量是否正确配置
2. 查看终端日志中的错误信息
3. 确保所有依赖已安装：`npm install`
4. 尝试删除 `app.db` 重新启动

---

**配置完成后，你的应用将拥有：**
- ✅ Google OAuth登录
- ✅ Magic Link无密码登录
- ✅ Redis高性能数据存储
- ✅ SQLite本地数据库
- ✅ 留言审核系统
- ✅ 管理员权限控制
- ✅ 完全零成本运行！
