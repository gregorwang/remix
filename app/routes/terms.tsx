import type { LoaderFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Types
interface Section {
  title: string;
  content: string;
}

interface LoaderData {
  effectiveDate: string;
  sections: Section[];
}

// Links function for optimized resource loading
export const links: LinksFunction = () => [
  // Preload critical resources
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
  // DNS prefetch for potential external links
  { rel: "dns-prefetch", href: "//wangjiajun.asia" },
];

// Meta function for SEO
export const meta: MetaFunction = () => [
  { title: "使用条款与免责声明 - 汪家俊个人网站" },
  { 
    name: "description", 
    content: "汪家俊个人网站的使用条款与免责声明，包含隐私保护、知识产权、用户行为规范等重要条款。" 
  },
  { property: "og:title", content: "使用条款与免责声明" },
  { 
    property: "og:description", 
    content: "查看我们的使用条款，了解您的权利和义务。" 
  },
  { name: "robots", content: "index, follow" },
];

// Loader function for SSR data - following Remix best practices
export async function loader({ request }: LoaderFunctionArgs) {
  // Simulate data fetching (in real app, this might come from CMS/database)
  const data: LoaderData = {
    effectiveDate: "2024年4月1日",
    sections: [
      {
        title: "定义",
        content: `
          <p>"本站"：指域名 <a href="https://wangjiajun.asia/" target="_blank">https://wangjiajun.asia/</a> 及其子域名下全部网页、移动端界面与功能。</p>
          <p>"运营者"：汪家俊（中国大陆居民，联系方式见第十三条）。</p>
          <p>"用户"：访问、浏览、上传、下载或以其他方式使用本站之任何个人或组织。</p>
          <p>"内容"：本站呈现或用户上传之文字、图片、音视频、代码、下载文件及其他信息载体。</p>
        `
      },
      {
        title: "接受与变更条款",
        content: `
          <p>您访问或使用即视为同意本条款全部内容。本站有权依据法律政策更新条款，并在显著位置公示，更新后立即生效；若您不同意，应立即停止使用。</p>
        `
      },
      {
        title: "服务说明与合规承诺",
        content: `
          <p>本站为非经营性个人展示网站，仅提供个人原创作品与学习记录之展示，不含付费服务、广告营利或电商交易。</p>
          <p>本站已按《非经营性互联网信息服务备案管理办法》完成ICP备案（备案号：鄂ICP备2025114987号）。</p>
          <p>本站服务器位于中华人民共和国境内，完整落实网络安全等级保护、日志留存不少于 6 个月等技术措施。</p>
        `
      },
      {
        title: "用户行为规范",
        content: `
          <p>用户不得利用本站制作、复制、发布、传播含有法律法规禁止内容的信息（政治有害、色情赌博、暴恐谣言、侵权盗版等）。</p>
          <p>用户发表内容应确保拥有合法权利；因侵权引发纠纷的，由用户自行承担全部责任，并赔偿运营者因此遭受的损失。</p>
          <p>本站发现违法或侵权信息，将依法立即删除并保存记录，向有关主管机关报告。</p>
        `
      },
      {
        title: "知识产权",
        content: `
          <p>本站原创内容：除另有注明外，版权归运营者所有；非商业转载须注明出处及链接，商业使用须事先取得书面授权。</p>
          <p>用户上传内容：用户授予本站全球范围、免费的非独占许可，用于在本站展示、缓存、备份及推广；但不改变其著作权归属。</p>
        `
      },
      {
        title: "个人信息与隐私保护",
        content: `
          <div class="space-y-6">
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>收集目的与范围</h3>
              <p>仅为基本访问、留言互动及改进站点体验，收集最小必要的浏览日志、IP、浏览器信息及用户主动填写的邮箱/昵称。</p>
            </div>
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>Cookie/本地存储</h3>
              <p>仅使用必要 Cookie实现会话保持与语言偏好；非必要 Cookie 将征得明示同意后方可启用。</p>
            </div>
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>保存期限</h3>
              <p>个人信息、日志最短保存 6 个月，最长不超过达成处理目的所必需的期限或法律法规要求的留存期。</p>
            </div>
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>数据跨境</h3>
              <p>本站现无跨境传输；如未来需向境外服务器备份，将按照《数据出境安全评估办法》完成评估并告知用户。</p>
            </div>
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>用户权利</h3>
              <p>用户可通过第十三条联系方式行使访问、更正、删除、撤回同意等权利；本站将在 15 个工作日内处理。</p>
            </div>
            <div class="bg-primary-100 p-6 rounded-2xl">
              <h3>未成年人保护</h3>
              <p>不主动面向未满 14 周岁未成年人收集个人信息；如需收集，将另行取得监护人同意并提供专门保护措施。</p>
            </div>
          </div>
        `
      },
      {
        title: "算法与深度生成内容说明",
        content: `
          <p>本站暂不提供个性化推荐算法；如后续上线，将遵守《互联网信息服务算法推荐管理规定》提供自主关闭、"不感兴趣"等选项。</p>
          <p>如使用 AI 或深度合成技术生成图片/音视频，将显著标签"AI生成"并确保不用于传播虚假信息或侵害他人权益。</p>
        `
      },
      {
        title: "广告与外部链接",
        content: `
          <p>本站无商业广告投放；若未来出现赞助内容，将严格遵守《广告法》显著标识"广告"并确保一键关闭。</p>
          <p>本站可能包含跳转至第三方站点的链接，外部网站内容与隐私政策由该第三方负责，本站不作背书或担保。</p>
        `
      },
      {
        title: "免责条款",
        content: `
          <p>本站内容基于"现状"提供，对其准确性、完整性、时效性不作保证；用户据此操作产生的风险自负。</p>
          <p>因不可抗力、系统故障、网络原因或第三方原因导致服务中断或数据丢失，本站不承担由此引起的赔偿责任。</p>
          <p>对用户发布的观点或内容，本站仅提供信息存储空间服务，不承担编辑审查责任；但有权依法律法规删除。</p>
        `
      },
      {
        title: "投诉与举报",
        content: `
          <p>用户可通过邮箱或电话向运营者反馈违规内容；亦可通过国家网信办"12377"平台进行举报。</p>
          <p>本站将在收到举报后 3 个工作日内处理并反馈结果。</p>
        `
      },
      {
        title: "法律依据与争议解决",
        content: `
          <p>本声明适用中华人民共和国法律。</p>
          <p>因使用本站产生的争议，双方应友好协商；协商不成的，提交运营者住所地（青岛市）人民法院管辖。</p>
        `
      },
      {
        title: "条款的解释、更新与生效",
        content: `
          <p>本条款由运营者负责最终解释。如条款部分条文被认定无效，不影响其他条文之效力。</p>
          <p>本条款自页面顶部标注之生效日期起执行，替代此前所有版本。</p>
        `
      },
      {
        title: "联系我们",
        content: `
          <div class="bg-primary-100 p-8 rounded-2xl border border-primary-100/50">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="flex items-center space-x-3 mb-4">
                  <strong class="text-accent">运营者：</strong>
                  <span>汪家俊</span>
                </p>
                <p class="flex items-center space-x-3 mb-4">
                  <strong class="text-accent">电子邮箱：</strong>
                  <a href="mailto:wangjiajun@wangjiajun.asia" class="text-accent hover:text-accent-hover">wangjiajun@wangjiajun.asia</a>
                </p>
              </div>
              <div>
                <p class="flex items-center space-x-3 mb-4">
                  <strong class="text-accent">电话：</strong>
                  <span>(+86) 9999999999</span>
                </p>
                <p class="flex items-center space-x-3">
                  <strong class="text-accent">通信地址：</strong>
                  <span>山东省青岛市城阳区华贯路666号</span>
                </p>
              </div>
            </div>
          </div>
        `
      }
    ]
  };

  // HTTP Caching as required by ruler2.md
  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
    },
  });
}

// Main component
export default function Terms() {
  const { effectiveDate, sections } = useLoaderData<typeof loader>();
  
  // Client-side state for interactivity (progressive enhancement)
  const [activeSection, setActiveSection] = useState('section-1');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Scroll handling (client-side enhancement)
  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);

      // Detect active section
      const scrollPosition = scrollTop + 150;
      
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(`section-${i + 1}`);
          return;
        }
      }
      
      setActiveSection('section-1');
    };

    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ 
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-primary-50 relative overflow-hidden">
      {/* Dynamic background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/15 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/25 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23d97757 fill-opacity=0.03%3E%3Ccircle cx=30 cy=30 r=1/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      {/* Header */}
      <header className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <m.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block"
          >
            <div className="relative">
              <h1 className="text-6xl md:text-7xl font-black text-primary-950 mb-4 tracking-tight">
                使用条款
              </h1>
              <div className="absolute -inset-1 bg-accent/20 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            </div>
          </m.div>
          
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mt-8"
          >
            <div className="flex items-center space-x-2 bg-primary-100 backdrop-blur-sm rounded-full px-6 py-3 border border-primary-100/50">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-primary-950 font-medium">生效日期：{effectiveDate}</span>
            </div>
          </m.div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border border-accent/20 rounded-full animate-spin-slow"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-accent/20 rounded-full animate-bounce-slow"></div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar navigation */}
          <aside className="lg:w-80 flex-shrink-0">
            <m.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:sticky lg:top-8"
            >
              <div className="bg-primary-100 backdrop-blur-xl rounded-3xl border border-primary-100/50 p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-primary-950">目录导航</h2>
                </div>
                
                <nav className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(`section-${index + 1}`)}
                      className={`group flex items-center p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] w-full ${
                        activeSection === `section-${index + 1}` 
                          ? 'bg-accent/10 border border-accent/30 shadow-lg' 
                          : 'hover:bg-primary-100/50 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          activeSection === `section-${index + 1}` 
                            ? 'bg-accent text-white shadow-lg' 
                            : 'bg-primary-100 text-primary-950/60 group-hover:bg-primary-100/80'
                        }`}>
                          {index + 1}
                        </div>
                        {activeSection === `section-${index + 1}` && (
                          <div className="absolute -inset-1 bg-accent/30 rounded-xl blur opacity-30"></div>
                        )}
                      </div>
                      <span className={`ml-4 font-medium transition-colors duration-300 text-sm leading-relaxed text-left ${
                        activeSection === `section-${index + 1}` ? 'text-primary-950' : 'text-primary-950/70 group-hover:text-primary-950'
                      }`}>
                        {section.title}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </m.div>
          </aside>

          {/* Right content area */}
          <div className="flex-1">
            <m.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-primary-100 backdrop-blur-xl rounded-3xl border border-primary-100/50 shadow-2xl overflow-hidden"
            >
              <div className="p-8 lg:p-12">
                <div className="space-y-16">
                  {sections.map((section, index) => (
                    <section
                      key={index}
                      id={`section-${index + 1}`}
                      className="scroll-mt-24 group"
                      ref={(el) => {
                        sectionRefs.current[index] = el;
                      }}
                    >
                      <div className="relative mb-8">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="relative">
                            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="absolute -inset-1 bg-accent/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-primary-950 mb-2 group-hover:text-accent transition-colors duration-300">
                              {section.title}
                            </h2>
                            <div className="h-1 bg-accent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-lg max-w-none">
                        <div 
                          dangerouslySetInnerHTML={{ __html: section.content }}
                          className="text-primary-950/90 leading-relaxed space-y-4 [&>p]:mb-4 [&>div]:space-y-4 [&_a]:text-accent [&_a]:hover:text-accent-hover [&_a]:transition-colors [&_a]:duration-300 [&_strong]:text-primary-950 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-accent [&_h3]:mb-3 [&_.bg-blue-50]:bg-primary-100 [&_.bg-blue-50]:backdrop-blur-sm [&_.bg-blue-50]:border [&_.bg-blue-50]:border-primary-100/50 [&_.bg-blue-50]:rounded-2xl [&_.text-blue-700]:text-accent [&_.text-purple-300]:text-accent [&_.text-purple-400]:text-accent"
                        />
                      </div>
                      
                      {/* Divider */}
                      {index < sections.length - 1 && (
                        <div className="mt-16 flex items-center">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-950/10 to-transparent"></div>
                          <div className="mx-4 w-2 h-2 bg-accent/30 rounded-full"></div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-950/10 to-transparent"></div>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </main>

      {/* Floating action buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-4">
        {/* Back to top button */}
        <m.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="group relative w-14 h-14 bg-accent text-white rounded-2xl shadow-2xl hover:shadow-accent/25 transform hover:scale-110 transition-all duration-300"
          aria-label="返回顶部"
        >
          <div className="absolute -inset-1 bg-accent-hover rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative flex items-center justify-center h-full">
            <svg className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </m.button>

        {/* Theme toggle button */}
        <m.button
          onClick={toggleTheme}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="group relative w-14 h-14 bg-primary-100 backdrop-blur-sm text-primary-950 rounded-2xl border border-primary-100/50 shadow-2xl hover:bg-primary-100/80 transform hover:scale-110 transition-all duration-300"
          aria-label="切换主题"
        >
          <div className="relative flex items-center justify-center h-full">
            {!isDark ? (
              <svg className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>
        </m.button>

        {/* Back to home link */}
        <m.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <Link
            to="/"
            prefetch="intent"
            className="group relative w-14 h-14 bg-primary-100 backdrop-blur-sm text-primary-950 rounded-2xl border border-primary-100/50 shadow-2xl hover:bg-primary-100/80 transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
            aria-label="返回首页"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </m.div>
      </div>

      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-primary-100/50 z-50">
        <div 
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>


    </div>
    </LazyMotion>
  );
}

// Error Boundary as required by ruler2.md
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="bg-primary-100 backdrop-blur-xl rounded-3xl border border-primary-100/50 p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-950 mb-2">页面加载出错</h1>
          <p className="text-primary-950/70 mb-6">抱歉，使用条款页面暂时无法显示。请稍后再试。</p>
          <Link
            to="/"
            prefetch="intent"
            className="bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-hover hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}