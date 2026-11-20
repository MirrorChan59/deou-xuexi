import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { createAppUser, updateAppUser } from '@client/src/api/app-users';
import {
  APP_USER_PASSWORD_MAX_LENGTH,
  APP_USER_ROLES,
  APP_USER_STATUSES,
  type AppUser,
  type AppUserMutationResponse,
  type AppUserRole,
  type AppUserStatus,
  type CreateAppUserRequest,
  type UpdateAppUserRequest,
} from '@shared/app-user';

export type AccountFormMode = 'create' | 'edit';

const nameField = z
  .string()
  .trim()
  .min(1, '请输入账号名')
  .max(50, '账号名不能超过 50 个字符');

const passwordField = z
  .string()
  .max(
    APP_USER_PASSWORD_MAX_LENGTH,
    `密码不能超过 ${APP_USER_PASSWORD_MAX_LENGTH} 个字符`,
  );

const createAccountSchema = z.object({
  name: nameField,
  password: passwordField.min(1, '请输入密码'),
  role: z.enum(APP_USER_ROLES),
  status: z.enum(APP_USER_STATUSES),
});

const editAccountSchema = z.object({
  name: nameField,
  password: passwordField,
  role: z.enum(APP_USER_ROLES),
  status: z.enum(APP_USER_STATUSES),
});

type AccountFormValues = z.infer<typeof createAccountSchema>;

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

interface AccountFormBodyProps {
  mode: AccountFormMode;
  account: AppUser | null;
  onClose: () => void;
}

const AccountFormBody = ({ mode, account, onClose }: AccountFormBodyProps) => {
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit' && account !== null;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(isEdit ? editAccountSchema : createAccountSchema),
    defaultValues: {
      name: account?.name ?? '',
      password: '',
      role: account?.role ?? '学生',
      status: account?.status ?? '启用',
    },
  });

  const mutation = useMutation<
    AppUserMutationResponse,
    unknown,
    AccountFormValues
  >({
    mutationFn: (values: AccountFormValues) => {
      if (account) {
        const patch: UpdateAppUserRequest = {};
        if (values.name !== account.name) patch.name = values.name;
        if (values.password.length > 0) patch.password = values.password;
        if (values.role !== account.role) patch.role = values.role;
        if (values.status !== account.status) patch.status = values.status;
        if (Object.keys(patch).length === 0) {
          return Promise.resolve({ user: account });
        }
        return updateAppUser(account.id, patch);
      }
      const body: CreateAppUserRequest = {
        name: values.name,
        password: values.password,
        role: values.role,
        status: values.status,
      };
      return createAppUser(body);
    },
    retry: false,
    onSuccess: (result: AppUserMutationResponse) => {
      if (result.baseSyncError) {
        toast.warning(
          `已保存到应用，飞书 Base 同步失败：${result.baseSyncError}`,
        );
      } else {
        toast.success(isEdit ? '账号已更新' : '账号已新增');
      }
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      onClose();
    },
    onError: (error: unknown) => {
      logger.error('save app user failed', error);
      toast.error(
        readErrorMessage(
          error,
          isEdit ? '更新账号失败，请稍后重试' : '新增账号失败，请稍后重试',
        ),
      );
    },
  });

  const onSubmit = form.handleSubmit((values: AccountFormValues) => {
    mutation.mutate(values);
  });

  const isPending = mutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-5">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold">
            {isEdit ? '编辑账号' : '新增账号'}
          </DialogTitle>
          <DialogDescription>
            账号与密码会同时写入应用与飞书多维表格「用户列表」，请确认信息无误。
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>账号名</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="请输入账号名"
                  maxLength={50}
                  autoComplete="off"
                  className="rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                密码
                {!isEdit && (
                  <span aria-hidden="true" className="ml-0.5 text-destructive">
                    *
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={isEdit ? '留空表示不修改密码' : '请输入登录密码'}
                  autoComplete="new-password"
                  maxLength={APP_USER_PASSWORD_MAX_LENGTH}
                  className="rounded-xl"
                />
              </FormControl>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  留空表示不修改密码
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>角色</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full rounded-xl" aria-label="角色">
                      <SelectValue placeholder="请选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_USER_ROLES.map((role: AppUserRole) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>状态</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full rounded-xl"
                      aria-label="状态"
                    >
                      <SelectValue placeholder="请选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {APP_USER_STATUSES.map((status: AppUserStatus) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full"
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-primary"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中…
              </>
            ) : isEdit ? (
              '保存修改'
            ) : (
              '确认新增'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface AccountFormDialogProps {
  mode: AccountFormMode;
  open: boolean;
  account: AppUser | null;
  onOpenChange: (open: boolean) => void;
}

const AccountFormDialog = ({
  mode,
  open,
  account,
  onOpenChange,
}: AccountFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-2xl sm:max-w-md">
      <AccountFormBody
        mode={mode}
        account={account}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);

export default AccountFormDialog;
