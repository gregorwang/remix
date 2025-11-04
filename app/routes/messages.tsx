import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import React from "react";
// Removed Clerk imports - now using Supabase authentication only
import { createClient } from "~/utils/supabase.server";
import Header from "~/components/ui/Header";
import Footer from "~/components/ui/foot";
import { ClientOnly } from "~/components/common/ClientOnly";
import { calculatePagination } from "~/lib/utils/timeUtils";
import { serverCache, CacheKeys } from "~/lib/server-cache";

const MESSAGES_PER_PAGE = 10;

export const links: LinksFunction = () => [
  { rel: "dns-prefetch", href: "https://supabase.co" },
  { rel: "preconnect", href: "https://supabase.co" },
];

export const meta: MetaFunction = () => {
  return [
    { title: "留言板 - 汪家俊的个人网站" },
    { name: "description", content: "欢迎留下您的想法和建议" },
    { property: "og:title", content: "留言板 - 汪家俊的个人网站" },
    { property: "og:description", content: "欢迎留下您的想法和建议" },
  ];
};

// Loader function - 使用连接池和服务端缓存，极大提升性能
export const loader = async (args: LoaderFunctionArgs) => {
    console.log('[MessagesLoader] Starting...');
    const startTime = Date.now();
    
    const { request } = args;
    const { supabase } = createClient(request);
    
    // 先检查会话，避免不必要的 token 刷新尝试
    const {
        data: { session }
    } = await supabase.auth.getSession();
    
    let user = null;
    if (session) {
        // 只有在有会话时才尝试获取用户信息
        const {
            data: { user: authenticatedUser },
        } = await supabase.auth.getUser();
        user = authenticatedUser;
    }

    const userId = user?.id;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    
    // 使用工具函数计算分页 (纯算法逻辑已提取)
    const pagination = calculatePagination(0, MESSAGES_PER_PAGE, page);
    const { rangeStart, rangeEnd } = pagination;

    try {
        // 1. 首先尝试从缓存获取消息数据 - 30秒缓存
        const messagesCacheKey = CacheKeys.messagesMessages(page);
        const cachedMessages = await serverCache.getOrSet(
            messagesCacheKey,
            async () => {
                console.log('[MessagesLoader] Cache miss for messages, fetching from DB...');
                // Use the already initialized supabase client
                
                const result = await supabase
                    .from('messages')
                    .select('*', { count: 'exact' })
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .range(rangeStart, rangeEnd);
                
                if (result.error) {
                    console.error('[MessagesLoader] Database error:', result.error);
                    // 返回默认数据而不是抛出错误
                    return {
                        messages: [],
                        count: 0
                    };
                }
                
                return {
                    messages: result.data || [],
                    count: result.count || 0
                };
            },
            30 * 1000 // 30秒缓存
        );

        let currentUser = null;

        // 2. 用户信息（从 Supabase user 获取）
        if (userId && user) {
            currentUser = {
                id: user.id,
                email: user.email,
                // Add other user fields as needed
            };
        }
        
        // 使用工具函数重新计算正确的分页信息 - 添加安全检查
        const messagesData = cachedMessages || { messages: [], count: 0 };
        const finalPagination = calculatePagination(messagesData.count, MESSAGES_PER_PAGE, page);
        const defaultAvatar = "/favicon.ico"; 

        // 记录性能指标
        const loadTime = Date.now() - startTime;
        console.log(`[MessagesLoader] Completed in ${loadTime}ms, cache stats:`, serverCache.getStats());
        console.log(`[MessagesLoader] Found ${messagesData.messages.length} messages, total count: ${messagesData.count}`);

        // 缓存策略
        const cacheControl = userId 
            ? "public, max-age=30, s-maxage=60, stale-while-revalidate=300" // 登录用户：30秒本地，1分钟CDN
            : "public, max-age=30, s-maxage=60, stale-while-revalidate=300"; // 未登录用户：30秒本地，1分钟CDN

        console.log("[DEBUG] messages from DB:", messagesData.messages);

        return json({ 
            messages: messagesData.messages, 
            totalPages: finalPagination.totalPages, 
            currentPage: page, 
            userId, 
            defaultAvatar,
            currentUser
        }, { 
            headers: {
                "Cache-Control": cacheControl,
                "Vary": "Cookie, Authorization",
                // 添加ETag支持精确缓存
                "ETag": `"messages-${messagesData.count}-${page}-${userId ? 'auth' : 'anon'}-v1"`,
                // 性能优化headers
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                // 性能指标
                "Server-Timing": `db;dur=${loadTime};desc="Database Load Time"`,
            }
        });

    } catch (error) {
        console.error("[MessagesLoader] Unexpected error:", error);
        
        // 尝试从缓存获取备用数据
        const fallbackData = serverCache.get(CacheKeys.messagesMessages(page));
        
        if (fallbackData && typeof fallbackData === 'object' && 'count' in fallbackData && 'messages' in fallbackData) {
            console.log('[MessagesLoader] Using fallback cache data');
            const finalPagination = calculatePagination(typeof fallbackData.count === 'number' ? fallbackData.count : 0, MESSAGES_PER_PAGE, page);
            
            return json({ 
                messages: fallbackData.messages || [],
                totalPages: finalPagination.totalPages, 
                currentPage: page, 
                userId, 
                defaultAvatar: "/favicon.ico",
                currentUser: null,
                warning: "数据可能不是最新的，请稍后刷新"
            }, { 
                headers: {
                    "Cache-Control": "public, max-age=30, s-maxage=60",
                    "Vary": "Cookie, Authorization",
                }
            });
        }
        
        // 极端错误情况的优雅降级
        return json({ 
            messages: [], 
            totalPages: 1, 
            currentPage: 1, 
            userId, 
            defaultAvatar: "/favicon.ico",
            currentUser: null,
            error: "服务暂时不可用，请稍后重试"
        }, { 
            status: 200, // 仍然返回200，避免错误页面
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Vary": "Cookie, Authorization",
            }
        });
    }
};

export const action = async (args: ActionFunctionArgs) => {
    const { request } = args;
    const { supabase, headers } = createClient(request);
    
    // 先检查会话，避免不必要的 token 刷新尝试
    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.error("[MessagesAction] Session error:", sessionError);
        return json({ error: "请先登录后再发表留言。" }, { 
            status: 401, 
            headers: Object.fromEntries(headers.entries())
        });
    }

    // 有会话时才获取用户信息
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("[MessagesAction] User authentication error:", userError);
        return json({ error: "请先登录后再发表留言。" }, { 
            status: 401, 
            headers: Object.fromEntries(headers.entries())
        });
    }

    const userId = user.id;
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content || content.trim().length === 0) {
        return json({ error: "留言内容不能为空。" }, { 
            status: 400, 
            headers: Object.fromEntries(headers.entries())
        });
    }
    
    // 获取用户信息
    let username = `User ${userId.substring(0, 8)}`;
    
    if (user) {
        const userMetadata = user.user_metadata || {};
        
        if (userMetadata.full_name) {
            username = userMetadata.full_name;
        } else if (userMetadata.name) {
            username = userMetadata.name;
        } else if (user.email) {
            username = user.email.split('@')[0];
        }
    }

    // 留言数据
    const messageData = {
        user_id: userId,
        username: username,
        content: content.trim(),
        status: 'pending' as const
    };

    console.log("[MessagesAction] Inserting message:", messageData);

    const { error: insertError, data } = await supabase
        .from("messages")
        .insert(messageData)
        .select();

    if (insertError) {
        console.error("[MessagesAction] Error inserting message:", insertError);
        return json({ 
            error: "留言提交失败，请稍后重试。",
            details: insertError.message 
        }, { 
            status: 500, 
            headers: Object.fromEntries(headers.entries())
        });
    }

    console.log("[MessagesAction] Message inserted successfully:", data);
    return json({ success: "留言已提交，等待管理员审核！" }, { 
        headers: Object.fromEntries(headers.entries())
    });
};

export function ErrorBoundary() {
  const error = useRouteError();
  
  // 友好错误显示
  if (isRouteErrorResponse(error)) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error.status === 404 ? '页面未找到' : '出现错误'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error.status === 404 
                ? '抱歉，您访问的页面不存在。' 
                : `错误代码: ${error.status || 500}`}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 未知错误
  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">出现错误</h2>
          <p className="text-gray-600 mb-6">
            留言板加载失败，请稍后重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors mr-4"
          >
            刷新页面
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const { messages, userId, defaultAvatar } = useLoaderData<typeof loader>();
  
  return (
    <div className="font-sans">
      <Header />
      <main>
        {/* Message Board Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">留言板</h2>
                    <p className="text-xl text-gray-600">
                        欢迎留下您的想法和建议
                    </p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <ClientOnly>
                        {() => {
                            const LazyHomeMessages = React.lazy(() => 
                                import("~/components/messages/HomeMessagesClient.client")
                            );
                            return (
                                <React.Suspense fallback={
                                    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8 max-w-4xl mx-auto">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-32 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                }>
                                    <LazyHomeMessages 
                                        messages={Array.isArray(messages) ? messages : []}
                                        userId={userId ?? null}
                                        defaultAvatar={defaultAvatar}
                                    />
                                </React.Suspense>
                            );
                        }}
                    </ClientOnly>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

