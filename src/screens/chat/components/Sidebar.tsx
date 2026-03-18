import { Edit, Search } from 'lucide-react';
import { RoomResponse } from '../../../types/room';
import { Screen } from '../../../navigation/routes';
import RoomItem from './RoomItem';
import Avatar from './Avatar';

type Props = {
    filteredRooms: RoomResponse[];
    selectedRoom: RoomResponse | null;
    isLoadingRooms: boolean;
    searchKeyword: string;
    onSearchChange: (v: string) => void;
    onSelectRoom: (room: RoomResponse) => void;
    onNavigate: (s: Screen) => void;
    onlineByRoom: ReadonlyMap<string, ReadonlySet<string>>;
    myUserId: string | null;
    myAvatar: string | null;
};

export default function Sidebar({
    filteredRooms,
    selectedRoom,
    isLoadingRooms,
    searchKeyword,
    onSearchChange,
    onSelectRoom,
    onNavigate,
    onlineByRoom,
    myUserId,
    myAvatar,
}: Props) {
    return (
        <aside className="w-80 md:w-96 flex flex-col border-r border-slate-100 bg-slate-50/30">
            <div className="p-4 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onNavigate('settings')}
                >
                    <Avatar name="U" src={myAvatar} online size="lg" />
                    <div>
                        <h2 className="font-bold text-slate-800">My Account</h2>
                        <p className="text-xs text-slate-500">Connected</p>
                    </div>
                </div>
                <button
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    title="New Chat"
                    onClick={() => onNavigate('contacts')}
                    type="button"
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
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 space-y-1">
                {isLoadingRooms && <p className="px-3 py-2 text-sm text-slate-500">Loading conversations...</p>}
                {!isLoadingRooms && filteredRooms.length === 0 && (
                    <p className="px-3 py-2 text-sm text-slate-500">No conversations found.</p>
                )}
                {filteredRooms.map((room) => {
                    const roomOnline = onlineByRoom.get(room.id);
                    const hasOnlineOther = roomOnline
                        ? [...roomOnline].some((uid) => uid !== myUserId)
                        : false;
                    return (
                        <RoomItem
                            key={room.id}
                            room={room}
                            isActive={room.id === selectedRoom?.id}
                            online={hasOnlineOther}
                            onClick={() => onSelectRoom(room)}
                        />

                    );
                })}
            </nav>
        </aside>
    );
}
