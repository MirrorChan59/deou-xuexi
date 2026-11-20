// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/components/NotFoundRender
// 渲染 404 页面（视觉风格与站内页面保持一致）。
import { Link } from 'react-router-dom';

export const NotFoundRender = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
    <div className="text-primary text-6xl font-bold">404</div>
    <div className="text-foreground text-lg font-semibold">页面不存在</div>
    <p className="text-muted-foreground text-sm">你访问的页面可能已被移除或地址有误</p>
    <Link
      to="/"
      className="bg-primary text-primary-foreground mt-2 rounded-full px-5 py-2 text-sm font-medium transition-colors hover:opacity-90"
    >
      返回首页
    </Link>
  </div>
);
