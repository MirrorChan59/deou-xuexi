import {
  APP_USER_ROLES,
  APP_USER_STATUSES,
  type AppUserRole,
  type AppUserStatus,
} from '@shared/app-user';

export const ALL_FILTER_VALUE = 'all';

export const APP_USERS_ADMIN_QUERY_KEY: string[] = ['app-users', 'admin'];

export interface AccountFilterOption {
  value: string;
  label: string;
}

export const ROLE_FILTER_OPTIONS: AccountFilterOption[] = [
  { value: ALL_FILTER_VALUE, label: '全部角色' },
  ...APP_USER_ROLES.map(
    (role: AppUserRole): AccountFilterOption => ({ value: role, label: role }),
  ),
];

export const STATUS_FILTER_OPTIONS: AccountFilterOption[] = [
  { value: ALL_FILTER_VALUE, label: '全部状态' },
  ...APP_USER_STATUSES.map(
    (status: AppUserStatus): AccountFilterOption => ({
      value: status,
      label: status,
    }),
  ),
];

export const rolePillClass = (role: AppUserRole): string =>
  role === '管理员'
    ? 'bg-primary/10 text-primary'
    : 'bg-muted text-muted-foreground';

export const statusPillClass = (status: AppUserStatus): string =>
  status === '启用'
    ? 'bg-semantic-green/10 text-semantic-green'
    : 'bg-semantic-red/10 text-semantic-red';

export const syncPillClass = (baseRecordId: string | null): string =>
  baseRecordId
    ? 'bg-semantic-green/10 text-semantic-green'
    : 'bg-accent text-accent-foreground';
