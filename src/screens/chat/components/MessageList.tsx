import { RefObject } from 'react';
import { MessageResponse } from '../../../types/message';
import { formatDateLabel } from '../utils';
import MessageItem from './MessageItem';

type Props = {
    messages: MessageResponse[];
    isLoading: boolean;
    hasRoom: boolean;
    myUserId: string | null;
    onlineUserIds: ReadonlySet<string>;
    listRef: RefObject<HTMLElement | null>;
};

export default function MessageList({ messages, isLoading, hasRoom, myUserId, onlineUserIds, listRef }: Props) {
    return (
        <section ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
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
                    />
                );
            })}
        </section>
    );
}
