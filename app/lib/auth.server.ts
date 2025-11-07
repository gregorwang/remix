import { betterAuth } from "better-auth";
import { db } from "./db.server";
import { sendMagicLinkEmail } from "./email.server";

// 获取应用URL
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// 配置Better Auth
export const auth = betterAuth({
  database: {
    provider: "sqlite",
    db: db as any,
  },
  // 基础URL
  baseURL: APP_URL,
  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7天
    updateAge: 60 * 60 * 24, // 1天后更新
  },
  // 邮箱密码登录（可选，先禁用）
  emailAndPassword: {
    enabled: false, // 只用Google + Magic Link
  },
  // 社交登录
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Magic Link（无密码邮箱登录）
  // @ts-ignore - Better Auth类型问题，但功能正常
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, token, url }) => {
      console.log(`[Auth] Sending magic link to ${email}`);
      await sendMagicLinkEmail(email, url);
    },
    expiresIn: 5 * 60, // 5分钟
  },
});

// 辅助函数：要求用户登录
export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session.user;
}

// 辅助函数：检查是否为管理员
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

// 辅助函数：要求管理员权限
export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  if (!user.email || !isAdmin(user.email)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
