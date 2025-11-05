import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
// Removed Clerk imports - now using Supabase authentication only
import { createClient } from "~/utils/supabase.server";
import styles from "~/styles/index-route.css?url";
import Header from "~/components/ui/Header";
import Faq from "~/components/ui/question";
import Footer from "~/components/ui/foot";
import CollapsibleMessages from "~/components/messages/CollapsibleMessages";
import ChangelogSection from "~/components/changelog-section";
import CursorTeamSection from "~/components/photo-section";
import CtaSection from "~/components/cta-section";

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
      <div className="font-sans min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-950 mb-2">
              {error.status === 404 ? '页面未找到' : '出现错误'}
            </h2>
            <p className="text-primary-950/70 mb-6">
              {error.status === 404 
                ? '抱歉，您访问的页面不存在。' 
                : `错误代码: ${error.status || 500}`}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors"
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
    <div className="font-sans min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-950 mb-2">出现错误</h2>
          <p className="text-primary-950/70 mb-6">
            留言板加载失败，请稍后重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors mr-4"
          >
            刷新页面
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-block bg-primary-100 text-primary-950 px-6 py-3 rounded-lg font-medium hover:bg-primary-100/80 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Plus icon component
interface PlusIconProps {
  strokeWidth?: number;
  className?: string;
}

const PlusIcon = ({ strokeWidth = 4, className = "" }: PlusIconProps) => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function Index() {
  const { userId } = useLoaderData<typeof loader>();
  
  return (
    <div className="font-sans">
      <Header />
      {/* Hero Section - 简化的静态版本 */}
      <section id="home" className="relative">
        <div className="animation-delay-8 animate-fadeIn mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20">
          <div className="mb-10 mt-4 md:mt-6">
            <div className="px-2">
              <div className="border-ali relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] md:px-12 md:py-20">
                <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -left-5 -top-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -bottom-5 -left-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -right-5 -top-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -bottom-5 -right-5 h-10 w-10"
                  />
                  AI织经纬，我赋其山海
                </h1>
                <div className="flex items-center justify-center gap-1">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <p className="text-xs text-green-500">Available Now</p>
                </div>
              </div>
            </div>

            <h1 className="mt-8 text-2xl md:text-2xl">
              欢迎来到我的数字伊甸园，我是{" "}
              <span className="text-ali font-bold">汪家俊 </span>
            </h1>

            <p className="md:text-md mx-auto mb-16 mt-2 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
              在这里，代码与思想交织，现实与虚拟的边界随之消融。这片由我与AI共同编织的领域，收藏着我的光影瞬间、心动旋律、热血故事，以及通往未来的足迹
            </p>
          </div>
        </div>
        
        {/* 静态背景 */}
        <div className="absolute inset-0 mx-auto pointer-events-none bg-gradient-to-br from-primary-50 via-transparent to-primary-100 opacity-30" />
      </section>
      <main>
        {/* Feature Navigation - 可展开的留言板 */}
        <section className="py-20 bg-primary-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary-950 mb-6">功能导航</h2>
                    <p className="text-xl text-primary-950/70">
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
        
        {/* Photo Section - 图片区域 */}
        <CursorTeamSection />
        
        {/* Changelog Section - 更新日志 */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <ChangelogSection />
            </div>
        </section>
        
        {/* CTA Section - 留言板区域 */}
        <CtaSection userId={userId ?? null} />
      </main>
      <Faq />
      <Footer />
    </div>
  );
}