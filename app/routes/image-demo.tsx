import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { 
  generateImageToken, 
  verifyImageToken, 
  generateImageUrl, 
  validateImageName, 
  validateExpirationTime 
} from "~/lib/utils/cryptoUtils";

// Types
interface DemoData {
  lastGenerated?: {
    imageName: string;
    imageUrl: string;
    token: string;
    expiresAt: string;
  };
}

interface TokenData {
  imageName: string;
  imageUrl: string;
  token: string;
  expires: number;
  expiresAt: string;
  expiresInMinutes: number;
}

interface VerifyData {
  valid: boolean;
  expires: number;
  expiresAt: string;
  remainingTime: number;
}

interface ActionData {
  success: boolean;
  data?: TokenData | VerifyData;
  error?: string;
  type: 'generate' | 'verify';
}

// Removed preload link to fix the warning about unused preloaded resource

// Meta function for SEO
export const meta: MetaFunction = () => [
  { title: "图片Token演示 - 安全图片访问系统" },
  { name: "description", content: "演示安全图片访问token的生成和验证功能" },
  { name: "robots", content: "noindex, nofollow" }, // 演示页面不需要索引
];

// Loader function for initial data
// Loader function - 只做I/O操作，符合Remix规范
export async function loader() {
  // 演示页面的初始状态
  const data: DemoData = {};

  return json(data, {
    headers: {
      // 演示页面可以适度缓存，提升性能
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
      "Content-Type": "application/json",
    },
  });
}

// Action function - 只做I/O操作，纯算法逻辑已提取到utils
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;

  if (actionType === 'generate') {
    const imageName = formData.get('imageName') as string;
    const expiresInMinutes = parseInt(formData.get('expiresInMinutes') as string) || 30;

    // 使用工具函数验证图片名称 (纯算法逻辑已提取)
    const nameValidation = validateImageName(imageName);
    if (!nameValidation.isValid) {
      return json<ActionData>({ 
        success: false, 
        error: nameValidation.error!,
        type: 'generate'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    try {
      // 使用工具函数验证和调整过期时间 (纯算法逻辑已提取)
      const { validTime: validExpiresInMinutes } = validateExpirationTime(expiresInMinutes);

      // 配置
      const secret = process.env.AUTH_KEY_SECRET || '0627';
      const baseUrl = process.env.IMAGE_BASE_URL || 'https://oss.wangjiajun.asia';
      
      // 使用工具函数生成token (纯算法逻辑已提取)
      const tokenResult = generateImageToken(imageName, secret, validExpiresInMinutes);
      
      // 使用工具函数生成完整URL (纯算法逻辑已提取)
      const imageUrl = generateImageUrl(baseUrl, imageName, tokenResult.token);
      
      return json<ActionData>({
        success: true,
        data: {
          imageName,
          imageUrl,
          token: tokenResult.token,
          expires: tokenResult.expires,
          expiresAt: tokenResult.expiresAt,
          expiresInMinutes: validExpiresInMinutes
        },
        type: 'generate'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        }
      });

    } catch (error) {
      console.error('Token generation error:', error);
      return json<ActionData>({
        success: false,
        error: '生成token失败',
        type: 'generate'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

  } else if (actionType === 'verify') {
    const token = formData.get('token') as string;
    const imageName = formData.get('verifyImageName') as string;

    if (!token || !imageName) {
      return json<ActionData>({ 
        success: false, 
        error: '请输入token和图片名称',
        type: 'verify'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }

    try {
      // 配置
      const secret = process.env.AUTH_KEY_SECRET || '0627';
      
      // 使用工具函数验证token (纯算法逻辑已提取)
      const verification = verifyImageToken(token, imageName, secret);
      
      if (!verification.valid) {
        return json<ActionData>({
          success: false,
          error: verification.error!,
          type: 'verify'
        }, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          }
        });
      }

      return json<ActionData>({
        success: true,
        data: {
          valid: verification.valid,
          expires: verification.expires!,
          expiresAt: verification.expiresAt!,
          remainingTime: verification.remainingTime!
        },
        type: 'verify'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      return json<ActionData>({
        success: false,
        error: '验证token失败',
        type: 'verify'
      }, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });
    }
  }

  return json<ActionData>({ 
    success: false, 
    error: '未知操作',
    type: 'generate'
  }, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    }
  });
}

// Main component
export default function ImageDemo() {
  const actionData = useActionData<typeof action>();
  const [copiedText, setCopiedText] = useState<string>('');

  // 复制到剪贴板功能
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            图片Token系统演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            安全的图片访问控制系统，支持生成和验证具有时效性的访问token
          </p>
          <div className="mt-6">
            <Link
              to="/"
              prefetch="intent"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← 返回首页
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Token生成 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              生成访问Token
            </h2>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="generate" />
              
              <div>
                <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-2">
                  图片名称
                </label>
                <input
                  id="imageName"
                  type="text"
                  name="imageName"
                  placeholder="example.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="expiresInMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                  有效期（分钟）
                </label>
                <select
                  id="expiresInMinutes"
                  name="expiresInMinutes"
                  defaultValue="30"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5分钟</option>
                  <option value="15">15分钟</option>
                  <option value="30">30分钟</option>
                  <option value="60">60分钟</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                生成Token
              </button>
            </Form>

            {/* 生成结果 */}
            {actionData?.type === 'generate' && (
              <div className="mt-6">
                {actionData.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium mb-3">✅ Token生成成功</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="block text-green-700 font-medium mb-1">完整URL:</div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white p-2 rounded border break-all text-xs">
                            {(actionData.data as TokenData)?.imageUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard((actionData.data as TokenData)?.imageUrl, 'URL')}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {copiedText === 'URL' ? '已复制' : '复制'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="block text-green-700 font-medium mb-1">Token:</div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white p-2 rounded border break-all text-xs">
                            {(actionData.data as TokenData)?.token}
                          </code>
                          <button
                            onClick={() => copyToClipboard((actionData.data as TokenData)?.token, 'Token')}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            {copiedText === 'Token' ? '已复制' : '复制'}
                          </button>
                        </div>
                      </div>
                      <div className="text-green-700">
                        过期时间: {new Date((actionData.data as TokenData)?.expiresAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">❌ 生成失败</h3>
                    <p className="text-red-700 mt-1">{actionData.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Token验证 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              验证Token
            </h2>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="actionType" value="verify" />
              
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <textarea
                  id="token"
                  name="token"
                  placeholder="粘贴生成的token..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="verifyImageName" className="block text-sm font-medium text-gray-700 mb-2">
                  图片名称
                </label>
                <input
                  id="verifyImageName"
                  type="text"
                  name="verifyImageName"
                  placeholder="example.jpg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                验证Token
              </button>
            </Form>

            {/* 验证结果 */}
            {actionData?.type === 'verify' && (
              <div className="mt-6">
                {actionData.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium mb-3">✅ Token验证成功</h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <div>过期时间: {new Date((actionData.data as VerifyData)?.expiresAt).toLocaleString('zh-CN')}</div>
                      <div>剩余时间: {Math.floor((actionData.data as VerifyData)?.remainingTime / 60)}分钟</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-medium">❌ 验证失败</h3>
                    <p className="text-red-700 mt-1">{actionData.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 说明文档 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">使用说明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">API端点</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-3 rounded">
                  <code>POST /photo</code> - 生成token (使用action)
                </div>
                <div className="bg-gray-100 p-3 rounded">
                  <code>POST /image-demo</code> - 验证token (使用action)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">安全特性</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• HMAC-SHA256签名保护</li>
                <li>• 时效性控制（5-60分钟）</li>
                <li>• Base64URL安全编码</li>
                <li>• 图片名称绑定验证</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-blue-800 font-medium mb-2">环境变量配置</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><code>AUTH_KEY_SECRET</code> - HMAC签名密钥</div>
              <div><code>IMAGE_BASE_URL</code> - 图片服务器基础URL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">演示页面错误</h1>
          <p className="text-gray-600 mb-4">抱歉，图片token演示页面暂时无法显示。</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}