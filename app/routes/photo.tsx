import type { LinksFunction, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useImageToken } from "~/hooks/useMediaToken.client";
import { ClientOnly } from "~/components/common/ClientOnly";

// Types for photo gallery data
interface ImageData {
  id: string | number;
  src: string;
  alt?: string; // 使alt可选以兼容Remix类型
  originalSrc?: string;
}

interface PhotoGallery {
  id: string;
  name: string;
  photos: ImageData[];
}

interface PhotoPageData {
  heroImage: ImageData;
  photoGalleries: PhotoGallery[];
  content: {
    heroTitle: string;
    authorName: string;
    bioSubtitle: string;
    bioDescription: string;
    footer: {
      title: string;
      description: string;
      linkText: string;
    };
  };
}

// Links function for resource optimization - 符合rule.md要求
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
];

// Meta function for SEO - 符合rule.md要求
export const meta: MetaFunction = () => [
  { title: "摄影作品 - 汪家俊的摄影集" },
  { name: "description", content: "用镜头记录生活的美好瞬间，展示青岛之影与人生随拍" },
  { name: "keywords", content: "摄影,照片,青岛,街拍,人像,风景,汪家俊" },
  { property: "og:title", content: "摄影作品 - 汪家俊的摄影集" },
  { property: "og:description", content: "用镜头记录生活的美好瞬间" },
  { property: "og:type", content: "website" },
];

// Action function 已转移到专门的资源路由 /api/image-token。
// 为了保持向后兼容，Photo 页面仅作透明代理，避免维护两份代码。
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  // 透传到真正的 API。
  return fetch("/api/image-token", {
    method: "POST",
    headers: request.headers,
    body: request.body,
  });
}

// Loader function - 返回原始图片数据，让客户端使用hooks处理token
export async function loader() {

  // 定义原始图片数据
  const rawPhotoGalleries = [
    {
      id: 'street',
      name: '随拍即景',
      photos: [
        { id: 1, src: 'camera/a.jpg', alt: '街拍摄影 1' },
        { id: 2, src: 'camera/b.jpg', alt: '街拍摄影 2' },
        { id: 3, src: 'camera/c.jpg', alt: '街拍摄影 3' },
        { id: 4, src: 'camera/d.jpg', alt: '街拍摄影 4' },
        { id: 5, src: 'camera/e.jpg', alt: '街拍摄影 5' },
        { id: 6, src: 'camera/f.jpg', alt: '街拍摄影 6' },
        { id: 7, src: 'camera/g.jpg', alt: '街拍摄影 7' },
        { id: 8, src: 'camera/h.jpg', alt: '街拍摄影 8' },
        { id: 9, src: 'camera/i.jpg', alt: '街拍摄影 9' },
        { id: 10, src: 'camera/j.jpg', alt: '街拍摄影 10' },
        { id: 11, src: 'camera/k.jpg', alt: '街拍摄影 11' },
        { id: 12, src: 'camera/l.jpg', alt: '街拍摄影 12' }
      ]
    },
    {
      id: 'portrait',
      name: '光影留痕',
      photos: [
        { id: 13, src: 'camera/m.jpg', alt: '人像摄影 1' },
        { id: 14, src: 'camera/n.jpg', alt: '人像摄影 2' },
        { id: 15, src: 'camera/o.jpg', alt: '人像摄影 3' },
        { id: 16, src: 'camera/p.jpg', alt: '人像摄影 4' },
        { id: 17, src: 'camera/q.jpg', alt: '人像摄影 5' },
        { id: 18, src: 'camera/r.jpg', alt: '人像摄影 6' },
        { id: 19, src: 'camera/s.jpg', alt: '人像摄影 7' },
        { id: 20, src: 'camera/t.jpg', alt: '人像摄影 8' },
        { id: 21, src: 'camera/u.jpg', alt: '人像摄影 9' },
        { id: 22, src: 'camera/v.jpg', alt: '人像摄影 10' },
        { id: 23, src: 'camera/w.jpg', alt: '人像摄影 11' },
        { id: 24, src: 'camera/x.jpg', alt: '人像摄影 12' }
      ]
    },
    {
      id: 'landscape',
      name: '静看时光',
      photos: [
        { id: 25, src: 'camera/y.jpg', alt: '风景摄影 1' },
        { id: 26, src: 'camera/z.jpg', alt: '风景摄影 2' },
        { id: 27, src: 'camera/aa.jpg', alt: '风景摄影 3' },
        { id: 28, src: 'camera/bb.jpg', alt: '风景摄影 4' },
        { id: 29, src: 'camera/cc.jpg', alt: '风景摄影 5' },
        { id: 30, src: 'camera/dd.jpg', alt: '风景摄影 6' },
        { id: 31, src: 'camera/ee.jpg', alt: '风景摄影 7' },
        { id: 32, src: 'camera/ff.jpg', alt: '风景摄影 8' },
        { id: 33, src: 'camera/gg.jpg', alt: '风景摄影 9' },
        { id: 34, src: 'camera/hh.jpg', alt: '风景摄影 10' },
        { id: 35, src: 'camera/ii.jpg', alt: '风景摄影 11' },
        { id: 36, src: 'camera/jj.jpg', alt: '风景摄影 12' }
      ]
    }
  ];

    // 返回原始图片数据，让客户端使用hooks处理token
  const data: PhotoPageData = {
    heroImage: {
      id: 'hero',
      src: 'camera/ss.jpg', // hero图片也使用OSS路径
      alt: '2023~2025，青岛之影'
    },
    photoGalleries: rawPhotoGalleries, // 原始数据，客户端处理token
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
    }
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200", // 原始数据可以长时间缓存
    },
  });
}



// 优化的图片组件 - 使用hooks处理token
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  loading = "lazy",
  imageId,
  ...props 
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  imageId?: string | number;
  'data-photo-id'?: string | number;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isTokenReady, setIsTokenReady] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const { getImageWithToken, handleImageError } = useImageToken();

  const placeholderSrc = "data:image/svg+xml,%3csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='%23f3f4f6'/%3e%3ctext x='50%25' y='50%25' font-family='system-ui,sans-serif' font-size='16' fill='%23a3a3a3' text-anchor='middle' dy='.3em'%3e加载中...%3c/text%3e%3c/svg%3e";

  // 处理token获取 - 避免初始渲染时使用相对路径导致404
  useEffect(() => {
    // 判断是否需要获取token：相对路径且不包含token
    const needsToken = src && !src.startsWith('/') && !src.startsWith('http') && !src.includes('token=');
    
    // 如果不需要token（已经是完整URL或包含token），直接使用
    if (!needsToken) {
      setCurrentSrc(src);
      setIsTokenReady(true);
      return;
    }

    // 需要token的情况，先使用占位符，获取token后再更新
    setCurrentSrc(placeholderSrc);
    setIsTokenReady(false);
    
    console.log('🔄 开始获取图片token:', src);
    getImageWithToken(src)
      .then((tokenUrl) => {
        console.log('✅ 获取token成功:', src, '->', tokenUrl);
        setCurrentSrc(tokenUrl);
        setIsTokenReady(true);
      })
      .catch((error) => {
        console.error('❌ 获取token失败:', src, error);
        // 即使失败也不要使用原始相对路径，继续使用占位符
        setHasError(true);
      });
  }, [src, getImageWithToken]);

  // 计算实际使用的src
  const finalSrc = hasError ? placeholderSrc : (isTokenReady ? currentSrc : placeholderSrc);

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        imageLoaded && !hasError && isTokenReady ? 'opacity-100' : 'opacity-0'
      } ${className || ''}`}
      loading={loading}
      onLoad={() => {
        if (isTokenReady) {
          setImageLoaded(true);
        }
      }}
      onError={(e) => {
        setHasError(true);
        setImageLoaded(false);
        if (imageId) {
          handleImageError(e, imageId);
        }
      }}
      suppressHydrationWarning={true}
      {...props}
    />
  );
};

// 客户端专用画廊组件
const ClientOnlyGallery = ({ photoGalleries }: { photoGalleries: PhotoGallery[] }) => {
  useEffect(() => {
    console.log('📸 Photo gallery client-side initialized with', photoGalleries.length, 'galleries');
  }, [photoGalleries.length]);

  return (
    <>
      {photoGalleries.map((gallery, galleryIndex) => (
        <m.div
          key={gallery.id}
          className={`gallery-section py-16 px-3 text-center ${
            gallery.id === 'portrait' ? 'bg-gray-50' : ''
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: galleryIndex * 0.1 }}
        >
          <m.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-gray-700 uppercase tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {gallery.name}
          </m.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-7xl mx-auto">
            {gallery.photos.map((photo, index) => (
              <m.div
                key={photo.id}
                className="grid-item w-full overflow-hidden bg-gray-200 aspect-square"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <OptimizedImage
                  src={photo.src}
                  alt={photo.alt || `照片 ${photo.id}`}
                  className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  loading="lazy"
                  imageId={photo.id}
                  data-photo-id={photo.id}
                />
              </m.div>
            ))}
          </div>
        </m.div>
      ))}
    </>
  );
};

// Main photo page component
function PhotoPage() {
  const { heroImage, photoGalleries, content } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero Image at the very top, with token logic */}
      <ClientOnly>
        {() => (
          <div className="w-full my-0 relative">
            <OptimizedImage
              src={heroImage.src}
              alt={heroImage.alt || "Hero Image"}
              className="w-full h-96 object-cover object-center rounded-lg shadow-md"
              loading="eager"
              imageId={heroImage.id}
            />
            {/* 叠加大字标题 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg select-none">
                2023-2035，青岛之影
              </span>
            </div>
          </div>
        )}
      </ClientOnly>
      {/* Content Section */}
      <m.div 
        className="content-area max-w-4xl mx-auto my-16 px-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
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

              {/* Dynamic Gallery Sections - Client Only */}
        <ClientOnly>
          {() => <ClientOnlyGallery photoGalleries={photoGalleries} />}
        </ClientOnly>

      {/* Footer Section */}
      <m.div 
        className="footer-section bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-5 text-center mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="footer-content max-w-2xl mx-auto">
          <m.div 
            className="w-16 h-1 bg-gradient-to-r from-gray-700 to-gray-500 mx-auto mb-8 rounded"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <m.h3 
            className="text-3xl font-bold text-gray-700 mb-5 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {content.footer.title}
          </m.h3>
          
          <m.p 
            className="text-lg text-gray-600 leading-8 mb-10 italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {content.footer.description}
          </m.p>
          
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
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

export default PhotoPage;

// Error Boundary - 符合rule.md要求
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
