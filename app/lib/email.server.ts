import nodemailer from "nodemailer";

// 创建邮件发送器
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 验证邮件配置
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("[Email] SMTP connection error:", error.message);
    } else {
      console.log("[Email] SMTP server ready to send emails");
    }
  });
}

/**
 * 发送Magic Link登录邮件
 */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string) {
  // 如果在开发环境且未配置邮件，只打印到控制台
  if (process.env.NODE_ENV === "development" && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                     🔐 MAGIC LINK (开发模式)                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  收件人: ${email.padEnd(57)}║
║  登录链接:                                                        ║
║  ${magicLinkUrl.padEnd(61)}║
║                                                                   ║
║  提示: 复制上面的链接到浏览器即可登录                              ║
║  提示: 链接5分钟内有效                                            ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
    return { success: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "汪家俊的网站"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "登录验证 - 汪家俊的网站",
      html: getEmailTemplate(magicLinkUrl),
    });

    console.log(`[Email] Magic link sent to ${email}, messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Email] Failed to send magic link:", error.message);
    throw new Error("邮件发送失败");
  }
}

/**
 * 邮件HTML模板
 */
function getEmailTemplate(magicLinkUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录验证</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔐 登录验证
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您好！
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您正在登录 <strong>汪家俊的个人网站</strong>，点击下方按钮即可完成登录。
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}"
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      立即登录 →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>重要提示：</strong>
              </p>
              <ul style="margin: 8px 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <li>此链接仅在 <strong>5分钟</strong> 内有效</li>
                <li>如果按钮无法点击，请复制下方链接到浏览器：</li>
              </ul>

              <!-- Fallback Link -->
              <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #667eea;">
                <p style="margin: 0; color: #6b7280; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                  ${magicLinkUrl}
                </p>
              </div>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                如果这不是您本人的操作，请忽略此邮件。
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} 汪家俊的个人网站 · 保留所有权利
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
