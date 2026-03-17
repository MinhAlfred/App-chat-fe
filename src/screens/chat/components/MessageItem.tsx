import { Forward, Reply } from 'lucide-react';
import { MessageResponse } from '../../../types/message';
import { formatTime } from '../utils';
import Avatar from './Avatar';

type Props = {
    message: MessageResponse;
    isMine: boolean;
    isSenderOnline: boolean;
    onForward: (message: MessageResponse) => void;
    onReply: (message: MessageResponse) => void;
};

export default function MessageItem({ message, isMine, isSenderOnline, onForward, onReply }: Props) {
    return (
        <div className={`group flex items-end gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
            <Avatar name={message.senderName} online={isSenderOnline} size="sm" />

            <div className="relative">
                {!isMine && (
                    <p className="text-xs font-semibold text-slate-500 mb-1 ml-1">{message.senderName}</p>
                )}
                <div
                    className={`relative p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                        isMine
                            ? 'bg-blue-600 text-white rounded-br-none border-blue-600'
                            : 'bg-white text-slate-700 rounded-bl-none border-slate-100'
                    }`}
                >
                    {message.replyTo && (
                        <div className={`mb-2 px-3 py-2 rounded-xl text-xs border-l-2 ${isMine ? 'bg-blue-500/40 border-white/60 text-blue-100' : 'bg-slate-100 border-slate-400 text-slate-500'}`}>
                            <p className="font-semibold mb-0.5">{message.replyTo.senderName}</p>
                            <p className="truncate">{message.replyTo.content}</p>
                        </div>
                    )}
                    {message.content || '[No content]'}
                    <span
                        className={`pointer-events-none absolute -bottom-6 ${isMine ? 'right-0' : 'left-0'} whitespace-nowrap rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                    >
                        {formatTime(message.createdAt)}
                    </span>
                </div>

                {/* Action buttons — float outside the bubble, no layout impact */}
                <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? '-left-16' : '-right-16'}`}>
                    <button
                        className="p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Reply"
                        onClick={() => onReply(message)}
                        type="button"
                    >
                        <Reply className="h-3.5 w-3.5" />
                    </button>
                    <button
                        className="p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Forward"
                        onClick={() => onForward(message)}
                        type="button"
                    >
                        <Forward className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
