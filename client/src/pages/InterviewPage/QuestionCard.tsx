import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star } from 'lucide-react';

import type { InterviewQuestion } from '@shared/interview';
import type { MasteryStatus } from './usePracticeStore';

const DIFFICULTY_CLASS: Record<string, string> = {
  简单: 'bg-semantic-green/10 text-semantic-green',
  中等: 'bg-primary/10 text-primary',
  困难: 'bg-semantic-red/10 text-semantic-red',
};

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  isExpanded: boolean;
  isFavorite: boolean;
  mastery?: MasteryStatus;
  onToggle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const QuestionCard = ({
  question,
  index,
  isExpanded,
  isFavorite,
  mastery,
  onToggle,
  onToggleFavorite,
}: QuestionCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{
      type: 'spring',
      stiffness: 120,
      damping: 20,
      delay: Math.min(index * 0.04, 0.4),
    }}
  >
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 ease-out hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/15"
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => onToggle(question.id)}
        className="relative flex w-full items-start gap-3 py-6 pl-6 pr-14 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-expanded={isExpanded}
      >
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex"
          >
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-heading text-base font-semibold leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary md:text-lg">
            {question.question}
          </span>
          <span className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
              {question.function}
            </span>
            <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
              {question.category}
            </span>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                DIFFICULTY_CLASS[question.difficulty] ||
                'bg-muted text-muted-foreground'
              }`}
            >
              {question.difficulty}
            </span>
            {mastery === 'mastered' && (
              <span className="rounded-full bg-semantic-green/10 px-3 py-0.5 text-xs font-semibold text-semantic-green">
                已掌握
              </span>
            )}
            {mastery === 'unmastered' && (
              <span className="rounded-full bg-semantic-red/10 px-3 py-0.5 text-xs font-semibold text-semantic-red">
                未掌握
              </span>
            )}
            {question.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(question.id)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `取消收藏：${question.question}`
            : `收藏：${question.question}`
        }
        className={`absolute right-4 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          isFavorite
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-primary'
        }`}
      >
        <Star
          className="h-4 w-4"
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`answer-${question.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <div className="rounded-xl bg-gradient-to-br from-accent/70 to-accent/30 p-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold text-accent-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  参考答案
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {question.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

export default QuestionCard;
