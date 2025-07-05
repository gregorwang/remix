// 加密相关的纯算法逻辑工具函数
// 这些函数不涉及 I/O 操作，只做纯计算

import crypto from 'crypto';

/**
 * Token 生成结果接口
 */
export interface TokenResult {
  token: string;
  expires: number;
  expiresAt: string;
  signature: string;
}

/**
 * Token 验证结果接口
 */
export interface TokenVerificationResult {
  valid: boolean;
  error?: string;
  expires?: number;
  expiresAt?: string;
  remainingTime?: number;
}

/**
 * 生成图片访问token
 * @param imageName 图片名称
 * @param secret 密钥
 * @param expiresInMinutes 过期时间（分钟）
 * @returns Token生成结果
 */
export function generateImageToken(
  imageName: string,
  secret: string,
  expiresInMinutes: number
): TokenResult {
  // 验证过期时间范围（5-60分钟）
  const validExpiresInMinutes = Math.max(5, Math.min(60, expiresInMinutes));
  
  // 计算过期时间戳（秒）
  const expires = Math.floor(Date.now() / 1000) + (validExpiresInMinutes * 60);
  
  // 生成签名：HMAC_SHA256(key:expires, secret)
  const key = imageName;
  const message = `${key}:${expires}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // 生成Token：base64url(expires:signature)
  const tokenData = `${expires}:${signature}`;
  const token = Buffer.from(tokenData).toString('base64url');
  
  return {
    token,
    expires,
    expiresAt: new Date(expires * 1000).toISOString(),
    signature
  };
}

/**
 * 验证图片访问token
 * @param token 要验证的token
 * @param imageName 图片名称
 * @param secret 密钥
 * @returns 验证结果
 */
export function verifyImageToken(
  token: string,
  imageName: string,
  secret: string
): TokenVerificationResult {
  try {
    // 解码Token：base64url(expires:signature)
    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [expires, receivedSignature] = tokenData.split(':');
    
    if (!expires || !receivedSignature) {
      return {
        valid: false,
        error: 'Token格式无效'
      };
    }
    
    // 检查是否过期
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresTimestamp = parseInt(expires);
    
    if (expiresTimestamp < currentTime) {
      return {
        valid: false,
        error: 'Token已过期',
        expires: expiresTimestamp,
        expiresAt: new Date(expiresTimestamp * 1000).toISOString()
      };
    }
    
    // 重新计算签名进行验证
    const key = imageName;
    const message = `${key}:${expires}`;
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    
    // 验证签名
    if (receivedSignature !== expectedSignature) {
      return {
        valid: false,
        error: '签名验证失败'
      };
    }

    // 成功验证
    const remainingTime = expiresTimestamp - currentTime;

    return {
      valid: true,
      expires: expiresTimestamp,
      expiresAt: new Date(expiresTimestamp * 1000).toISOString(),
      remainingTime
    };

  } catch (error) {
    return {
      valid: false,
      error: '验证token失败'
    };
  }
}

/**
 * 生成完整的图片URL
 * @param baseUrl 基础URL
 * @param imageName 图片名称
 * @param token Token字符串
 * @returns 完整的图片URL
 */
export function generateImageUrl(baseUrl: string, imageName: string, token: string): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBaseUrl}/${imageName}?token=${token}`;
}

/**
 * 验证图片名称格式
 * @param imageName 图片名称
 * @returns 验证结果
 */
export function validateImageName(imageName: string): { isValid: boolean; error?: string } {
  if (!imageName || imageName.trim().length === 0) {
    return { isValid: false, error: '图片名称不能为空' };
  }
  
  // 检查文件名是否包含非法字符
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(imageName)) {
    return { isValid: false, error: '图片名称包含非法字符' };
  }
  
  // 检查文件扩展名
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    imageName.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return { 
      isValid: false, 
      error: `图片格式不支持，支持的格式：${validExtensions.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

/**
 * 验证过期时间范围
 * @param expiresInMinutes 过期时间（分钟）
 * @returns 验证并修正后的过期时间
 */
export function validateExpirationTime(expiresInMinutes: number): {
  validTime: number;
  adjusted: boolean;
} {
  const minTime = 5;
  const maxTime = 60;
  
  if (expiresInMinutes < minTime) {
    return { validTime: minTime, adjusted: true };
  }
  
  if (expiresInMinutes > maxTime) {
    return { validTime: maxTime, adjusted: true };
  }
  
  return { validTime: expiresInMinutes, adjusted: false };
}

/**
 * 格式化剩余时间显示
 * @param remainingSeconds 剩余秒数
 * @returns 格式化的时间字符串
 */
export function formatRemainingTime(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return '已过期';
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  
  return `${seconds}秒`;
}

/**
 * 生成安全的随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateSecureRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 计算文件哈希值
 * @param data 文件数据
 * @param algorithm 哈希算法
 * @returns 哈希值
 */
export function calculateHash(data: string | Buffer, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
} 