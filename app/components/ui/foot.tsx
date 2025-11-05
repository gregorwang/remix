import { Link, useFetcher, useRouteLoaderData } from "@remix-run/react"
import { useEffect } from "react"
import type { loader as rootLoader } from "~/root"

// Icon components
const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const footerSections = [
  {
    title: "产品",
    links: [
      { name: "影像记忆", href: "/photo" },
      { name: "音乐之旅", href: "/music" },
      { name: "游戏世界", href: "/game" },
      { name: "RAG-Nemesis", href: "/chat" },
      { name: "动漫回", href: "/anime" },
    ],
  },
  {
    title: "法律",
    links: [{ name: "法律声明", href: "/terms" }],
  },
  {
    title: "资源",
    links: [
      { name: "chatgpt", href: "https://chat.openai.com" },
      { name: "trae", href: "#" },
      { name: "cursor", href: "https://cursor.sh" },
      { name: "poe", href: "https://poe.com" },
      { name: "remix", href: "https://remix.run" },
    ],
  },
  {
    title: "联系",
    links: [
      { name: "十", href: "#" },
      { name: "LinkedIn", href: "#" },
      { name: "优酷", href: "#" },
    ],
  },
]

export default function Footer() {
  const rootData = useRouteLoaderData<typeof rootLoader>("root")
  const theme = rootData?.theme || "light"
  const fetcher = useFetcher()

  // 乐观更新 - 立即应用主题到 DOM
  useEffect(() => {
    if (fetcher.formData?.get("theme")) {
      const newTheme = fetcher.formData.get("theme") as "light" | "dark"
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newTheme)
    }
  }, [fetcher.formData])

  const handleThemeChange = (newTheme: "light" | "dark") => {
    // 使用 fetcher 提交到根路由的 action
    fetcher.submit(
      { theme: newTheme },
      { method: "post", action: "/" }
    )
  }

  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Copyright and Compliance */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground">
              <span>© 2025 汪家俊的个人网站, Inc. All rights reserved.</span>
              <span className="hidden sm:inline">·</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                鄂ICP备2025114987号
              </a>
            </div>

            {/* Right - Theme and Language */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`p-1.5 rounded transition-colors ${
                    theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Light theme"
                >
                  <SunIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`p-1.5 rounded transition-colors ${
                    theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Dark theme"
                >
                  <MoonIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <GlobeIcon className="w-4 h-4" />
                <span>简体中文</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
