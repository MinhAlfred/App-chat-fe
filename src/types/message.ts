export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
}

export type MessageReaction = {
    emoji: string;
    count: number;
    reactedByMe: boolean;
};

export type MessageReplyPreview = {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    type: string;
};

export type MessageResponse = {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    type: MessageType;
    content: string;
    mediaUrl: string;
    fileName: string;
    fileSize: number;
    replyToId: string;
    replyTo: MessageReplyPreview | null;
    reactions: MessageReaction[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
};

export type SendMessageRequest = {
    roomId: string;
    type: MessageType;
    content?: string | null;
    mediaUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    replyToId?: string | null;
};

export type AddReactionRequest = {
    emoji: string;
};
