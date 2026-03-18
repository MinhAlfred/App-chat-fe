import { FormEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getConversationDetail,
    getConversationList,
    getConversationMembers,
    readConversation,
    sendTextMessage,
    sendFileToConversation,
} from '../../api/chat-api';
import { getAccessToken } from '../../auth/session';
import { getAllOnlineUserIds, getMe } from '../../api/users-api';
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
    isLoadingMoreMessages: boolean;
    hasMoreMessages: boolean;
    isSending: boolean;
    errorMessage: string;
    myUserId: string | null;
    myAvatar: string | null;
    onlineUserIds: ReadonlySet<string>;
    onlineByRoom: ReadonlyMap<string, ReadonlySet<string>>;
    messageListRef: RefObject<HTMLElement | null>;
    replyTo: MessageResponse | null;
    setReplyTo: (msg: MessageResponse | null) => void;
    setSearchKeyword: (v: string) => void;
    setMessageInput: (v: string) => void;
    handleSelectRoom: (room: RoomResponse) => Promise<void>;
    handleSendMessage: (e: FormEvent) => Promise<void>;
    handleSendFile: (file: File) => Promise<void>;
    handleLoadMoreMessages: () => Promise<void>;
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
    const [messageCursor, setMessageCursor] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [replyTo, setReplyTo] = useState<MessageResponse | null>(null);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const [myAvatar, setMyAvatar] = useState<string | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [onlineByRoom, setOnlineByRoom] = useState<Map<string, Set<string>>>(new Map());

    // connectionKey increments when STOMP reconnects → triggers room subscription effect
    const [connectionKey, setConnectionKey] = useState(0);
    // increments on every member event → tells RoomInfoPanel to re-fetch its member list
    const [memberVersion, setMemberVersion] = useState(0);

    const messageListRef = useRef<HTMLElement | null>(null);
    // true when messages were appended (new msg / room load) → auto-scroll to bottom
    // false when messages were prepended (load more) → preserve scroll position
    const shouldScrollToBottomRef = useRef(true);
    const connectionRef = useRef<ChatConnection | null>(null);
    const myUserIdRef = useRef<string | null>(null);
    // tracks which roomIds are currently subscribed (avoids double-subscribe)
    const subscribedRoomIdsRef = useRef<Set<string>>(new Set());
    // always holds the latest selectedRoom without causing subscription re-runs
    const selectedRoomRef = useRef<RoomResponse | null>(null);
    // mirrors rooms IDs so WS handlers can read without capturing stale state
    const roomIdsRef = useRef<Set<string>>(new Set());
    // always-current handler for user-level room events (avoids stale closure in Effect 1)
    const userRoomEventHandlerRef = useRef<(event: RawWsEvent) => void>(() => undefined);
    // roomId → member userId set, populated by seedAllPresence for sidebar online derivation
    const roomMembersRef = useRef<Map<string, Set<string>>>(new Map());
    // debounce timer for readConversation — batches rapid incoming messages into one API call
    const readDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleReadConversation = useCallback((roomId: string) => {
        if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
        readDebounceRef.current = setTimeout(() => {
            void readConversation(roomId);
            readDebounceRef.current = null;
        }, 1500);
    }, []);

    const flushReadConversation = useCallback((roomId: string) => {
        if (readDebounceRef.current) {
            clearTimeout(readDebounceRef.current);
            readDebounceRef.current = null;
        }
        void readConversation(roomId);
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    useEffect(() => {
        roomIdsRef.current = new Set(rooms.map((r) => r.id));
    }, [rooms]);

    useEffect(() => {
        getMe()
            .then((me) => { setMyUserId(me.id); setMyAvatar(me.avatar ?? null); })
            .catch(() => setMyUserId(null));
    }, []);

    useEffect(() => {
        myUserIdRef.current = myUserId;
    }, [myUserId]);

    useEffect(() => {
        if (!messageListRef.current || !shouldScrollToBottomRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [messages, selectedRoom?.id]);

    // ─── Seed initial presence for all known rooms ─────────────────────────
    // Called once after rooms load. Fetches all online IDs + all room member
    // lists in parallel, then populates onlineUserIds and onlineByRoom.

    const seedAllPresence = async (roomIds: string[]) => {
        try {
            const [onlineIds, ...memberPages] = await Promise.all([
                getAllOnlineUserIds().catch((): string[] => []),
                ...roomIds.map((rid) =>
                    getConversationMembers(rid, 0, 100).catch(() => ({ content: [] })),
                ),
            ]);

            // Always build the member map so ONLINE events can use it as a fallback
            // even when no one is currently online (early-return would leave it empty)
            const memberMap = new Map<string, Set<string>>();
            roomIds.forEach((rid, i) => {
                const allMemberIds = (memberPages[i]?.content ?? []).map((m) => m.userId);
                memberMap.set(rid, new Set(allMemberIds));
            });
            roomMembersRef.current = memberMap;

            if (onlineIds.length === 0) return;

            const onlineSet = new Set(onlineIds);
            setOnlineUserIds(onlineSet);

            const onlineMap = new Map<string, Set<string>>();
            memberMap.forEach((members, rid) => {
                const onlineInRoom = [...members].filter((uid) => onlineSet.has(uid));
                if (onlineInRoom.length > 0) onlineMap.set(rid, new Set(onlineInRoom));
            });
            setOnlineByRoom(() => onlineMap);
        } catch {
            // non-critical
        }
    };

    // ─── Load conversation detail ───────────────────────────────────────────

    const loadConversation = async (roomId: string) => {
        setIsLoadingMessages(true);
        setErrorMessage('');
        shouldScrollToBottomRef.current = true;
        try {
            const detail = await getConversationDetail(roomId);
            setSelectedRoom(detail.room);
            setMessages(detail.messages.data || []);
            setMessageCursor(detail.messages.nextCursor);
            setHasMoreMessages(detail.messages.hasMore);
            flushReadConversation(roomId);
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

    const handleLoadMoreMessages = async () => {
        const roomId = selectedRoomRef.current?.id;
        if (!roomId || !hasMoreMessages || isLoadingMoreMessages || !messageCursor) return;

        setIsLoadingMoreMessages(true);
        shouldScrollToBottomRef.current = false;

        // Save scroll position before prepending
        const list = messageListRef.current;
        const prevScrollHeight = list?.scrollHeight ?? 0;

        try {
            const result = await getConversationDetail(roomId, messageCursor);
            const older = result.messages.data ?? [];
            setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const dedupedOlder = older.filter((m) => !existingIds.has(m.id));
                return [...dedupedOlder, ...prev];
            });
            setMessageCursor(result.messages.nextCursor);
            setHasMoreMessages(result.messages.hasMore);

            // Restore scroll position after DOM update
            requestAnimationFrame(() => {
                if (!list) return;
                list.scrollTop = list.scrollHeight - prevScrollHeight;
            });
        } catch {
            // silently ignore — user can retry by scrolling up again
        } finally {
            setIsLoadingMoreMessages(false);
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

                // Seed presence for all rooms in parallel with conversation load
                void seedAllPresence(items.map((r) => r.id));

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
            const created = await sendTextMessage(selectedRoom.id, messageInput.trim(), replyTo?.id);
            setMessages((prev) => [...prev, created]);
            setMessageInput('');
            setReplyTo(null);
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

    const handleSendFile = async (file: File) => {
        if (!selectedRoom || isSending) return;

        setIsSending(true);
        setErrorMessage('');
        try {
            const created = await sendFileToConversation(selectedRoom.id, file, replyTo?.id);
            setMessages((prev) => [...prev, created]);
            setReplyTo(null);
            setRooms((prev) =>
                prev.map((r) =>
                    r.id === selectedRoom.id
                        ? { ...r, lastMessage: created.fileName ?? created.content, lastMessageAt: created.createdAt }
                        : r,
                ),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Gửi file thất bại.');
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
                    const fetched = r.data;
                    const fetchedMap = new Map(fetched.map((room) => [room.id, room]));

                    // Merge: update rooms that exist in the fetch, keep rooms that don't
                    // (avoids rooms disappearing due to pagination when refreshing)
                    const activeRoomId = selectedRoomRef.current?.id;
                    setRooms((prev) => {
                        const merged = prev.map((room) => {
                            const fromServer = fetchedMap.get(room.id);
                            if (!fromServer) return room;
                            // Active room: user is currently reading it → unread is always 0.
                            // Server may return stale count if readConversation hasn't been
                            // committed yet — client is authoritative here.
                            if (room.id === activeRoomId) return { ...fromServer, unreadCount: 0 };
                            return fromServer;
                        });
                        const existingIds = new Set(prev.map((r) => r.id));
                        const added = fetched.filter((room) => !existingIds.has(room.id));
                        return [...merged, ...added];
                    });

                    const updated = fetchedMap.get(activeRoomId ?? '');
                    if (updated) setSelectedRoom({ ...updated, unreadCount: 0 });
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
                        scheduleReadConversation(message.roomId);
                    }

                    setRooms((prev) =>
                        prev.map((r) =>
                            r.id === message.roomId
                                ? {
                                    ...r,
                                    lastMessage: message.content ?? r.lastMessage,
                                    lastMessageAt: message.createdAt ?? (message as unknown as Record<string, string>).occurredAt ?? r.lastMessageAt,
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
                    const { messageId, reactions, reactorUserId, reactorEmoji, removed } = parsed;
                    setMessages((prev) =>
                        prev.map((m) => {
                            if (m.id !== messageId) return m;

                            const isMyReactionEvent = myUserIdRef.current === reactorUserId;

                            // reactionSummary is the authoritative POST-action state — use it directly.
                            // Assign reactedByMe: my current emoji is reactorEmoji (unless removed).
                            const myEmoji = isMyReactionEvent
                                ? (removed ? null : reactorEmoji)
                                : m.reactions?.find((r) => r.reactedByMe)?.emoji ?? null;

                            const merged = reactions.map((r) => ({
                                ...r,
                                reactedByMe: r.emoji === myEmoji,
                            }));

                            return { ...m, reactions: merged };
                        }),
                    );
                    return;
                }
                case 'ONLINE': {
                    const { userId, roomIds } = parsed;
                    setOnlineUserIds((prev) => new Set([...prev, userId]));
                    setOnlineByRoom((prev) => {
                        const next = new Map(prev);
                        // Use roomIds from event if provided, otherwise fall back to rooms
                        // where we know the member list and the user is a member.
                        const knownRooms = roomIds.length > 0
                            ? roomIds.filter((rid) => roomIdsRef.current.has(rid))
                            : [...roomMembersRef.current.entries()]
                                .filter(([, members]) => members.has(userId))
                                .map(([rid]) => rid);
                        knownRooms.forEach((rid) => {
                            const set = new Set(next.get(rid) ?? []);
                            set.add(userId);
                            next.set(rid, set);
                        });
                        return next;
                    });
                    return;
                }
                case 'OFFLINE': {
                    const { userId } = parsed;
                    setOnlineUserIds((prev) => {
                        const next = new Set(prev);
                        next.delete(userId);
                        return next;
                    });
                    // Remove from every room — user is offline globally.
                    // Don't rely on roomIds from the event; it may be empty or incomplete.
                    setOnlineByRoom((prev) => {
                        let changed = false;
                        const next = new Map(prev);
                        next.forEach((set, rid) => {
                            if (set.has(userId)) {
                                changed = true;
                                const updated = new Set(set);
                                updated.delete(userId);
                                if (updated.size === 0) next.delete(rid);
                                else next.set(rid, updated);
                            }
                        });
                        return changed ? next : prev;
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
        [scheduleReadConversation],
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
                    onPresenceEvent: handleWsEvent,
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
        const eventType = (ev.eventType ?? ev.type) as string | undefined;
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
        isLoadingMoreMessages,
        hasMoreMessages,
        isSending,
        errorMessage,
        myUserId,
        myAvatar,
        onlineUserIds,
        onlineByRoom,
        messageListRef,
        setSearchKeyword,
        setMessageInput,
        replyTo,
        setReplyTo,
        handleSelectRoom,
        handleSendMessage,
        handleSendFile,
        handleLoadMoreMessages,
        handleRoomLeft,
        handleRoomDeleted,
        handleRoomInfoUpdated,
        memberVersion,
    };
};
