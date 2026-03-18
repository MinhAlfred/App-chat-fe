import { MoreVertical, Phone, Video } from 'lucide-react';
import { RoomResponse } from '../../../types/room';
import Avatar from './Avatar';

type Props = {
    room: RoomResponse | null;
    onlineCount?: number;
    onToggleInfo?: () => void;
};

export default function ChatHeader({ room, onlineCount = 0, onToggleInfo }: Props) {
    const isOnline = onlineCount > 0;

    return (
        <header className="h-20 px-6 border-b border-slate-100 flex items-center justify-between glass-effect sticky top-0 z-10">
            <div className="flex items-center gap-4 min-w-0">
                <Avatar
                    name={room?.name || 'R'}
                    src={room?.avatar}
                    online={isOnline}
                    size="md"
                />
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 leading-tight truncate">
                        {room?.name || 'Select a conversation'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">
                        {room?.type === 'GROUP'
                            ? isOnline
                                ? `${room.memberCount} members · ${onlineCount} online`
                                : `${room.memberCount} members`
                            : isOnline
                                ? 'Online'
                                : ''}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
                    title="Voice Call"
                    type="button"
                >
                    <Phone className="h-5 w-5" />
                </button>
                <button
                    className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
                    title="Video Call"
                    type="button"
                >
                    <Video className="h-5 w-5" />
                </button>
                <button
                    className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                    title="Room Info"
                    type="button"
                    onClick={onToggleInfo}
                >
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
