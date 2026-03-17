import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type RawWsEvent = Record<string, unknown> & { type?: string };

export type RoomHandlers = {
    onMessageEvent: (event: RawWsEvent) => void;
    onMemberEvent?: (event: RawWsEvent) => void;
    onRoomEvent?: (event: RawWsEvent) => void;
};

export type ChatConnection = {
    subscribeRoom: (roomId: string, handlers: RoomHandlers) => void;
    unsubscribeRoom: (roomId: string) => void;
    disconnect: () => void;
};

export type SetupChatOptions = {
    token: string;
    userId?: string;
    presenceUserId?: string;
    onPresenceEvent?: (event: RawWsEvent) => void;
    onError?: (message: string) => void;
    wsUrl?: string;
    debug?: boolean;
    reconnectDelay?: number;
    heartbeatIntervalMs?: number;
};

const parsePayload = (raw: string): RawWsEvent => {
    if (!raw?.trim()) return { rawBody: raw, parseError: 'EMPTY_BODY' };

    try {
        const parsed = JSON.parse(raw) as unknown;

        if (typeof parsed === 'string') {
            try {
                const again = JSON.parse(parsed) as unknown;
                return again && typeof again === 'object'
                    ? (again as RawWsEvent)
                    : { value: again, rawBody: raw };
            } catch {
                return { value: parsed, rawBody: raw };
            }
        }

        return parsed && typeof parsed === 'object'
            ? (parsed as RawWsEvent)
            : { value: parsed, rawBody: raw };
    } catch {
        return { value: raw, rawBody: raw, parseError: 'INVALID_JSON' };
    }
};

export const setupChat = ({
    token,
    userId,
    presenceUserId,
    onPresenceEvent,
    onError,
    wsUrl = 'http://localhost:3000/ws',
    debug = false,
    reconnectDelay = 5000,
    heartbeatIntervalMs = 20000,
}: SetupChatOptions): ChatConnection => {
    // roomId → registered handlers (survives reconnect)
    const roomHandlers = new Map<string, RoomHandlers>();
    // roomId → active STOMP subscriptions
    const activeSubscriptions = new Map<string, StompSubscription[]>();

    let heartbeatTimer: number | null = null;

    const wsEndpoint = new URL(wsUrl, window.location.origin);
    wsEndpoint.searchParams.set('token', token);

    const connectHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (userId) connectHeaders['X-User-Id'] = userId;

    const doSubscribeRoom = (roomId: string, handlers: RoomHandlers) => {
        const subs: StompSubscription[] = [];

        subs.push(
            stompClient.subscribe(`/topic/room/${roomId}/queue/messages`, (msg) =>
                handlers.onMessageEvent(parsePayload(msg.body)),
            ),
        );

        if (handlers.onMemberEvent) {
            subs.push(
                stompClient.subscribe(`/topic/room/${roomId}/queue/members`, (msg) =>
                    handlers.onMemberEvent!(parsePayload(msg.body)),
                ),
            );
        }

        if (handlers.onRoomEvent) {
            subs.push(
                stompClient.subscribe(`/topic/room/${roomId}/queue/rooms`, (msg) =>
                    handlers.onRoomEvent!(parsePayload(msg.body)),
                ),
            );
        }

        activeSubscriptions.set(roomId, subs);
    };

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(wsEndpoint.toString()),
        connectHeaders,
        reconnectDelay,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        debug: (msg) => { if (debug) console.log(msg); },
        onConnect: () => {
            // Re-subscribe all registered rooms after (re)connect
            roomHandlers.forEach((handlers, roomId) => {
                doSubscribeRoom(roomId, handlers);
            });

            if (onPresenceEvent && presenceUserId) {
                stompClient.subscribe(`/topic/presence/${presenceUserId}`, (msg) =>
                    onPresenceEvent(parsePayload(msg.body)),
                );
            }

            if (heartbeatTimer) window.clearInterval(heartbeatTimer);
            heartbeatTimer = window.setInterval(() => {
                if (stompClient.connected) stompClient.publish({ destination: '/app/heartbeat' });
            }, heartbeatIntervalMs);
        },
        onStompError: (frame) => {
            const message = frame.headers.message || 'Unknown STOMP error';
            onError ? onError(message) : console.error('Broker error:', message);
        },
        onWebSocketError: () => {
            onError ? onError('WebSocket connection error') : console.error('WebSocket connection error');
        },
        onWebSocketClose: () => {
            if (heartbeatTimer) {
                window.clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
        },
    });

    stompClient.activate();

    return {
        subscribeRoom: (roomId, handlers) => {
            roomHandlers.set(roomId, handlers);
            if (stompClient.connected) doSubscribeRoom(roomId, handlers);
        },
        unsubscribeRoom: (roomId) => {
            activeSubscriptions.get(roomId)?.forEach((s) => s.unsubscribe());
            activeSubscriptions.delete(roomId);
            roomHandlers.delete(roomId);
        },
        disconnect: () => {
            if (heartbeatTimer) {
                window.clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
            void stompClient.deactivate();
        },
    };
};
