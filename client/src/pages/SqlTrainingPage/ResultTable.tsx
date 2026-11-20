import { AlertTriangle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RunOutcome } from './useSqlEngine';

interface ResultTableProps {
  outcome: RunOutcome | null;
  expectedMatch: boolean | null;
}

const ResultTable = ({ outcome, expectedMatch }: ResultTableProps) => {
  const result = outcome?.result;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6"
    >
      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
        执行结果
      </h2>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {outcome === null ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-xl bg-muted/30 px-4 py-10 text-center"
            >
              <Inbox className="h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                执行 SQL 后，查询结果将在这里展示
              </p>
            </motion.div>
          ) : !outcome.ok ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-destructive/40 bg-destructive/5 p-4"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                SQL 执行出错
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-card/80 p-3 font-mono text-xs leading-relaxed text-destructive scrollbar-thin">
                {outcome.error ?? '未知错误'}
              </pre>
            </motion.div>
          ) : (
            <motion.div
              key={`success-${outcome.durationMs}-${outcome.rowCount ?? 0}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-semantic-green">
                  <span className="inline-block h-2 w-2 rounded-full bg-semantic-green" />
                  执行成功
                </span>
                <span className="text-muted-foreground">
                  耗时 {outcome.durationMs} ms
                </span>
                <span className="text-muted-foreground">
                  返回 {outcome.rowCount ?? 0} 行
                </span>
              </div>

              {expectedMatch === false && (
                <div className="mt-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-foreground">
                  结果与参考答案不完全一致，可展开参考答案对照检查（参考答案不唯一，聚合口径、筛选条件都可能影响结果）。
                </div>
              )}

              {expectedMatch === true && (
                <div className="mt-3 rounded-xl border border-semantic-green/40 bg-semantic-green/10 p-3 text-xs font-semibold leading-relaxed text-semantic-green">
                  回答正确，结果与参考答案一致！
                </div>
              )}

              {(outcome.rowCount ?? 0) === 0 ? (
                <p className="mt-3 rounded-xl bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  查询成功，但未返回数据
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-max text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground">
                        {(result?.columns ?? []).map((col: string) => (
                          <th
                            key={col}
                            className="whitespace-nowrap px-3 py-2 font-mono font-semibold"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result?.rows ?? []).map(
                        (row: (string | number | null)[], i: number) => (
                          <tr
                            key={i}
                            className="border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                          >
                            {row.map(
                              (cell: string | number | null, j: number) => (
                                <td
                                  key={j}
                                  className={`whitespace-nowrap px-3 py-2 font-mono ${
                                    cell === null
                                      ? 'text-muted-foreground'
                                      : typeof cell === 'number'
                                        ? 'text-right text-foreground/90'
                                        : 'text-foreground/90'
                                  }`}
                                >
                                  {cell === null ? 'NULL' : String(cell)}
                                </td>
                              ),
                            )}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ResultTable;
