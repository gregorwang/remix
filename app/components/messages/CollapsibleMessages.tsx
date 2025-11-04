"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useFetcher } from "@remix-run/react";
import type { loader as messagesLoader } from "~/routes/messages";

// ✅ 最佳实践：在模块顶层声明 lazy 组件
const HomeMessagesClient = lazy(() => import("~/components/messages/HomeMessagesClient.client"));

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    status: string;
    created_at: string;
}

interface CollapsibleMessagesProps {
    userId: string | null;
}

export default function CollapsibleMessages({ userId }: CollapsibleMessagesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const fetcher = useFetcher<typeof messagesLoader>();
    
    // 首屏渲染完成后，自动预加载留言数据（不影响首屏性能）
    useEffect(() => {
        // 只在尚未加载数据时发起请求
        if (fetcher.state === "idle" && !fetcher.data) {
            // 静默预加载，不阻塞 UI
            fetcher.load("/messages");
        }
    }, []); // 只在组件挂载时执行一次
    
    // 从 fetcher 获取数据
    const messagesData = fetcher.data;
    const messages = (messagesData?.messages as Message[]) || [];
    const defaultAvatar = messagesData?.defaultAvatar || "/favicon.ico";
    const isLoading = fetcher.state === "loading";

    return (
        <div className="w-full">
            {/* 触发按钮 - 留言板卡片 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group w-full bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">留言板</h3>
                            <p className="text-gray-600 text-sm">
                                欢迎留下您的想法和建议
                            </p>
                        </div>
                    </div>
                    {/* 展开/收起图标 */}
                    <svg
                        className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* 可展开的内容区域 */}
            <div
                className={`overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isExpanded
                        ? 'max-h-[2000px] opacity-100 mt-6'
                        : 'max-h-0 opacity-0 mt-0'
                }`}
            >
                <div className="max-w-4xl mx-auto">
                    {isExpanded && (
                        <>
                            {isLoading ? (
                                // 加载状态
                                <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-32 bg-gray-200 rounded"></div>
                                        <div className="flex justify-center py-4">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-sm">正在加载留言...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // ✅ 数据加载完成，渲染留言板组件 - 使用最佳实践
                                <Suspense fallback={
                                    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-32 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                }>
                                    <HomeMessagesClient 
                                        messages={Array.isArray(messages) ? messages : []}
                                        userId={userId ?? null}
                                        defaultAvatar={defaultAvatar}
                                    />
                                </Suspense>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

