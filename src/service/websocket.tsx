import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type SetupChatOptions = {
    roomId: string;
    token: string;
    userId?: string;
    onNewMessage: (payload: unknown) => void;
    onMemberChange: (payload: unknown) => void;
    onRoomChange?: (payload: unknown) => void;
    onError?: (message: string) => void;
    wsUrl?: string;
    debug?: boolean;
};

const parsePayload = (raw: string): unknown => {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
};

export const setupChat = ({
    roomId,
    token,
    userId,
    onNewMessage,
    onMemberChange,
    onRoomChange,
    onError,
    wsUrl = 'http://localhost:3000/ws',
    debug = false,
}: SetupChatOptions) => {
    const socket = new SockJS(wsUrl);
    const connectHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
    };

    if (userId) {
        connectHeaders['X-User-Id'] = userId;
    }

    const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders,
        debug: (log) => {
            if (debug) {
                console.log(log);
            }
        },
        onConnect: () => {
            stompClient.subscribe(`/topic/room/${roomId}/queue/messages`, (message) => {
                onNewMessage(parsePayload(message.body));
            });

            stompClient.subscribe(`/topic/room/${roomId}/queue/members`, (message) => {
                onMemberChange(parsePayload(message.body));
            });

            stompClient.subscribe(`/topic/room/${roomId}/queue/rooms`, (message) => {
                const payload = parsePayload(message.body);
                if (onRoomChange) {
                    onRoomChange(payload);
                    return;
                }
                onMemberChange(payload);
            });
        },
        onStompError: (frame) => {
            const message = frame.headers.message || 'Unknown STOMP error';
            if (onError) {
                onError(message);
                return;
            }
            console.error(`Broker reported error: ${message}`);
        },
    });

    stompClient.activate();

    return {
        client: stompClient,
        disconnect: () => stompClient.deactivate(),
    };
};