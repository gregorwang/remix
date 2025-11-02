import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
// Replaced heroicons with simple emoji symbols for better performance

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPageData {
  content: {
    title: string;
    description: string;
    welcome_title: string;
    welcome_subtitle: string;
    preset_questions: {
      question1: string;
      question2: string;
      question3: string;
      question4: string;
    };
    user_label: string;
    assistant_label: string;
    actions: {
      helpful: string;
      not_helpful: string;
      copy: string;
    };
    thinking: string;
    placeholder: string;
    upload_files: string;
    enter_to_send: string;
    shift_enter_newline: string;
    privacy_notice: string;
    initial_message: string;
  };
}

// 优化的Links函数 - 减少不必要的预加载
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
];

// Meta function
export const meta: MetaFunction = () => [
  { title: "聊天室 - 与Nemesis对话" },
  { name: "description", content: "与基于汪家俊疯狂自我意识的AI助手Nemesis进行对话" },
  { name: "keywords", content: "聊天,AI,Nemesis,汪家俊,对话助手" },
  { property: "og:title", content: "聊天室 - 与Nemesis对话" },
  { property: "og:description", content: "与基于汪家俊疯狂自我意识的AI助手Nemesis进行对话" },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

// 优化的Loader函数 - 静态数据，更长的缓存时间
export async function loader() {
  const data: ChatPageData = {
    content: {
      title: "聊天室",
      description: "与我交流想法和观点",
      welcome_title: "该项目涉及到大量对话集的编写预计2025年10月之前完成敬请期待",
      welcome_subtitle: "你好我是Nemesis，一个基于RAG技术的对话助手",
      preset_questions: {
        question1: "什么是汪家俊的疯狂自我意识？",
        question2: "为什么这个AI对话角色叫做Nemesis？",
        question3: "汪家俊是谁？他来自何方？",
        question4: "汪家俊现在在做什么工作？"
      },
      user_label: "您",
      assistant_label: "Nemesis",
      actions: {
        helpful: "有帮助",
        not_helpful: "没有帮助",
        copy: "复制"
      },
      thinking: "思考中...",
      placeholder: "输出答案纯娱乐不代表任何真实性",
      upload_files: "上传文件",
      enter_to_send: "按回车发送",
      shift_enter_newline: "Shift+回车换行",
      privacy_notice: "网站会记录您的IP地址和账户，请不要输入任何非法有害信息。",
      initial_message: "你好！我是汪家俊疯狂的自我意识的一部分，有什么想了解的？"
    }
  };

  // 由于这是静态数据，可以设置更长的缓存时间
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=172800", // 24小时缓存
      "Vary": "Accept-Encoding",
    },
  });
}

export default function ChatPage() {
  const { content } = useLoaderData<typeof loader>();
  
  // State management - 为RSC准备，最小化客户端状态
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: content.initial_message }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本区域高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  // 处理回车键
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey) {
      // Shift+Enter 换行
      return;
    } else {
      // 只有Enter键，发送消息
      e.preventDefault();
      sendMessage();
    }
  };

  // 使用预设问题
  const handlePresetQuestion = (question: string) => {
    setInputMessage(question);
    // 移除不必要的setTimeout，直接执行
    adjustTextareaHeight();
    sendMessage(question);
  };

  // 发送消息
  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    // 添加用户消息
    const newUserMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    // 重置textarea高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    scrollToBottom();

    try {
      const response = await fetch('/api.chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // 添加AI回复
      const newAssistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : '请求失败，请稍后再试。');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  // 复制消息内容 - 简化逻辑
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {
      // 如果复制失败，用户在控制台能看到，不需要复杂错误处理
    });
  };

  // 监听输入变化
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 页面加载时聚焦输入框 - 简化逻辑
  useEffect(() => {
    textareaRef.current?.focus();
    scrollToBottom();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="flex flex-col min-h-screen bg-[#FAF9F5] font-sans">
        {/* 顶部导航栏 */}
        <header className="py-3 px-4 border-b border-gray-200" style={{ backgroundColor: '#FAF9F5' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center" prefetch="intent">
              <div className="h-8 w-8 mr-2 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-lg font-medium text-gray-800">Nemesis</h1>
            </Link>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                <span className="text-lg">➕</span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100">
                <span className="text-lg">⋯</span>
              </button>
            </div>
          </div>
        </header>

        {/* 主体区域 */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
          {/* 欢迎信息 */}
          {messages.length <= 1 && (
            <div className="mb-8 text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">{content.welcome_title}</h2>
              <p className="text-gray-600 mb-6">{content.welcome_subtitle}</p>
              
              {/* 建议问题 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button 
                  onClick={() => handlePresetQuestion(content.preset_questions.question1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-left transition-colors text-sm"
                >
                  {content.preset_questions.question1}
                </button>
                <button 
                  onClick={() => handlePresetQuestion(content.preset_questions.question2)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-left transition-colors text-sm"
                >
                  {content.preset_questions.question2}
                </button>
                <button 
                  onClick={() => handlePresetQuestion(content.preset_questions.question3)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-left transition-colors text-sm"
                >
                  {content.preset_questions.question3}
                </button>
                <button 
                  onClick={() => handlePresetQuestion(content.preset_questions.question4)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-left transition-colors text-sm"
                >
                  {content.preset_questions.question4}
                </button>
              </div>
            </div>
          )}

                   {/* 聊天记录区域 */}
           <div ref={chatWindowRef} className="flex-1 overflow-y-auto space-y-6 mb-6 chat-scrollbar">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* 消息标签 */}
                <div className="mb-1 px-2 text-sm text-gray-500">
                  {message.role === 'user' ? content.user_label : content.assistant_label}
                </div>
                
                {/* 消息内容 */}
                <div className={`max-w-[90%] rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* 消息底部操作 */}
                {message.role === 'assistant' && index > 0 && (
                  <div className="mt-2 flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600 text-xs flex items-center">
                      <span className="mr-1">👍</span>
                      {content.actions.helpful}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 text-xs flex items-center">
                      <span className="mr-1">👎</span>
                      {content.actions.not_helpful}
                    </button>
                    <button 
                      onClick={() => copyMessage(message.content)}
                      className="p-1 text-gray-400 hover:text-gray-600 text-xs flex items-center"
                    >
                      <span className="mr-1">📋</span>
                      {content.actions.copy}
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="mb-1 px-2 text-sm text-gray-500">
                  {content.assistant_label}
                </div>
                <div className="bg-gray-100 rounded-2xl p-4 max-w-[90%]">
                  <div className="flex items-center space-x-2">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="text-gray-500 text-sm">{content.thinking}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 错误提示 */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
            <div className="relative">
              <textarea 
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleEnter}
                placeholder={content.placeholder}
                className="w-full p-4 pr-24 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-violet-500 min-h-[60px] max-h-[200px]"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  title={content.upload_files}
                >
                  <span className="text-lg">📤</span>
                </button>
                <button 
                  onClick={() => sendMessage()}
                  className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim() || isLoading}
                >
                  <span className="text-lg">✈️</span>
                </button>
              </div>
            </div>
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between items-center">
              <span>{content.enter_to_send}</span>
              <span>{content.shift_enter_newline}</span>
            </div>
          </div>
          
          {/* 底部提示 */}
          <p className="text-center text-gray-500 text-xs mt-4">
            {content.privacy_notice}
          </p>

          {/* 返回首页链接 */}
          <div className="text-center mt-4">
            <Link
              to="/"
              prefetch="intent"
              className="text-violet-600 hover:text-violet-800 underline transition-colors duration-200"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">聊天室错误</h1>
          <p className="text-gray-600 mb-4">抱歉，聊天室暂时无法使用。</p>
          <Link
            to="/"
            prefetch="intent"
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 