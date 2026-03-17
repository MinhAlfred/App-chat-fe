export const WS_EVENT_TYPES = [
    'MESSAGE_SENT',
    'MESSAGE_EDITED',
    'MESSAGE_DELETED',
    'MESSAGE_FORWARDED',
    'REACTION_UPDATED',
    'MEMBER_ADDED',
    'MEMBER_REMOVED',
    'MEMBER_LEFT',
    'MEMBER_ROLE_CHANGED',
    'ROOM_CREATED',
    'ROOM_UPDATED',
    'ROOM_DELETED',
    'ROOM_READ',
    'ONLINE',
    'OFFLINE',
] as const;

export type WsEventType = (typeof WS_EVENT_TYPES)[number];

// Raw parsed object from STOMP frame body — intentionally loose
export type RawWsEvent = Record<string, unknown> & {
    type?: string;
};
