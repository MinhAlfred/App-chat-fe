import axiosClient from './axios';
import { ApiResponse, PageResponse } from '../types/response';
import { AddMembersRequest, MemberRole, RoomMemberResponse } from '../types/member';
import { toQueryParams, unwrapApiData } from './api-utils';

const MEMBERS_BASE = '/members';

export const addMembers = async (roomId: string, payload: AddMembersRequest): Promise<void> => {
    await axiosClient.post<ApiResponse<null>>(`${MEMBERS_BASE}/${roomId}/add`, payload);
};

export const removeMember = async (roomId: string, targetUserId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<null>>(`${MEMBERS_BASE}/${roomId}/${targetUserId}`);
};

export const leaveRoom = async (roomId: string): Promise<void> => {
    await axiosClient.post<ApiResponse<null>>(`${MEMBERS_BASE}/leave/${roomId}`);
};

export const getRoomMembers = async (
    roomId: string,
    page = 0,
    size = 20,
    sort = 'joinedAt,desc',
): Promise<PageResponse<RoomMemberResponse>> => {
    const params = toQueryParams({ page, size, sort });
    const response = await axiosClient.get<ApiResponse<PageResponse<RoomMemberResponse>>>(
        `${MEMBERS_BASE}/${roomId}?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const updateMemberRole = async (roomId: string, targetUserId: string, role: MemberRole): Promise<void> => {
    const params = toQueryParams({ role });
    await axiosClient.put<ApiResponse<null>>(`${MEMBERS_BASE}/${roomId}/${targetUserId}/role?${params.toString()}`);
};
