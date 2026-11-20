export interface Recruitment {
  id: string;
  company: string;
  position: string;
  function: string;
  city: string;
  targetGrade: string;
  startDate: string;
  endDate: string;
  applyUrl: string;
  referralCode: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentListResponse {
  items: Recruitment[];
}

export interface RecruitmentFiltersResponse {
  functions: string[];
}

export const RECRUITMENT_FUNCTIONS = ["产品", "运营", "市场"] as const;
export type RecruitmentFunction = typeof RECRUITMENT_FUNCTIONS[number];

export const RECRUITMENT_CITIES = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "成都",
  "其他",
] as const;
export type RecruitmentCity = typeof RECRUITMENT_CITIES[number];

export const RECRUITMENT_GRADES = ["27届", "28届", "29届", "实习"] as const;
export type RecruitmentGrade = typeof RECRUITMENT_GRADES[number];
