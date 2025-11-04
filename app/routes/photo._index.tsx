import type { MetaFunction } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { useLoaderData, Link, Await } from "@remix-run/react";
import { Suspense } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateImageTokens } from "~/utils/imageToken.server";

// Meta function for SEO
export const meta: MetaFunction = () => [
  { title: "摄影作品 - 汪家俊的摄影集" },
  { name: "description", content: "用镜头记录生活的美好瞬间，展示青岛之影与人生随拍" },
  { name: "keywords", content: "摄影,照片,青岛,街拍,人像,风景,汪家俊" },
  { property: "og:title", content: "摄影作品 - 汪家俊的摄影集" },
  { property: "og:description", content: "用镜头记录生活的美好瞬间" },
  { property: "og:type", content: "website" },
];

// 使用defer实现流式渲染
export async function loader() {
  // Hero图片立即加载（关键内容）
  const rawHeroImage = { id: 'hero', src: 'camera/ss.jpg', alt: '2023~2025，青岛之影' };
  const heroTokenResult = generateImageTokens([rawHeroImage.src], 30);
  const heroImage = {
    ...rawHeroImage,
    src: heroTokenResult[0].imageUrl
  };

  // 返回关键数据和延迟数据
  return json({
    heroImage,
    content: {
      heroTitle: "2023~2025，青岛之影",
      authorName: "汪家俊",
      bioSubtitle: "自留",
      bioDescription: "这里的照片，是我毕业之后来到青岛工作闲暇之余所拍的照片，其中也有一些照片是在家乡拍的，工作了几个月双十一，买了小米14，手机拍照效果很好激发了我在日常用手机记录的习惯，也在这里留下了很多的照片。由于微信朋友圈会把任何体积10M以上图片压缩成几百K，导致画质效果非常难看，所以你在这里能看见一些我从未分享过的照片。",
      footer: {
        title: "镜头之外",
        description: "照片背后，总有些话想说。关于光影，关于瞬间，关于那些被镜头捕捉的思考与感悟。",
        linkText: "探索内心独白"
      }
    },
    galleries: [
      { id: 'street', name: '随拍即景', path: '/photo/street' },
      { id: 'portrait', name: '光影留痕', path: '/photo/portrait' },
      { id: 'landscape', name: '静看时光', path: '/photo/landscape' }
    ]
  }, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}

// 主页面组件
export default function PhotoIndex() {
  const { heroImage, content, galleries } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero Image */}
      <div className="w-full my-0 relative h-96">
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="w-full h-full object-cover object-center rounded-lg shadow-md"
          loading="eager"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg select-none">
            {content.heroTitle}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <m.div 
        className="content-area max-w-4xl mx-auto my-16 px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        <h2 className="text-4xl font-bold mb-6 text-gray-700">
          {content.authorName}
        </h2>
        <div className="bio-section">
          <h3 className="text-sm font-bold uppercase text-gray-600 mb-2 tracking-wider">
            {content.bioSubtitle}
          </h3>
          <p className="text-lg text-gray-600 leading-8 text-justify">
            {content.bioDescription}
          </p>
        </div>
      </m.div>

      {/* Gallery Navigation Cards */}
      <m.div
        className="max-w-6xl mx-auto px-5 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-700">选择画廊</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {galleries.map((gallery, index) => (
            <Link
              key={gallery.id}
              to={gallery.path}
              prefetch="intent"
              className="group"
            >
              <m.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 h-64 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-500 opacity-0 group-hover:opacity-90 transition-opacity duration-300" />
                <h3 className="relative z-10 text-3xl font-bold text-gray-700 group-hover:text-white transition-colors duration-300">
                  {gallery.name}
                </h3>
                <svg 
                  className="absolute bottom-4 right-4 w-8 h-8 text-gray-400 group-hover:text-white transform translate-x-0 group-hover:translate-x-2 transition-all duration-300"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </m.div>
            </Link>
          ))}
        </div>
      </m.div>

      {/* Footer Section */}
      <m.div 
        className="footer-section bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-5 text-center mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "200px" }}
        transition={{ duration: 0.2 }}
      >
        <div className="footer-content max-w-2xl mx-auto">
          <m.div 
            className="w-16 h-1 bg-gradient-to-r from-gray-700 to-gray-500 mx-auto mb-8 rounded"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.2, delay: 0.2 }}
          />
          
          <m.h3 
            className="text-3xl font-bold text-gray-700 mb-5 tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            {content.footer.title}
          </m.h3>
          
          <m.p 
            className="text-lg text-gray-600 leading-8 mb-10 italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            {content.footer.description}
          </m.p>
          
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "200px" }}
            transition={{ duration: 0.2, delay: 0.5 }}
          >
            <Link
              to="/xiao"
              prefetch="intent"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-medium rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:from-gray-600 hover:to-gray-500 relative overflow-hidden group"
            >
              <span className="relative z-10">{content.footer.linkText}</span>
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 relative z-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 17L17 7M17 7H7M17 7V17" 
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </m.div>
        </div>
      </m.div>

      {/* Back to home link */}
      <m.div 
        className="text-center py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "200px" }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to="/"
          prefetch="intent"
          className="text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
        >
          ← 返回首页
        </Link>
      </m.div>
    </LazyMotion>
  );
}

// Error Boundary
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">照片页面错误</h1>
          <p className="text-gray-600 mb-4">抱歉，摄影作品页面暂时无法显示。</p>
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

