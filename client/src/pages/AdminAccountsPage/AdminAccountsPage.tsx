import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  AlertCircle,
  Database,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Skeleton } from '@client/src/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@client/src/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  deleteAppUser,
  fetchAppUsers,
  syncAppUsers,
} from '@client/src/api/app-users';
import { useSession } from '@client/src/session/SessionContext';
import type {
  AppUser,
  AppUserDeleteResponse,
  AppUserListResponse,
} from '@shared/app-user';
import AccountFormDialog, { type AccountFormMode } from './AccountFormDialog';
import DeleteAccountDialog from './DeleteAccountDialog';
import {
  ALL_FILTER_VALUE,
  APP_USERS_ADMIN_QUERY_KEY,
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  rolePillClass,
  statusPillClass,
  syncPillClass,
} from './account-options';

const readErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const response = (error as Record<string, unknown>).response;
  if (typeof response !== 'object' || response === null) return fallback;
  const data = (response as Record<string, unknown>).data;
  if (typeof data !== 'object' || data === null) return fallback;
  const errorBody = (data as Record<string, unknown>).error;
  if (typeof errorBody !== 'object' || errorBody === null) return fallback;
  const message = (errorBody as Record<string, unknown>).message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
};

const formatCreatedAt = (value: string): string => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '—';
};

const AccountsTableSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
    <div className="space-y-3 p-4 md:p-6">
      {Array.from({ length: 5 }).map((_, index: number) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="ml-auto hidden h-4 w-32 rounded-md md:block" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const AdminAccountsPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>(ALL_FILTER_VALUE);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER_VALUE);

  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<AccountFormMode>('create');
  const [editingAccount, setEditingAccount] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const accountsQuery = useQuery<AppUserListResponse>({
    queryKey: APP_USERS_ADMIN_QUERY_KEY,
    queryFn: () => fetchAppUsers({ refresh: true }),
    staleTime: 60_000,
    retry: 1,
  });

  const syncMutation = useMutation<AppUserListResponse, unknown, void>({
    mutationFn: syncAppUsers,
    retry: false,
    onSuccess: (result: AppUserListResponse) => {
      queryClient.setQueryData(APP_USERS_ADMIN_QUERY_KEY, result);
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      toast.success(`已从飞书多维表格同步 ${result.total} 个账号`);
    },
    onError: (error: unknown) => {
      logger.error('sync app users failed', error);
      toast.error(readErrorMessage(error, '同步失败，请稍后重试'));
    },
  });

  const deleteMutation = useMutation<
    AppUserDeleteResponse,
    unknown,
    string
  >({
    mutationFn: deleteAppUser,
    retry: false,
    onSuccess: (result: AppUserDeleteResponse) => {
      if (result.baseSyncError) {
        toast.warning(
          `已保存到应用，飞书 Base 同步失败：${result.baseSyncError}`,
        );
      } else {
        toast.success('账号已删除');
      }
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      logger.error('delete app user failed', error);
      toast.error(readErrorMessage(error, '删除账号失败，请稍后重试'));
    },
  });

  const accounts = useMemo<AppUser[]>(
    () => accountsQuery.data?.items ?? [],
    [accountsQuery.data],
  );

  const filteredAccounts = useMemo<AppUser[]>(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return accounts.filter((account: AppUser) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        account.name.toLowerCase().includes(normalizedKeyword);
      const matchesRole =
        roleFilter === ALL_FILTER_VALUE || account.role === roleFilter;
      const matchesStatus =
        statusFilter === ALL_FILTER_VALUE || account.status === statusFilter;
      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [accounts, keyword, roleFilter, statusFilter]);

  const openCreateDialog = (): void => {
    setFormMode('create');
    setEditingAccount(null);
    setFormOpen(true);
  };

  const openEditDialog = (account: AppUser): void => {
    setFormMode('edit');
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean): void => {
    setFormOpen(open);
    if (!open) setEditingAccount(null);
  };

  const total = accountsQuery.data?.total ?? 0;
  const syncedAt = accountsQuery.data?.syncedAt ?? '';

  if (user?.role !== '管理员') {
    return <Navigate to="/interview" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            账号管理
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            账号与密码同时写入应用与飞书多维表格；在 Base
            中修改后点「从 Base 同步」即可拉回
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            共 {total} 个账号 · 最近同步{' '}
            {syncedAt ? dayjs(syncedAt).format('MM-DD HH:mm') : '尚未同步'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="rounded-full border-border/80"
          >
            <Database className="mr-1.5 h-4 w-4" />
            {syncMutation.isPending ? '同步中…' : '从 Base 同步'}
          </Button>
          <Button
            type="button"
            onClick={openCreateDialog}
            className="rounded-full bg-primary"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            新增账号
          </Button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm md:p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索账号名"
              aria-label="搜索账号名"
              className="rounded-full pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger
              className="w-[130px] rounded-full"
              aria-label="按角色筛选"
            >
              <SelectValue placeholder="全部角色" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-[130px] rounded-full"
              aria-label="按状态筛选"
            >
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {accountsQuery.isLoading ? (
        <AccountsTableSkeleton />
      ) : accountsQuery.isError ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground">账号列表加载失败，请稍后重试</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => accountsQuery.refetch()}
            className="mt-4 rounded-full"
          >
            重新加载
          </Button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-heading text-base font-bold text-foreground">
            还没有账号
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            点击「新增账号」添加第一位学员
          </p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/60 py-16 text-center">
          <p className="text-sm text-muted-foreground">没有符合条件的账号</p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-border/60 bg-card shadow-sm"
          data-ai-section-type="card-list"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 md:px-6">账号名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>同步状态</TableHead>
                <TableHead className="px-4 text-right md:px-6">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account: AppUser) => (
                <TableRow key={account.id}>
                  <TableCell className="px-4 md:px-6">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-accent-foreground">
                        {account.name.slice(0, 1)}
                      </span>
                      <span className="truncate font-heading text-sm font-semibold text-foreground">
                        {account.name}
                      </span>
                      {!account.hasPassword && (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          未设密码
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${rolePillClass(account.role)}`}
                    >
                      {account.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(account.status)}`}
                    >
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatCreatedAt(account.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${syncPillClass(account.baseRecordId)}`}
                    >
                      {account.baseRecordId ? '已同步' : '仅本地'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 text-right md:px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(account)}
                        aria-label={`编辑 ${account.name}`}
                        className="rounded-full border-border/80"
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        编辑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(account)}
                        aria-label={`删除 ${account.name}`}
                        className="rounded-full text-semantic-red hover:bg-semantic-red/10"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AccountFormDialog
        mode={formMode}
        open={formOpen}
        account={formMode === 'edit' ? editingAccount : null}
        onOpenChange={handleFormOpenChange}
      />

      <DeleteAccountDialog
        account={deleteTarget}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminAccountsPage;
