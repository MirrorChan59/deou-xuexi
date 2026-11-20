import { CheckCircle2, ChevronDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { QUESTIONS } from './questions';
import type { Difficulty, SqlQuestion } from './questions';

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  简单: 'bg-semantic-green text-white',
  中等: 'bg-primary text-primary-foreground',
  困难: 'bg-semantic-red text-white',
};

const NUMERAL = ['一', '二', '三', '四', '五'];

interface QuestionPanelProps {
  selectedId: string | null;
  completedIds: Set<string>;
  onSelect: (id: string) => void;
  answerOpen: boolean;
  onToggleAnswer: () => void;
  detail: ReactNode;
}

interface QuestionItemProps {
  question: SqlQuestion;
  isDone: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const QuestionItem = ({
  question,
  isDone,
  isSelected,
  onSelect,
}: QuestionItemProps) => (
  <motion.button
    onClick={() => onSelect(question.id)}
    whileTap={{ scale: 0.99 }}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      isSelected
        ? 'bg-accent'
        : 'bg-card hover:bg-muted/50'
    }`}
  >
    <span
      className={`shrink-0 font-mono text-sm font-bold ${
        isSelected ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      {question.id.replace('q', 'Q')}
    </span>
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${DIFFICULTY_CLASS[question.difficulty]}`}
    >
      {question.difficulty}
    </span>
    <span
      className={`min-w-0 flex-1 truncate text-sm ${
        isSelected ? 'font-semibold text-foreground' : 'text-foreground/80'
      }`}
    >
      {question.title}
    </span>
    <span className="hidden shrink-0 gap-1.5 sm:flex">
      {question.tables.map((t: string) => (
        <span
          key={t}
          className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] font-medium text-secondary-foreground"
        >
          {t}
        </span>
      ))}
    </span>
    {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-semantic-green" />}
    <ChevronDown
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
        isSelected ? 'rotate-180' : ''
      }`}
    />
  </motion.button>
);

const QuestionPanel = ({
  selectedId,
  completedIds,
  onSelect,
  answerOpen,
  onToggleAnswer,
  detail,
}: QuestionPanelProps) => {
  const selected =
    selectedId === null
      ? null
      : QUESTIONS.find((q: SqlQuestion) => q.id === selectedId) ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6"
    >
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
        取数需求题
      </h2>

      <div className="mt-4 flex flex-col gap-1.5">
        {QUESTIONS.map((q: SqlQuestion) => (
          <QuestionItem
            key={q.id}
            question={q}
            isDone={completedIds.has(q.id)}
            isSelected={q.id === selected?.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {selected && (
        <motion.div
          key={selected.id}
          id={`question-detail-${selected.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-5 rounded-xl border border-border/60 bg-background/60 p-4 md:p-5"
        >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${DIFFICULTY_CLASS[selected.difficulty]}`}
              >
                {selected.difficulty}
              </span>
              {selected.tables.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-3 py-0.5 font-mono text-xs font-medium text-secondary-foreground sm:hidden"
                >
                  {t}
                </span>
              ))}
            </div>

            <h3 className="mt-3 font-heading text-base font-bold leading-snug tracking-tight text-foreground">
              {selected.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {selected.description}
            </p>

            {selected.hint && (
              <div className="mt-3 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground/80">
                <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" />
                  提示
                </span>
                <p className="mt-1">{selected.hint}</p>
              </div>
            )}

            <div className="mt-5 space-y-5">{detail}</div>

            <div className="mt-5">
              <motion.button
                onClick={onToggleAnswer}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${answerOpen ? 'rotate-180' : ''}`}
                />
                {answerOpen ? '收起参考答案' : '查看参考答案'}
              </motion.button>
              <AnimatePresence initial={false}>
                {answerOpen && (
                  <motion.div
                    key={`answer-${selected.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-3 rounded-xl bg-gradient-to-br from-accent/70 to-accent/30 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold text-accent-foreground">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                        参考答案（不唯一，以下写法均可）
                      </p>
                      {selected.answerSqls.map((sql: string, i: number) => (
                        <div key={i}>
                          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                            参考答案{NUMERAL[i] ?? i + 1}
                          </p>
                          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/90 scrollbar-thin">
                            {sql}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
      )}
    </motion.section>
  );
};

export default QuestionPanel;
