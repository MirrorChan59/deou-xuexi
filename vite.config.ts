import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 妙搭 @lark-apaas 依赖以本地 shim 等价替换（页面源码 import 路径不变）：
//   @lark-apaas/client-toolkit/utils/getAxiosForBackend -> shims/client/getAxiosForBackend
//   @lark-apaas/client-toolkit/logger                   -> shims/client/logger
//   @lark-apaas/client-toolkit/components/*              -> shims/client/*
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@client': path.resolve(__dirname, 'client'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@lark-apaas/client-toolkit/utils/getAxiosForBackend': path.resolve(__dirname, 'shims/client/getAxiosForBackend'),
      '@lark-apaas/client-toolkit/logger': path.resolve(__dirname, 'shims/client/logger'),
      '@lark-apaas/client-toolkit/components/UniversalLink': path.resolve(__dirname, 'shims/client/UniversalLink'),
      '@lark-apaas/client-toolkit/components/AppContainer': path.resolve(__dirname, 'shims/client/AppContainer'),
      '@lark-apaas/client-toolkit/components/ErrorRender': path.resolve(__dirname, 'shims/client/ErrorRender'),
      '@lark-apaas/client-toolkit/components/NotFoundRender': path.resolve(__dirname, 'shims/client/NotFoundRender'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
