import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { logger } from '@lark-apaas/client-toolkit/logger';

import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import type {
  InterviewQuestion,
  InterviewQuestionListResponse,
} from '@shared/interview';
import {
  fetchInterviewQuestions,
  syncInterviewQuestions,
} from '@client/src/api/interview';
import InterviewSourceCard from './InterviewSourceCard';
import InterviewTabs, {
  INTERVIEW_VIEW_KEYS,
  isInterviewViewKey,
  type InterviewViewKey,
} from './InterviewTabs';
import LibraryView from './LibraryView';
import PracticeStats from './PracticeStats';
import PracticeView from './PracticeView';
import CollectionView from './CollectionView';
import { usePracticeStore } from './usePracticeStore';
import { useSession } from '@client/src/session/SessionContext';

const QUESTIONS_QUERY_KEY = ['interview-questions'];

const readNestedMessage = (value: unknown): string | undefined => {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const errorValue = record.error;
  if (typeof errorValue !== 'object' || errorValue === null) return undefined;
  const message = (errorValue as Record<string, unknown>).message;
  return typeof message === 'string' && message.length > 0 ? message : undefined;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const response = (error as Record<string, unknown>).response;
  if (typeof response !== 'object' || response === null) return fallback;
  return readNestedMessage((response as Record<string, unknown>).data) ?? fallback;
};

const QuestionListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i: number) => (
      <div
        key={i}
        className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const InterviewPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [startQuestionId, setStartQuestionId] = useState<string | undefined>(
    undefined,
  );
  const [practiceKey, setPracticeKey] = useState<number>(0);

  const { user } = useSession();
  const isAdmin = user?.role === '管理员';
  const visibleViews = useMemo<readonly InterviewViewKey[]>(
    () =>
      isAdmin
        ? INTERVIEW_VIEW_KEYS.filter(
            (key: InterviewViewKey) => key !== 'mistakes',
          )
        : INTERVIEW_VIEW_KEYS,
    [isAdmin],
  );

  const viewParam = searchParams.get('view');
  const view: InterviewViewKey =
    isInterviewViewKey(viewParam) && visibleViews.includes(viewParam)
      ? viewParam
      : 'library';

  const { state, setMastery, toggleFavorite, setAnswer } = usePracticeStore(
    user?.name ?? '',
  );

  const { data, isLoading, isError, refetch } =
    useQuery<InterviewQuestionListResponse>({
      queryKey: QUESTIONS_QUERY_KEY,
      queryFn: fetchInterviewQuestions,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  const syncMutation = useMutation({
    mutationFn: syncInterviewQuestions,
    retry: false,
    onSuccess: (result: InterviewQuestionListResponse) => {
      queryClient.setQueryData(QUESTIONS_QUERY_KEY, result);
      toast.success(`已从飞书多维表格同步 ${result.total} 道题目`);
    },
    onError: (error: unknown) => {
      logger.error('sync interview questions failed', error);
      toast.error(extractErrorMessage(error, '同步失败，请稍后重试'));
    },
  });

  const questions = useMemo<InterviewQuestion[]>(
    () => data?.items ?? [],
    [data],
  );

  const stats = useMemo(() => {
    let mastered = 0;
    let mistakes = 0;
    let favorites = 0;
    for (const q of questions) {
      const record = state[q.id];
      if (!record) continue;
      if (record.mastery === 'mastered') mastered += 1;
      if (record.mastery === 'unmastered') mistakes += 1;
      if (record.favorite) favorites += 1;
    }
    return { mastered, mistakes, favorites };
  }, [questions, state]);

  const handleViewChange = (nextView: InterviewViewKey) => {
    const params = new URLSearchParams(searchParams);
    if (nextView === 'library') {
      params.delete('view');
    } else {
      params.set('view', nextView);
    }
    setSearchParams(params, { replace: true });
  };

  const handlePractice = (id: string) => {
    setStartQuestionId(id);
    setPracticeKey((prev: number) => prev + 1);
    handleViewChange('practice');
  };

  const counts: Record<InterviewViewKey, number | null> = {
    practice: questions.length,
    library: questions.length,
    mistakes: stats.mistakes,
    favorites: stats.favorites,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          面试题库
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {isLoading
            ? '正在加载题目…'
            : `${data?.total ?? 0} 道校招高频面试题，支持刷题练习${
                isAdmin ? '与收藏夹' : '、错题本与收藏夹'
              }`}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="mb-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <InterviewSourceCard
            baseUrl={data.baseUrl}
            total={data.total}
            syncedAt={data.syncedAt}
            canManage={user?.role === '管理员'}
            isSyncing={syncMutation.isPending}
            onSync={() => syncMutation.mutate()}
          />
          <PracticeStats
            total={data.total}
            mastered={stats.mastered}
            mistakes={stats.mistakes}
            favorites={stats.favorites}
            isLoading={isLoading}
          />
        </div>
      ) : null}

      <InterviewTabs
        active={view}
        onChange={handleViewChange}
        counts={counts}
        views={visibleViews}
      />

      {isLoading ? (
        <QuestionListSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground">题目加载失败，请稍后重试</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            重新加载
          </Button>
        </div>
      ) : view === 'practice' ? (
        <PracticeView
          key={practiceKey}
          questions={questions}
          state={state}
          setMastery={setMastery}
          toggleFavorite={toggleFavorite}
          setAnswer={setAnswer}
          startQuestionId={startQuestionId}
        />
      ) : view === 'mistakes' || view === 'favorites' ? (
        <CollectionView
          kind={view}
          questions={questions}
          state={state}
          onPractice={handlePractice}
          toggleFavorite={toggleFavorite}
          setMastery={setMastery}
        />
      ) : (
        <LibraryView
          questions={questions}
          state={state}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
};

export default InterviewPage;
