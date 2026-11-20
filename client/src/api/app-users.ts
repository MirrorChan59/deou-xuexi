import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  AppUserDeleteResponse,
  AppUserListResponse,
  AppUserMutationResponse,
  CreateAppUserRequest,
  UpdateAppUserRequest,
} from '@shared/app-user';

export async function fetchAppUsers(options?: {
  refresh?: boolean;
}): Promise<AppUserListResponse> {
  const response = await axiosForBackend.get<AppUserListResponse>(
    '/api/app-users',
    {
      params: options?.refresh ? { refresh: 'true' } : undefined,
    },
  );
  return response.data;
}

export async function syncAppUsers(): Promise<AppUserListResponse> {
  const response = await axiosForBackend.post<AppUserListResponse>(
    '/api/app-users/sync',
    {},
  );
  return response.data;
}

export async function createAppUser(
  body: CreateAppUserRequest,
): Promise<AppUserMutationResponse> {
  const response = await axiosForBackend.post<AppUserMutationResponse>(
    '/api/app-users',
    body,
  );
  return response.data;
}

export async function updateAppUser(
  id: string,
  body: UpdateAppUserRequest,
): Promise<AppUserMutationResponse> {
  const response = await axiosForBackend.patch<AppUserMutationResponse>(
    `/api/app-users/${id}`,
    body,
  );
  return response.data;
}

export async function deleteAppUser(
  id: string,
): Promise<AppUserDeleteResponse> {
  const response = await axiosForBackend.delete<AppUserDeleteResponse>(
    `/api/app-users/${id}`,
  );
  return response.data;
}
