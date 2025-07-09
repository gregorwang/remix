import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
// Removed Clerk imports - now using Supabase authentication only
import { createClient } from "~/utils/supabase.server";
import styles from "~/styles/index-route.css?url";
import Header from "~/components/ui/Header";
import Faq from "~/components/ui/question";
import Footer from "~/components/ui/foot";
import { ClientOnly } from "~/components/common/ClientOnly";
import { Hero } from "~/components/ui/demo";
import { DefaultRoutePreloader } from "~/components/common/RoutePreloader";
import { calculatePagination } from "~/lib/utils/timeUtils";
import { serverCache, CacheKeys } from "~/lib/server-cache";

const MESSAGES_PER_PAGE = 10;

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preload", as: "image", href: "/favicon.ico" },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  // 关键路由预加载 - 提升返回首页速度
  { rel: "prefetch", href: "/chat" },
  { rel: "prefetch", href: "/game" },
  { rel: "prefetch", href: "/music" },

  // 预连接关键资源
  { rel: "preconnect", href: "https://supabase.co" },
];

export const meta: MetaFunction = () => {
  return [
        { title: "汪家俊的个人网站" },
        { name: "description", content: "展示现代Web技术与AI结合的个人网站，使用Remix、React、TypeScript构建" },
        { property: "og:title", content: "汪家俊的个人网站" },
        { property: "og:description", content: "一个由AI技术驱动的现代化个人网站" },
        { name: "twitter:card", content: "summary_large_image" },
    ];
};

// Loader function - 使用连接池和服务端缓存，极大提升性能
export const loader = async (args: LoaderFunctionArgs) => {
    console.log('[IndexLoader] Starting...');
    const startTime = Date.now();
    
    const { request } = args;
    const { supabase } = createClient(request);
    
    // 使用 getUser() 替代 getSession() 以提高安全性
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    
    // 使用工具函数计算分页 (纯算法逻辑已提取)
    const pagination = calculatePagination(0, MESSAGES_PER_PAGE, page);
    const { rangeStart, rangeEnd } = pagination;

    try {
        // 1. 首先尝试从缓存获取消息数据 - 增加缓存时间提升性能
        const messagesCacheKey = CacheKeys.indexMessages(page);
        const cachedMessages = await serverCache.getOrSet(
            messagesCacheKey,
            async () => {
                console.log('[IndexLoader] Cache miss for messages, fetching from DB...');
                // Use the already initialized supabase client
                
                const result = await supabase
                    .from('messages')
                    .select('*', { count: 'exact' })
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .range(rangeStart, rangeEnd);
                
                if (result.error) {
                    console.error('[IndexLoader] Database error:', result.error);
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
            5 * 60 * 1000 // 增加到5分钟缓存，提升性能
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
        console.log(`[IndexLoader] Completed in ${loadTime}ms, cache stats:`, serverCache.getStats());
        console.log(`[IndexLoader] Found ${messagesData.messages.length} messages, total count: ${messagesData.count}`);

        // 更激进的缓存策略 - 进一步提升性能
        const cacheControl = userId 
            ? "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" // 登录用户：5分钟本地，15分钟CDN
            : "public, max-age=600, s-maxage=1800, stale-while-revalidate=7200"; // 未登录用户：10分钟本地，30分钟CDN

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
                "ETag": `"index-${messagesData.count}-${page}-${userId ? 'auth' : 'anon'}-v3"`,
                // 性能优化headers
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "DENY",
                // 预加载关键资源
                "Link": "</chat>; rel=prefetch, </game>; rel=prefetch, </music>; rel=prefetch",
                // 性能指标
                "Server-Timing": `db;dur=${loadTime};desc="Database Load Time"`,
            }
        });

    } catch (error) {
        console.error("[IndexLoader] Unexpected error:", error);
        
        // 尝试从缓存获取备用数据
        const fallbackData = serverCache.get(CacheKeys.indexMessages(page));
        
        if (fallbackData && typeof fallbackData === 'object' && 'count' in fallbackData && 'messages' in fallbackData) {
            console.log('[IndexLoader] Using fallback cache data');
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
                    "Cache-Control": "public, max-age=60, s-maxage=120",
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
    
    // 使用 getUser() 替代 getSession() 以提高安全性
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("[IndexAction] User authentication error:", userError);
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

    console.log("[IndexAction] Inserting message:", messageData);

    const { error: insertError, data } = await supabase
        .from("messages")
        .insert(messageData)
        .select();

    if (insertError) {
        console.error("[IndexAction] Error inserting message:", insertError);
        return json({ 
            error: "留言提交失败，请稍后重试。",
            details: insertError.message 
        }, { 
            status: 500, 
            headers: Object.fromEntries(headers.entries())
        });
    }

    console.log("[IndexAction] Message inserted successfully:", data);
    return json({ success: "留言已提交，等待管理员审核！" }, { 
        headers: Object.fromEntries(headers.entries())
    });
};

export default function Index() {
  const { messages, userId, defaultAvatar } = useLoaderData<typeof loader>();
  
  return (
    <div className="font-sans">
      <DefaultRoutePreloader />
      <Header />
      <Hero />
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
      <Faq />
      <Footer />
    </div>
  );
}