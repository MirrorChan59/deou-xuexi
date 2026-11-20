// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/components/AppContainer
// 原妙搭 AppContainer 除了主题容器，内部还内置了 react-query 的 QueryClientProvider
// （页面各处 useQuery / useMutation 都依赖它）。本 shim 必须等效补回，否则报
// "No QueryClient set, use QueryClientProvider to set one"。
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppContainerProps {
  children?: ReactNode;
  defaultTheme?: string;
}

export const AppContainer = ({ children }: AppContainerProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
