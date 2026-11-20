import { motion } from 'framer-motion';
import { Target, BookOpen, AlertCircle, Star } from 'lucide-react';

interface PracticeStatsProps {
  total: number;
  mastered: number;
  mistakes: number;
  favorites: number;
  isLoading: boolean;
}

const StatItem = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) => (
  <div className="flex items-center gap-3">
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="font-heading text-xl font-bold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const PracticeStats = ({
  total,
  mastered,
  mistakes,
  favorites,
  isLoading,
}: PracticeStatsProps) => {
  const rate = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
      data-ai-section-type="card-stat"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatItem
          icon={<BookOpen className="h-4 w-4" />}
          label="总题数"
          value={isLoading ? '—' : String(total)}
          tone="bg-accent text-accent-foreground"
        />
        <StatItem
          icon={<Target className="h-4 w-4" />}
          label="已掌握"
          value={String(mastered)}
          tone="bg-semantic-green/10 text-semantic-green"
        />
        <StatItem
          icon={<AlertCircle className="h-4 w-4" />}
          label="错题数"
          value={String(mistakes)}
          tone="bg-semantic-red/10 text-semantic-red"
        />
        <StatItem
          icon={<Star className="h-4 w-4" />}
          label="已收藏"
          value={String(favorites)}
          tone="bg-primary/10 text-primary"
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">掌握率</span>
          <span className="font-heading text-sm font-bold text-primary">
            {rate}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${rate}%` }}
            role="progressbar"
            aria-label="掌握率"
            aria-valuenow={rate}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PracticeStats;
