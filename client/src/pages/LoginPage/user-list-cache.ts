import {
  isAppUserRole,
  isAppUserStatus,
  type AppUser,
} from '@shared/app-user';

const CACHE_KEY = 'deou-app-users-cache-v1';

interface UserCachePayload {
  items: AppUser[];
  syncedAt: string;
}

const parseUser = (value: unknown): AppUser | null => {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : '';
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const role = typeof record.role === 'string' ? record.role : '';
  const status = typeof record.status === 'string' ? record.status : '';
  if (!id || !name || !isAppUserRole(role) || !isAppUserStatus(status)) {
    return null;
  }
  return {
    id,
    name,
    role,
    status,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
    baseRecordId:
      typeof record.baseRecordId === 'string' ? record.baseRecordId : null,
    hasPassword: record.hasPassword === true,
  };
};

export const readCachedAppUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return [];
    const items = (parsed as UserCachePayload).items;
    if (!Array.isArray(items)) return [];
    return items
      .map((item: unknown) => parseUser(item))
      .filter((item: AppUser | null): item is AppUser => item !== null);
  } catch {
    return [];
  }
};

export const writeCachedAppUsers = (items: AppUser[]): void => {
  if (typeof window === 'undefined' || items.length === 0) return;
  try {
    const payload: UserCachePayload = {
      items,
      syncedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // 缓存写入失败时仍以线上账号列表为准
  }
};
