import Redis from "ioredis";

// 创建Redis连接（Upstash）
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error("[Redis] Max retries reached, giving up");
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully");
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

export { redis };

// 留言服务（使用Redis作为数据存储）
export const MessageService = {
  // 创建留言
  async create(data: { user_id: string; username: string; content: string }) {
    const id = `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 存储留言详情
    await redis.hset(id, {
      ...data,
      id,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 加入待审核队列
    await redis.lpush("messages:pending", id);

    return id;
  },

  // 获取已审核留言（分页）
  async getApproved(page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const ids = await redis.lrange("messages:approved", start, end);
    const messages = await Promise.all(
      ids.map(id => redis.hgetall(id))
    );

    const total = await redis.llen("messages:approved");

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // 获取待审核留言（分页）
  async getPending(page = 1, limit = 20) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const ids = await redis.lrange("messages:pending", start, end);
    const messages = await Promise.all(
      ids.map(id => redis.hgetall(id))
    );

    const total = await redis.llen("messages:pending");

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // 审核通过
  async approve(messageId: string) {
    await redis.hset(messageId, "status", "approved");
    await redis.hset(messageId, "updated_at", new Date().toISOString());
    await redis.lrem("messages:pending", 1, messageId);
    await redis.lpush("messages:approved", messageId);
  },

  // 拒绝留言
  async reject(messageId: string, reason?: string) {
    await redis.hset(messageId, "status", "rejected");
    await redis.hset(messageId, "updated_at", new Date().toISOString());
    if (reason) {
      await redis.hset(messageId, "reject_reason", reason);
    }
    await redis.lrem("messages:pending", 1, messageId);
    await redis.lpush("messages:rejected", messageId);
  },

  // 删除留言
  async delete(messageId: string) {
    const message: any = await redis.hgetall(messageId);
    if (!message) return;

    // 从对应队列中移除
    await redis.lrem("messages:pending", 1, messageId);
    await redis.lrem("messages:approved", 1, messageId);
    await redis.lrem("messages:rejected", 1, messageId);

    // 删除留言数据
    await redis.del(messageId);
  },

  // 检查用户今天的留言数
  async getUserTodayCount(userId: string): Promise<number> {
    const key = `user:${userId}:messages:today`;
    const count = await redis.get(key);
    return count ? parseInt(count) : 0;
  },

  // 增加用户今天的留言计数
  async incrementUserTodayCount(userId: string): Promise<void> {
    const key = `user:${userId}:messages:today`;
    const count = await redis.incr(key);

    // 如果是第一条，设置过期时间为今天结束
    if (count === 1) {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
      await redis.expire(key, secondsUntilEndOfDay);
    }
  },

  // 检查用户最近一分钟是否发过留言
  async checkUserRateLimit(userId: string): Promise<boolean> {
    const key = `user:${userId}:last_message`;
    const lastMessage = await redis.get(key);

    if (lastMessage) {
      return false; // 频率限制
    }

    // 设置标记，60秒过期
    await redis.setex(key, 60, Date.now().toString());
    return true;
  },
};

// IP限流服务
export const RateLimitService = {
  // 检查IP限流（每小时20次）
  async checkIPRateLimit(ip: string): Promise<boolean> {
    const key = `ip:${ip}:messages`;
    const count = await redis.get(key);
    const currentCount = count ? parseInt(count) : 0;

    if (currentCount >= 20) {
      return false; // 超过限制
    }

    const newCount = await redis.incr(key);

    // 第一次设置过期时间
    if (newCount === 1) {
      await redis.expire(key, 3600); // 1小时
    }

    return true;
  },
};
