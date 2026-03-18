import axiosClient from './axios';
import { ApiResponse, PageResponse } from '../types/response';
import {
    ChangePasswordRequest,
    OnlineStatusResponse,
    Role,
    UpdateMyProfileRequest,
    UserResponse,
} from '../types/auth';
import { unwrapApiData, toQueryParams } from './api-utils';

const USERS_BASE = '/users';

export const getMe = async (): Promise<UserResponse> => {
    const response = await axiosClient.get<ApiResponse<UserResponse>>(`${USERS_BASE}/me`);
    return unwrapApiData(response);
};

export const getUserById = async (userId: string): Promise<UserResponse> => {
    const response = await axiosClient.get<ApiResponse<UserResponse>>(`${USERS_BASE}/${userId}`);
    return unwrapApiData(response);
};

export const updateMyProfile = async (payload: UpdateMyProfileRequest): Promise<UserResponse> => {
    const response = await axiosClient.put<ApiResponse<UserResponse>>(`${USERS_BASE}/me`, payload);
    return unwrapApiData(response);
};

export const updateMyAvatar = async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.put<ApiResponse<UserResponse>>(`${USERS_BASE}/me/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return unwrapApiData(response);
};

export const changeMyPassword = async (payload: ChangePasswordRequest): Promise<void> => {
    await axiosClient.put<ApiResponse<null>>(`${USERS_BASE}/me/password`, payload);
};

export const getUserStatus = async (userId: string): Promise<OnlineStatusResponse> => {
    const response = await axiosClient.get<ApiResponse<OnlineStatusResponse>>(`${USERS_BASE}/${userId}/status`);
    return unwrapApiData(response);
};

export const getUsersStatusBatch = async (userIds: string[]): Promise<OnlineStatusResponse[]> => {
    const response = await axiosClient.post<ApiResponse<OnlineStatusResponse[]>>(`${USERS_BASE}/status/batch`, userIds);
    return unwrapApiData(response);
};

export const getAllOnlineUserIds = async (): Promise<string[]> => {
    const response = await axiosClient.get<ApiResponse<string[]>>(`${USERS_BASE}/status/online`);
    return unwrapApiData(response);
};

export const getAdminUsers = async (page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const params = toQueryParams({ page, size });
    const response = await axiosClient.get<ApiResponse<PageResponse<UserResponse>>>(
        `${USERS_BASE}/admin/users?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const banUser = async (userId: string): Promise<void> => {
    await axiosClient.put<ApiResponse<null>>(`${USERS_BASE}/admin/users/${userId}/ban`);
};

export const unbanUser = async (userId: string): Promise<void> => {
    await axiosClient.put<ApiResponse<null>>(`${USERS_BASE}/admin/users/${userId}/unban`);
};

export const updateUserRole = async (userId: string, role: Role): Promise<void> => {
    await axiosClient.put<ApiResponse<null>>(`${USERS_BASE}/admin/users/${userId}/role`, { role });
};

export const search = async (query: string, page = 0, size = 20): Promise<PageResponse<UserResponse>> => {
    const params = toQueryParams({ query, page, size });
    const response = await axiosClient.get<ApiResponse<PageResponse<UserResponse>>>(
        `${USERS_BASE}/search?${params.toString()}`,
    );
    return unwrapApiData(response);
}
