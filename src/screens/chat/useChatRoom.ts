import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getConversationDetail,
    getConversationList,
    readConversation,
    sendTextMessage,
} from '../../api/chat-api';
import { getAccessToken } from '../../auth/session';
import { getMe } from '../../api/users-api';
import { setupChat } from '../../service/websocket';
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

    const messageListRef = useRef<HTMLElement | null>(null);
    const chatConnectionRef = useRef<ReturnType<typeof setupChat> | null>(null);

    useEffect(() => {
        getMe()
            .then((me) => setMyUserId(me.id))
            .catch(() => setMyUserId(null));
    }, []);

    useEffect(() => {
        if (!messageListRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messages, selectedRoom?.id]);

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

    const handleMessageEvent = (event: RawWsEvent) => {
        log('Event', event);
        const parsed = parseWsEvent(event);
        log('Parsed', parsed);

        if (!parsed) return;

        switch (parsed.eventType) {
            case 'MESSAGE_SENT':
            case 'MESSAGE_FORWARDED': {
                const { message } = parsed;
                setMessages((prev) => {
                    const idx = prev.findIndex((m) => m.id === message.id);
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = message;
                        return next;
                    }
                    return [...prev, message];
                });
                setRooms((prev) =>
                    prev.map((r) =>
                        r.id === message.roomId
                            ? { ...r, lastMessage: message.content, lastMessageAt: message.createdAt, unreadCount: 0 }
                            : r,
                    ),
                );
                return;
            }
            case 'MESSAGE_EDITED': {
                const { messageId, newContent, updatedAt } = parsed;
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageId ? { ...m, content: newContent, updatedAt: updatedAt ?? m.updatedAt } : m,
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
    };

    const refreshRooms = () =>
        getConversationList(undefined, 20)
            .then((r) => r.data && setRooms(r.data))
            .catch(() => undefined);

    useEffect(() => {
        const roomId = selectedRoom?.id;
        const token = getAccessToken();

        chatConnectionRef.current?.disconnect();
        chatConnectionRef.current = null;

        if (!roomId || !token) return;

        const connection = setupChat({
            roomId,
            token,
            userId: myUserId ?? undefined,
            debug: WS_DEBUG,
            onMessageEvent: handleMessageEvent,
            onMemberEvent: (event) => {
                log('Member event', event);
                void refreshRooms();
            },
            onRoomEvent: (event) => {
                log('Room event', event);

                const deletedId =
                    event.type === 'ROOM_DELETED' && typeof (event as Record<string, unknown>).roomId === 'string'
                        ? ((event as Record<string, unknown>).roomId as string)
                        : null;

                if (deletedId) {
                    setRooms((prev) => prev.filter((r) => r.id !== deletedId));
                    if (selectedRoom?.id === deletedId) {
                        setSelectedRoom(null);
                        setMessages([]);
                    }
                    return;
                }

                void refreshRooms();
            },
            onError: (message) => {
                log('Error', message);
                setErrorMessage(message);
            },
        });

        chatConnectionRef.current = connection;

        return () => {
            connection.disconnect();
            if (chatConnectionRef.current === connection) chatConnectionRef.current = null;
        };
    }, [selectedRoom?.id, myUserId]);

    const filteredRooms = useMemo(() => {
        const kw = searchKeyword.trim().toLowerCase();
        return kw ? rooms.filter((r) => r.name?.toLowerCase().includes(kw)) : rooms;
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
