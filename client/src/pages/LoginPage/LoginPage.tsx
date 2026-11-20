import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Info, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Image } from '@client/src/components/ui/image';
import logoUrl from '@client/src/assets/logo.png';
import type {
  AppUser,
  AppUserListResponse,
  LoginResponse,
} from '@shared/app-user';
import { fetchAppUsers } from '@client/src/api/app-users';
import { loginAppUser } from '@client/src/api/auth';
import { useSession } from '@client/src/session/SessionContext';
import { readCachedAppUsers, writeCachedAppUsers } from './user-list-cache';

const APP_USERS_QUERY_KEY = ['app-users', 'login'];
const DEMO_PASSWORD = '123456';

const DEMO_ACCOUNTS: AppUser[] = [
  {
    id: 'local-demo-student',
    name: '演示学生',
    role: '学生',
    status: '启用',
    createdAt: '',
    baseRecordId: null,
    hasPassword: true,
  },
  {
    id: 'local-demo-admin',
    name: '演示管理员',
    role: '管理员',
    status: '启用',
    createdAt: '',
    baseRecordId: null,
    hasPassword: true,
  },
];

const loginSchema = z.object({
  name: z.string().trim().min(1, '请输入用户名和密码'),
  password: z.string().min(1, '请输入用户名和密码'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

const LoginPage = () => {
  const navigate = useNavigate();
  const { user: sessionUser, login } = useSession();

  const cachedUsers = useMemo<AppUser[]>(() => readCachedAppUsers(), []);

  const { data, isLoading } = useQuery<AppUserListResponse>({
    queryKey: APP_USERS_QUERY_KEY,
    queryFn: () => fetchAppUsers({ refresh: true }),
    retry: 1,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (data && data.items.length > 0) {
      writeCachedAppUsers(data.items);
    }
  }, [data]);

  const enabledAccounts = useMemo<AppUser[]>(() => {
    const source = data?.items?.length ? data.items : cachedUsers;
    return source.filter((item: AppUser) => item.status === '启用');
  }, [data, cachedUsers]);

  const loginableAccounts = useMemo<AppUser[]>(
    () => enabledAccounts.filter((item: AppUser) => item.hasPassword),
    [enabledAccounts],
  );

  const demoAdminAvailable =
    !isLoading &&
    !loginableAccounts.some((item: AppUser) => item.role === '管理员');
  const demoStudentAvailable =
    !isLoading &&
    !loginableAccounts.some((item: AppUser) => item.role === '学生');
  const demoHintNames = [
    demoAdminAvailable ? '演示管理员' : '',
    demoStudentAvailable ? '演示学生' : '',
  ]
    .filter((value: string) => value.length > 0)
    .join(' / ');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { name: '', password: '' },
  });

  const loginMutation = useMutation<LoginResponse, unknown, LoginFormValues>({
    mutationFn: (values: LoginFormValues) =>
      loginAppUser({ name: values.name.trim(), password: values.password }),
    retry: false,
    onSuccess: (result: LoginResponse) => {
      login(result.user.name, result.user.role);
      navigate('/interview', { replace: true });
    },
    onError: (error: unknown) => {
      logger.error('login failed', error);
      toast.error(readErrorMessage(error, '用户名或密码错误'));
    },
  });

  if (sessionUser) {
    return <Navigate to="/interview" replace />;
  }

  const isPending = loginMutation.isPending;

  const onSubmit = form.handleSubmit((values: LoginFormValues) => {
    const trimmedName = values.name.trim();
    const demo = DEMO_ACCOUNTS.find(
      (account: AppUser) => account.name === trimmedName,
    );
    if (demo && values.password === DEMO_PASSWORD) {
      const demoAllowed =
        demo.role === '管理员' ? demoAdminAvailable : demoStudentAvailable;
      if (demoAllowed) {
        login(demo.name, demo.role);
        navigate('/interview', { replace: true });
        return;
      }
    }
    loginMutation.mutate({ name: trimmedName, password: values.password });
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-2.5 px-4 md:px-6">
          <Image src={logoUrl} alt="得欧科技" className="h-8 w-8" />
          <span className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
            得欧学员站
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 md:px-6 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            账号登录
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            使用管理员分配的账号与密码登录，仅「启用」状态的账号可登录
          </p>
        </motion.div>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-7">
          <Form {...form}>
            <form
              noValidate
              onSubmit={onSubmit}
              className="space-y-5"
              aria-label="账号登录"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="请输入用户名"
                        autoComplete="username"
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
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        className="rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-primary"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    登录中…
                  </>
                ) : (
                  <>
                    <LogIn className="mr-1.5 h-4 w-4" />
                    登录
                  </>
                )}
              </Button>
            </form>
          </Form>

          {demoHintNames.length > 0 && (
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-accent/60 px-4 py-3 text-xs leading-relaxed text-accent-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                当前没有已设置密码的可用账号，可先用演示账号「{demoHintNames}」
                登录，密码 {DEMO_PASSWORD}
                ；登录后请在「账号管理」中为账号设置密码。
              </span>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 得欧学员站 · 互联网求职加油站
      </footer>
    </div>
  );
};

export default LoginPage;
