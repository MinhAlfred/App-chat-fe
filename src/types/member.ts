export enum MemberRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

export type RoomMemberResponse = {
    id: string;
    roomId: string;
    userId: string;
    displayName: string;
    avatar: string;
    role: MemberRole;
    joinedAt: string;
    lastReadAt: string;
};

export type AddMembersRequest = {
    userIds: string[];
};
