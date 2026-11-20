// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/components/ErrorRender
// 原版用于 ErrorBoundary fallback；此处渲染简化错误面板并支持重试。
import type { ErrorInfo } from 'react';

interface ErrorRenderProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

const extractMessage = (error: Error): string => {
  const raw = error?.message ?? '未知错误';
  try {
    const parsed = JSON.parse(
      raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1),
    );
    if (parsed?.error?.message) return parsed.error.message;
    if (parsed?.message) return parsed.message;
  } catch {
    // 非 JSON，原样返回
  }
  return raw;
};

export const ErrorRender = ({
  error,
  resetErrorBoundary,
}: ErrorRenderProps) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
    <div className="text-destructive text-lg font-semibold">
      页面出现异常
    </div>
    <div className="text-muted-foreground max-w-md text-center text-sm">
      {extractMessage(error)}
    </div>
    {resetErrorBoundary ? (
      <button
        type="button"
        className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
        onClick={resetErrorBoundary}
      >
        重试
      </button>
    ) : null}
  </div>
);

export default ErrorRender;
