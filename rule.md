# Cursor执行任务清单

## 🎯 高优先级任务(必须完成)

### 任务1: 修复管理员页面分页
**文件**: `app/routes/admin.messages.tsx`  
**位置**: 第62-74行

**当前代码**:
```typescript
const { data: pendingMessages, error: pendingError } = await supabase
    .from('messages')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
```

**修改为**:
```typescript
const ADMIN_MESSAGES_PER_PAGE = 50;
const url = new URL(request.url);
const pendingPage = parseInt(url.searchParams.get("pendingPage") || "1");
const pendingStart = (pendingPage - 1) * ADMIN_MESSAGES_PER_PAGE;
const pendingEnd = pendingStart + ADMIN_MESSAGES_PER_PAGE - 1;

const { data: pendingMessages, count: pendingCount, error: pendingError } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .range(pendingStart, pendingEnd);

const totalPendingPages = Math.ceil((pendingCount || 0) / ADMIN_MESSAGES_PER_PAGE);
```

然后在返回的JSON中添加: `totalPendingPages`, `currentPendingPage: pendingPage`

---

### 任务2: 优化消息过滤性能
**文件**: `app/components/messages/HomeMessagesClient.client.tsx`  
**位置**: 第214-219行

**当前代码**:
```typescript
const messagesArray = Array.isArray(messages) ? messages.filter(msg => {
    if (!msg || typeof msg !== 'object') return false;
    if (!msg.id || !msg.content) return false;
    if (typeof msg.content !== 'string') return false;
    return true;
}) : [];
```

**修改为**:
```typescript
import { useMemo } from 'react';

const messagesArray = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    return messages.filter(msg => {
        if (!msg || typeof msg !== 'object') return false;
        if (!msg.id || !msg.content) return false;
        if (typeof msg.content !== 'string') return false;
        return true;
    });
}, [messages]);

const displayedMessages = useMemo(() =>
    messagesArray.slice(0, displayedMessagesCount),
    [messagesArray, displayedMessagesCount]
);
```

---

### 任务3: 缩短缓存时间
**文件**: `app/routes/_index.tsx`  
**位置**: 第99行

**修改**: 将 `2 * 60 * 1000` 改为 `30 * 1000`

---

## 🔧 中优先级任务(推荐完成)

### 任务4: 创建独立留言板页面
1. 创建新文件 `app/routes/messages.tsx`
2. 复制 `_index.tsx` 的留言板相关代码
3. 缓存时间改为30秒: `30 * 1000`
4. Meta信息改为: `{ title: "留言板 - 汪家俊的个人网站" }`

### 任务5: 简化首页
**文件**: `app/routes/_index.tsx`
1. 移除留言板相关的loader逻辑
2. 移除留言板相关的action
3. 在Hero下方添加功能导航卡片(包含指向 `/messages` 的链接)

### 任务6: 优化实时订阅
**文件**: `app/components/messages/HomeMessagesClient.client.tsx`  
**位置**: 第82-114行

**方案**: 改为显示"有新留言"提示,用户点击后才刷新
```typescript
const [hasNewMessages, setHasNewMessages] = useState(false);

// 在订阅回调中:
setHasNewMessages(true); // 不自动revalidate

// 在UI中添加悬浮提示按钮
```

---

## 📋 执行顺序

1. 先执行任务1-3(高优先级,互不依赖)
2. 再执行任务4-5(中优先级,需要一起做)
3. 最后执行任务6(可选)

## ⚠️ 注意事项

- 每次修改后运行 `npm run build` 检查是否有错误
- 确保导入语句正确
- 修改后测试对应功能是否正常