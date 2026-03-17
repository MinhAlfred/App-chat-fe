import { RoomResponse } from '../../../types/room';
import { formatTime } from '../utils';
import Avatar from './Avatar';

type Props = {
    room: RoomResponse;
    isActive: boolean;
    online?: boolean;
    onClick: () => void;
};

export default function RoomItem({ room, isActive, online, onClick }: Props) {
    return (
        <button
            className={`w-full text-left flex items-center gap-4 p-3 rounded-2xl transition-all ${
                isActive ? 'bg-white shadow-sm ring-1 ring-slate-100' : 'hover:bg-slate-100'
            }`}
            onClick={onClick}
            type="button"
        >
            <Avatar name={room.name} online={online} size="lg" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-800 truncate">{room.name || 'Unnamed room'}</h3>
                    <span className="text-[10px] font-medium text-slate-400 uppercase flex-shrink-0 ml-2">
                        {formatTime(room.lastMessageAt)}
                    </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-slate-500 truncate">{room.lastMessage || 'No message yet'}</p>
                    {room.unreadCount > 0 && (
                        <span className="flex-shrink-0 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                            {room.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
