import { useRef } from 'react';
import type { KeyboardEvent, ReactNode, UIEvent } from 'react';
import { Eraser, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@client/src/components/ui/button';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const KEYWORDS = new Set<string>([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'ON', 'LIMIT', 'AS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'DESC', 'ASC', 'HAVING', 'WITH', 'OVER', 'PARTITION', 'LAG', 'LEAD', 'CAST',
  'DISTINCT', 'ROUND', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'NULL', 'INTEGER', 'REAL', 'TEXT',
]);

const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z_0-9]*)/g;

const renderHighlighted = (code: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const re = new RegExp(TOKEN_RE.source, 'g');
  let last = 0;
  let key = 0;
  let match = re.exec(code);
  while (match !== null) {
    if (match.index > last) {
      nodes.push(code.slice(last, match.index));
    }
    const [full, comment, str, num, word] = match;
    if (comment !== undefined) {
      nodes.push(
        <span key={key++} className="italic text-muted-foreground">{full}</span>,
      );
    } else if (str !== undefined) {
      nodes.push(
        <span key={key++} className="text-semantic-orange-bright">{full}</span>,
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={key++} className="text-accent-foreground">{full}</span>,
      );
    } else if (word !== undefined && KEYWORDS.has(word.toUpperCase())) {
      nodes.push(
        <span key={key++} className="font-bold text-primary">{full}</span>,
      );
    } else {
      nodes.push(full);
    }
    last = match.index + full.length;
    match = re.exec(code);
  }
  if (last < code.length) {
    nodes.push(code.slice(last));
  }
  return nodes;
};

const SqlEditor = ({ value, onChange, onRun }: SqlEditorProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>): void => {
    const ta = e.currentTarget;
    const pre = preRef.current;
    if (pre) {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      onChange(`${value.slice(0, start)}  ${value.slice(end)}`);
      requestAnimationFrame(() => {
        el.selectionStart = start + 2;
        el.selectionEnd = start + 2;
      });
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
          SQL 编辑器
        </h2>
        <span className="hidden rounded-full bg-muted/60 px-3 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline">
          Ctrl / ⌘ + Enter 执行
        </span>
      </div>

      <div className="mt-4 overflow-x-auto scrollbar-thin">
        <div className="relative min-w-[520px] overflow-hidden rounded-xl border border-border/60 bg-background/60 font-mono text-sm">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 leading-6 text-foreground"
          >
            {renderHighlighted(value)}
            {'\n'}
          </pre>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="-- 在此编写 SQL，点击「执行 SQL」或按 Ctrl/⌘ + Enter 运行"
            className="relative min-h-[240px] w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-4 leading-6 text-transparent caret-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onRun} className="rounded-full px-5 font-semibold">
            <Play className="h-4 w-4" />
            执行 SQL
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            variant="ghost"
            onClick={() => onChange('')}
            className="rounded-full px-4 text-muted-foreground hover:text-foreground"
          >
            <Eraser className="h-4 w-4" />
            清空
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SqlEditor;
