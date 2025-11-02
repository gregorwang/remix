import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import crypto from 'crypto';

// 请求体类型
interface ImageTokenRequest {
  imageName: string;
  expiresInMinutes?: number;
}

// 响应类型
interface ImageTokenResponse {
  success: boolean;
  data?: {
    imageName: string;
    imageUrl: string;
    token: string;
    expires: number;
    expiresAt: string;
    expiresInMinutes: number;
  };
  error?: string;
}

// Action function for token generation - following Remix best practices
export async function action({ request }: ActionFunctionArgs) {
  console.log('🚀 API action called:', request.method, request.url);
  
  // 添加调试信息
  console.log('📝 Request headers:', Object.fromEntries(request.headers.entries()));
  
  // 只允许POST请求
  if (request.method !== 'POST') {
    return json<ImageTokenResponse>(
      { 
        success: false, 
        error: 'Method not allowed' 
      },
      { 
        status: 405,
        headers: {
          "Allow": "POST",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }

  try {
    // 解析请求体
    const body: ImageTokenRequest = await request.json();
    const { imageName, expiresInMinutes = 30 } = body;

    // 验证必需参数
    if (!imageName) {
      return json<ImageTokenResponse>(
        { 
          success: false, 
          error: 'Image name is required' 
        },
        { 
          status: 400,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }

    // 验证过期时间范围（5-60分钟）
    const validExpiresInMinutes = Math.max(5, Math.min(60, parseInt(String(expiresInMinutes))));

    // 配置 - 安全性: 不提供密钥回退值
    const secret = process.env.AUTH_KEY_SECRET;
    if (!secret) {
      throw new Error('AUTH_KEY_SECRET environment variable is required');
    }
    const baseUrl = process.env.IMAGE_BASE_URL || 'https://oss.wangjiajun.asia'; // 图片基础URL
    
    // 计算过期时间戳（秒）
    const expires = Math.floor(Date.now() / 1000) + (validExpiresInMinutes * 60);
    
    // 生成签名：HMAC_SHA256(key:expires, secret)，签名用 hex
    const key = imageName; // 图片名作为key
    const message = `${key}:${expires}`;
    const signature = crypto.createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    
    // 生成Token：base64url(expires:signature)
    const tokenData = `${expires}:${signature}`;
    const token = Buffer.from(tokenData).toString('base64url');
    
    // 生成完整的图片URL
    const imageUrl = `${baseUrl}/${imageName}?token=${token}`;
    
    // Token生成成功响应 - 可以短时间缓存
    return json<ImageTokenResponse>(
      {
        success: true,
        data: {
          imageName,
          imageUrl,
          token,
          expires,
          expiresAt: new Date(expires * 1000).toISOString(),
          expiresInMinutes: validExpiresInMinutes
        }
      },
      {
        headers: {
          // 短时间缓存生成结果，避免重复计算
          "Cache-Control": "private, max-age=60",
          "Content-Type": "application/json",
        }
      }
    );

  } catch (error) {
    // TypeScript error handling
    console.error('❌ API Error:', error);
    let errorMessage = 'Token generation failed';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON in request body';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return json<ImageTokenResponse>(
      {
        success: false,
        error: errorMessage
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }
}

// 对于仅有action的路由，需要提供一个默认的loader或组件
export async function loader() {
  console.log('🔍 API loader called - this should not happen for POST requests');
  // 返回API说明
  return json(
    {
      message: "Image Token Generation API",
      method: "POST",
      description: "Generate secure tokens for image access",
      usage: {
        endpoint: "/api/image-token",
        method: "POST",
        body: {
          imageName: "string (required)",
          expiresInMinutes: "number (optional, 5-60, default: 30)"
        }
      }
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600", // API文档可以长时间缓存
      }
    }
  );
}

// 该资源路由仅返回 JSON，不再提供 React 组件 UI，以免客户端 fetch 得到 HTML。 