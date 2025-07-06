/**
 * 服务器环境的 fetch 包装器
 * 解决 undici 库在服务器环境中的 keep-alive 头问题
 */

// 检查是否在服务器环境中
const isServerEnvironment = typeof window === 'undefined';

export const serverFetch = (url: string | URL, options: RequestInit = {}): Promise<Response> => {
  if (!isServerEnvironment) {
    // 在客户端环境中使用原生 fetch
    return fetch(url, options);
  }

  // 在服务器环境中修复 headers
  const modifiedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      // 使用 close 连接避免 keep-alive 问题
      'Connection': 'close',
      // 确保用户代理
      'User-Agent': 'Remix-App/1.0',
    },
  };

  // 移除可能有问题的 keep-alive 相关头
  if (modifiedOptions.headers && typeof modifiedOptions.headers === 'object') {
    const headers = modifiedOptions.headers as Record<string, string>;
    delete headers['keep-alive'];
    delete headers['Keep-Alive'];
    delete headers['connection']; // 避免冲突
  }

  // 添加超时处理
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

  const fetchPromise = fetch(url, {
    ...modifiedOptions,
    signal: controller.signal,
  });

  return fetchPromise.finally(() => {
    clearTimeout(timeoutId);
  });
};

// 为 Supabase 客户端配置
export const createSupabaseFetchConfig = () => {
  if (!isServerEnvironment) {
    return {}; // 客户端不需要特殊配置
  }

  return {
    global: {
      fetch: serverFetch,
    },
  };
}; 