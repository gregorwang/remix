import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useRevalidator } from "@remix-run/react";
// Removed Clerk imports - now using Supabase authentication only
import { useSupabase } from "~/hooks/useSupabase";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import styles from "~/styles/messages.css";

const EMOJIS = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷'];
const MESSAGES_PER_PAGE = 10;
const EMOJIS_PER_PAGE = 32;

interface Message {
    id: string;
    user_id: string;
    username: string;
    content: string;
    status: string;
    created_at: string;
}

export const meta: MetaFunction = () => {
    return [{ title: "Message Board" }];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const response = new Response();
    const { supabase, headers: supabaseHeaders } = createSupabaseServerClient({ request, response });
    
    // Get current user session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const rangeStart = (page - 1) * MESSAGES_PER_PAGE;
    const rangeEnd = rangeStart + MESSAGES_PER_PAGE - 1;

    const { data: messages, error: messagesError, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(rangeStart, rangeEnd);

    if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        throw new Response("Could not fetch messages.", { status: 500 });
    }

    // 简化权限逻辑 - 移除时间限制，只保留登录检查
    const canPost = !!userId;
    let currentUser = null;

    if (userId && session?.user) {
        // Get user info from Supabase session
        currentUser = {
            id: session.user.id,
            email: session.user.email,
            // Add other user fields as needed
        };
    }
    
    const totalPages = Math.ceil((count || 0) / MESSAGES_PER_PAGE);
    const defaultAvatar = "/favicon.ico"; 

    supabaseHeaders.forEach((value, key) => {
      response.headers.append(key, value);
    });

    return json({ 
        messages: messages || [], 
        totalPages, 
        currentPage: page, 
        userId, 
        canPost, 
        defaultAvatar,
        currentUser
    }, { headers: response.headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const response = new Response();
    const { supabase, headers } = createSupabaseServerClient({ request, response });
    
    // Get current user session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
        return json({ error: "You must be logged in to post a message." }, { status: 401, headers: response.headers });
    }
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content || content.trim().length === 0) {
        return json({ error: "Message content cannot be empty." }, { status: 400, headers: response.headers });
    }
    
    // Get user info from Supabase session
    let username = `User ${userId.substring(0, 8)}`;
    
    if (session?.user) {
        const user = session.user;
        const userMetadata = user.user_metadata || {};
        
        if (userMetadata.full_name) {
            username = userMetadata.full_name;
        } else if (userMetadata.name) {
            username = userMetadata.name;
        } else if (user.email) {
            username = user.email.split('@')[0];
        }
    }

    // 移除时间限制检查 - 只保留审核机制
    // 用户可以随时发表留言，留言将进入审核队列

    const { error: insertError } = await supabase
        .from("messages")
        .insert({ 
            user_id: userId, 
            username: username, 
            content: content.trim(), 
            status: 'pending' 
        });

    if (insertError) {
        console.error("Error inserting message:", insertError);
        return json({ error: "Failed to submit message." }, { status: 500, headers: response.headers });
    }

    headers.forEach((value, key) => {
      response.headers.append(key, value);
    });

    return json({ success: "Message submitted for review!" }, { headers: response.headers });
};

export default function MessagesPage() {
    const { messages, totalPages, currentPage, userId, canPost, defaultAvatar } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { supabase } = useSupabase();
    const revalidator = useRevalidator();
    const navigation = useNavigation();
    
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiPage, setEmojiPage] = useState(0);
    
    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (!supabase) return;
        
        const channel = supabase
            .channel('messages-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: 'status=eq.approved' },
                () => {
                    revalidator.revalidate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, revalidator]);

    // Clear message input on successful submission
    useEffect(() => {
        if (actionData && 'success' in actionData && actionData.success) {
            setMessage("");
            setShowEmojiPicker(false);
        }
    }, [actionData]);

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
    
    const formatDate = (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    
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
        return msg.username || `User ${msg.user_id.substring(0, 8)}`;
    };

    const getUserAvatar = (msg: Message) => {
        // For now, use default avatar - can be enhanced with Supabase user profiles
        return defaultAvatar;
    };

    const currentUserName = ''; // TODO: Implement with Supabase user data

    return (
        <div className="bg-white min-h-screen">
            <div className="message-board">
                <h1 className="title">💬 Message Board</h1>
                
                {actionData && 'success' in actionData && actionData.success && (
                    <div className="success-message">{actionData.success}</div>
                )}
                {actionData && 'error' in actionData && actionData.error && (
                    <div className="error-message">{actionData.error}</div>
                )}

                {!userId ? (
                    <div className="login-prompt">
                        <p>Please <Link to="/auth" prefetch="intent" className="login-link">log in</Link> to post a message.</p>
                    </div>
                ) : (
                    /* 直接显示留言表单，无时间限制 */
                    canPost && (
                            <Form method="post" className="message-form">
                                {currentUserName && (
                                    <p className="text-sm text-gray-500 mb-2">已登录为 <span className="font-medium text-purple-600">{currentUserName}</span></p>
                                )}
                                <div className="form-group">
                                    <label htmlFor="content">Your Message</label>
                                    <div className="textarea-wrapper">
                                        <textarea
                                            name="content"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            id="content"
                                            className="input-field"
                                            placeholder="Messages are subject to review before publishing..."
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="emoji-trigger"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            title="Add emoji"
                                        >
                                            😊
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="emoji-picker">
                                                <div className="emoji-picker-header">Choose an emoji</div>
                                                <div className="emoji-grid">
                                                    {getCurrentPageEmojis().map((emoji, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            className="emoji-btn"
                                                            onClick={() => addEmoji(emoji)}
                                                            title={emoji}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                                {totalEmojiPages > 1 && (
                                                    <div className="emoji-pagination">
                                                        <button
                                                            type="button"
                                                            className="emoji-page-btn"
                                                            onClick={() => setEmojiPage(Math.max(0, emojiPage - 1))}
                                                            disabled={emojiPage === 0}
                                                        >
                                                            ←
                                                        </button>
                                                        <span className="emoji-page-info">
                                                            {emojiPage + 1}/{totalEmojiPages}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="emoji-page-btn"
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
                                </div>
                                <button type="submit" disabled={isSubmitting || !message.trim()} className="submit-btn">
                                    {isSubmitting && <span className="loading-spinner"></span>}
                                    {isSubmitting ? 'Submitting...' : 'Send Message'}
                                </button>
                            </Form>
                    )
                )}
                
                {messages.length > 0 ? (
                    <div className="messages">
                        {messages.map((msg) => {
                            const isOwnMessage = msg.user_id === userId;
                            return (
                                <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`} key={msg.id}>
                                    <div className="avatar">
                                        <img src={getUserAvatar(msg)} alt="Avatar" className="avatar-img" />
                                    </div>
                                    <div className="message-bubble">
                                        <div className="message-header">
                                            <span className="username">{getUserDisplayName(msg)}</span>
                                            <span className="timestamp">{formatDate(msg.created_at)}</span>
                                        </div>
                                        <p className="message-text">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-messages">
                         <div className="text-center py-8 text-gray-500">
                            <p>No messages yet. Be the first to post!</p>
                            <p className="text-sm text-gray-400 mt-2">All messages are reviewed by an administrator before appearing.</p>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <Link 
                            to={`?page=${currentPage - 1}`} 
                            prefetch="intent"
                            className={`pagination-link ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`} 
                            aria-disabled={currentPage <= 1}
                        >
                            Previous
                        </Link>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Link 
                            to={`?page=${currentPage + 1}`} 
                            prefetch="intent"
                            className={`pagination-link ${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`} 
                            aria-disabled={currentPage >= totalPages}
                        >
                            Next
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
} 