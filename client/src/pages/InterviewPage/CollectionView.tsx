import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, PlayCircle, Star } from 'lucide-react';

import type { InterviewQuestion } from '@shared/interview';
import type { MasteryStatus, PracticeState } from './usePracticeStore';

const DIFFICULTY_CLASS: Record<string, string> = {
  简单: 'bg-semantic-green/10 text-semantic-green',
  中等: 'bg-primary/10 text-primary',
  困难: 'bg-semantic-red/10 text-semantic-red',
};

interface CollectionViewProps {
  kind: 'mistakes' | 'favorites';
  questions: InterviewQuestion[];
  state: PracticeState;
  onPractice: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setMastery: (id: string, mastery: MasteryStatus | null) => void;
}

const CollectionView = ({
  kind,
  questions,
  state,
  onPractice,
  toggleFavorite,
  setMastery,
}: CollectionViewProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const isMistakes = kind === 'mistakes';

  const visibleQuestions = useMemo<InterviewQuestion[]>(
    () =>
      questions.filter((q: InterviewQuestion) =>
        isMistakes
          ? state[q.id]?.mastery === 'unmastered'
          : Boolean(state[q.id]?.favorite),
      ),
    [questions, state, isMistakes],
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const title = isMistakes ? '错题本' : '收藏夹';
  const description = isMistakes
    ? '标记为「未掌握」的题目会汇总在这里，可重新练习或移出错题'
    : '在刷题或浏览时点星标收藏的题目会汇总在这里';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          共 {visibleQuestions.length} 道
        </span>
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
            {isMistakes ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <Star className="h-6 w-6" />
            )}
          </div>
          <p className="text-muted-foreground">
            {isMistakes ? '还没有错题，继续保持' : '还没有收藏的题目'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {isMistakes
              ? '在刷题练习中把没答好的题目标记为「未掌握」，就会出现在这里'
              : '在刷题练习或全部题目中点击星标即可收藏'}
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-ai-section-type="card-list">
          {visibleQuestions.map((q: InterviewQuestion) => {
            const expanded = expandedIds.has(q.id);
            const isFavorite = Boolean(state[q.id]?.favorite);
            const isMistake = state[q.id]?.mastery === 'unmastered';

            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  aria-expanded={expanded}
                  className="block w-full px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span className="block font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
                    {q.question}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                      {q.function}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
                      {q.category}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        DIFFICULTY_CLASS[q.difficulty] ||
                        'bg-muted text-muted-foreground'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    {isMistake && (
                      <span className="rounded-full bg-semantic-red/10 px-3 py-0.5 text-xs font-semibold text-semantic-red">
                        未掌握
                      </span>
                    )}
                    {isFavorite && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                        <Star className="h-3 w-3" fill="currentColor" />
                        已收藏
                      </span>
                    )}
                    {q.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </button>

                {expanded && (
                  <div className="px-6 pb-5">
                    <div className="rounded-xl bg-gradient-to-br from-accent/70 to-accent/30 p-5">
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold text-accent-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        参考答案
                      </p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                        {q.answer}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-6 py-3">
                  <button
                    type="button"
                    onClick={() => onPractice(q.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    重新练习
                  </button>
                  {isMistakes && (
                    <button
                      type="button"
                      onClick={() => setMastery(q.id, null)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-semantic-green/40 hover:text-semantic-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      移出错题
                    </button>
                  )}
                  {!isMistakes && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(q.id)}
                      aria-label={`取消收藏：${q.question}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Star className="h-3.5 w-3.5" />
                      取消收藏
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionView;
