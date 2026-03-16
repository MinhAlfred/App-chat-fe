import axiosClient from './axios';
import { CursorPage, ApiResponse } from '../types/response';
import { CreateGroupRoomRequest, RoomResponse, UpdateRoomRequest } from '../types/room';
import { toQueryParams, unwrapApiData } from './api-utils';

const ROOMS_BASE = '/rooms';

export const createOrGetPrivateRoom = async (targetUserId: string): Promise<RoomResponse> => {
    const params = toQueryParams({ targetUserId });
    const response = await axiosClient.post<ApiResponse<RoomResponse>>(
        `${ROOMS_BASE}/private?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const createGroupRoom = async (payload: CreateGroupRoomRequest): Promise<RoomResponse> => {
    const response = await axiosClient.post<ApiResponse<RoomResponse>>(`${ROOMS_BASE}/group`, payload);
    return unwrapApiData(response);
};

export const getRoomById = async (roomId: string): Promise<RoomResponse> => {
    const response = await axiosClient.get<ApiResponse<RoomResponse>>(`${ROOMS_BASE}/${roomId}`);
    return unwrapApiData(response);
};

export const getMyRooms = async (cursor?: string, limit = 20): Promise<CursorPage<RoomResponse>> => {
    const params = toQueryParams({ cursor, limit });
    const response = await axiosClient.get<ApiResponse<CursorPage<RoomResponse>>>(
        `${ROOMS_BASE}?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const updateRoom = async (roomId: string, payload: UpdateRoomRequest): Promise<RoomResponse> => {
    const response = await axiosClient.put<ApiResponse<RoomResponse>>(`${ROOMS_BASE}/${roomId}`, payload);
    return unwrapApiData(response);
};

export const deleteRoom = async (roomId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<null>>(`${ROOMS_BASE}/${roomId}`);
};

export const markRoomAsRead = async (roomId: string): Promise<void> => {
    await axiosClient.post<ApiResponse<null>>(`${ROOMS_BASE}/${roomId}/read`);
};

export const joinRoomByInviteCode = async (inviteCode: string): Promise<RoomResponse> => {
    const params = toQueryParams({ inviteCode });
    const response = await axiosClient.post<ApiResponse<RoomResponse>>(`${ROOMS_BASE}/join?${params.toString()}`);
    return unwrapApiData(response);
};

export const resetRoomInviteCode = async (roomId: string): Promise<RoomResponse> => {
    const response = await axiosClient.post<ApiResponse<RoomResponse>>(`${ROOMS_BASE}/${roomId}/invite-code/reset`);
    return unwrapApiData(response);
};
