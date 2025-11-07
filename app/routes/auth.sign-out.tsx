import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { auth } from "~/lib/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Better Auth 登出
  await auth.api.signOut({
    headers: request.headers,
  });

  // 重定向到首页
  return redirect("/", {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
};

// 资源路由，不需要UI
export default function SignOutRoute() {
  return null;
}
