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

import { createSupabaseServerClient } from "~/lib/supabase.server";
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
  // 添加关键路由的预加载
  { rel: "prefetch", href: "/chat" },
  { rel: "prefetch", href: "/music" },
  { rel: "prefetch", href: "/game" },
];

// Simplified root loader - using Supabase only
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ----- 环境变量和 Supabase 初始化 ----- //
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  const env = {
    SUPABASE_URL: SUPABASE_URL!,
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY!,
  };

  // 使用 Supabase 获取 session，并将必要的 Set-Cookie 头返回给 Remix
  const response = new Response();
  const { supabase, headers } = createSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({
    env,
    session,
  }, {
    headers: {
      ...Object.fromEntries(headers.entries()),
      // 优化根数据缓存
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=1800",
      // 预加载关键DNS
      "Link": "<https://supabase.co>; rel=dns-prefetch",
    }
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
