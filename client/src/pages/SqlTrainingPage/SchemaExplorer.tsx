import { useState } from 'react';
import { Database } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { TABLE_SCHEMAS } from './schemaData';
import type { SqlResult } from './useSqlEngine';

interface SchemaExplorerProps {
  querySample: (table: string, limit: number) => SqlResult;
}

const SchemaExplorer = ({ querySample }: SchemaExplorerProps) => {
  const [activeTable, setActiveTable] = useState<string>(
    TABLE_SCHEMAS[0].name,
  );
  const schema =
    TABLE_SCHEMAS.find((t) => t.name === activeTable) ?? TABLE_SCHEMAS[0];
  const sample = querySample(schema.name, 10);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.15 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6"
      data-ai-section-type="card-list"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Database className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            数据表模拟区
          </h2>
          <p className="text-xs text-muted-foreground">
            {schema.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <LayoutGroup id="schema-table-tabs">
          {TABLE_SCHEMAS.map((t) => {
            const active = t.name === activeTable;
            return (
              <button
                key={t.name}
                onClick={() => setActiveTable(t.name)}
                className="relative shrink-0 rounded-full px-4 py-1.5 font-mono text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span
                  className={`relative z-10 transition-colors duration-200 ${
                    active
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.name}
                </span>
                {active && (
                  <motion.span
                    layoutId="schema-table-active-bg"
                    className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </LayoutGroup>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTable}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-4 space-y-4"
        >
          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-accent-foreground">
              字段结构
            </p>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground">
                    <th className="px-3 py-2 font-mono font-semibold">字段名</th>
                    <th className="px-3 py-2 font-mono font-semibold">类型</th>
                    <th className="px-3 py-2 font-semibold">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {schema.columns.map((col) => (
                    <tr
                      key={col.name}
                      className="border-b border-border/40 last:border-b-0"
                    >
                      <td className="px-3 py-2 font-mono font-semibold text-primary">
                        {col.name}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {col.type}
                      </td>
                      <td className="px-3 py-2 text-foreground/90">
                        {col.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-accent-foreground">
              样例数据（前 10 条）
            </p>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-max text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground">
                    {sample.columns.map((col: string) => (
                      <th key={col} className="whitespace-nowrap px-3 py-2 font-mono font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sample.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={Math.max(sample.columns.length, 1)}
                        className="px-3 py-4 text-center text-muted-foreground"
                      >
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    sample.rows.map(
                      (row: (string | number | null)[], i: number) => (
                        <tr
                          key={i}
                          className="border-b border-border/40 last:border-b-0"
                        >
                          {row.map((cell: string | number | null, j: number) => (
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
                          ))}
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

export default SchemaExplorer;
