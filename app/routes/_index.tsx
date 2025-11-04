import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import React from "react";
// Removed Clerk imports - now using Supabase authentication only
import { createClient } from "~/utils/supabase.server";
import styles from "~/styles/index-route.css?url";
import Header from "~/components/ui/Header";
import Faq from "~/components/ui/question";
import Footer from "~/components/ui/foot";
import { Hero } from "~/components/ui/demo";
import CollapsibleMessages from "~/components/messages/CollapsibleMessages";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preload", as: "image", href: "/favicon.ico" },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  // 移除立即的路由预加载，改为按需预加载
  // 只预连接关键资源
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

// Loader function - 只加载用户信息，不加载留言数据（完全懒加载）
export const loader = async (args: LoaderFunctionArgs) => {
    const { request } = args;
    const { supabase } = createClient(request);
    
    // 先检查会话，避免不必要的 token 刷新尝试
    const {
        data: { session }
    } = await supabase.auth.getSession();
    
    let user = null;
    let userId = null;
    if (session) {
        // 只有在有会话时才尝试获取用户信息
        const {
            data: { user: authenticatedUser },
        } = await supabase.auth.getUser();
        user = authenticatedUser;
        userId = authenticatedUser?.id || null;
    }

    let currentUser = null;
    if (userId && user) {
        currentUser = {
            id: user.id,
            email: user.email,
        };
    }

    return json({ 
        userId,
        currentUser
    }, { 
        headers: {
            "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
            "Vary": "Cookie, Authorization",
        }
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

export default function Index() {
  const { userId } = useLoaderData<typeof loader>();
  
  return (
    <div className="font-sans">
      <Header />
      <Hero />
      <main>
        {/* Feature Navigation - 可展开的留言板 */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">功能导航</h2>
                    <p className="text-xl text-gray-600">
                        探索网站的各种功能
                    </p>
                </div>
                <div className="max-w-6xl mx-auto">
                    {/* 可展开的留言板组件 - 完全懒加载 */}
                    <CollapsibleMessages 
                        userId={userId ?? null}
                    />
                </div>
            </div>
        </section>
      </main>
      <Faq />
      <Footer />
    </div>
  );
}