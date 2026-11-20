import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import type { Recruitment } from '@shared/recruitment';
import {
  getRecruitmentFilters,
  listRecruitments,
} from '@client/src/api/recruitment';
import type { ListRecruitmentsParams } from '@client/src/api/recruitment';
import RecruitmentCard from './RecruitmentCard';
import RecruitmentListView from './RecruitmentListView';
import RecruitmentToolbar from './RecruitmentToolbar';
import type { SortMode, ViewMode } from './RecruitmentToolbar';
import { CardListSkeleton, TableSkeleton } from './RecruitmentSkeleton';

const RecruitmentPage = () => {
  const [items, setItems] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [activeFunction, setActiveFunction] = useState<string>('全部');
  const [functions, setFunctions] = useState<string[]>([]);
  const [city, setCity] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [sort, setSort] = useState<SortMode>('latest');
  const [view, setView] = useState<ViewMode>('card');

  useEffect(() => {
    getRecruitmentFilters()
      .then((data) => {
        setFunctions(data.functions);
      })
      .catch(() => {
        // 筛选项拉取失败时仍可使用空列表，不阻塞主数据
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: ListRecruitmentsParams = { sort };
    if (activeFunction !== '全部') params.function = activeFunction;
    if (keyword.trim()) params.keyword = keyword.trim();
    if (city !== 'all') params.city = city;
    if (grade !== 'all') params.targetGrade = grade;

    listRecruitments(params)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [keyword, activeFunction, city, grade, sort]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制');
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  const handleApply = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          得欧科技 · 校招投递表
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          实时更新的校招岗位信息，支持列表 / 卡片切换，助力高效投递
        </p>
      </motion.div>

      <RecruitmentToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        activeFunction={activeFunction}
        onFunctionChange={setActiveFunction}
        functions={functions}
        city={city}
        onCityChange={setCity}
        grade={grade}
        onGradeChange={setGrade}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      <div className="mb-4 text-xs text-muted-foreground">
        {loading ? '正在加载岗位…' : `共 ${items.length} 个岗位`}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key={`loading-${view}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {view === 'list' ? <TableSkeleton /> : <CardListSkeleton />}
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground">暂无匹配的投递信息</p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              试试放宽筛选条件或更换关键词
            </p>
          </motion.div>
        ) : view === 'list' ? (
          <motion.div key="list" exit={{ opacity: 0 }}>
            <RecruitmentListView items={items} />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
            data-ai-section-type="card-list"
          >
            {items.map((item: Recruitment) => (
              <motion.div key={item.id} className="h-full">
                <RecruitmentCard
                  item={item}
                  onCopy={handleCopy}
                  onApply={handleApply}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecruitmentPage;
