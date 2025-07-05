import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import crypto from 'crypto';

// 验证token的响应类型
interface VerifyTokenResponse {
  valid: boolean;
  error?: string;
  expires?: number;
  expiresAt?: string;
  currentTime?: number;
  remainingTime?: number;
}

// Loader function for token verification - following Remix best practices
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const imageName = url.searchParams.get('imageName');

  // 验证必需参数
  if (!token || !imageName) {
    return json<VerifyTokenResponse>(
      { 
        valid: false, 
        error: 'Token and image name are required' 
      },
      { 
        status: 400,
        headers: {
          // 错误响应不缓存
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      }
    );
  }

  try {
    // 配置 - 保持和生成端一致
    const secret = process.env.AUTH_KEY_SECRET || '0627';
    
    // 解码Token：base64url(expires:signature)
    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [expires, receivedSignature] = tokenData.split(':');
    
    if (!expires || !receivedSignature) {
      return json<VerifyTokenResponse>(
        { 
          valid: false, 
          error: 'Invalid token format' 
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }
    
    // 检查是否过期
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresTimestamp = parseInt(expires);
    
    if (expiresTimestamp < currentTime) {
      return json<VerifyTokenResponse>(
        {
          valid: false,
          error: 'Token expired',
          expires: expiresTimestamp,
          currentTime
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }
    
    // 重新计算签名进行验证
    const key = imageName; // 图片名作为key
    const message = `${key}:${expires}`;
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(message)
      .digest('hex'); // 校验也用 hex
    
    // 验证签名
    if (receivedSignature !== expectedSignature) {
      return json<VerifyTokenResponse>(
        {
          valid: false,
          error: 'Invalid signature'
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        }
      );
    }

    // 成功验证 - 可以短时间缓存验证结果
    const remainingTime = expiresTimestamp - currentTime;
    const cacheTime = Math.min(60, remainingTime); // 缓存时间不超过1分钟且不超过token剩余时间
    
    return json<VerifyTokenResponse>(
      {
        valid: true,
        expires: expiresTimestamp,
        expiresAt: new Date(expiresTimestamp * 1000).toISOString(),
        remainingTime
      },
      {
        headers: {
          // 验证成功可以短时间缓存，但不超过token剩余时间
          "Cache-Control": `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          "Content-Type": "application/json",
        }
      }
    );
    
  } catch (error) {
    // TypeScript error handling
    const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
    
    return json<VerifyTokenResponse>(
      {
        valid: false,
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

// Error Boundary as required by ruler2.md
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Token验证服务错误</h1>
          <p className="text-gray-600 mb-4">抱歉，token验证服务暂时不可用。</p>
          <button 
            onClick={() => window.location.href = window.location.href} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    </div>
  );
} 