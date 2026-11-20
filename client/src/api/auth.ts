import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type { LoginRequest, LoginResponse } from '@shared/app-user';

export async function loginAppUser(body: LoginRequest): Promise<LoginResponse> {
  const response = await axiosForBackend.post<LoginResponse>(
    '/api/auth/login',
    body,
  );
  return response.data;
}
