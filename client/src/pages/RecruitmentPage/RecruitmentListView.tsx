import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

import type { Recruitment } from '@shared/recruitment';
import { formatDate, getDaysLeft, getGradeStyle } from './utils';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface RecruitmentListViewProps {
  items: Recruitment[];
}

const RecruitmentListView = ({ items }: RecruitmentListViewProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
  >
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
            <th className="whitespace-nowrap px-4 py-3">公司</th>
            <th className="px-4 py-3">岗位</th>
            <th className="whitespace-nowrap px-4 py-3">职能</th>
            <th className="whitespace-nowrap px-4 py-3">城市</th>
            <th className="whitespace-nowrap px-4 py-3">届数</th>
            <th className="whitespace-nowrap px-4 py-3">截止日期</th>
            <th className="whitespace-nowrap px-4 py-3">投递链接</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: Recruitment) => (
            <RecruitmentRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const RecruitmentRow = ({ item }: { item: Recruitment }) => {
  const daysLeft = useMemo(() => getDaysLeft(item.endDate), [item.endDate]);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

  return (
    <tr className="border-b border-border/40 transition-colors duration-200 last:border-b-0 hover:bg-accent/40">
      <td className="whitespace-nowrap px-4 py-3 font-heading text-sm font-bold text-foreground">
        {item.company}
      </td>
      <td className="max-w-[260px] px-4 py-3">
        <span className="line-clamp-2 text-sm text-foreground/90">
          {item.position}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {item.function}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {item.city}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className={getGradeStyle(item.targetGrade)}>
          {item.targetGrade}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span
          className={`text-sm ${
            isExpired
              ? 'text-muted-foreground line-through'
              : isUrgent
                ? 'font-semibold text-semantic-orange-bright'
                : 'text-foreground/90'
          }`}
        >
          {formatDate(item.endDate)}
        </span>
        {isUrgent && !isExpired && (
          <span className="ml-1.5 text-xs font-semibold text-semantic-orange-bright">
            仅剩 {daysLeft} 天
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {item.applyUrl ? (
          <UniversalLink
            to={item.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={`投递 ${item.company} ${item.position}`}
          >
            投递
            <ExternalLink className="h-3 w-3" />
          </UniversalLink>
        ) : (
          <span className="text-xs text-muted-foreground">待更新</span>
        )}
      </td>
    </tr>
  );
};

export default RecruitmentListView;
