// 服务端图片Token生成工具函数
// 用于在服务端批量生成图片访问token，避免客户端多次请求

import crypto from 'crypto';

export interface TokenResult {
  imageName: string;
  imageUrl: string;
  token: string;
  expires: number;
}

/**
 * 生成单个图片的访问token
 * @param imageName 图片名称（相对路径，如 'camera/a.jpg' 或 '/SVG/dd.jpg'）
 * @param expiresInMinutes 过期时间（分钟），默认30分钟，范围5-60分钟
 * @returns Token生成结果，包含完整的图片URL
 */
export function generateImageToken(
  imageName: string,
  expiresInMinutes: number = 30
): TokenResult {
  const secret = process.env.AUTH_KEY_SECRET;
  if (!secret) {
    throw new Error('AUTH_KEY_SECRET environment variable is required');
  }
  
  const baseUrl = process.env.IMAGE_BASE_URL || 'https://oss.wangjiajun.asia';
  
  // 统一处理路径：去掉前导斜杠，保持与客户端hook一致
  // 客户端使用 url.replace(/^\/+/, '') 来去掉前导斜杠
  const normalizedImageName = imageName.replace(/^\/+/, '');
  
  // 验证过期时间范围（5-60分钟）
  const validExpiresInMinutes = Math.max(5, Math.min(60, expiresInMinutes));
  
  // 计算过期时间戳（秒）
  const expires = Math.floor(Date.now() / 1000) + (validExpiresInMinutes * 60);
  
  // 生成签名：HMAC_SHA256(normalizedImageName:expires, secret)
  // 使用规范化后的路径名来生成签名，确保与OSS服务器验证逻辑一致
  const message = `${normalizedImageName}:${expires}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // 生成Token：base64url(expires:signature)
  const tokenData = `${expires}:${signature}`;
  const token = Buffer.from(tokenData).toString('base64url');
  
  // 生成完整的图片URL（使用规范化后的路径）
  const imageUrl = `${baseUrl}/${normalizedImageName}?token=${token}`;
  
  // 返回时使用原始imageName作为key，但token基于规范化后的路径生成
  return { imageName: normalizedImageName, imageUrl, token, expires };
}

/**
 * 批量生成多个图片的访问token
 * @param imageNames 图片名称数组
 * @param expiresInMinutes 过期时间（分钟），默认30分钟
 * @returns Token生成结果数组
 */
export function generateImageTokens(
  imageNames: string[],
  expiresInMinutes: number = 30
): TokenResult[] {
  return imageNames.map(name => generateImageToken(name, expiresInMinutes));
}

