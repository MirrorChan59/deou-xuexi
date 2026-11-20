import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

import { INTERVIEW_DIFFICULTIES, INTERVIEW_FUNCTIONS } from '@shared/interview';
import type { InterviewQuestion } from '@shared/interview';
import InterviewFilters from './InterviewFilters';
import QuestionCard from './QuestionCard';
import type { PracticeState } from './usePracticeStore';

const ALL_LABEL = '全部';

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

interface LibraryViewProps {
  questions: InterviewQuestion[];
  state: PracticeState;
  toggleFavorite: (id: string) => void;
}

const LibraryView = ({
  questions,
  state,
  toggleFavorite,
}: LibraryViewProps) => {
  const [keyword, setKeyword] = useState<string>('');
  const [activeFunction, setActiveFunction] = useState<string>(ALL_LABEL);
  const [activeDifficulty, setActiveDifficulty] = useState<string>(ALL_LABEL);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const difficultyOptions = useMemo<string[]>(
    () =>
      orderByPreset(
        questions
          .map((q: InterviewQuestion) => q.difficulty)
          .filter((value: string) => Boolean(value)),
        INTERVIEW_DIFFICULTIES,
      ),
    [questions],
  );

  const filteredQuestions = useMemo<InterviewQuestion[]>(() => {
    const kw = keyword.trim().toLowerCase();
    return questions.filter((q: InterviewQuestion) => {
      if (activeFunction !== ALL_LABEL && q.function !== activeFunction) {
        return false;
      }
      if (
        activeDifficulty !== ALL_LABEL &&
        q.difficulty !== activeDifficulty
      ) {
        return false;
      }
      if (kw) {
        const haystack =
          `${q.question} ${q.category} ${q.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [questions, keyword, activeFunction, activeDifficulty]);

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

  return (
    <div>
      <InterviewFilters
        keyword={keyword}
        onKeywordChange={setKeyword}
        functions={functionOptions}
        difficulties={difficultyOptions}
        activeFunction={activeFunction}
        onFunctionChange={setActiveFunction}
        activeDifficulty={activeDifficulty}
        onDifficultyChange={setActiveDifficulty}
      />

      <div className="mb-4 text-xs text-muted-foreground">
        共 {filteredQuestions.length} 道题
        {filteredQuestions.length !== questions.length
          ? `（题库 ${questions.length} 道）`
          : ''}
      </div>

      <AnimatePresence mode="wait">
        {filteredQuestions.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <Star className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground">没有匹配的题目</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              试试更换关键词或放宽筛选条件
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
            data-ai-section-type="card-list"
          >
            {filteredQuestions.map((q: InterviewQuestion, index: number) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={index}
                isExpanded={expandedIds.has(q.id)}
                isFavorite={Boolean(state[q.id]?.favorite)}
                mastery={state[q.id]?.mastery}
                onToggle={toggleExpand}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryView;
