import { createCookie } from "@remix-run/node";

export type Theme = "light" | "dark";

const themeCookie = createCookie("theme", {
  maxAge: 31_536_000, // 1 year
  httpOnly: false, // 允许客户端访问
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

export async function getTheme(request: Request): Promise<Theme> {
  const cookieHeader = request.headers.get("Cookie");
  const theme = await themeCookie.parse(cookieHeader);
  return theme === "dark" ? "dark" : "light";
}

export async function setTheme(theme: Theme) {
  return themeCookie.serialize(theme);
}

