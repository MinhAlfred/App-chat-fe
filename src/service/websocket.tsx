import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type WsEvent = Record<string, unknown> & {
    type?: string;
};

type SetupChatOptions = {
    roomId: string;
    token: string;
    userId?: string;
    presenceUserId?: string;
    onMessageEvent: (event: WsEvent) => void;
    onMemberEvent?: (event: WsEvent) => void;
    onRoomEvent?: (event: WsEvent) => void;
    onPresenceEvent?: (event: WsEvent) => void;
    onError?: (message: string) => void;
    wsUrl?: string;
    debug?: boolean;
    reconnectDelay?: number;
    heartbeatIntervalMs?: number;
};

const parsePayload = (raw: string): WsEvent => {
    if (!raw || !raw.trim()) {
        return { rawBody: raw, parseError: 'EMPTY_BODY' };
    }

    try {
        const parsed = JSON.parse(raw) as unknown;

        if (typeof parsed === 'string') {
            try {
                const parsedAgain = JSON.parse(parsed) as unknown;
                if (parsedAgain && typeof parsedAgain === 'object') {
                    return parsedAgain as WsEvent;
                }

                return { value: parsedAgain, rawBody: raw };
            } catch {
                return { value: parsed, rawBody: raw };
            }
        }

        if (parsed && typeof parsed === 'object') {
            return parsed as WsEvent;
        }

        return { value: parsed, rawBody: raw };
    } catch {
        return { value: raw, rawBody: raw, parseError: 'INVALID_JSON' };
    }
};

export const setupChat = ({
    roomId,
    token,
    userId,
    presenceUserId,
    onMessageEvent,
    onMemberEvent,
    onRoomEvent,
    onPresenceEvent,
    onError,
    wsUrl = 'http://localhost:3000/ws',
    debug = false,
    reconnectDelay = 5000,
    heartbeatIntervalMs = 20000,
}: SetupChatOptions) => {
    const wsEndpoint = new URL(wsUrl, window.location.origin);
    wsEndpoint.searchParams.set('token', token);
    const socket = new SockJS(wsEndpoint.toString());
    const connectHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
    };

    if (userId) {
        connectHeaders['X-User-Id'] = userId;
    }

    let heartbeatTimer: number | null = null;

    const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders,
        reconnectDelay,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        debug: (log) => {
            if (debug) {
                console.log(log);
            }
        },
        onConnect: () => {
            stompClient.subscribe(`/topic/room/${roomId}/queue/messages`, (message) => {
                onMessageEvent(parsePayload(message.body));
            });

            if (onMemberEvent) {
                stompClient.subscribe(`/topic/room/${roomId}/queue/members`, (message) => {
                    onMemberEvent(parsePayload(message.body));
                });
            }

            if (onRoomEvent) {
                stompClient.subscribe(`/topic/room/${roomId}/queue/rooms`, (message) => {
                    onRoomEvent(parsePayload(message.body));
                });
            }

            if (onPresenceEvent && presenceUserId) {
                stompClient.subscribe(`/topic/presence/${presenceUserId}`, (message) => {
                    onPresenceEvent(parsePayload(message.body));
                });
            }

            if (heartbeatTimer) {
                window.clearInterval(heartbeatTimer);
            }

            heartbeatTimer = window.setInterval(() => {
                if (stompClient.connected) {
                    stompClient.publish({ destination: '/app/heartbeat' });
                }
            }, heartbeatIntervalMs);
        },
        onStompError: (frame) => {
            const message = frame.headers.message || 'Unknown STOMP error';
            if (onError) {
                onError(message);
                return;
            }
            console.error(`Broker reported error: ${message}`);
        },
        onWebSocketError: () => {
            if (onError) {
                onError('WebSocket connection error');
                return;
            }
            console.error('WebSocket connection error');
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
        client: stompClient,
        disconnect: () => {
            if (heartbeatTimer) {
                window.clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
            void stompClient.deactivate();
        },
    };
};