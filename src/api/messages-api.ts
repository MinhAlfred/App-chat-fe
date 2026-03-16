import axiosClient from './axios';
import { ApiResponse, CursorPage } from '../types/response';
import { AddReactionRequest, MessageResponse, SendMessageRequest } from '../types/message';
import { toQueryParams, unwrapApiData } from './api-utils';

const MESSAGES_BASE = '/messages';

export const sendMessage = async (payload: SendMessageRequest): Promise<MessageResponse> => {
    const response = await axiosClient.post<ApiResponse<MessageResponse>>(MESSAGES_BASE, payload);
    return unwrapApiData(response);
};

export const getMessages = async (roomId: string, cursor?: string, limit = 50): Promise<CursorPage<MessageResponse>> => {
    const params = toQueryParams({ roomId, cursor, limit });
    const response = await axiosClient.get<ApiResponse<CursorPage<MessageResponse>>>(
        `${MESSAGES_BASE}?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const editMessage = async (messageId: string, newContent: string): Promise<void> => {
    const params = toQueryParams({ content: newContent });
    await axiosClient.patch<ApiResponse<null>>(`${MESSAGES_BASE}/${messageId}?${params.toString()}`);
};

export const deleteMessage = async (messageId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<null>>(`${MESSAGES_BASE}/${messageId}`);
};

export const forwardMessage = async (messageId: string, targetRoomId: string): Promise<MessageResponse> => {
    const params = toQueryParams({ targetRoomId });
    const response = await axiosClient.post<ApiResponse<MessageResponse>>(
        `${MESSAGES_BASE}/${messageId}/forward?${params.toString()}`,
    );

    return unwrapApiData(response);
};

export const addReaction = async (messageId: string, payload: AddReactionRequest): Promise<void> => {
    await axiosClient.post<ApiResponse<null>>(`${MESSAGES_BASE}/${messageId}/reactions`, payload);
};

export const removeReaction = async (messageId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<null>>(`${MESSAGES_BASE}/${messageId}/reactions`);
};
