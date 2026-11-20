import { RefreshCw, ExternalLink, BookOpen, Table2 } from 'lucide-react';
import dayjs from 'dayjs';

import { Button } from '@client/src/components/ui/button';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

interface InterviewSourceCardProps {
  baseUrl: string;
  total: number;
  syncedAt: string;
  canManage: boolean;
  isSyncing: boolean;
  onSync: () => void;
}

const InterviewSourceCard = ({
  baseUrl,
  total,
  syncedAt,
  canManage,
  isSyncing,
  onSync,
}: InterviewSourceCardProps) => {
  if (!canManage) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <BookOpen className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            题库共 {total} 道题目
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            题目持续更新，进入练习即可开始刷题
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/10 bg-accent/40 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
          <Table2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            数据来源：飞书多维表格
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total} 道题目 · 最近同步{' '}
            {syncedAt ? dayjs(syncedAt).format('MM-DD HH:mm') : '—'}
          </p>
          <UniversalLink
            to={baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            在飞书多维表格中编辑
            <ExternalLink className="h-3 w-3" />
          </UniversalLink>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={isSyncing}
        className="shrink-0 self-start border-primary/20 text-primary hover:bg-primary/10 hover:text-primary md:self-auto"
      >
        <RefreshCw
          className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
        />
        {isSyncing ? '同步中…' : '从 Base 同步'}
      </Button>
    </div>
  );
};

export default InterviewSourceCard;
