import { useEffect, useState, useMemo } from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
  json,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createBrowserClient } from "@supabase/ssr";

// Removed Clerk imports - now using Supabase only

import { createClient } from "~/utils/supabase.server";
import type { Database } from "~/lib/types";
import tailwindStyles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "dns-prefetch", href: "https://supabase.co" },
  { rel: "preload", as: "style", href: tailwindStyles },
  // 预加载常用路由
  { rel: "prefetch", href: "/chat" },
];

// Simplified root loader - using Supabase only
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ----- 环境变量和 Supabase 初始化 ----- //
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  
  // 环境变量检查
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      `Missing required environment variables:\n` +
      `SUPABASE_URL: ${SUPABASE_URL ? '✓' : '✗ Missing'}\n` +
      `SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓' : '✗ Missing'}\n` +
      `Please create a .env file in your project root with these variables.`
    );
  }

  const env = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  };

  // 使用 Supabase 获取 session，并将必要的 Set-Cookie 头返回给 Remix
  const { supabase, headers } = createClient(request);

  // 先检查会话，避免不必要的 token 刷新尝试
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  let user = null;
  let userError = null;
  
  if (session && !sessionError) {
    // 只有在有会话时才尝试获取用户信息
    const {
      data: { user: authenticatedUser },
      error: authUserError,
    } = await supabase.auth.getUser();
    user = authenticatedUser;
    userError = authUserError;
  }

  return json({
    env,
    session,
    user,
    userError,
  }, {
    headers: Object.fromEntries(headers.entries())
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { env, session } = loaderData;
  const revalidator = useRevalidator();

  // 使用useMemo优化Supabase客户端创建
  const supabase = useMemo(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
    [env.SUPABASE_URL, env.SUPABASE_ANON_KEY]
  );
  
  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        // call loaders
        revalidator.revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, revalidator]);

  return <Outlet context={{ supabase, session }} />;
}

// Export the App component directly (no more ClerkApp wrapper)
export default App;
