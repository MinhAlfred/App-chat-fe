import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Edit, Phone, Video, MoreVertical, Paperclip, Smile, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Screen } from '../navigation/routes';
import {
    getConversationDetail,
    getConversationList,
    readConversation,
    sendTextMessage,
} from '../api/chat-api';
import { getMe } from '../api/users-api';
import { MessageResponse } from '../types/message';
import { RoomResponse } from '../types/room';

const formatTime = (value?: string) => {
    if (!value) {
        return '--:--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--:--';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const formatDateLabel = (value?: string) => {
    if (!value) {
        return 'No messages';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'No messages';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export default function Chat({ onNavigate }: { onNavigate: (s: Screen) => void }) {
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
    const messageListRef = useRef<HTMLElement | null>(null);

    const filteredRooms = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) {
            return rooms;
        }

        return rooms.filter((room) => room.name?.toLowerCase().includes(keyword));
    }, [rooms, searchKeyword]);

    const sortedMessages = useMemo(() => {
        return [...messages].sort((first, second) => {
            const firstTime = new Date(first.createdAt).getTime();
            const secondTime = new Date(second.createdAt).getTime();

            if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
                return 0;
            }

            return firstTime - secondTime;
        });
    }, [messages]);

    useEffect(() => {
        const loadMe = async () => {
            try {
                const me = await getMe();
                setMyUserId(me.id);
            } catch {
                setMyUserId(null);
            }
        };

        void loadMe();
    }, []);

    useEffect(() => {
        if (!messageListRef.current) {
            return;
        }

        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [sortedMessages, selectedRoom?.id]);

    const loadConversation = async (roomId: string) => {
        setIsLoadingMessages(true);
        setErrorMessage('');

        try {
            const detail = await getConversationDetail(roomId);
            setSelectedRoom(detail.room);
            setMessages(detail.messages.data || []);
            await readConversation(roomId);
            setRooms((prev) =>
                prev.map((room) => (room.id === roomId ? { ...room, unreadCount: 0, lastMessage: detail.room.lastMessage } : room)),
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không tải được cuộc trò chuyện.';
            setErrorMessage(message);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        const loadRooms = async () => {
            setIsLoadingRooms(true);
            setErrorMessage('');

            try {
                const response = await getConversationList(undefined, 20);
                const roomItems = response.data || [];
                setRooms(roomItems);

                if (!roomItems.length) {
                    setSelectedRoom(null);
                    setMessages([]);
                    return;
                }

                const preferredRoom = roomIdFromUrl
                    ? roomItems.find((room) => room.id === roomIdFromUrl) || roomItems[0]
                    : roomItems[0];

                await loadConversation(preferredRoom.id);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Không tải được danh sách cuộc trò chuyện.';
                setErrorMessage(message);
            } finally {
                setIsLoadingRooms(false);
            }
        };

        void loadRooms();
    }, [roomIdFromUrl]);

    const handleSelectRoom = async (room: RoomResponse) => {
        if (room.id === selectedRoom?.id || isLoadingMessages) {
            return;
        }

        await loadConversation(room.id);
    };

    const handleSendMessage = async (event: FormEvent) => {
        event.preventDefault();
        if (!selectedRoom || !messageInput.trim() || isSending) {
            return;
        }

        setIsSending(true);
        setErrorMessage('');

        try {
            const createdMessage = await sendTextMessage(selectedRoom.id, messageInput.trim());
            setMessages((prev) => [...prev, createdMessage]);
            setMessageInput('');
            setRooms((prev) =>
                prev.map((room) =>
                    room.id === selectedRoom.id
                        ? {
                            ...room,
                            lastMessage: createdMessage.content,
                            lastMessageAt: createdMessage.createdAt,
                        }
                        : room,
                ),
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gửi tin nhắn thất bại.';
            setErrorMessage(message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex h-full w-full max-w-[1600px] mx-auto overflow-hidden bg-white shadow-2xl relative">
            <aside className="w-80 md:w-96 flex flex-col border-r border-slate-100 bg-slate-50/30">
                <div className="p-4 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onNavigate('settings')}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-primary/10 flex items-center justify-center text-primary font-bold">
                                U
                            </div>
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">My Account</h2>
                            <p className="text-xs text-slate-500">Connected</p>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        title="New Chat"
                        onClick={() => onNavigate('contacts')}
                    >
                        <Edit className="h-5 w-5 text-slate-600" />
                    </button>
                </div>

                <div className="px-4 pb-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-slate-400" />
                        </span>
                        <input
                            className="block w-full pl-10 pr-3 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            placeholder="Search messages or people..."
                            type="text"
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value)}
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 space-y-1">
                    {isLoadingRooms && <p className="px-3 py-2 text-sm text-slate-500">Loading conversations...</p>}
                    {!isLoadingRooms && filteredRooms.length === 0 && (
                        <p className="px-3 py-2 text-sm text-slate-500">No conversations found.</p>
                    )}

                    {filteredRooms.map((room) => {
                        const isActive = room.id === selectedRoom?.id;
                        return (
                            <button
                                key={room.id}
                                className={`w-full text-left group flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'hover:bg-slate-100'
                                    }`}
                                onClick={() => void handleSelectRoom(room)}
                                type="button"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                                    {(room.name || 'R').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-slate-800 truncate">{room.name || 'Unnamed room'}</h3>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase">{formatTime(room.lastMessageAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <p className="text-sm text-slate-500 truncate">{room.lastMessage || 'No message yet'}</p>
                                        {room.unreadCount > 0 && (
                                            <span className="ml-2 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-white">
                <header className="h-20 px-6 border-b border-slate-100 flex items-center justify-between glass-effect sticky top-0 z-10">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                            {(selectedRoom?.name || 'R').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 leading-tight truncate">{selectedRoom?.name || 'Select a conversation'}</h3>
                            <p className="text-xs text-slate-500 font-medium truncate">
                                {selectedRoom && selectedRoom.type === 'GROUP' ? `${selectedRoom.memberCount} members` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all" title="Voice Call" type="button">
                            <Phone className="h-5 w-5" />
                        </button>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all" title="Video Call" type="button">
                            <Video className="h-5 w-5" />
                        </button>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all" title="More Options" type="button">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <section ref={messageListRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
                    {isLoadingMessages && <p className="text-sm text-slate-500">Loading messages...</p>}
                    {!isLoadingMessages && !selectedRoom && <p className="text-sm text-slate-500">Chọn cuộc trò chuyện để bắt đầu.</p>}
                    {!isLoadingMessages && selectedRoom && messages.length === 0 && (
                        <p className="text-sm text-slate-500">Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                    )}

                    {!!sortedMessages.length && (
                        <div className="flex items-center gap-4 my-2">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {formatDateLabel(sortedMessages[0]?.createdAt)}
                            </span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                    )}

                    {sortedMessages.map((message) => {
                        const isMine = Boolean(myUserId && message.senderId === myUserId);

                        return (
                            <div
                                key={message.id}
                                className={`flex items-end gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {(message.senderName || 'U').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="relative">
                                    <div
                                        className={`p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${isMine
                                            ? 'bg-blue-600 text-white rounded-br-none border-blue-600'
                                            : 'bg-white text-slate-700 rounded-bl-none border-slate-100'
                                            }`}
                                    >
                                        {message.content || '[No content]'}
                                    </div>
                                    <span className={`text-[10px] text-slate-400 mt-1 block ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                                        {formatTime(message.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <footer className="p-6 bg-white border-t border-slate-100">
                    {errorMessage && <p className="text-sm text-red-500 mb-2">{errorMessage}</p>}
                    <form className="flex items-center gap-4 bg-slate-100/80 p-2 pl-4 rounded-[2rem] focus-within:bg-slate-100 transition-colors" onSubmit={handleSendMessage}>
                        <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Attach file" type="button">
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <input
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-slate-400 outline-none"
                            placeholder="Type a message..."
                            type="text"
                            value={messageInput}
                            onChange={(event) => setMessageInput(event.target.value)}
                            disabled={!selectedRoom || isSending}
                        />
                        <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors" title="Emoji" type="button">
                            <Smile className="h-5 w-5" />
                        </button>
                        <button
                            className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-60"
                            title="Send message"
                            type="submit"
                            disabled={!selectedRoom || !messageInput.trim() || isSending}
                        >
                            <Send className="h-4 w-4 ml-1" />
                        </button>
                    </form>
                </footer>
            </main>
        </div>
    );
}
