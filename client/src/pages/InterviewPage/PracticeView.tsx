import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  RotateCcw,
  Shuffle,
} from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import type { InterviewQuestion } from '@shared/interview';
import AnswerSelfCheckPanel from './AnswerSelfCheckPanel';
import type { MasteryStatus, PracticeState } from './usePracticeStore';

type PracticeMode = 'sequence' | 'random';

const DIFFICULTY_CLASS: Record<string, string> = {
  简单: 'bg-semantic-green/10 text-semantic-green',
  中等: 'bg-primary/10 text-primary',
  困难: 'bg-semantic-red/10 text-semantic-red',
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
  const [mode, setMode] = useState<PracticeMode>('sequence');
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Date.now());
  const [index, setIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const autoNextRef = useRef<number | null>(null);

  const orderedQuestions = useMemo<InterviewQuestion[]>(
    () =>
      mode === 'sequence'
        ? questions
        : shuffleWithSeed(questions, shuffleSeed),
    [questions, mode, shuffleSeed],
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

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <p className="text-muted-foreground">题库暂时没有题目，无法开始练习</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-semantic-green/10 text-semantic-green">
          <Check className="h-7 w-7" />
        </div>
        <p className="font-heading text-lg font-bold text-foreground">
          本轮 {questions.length} 道题已全部练完
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          已掌握{' '}
          {
            questions.filter(
              (item: InterviewQuestion) =>
                state[item.id]?.mastery === 'mastered',
            ).length
          }{' '}
          道 · 错题{' '}
          {
            questions.filter(
              (item: InterviewQuestion) =>
                state[item.id]?.mastery === 'unmastered',
            ).length
          }{' '}
          道
        </p>
        <Button
          type="button"
          onClick={restart}
          className="mt-5 rounded-full bg-primary px-5"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          再练一轮
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            第 {index + 1} / {orderedQuestions.length} 题
          </span>

          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              aria-label={`本题用时 ${formatTimer(elapsed)}`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTimer(elapsed)}
            </span>
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
