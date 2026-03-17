import { MoreVertical, Phone, Video } from 'lucide-react';
import { RoomResponse } from '../../../types/room';

type Props = {
    room: RoomResponse | null;
};

export default function ChatHeader({ room }: Props) {
    return (
        <header className="h-20 px-6 border-b border-slate-100 flex items-center justify-between glass-effect sticky top-0 z-10">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center flex-shrink-0">
                    {(room?.name || 'R').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 leading-tight truncate">
                        {room?.name || 'Select a conversation'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate">
                        {room?.type === 'GROUP' ? `${room.memberCount} members` : ''}
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
                    title="More Options"
                    type="button"
                >
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
