import { createServerClient, parse, serialize } from "@supabase/ssr";
import { supabasePool } from "./supabase-pool.server";
import type { Database } from "./types";

/**
 * 创建高性能的Supabase服务端客户端
 * 使用连接池复用连接，大幅提升性能
 */
export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) => {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  // 使用连接池获取客户端，避免重复创建连接
  const pooledClient = supabasePool.getClient('server');

  // 为了保持cookie功能，仍需要创建带cookie支持的客户端
  // 但我们可以复用连接配置
  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
      auth: {
        flowType: "pkce",
        persistSession: false, // 服务端不需要持久化session
        autoRefreshToken: false, // 服务端不需要自动刷新token
      },
      realtime: {
        params: {
          eventsPerSecond: -1, // 服务端禁用实时功能提升性能
        },
      },
      global: {
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=30, max=100',
          // 优化请求头
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache', // 确保数据新鲜度
        },
      },
    }
  );

  return { supabase, headers, pooledClient };
};

/**
 * 获取纯连接池客户端（用于不需要cookie的场景）
 * 性能最优，适合静态数据查询
 */
export const getPooledSupabaseClient = (key: string = 'default') => {
  return supabasePool.getClient(key);
};

/**
 * 批量查询优化器
 * 将多个查询合并为单个请求，减少网络开销
 */
export class SupabaseBatchQuery {
  private queries: Array<{
    id: string;
    query: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly batchDelay = 10; // 10ms内的查询合并为一批

  /**
   * 添加查询到批次
   */
  add<T>(id: string, query: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queries.push({ id, query, resolve, reject });
      
      // 如果这是第一个查询，启动批次延迟
      if (this.queries.length === 1) {
        this.batchTimeout = setTimeout(() => this.executeBatch(), this.batchDelay);
      }
    });
  }

  /**
   * 执行批次查询
   */
  private async executeBatch() {
    if (this.queries.length === 0) return;
    
    const currentQueries = [...this.queries];
    this.queries = [];
    this.batchTimeout = null;

    // 并行执行所有查询
    const results = await Promise.allSettled(
      currentQueries.map(({ query }) => query())
    );

    // 处理结果
    results.forEach((result, index) => {
      const { resolve, reject } = currentQueries[index];
      
      if (result.status === 'fulfilled') {
        resolve(result.value);
      } else {
        reject(result.reason);
      }
    });
  }
}

// 全局批量查询实例
export const supabaseBatch = new SupabaseBatchQuery();

/**
 * 连接健康检查
 */
export const checkSupabaseHealth = async (): Promise<{
  isHealthy: boolean;
  latency: number;
  poolStatus: any;
}> => {
  const start = Date.now();
  
  try {
    const client = getPooledSupabaseClient('health-check');
    
    // 执行简单查询测试连接
    await client.from('messages').select('id').limit(1);
    
    const latency = Date.now() - start;
    
    return {
      isHealthy: true,
      latency,
      poolStatus: supabasePool.getPoolStatus(),
    };
  } catch (error) {
    console.error('[Supabase Health Check] Failed:', error);
    return {
      isHealthy: false,
      latency: Date.now() - start,
      poolStatus: supabasePool.getPoolStatus(),
    };
  }
}; 