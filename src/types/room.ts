export enum RoomType {
    PRIVATE = 'PRIVATE',
    GROUP = 'GROUP',
}

export type RoomResponse = {
    id: string;
    name: string;
    avatar: string;
    description: string;
    type: RoomType;
    createdBy: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    memberCount: number;
    createdAt: string;
    isNew: boolean;
};

export type CreateGroupRoomRequest = {
    name: string;
    memberIds: string[];
    avatar?: string;
    
};

export type UpdateRoomRequest = {
    name?: string;
    avatar?: string;
    description?: string;
};
