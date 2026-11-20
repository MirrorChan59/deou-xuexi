// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/components/AppContainer
// 原版提供主题容器；此处页面固定 light 主题，仅做透传容器。
import type { ReactNode } from 'react';

interface AppContainerProps {
  children?: ReactNode;
  defaultTheme?: string;
}

export const AppContainer = ({ children }: AppContainerProps) => (
  <>{children}</>
);
