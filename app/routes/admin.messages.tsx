import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
// Removed Clerk imports - now using Supabase authentication only
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { isAdmin } from "~/lib/constants";
import { useState } from "react";
import AdminErrorBoundary from "~/components/AdminErrorBoundary";

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    status: string;
    created_at: string;
}

export const meta: MetaFunction = () => {
    return [{ title: "留言审核管理 - 管理员后台" }];
};

export function ErrorBoundary() {
    return <AdminErrorBoundary status={403} />;
}

// Loader function - 只做I/O操作，符合Remix规范
export const loader = async (args: LoaderFunctionArgs) => {
    const { request } = args;
    const response = new Response();
    const { supabase } = createSupabaseServerClient({ request, response });
    
    // Get current user session from Supabase
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Response("无权限访问", { status: 403 });
    }

    const userId = user.id;
    const userEmail = user.email;

    // 检查是否为管理员 (权限验证是I/O操作)
    if (!isAdmin(userId, userEmail)) {
        throw new Response("无权限访问", { status: 403 });
    }

    const { headers: supabaseHeaders } = createSupabaseServerClient({ request, response });

    // 获取所有待审核的留言
    const { data: pendingMessages, error: pendingError } = await supabase
        .from('messages')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // 获取最近已审核的留言（用于参考）
    const { data: recentMessages, error: recentError } = await supabase
        .from('messages')
        .select('*')
        .in('status', ['approved', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(10);

    if (pendingError || recentError) {
        console.error("Error fetching messages:", pendingError || recentError);
        throw new Response("无法获取留言数据", { status: 500 });
    }

    // 获取用户信息
    let adminUser = null;
    if (user) {
        adminUser = {
            id: user.id,
            email: user.email,
            // Add other user fields as needed
        };
    }

    supabaseHeaders.forEach((value, key) => {
        response.headers.append(key, value);
    });

    return json({
        pendingMessages: pendingMessages || [],
        recentMessages: recentMessages || [],
        adminUser,
        totalPending: pendingMessages?.length || 0
    }, { 
        headers: {
            ...Object.fromEntries(response.headers.entries()),
            // 管理页面数据实时性要求高，短缓存
            "Cache-Control": "private, max-age=60, s-maxage=120",
            "Content-Type": "application/json",
        }
    });
};

// Action function - 只做I/O操作，符合Remix规范
export const action = async (args: ActionFunctionArgs) => {
    const { request } = args;
    const response = new Response();
    const { supabase, headers } = createSupabaseServerClient({ request, response });
    
    // Get current user session from Supabase
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return json({ error: "无权限执行此操作" }, { 
            status: 403,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    }

    const userId = user.id;
    const userEmail = user.email;

    // 检查是否为管理员 (权限验证是I/O操作)
    if (!isAdmin(userId, userEmail)) {
        return json({ error: "无权限执行此操作" }, { 
            status: 403,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    }
    const formData = await request.formData();
    
    const messageId = formData.get("messageId") as string;
    const action = formData.get("action") as string;

    if (!messageId || !action) {
        return json({ error: "缺少必要参数" }, { 
            status: 400,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
        return json({ error: "无效的操作" }, { 
            status: 400,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    }

    try {
        let result;
        if (action === 'delete') {
            result = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
        } else {
            const newStatus = action === 'approve' ? 'approved' : 'rejected';
            result = await supabase
                .from('messages')
                .update({ status: newStatus })
                .eq('id', messageId);
        }

        if (result.error) {
            console.error("Error updating message:", result.error);
            return json({ error: "操作失败" }, { 
                status: 500,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                }
            });
        }

        const actionText = action === 'approve' ? '批准' : action === 'reject' ? '拒绝' : '删除';
        
        headers.forEach((value, key) => {
            response.headers.append(key, value);
        });

        return json({ success: `留言已${actionText}` }, { 
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Content-Type": "application/json",
            }
        });
    } catch (error) {
        console.error("Database error:", error);
        return json({ error: "数据库操作失败" }, { 
            status: 500,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    }
};

export default function AdminMessagesPage() {
    const { pendingMessages, recentMessages, adminUser, totalPending } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState<'pending' | 'recent'>('pending');
    
    const isSubmitting = navigation.state === "submitting";

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        const texts = {
            pending: '待审核',
            approved: '已批准',
            rejected: '已拒绝'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
                {texts[status as keyof typeof texts]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">留言审核管理</h1>
                                <p className="mt-2 text-sm text-gray-700">
                                    管理员：{adminUser?.email || '未知'} | 
                                    待审核留言：<span className="font-semibold text-orange-600">{totalPending}</span> 条
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setSelectedTab('pending')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        selectedTab === 'pending'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    待审核 ({totalPending})
                                </button>
                                <button
                                    onClick={() => setSelectedTab('recent')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        selectedTab === 'recent'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    最近处理
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success/Error Messages */}
                {actionData && 'success' in actionData && actionData.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        ✓ {actionData.success}
                    </div>
                )}
                {actionData && 'error' in actionData && actionData.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        ✗ {actionData.error}
                    </div>
                )}

                {/* Messages List */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {selectedTab === 'pending' ? (
                        <>
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">待审核留言</h2>
                            </div>
                            {pendingMessages.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">暂无待审核的留言</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {pendingMessages.map((message: Message) => (
                                        <div key={message.id} className="p-6 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {message.username}
                                                        </h3>
                                                        {getStatusBadge(message.status)}
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(message.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 mb-4 leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-4">
                                                        用户ID: {message.user_id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-3">
                                                <Form method="post" className="inline">
                                                    <input type="hidden" name="messageId" value={message.id} />
                                                    <input type="hidden" name="action" value="approve" />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        ✓ 批准
                                                    </button>
                                                </Form>
                                                <Form method="post" className="inline">
                                                    <input type="hidden" name="messageId" value={message.id} />
                                                    <input type="hidden" name="action" value="reject" />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        ✗ 拒绝
                                                    </button>
                                                </Form>
                                                <Form method="post" className="inline">
                                                    <input type="hidden" name="messageId" value={message.id} />
                                                    <input type="hidden" name="action" value="delete" />
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        onClick={(e) => {
                                                            if (!confirm('确定要删除这条留言吗？此操作不可撤销。')) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        🗑️ 删除
                                                    </button>
                                                </Form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">最近处理的留言</h2>
                            </div>
                            {recentMessages.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">暂无处理记录</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {recentMessages.map((message: Message) => (
                                        <div key={message.id} className="p-6">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {message.username}
                                                </h3>
                                                {getStatusBadge(message.status)}
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 