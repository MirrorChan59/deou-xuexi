import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Copy, ExternalLink, MapPin, Users } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import type { Recruitment } from '@shared/recruitment';
import { formatDate, getDaysLeft, getGradeStyle } from './utils';

interface RecruitmentCardProps {
  item: Recruitment;
  onCopy: (text: string) => void;
  onApply: (url: string) => void;
}

const RecruitmentCard = ({ item, onCopy, onApply }: RecruitmentCardProps) => {
  const daysLeft = useMemo(() => getDaysLeft(item.endDate), [item.endDate]);
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isExpired = daysLeft !== null && daysLeft < 0;

  const functionStyle =
    'bg-accent text-accent-foreground rounded-full px-3 py-0.5 text-xs font-semibold';
  const cityStyle =
    'bg-muted text-muted-foreground rounded-full px-3 py-0.5 text-xs font-semibold';

  return (
    <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 ease-out hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10">
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/12"
        aria-hidden="true"
      />

      <div>
        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
          {item.company}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.position}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={functionStyle}>{item.function}</span>
        <span className={`${cityStyle} inline-flex items-center gap-1`}>
          <MapPin className="h-3 w-3" />
          {item.city}
        </span>
        <span
          className={`${getGradeStyle(item.targetGrade)} inline-flex items-center gap-1`}
        >
          <Users className="h-3 w-3" />
          {item.targetGrade}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span
          className={`text-sm font-semibold ${
            isExpired
              ? 'text-muted-foreground line-through'
              : isUrgent
                ? 'text-semantic-orange-bright'
                : 'text-foreground'
          }`}
        >
          投递截止：{formatDate(item.endDate)}
        </span>
        {isUrgent && !isExpired && (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full bg-semantic-orange-bright/10 px-2 py-0.5 text-xs font-bold text-semantic-orange-bright"
          >
            仅剩 {daysLeft} 天
          </motion.span>
        )}
      </div>

      {item.remark && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.remark}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2 transition-all duration-300 group-hover:bg-accent/50">
        <span className="truncate text-xs text-muted-foreground">
          {item.referralCode || '暂无内推信息'}
        </span>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCopy(item.referralCode)}
          disabled={!item.referralCode}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="复制内推码"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>复制</span>
        </motion.button>
      </div>

      <Button
        variant="default"
        className="group/btn mt-auto w-full gap-1.5 rounded-full font-semibold"
        onClick={() => onApply(item.applyUrl)}
        disabled={!item.applyUrl}
      >
        <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        立即投递
      </Button>
    </div>
  );
};

export default RecruitmentCard;
