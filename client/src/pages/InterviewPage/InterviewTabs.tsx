import { motion, LayoutGroup } from 'framer-motion';

export const INTERVIEW_VIEW_KEYS = [
  'practice',
  'library',
  'mistakes',
  'favorites',
] as const;

export type InterviewViewKey = (typeof INTERVIEW_VIEW_KEYS)[number];

export const isInterviewViewKey = (
  value: string | null,
): value is InterviewViewKey =>
  value !== null && (INTERVIEW_VIEW_KEYS as readonly string[]).includes(value);

const TAB_LABELS: Record<InterviewViewKey, string> = {
  practice: '刷题练习',
  library: '全部题目',
  mistakes: '错题本',
  favorites: '收藏夹',
};

interface InterviewTabsProps {
  active: InterviewViewKey;
  onChange: (key: InterviewViewKey) => void;
  counts: Record<InterviewViewKey, number | null>;
  views?: readonly InterviewViewKey[];
}

const InterviewTabs = ({
  active,
  onChange,
  counts,
  views = INTERVIEW_VIEW_KEYS,
}: InterviewTabsProps) => (
  <div
    className="my-6 flex gap-1 overflow-x-auto pb-1 scrollbar-thin"
    role="tablist"
    aria-label="面试题库视图"
  >
    <LayoutGroup id="interview-view-tabs">
      {views.map((key: InterviewViewKey) => {
        const isActive = active === key;
        const count = counts[key];
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span
              className={`relative z-10 inline-flex items-center gap-1.5 transition-colors duration-200 ${
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {TAB_LABELS[key]}
              {count !== null && (
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    isActive
                      ? 'bg-primary-foreground/20'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </span>
            {isActive && (
              <motion.span
                layoutId="interview-view-active"
                className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </LayoutGroup>
  </div>
);

export default InterviewTabs;
