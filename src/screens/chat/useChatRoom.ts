import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getConversationDetail,
    getConversationList,
    readConversation,
    sendTextMessage,
} from '../../api/chat-api';
import { getAccessToken } from '../../auth/session';
import { getMe } from '../../api/users-api';
import { ChatConnection, setupChat } from '../../service/websocket';
import { MessageResponse } from '../../types/message';
import { RoomResponse } from '../../types/room';
import { RawWsEvent } from './types';
import { parseWsEvent } from './ws-parser';

const WS_DEBUG = true;

const log = (...args: unknown[]) => {
    if (WS_DEBUG) console.log('[WS][Chat]', ...args);
};

export type UseChatRoomReturn = {
    rooms: RoomResponse[];
    selectedRoom: RoomResponse | null;
    filteredRooms: RoomResponse[];
    sortedMessages: MessageResponse[];
    searchKeyword: string;
    messageInput: string;
    isLoadingRooms: boolean;
    isLoadingMessages: boolean;
    isSending: boolean;
    errorMessage: string;
    myUserId: string | null;
    onlineUserIds: ReadonlySet<string>;
    messageListRef: React.RefObject<HTMLElement | null>;
    setSearchKeyword: (v: string) => void;
    setMessageInput: (v: string) => void;
    handleSelectRoom: (room: RoomResponse) => Promise<void>;
    handleSendMessage: (e: FormEvent) => Promise<void>;
};

export const useChatRoom = (): UseChatRoomReturn => {
    const [searchParams] = useSearchParams();
    const roomIdFromUrl = searchParams.get('roomId');

    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    // connectionKey increments when STOMP reconnects → triggers room subscription effect
    const [connectionKey, setConnectionKey] = useState(0);

    const messageListRef = useRef<HTMLElement | null>(null);
    const connectionRef = useRef<ChatConnection | null>(null);
    // tracks which roomIds are currently subscribed (avoids double-subscribe)
    const subscribedRoomIdsRef = useRef<Set<string>>(new Set());
    // always holds the latest selectedRoom without causing subscription re-runs
    const selectedRoomRef = useRef<RoomResponse | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    useEffect(() => {
        getMe()
            .then((me) => setMyUserId(me.id))
            .catch(() => setMyUserId(null));
    }, []);

    useEffect(() => {
        if (!messageListRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messages, selectedRoom?.id]);

    // ─── Load conversation detail ───────────────────────────────────────────

    const loadConversation = async (roomId: string) => {
        setIsLoadingMessages(true);
        setErrorMessage('');
        try {
            const detail = await getConversationDetail(roomId);
            setSelectedRoom(detail.room);
            setMessages(detail.messages.data || []);
            await readConversation(roomId);
            setRooms((prev) =>
                prev.map((r) =>
                    r.id === roomId ? { ...r, unreadCount: 0, lastMessage: detail.room.lastMessage } : r,
                ),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Không tải được cuộc trò chuyện.');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // ─── Load initial room list ─────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            setIsLoadingRooms(true);
            setErrorMessage('');
            try {
                const response = await getConversationList(undefined, 20);
                const items = response.data || [];
                setRooms(items);

                if (!items.length) {
                    setSelectedRoom(null);
                    setMessages([]);
                    return;
                }

                const preferred = roomIdFromUrl
                    ? (items.find((r) => r.id === roomIdFromUrl) ?? items[0])
                    : items[0];

                await loadConversation(preferred.id);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error ? error.message : 'Không tải được danh sách cuộc trò chuyện.',
                );
            } finally {
                setIsLoadingRooms(false);
            }
        };

        void load();
    }, [roomIdFromUrl]);

    // ─── User actions ───────────────────────────────────────────────────────

    const handleSelectRoom = async (room: RoomResponse) => {
        if (room.id === selectedRoom?.id || isLoadingMessages) return;
        await loadConversation(room.id);
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !messageInput.trim() || isSending) return;

        setIsSending(true);
        setErrorMessage('');
        try {
            const created = await sendTextMessage(selectedRoom.id, messageInput.trim());
            setMessages((prev) => [...prev, created]);
            setMessageInput('');
            setRooms((prev) =>
                prev.map((r) =>
                    r.id === selectedRoom.id
                        ? { ...r, lastMessage: created.content, lastMessageAt: created.createdAt }
                        : r,
                ),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Gửi tin nhắn thất bại.');
        } finally {
            setIsSending(false);
        }
    };

    // ─── WS event handlers (stable via useCallback + refs) ─────────────────

    const refreshRooms = useCallback(
        () =>
            getConversationList(undefined, 20)
                .then((r) => r.data && setRooms(r.data))
                .catch(() => undefined),
        [],
    );

    const handleWsEvent = useCallback(
        (event: RawWsEvent) => {
            log('Event', event);
            const parsed = parseWsEvent(event);
            log('Parsed', parsed);
            if (!parsed) return;

            switch (parsed.eventType) {
                case 'MESSAGE_SENT':
                case 'MESSAGE_FORWARDED': {
                    // 1. Lấy message ra trước để dùng cho toàn bộ block
                    const { message } = parsed;
                    if (!message) return;

                    const isActiveRoom = message.roomId === selectedRoomRef.current?.id;

                    // 2. Cập nhật tin nhắn nếu đang ở đúng phòng
                    if (isActiveRoom) {
                        setMessages((prev) => {
                            const idx = prev.findIndex((m) => m.id === message.id);
                            if (idx >= 0) {
                                const next = [...prev];
                                next[idx] = message;
                                return next;
                            }
                            return [...prev, message];
                        });
                    }

                    // 3. Cập nhật danh sách phòng (Xử lý unread và room mới)
                    setRooms((prev) => {
                        const roomExists = prev.some(r => r.id === message.roomId);

                        // Nếu phòng chưa có trong danh sách (người mới nhắn hoặc phòng mới tạo)
                        if (!roomExists) {
                            log('Room not found in list, refreshing...');
                            refreshRooms(); // Gọi API tải lại danh sách
                            return prev; // Tạm thời trả về danh sách cũ, refreshRooms sẽ cập nhật lại sau
                        }

                        // Nếu phòng đã có, cập nhật lastMessage và unreadCount như cũ
                        return prev.map((r) =>
                            r.id === message.roomId
                                ? {
                                    ...r,
                                    lastMessage: message.content,
                                    lastMessageAt: message.createdAt,
                                    unreadCount: isActiveRoom ? 0 : r.unreadCount + 1,
                                }
                                : r
                        );
                    });
                    return;
                }
                case 'MESSAGE_EDITED': {
                    const { messageId, newContent, updatedAt } = parsed;
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === messageId
                                ? { ...m, content: newContent, updatedAt: updatedAt ?? m.updatedAt }
                                : m,
                        ),
                    );
                    return;
                }
                case 'MESSAGE_DELETED': {
                    setMessages((prev) => prev.filter((m) => m.id !== parsed.messageId));
                    return;
                }
                case 'REACTION_UPDATED': {
                    const { messageId, reactions } = parsed;
                    setMessages((prev) =>
                        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
                    );
                    return;
                }
                case 'ONLINE': {
                    setOnlineUserIds((prev) => new Set([...prev, parsed.userId]));
                    return;
                }
                case 'OFFLINE': {
                    setOnlineUserIds((prev) => {
                        const next = new Set(prev);
                        next.delete(parsed.userId);
                        return next;
                    });
                    return;
                }
                default:
                    log('Unhandled event', parsed);
            }
        },
        // setMessages/setRooms/setOnlineUserIds are stable — no deps needed
        // selectedRoomRef is a ref — read via .current, no dep needed
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleMemberEvent = useCallback(
        (event: RawWsEvent) => {
            log('Member event', event);
            void refreshRooms();
        },
        [refreshRooms],
    );

    const handleRoomEvent = useCallback(
        (event: RawWsEvent) => {
            log('Room event', event);
            const deletedId =
                event.type === 'ROOM_DELETED' && typeof (event as Record<string, unknown>).roomId === 'string'
                    ? ((event as Record<string, unknown>).roomId as string)
                    : null;

            if (deletedId) {
                setRooms((prev) => prev.filter((r) => r.id !== deletedId));
                if (selectedRoomRef.current?.id === deletedId) {
                    setSelectedRoom(null);
                    setMessages([]);
                }
                return;
            }

            void refreshRooms();
        },
        [refreshRooms],
    );

    // ─── Effect 1: Create STOMP connection ─────────────────────────────────
    // Re-runs only when user identity changes

    useEffect(() => {
        const token = getAccessToken();
        if (!myUserId || !token) return;

        connectionRef.current?.disconnect();
        subscribedRoomIdsRef.current.clear();

        const connection = setupChat({
            token,
            userId: myUserId,
            debug: WS_DEBUG,
            onError: (msg) => {
                log('Error', msg);
                setErrorMessage(msg);
            },
        });

        connectionRef.current = connection;
        setConnectionKey((k) => k + 1); // notify Effect 2 to subscribe rooms

        return () => {
            connection.disconnect();
            connectionRef.current = null;
            subscribedRoomIdsRef.current.clear();
        };
    }, [myUserId]);

    // ─── Effect 2: Subscribe/unsubscribe rooms ──────────────────────────────
    // Re-runs when room list changes OR after a new connection is established

    useEffect(() => {
        const connection = connectionRef.current;
        if (!connection || rooms.length === 0) return;

        const currentIds = new Set(rooms.map((r) => r.id));
        const subscribed = subscribedRoomIdsRef.current;

        // Subscribe newly added rooms
        currentIds.forEach((id) => {
            if (!subscribed.has(id)) {
                connection.subscribeRoom(id, {
                    onMessageEvent: handleWsEvent,
                    onMemberEvent: handleMemberEvent,
                    onRoomEvent: handleRoomEvent,
                });
                subscribed.add(id);
            }
        });

        // Unsubscribe removed rooms
        subscribed.forEach((id) => {
            if (!currentIds.has(id)) {
                connection.unsubscribeRoom(id);
                subscribed.delete(id);
            }
        });
    }, [rooms, connectionKey, handleWsEvent, handleMemberEvent, handleRoomEvent]);

    // ─── Derived state ──────────────────────────────────────────────────────

    const filteredRooms = useMemo(() => {
        const kw = searchKeyword.trim().toLowerCase();
        const list = kw ? rooms.filter((r) => r.name?.toLowerCase().includes(kw)) : rooms;

        // Sort by latest message descending
        return [...list].sort((a, b) => {
            const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return tb - ta;
        });
    }, [rooms, searchKeyword]);

    const sortedMessages = useMemo(
        () =>
            [...messages].sort((a, b) => {
                const ta = new Date(a.createdAt).getTime();
                const tb = new Date(b.createdAt).getTime();
                return Number.isNaN(ta) || Number.isNaN(tb) ? 0 : ta - tb;
            }),
        [messages],
    );

    return {
        rooms,
        selectedRoom,
        filteredRooms,
        sortedMessages,
        searchKeyword,
        messageInput,
        isLoadingRooms,
        isLoadingMessages,
        isSending,
        errorMessage,
        myUserId,
        onlineUserIds,
        messageListRef,
        setSearchKeyword,
        setMessageInput,
        handleSelectRoom,
        handleSendMessage,
    };
};
