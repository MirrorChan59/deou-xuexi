import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { InterviewQuestionListResponse } from '@shared/interview';

export async function fetchInterviewQuestions(): Promise<InterviewQuestionListResponse> {
  const response = await axiosForBackend.get<InterviewQuestionListResponse>(
    '/api/interview-questions',
  );
  return response.data;
}

export async function syncInterviewQuestions(): Promise<InterviewQuestionListResponse> {
  const response = await axiosForBackend.post<InterviewQuestionListResponse>(
    '/api/interview-questions/sync',
    {},
  );
  return response.data;
}
