import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Supabase连接池管理器
 * 解决每次请求都重新创建连接的性能问题
 */
class SupabasePool {
  private static instance: SupabasePool;
  private pools: Map<string, SupabaseClient<Database>> = new Map();
  private readonly maxPoolSize = 10;
  private readonly poolTTL = 30 * 60 * 1000; // 30分钟
  private poolMetrics: Map<string, { created: number; lastUsed: number; useCount: number }> = new Map();

  private constructor() {
    // 定期清理过期连接
    setInterval(() => this.cleanupExpiredConnections(), 5 * 60 * 1000); // 每5分钟清理一次
  }

  static getInstance(): SupabasePool {
    if (!SupabasePool.instance) {
      SupabasePool.instance = new SupabasePool();
    }
    return SupabasePool.instance;
  }

  /**
   * 获取或创建Supabase客户端
   */
  getClient(key: string = 'default'): SupabaseClient<Database> {
    const now = Date.now();
    
    // 检查是否存在可用连接
    if (this.pools.has(key)) {
      const client = this.pools.get(key)!;
      const metrics = this.poolMetrics.get(key)!;
      
      // 检查连接是否过期
      if (now - metrics.created < this.poolTTL) {
        // 更新使用统计
        metrics.lastUsed = now;
        metrics.useCount++;
        return client;
      } else {
        // 连接过期，清理
        this.removeConnection(key);
      }
    }

    // 创建新连接
    return this.createNewConnection(key);
  }

  /**
   * 创建新的数据库连接
   */
  private createNewConnection(key: string): SupabaseClient<Database> {
    // 检查池大小限制
    if (this.pools.size >= this.maxPoolSize) {
      this.evictOldestConnection();
    }

    const client = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false, // 服务端不需要持久化session
          autoRefreshToken: false,
        },
        realtime: {
          params: {
            eventsPerSecond: -1, // 服务端禁用实时功能
          },
        },
        global: {
          headers: {
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=30, max=100',
          },
        },
      }
    );

    const now = Date.now();
    this.pools.set(key, client);
    this.poolMetrics.set(key, {
      created: now,
      lastUsed: now,
      useCount: 1,
    });

    console.log(`[SupabasePool] Created new connection: ${key}, pool size: ${this.pools.size}`);
    return client;
  }

  /**
   * 清理过期连接
   */
  private cleanupExpiredConnections(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, metrics] of this.poolMetrics.entries()) {
      if (now - metrics.created > this.poolTTL || now - metrics.lastUsed > this.poolTTL / 2) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.removeConnection(key));
    
    if (keysToRemove.length > 0) {
      console.log(`[SupabasePool] Cleaned up ${keysToRemove.length} expired connections`);
    }
  }

  /**
   * 移除最久未使用的连接
   */
  private evictOldestConnection(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, metrics] of this.poolMetrics.entries()) {
      if (metrics.lastUsed < oldestTime) {
        oldestTime = metrics.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.removeConnection(oldestKey);
      console.log(`[SupabasePool] Evicted oldest connection: ${oldestKey}`);
    }
  }

  /**
   * 移除指定连接
   */
  private removeConnection(key: string): void {
    this.pools.delete(key);
    this.poolMetrics.delete(key);
  }

  /**
   * 获取连接池状态
   */
  getPoolStatus() {
    return {
      totalConnections: this.pools.size,
      maxPoolSize: this.maxPoolSize,
      connections: Array.from(this.poolMetrics.entries()).map(([key, metrics]) => ({
        key,
        age: Date.now() - metrics.created,
        lastUsed: Date.now() - metrics.lastUsed,
        useCount: metrics.useCount,
      })),
    };
  }

  /**
   * 优雅关闭连接池
   */
  async shutdown(): Promise<void> {
    console.log('[SupabasePool] Shutting down connection pool...');
    this.pools.clear();
    this.poolMetrics.clear();
  }
}

// 导出单例实例
export const supabasePool = SupabasePool.getInstance();

// 进程退出时清理连接池
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => supabasePool.shutdown());
  process.on('SIGINT', () => supabasePool.shutdown());
} 