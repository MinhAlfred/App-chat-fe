import {
    createGroupRoom,
    createOrGetPrivateRoom,
    getMyRooms,
    getRoomById,
    joinRoomByInviteCode,
    markRoomAsRead,
    resetRoomInviteCode,
    updateRoom,
} from './rooms-api';
import {
    addReaction,
    deleteMessage,
    editMessage,
    forwardMessage,
    getMessages,
    removeReaction,
    sendMessage,
} from './messages-api';
import { addMembers, getRoomMembers, leaveRoom, removeMember, updateMemberRole } from './members-api';
import { CursorPage, PageResponse } from '../types/response';
import { MessageResponse, MessageType } from '../types/message';
import { AddMembersRequest, MemberRole, RoomMemberResponse } from '../types/member';
import { CreateGroupRoomRequest, RoomResponse, UpdateRoomRequest } from '../types/room';

export type ConversationDetail = {
    room: RoomResponse;
    messages: CursorPage<MessageResponse>;
};

export const getConversationList = async (cursor?: string, limit = 20): Promise<CursorPage<RoomResponse>> => {
    return getMyRooms(cursor, limit);
};

export const startPrivateConversation = async (targetUserId: string): Promise<RoomResponse> => {
    return createOrGetPrivateRoom(targetUserId);
};

export const createGroupConversation = async (payload: CreateGroupRoomRequest): Promise<RoomResponse> => {
    return createGroupRoom(payload);
};

export const getConversationDetail = async (
    roomId: string,
    cursor?: string,
    limit = 50,
): Promise<ConversationDetail> => {
    const [room, messages] = await Promise.all([getRoomById(roomId), getMessages(roomId, cursor, limit)]);

    return { room, messages };
};

export const sendTextMessage = async (
    roomId: string,
    content: string,
    replyToId?: string,
): Promise<MessageResponse> => {
    return sendMessage({
        roomId,
        type: MessageType.TEXT,
        content,
        replyToId: replyToId || null,
    });
};

export const sendImageMessage = async (
    roomId: string,
    mediaUrl: string,
    content?: string,
    replyToId?: string,
): Promise<MessageResponse> => {
    return sendMessage({
        roomId,
        type: MessageType.IMAGE,
        mediaUrl,
        content: content || null,
        replyToId: replyToId || null,
    });
};

export const sendFileMessage = async (
    roomId: string,
    mediaUrl: string,
    fileName: string,
    fileSize?: number,
    content?: string,
    replyToId?: string,
): Promise<MessageResponse> => {
    return sendMessage({
        roomId,
        type: MessageType.FILE,
        mediaUrl,
        fileName,
        fileSize: fileSize ?? null,
        content: content || null,
        replyToId: replyToId || null,
    });
};

export const updateTextMessage = async (messageId: string, content: string): Promise<void> => {
    await editMessage(messageId, content);
};

export const removeMessage = async (messageId: string): Promise<void> => {
    await deleteMessage(messageId);
};

export const forwardMessageToConversation = async (
    messageId: string,
    targetRoomId: string,
): Promise<MessageResponse> => {
    return forwardMessage(messageId, targetRoomId);
};

export const reactToMessage = async (messageId: string, emoji: string): Promise<void> => {
    await addReaction(messageId, { emoji });
};

export const unreactMessage = async (messageId: string): Promise<void> => {
    await removeReaction(messageId);
};

export const readConversation = async (roomId: string): Promise<void> => {
    await markRoomAsRead(roomId);
};

export const joinConversationByInviteCode = async (inviteCode: string): Promise<RoomResponse> => {
    return joinRoomByInviteCode(inviteCode);
};

export const regenerateInviteCode = async (roomId: string): Promise<RoomResponse> => {
    return resetRoomInviteCode(roomId);
};

export const updateConversation = async (roomId: string, payload: UpdateRoomRequest): Promise<RoomResponse> => {
    return updateRoom(roomId, payload);
};

export const getConversationMembers = async (
    roomId: string,
    page = 0,
    size = 20,
    sort = 'joinedAt,desc',
): Promise<PageResponse<RoomMemberResponse>> => {
    return getRoomMembers(roomId, page, size, sort);
};

export const addConversationMembers = async (roomId: string, payload: AddMembersRequest): Promise<void> => {
    await addMembers(roomId, payload);
};

export const removeConversationMember = async (roomId: string, targetUserId: string): Promise<void> => {
    await removeMember(roomId, targetUserId);
};

export const leaveConversation = async (roomId: string): Promise<void> => {
    await leaveRoom(roomId);
};

export const updateConversationMemberRole = async (
    roomId: string,
    targetUserId: string,
    role: MemberRole,
): Promise<void> => {
    await updateMemberRole(roomId, targetUserId, role);
};
