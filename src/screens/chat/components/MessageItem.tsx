import { MessageResponse } from '../../../types/message';
import { formatTime } from '../utils';
import Avatar from './Avatar';

type Props = {
    message: MessageResponse;
    isMine: boolean;
    isSenderOnline: boolean;
};

export default function MessageItem({ message, isMine, isSenderOnline }: Props) {
    return (
        <div className={`flex items-end gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
            <Avatar name={message.senderName} online={isSenderOnline} size="sm" />
            <div className="relative">
                <div
                    className={`p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                        isMine
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
}
