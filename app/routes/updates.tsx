import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";
import Header from "~/components/ui/Header";
import Footer from "~/components/ui/foot";
import { useEffect, useState } from "react";

// 更新日志数据类型
export type UpdateType = 'feature' | 'fix' | 'improvement' | 'breaking';

export interface UpdateLog {
  id: string;
  version: string;
  date: string;
  type: UpdateType;
  title: string;
  description: string;
  items: string[];
}

interface UpdatesPageData {
  updates: UpdateLog[];
}

// Links function
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
];

// Meta function
export const meta: MetaFunction = () => [
  { title: "更新日志 - 汪家俊的个人网站" },
  { name: "description", content: "查看项目的最新更新和版本发布记录" },
  { property: "og:title", content: "更新日志 - 汪家俊的个人网站" },
  { property: "og:description", content: "查看项目的最新更新和版本发布记录" },
];

// Loader function - 静态数据
export async function loader({ request }: LoaderFunctionArgs) {
  const updates: UpdateLog[] = [
    {
      id: '1',
      version: 'v2.1.0',
      date: '2025-01-15',
      type: 'feature',
      title: '新增音乐年度报告功能',
      description: '添加了全新的音乐可视化展示页面，包含DNA音乐可视化组件和统计数据展示',
      items: [
        '新增DNA音乐可视化组件，展示11首精选歌曲',
        '添加音乐统计数据展示（总听歌数、艺人数量、听歌品味）',
        '实现歌词流动弹幕效果',
        '优化图片加载性能，使用token验证机制'
      ]
    },
    {
      id: '2',
      version: 'v2.0.5',
      date: '2025-01-10',
      type: 'improvement',
      title: '优化摄影作品页面',
      description: '改进了摄影作品集的展示效果和用户体验',
      items: [
        '优化图片加载性能，添加懒加载和占位符',
        '改进响应式布局，适配移动端显示',
        '添加图片悬停缩放效果',
        '优化页面加载动画'
      ]
    },
    {
      id: '3',
      version: 'v2.0.3',
      date: '2025-01-05',
      type: 'fix',
      title: '修复聊天功能问题',
      description: '修复了RAG-Nemesis聊天室中的一些已知问题',
      items: [
        '修复消息发送失败的问题',
        '优化AI响应时间',
        '修复移动端输入框显示问题',
        '改进错误提示信息'
      ]
    },
    {
      id: '4',
      version: 'v2.0.0',
      date: '2024-12-28',
      type: 'breaking',
      title: '重大版本更新',
      description: '重构项目架构，迁移到Remix框架，提升性能和用户体验',
      items: [
        '从Next.js迁移到Remix框架',
        '重构路由系统，使用Remix的路由规范',
        '实现服务端渲染（SSR）优化首屏加载',
        '添加Supabase认证系统',
        '优化图片token验证机制'
      ]
    },
    {
      id: '5',
      version: 'v1.5.0',
      date: '2024-12-20',
      type: 'feature',
      title: '新增游戏世界页面',
      description: '添加了游戏展示页面，展示喜爱的游戏作品',
      items: [
        '新增游戏展示页面',
        '添加游戏平台图标组件',
        '实现游戏卡片悬停效果',
        '优化页面动画性能'
      ]
    }
  ];

  const data: UpdatesPageData = {
    updates: updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    }
  });
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

// 获取更新类型标签样式 - 使用设计系统颜色
function getTypeStyles(type: UpdateType): { bg: string; text: string; label: string } {
  switch (type) {
    case 'feature':
      return {
        bg: 'bg-accent/10',
        text: 'text-accent',
        label: '新功能'
      };
    case 'fix':
      return {
        bg: 'bg-primary-100',
        text: 'text-accent-hover',
        label: '修复'
      };
    case 'improvement':
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-950/70',
        label: '改进'
      };
    case 'breaking':
      return {
        bg: 'bg-accent/20',
        text: 'text-accent-hover',
        label: '重大变更'
      };
    default:
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-950/70',
        label: '更新'
      };
  }
}

// 更新日志卡片组件
function UpdateCard({ update, index }: { update: UpdateLog; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const typeStyles = getTypeStyles(update.type);

  useEffect(() => {
    // 检查用户是否偏好减少动画
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReduced = mediaQuery.matches;
    setPrefersReducedMotion(prefersReduced);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // 交错动画：每个卡片延迟50ms（如果用户不偏好减少动画）
    if (!prefersReduced) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 50);

      return () => {
        clearTimeout(timer);
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // 如果偏好减少动画，立即显示
      setIsVisible(true);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [index]);

  return (
    <article
      className={`
        bg-primary-100 rounded-lg p-2.5 mb-3
        transition-[transform,opacity] duration-600 ease-expo-out
        hover:transition-[transform,box-shadow] hover:duration-300
        hover:-translate-y-1 hover:shadow-2xl
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
      style={{
        transitionDelay: prefersReducedMotion ? '0ms' : `${index * 50}ms`,
      }}
      suppressHydrationWarning
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-0.75 mb-0.5">
            <h3 className="text-2xl font-bold leading-tight tracking-tight text-primary-950">
              {update.version}
            </h3>
            <span className={`
              rounded-xs px-0.75 py-0.25 text-xs font-semibold uppercase tracking-wider
              ${typeStyles.bg} ${typeStyles.text}
            `}>
              {typeStyles.label}
            </span>
          </div>
          <p className="text-sm font-normal text-primary-950/70">
            {formatDate(update.date)}
          </p>
        </div>
      </div>

      <div className="mb-1.5">
        <h4 className="text-xl font-semibold leading-snug text-primary-950 mb-0.75">
          {update.title}
        </h4>
        <p className="text-base leading-relaxed text-primary-950/80">
          {update.description}
        </p>
      </div>

      <ul className="space-y-0.75">
        {update.items.map((item, itemIndex) => (
          <li
            key={itemIndex}
            className="flex items-start gap-0.5 text-base leading-relaxed text-primary-950/70"
          >
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// 主页面组件
export default function Updates() {
  const { updates } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />
      
      <main className="max-w-[74.5rem] mx-auto px-1.5 sm:px-2 lg:px-2.5">
        {/* Hero Section */}
        <section className="py-section-md">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary-950 mb-1">
              更新日志
            </h1>
            <p className="text-base leading-relaxed text-primary-950/70 max-w-[60rem] mx-auto">
              查看项目的最新更新和版本发布记录,了解我们持续改进的功能和修复
            </p>
          </div>

          {/* Updates List */}
          <div className="space-y-3 max-w-[60rem] mx-auto">
            {updates.map((update, index) => (
              <UpdateCard key={update.id} update={update} index={index} />
            ))}
          </div>
        </section>

        {/* Back to home link */}
        <div className="text-center py-2.5 pb-section-md">
          <Link
            to="/"
            prefetch="intent"
            className="
              inline-flex items-center gap-0.5
              text-accent hover:text-accent-hover
              text-sm font-medium
              transition-[color,transform] duration-300 ease-expo-out
              hover:-translate-y-0.5
            "
          >
            <span>←</span>
            <span>返回首页</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-1.5">
        <div className="bg-primary-100 rounded-lg p-2.5 max-w-md w-full text-center">
          <div className="mb-2.5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-1.5">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold leading-tight text-primary-950 mb-0.75">
              {error.status === 404 ? '页面未找到' : '出现错误'}
            </h2>
            <p className="text-base leading-relaxed text-primary-950/70 mb-2.5">
              {error.status === 404 
                ? '抱歉，您访问的页面不存在。' 
                : `错误代码: ${error.status || 500}`}
            </p>
            <Link
              to="/"
              className="
                inline-block bg-accent text-white px-1.5 py-0.75 rounded font-medium
                hover:bg-accent-hover
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 未知错误
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-1.5">
      <div className="bg-primary-100 rounded-lg p-2.5 max-w-md w-full text-center">
        <div className="mb-2.5">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-1.5">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-primary-950 mb-0.75">出现错误</h2>
          <p className="text-base leading-relaxed text-primary-950/70 mb-2.5">
            更新日志页面加载失败,请稍后重试。
          </p>
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="
                bg-accent text-white px-1.5 py-0.75 rounded font-medium
                hover:bg-accent-hover
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              刷新页面
            </button>
            <Link
              to="/"
              className="
                bg-primary-100 text-primary-950 px-1.5 py-0.75 rounded font-medium
                hover:bg-primary-100/80
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

