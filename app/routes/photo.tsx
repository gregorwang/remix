import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

// Links function for resource optimization
export const links: LinksFunction = () => [
  { rel: "preload", as: "style", href: "/app/tailwind.css" },
];

// Meta function for SEO
export const meta: MetaFunction = () => [
  { title: "摄影作品 - 汪家俊的摄影集" },
  { name: "description", content: "用镜头记录生活的美好瞬间，展示青岛之影与人生随拍" },
  { name: "keywords", content: "摄影,照片,青岛,街拍,人像,风景,汪家俊" },
  { property: "og:title", content: "摄影作品 - 汪家俊的摄影集" },
  { property: "og:description", content: "用镜头记录生活的美好瞬间" },
  { property: "og:type", content: "website" },
];

// 父路由组件 - 使用Outlet渲染子路由
export default function PhotoLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Outlet会根据URL渲染对应的子路由 */}
      {/* /photo -> photo._index.tsx */}
      {/* /photo/street -> photo.street.tsx */}
      {/* /photo/portrait -> photo.portrait.tsx */}
      {/* /photo/landscape -> photo.landscape.tsx */}
      <Outlet />
    </div>
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
        </div>
      </div>
    </div>
  );
}
