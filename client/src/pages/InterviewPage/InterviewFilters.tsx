import { Search } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

import { Input } from '@client/src/components/ui/input';

const ALL_LABEL = '全部';

interface InterviewFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  functions: string[];
  difficulties: string[];
  activeFunction: string;
  onFunctionChange: (value: string) => void;
  activeDifficulty: string;
  onDifficultyChange: (value: string) => void;
}

const InterviewFilters = ({
  keyword,
  onKeywordChange,
  functions,
  difficulties,
  activeFunction,
  onFunctionChange,
  activeDifficulty,
  onDifficultyChange,
}: InterviewFiltersProps) => {
  const functionTabs: string[] = [ALL_LABEL, ...functions];
  const difficultyTabs: string[] = [ALL_LABEL, ...difficulties];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6 space-y-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索题目、分类或标签…"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="rounded-full border-border/80 pl-9 transition-all duration-300 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
            aria-label="搜索面试题"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        <LayoutGroup id="interview-function-tabs">
          {functionTabs.map((tab: string) => {
            const active = activeFunction === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onFunctionChange(tab)}
                aria-pressed={active}
                className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    active
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </span>
                {active && (
                  <motion.span
                    layoutId="interview-function-active"
                    className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </LayoutGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          难度
        </span>
        {difficultyTabs.map((tab: string) => {
          const active = activeDifficulty === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onDifficultyChange(tab)}
              aria-pressed={active}
              className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default InterviewFilters;
