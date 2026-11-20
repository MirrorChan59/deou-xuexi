export interface InterviewQuestion {
  id: string;
  function: string;
  category: string;
  difficulty: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface InterviewQuestionListResponse {
  items: InterviewQuestion[];
  total: number;
  syncedAt: string;
  baseUrl: string;
}

export const INTERVIEW_BASE_URL =
  'https://my.feishu.cn/base/CJN2brwZUal7tms1YuPccsyCnlb';

export const INTERVIEW_FUNCTIONS = ['产品', '运营', '市场', '通用'] as const;
export type InterviewFunction = (typeof INTERVIEW_FUNCTIONS)[number];

export const INTERVIEW_DIFFICULTIES = ['简单', '中等', '困难'] as const;
export type InterviewDifficulty = (typeof INTERVIEW_DIFFICULTIES)[number];
