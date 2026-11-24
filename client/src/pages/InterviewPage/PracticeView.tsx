import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  LayoutGrid,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@client/src/components/ui/button';
import { INTERVIEW_FUNCTIONS } from '@shared/interview';
import type { InterviewQuestion } from '@shared/interview';
import AnswerSelfCheckPanel from './AnswerSelfCheckPanel';
import type { MasteryStatus, PracticeState } from './usePracticeStore';

type PracticeMode = 'sequence' | 'random';

const SELECTED_FUNCTION_KEY = 'interview-practice-selected-function';

const DIFFICULTY_CLASS: Record<string, string> = {
  简单: 'bg-semantic-green/10 text-semantic-green',
  中等: 'bg-primary/10 text-primary',
  困难: 'bg-semantic-red/10 text-semantic-red',
};

const loadStoredFunction = (): string => {
  try {
    const value = window.localStorage.getItem(SELECTED_FUNCTION_KEY);
    return typeof value === 'string' ? value : '';
  } catch {
    return '';
  }
};

const storeFunction = (value: string): void => {
  try {
    if (value) {
      window.localStorage.setItem(SELECTED_FUNCTION_KEY, value);
    } else {
      window.localStorage.removeItem(SELECTED_FUNCTION_KEY);
    }
  } catch {
    // 本地存储不可用时静默降级，仅保留内存态
  }
};

const orderByPreset = (
  present: string[],
  preset: readonly string[],
): string[] => {
  const presentSet = new Set<string>(present);
  const ordered: string[] = preset.filter((item: string) =>
    presentSet.has(item),
  );
  const extra: string[] = Array.from(presentSet).filter(
    (item: string) => !(preset as readonly string[]).includes(item),
  );
  return [...ordered, ...extra];
};

const shuffleWithSeed = (
  items: InterviewQuestion[],
  seed: number,
): InterviewQuestion[] => {
  const result: InterviewQuestion[] = [...items];
  let current = seed % 2147483647;
  if (current <= 0) current += 2147483646;
  const nextRandom = (): number => {
    current = (current * 16807) % 2147483647;
    return current / 2147483647;
  };
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRandom() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
};

const formatTimer = (seconds: number): string => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

interface RoleCardProps {
  fn: string;
  total: number;
  mastered: number;
  unmastered: number;
  onSelect: (fn: string) => void;
}

const RoleCard = ({ fn, total, mastered, unmastered, onSelect }: RoleCardProps) => (
  <motion.button
    type="button"
    onClick={() => onSelect(fn)}
    whileTap={{ scale: 0.98 }}
    className="group flex flex-col rounded-2xl border border-border/60 bg-card p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
        <BriefcaseBusiness className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
        {total} 道题
      </span>
    </div>
    <p className="mt-4 font-heading text-xl font-bold tracking-tight text-foreground">
      {fn}
    </p>
    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="h-3.5 w-3.5 text-semantic-green" />
        已掌握 {mastered}
      </span>
      <span className="inline-flex items-center gap-1">
        <RotateCcw className="h-3.5 w-3.5 text-semantic-red/80" />
        错题 {unmastered}
      </span>
      <span>未练 {Math.max(total - mastered - unmastered, 0)}</span>
    </p>
    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
      开始练习
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
    </span>
  </motion.button>
);

interface PracticeViewProps {
  questions: InterviewQuestion[];
  state: PracticeState;
  setMastery: (id: string, mastery: MasteryStatus | null) => void;
  toggleFavorite: (id: string) => void;
  setAnswer: (id: string, answer: string) => void;
  startQuestionId?: string;
}

const PracticeView = ({
  questions,
  state,
  setMastery,
  toggleFavorite,
  setAnswer,
  startQuestionId,
}: PracticeViewProps) => {
  const [selectedFunction, setSelectedFunction] = useState<string>(() => {
    // 从错题本 / 收藏夹跳转时，直接定位到该题所属岗位
    const startQuestion = questions.find(
      (item: InterviewQuestion) => item.id === startQuestionId,
    );
    if (startQuestion?.function) return startQuestion.function;
    // 否则记忆上次选择的岗位（有效性在下方动态校验）
    return loadStoredFunction();
  });
  const [mode, setMode] = useState<PracticeMode>('sequence');
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());
  const [index, setIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const autoNextRef = useRef<number | null>(null);

  const functionOptions = useMemo<string[]>(
    () =>
      orderByPreset(
        questions
          .map((q: InterviewQuestion) => q.function)
          .filter((value: string) => Boolean(value)),
        INTERVIEW_FUNCTIONS,
      ),
    [questions],
  );

  const effectiveFunction = functionOptions.includes(selectedFunction)
    ? selectedFunction
    : '';

  const roleQuestions = useMemo<InterviewQuestion[]>(
    () =>
      effectiveFunction
        ? questions.filter(
            (q: InterviewQuestion) => q.function === effectiveFunction,
          )
        : [],
    [questions, effectiveFunction],
  );

  useEffect(() => {
    storeFunction(effectiveFunction);
  }, [effectiveFunction]);

  const orderedQuestions = useMemo<InterviewQuestion[]>(
    () =>
      mode === 'sequence'
        ? roleQuestions
        : shuffleWithSeed(roleQuestions, shuffleSeed),
    [roleQuestions, mode, shuffleSeed],
  );

  const current: InterviewQuestion | undefined = orderedQuestions[index];
  const currentId = current?.id ?? '';
  const currentRecord = currentId ? state[currentId] : undefined;

  useEffect(() => {
    if (!startQuestionId || orderedQuestions.length === 0) return;
    const target = orderedQuestions.findIndex(
      (item: InterviewQuestion) => item.id === startQuestionId,
    );
    if (target >= 0) {
      setIndex(target);
    }
  }, [startQuestionId, orderedQuestions]);

  useEffect(() => {
    setElapsed(0);
    if (!currentId) return undefined;
    const timer = window.setInterval(() => {
      setElapsed((value: number) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentId]);

  useEffect(
    () => () => {
      if (autoNextRef.current !== null) {
        window.clearTimeout(autoNextRef.current);
      }
    },
    [],
  );

  const goNext = useCallback(() => {
    setIndex((prev: number) =>
      Math.min(prev + 1, orderedQuestions.length),
    );
  }, [orderedQuestions.length]);

  const goPrev = useCallback(() => {
    setIndex((prev: number) => Math.max(prev - 1, 0));
  }, []);

  const scheduleNext = useCallback(() => {
    if (autoNextRef.current !== null) {
      window.clearTimeout(autoNextRef.current);
    }
    autoNextRef.current = window.setTimeout(() => {
      autoNextRef.current = null;
      goNext();
    }, 450);
  }, [goNext]);

  const handleMark = (status: MasteryStatus) => {
    if (!current) return;
    setMastery(current.id, currentRecord?.mastery === status ? null : status);
    scheduleNext();
  };

  const handleToggleFavorite = () => {
    if (!current) return;
    toggleFavorite(current.id);
  };

  const handleSaveAnswer = useCallback(
    (answer: string) => {
      if (!currentId) return;
      setAnswer(currentId, answer);
    },
    [currentId, setAnswer],
  );

  const handleModeChange = (nextMode: PracticeMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    if (nextMode === 'random') setShuffleSeed(Date.now());
    setIndex(0);
  };

  const restart = () => {
    setIndex(0);
    setShuffleSeed(Date.now());
  };

  const resetRoundState = () => {
    setMode('sequence');
    setShuffleSeed(Date.now());
    setIndex(0);
    setElapsed(0);
  };

  const backToRoleSelect = () => {
    setSelectedFunction('');
    resetRoundState();
  };

  const handleSelectRole = (fn: string) => {
    setSelectedFunction(fn);
    resetRoundState();
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <p className="text-muted-foreground">题库暂时没有题目，无法开始练习</p>
      </div>
    );
  }

  // 第一步：选择岗位
  if (!effectiveFunction) {
    const counts = functionOptions.map((fn: string) => {
      const pool = questions.filter(
        (q: InterviewQuestion) => q.function === fn,
      );
      let mastered = 0;
      let unmastered = 0;
      for (const q of pool) {
        const record = state[q.id];
        if (record?.mastery === 'mastered') mastered += 1;
        if (record?.mastery === 'unmastered') unmastered += 1;
      }
      return { fn, total: pool.length, mastered, unmastered };
    });
    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutGrid className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                先选择目标岗位
              </h2>
              <p className="text-xs text-muted-foreground">
                练习题按岗位归类，选择后只刷该岗位下的题目，练习中可随时切换
              </p>
            </div>
          </div>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map((item) => (
            <RoleCard
              key={item.fn}
              fn={item.fn}
              total={item.total}
              mastered={item.mastered}
              unmastered={item.unmastered}
              onSelect={handleSelectRole}
            />
          ))}
        </div>
      </div>
    );
  }

  // 第二步：该岗位下的练习题
  if (!current) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-semantic-green/10 text-semantic-green">
          <Check className="h-7 w-7" />
        </div>
        <p className="font-heading text-lg font-bold text-foreground">
          {effectiveFunction}岗位本轮 {orderedQuestions.length} 道题已全部练完
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          已掌握{' '}
          {
            roleQuestions.filter(
              (item: InterviewQuestion) =>
                state[item.id]?.mastery === 'mastered',
            ).length
          }{' '}
          道 · 错题{' '}
          {
            roleQuestions.filter(
              (item: InterviewQuestion) =>
                state[item.id]?.mastery === 'unmastered',
            ).length
          }{' '}
          道
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            onClick={restart}
            className="rounded-full bg-primary px-5"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            再练一轮
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={backToRoleSelect}
            className="rounded-full border-border/80"
          >
            <LayoutGrid className="mr-1.5 h-4 w-4" />
            切换岗位
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              {effectiveFunction}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              第 {index + 1} / {orderedQuestions.length} 题
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              aria-label={`本题用时 ${formatTimer(elapsed)}`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTimer(elapsed)}
            </span>
            <button
              type="button"
              onClick={backToRoleSelect}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <LayoutGrid className="h-3 w-3" />
              切换岗位
            </button>
            <div className="inline-flex items-center rounded-full border border-border/80 bg-card p-0.5">
              <button
                type="button"
                onClick={() => handleModeChange('sequence')}
                aria-pressed={mode === 'sequence'}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  mode === 'sequence'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                顺序
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('random')}
                aria-pressed={mode === 'random'}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  mode === 'random'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Shuffle className="h-3 w-3" />
                随机
              </button>
            </div>
          </div>
        </div>

        <h2 className="mt-5 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">
          {current.question}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
            {current.function}
          </span>
          <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
            {current.category}
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
              DIFFICULTY_CLASS[current.difficulty] ||
              'bg-muted text-muted-foreground'
            }`}
          >
            {current.difficulty}
          </span>
          {current.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <AnswerSelfCheckPanel
        key={current.id}
        question={current}
        savedAnswer={currentRecord?.answer}
        mastery={currentRecord?.mastery}
        isFavorite={Boolean(currentRecord?.favorite)}
        onSaveAnswer={handleSaveAnswer}
        onToggleFavorite={handleToggleFavorite}
        onMark={handleMark}
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-full border-border/80"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          上一题
        </Button>
        <Button
          type="button"
          onClick={goNext}
          className="rounded-full bg-primary"
        >
          下一题
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PracticeView;
