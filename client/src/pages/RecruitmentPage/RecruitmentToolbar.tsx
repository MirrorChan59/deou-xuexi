import { LayoutGrid, LayoutList, Search, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';

import { Input } from '@client/src/components/ui/input';
import { Button } from '@client/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  RECRUITMENT_CITIES,
  RECRUITMENT_GRADES,
} from '@shared/recruitment';

export type ViewMode = 'list' | 'card';
export type SortMode = 'latest' | 'oldest';

interface RecruitmentToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  activeFunction: string;
  onFunctionChange: (value: string) => void;
  functions: string[];
  city: string;
  onCityChange: (value: string) => void;
  grade: string;
  onGradeChange: (value: string) => void;
  sort: SortMode;
  onSortChange: (value: SortMode) => void;
  view: ViewMode;
  onViewChange: (value: ViewMode) => void;
}

const RecruitmentToolbar = ({
  keyword,
  onKeywordChange,
  activeFunction,
  onFunctionChange,
  functions,
  city,
  onCityChange,
  grade,
  onGradeChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}: RecruitmentToolbarProps) => {
  const functionTabs: string[] = ['全部', ...functions];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-6 space-y-4 md:mb-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索公司名称…"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="rounded-full border-border/80 pl-9 transition-all duration-300 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
            aria-label="搜索公司名称"
          />
        </div>

        <div
          className="inline-flex shrink-0 self-start rounded-full border border-border/60 bg-muted/40 p-1 md:self-auto"
          role="group"
          aria-label="切换展示形式"
        >
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-pressed={view === 'list'}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              view === 'list'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            列表
          </button>
          <button
            type="button"
            onClick={() => onViewChange('card')}
            aria-pressed={view === 'card'}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              view === 'card'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            卡片
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
          <LayoutGroup id="recruitment-tabs">
            {functionTabs.map((tab: string) => {
              const active = activeFunction === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onFunctionChange(tab)}
                  aria-pressed={active}
                  className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <span
                    className={`relative z-10 transition-colors duration-200 ${
                      active
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="recruit-tab-active"
                      className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </LayoutGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger
              className="h-9 w-[132px] rounded-full border-border/80 text-xs font-semibold"
              aria-label="按工作城市筛选"
            >
              <SelectValue placeholder="全部城市" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部城市</SelectItem>
              {RECRUITMENT_CITIES.map((c: string) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={grade} onValueChange={onGradeChange}>
            <SelectTrigger
              className="h-9 w-[132px] rounded-full border-border/80 text-xs font-semibold"
              aria-label="按招聘对象筛选"
            >
              <SelectValue placeholder="全部届数" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部届数</SelectItem>
              {RECRUITMENT_GRADES.map((g: string) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onSortChange(sort === 'latest' ? 'oldest' : 'latest')
            }
            className="h-9 gap-1.5 rounded-full border-border/80 text-xs font-semibold"
            aria-label={
              sort === 'latest'
                ? '当前按投递开始日期最新优先，点击切换为最早优先'
                : '当前按投递开始日期最早优先，点击切换为最新优先'
            }
          >
            {sort === 'latest' ? (
              <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpNarrowWide className="h-3.5 w-3.5" />
            )}
            {sort === 'latest' ? '最新优先' : '最早优先'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecruitmentToolbar;
