// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/logger
// 行为对齐：log/info/debug 静默，warn/error 走 console。
const group = (args: unknown[]) =>
  args.map((a) => (a instanceof Error ? a.message : a));

export const logger = {
  log: (...args: unknown[]) => console.log('[app]', ...group(args)),
  info: (...args: unknown[]) => console.info('[app]', ...group(args)),
  debug: (...args: unknown[]) => {},
  warn: (...args: unknown[]) => console.warn('[app]', ...group(args)),
  error: (...args: unknown[]) => console.error('[app]', ...group(args)),
};
