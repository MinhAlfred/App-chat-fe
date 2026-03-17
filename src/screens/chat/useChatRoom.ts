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
    handleRoomLeft: (roomId: string) => void;
    handleRoomDeleted: (roomId: string) => void;
    handleRoomInfoUpdated: (room: RoomResponse) => void;
    memberVersion: number;
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
    // increments on every member event → tells RoomInfoPanel to re-fetch its member list
    const [memberVersion, setMemberVersion] = useState(0);

    const messageListRef = useRef<HTMLElement | null>(null);
    const connectionRef = useRef<ChatConnection | null>(null);
    // tracks which roomIds are currently subscribed (avoids double-subscribe)
    const subscribedRoomIdsRef = useRef<Set<string>>(new Set());
    // always holds the latest selectedRoom without causing subscription re-runs
    const selectedRoomRef = useRef<RoomResponse | null>(null);
    // mirrors rooms IDs so WS handlers can read without capturing stale state
    const roomIdsRef = useRef<Set<string>>(new Set());
    // always-current handler for user-level room events (avoids stale closure in Effect 1)
    const userRoomEventHandlerRef = useRef<(event: RawWsEvent) => void>(() => undefined);

    // Keep refs in sync with state
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    useEffect(() => {
        roomIdsRef.current = new Set(rooms.map((r) => r.id));
    }, [rooms]);

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
                .then((r) => {
                    if (!r.data) return;
                    setRooms(r.data);
                    const updated = r.data.find((room) => room.id === selectedRoomRef.current?.id);
                    if (updated) setSelectedRoom(updated);
                })
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

                    // Room unknown → fetch updated list (side-effect outside updater)
                    if (!roomIdsRef.current.has(message.roomId)) {
                        log('Unknown room, refreshing list', message.roomId);
                        void refreshRooms();
                        return;
                    }

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

                    setRooms((prev) =>
                        prev.map((r) =>
                            r.id === message.roomId
                                ? {
                                      ...r,
                                      lastMessage: message.content,
                                      lastMessageAt: message.createdAt,
                                      unreadCount: isActiveRoom ? 0 : r.unreadCount + 1,
                                  }
                                : r,
                        ),
                    );
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
            setMemberVersion((v) => v + 1);
        },
        [refreshRooms],
    );

    const handleRoomEvent = useCallback(
        (event: RawWsEvent) => {
            log('Room event', event);
            const ev = event as Record<string, unknown>;
            const deletedId =
                (ev.eventType === 'ROOM_DELETED' || ev.type === 'ROOM_DELETED') && typeof ev.roomId === 'string'
                    ? (ev.roomId as string)
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
            onUserRoomEvent: (event) => userRoomEventHandlerRef.current(event),
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

    // ─── Effect 3: Polling fallback for new room discovery ─────────────────
    // Catches rooms created by others when user-level WS push is unavailable

    useEffect(() => {
        const POLL_INTERVAL = 30_000;
        const timer = window.setInterval(() => void refreshRooms(), POLL_INTERVAL);
        return () => window.clearInterval(timer);
    }, [refreshRooms]);

    // ─── Room management callbacks ──────────────────────────────────────────

    const handleRoomLeft = useCallback((roomId: string) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        if (selectedRoomRef.current?.id === roomId) {
            setSelectedRoom(null);
            setMessages([]);
        }
    }, []);

    const handleRoomDeleted = useCallback((roomId: string) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        if (selectedRoomRef.current?.id === roomId) {
            setSelectedRoom(null);
            setMessages([]);
        }
    }, []);

    const handleRoomInfoUpdated = useCallback((room: RoomResponse) => {
        setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, ...room } : r)));
        if (selectedRoomRef.current?.id === room.id) {
            setSelectedRoom((prev) => (prev ? { ...prev, ...room } : prev));
        }
    }, []);

    // Keep the user-room event handler ref current so Effect 1 never needs to re-run
    userRoomEventHandlerRef.current = (event: RawWsEvent) => {
        const ev = event as Record<string, unknown>;
        const eventType = ev.eventType as string | undefined;
        const roomId = ev.roomId as string | undefined;
        log('User room event', eventType, roomId);

        switch (eventType) {
            case 'MEMBER_REMOVED':
            case 'MEMBER_LEFT':
                // Current user was kicked or left — remove room from list
                if (roomId) handleRoomLeft(roomId);
                return;
            case 'ROOM_CREATED':
            case 'MEMBER_ADDED':
            default:
                // New room or added to existing room — refresh list
                void refreshRooms();
        }
    };

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
        handleRoomLeft,
        handleRoomDeleted,
        handleRoomInfoUpdated,
        memberVersion,
    };
};
