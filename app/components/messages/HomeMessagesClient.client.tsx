import { useEffect, useState } from "react";
import { Link, useFetcher, useRevalidator, useOutletContext } from "@remix-run/react";
import { useSupabase } from "~/hooks/useSupabase";
import type { action } from "~/routes/_index";
import type { SupabaseOutletContext } from "~/lib/types";

const EMOJIS = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷'];
const EMOJIS_PER_PAGE = 32;
const MESSAGES_PER_PAGE = 10; // 每页显示的留言数，与后端保持一致

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    status: string;
    created_at: string;
}

interface HomeMessagesClientProps {
    messages: Message[];
    userId: string | null;
    defaultAvatar: string;
}

/** Toast 组件 */
function Toast({ type, text, onClose }: { type: 'success' | 'error'; text: string; onClose: () => void }) {
    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[220px] max-w-xs px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 animate-fade-in-down
            ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
        >
            {type === 'success' ? (
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className="text-sm leading-relaxed break-words flex-1">{text}</span>
            <button onClick={onClose} className="ml-1 p-0.5 rounded hover:bg-black/5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

export default function HomeMessagesClient({ messages, userId, defaultAvatar }: HomeMessagesClientProps) {
    const fetcher = useFetcher<typeof action>();
    const { supabase } = useSupabase();
    const { session } = useOutletContext<SupabaseOutletContext>();
    const revalidator = useRevalidator();
    
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPage, setEmojiPage] = useState(0);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    // 新增：控制显示的留言数量
    const [displayedMessagesCount, setDisplayedMessagesCount] = useState(MESSAGES_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const isSubmitting = fetcher.state === "submitting";

    // 统一的提示函数
    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
    };

    // 自动隐藏 toast
    useEffect(() => {
        if (toast) {
            const id = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(id);
        }
    }, [toast]);

    // 监听数据库变化 - 使用防抖优化性能
    useEffect(() => {
        if (!supabase) return;
        
        // 防抖函数，2秒内只执行一次
        let debounceTimer: NodeJS.Timeout | null = null;
        const debouncedRevalidate = () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            debounceTimer = setTimeout(() => {
                revalidator.revalidate();
            }, 2000);
        };
        
        const channel = supabase
            .channel('messages-channel')
            .on('postgres_changes', { 
                event: 'INSERT',  // 只监听新增事件，减少不必要触发
                schema: 'public', 
                table: 'messages', 
                filter: 'status=eq.approved' 
            },
                debouncedRevalidate
            )
            .subscribe();

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            supabase.removeChannel(channel);
        };
    }, [supabase, revalidator]);

    // 响应处理 - 基于真实的fetcher状态显示反馈
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            const data = fetcher.data as { success?: string; error?: string };
            
            if (data.success) {
                showToast('success', data.success);
                setMessage('');
                setShowEmojiPicker(false);
                revalidator.revalidate();
                // 重置显示数量，让新留言能够被看到
                setDisplayedMessagesCount(MESSAGES_PER_PAGE);
            } else if (data.error) {
                showToast('error', data.error);
            }
        }
    }, [fetcher.state, fetcher.data, revalidator]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.emoji-picker') && !target.closest('.emoji-trigger')) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showEmojiPicker]);
    
    const addEmoji = (emoji: string) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getCurrentPageEmojis = () => {
        const startIndex = emojiPage * EMOJIS_PER_PAGE;
        return EMOJIS.slice(startIndex, startIndex + EMOJIS_PER_PAGE);
    };

    const totalEmojiPages = Math.ceil(EMOJIS.length / EMOJIS_PER_PAGE);

    const getUserDisplayName = (msg: Message) => {
        if (!msg || typeof msg !== 'object') return 'Unknown User';
        
        const username = msg.username;
        if (typeof username === 'string' && username.trim()) {
            return username;
        }
        
        const userId = msg.user_id;
        if (typeof userId === 'string' && userId.length > 0) {
            return `User ${userId.substring(0, 8)}`;
        }
        
        return 'Unknown User';
    };

    const getUserAvatar = () => {
        if (typeof defaultAvatar === 'string') {
            return defaultAvatar;
        }
        return "/favicon.ico";
    };

    // Get current user display name from Supabase session
    const getCurrentUserName = () => {
        if (!session?.user) return '';
        
        try {
            const user = session.user;
            const userMetadata = user.user_metadata || {};
            
            if (typeof userMetadata.full_name === 'string' && userMetadata.full_name.trim()) {
                return userMetadata.full_name;
            }
            
            if (typeof userMetadata.name === 'string' && userMetadata.name.trim()) {
                return userMetadata.name;
            }
            
            if (typeof user.email === 'string' && user.email.includes('@')) {
                return user.email.split('@')[0];
            }
            
            return '';
        } catch (error) {
            console.error('Error getting user name:', error);
            return '';
        }
    };

    const currentUserName = getCurrentUserName();

    // Ensure messages is an array and contains valid message objects
    const messagesArray = Array.isArray(messages) ? messages.filter(msg => {
        if (!msg || typeof msg !== 'object') return false;
        if (!msg.id || !msg.content) return false;
        if (typeof msg.content !== 'string') return false;
        return true;
    }) : [];

    // 懒加载更多留言
    const loadMoreMessages = () => {
        setIsLoadingMore(true);
        // 模拟加载时间
        setTimeout(() => {
            setDisplayedMessagesCount(prev => Math.min(prev + MESSAGES_PER_PAGE, messagesArray.length));
            setIsLoadingMore(false);
        }, 300);
    };

    // 获取当前要显示的留言
    const displayedMessages = messagesArray.slice(0, displayedMessagesCount);
    const hasMoreMessages = displayedMessagesCount < messagesArray.length;

    // 表单提交处理 - 真实状态反馈
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!message.trim()) return;
        // 不再立即显示成功提示，而是等真正提交完成后再显示
        // 清空输入框
        setShowEmojiPicker(false);
        // 提交到服务器
        fetcher.submit(e.currentTarget);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden p-8 max-w-4xl mx-auto">
            {/* Toast 提示 */}
            {toast && <Toast type={toast.type} text={toast.text} onClose={() => setToast(null)} />}

            {/* Messages Display */}
            {messagesArray.length > 0 ? (
                <div className="mb-8">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {displayedMessages.map((msg: Message) => {
                            const isOwnMessage = msg.user_id === userId?.toString();
                            return (
                                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} key={msg.id}>
                                    <div className={`flex items-start space-x-3 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <img 
                                            src={getUserAvatar()} 
                                            alt="Avatar" 
                                            className="w-8 h-8 rounded-full flex-shrink-0"
                                            loading="lazy"
                                        />
                                        <div className={`rounded-2xl px-4 py-2 shadow-md ${
                                            isOwnMessage 
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-tr-sm' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                        }`}>
                                            <div className="text-xs opacity-70 mb-1">
                                                {getUserDisplayName(msg)}
                                            </div>
                                            <p className="text-sm">{typeof msg.content === 'string' ? msg.content : '内容加载失败'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* 加载更多按钮 */}
                        {hasMoreMessages && (
                            <div className="text-center py-4">
                                <button
                                    onClick={loadMoreMessages}
                                    disabled={isLoadingMore}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            加载中...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                            加载更多 ({messagesArray.length - displayedMessagesCount} 条)
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {/* 显示总数信息 */}
                        {messagesArray.length > MESSAGES_PER_PAGE && (
                            <div className="text-center py-2">
                                <p className="text-gray-400 text-xs">
                                    显示 {displayedMessages.length} / {messagesArray.length} 条留言
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 mb-8">
                    <p>还没有留言，来发表第一条吧！</p>
                </div>
            )}

            {/* Message Form */}
            {!userId ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">
                        请 <Link to="/auth" className="text-purple-600 hover:text-purple-700 font-medium" prefetch="intent">登录</Link> 后发表留言
                    </p>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <fetcher.Form method="post" className="space-y-4" onSubmit={handleFormSubmit}>
                        {currentUserName && (
                            <p className="text-sm text-gray-500">
                                已登录为 <span className="font-medium text-purple-600">{currentUserName}</span>
                            </p>
                        )}
                        <div className="relative">
                            <textarea
                                name="content"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="请耐心等待审核"
                                rows={3}
                                required
                            />
                            <button
                                type="button"
                                className="emoji-trigger absolute bottom-3 right-3 text-xl hover:scale-110 transition-transform"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                title="添加表情"
                            >
                                😊
                            </button>
                            {showEmojiPicker && (
                                <div className="emoji-picker absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                                    <div className="text-sm text-gray-600 mb-2">选择表情</div>
                                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                        {getCurrentPageEmojis().map((emoji, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => addEmoji(emoji)}
                                                title={emoji}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    {totalEmojiPages > 1 && (
                                        <div className="flex justify-between items-center mt-2 text-sm">
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-gray-600 disabled:opacity-50"
                                                onClick={() => setEmojiPage(Math.max(0, emojiPage - 1))}
                                                disabled={emojiPage === 0}
                                            >
                                                ←
                                            </button>
                                            <span className="text-gray-500">
                                                {emojiPage + 1}/{totalEmojiPages}
                                            </span>
                                            <button
                                                type="button"
                                                className="px-2 py-1 text-gray-600 disabled:opacity-50"
                                                onClick={() => setEmojiPage(Math.min(totalEmojiPages - 1, emojiPage + 1))}
                                                disabled={emojiPage === totalEmojiPages - 1}
                                            >
                                                →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !message.trim()} 
                                className="relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        发送中...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                        </svg>
                                        发送留言
                                    </span>
                                )}
                            </button>
                        </div>
                    </fetcher.Form>
                </div>
            )}
        </div>
    );
}