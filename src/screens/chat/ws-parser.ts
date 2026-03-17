import { MessageReaction, MessageResponse } from '../../types/message';
import { RawWsEvent, WsEventType, WS_EVENT_TYPES } from './types';

const MESSAGE_CONTENT_TYPES = ['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO'] as const;

const asRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
};

const unwrapJsonNodeLike = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(unwrapJsonNodeLike);

    const record = asRecord(value);
    if (!record) return value;

    if ('_value' in record) return unwrapJsonNodeLike(record._value);

    if ('value' in record && Object.keys(record).length <= 3) return unwrapJsonNodeLike(record.value);

    if ('_children' in record) {
        const children = asRecord(record._children);
        if (children) {
            return Object.fromEntries(Object.entries(children).map(([k, v]) => [k, unwrapJsonNodeLike(v)]));
        }
    }

    return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, unwrapJsonNodeLike(v)]));
};

const getStringValue = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    const unwrapped = unwrapJsonNodeLike(value);
    return typeof unwrapped === 'string' ? unwrapped : null;
};

const resolveEventPayload = (event: RawWsEvent): Record<string, unknown> => {
    const fromPayload = asRecord(unwrapJsonNodeLike(event.payload));
    if (fromPayload) return fromPayload;

    const fromData = asRecord(unwrapJsonNodeLike(event.data));
    if (fromData) return fromData;

    return asRecord(unwrapJsonNodeLike(event)) ?? (event as Record<string, unknown>);
};

const isRawMessagePayload = (payload: Record<string, unknown>): boolean => {
    if (typeof payload.id !== 'string' || typeof payload.roomId !== 'string') return false;
    return typeof payload.type === 'string' && (MESSAGE_CONTENT_TYPES as readonly string[]).includes(payload.type);
};

// ─── Typed parsed event variants ───────────────────────────────────────────

export type ParsedMessageSent = {
    eventType: 'MESSAGE_SENT' | 'MESSAGE_FORWARDED';
    message: MessageResponse;
};

export type ParsedMessageEdited = {
    eventType: 'MESSAGE_EDITED';
    messageId: string;
    newContent: string;
    updatedAt: string | null;
};

export type ParsedMessageDeleted = {
    eventType: 'MESSAGE_DELETED';
    messageId: string;
};

export type ParsedReactionUpdated = {
    eventType: 'REACTION_UPDATED';
    messageId: string;
    reactions: MessageReaction[];
};

export type ParsedPresenceEvent = {
    eventType: 'ONLINE' | 'OFFLINE';
    userId: string;
};

export type ParsedOtherEvent = {
    eventType: WsEventType;
    raw: Record<string, unknown>;
};

export type ParsedWsEvent =
    | ParsedMessageSent
    | ParsedMessageEdited
    | ParsedMessageDeleted
    | ParsedReactionUpdated
    | ParsedPresenceEvent
    | ParsedOtherEvent
    | null;

// ─── Main parser ────────────────────────────────────────────────────────────

export const parseWsEvent = (event: RawWsEvent): ParsedWsEvent => {
    const eventTypeCandidates = [
        getStringValue((event as Record<string, unknown>).eventType),
        getStringValue(event.type),
    ];
    const eventType =
        (eventTypeCandidates.find(
            (c): c is string => typeof c === 'string' && (WS_EVENT_TYPES as readonly string[]).includes(c),
        ) as WsEventType | undefined) ?? null;

    const payload = resolveEventPayload(event);

    console.log('[WS][Parser] raw event:', event);
    console.log('[WS][Parser] eventType:', eventType);
    console.log('[WS][Parser] payload:', payload);

    const isIncomingMessage =
        eventType === 'MESSAGE_SENT' ||
        eventType === 'MESSAGE_FORWARDED' ||
        (!eventType && isRawMessagePayload(payload));

    if (isIncomingMessage) {
        if (typeof payload.id !== 'string' || typeof payload.roomId !== 'string') return null;
        // Normalize occurredAt (forwarded messages) → createdAt
        if (!payload.createdAt && payload.occurredAt) {
            console.log('[WS][Parser] normalizing occurredAt →', payload.occurredAt);
            payload.createdAt = payload.occurredAt;
        }
        console.log('[WS][Parser] parsed message payload:', payload);
        return { eventType: 'MESSAGE_SENT', message: payload as unknown as MessageResponse };
    }

    if (!eventType) return null;

    switch (eventType) {
        case 'MESSAGE_EDITED': {
            const messageId = typeof payload.messageId === 'string' ? payload.messageId : null;
            const newContent = typeof payload.newContent === 'string' ? payload.newContent : null;
            if (!messageId || newContent === null) return null;
            return {
                eventType: 'MESSAGE_EDITED',
                messageId,
                newContent,
                updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : null,
            };
        }
        case 'MESSAGE_DELETED': {
            const messageId = typeof payload.messageId === 'string' ? payload.messageId : null;
            if (!messageId) return null;
            return { eventType: 'MESSAGE_DELETED', messageId };
        }
        case 'REACTION_UPDATED': {
            const messageId = typeof payload.messageId === 'string' ? payload.messageId : null;
            const reactionSummary = asRecord(payload.reactionSummary);
            if (!messageId || !reactionSummary) return null;
            const reactions: MessageReaction[] = Object.entries(reactionSummary)
                .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
                .map(([emoji, count]) => ({ emoji, count, reactedByMe: false }));
            return { eventType: 'REACTION_UPDATED', messageId, reactions };
        }
        case 'ONLINE':
        case 'OFFLINE': {
            const userId =
                typeof payload.userId === 'string'
                    ? payload.userId
                    : typeof payload.senderId === 'string'
                      ? payload.senderId
                      : null;
            if (!userId) return null;
            return { eventType, userId };
        }
        default:
            return { eventType, raw: payload };
    }
};
