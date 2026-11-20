export const APP_USER_ROLES = ['管理员', '学生'] as const;
export type AppUserRole = (typeof APP_USER_ROLES)[number];

export const isAppUserRole = (value: string): value is AppUserRole =>
  (APP_USER_ROLES as readonly string[]).includes(value);

export const APP_USER_STATUSES = ['启用', '禁用'] as const;
export type AppUserStatus = (typeof APP_USER_STATUSES)[number];

export const isAppUserStatus = (value: string): value is AppUserStatus =>
  (APP_USER_STATUSES as readonly string[]).includes(value);

export const APP_USER_PASSWORD_MAX_LENGTH = 50;

export interface AppUser {
  id: string;
  name: string;
  role: AppUserRole;
  status: AppUserStatus;
  createdAt: string;
  baseRecordId: string | null;
  hasPassword: boolean;
}

export interface AppUserListResponse {
  items: AppUser[];
  total: number;
  syncedAt: string;
  baseUrl: string;
}

export interface CreateAppUserRequest {
  name: string;
  password: string;
  role: AppUserRole;
  status: AppUserStatus;
}

export interface UpdateAppUserRequest {
  name?: string;
  password?: string;
  role?: AppUserRole;
  status?: AppUserStatus;
}

export interface AppUserMutationResponse {
  user: AppUser;
  baseSyncError?: string;
}

export interface AppUserDeleteResponse {
  id: string;
  baseSyncError?: string;
}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  user: AppUser;
}

export const APP_USER_BASE_URL =
  'https://my.feishu.cn/base/XAcIb3h7iasOolsPD3BcIwi6n1f';
