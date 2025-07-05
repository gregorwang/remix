import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { generateChatResponse, selectRandomResponse, validateChatMessage } from "~/lib/utils/chatUtils";

// Types
interface ChatRequest {
  message: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

// Action function - 处理POST请求 (只做I/O操作，纯算法已提取到utils)
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { 
      status: 405,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      }
    });
  }

  try {
    const body: ChatRequest = await request.json();
    const { message } = body;

    // 使用工具函数验证消息 (纯算法逻辑已提取)
    const validation = validateChatMessage(message);
    if (!validation.isValid) {
      return json(
        { error: validation.error },
        { 
          status: 400,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }

    // 使用工具函数生成响应 (纯算法逻辑已提取)
    const responses = generateChatResponse(message);
    const randomResponse = selectRandomResponse(responses);

    const response: ChatResponse = {
      choices: [{
        message: {
          content: randomResponse,
          role: "assistant"
        }
      }]
    };

    return json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      }
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return json(
      { error: "服务器内部错误，请稍后再试" },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }
}

// Loader function - 返回API文档 (只做I/O操作，符合Remix规范)
export async function loader() {
  return json(
    {
      message: "Nemesis Chat API",
      method: "POST",
      description: "基于汪家俊疯狂自我意识的AI对话助手",
      usage: {
        endpoint: "/api/chat",
        method: "POST",
        body: {
          message: "string (required) - 用户消息内容"
        },
        response: {
          choices: [
            {
              message: {
                content: "string - AI回复内容",
                role: "assistant"
              }
            }
          ]
        }
      },
      note: "纯算法逻辑已提取到 ~/lib/utils/chatUtils.ts 中，符合Remix最佳实践"
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Content-Type": "application/json",
      }
    }
  );
}

// 注意：原本的generateResponse函数已迁移到 ~/lib/utils/chatUtils.ts
// 这样符合Remix规范：loader/action只做I/O操作，纯算法逻辑提取到utils中

// 导出默认组件以满足Remix要求
export default function ChatAPI() {
  return null;
} 