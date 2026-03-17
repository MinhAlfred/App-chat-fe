import { Forward } from 'lucide-react';
import { MessageResponse } from '../../../types/message';
import { formatTime } from '../utils';
import Avatar from './Avatar';

type Props = {
    message: MessageResponse;
    isMine: boolean;
    isSenderOnline: boolean;
    onForward: (message: MessageResponse) => void;
};

export default function MessageItem({ message, isMine, isSenderOnline, onForward }: Props) {
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
                    {message.content || '[No content]'}
                    <span
                        className={`pointer-events-none absolute -bottom-6 ${isMine ? 'right-0' : 'left-0'} whitespace-nowrap rounded-lg bg-slate-800/80 px-2 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                    >
                        {formatTime(message.createdAt)}
                    </span>
                </div>

                {/* Forward button — floats outside the bubble, no layout impact */}
                <button
                    className={`absolute top-1/2 -translate-y-1/2 ${isMine ? '-left-8' : '-right-8'} p-1.5 rounded-full bg-white shadow border border-slate-100 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity`}
                    title="Forward"
                    onClick={() => onForward(message)}
                    type="button"
                >
                    <Forward className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
