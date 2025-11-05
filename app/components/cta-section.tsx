import { useState, useEffect } from "react"
import { useFetcher } from "@remix-run/react"
import CommentsBoard from "./comments-board"
import type { loader as messagesLoader } from "~/routes/messages"

interface Message {
  id: string
  user_id: string
  username: string
  content: string
  status: string
  created_at: string
}

interface CtaSectionProps {
  userId: string | null
}

export default function CtaSection({ userId }: CtaSectionProps) {
  const [showComments, setShowComments] = useState(false)
  const fetcher = useFetcher<typeof messagesLoader>()
  
  // 首次展开时加载数据
  useEffect(() => {
    if (showComments && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/messages")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments])
  
  const messagesData = fetcher.data
  const messages = (messagesData?.messages as Message[]) || []
  const defaultAvatar = messagesData?.defaultAvatar || "/favicon.ico"
  const isLoading = fetcher.state === "loading"

  return (
    <section className="w-full bg-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-8">
        {/* CTA Content */}
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground decoration-2 underline underline-offset-8">
            看到这儿了？留个言？或看看留言
          </h2>

          {/* CTA Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium text-base hover:bg-primary/90 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {showComments ? "关闭留言板" : "展开留言板"}
            <span className="ml-2">↓</span>
          </button>
        </div>

        {/* Comments Board */}
        {showComments && (
          <div className="mt-12 max-w-3xl mx-auto">
            {isLoading ? (
              // 加载状态
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
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
              <CommentsBoard 
                messages={Array.isArray(messages) ? messages : []}
                userId={userId}
                defaultAvatar={defaultAvatar}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
