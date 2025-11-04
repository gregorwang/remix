/**
 * 服务端内存缓存模块
 * 减少重复的数据库查询，提升响应速度
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
}

interface CacheStats {
  totalItems: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

class ServerCache {
  private static instance: ServerCache;
  private cache: Map<string, CacheItem<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };
  private readonly maxSize = 1000; // 最大缓存项数量
  private readonly defaultTTL = 5 * 60 * 1000; // 默认5分钟TTL
  
  // 内存管理配置
  private readonly MEMORY_THRESHOLD_PERCENT = 0.8; // 80% 堆内存使用率阈值
  private readonly MIN_MEMORY_THRESHOLD_MB = 50; // 最小阈值 50MB
  private readonly MAX_MEMORY_THRESHOLD_MB = 512; // 最大阈值 512MB
  private readonly EVICTION_PERCENT = 0.15; // 每次驱逐 15% 的缓存项
  private lastEvictionTime = 0; // 上次驱逐时间
  private readonly EVICTION_COOLDOWN = 60 * 1000; // 驱逐冷却时间 1分钟

  private constructor() {
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 2 * 60 * 1000); // 每2分钟清理一次
    
    // 内存压力监控
    if (typeof process !== 'undefined' && process.memoryUsage) {
      setInterval(() => this.memoryPressureCheck(), 10 * 60 * 1000); // 每10分钟检查一次
    }
  }

  static getInstance(): ServerCache {
    if (!ServerCache.instance) {
      ServerCache.instance = new ServerCache();
    }
    return ServerCache.instance;
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      hitCount: 0,
    });

    console.log(`[ServerCache] Cached: ${key}, TTL: ${ttl}ms, Size: ${this.cache.size}`);
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新命中统计
    item.hitCount++;
    this.stats.hits++;
    
    return item.data;
  }

  /**
   * 获取或设置缓存（常用模式）
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行fetcher获取数据
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`[ServerCache] Failed to fetch data for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除匹配模式的缓存
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    console.log(`[ServerCache] Deleted ${deleted} items matching pattern: ${pattern}`);
    return deleted;
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ServerCache] Cleaned up ${cleaned} expired items`);
    }
  }

  /**
   * LRU驱逐（最少使用）
   * @param count 要驱逐的项数量，如果不指定则只驱逐1项
   */
  private evictLRU(count?: number): void {
    const itemsToEvict = count || 1;
    const evictedKeys: string[] = [];
    
    // 创建按LRU优先级排序的项列表
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      hitCount: item.hitCount,
      timestamp: item.timestamp,
    }));
    
    // 排序：优先驱逐命中次数少且时间久的项
    items.sort((a, b) => {
      if (a.hitCount !== b.hitCount) {
        return a.hitCount - b.hitCount;
      }
      return a.timestamp - b.timestamp;
    });
    
    // 驱逐最不常用的项
    for (let i = 0; i < Math.min(itemsToEvict, items.length); i++) {
      const key = items[i].key;
      this.cache.delete(key);
      evictedKeys.push(key);
    }
    
    if (evictedKeys.length > 0) {
      console.log(`[ServerCache] Evicted ${evictedKeys.length} LRU item(s): ${evictedKeys.slice(0, 5).join(', ')}${evictedKeys.length > 5 ? '...' : ''}`);
    }
  }

  /**
   * 内存压力检查
   * 使用自适应阈值和渐进式LRU驱逐策略
   */
  private memoryPressureCheck(): void {
    if (typeof process === 'undefined' || !process.memoryUsage) return;
    
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    
    // 计算自适应阈值
    // 使用堆内存总量的百分比，但限制在最小和最大阈值之间
    const thresholdMB = Math.max(
      this.MIN_MEMORY_THRESHOLD_MB,
      Math.min(
        this.MAX_MEMORY_THRESHOLD_MB,
        heapTotalMB * this.MEMORY_THRESHOLD_PERCENT
      )
    );
    
    // 检查是否超过阈值
    if (heapUsedMB > thresholdMB) {
      const now = Date.now();
      
      // 检查冷却时间，避免频繁大量删除
      if (now - this.lastEvictionTime < this.EVICTION_COOLDOWN) {
        console.log(`[ServerCache] Memory pressure detected (${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB, threshold: ${thresholdMB.toFixed(2)}MB), but in cooldown period`);
        return;
      }
      
      // 计算需要驱逐的项数量（15%的缓存项）
      const itemsToEvict = Math.max(1, Math.floor(this.cache.size * this.EVICTION_PERCENT));
      
      // 使用LRU策略驱逐缓存项
      this.evictLRU(itemsToEvict);
      
      this.lastEvictionTime = now;
      
      console.log(`[ServerCache] Memory pressure detected (${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB, threshold: ${thresholdMB.toFixed(2)}MB), evicted ${itemsToEvict} items`);
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    // 估算内存使用量
    let memoryUsage = 0;
    for (const item of this.cache.values()) {
      memoryUsage += JSON.stringify(item).length * 2; // 粗略估算
    }
    
    return {
      totalItems: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: Math.round(memoryUsage / 1024), // KB
    };
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    console.log('[ServerCache] All cache cleared');
  }

  /**
   * 预热缓存
   */
  async warmup(keys: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    console.log(`[ServerCache] Starting warmup for ${keys.length} items...`);
    
    const promises = keys.map(async ({ key, fetcher, ttl }) => {
      try {
        // 只有在缓存中不存在时才预热
        if (!this.cache.has(key)) {
          const data = await fetcher();
          this.set(key, data, ttl);
        }
      } catch (error) {
        console.error(`[ServerCache] Warmup failed for key: ${key}`, error);
      }
    });
    
    await Promise.allSettled(promises);
    console.log('[ServerCache] Warmup completed');
  }
}

// 导出单例实例
export const serverCache = ServerCache.getInstance();

// 预定义的缓存键生成器
export const CacheKeys = {
  // 首页消息列表
  indexMessages: (page: number, status: string = 'approved') => 
    `index:messages:${page}:${status}`,
  
  // 留言板页面消息列表
  messagesMessages: (page: number, status: string = 'approved') => 
    `messages:messages:${page}:${status}`,
  
  // 用户权限检查
  userPermissions: (userId: string, hours: number) => 
    `user:permissions:${userId}:${hours}h`,
  
  // 用户信息
  userInfo: (userId: string) => 
    `user:info:${userId}`,
  
  // 消息统计
  messageStats: () => 
    'messages:stats',
  
  // 平台游戏数据
  platformGames: (platform: string, page: number) => 
    `games:${platform}:page:${page}`,
};

// 进程退出时清理缓存
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    serverCache.clear();
  });
} 