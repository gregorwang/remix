import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateImageTokens } from "~/utils/imageToken.server";

// ImageData type
interface ImageData {
  id: string | number;
  src: string;
  alt?: string;
}

// Types
interface XiaoPageData {
  xiaoimages: ImageData[];
  content: {
    title: string;
    subtitle: string;
    sections: {
      winterWheatIsland: {
        leftQuote: string;
        rightQuote: string;
      };
      autumnKites: {
        mainQuote: string;
      };
      philosophicalThoughts: {
        leftQuote: string;
        centerQuote: string;
        rightQuote: string;
      };
      footer: {
        disclaimerTitle: string;
        disclaimerMain: string;
        disclaimerSub: string;
        backHome: string;
        blessing: string;
        copyright: string;
      };
    };
  };
}

// Links function
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
];

// Meta function
export const meta: MetaFunction = () => [
  { title: "小岛哲思 - 镜头之外的思考与感悟" },
  { name: "description", content: "关于光影、瞬间，关于那些被镜头捕捉的思考与感悟的个人独白" },
  { name: "keywords", content: "小岛,哲思,摄影,感悟,思考,独白" },
];

// Loader function - 在服务端批量生成所有图片token
export async function loader() {
  // 原始图片数据
  const rawXiaoImages: ImageData[] = [
    { id: 1, src: 'Feedback/a.png', alt: '冬日小麦岛的夕阳' },
    { id: 2, src: 'Feedback/b.png', alt: '秋日风筝' },
    { id: 3, src: 'Feedback/c.png', alt: '秋日风景' },
    { id: 4, src: 'Feedback/d.png', alt: '画廊照片 1' },
    { id: 5, src: 'Feedback/e.jpg', alt: '画廊照片 2' },
    { id: 6, src: 'Feedback/f.jpg', alt: '画廊照片 3' }
  ];

  // 收集所有图片路径
  const allImagePaths = rawXiaoImages.map(img => img.src);

  // 批量生成所有图片token
  const tokenResults = generateImageTokens(allImagePaths, 30);
  const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));

  // 替换所有src为带token的完整URL
  const xiaoimages = rawXiaoImages.map(img => ({
    ...img,
    src: tokenMap.get(img.src) || img.src
  }));

  const data: XiaoPageData = {
    xiaoimages,
    content: {
      title: "一切",
      subtitle: "照片所表达的",
      sections: {
        winterWheatIsland: {
          leftQuote: "拍摄于2023年11月29日，冬日的小麦岛寒风刺骨，却也因此少了人流的干扰，反而让我得以专注于取景与光影。那是夕阳西下的时刻，天空呈现出罕见的橙色，在多重光线的渐变中，云像线条一样柔和流动。",
          rightQuote: "如今时间过去了很久，我已记不清当时的感受，但回头看这张照片，仍觉得那一刻的天空美得不真实，仿佛短暂逃离了庸常世界，置身于一个梦境之中。"
        },
        autumnKites: {
          mainQuote: "排成一线的风筝在空中轻轻摇曳，夕阳缓缓垂落在一座未完工的高楼之上。光线渐弱，仿佛力不从心，天地逐渐沉入昏暗之中，只留下一片灰蒙的草地，构成了这幅略显荒凉的画面。\n秋天，总是诗人最容易动情的季节。自古逢秋多寂寥，但也有人言\"秋日胜春朝\"。时空虽隔千年，我竟也与古人心意相通。前路未明，欢乐无从谈起。年仅二十五，却已感到生命之光如这落日般渐趋黯淡。"
        },
        philosophicalThoughts: {
          leftQuote: "看见美好，心中便悄然生出贪恋与不舍。唉，只能继续欺骗自己——装作无事，装作坚强。不知羞耻也好，狼狈也罢，活下去吧。",
          centerQuote: "也许正是这一瞬间，我才真正领悟了那些年在书本中无法共情、无法理解的话语——为何尼采会在街头抱着一匹马痛哭。人，与动物并无本质区别。我与那匹马四目相对，它看懂了我，我也读懂了它。那是一种超越语言的共鸣，是被命运之神牵引、却无力挣脱的宿命感。\n此刻我终于明白，叶文洁是对的。她为三体人带路，并非背叛，而是一种清醒的决断。在这个充满荒谬与冷漠的世界里，毁灭或许不是灾难，而是一种终局的救赎。",
          rightQuote: "时间，是地球上不断涌动的风与气流。它们风化岩石，使之一点点变小，化为尘沙，最终被吹散得无影无踪。人们常说时间会\"磨平\"一切，但那种磨平往往会留下痕迹，而现实中，大多数时候，时间带走的，是连痕迹都不曾留下的彻底消逝。\n没有人告诉我，这片土地曾发生过什么。而我，作为一个局外人，也没有兴趣或动机去探究它的过去。我只知道，随着时间的推移，事实终将湮灭，仿佛从未存在。"
        },
        footer: {
          disclaimerTitle: "声明",
          disclaimerMain: "以上所有文案均为AI生成，不代表本人内心真实想法。",
          disclaimerSub: "这些文字如流水般涌现，承载着算法的想象，却无法触及人心深处的真实。",
          backHome: "回到首页",
          blessing: "愿每个瞬间都值得被记录",
          copyright: "用心记录生活的每一个瞬间"
        }
      }
    }
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=300", // token数据缓存5分钟
    },
  });
}

export default function XiaoPage() {
  const { xiaoimages, content } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-gray-100 dark:from-gray-900 dark:via-slate-900 dark:to-black">
      <div className="container mx-auto px-6 py-16 lg:px-8">
        {/* Title Section */}
          <m.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-gray-900 dark:text-white mb-6">
            {content.subtitle}
            <span className="block font-thin text-amber-600 dark:text-amber-400 mt-2">
              {content.title}
            </span>
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto"></div>
        </m.div>


        {/* Section 1: Winter Wheat Island */}
        <m.section 
          className="mb-32"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-6">
              <blockquote className="border-l-4 border-amber-500 pl-6 italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-lg">
                {content.sections.winterWheatIsland.leftQuote}
              </blockquote>
            </div>
            
            <div className="lg:col-span-4 relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={xiaoimages[0]?.src}
                  alt={xiaoimages[0]?.alt}
                  className="w-full h-80 object-cover"
                  loading="eager"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[0]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <blockquote className="border-l-4 border-amber-500 pl-6 italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-lg">
                {content.sections.winterWheatIsland.rightQuote}
              </blockquote>
            </div>
          </div>
        </m.section>

        {/* Section 2: Autumn Kites */}
        <m.section 
          className="mb-32"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 relative group order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={xiaoimages[1]?.src}
                  alt={xiaoimages[1]?.alt}
                  className="w-full h-80 object-cover"
                  loading="lazy"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[1]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
              <blockquote className="border-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-center">
                {content.sections.autumnKites.mainQuote}
              </blockquote>
            </div>
            
            <div className="lg:col-span-4 relative group order-3">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={xiaoimages[2]?.src}
                  alt={xiaoimages[2]?.alt}
                  className="w-full h-80 object-cover"
                  loading="lazy"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[2]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </m.section>

        {/* Section 3: Philosophical Thoughts */}
        <m.section 
          className="mb-32"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-gray-800/70 dark:to-gray-900/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <p className="italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-lg">
                  {content.sections.philosophicalThoughts.leftQuote}
                </p>
              </div>
            </div>
            
            <div className="space-y-6 md:-mt-8">
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/30 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-amber-200/50 dark:border-amber-700/30">
                <p className="italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-lg">
                  {content.sections.philosophicalThoughts.centerQuote}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-gray-800/70 dark:to-gray-900/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <p className="italic text-gray-700 dark:text-gray-300 font-light leading-relaxed text-lg">
                  {content.sections.philosophicalThoughts.rightQuote}
                </p>
              </div>
            </div>
          </div>
        </m.section>

        {/* Section 4: Photo Gallery */}
        <m.section 
          className="mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                <img 
                  src={xiaoimages[3]?.src}
                  alt={xiaoimages[3]?.alt}
                  className="w-full h-96 object-cover"
                  loading="lazy"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[3]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            
            <div className="relative group md:-mt-12">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1">
                <img 
                  src={xiaoimages[4]?.src}
                  alt={xiaoimages[4]?.alt}
                  className="w-full h-96 object-cover"
                  loading="lazy"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[4]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                <img 
                  src={xiaoimages[5]?.src}
                  alt={xiaoimages[5]?.alt}
                  className="w-full h-96 object-cover"
                  loading="lazy"
                  onError={(e) => console.error('Image failed to load:', xiaoimages[5]?.src)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </m.section>

        {/* Decorative Line */}
        <m.div 
          className="w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-20"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 1 }}
        />
        
        {/* Footer */}
        <m.footer 
          className="mt-24 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-gray-50/80 via-white/90 to-gray-50/80 dark:from-gray-800/50 dark:via-gray-700/60 dark:to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-4xl border border-gray-200/30 dark:border-gray-600/30 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wider uppercase">
                  {content.sections.footer.disclaimerTitle}
                </span>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse ml-3"></div>
              </div>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed italic">
                {content.sections.footer.disclaimerMain}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 font-light">
                {content.sections.footer.disclaimerSub}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <Link
                to="/"
                prefetch="intent"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="tracking-wide">{content.sections.footer.backHome}</span>
                <div className="ml-3 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <p className="text-sm text-gray-400 dark:text-gray-500 font-light tracking-wide">
                {content.sections.footer.blessing}
              </p>
            </div>
            
            <div className="pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-light">
                © {new Date().getFullYear()} · {content.sections.footer.copyright}
              </p>
            </div>
          </div>
        </m.footer>
      </div>
    </div>
    </LazyMotion>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">小岛页面错误</h1>
          <p className="text-gray-600 mb-4">抱歉，小岛哲思页面暂时无法显示。</p>
          <Link
            to="/"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 