// Cloudflare Pages 版 shim：替代 @lark-apaas/client-toolkit/utils/getAxiosForBackend
// 与原版行为一致：实例自带 baseURL '/'，页面通过相对路径 '/api/*' 调用，
// 在 Cloudflare Pages 上由 functions/api/[[path]].js 处理。
//
// 额外职责：管理员写操作鉴权。原妙搭 @NeedLogin 由平台登录态承担；
// 这里改为请求拦截器读取本地会话（SessionContext 写入的 localStorage key），
// 对所有 /api/app-users* 写请求附加 X-Admin-User 请求头，
// Pages Functions 会回飞书用户表校验该用户确为「管理员 + 启用」。
import axios from 'axios';

const SESSION_KEY = 'deou-interview-session-v1';

const readSessionUserName = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && typeof parsed.name === 'string') {
      return parsed.name;
    }
  } catch {
    // 会话解析失败时按未登录处理
  }
  return '';
};

export const axiosForBackend = axios.create({
  baseURL: '/',
  timeout: 30000,
});

axiosForBackend.interceptors.request.use((config) => {
  const url = config.url ?? '';
  if (url.startsWith('/api/app-users')) {
    const name = readSessionUserName();
    if (name) {
      config.headers['X-Admin-User'] = name;
    }
  }
  return config;
});
