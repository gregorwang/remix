import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useSearchParams, Link } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";

export const loader = async () => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error(
            `Missing required environment variables:\n` +
            `SUPABASE_URL: ${SUPABASE_URL ? '✓' : '✗ Missing'}\n` +
            `SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✓' : '✗ Missing'}\n` +
            `Please create a .env file in your project root with these variables.`
        );
    }

    return json({
        ENV: {
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
        },
    }, {
        headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400", // 环境变量可长时间缓存
        }
    });
};

// 强密码验证函数
function isPasswordStrong(password: string): boolean {
    return password.length >= 12 
        && /[A-Z]/.test(password)  // 包含大写字母
        && /[a-z]/.test(password)  // 包含小写字母
        && /[0-9]/.test(password); // 包含数字
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const { supabase, headers } = createClient(request);
    const formData = await request.formData();
    const { intent, email, password } = Object.fromEntries(formData);
    const redirectTo = new URL(request.url).origin;

    switch (intent) {
        case "sign-in": {
            if (!email || !password) {
                return json({ error: "请输入邮箱和密码。" }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            const { error } = await supabase.auth.signInWithPassword({
                email: email.toString(),
                password: password.toString(),
            });
            if (error) {
                const responseHeaders = new Headers(headers);
                responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `登录失败: ${error.message}` }, { status: 401, headers: responseHeaders });
            }
            const responseHeaders = new Headers(headers);
            return redirect("/", { headers: responseHeaders });
        }
        case "sign-up": {
            if (!email || !password) {
                return json({ error: "请输入邮箱和密码。" }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            if (!isPasswordStrong(password.toString())) {
                return json({ error: "密码必须至少12位,且包含大写字母、小写字母和数字。" }, { 
                    status: 400,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                    }
                });
            }
            const { error } = await supabase.auth.signUp({
                email: email.toString(),
                password: password.toString(),
            });
            if (error) {
                const responseHeaders = new Headers(headers);
                responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `注册失败: ${error.message}` }, { status: 500, headers: responseHeaders });
            }
            const responseHeaders = new Headers(headers);
            responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
            return json({ success: "注册成功！请检查您的邮箱进行验证。" }, { headers: responseHeaders });
        }
        case "google":
        case "microsoft": {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: intent === 'microsoft' ? 'azure' : 'google',
                options: { redirectTo },
            });
            if (error) {
                const responseHeaders = new Headers(headers);
                responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
                return json({ error: `第三方登录失败: ${error.message}` }, { status: 500, headers: responseHeaders });
            }
            const responseHeaders = new Headers(headers);
            return redirect(data.url, { headers: responseHeaders });
        }
        default:
            return json({ error: "无效的请求。" }, { 
                status: 400,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                }
            });
    }
};

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const fetcher = useFetcher<typeof action>();
    const isSigningIn = fetcher.formData?.get('intent') === 'sign-in' && fetcher.state !== 'idle';
    const isSigningUp = fetcher.formData?.get('intent') === 'sign-up' && fetcher.state !== 'idle';
    const actionData = fetcher.data;
    const isRegister = searchParams.get('type') === 'register';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-6">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            {isRegister ? '创建账户' : '欢迎回来'}
                        </h2>
                        <p className="mt-3 text-base text-gray-600">
                            {isRegister ? (
                                <>
                                    已经有账户了？{' '}
                                    <Link to="/auth" prefetch="intent" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                        立即登录
                                    </Link>
                                </>
                            ) : (
                                <>
                                    还没有账户？{' '}
                                    <Link to="/auth?type=register" prefetch="intent" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                        注册新账户
                                    </Link>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                            <fetcher.Form method="POST" className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        邮箱地址
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="请输入您的邮箱"
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:ring-gray-400"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        密码
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            autoComplete={isRegister ? "new-password" : "current-password"}
                                            placeholder={isRegister ? "创建密码（至少12位，含大小写字母和数字）" : "请输入您的密码"}
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:ring-gray-400"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {actionData && 'error' in actionData && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600 flex items-center">
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {actionData.error}
                                        </p>
                                    </div>
                                )}
                                {actionData && 'success' in actionData && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <p className="text-sm text-green-600 flex items-center">
                                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {actionData.success}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <button
                                        type="submit"
                                        name="intent"
                                        value={isRegister ? "sign-up" : "sign-in"}
                                        disabled={isSigningIn || isSigningUp}
                                        className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {isSigningIn || isSigningUp ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {isRegister ? '创建账户中...' : '登录中...'}
                                            </>
                                        ) : (
                                            <>
                                                {isRegister ? '创建账户' : '立即登录'}
                                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </fetcher.Form>
                        </div>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 text-gray-500 font-medium">或者使用第三方登录</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <fetcher.Form method="post">
                                    <button type="submit" name="intent" value="google" className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-200">
                                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                                            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26540 14.29L1.27539 17.385C3.25539 21.31 7.31040 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                        </svg>
                                        <span>Google</span>
                                    </button>
                                </fetcher.Form>

                                <fetcher.Form method="post">
                                    <button type="submit" name="intent" value="microsoft" className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue-500 transition-all duration-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="h-5 w-5">
                                            <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                                            <path fill="#F25022" d="M1 1h10.14v10.14H1z"/>
                                            <path fill="#00A4EF" d="M1 11.86h10.14V22H1z"/>
                                            <path fill="#7FBA00" d="M11.86 1h10.14v10.14H11.86z"/>
                                            <path fill="#FFB900" d="M11.86 11.86h10.14V22H11.86z"/>
                                        </svg>
                                        <span>Microsoft</span>
                                    </button>
                                </fetcher.Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 opacity-90"></div>
                <img
                    alt="个人网站"
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-md px-8">
                        <h3 className="text-3xl font-bold mb-6">开始您的数字化之旅</h3>
                        <p className="text-xl opacity-90 leading-relaxed">
                            加入我们的社区，发现无限可能。享受安全、便捷的数字化服务体验。看看我的网站吧！
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 