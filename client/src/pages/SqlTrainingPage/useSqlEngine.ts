import { useEffect, useRef, useState } from 'react';
import initSqlJs, { type Database } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { SCHEMA_DDL } from './schemaData';

export interface SqlResult {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface RunOutcome {
  ok: boolean;
  result?: SqlResult;
  error?: string;
  durationMs: number;
  rowCount?: number;
}

const toCell = (value: unknown): string | number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  return String(value);
};

const toResult = (columns: string[], values: unknown[][]): SqlResult => ({
  columns,
  rows: values.map((row: unknown[]): (string | number | null)[] =>
    row.map(toCell),
  ),
});

export const useSqlEngine = (): {
  ready: boolean;
  runSql: (sql: string) => RunOutcome;
  querySample: (table: string, limit: number) => SqlResult;
} => {
  const [ready, setReady] = useState<boolean>(false);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async (): Promise<void> => {
      const SQL = await initSqlJs({ locateFile: () => wasmUrl } as never);
      const db = new SQL.Database();
      for (const ddl of SCHEMA_DDL) {
        db.run(ddl);
      }
      if (cancelled) {
        db.close();
        return;
      }
      dbRef.current = db;
      setReady(true);
    };
    init().catch((err: unknown) => {
      logger.error('sql engine init failed', err);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runSql = (sql: string): RunOutcome => {
    const db = dbRef.current;
    if (!db) {
      return { ok: false, error: '数据库引擎尚未初始化完成，请稍候再试', durationMs: 0 };
    }
    const start = performance.now();
    try {
      const out = db.exec(sql);
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      if (out.length === 0) {
        return { ok: true, result: { columns: [], rows: [] }, durationMs, rowCount: 0 };
      }
      const result = toResult(out[0].columns, out[0].values);
      return { ok: true, result, durationMs, rowCount: result.rows.length };
    } catch (err) {
      const durationMs = Math.round((performance.now() - start) * 100) / 100;
      const error = err instanceof Error ? err.message : String(err);
      return { ok: false, error, durationMs };
    }
  };

  const querySample = (table: string, limit: number): SqlResult => {
    const db = dbRef.current;
    if (!db) return { columns: [], rows: [] };
    try {
      const out = db.exec(`SELECT * FROM ${table} LIMIT ${limit}`);
      if (out.length === 0) return { columns: [], rows: [] };
      return toResult(out[0].columns, out[0].values);
    } catch (err) {
      logger.error(`query sample failed for table ${table}`, err);
      return { columns: [], rows: [] };
    }
  };

  return { ready, runSql, querySample };
};
