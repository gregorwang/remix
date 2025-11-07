// Better Auth API 路由
// 处理所有 /api/auth/* 的请求，包括OAuth回调
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { auth } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request);
}
