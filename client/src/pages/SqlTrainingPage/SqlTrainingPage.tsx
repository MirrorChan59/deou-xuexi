import { useCallback, useState } from 'react';
import { CheckCircle2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { QUESTIONS } from './questions';
import type { SqlQuestion } from './questions';
import { useSqlEngine } from './useSqlEngine';
import type { RunOutcome, SqlResult } from './useSqlEngine';
import QuestionPanel from './QuestionPanel';
import SchemaExplorer from './SchemaExplorer';
import SqlEditor from './SqlEditor';
import ResultTable from './ResultTable';

const STORAGE_KEY = 'sql-training-progress';

const loadCompletedIds = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set<string>(
      parsed.filter((x: unknown): x is string => typeof x === 'string'),
    );
  } catch {
    return new Set<string>();
  }
};

const normalizeCell = (cell: string | number | null): string => {
  if (cell === null) return 'NULL';
  if (typeof cell === 'number') return `N${Math.round(cell * 100) / 100}`;
  return cell.trim();
};

const rowKey = (row: (string | number | null)[]): string =>
  JSON.stringify(row.map(normalizeCell));

const isResultMatch = (actual?: SqlResult, expected?: SqlResult): boolean => {
  if (!actual || !expected) return false;
  if (actual.columns.length !== expected.columns.length) return false;
  if (actual.rows.length !== expected.rows.length) return false;
  const actualKeys = actual.rows.map(rowKey).sort();
  const expectedKeys = expected.rows.map(rowKey).sort();
  return actualKeys.every((k: string, i: number) => k === expectedKeys[i]);
};

const buildStarter = (question: SqlQuestion): string =>
  `-- 当前题目：${question.title}\n-- 涉及数据表：${question.tables.join('、')}\n-- 在下方编写 SQL 语句\n\n`;

const PageSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6 md:py-12"
  >
    <div className="space-y-3">
      <div className="h-8 w-72 rounded-lg bg-muted/60" />
      <div className="h-4 w-96 rounded-md bg-muted/60" />
    </div>
    <div className="space-y-6">
      <div className="h-64 rounded-2xl bg-muted/60" />
      <div className="h-96 rounded-2xl bg-muted/60" />
    </div>
  </motion.div>
);

const SqlTrainingPage = () => {
  const { ready, runSql, querySample } = useSqlEngine();
  const [selectedId, setSelectedId] = useState<string | null>(QUESTIONS[0].id);
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompletedIds);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of QUESTIONS) initial[q.id] = buildStarter(q);
    return initial;
  });
  const [outcomes, setOutcomes] = useState<Record<string, RunOutcome | null>>({});
  const [matchStates, setMatchStates] = useState<Record<string, boolean | null>>({});
  const [answerOpen, setAnswerOpen] = useState<boolean>(false);

  const handleSelect = useCallback((id: string): void => {
    setSelectedId(id);
    setAnswerOpen(false);
    window.setTimeout(() => {
      document
        .getElementById(`question-detail-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, []);

  const markCompleted = useCallback((id: string): void => {
    setCompletedIds((prev: Set<string>) => {
      if (prev.has(id)) return prev;
      const next = new Set<string>(prev);
      next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // 本地存储不可用时静默降级，仅保留内存态进度
      }
      return next;
    });
  }, []);

  const handleDraftChange = useCallback((id: string, value: string): void => {
    setDrafts((prev: Record<string, string>) => ({ ...prev, [id]: value }));
  }, []);

  const handleRun = useCallback((): void => {
    if (selectedId === null) return;
    const question = QUESTIONS.find((q: SqlQuestion) => q.id === selectedId);
    if (!question) return;
    const sqlText = drafts[selectedId] ?? '';
    if (!sqlText.trim()) {
      toast.error('请先输入要执行的 SQL 语句');
      return;
    }

    const runResult = runSql(sqlText);
    setOutcomes((prev: Record<string, RunOutcome | null>) => ({
      ...prev,
      [selectedId]: runResult,
    }));
    setMatchStates((prev: Record<string, boolean | null>) => ({
      ...prev,
      [selectedId]: null,
    }));

    if (!runResult.ok) {
      setAnswerOpen(true);
      return;
    }

    const matched = question.answerSqls.some((answerSql: string) => {
      const expected = runSql(answerSql);
      return isResultMatch(runResult.result, expected.result);
    });
    setMatchStates((prev: Record<string, boolean | null>) => ({
      ...prev,
      [selectedId]: matched,
    }));
    if (matched) {
      toast.success('回答正确！');
      setAnswerOpen(false);
      markCompleted(question.id);
    } else {
      toast.info('SQL 执行成功，结果与参考答案不完全一致，可展开参考答案对照检查');
      setAnswerOpen(true);
    }
  }, [selectedId, drafts, runSql, markCompleted]);

  if (!ready) {
    return <PageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            产品经理技能训练 · SQL 取数
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground md:text-base">
            <Terminal className="h-4 w-4 text-primary" />
            在浏览器内直接写 SQL 验证取数逻辑，像数据同学一样思考
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
          <CheckCircle2 className="h-4 w-4" />
          已完成 {completedIds.size}/{QUESTIONS.length}
        </span>
      </motion.div>

      <div className="space-y-6">
        <QuestionPanel
          selectedId={selectedId}
          completedIds={completedIds}
          onSelect={handleSelect}
          answerOpen={answerOpen}
          onToggleAnswer={() => setAnswerOpen((prev: boolean) => !prev)}
          detail={
            selectedId === null ? null : (
              <>
                <SqlEditor
                  value={drafts[selectedId] ?? ''}
                  onChange={(value: string) =>
                    handleDraftChange(selectedId, value)
                  }
                  onRun={handleRun}
                />
                <ResultTable
                  outcome={outcomes[selectedId] ?? null}
                  expectedMatch={matchStates[selectedId] ?? null}
                />
              </>
            )
          }
        />
        <SchemaExplorer querySample={querySample} />
      </div>
    </div>
  );
};

export default SqlTrainingPage;
