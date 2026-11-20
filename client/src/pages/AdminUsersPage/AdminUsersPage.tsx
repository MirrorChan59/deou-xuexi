import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Database, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import type { AppUserListResponse } from '@shared/app-user';
import type {
  InterviewQuestion,
  InterviewQuestionListResponse,
} from '@shared/interview';
import { fetchAppUsers, syncAppUsers } from '@client/src/api/app-users';
import { fetchInterviewQuestions } from '@client/src/api/interview';
import { useSession } from '@client/src/session/SessionContext';
import { listLocalPracticeUsers } from '../InterviewPage/practice-storage';
import UserProgressCard from './UserProgressCard';
import { buildUserSummaries, type UserProgressSummary } from './admin-summary';

const APP_USERS_QUERY_KEY = ['app-users'];
const QUESTIONS_QUERY_KEY = ['interview-questions'];

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

const SummarySkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index: number) => (
      <div
        key={index}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
        <div className="mt-3 flex gap-4">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const AdminUsersPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const usersQuery = useQuery<AppUserListResponse>({
    queryKey: APP_USERS_QUERY_KEY,
    queryFn: () => fetchAppUsers(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const questionsQuery = useQuery<InterviewQuestionListResponse>({
    queryKey: QUESTIONS_QUERY_KEY,
    queryFn: fetchInterviewQuestions,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const syncMutation = useMutation({
    mutationFn: syncAppUsers,
    retry: false,
    onSuccess: (result: AppUserListResponse) => {
      queryClient.setQueryData(APP_USERS_QUERY_KEY, result);
      setRefreshTick((prev: number) => prev + 1);
      toast.success(`已从飞书多维表格同步 ${result.total} 个用户`);
    },
    onError: (error: unknown) => {
      logger.error('sync app users failed', error);
      toast.error(readErrorMessage(error, '同步失败，请稍后重试'));
    },
  });

  const questions = useMemo<InterviewQuestion[]>(
    () => questionsQuery.data?.items ?? [],
    [questionsQuery.data],
  );

  const summaries = useMemo<UserProgressSummary[]>(() => {
    if (!usersQuery.data) return [];
    return buildUserSummaries(
      usersQuery.data.items,
      listLocalPracticeUsers(),
      questions,
    );
  }, [usersQuery.data, questions, refreshTick]);

  if (user?.role !== '管理员') {
    return <Navigate to="/interview" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            用户管理
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            账号在「账号管理」中维护；练习数据保存在各学员浏览器本地，此处汇总在本机登录过的学员记录
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRefreshTick((prev: number) => prev + 1)}
            className="rounded-full border-border/80"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            刷新本机记录
          </Button>
          <Button
            type="button"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="rounded-full bg-primary"
          >
            <Database className="mr-1.5 h-4 w-4" />
            {syncMutation.isPending ? '同步中…' : '从 Base 同步用户'}
          </Button>
        </div>
      </div>

      {usersQuery.isLoading ? (
        <SummarySkeleton />
      ) : usersQuery.isError ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground">用户列表加载失败，请稍后重试</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => usersQuery.refetch()}
            className="mt-4 rounded-full"
          >
            重新加载
          </Button>
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-heading text-base font-bold text-foreground">
            暂无用户数据
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            请先在「账号管理」中添加学员账号，学员登录练习后这里会显示进度
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4 md:grid-cols-2"
          data-ai-section-type="card-list"
        >
          {summaries.map((summary: UserProgressSummary, index: number) => (
            <UserProgressCard
              key={summary.name}
              summary={summary}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
