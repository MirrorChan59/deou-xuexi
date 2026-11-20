import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  Recruitment,
  RecruitmentListResponse,
  RecruitmentFiltersResponse,
} from '@shared/recruitment';

export interface ListRecruitmentsParams {
  keyword?: string;
  function?: string;
  city?: string;
  targetGrade?: string;
  sort?: 'latest' | 'oldest';
}

export async function listRecruitments(
  params?: ListRecruitmentsParams,
): Promise<Recruitment[]> {
  try {
    const response = await axiosForBackend.get<RecruitmentListResponse>(
      '/api/recruitments',
      { params },
    );
    return response.data.items;
  } catch (error) {
    logger.error('获取校招投递列表失败', error);
    throw error;
  }
}

export async function getRecruitmentFilters(): Promise<RecruitmentFiltersResponse> {
  const response = await axiosForBackend.get<RecruitmentFiltersResponse>(
    '/api/recruitments/filters',
  );
  return response.data;
}
