import { RefObject, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { MessageResponse } from '../../../types/message';
import { RoomResponse } from '../../../types/room';
import { forwardMessageToConversation } from '../../../api/chat-api';
import { formatDateLabel } from '../utils';
import MessageItem from './MessageItem';
import Avatar from './Avatar';

// ─── Forward modal ────────────────────────────────────────────────────────────

type ForwardModalProps = {
    message: MessageResponse;
    rooms: RoomResponse[];
    onClose: () => void;
};

function ForwardModal({ message, rooms, onClose }: ForwardModalProps) {
    const [query, setQuery] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [doneId, setDoneId] = useState<string | null>(null);

    const filtered = query.trim()
        ? rooms.filter((r) => r.name?.toLowerCase().includes(query.trim().toLowerCase()))
        : rooms;

    const handleForward = async (room: RoomResponse) => {
        if (loadingId || doneId === room.id) return;
        setLoadingId(room.id);
        try {
            await forwardMessageToConversation(message.id, room.id);
            setDoneId(room.id);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-80 flex flex-col max-h-[70vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3">Forward message</h3>
                    <p className="text-xs text-slate-500 mb-3 truncate bg-slate-50 rounded-xl px-3 py-2">
                        "{message.content}"
                    </p>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search conversations…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <ul className="flex-1 overflow-y-auto py-2 px-2">
                    {filtered.map((room) => {
                        const sent = doneId === room.id;
                        const loading = loadingId === room.id;
                        return (
                            <li key={room.id}>
                                <button
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                        sent ? 'opacity-60 cursor-default' : 'hover:bg-slate-50'
                                    }`}
                                    onClick={() => void handleForward(room)}
                                    type="button"
                                    disabled={!!loadingId || sent}
                                >
                                    <Avatar name={room.name} src={room.avatar} size="sm" />
                                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">
                                        {room.name}
                                    </span>
                                    {loading && <span className="text-xs text-slate-400">…</span>}
                                    {sent && <span className="text-xs text-blue-500 font-medium">Sent</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div className="px-5 py-3 border-t border-slate-100">
                    <button
                        className="w-full py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onClose}
                        type="button"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MessageList ──────────────────────────────────────────────────────────────

type Props = {
    messages: MessageResponse[];
    rooms: RoomResponse[];
    isLoading: boolean;
    hasRoom: boolean;
    hasMore: boolean;
    isLoadingMore: boolean;
    myUserId: string | null;
    onlineUserIds: ReadonlySet<string>;
    listRef: RefObject<HTMLElement | null>;
    onReply: (message: MessageResponse) => void;
    onLoadMore: () => void;
};

export default function MessageList({ messages, rooms, isLoading, hasRoom, hasMore, isLoadingMore, myUserId, onlineUserIds, listRef, onReply, onLoadMore }: Props) {
    const [forwardingMessage, setForwardingMessage] = useState<MessageResponse | null>(null);

    const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        if (e.currentTarget.scrollTop === 0 && hasMore && !isLoadingMore) {
            onLoadMore();
        }
    }, [hasMore, isLoadingMore, onLoadMore]);

    return (
        <>
            <section ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
                {isLoadingMore && (
                    <p className="text-center text-xs text-slate-400 py-2">Đang tải thêm...</p>
                )}
                {isLoading && <p className="text-sm text-slate-500">Loading messages...</p>}
                {!isLoading && !hasRoom && (
                    <p className="text-sm text-slate-500">Chọn cuộc trò chuyện để bắt đầu.</p>
                )}
                {!isLoading && hasRoom && messages.length === 0 && (
                    <p className="text-sm text-slate-500">Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                )}

                {messages.length > 0 && (
                    <div className="flex items-center gap-4 my-2">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {formatDateLabel(messages[0]?.createdAt)}
                        </span>
                        <div className="h-px bg-slate-200 flex-1" />
                    </div>
                )}

                {messages.map((message) => {
                    const isMine = Boolean(myUserId && message.senderId === myUserId);
                    return (
                        <MessageItem
                            key={message.id}
                            message={message}
                            isMine={isMine}
                            isSenderOnline={isMine || onlineUserIds.has(message.senderId)}
                            onForward={setForwardingMessage}
                            onReply={onReply}
                        />
                    );
                })}
            </section>

            {forwardingMessage && (
                <ForwardModal
                    message={forwardingMessage}
                    rooms={rooms}
                    onClose={() => setForwardingMessage(null)}
                />
            )}
        </>
    );
}
