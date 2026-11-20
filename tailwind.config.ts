import type { Config } from 'tailwindcss';

// 原妙搭模板的 createTailwindPresetOfSimple 用标准 Tailwind 4 写法等价替换。
// 主题变量全部在 client/src/tailwind-theme.css 的 :root / @theme inline 中定义，
// 此处只需声明内容扫描路径；tw-animate-css 由 index.css 直接 @import。
const config: Config = {
  content: ['./client/src/**/*.{ts,tsx,css}'],
  plugins: [],
};

export default config;
