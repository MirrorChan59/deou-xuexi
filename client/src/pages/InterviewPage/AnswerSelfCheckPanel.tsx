import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Eye, PencilLine, Star, X } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Textarea } from '@client/src/components/ui/textarea';
import type { InterviewQuestion } from '@shared/interview';
import type { MasteryStatus } from './usePracticeStore';

interface AnswerSelfCheckPanelProps {
  question: InterviewQuestion;
  savedAnswer?: string;
  mastery?: MasteryStatus;
  isFavorite: boolean;
  onSaveAnswer: (answer: string) => void;
  onToggleFavorite: () => void;
  onMark: (status: MasteryStatus) => void;
}

const AnswerSelfCheckPanel = ({
  question,
  savedAnswer,
  mastery,
  isFavorite,
  onSaveAnswer,
  onToggleFavorite,
  onMark,
}: AnswerSelfCheckPanelProps) => {
  const [draft, setDraft] = useState<string>(savedAnswer ?? '');
  const [submittedAnswer, setSubmittedAnswer] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  useEffect(() => {
    const stored = savedAnswer ?? '';
    if (draft.trim() === stored.trim()) return undefined;
    const timer = window.setTimeout(() => {
      onSaveAnswer(draft);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, savedAnswer, onSaveAnswer]);

  const trimmedDraft = draft.trim();

  const handleSubmit = () => {
    if (trimmedDraft.length === 0) return;
    onSaveAnswer(draft);
    setSubmittedAnswer(trimmedDraft);
    setIsRevealed(true);
  };

  const handleRevealDirectly = () => {
    if (trimmedDraft.length > 0) onSaveAnswer(draft);
    setSubmittedAnswer('');
    setIsRevealed(true);
  };

  return (
    <section className="mt-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <label
        htmlFor={`answer-input-${question.id}`}
        className="flex items-center gap-1.5 font-heading text-sm font-semibold text-foreground"
      >
        <PencilLine className="h-4 w-4 text-primary" />
        我的回答
      </label>

      <Textarea
        id={`answer-input-${question.id}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="请先输入你的面试回答，再查看参考答案..."
        rows={5}
        className="mt-3 resize-y rounded-xl border-border/80 text-sm leading-relaxed transition-colors hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {trimmedDraft.length === 0
            ? '写完后对照标准答案，自己找出遗漏和差距'
            : `已输入 ${trimmedDraft.length} 个字符，内容会自动保存`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={trimmedDraft.length === 0}
            className="rounded-full bg-primary px-5"
          >
            <Check className="mr-1.5 h-4 w-4" />
            提交我的回答
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRevealDirectly}
            className="rounded-full border-border/80"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            直接看答案
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isRevealed && (
          <motion.div
            key="self-check-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4">
              {submittedAnswer && (
                <div className="rounded-xl border border-border/70 bg-muted/40 p-5">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
                    <PencilLine className="h-3.5 w-3.5 text-muted-foreground" />
                    我的回答
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {submittedAnswer}
                  </p>
                </div>
              )}

              <div className="rounded-xl bg-gradient-to-br from-accent/70 to-accent/30 p-5">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold text-accent-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  参考答案
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {question.answer}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onToggleFavorite}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `取消收藏：${question.question}`
                      : `收藏：${question.question}`
                  }
                  className={`rounded-full ${
                    isFavorite
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/80 text-muted-foreground'
                  }`}
                >
                  <Star
                    className="mr-1.5 h-4 w-4"
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onMark('unmastered')}
                  aria-pressed={mastery === 'unmastered'}
                  aria-label={`未掌握：${question.question}`}
                  className={`rounded-full ${
                    mastery === 'unmastered'
                      ? 'border-semantic-red bg-semantic-red/10 text-semantic-red'
                      : 'border-border/80 text-muted-foreground'
                  }`}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  未掌握
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => onMark('mastered')}
                  aria-pressed={mastery === 'mastered'}
                  aria-label={`标记掌握：${question.question}`}
                  className={`rounded-full ${
                    mastery === 'mastered'
                      ? 'bg-semantic-green text-white hover:bg-semantic-green/90'
                      : 'bg-primary'
                  }`}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {mastery === 'mastered' ? '已掌握' : '标记掌握'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AnswerSelfCheckPanel;
