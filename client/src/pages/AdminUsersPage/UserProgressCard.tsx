import { motion } from 'framer-motion';
import { ListChecks, Star, TrendingUp, XCircle } from 'lucide-react';

import type { UserProgressSummary } from './admin-summary';

interface UserProgressCardProps {
  summary: UserProgressSummary;
  index: number;
}

const roleClass = (role: string): string =>
  role === '管理员'
    ? 'bg-primary/10 text-primary'
    : 'bg-muted text-muted-foreground';

const statusClass = (status: string): string => {
  if (status === '启用') return 'bg-semantic-green/10 text-semantic-green';
  if (status === '禁用') return 'bg-semantic-red/10 text-semantic-red';
  return 'bg-accent text-accent-foreground';
};

const MetricItem = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ListChecks;
  label: string;
  value: number;
  tone: string;
}) => (
  <div className="flex items-center gap-1.5">
    <Icon className={`h-3.5 w-3.5 ${tone}`} />
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-heading text-sm font-bold text-foreground">
      {value}
    </span>
  </div>
);

const UserProgressCard = ({ summary, index }: UserProgressCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-accent-foreground">
          {summary.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-foreground">
            {summary.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleClass(summary.role)}`}
            >
              {summary.role}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(summary.status)}`}
            >
              {summary.status}
            </span>
          </div>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
        掌握率 {summary.masteryRate}%
      </span>
    </div>

    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${summary.masteryRate}%` }}
        role="progressbar"
        aria-label={`${summary.name} 掌握率`}
        aria-valuenow={summary.masteryRate}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>

    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <MetricItem
        icon={TrendingUp}
        label="已掌握"
        value={summary.mastered}
        tone="text-semantic-green"
      />
      <MetricItem
        icon={XCircle}
        label="待巩固"
        value={summary.mistakes}
        tone="text-semantic-red"
      />
      <MetricItem
        icon={Star}
        label="收藏"
        value={summary.favorites}
        tone="text-primary"
      />
      <MetricItem
        icon={ListChecks}
        label="已作答"
        value={summary.answered}
        tone="text-muted-foreground"
      />
    </div>

    <p className="mt-3 text-xs text-muted-foreground">
      {summary.hasLocalRecord
        ? `总题数 ${summary.totalQuestions} 道`
        : '暂无本机练习记录'}
    </p>
  </motion.div>
);

export default UserProgressCard;
