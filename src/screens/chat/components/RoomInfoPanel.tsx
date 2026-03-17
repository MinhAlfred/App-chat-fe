import { useEffect, useRef, useState } from 'react';
import { X, Crown, Shield, User, Pencil, UserPlus, LogOut, Trash2, UserMinus, Check } from 'lucide-react';
import { RoomResponse, RoomType } from '../../../types/room';
import { RoomMemberResponse, MemberRole } from '../../../types/member';
import { UserResponse } from '../../../types/auth';
import {
    addConversationMembers,
    getConversationMembers,
    leaveConversation,
    removeConversationMember,
    updateConversation,
} from '../../../api/chat-api';
import { deleteRoom } from '../../../api/rooms-api';
import { search } from '../../../api/users-api';
import Avatar from './Avatar';

// ─── helpers ────────────────────────────────────────────────────────────────

const roleIcon = (role: MemberRole) => {
    if (role === MemberRole.OWNER) return <Crown className="h-3 w-3 text-yellow-500" />;
    if (role === MemberRole.ADMIN) return <Shield className="h-3 w-3 text-blue-500" />;
    return <User className="h-3 w-3 text-slate-400" />;
};

const roleLabel = (role: MemberRole) => {
    if (role === MemberRole.OWNER) return 'Owner';
    if (role === MemberRole.ADMIN) return 'Admin';
    return 'Member';
};

// ─── sub-components ──────────────────────────────────────────────────────────

type ConfirmDialogProps = {
    title: string;
    description: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
};

function ConfirmDialog({ title, description, confirmLabel, danger, onConfirm, onCancel }: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            await onConfirm();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-base">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2 justify-end">
                    <button
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onCancel}
                        type="button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50`}
                        onClick={() => void handleConfirm()}
                        type="button"
                        disabled={loading}
                    >
                        {loading ? '...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

type EditRoomModalProps = {
    room: RoomResponse;
    onSaved: (room: RoomResponse) => void;
    onCancel: () => void;
};

function EditRoomModal({ room, onSaved, onCancel }: EditRoomModalProps) {
    const [name, setName] = useState(room.name ?? '');
    const [description, setDescription] = useState(room.description ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            const updated = await updateConversation(room.id, { name: name.trim(), description: description.trim() });
            onSaved(updated);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update room');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-base">Edit Room</h3>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
                    <input
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Room name"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
                    <textarea
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                        rows={3}
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2 justify-end">
                    <button
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onCancel}
                        type="button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={() => void handleSave()}
                        type="button"
                        disabled={loading || !name.trim()}
                    >
                        {loading ? '...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}

type AddMembersModalProps = {
    room: RoomResponse;
    existingUserIds: Set<string>;
    onAdded: () => void;
    onCancel: () => void;
};

function AddMembersModal({ room, existingUserIds, onAdded, onCancel }: AddMembersModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserResponse[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setSearching(true);
            search(query.trim())
                .then((page) => setResults(page.content ?? []))
                .catch(() => setResults([]))
                .finally(() => setSearching(false));
        }, 300);
    }, [query]);

    const toggle = (userId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(userId) ? next.delete(userId) : next.add(userId);
            return next;
        });
    };

    const handleAdd = async () => {
        if (!selected.size) return;
        setLoading(true);
        setError('');
        try {
            await addConversationMembers(room.id, { userIds: [...selected] });
            onAdded();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add members');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 flex flex-col gap-4 max-h-[80vh]">
                <h3 className="font-bold text-slate-800 text-base">Add Members</h3>
                <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                <div className="flex-1 overflow-y-auto space-y-1 min-h-[80px]">
                    {searching && <p className="text-xs text-slate-400">Searching…</p>}
                    {!searching && query.trim() && results.length === 0 && (
                        <p className="text-xs text-slate-400">No users found.</p>
                    )}
                    {results.map((u) => {
                        const already = existingUserIds.has(u.id);
                        const isSelected = selected.has(u.id);
                        return (
                            <button
                                key={u.id}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left ${
                                    already
                                        ? 'opacity-40 cursor-not-allowed'
                                        : isSelected
                                          ? 'bg-blue-50 ring-1 ring-blue-200'
                                          : 'hover:bg-slate-50'
                                }`}
                                onClick={() => !already && toggle(u.id)}
                                type="button"
                                disabled={already}
                            >
                                <Avatar name={u.displayName || u.username} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {u.displayName || u.username}
                                    </p>
                                    {already && <p className="text-xs text-slate-400">Already in room</p>}
                                </div>
                                {isSelected && !already && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2 justify-end">
                    <button
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onCancel}
                        type="button"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={() => void handleAdd()}
                        type="button"
                        disabled={loading || selected.size === 0}
                    >
                        {loading ? '...' : `Add ${selected.size > 0 ? `(${selected.size})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── main panel ──────────────────────────────────────────────────────────────

type Modal =
    | { type: 'edit' }
    | { type: 'addMembers' }
    | { type: 'removeMember'; member: RoomMemberResponse }
    | { type: 'leave' }
    | { type: 'delete' };

type Props = {
    room: RoomResponse;
    myUserId: string | null;
    onlineUserIds: ReadonlySet<string>;
    onClose: () => void;
    onRoomLeft: (roomId: string) => void;
    onRoomDeleted: (roomId: string) => void;
    onRoomUpdated: (room: RoomResponse) => void;
    memberVersion: number;
};

export default function RoomInfoPanel({
    room,
    myUserId,
    onlineUserIds,
    onClose,
    onRoomLeft,
    onRoomDeleted,
    onRoomUpdated,
    memberVersion,
}: Props) {
    const [members, setMembers] = useState<RoomMemberResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<Modal | null>(null);

    const loadMembers = () => {
        setIsLoading(true);
        getConversationMembers(room.id)
            .then((page) => {
                const list = page.content ?? [];
                setMembers(list);
                onRoomUpdated({ ...room, memberCount: list.length });
            })
            .catch(() => setMembers([]))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadMembers();
    }, [room.id, memberVersion]);

    const myRole = members.find((m) => m.userId === myUserId)?.role ?? MemberRole.MEMBER;
    const isOwner = myRole === MemberRole.OWNER;
    const isAdminOrOwner = isOwner || myRole === MemberRole.ADMIN;
    const isGroup = room.type === RoomType.GROUP;
    const existingUserIds = new Set(members.map((m) => m.userId));

    const canRemoveMember = (m: RoomMemberResponse) =>
        isAdminOrOwner && m.userId !== myUserId && m.role !== MemberRole.OWNER;

    return (
        <>
            <aside className="w-72 flex flex-col border-l border-slate-100 bg-slate-50/30 overflow-y-auto no-scrollbar">
                {/* Header */}
                <div className="h-20 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
                    <h3 className="font-bold text-slate-800">
                        {isGroup ? 'Group Info' : 'Contact Info'}
                    </h3>
                    <div className="flex items-center gap-1">
                        {isAdminOrOwner && isGroup && (
                            <button
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                title="Edit Room"
                                onClick={() => setModal({ type: 'edit' })}
                                type="button"
                            >
                                <Pencil className="h-4 w-4 text-slate-600" />
                            </button>
                        )}
                        <button
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            onClick={onClose}
                            type="button"
                        >
                            <X className="h-4 w-4 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Room avatar + name */}
                <div className="flex flex-col items-center gap-2 py-6 px-4">
                    <div className="w-20 h-20 rounded-full bg-slate-200 text-slate-600 font-bold text-2xl flex items-center justify-center flex-shrink-0">
                        {(room.name || 'R').slice(0, 1).toUpperCase()}
                    </div>
                    <h2 className="font-bold text-slate-800 text-lg text-center leading-tight">{room.name}</h2>
                    {isGroup && <span className="text-xs text-slate-500">{members.length} members</span>}
                    {room.description && (
                        <p className="text-sm text-slate-500 text-center mt-1">{room.description}</p>
                    )}
                </div>

                {/* Room meta */}
                <div className="px-4 pb-4">
                    <div className="bg-white rounded-2xl p-3 shadow-sm ring-1 ring-slate-100 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Type</span>
                            <span className="font-medium text-slate-700 capitalize">{room.type.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created</span>
                            <span className="font-medium text-slate-700">
                                {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Members */}
                <div className="px-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Members {members.length > 0 && `· ${members.length}`}
                        </p>
                        {isAdminOrOwner && isGroup && (
                            <button
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                onClick={() => setModal({ type: 'addMembers' })}
                                type="button"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                Add
                            </button>
                        )}
                    </div>
                    {isLoading && <p className="text-sm text-slate-400 py-2">Loading members…</p>}
                    {!isLoading && members.length === 0 && (
                        <p className="text-sm text-slate-400 py-2">No members found.</p>
                    )}
                    <ul className="space-y-1">
                        {members.map((m) => {
                            const isOnline = onlineUserIds.has(m.userId);
                            const isMe = m.userId === myUserId;
                            return (
                                <li
                                    key={m.id}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                                >
                                    <Avatar name={m.displayName} online={isOnline} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {m.displayName}
                                            {isMe && (
                                                <span className="ml-1 text-xs font-normal text-slate-400">(you)</span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            {roleIcon(m.role)}
                                            <span>{roleLabel(m.role)}</span>
                                            {isOnline && <span className="text-green-500 ml-1">· Online</span>}
                                        </div>
                                    </div>
                                    {canRemoveMember(m) && (
                                        <button
                                            className="p-1.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                            title="Remove member"
                                            onClick={() => setModal({ type: 'removeMember', member: m })}
                                            type="button"
                                        >
                                            <UserMinus className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Footer actions */}
                <div className="mt-auto px-4 py-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                        onClick={() => setModal({ type: 'leave' })}
                        type="button"
                    >
                        <LogOut className="h-4 w-4" />
                        Leave {isGroup ? 'Group' : 'Conversation'}
                    </button>
                    {isOwner && (
                        <button
                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setModal({ type: 'delete' })}
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete {isGroup ? 'Group' : 'Conversation'}
                        </button>
                    )}
                </div>
            </aside>

            {/* Modals */}
            {modal?.type === 'edit' && (
                <EditRoomModal
                    room={room}
                    onSaved={(updated) => {
                        onRoomUpdated(updated);
                        setModal(null);
                    }}
                    onCancel={() => setModal(null)}
                />
            )}

            {modal?.type === 'addMembers' && (
                <AddMembersModal
                    room={room}
                    existingUserIds={existingUserIds}
                    onAdded={() => {
                        setModal(null);
                        loadMembers();
                    }}
                    onCancel={() => setModal(null)}
                />
            )}

            {modal?.type === 'removeMember' && (
                <ConfirmDialog
                    title="Remove Member"
                    description={`Remove ${modal.member.displayName} from this room?`}
                    confirmLabel="Remove"
                    danger
                    onConfirm={async () => {
                        await removeConversationMember(room.id, modal.member.userId);
                        setModal(null);
                        loadMembers();
                    }}
                    onCancel={() => setModal(null)}
                />
            )}

            {modal?.type === 'leave' && (
                <ConfirmDialog
                    title={`Leave ${isGroup ? 'Group' : 'Conversation'}`}
                    description="You will no longer receive messages from this room."
                    confirmLabel="Leave"
                    danger
                    onConfirm={async () => {
                        await leaveConversation(room.id);
                        onRoomLeft(room.id);
                        onClose();
                    }}
                    onCancel={() => setModal(null)}
                />
            )}

            {modal?.type === 'delete' && (
                <ConfirmDialog
                    title={`Delete ${isGroup ? 'Group' : 'Conversation'}`}
                    description="This action is permanent and cannot be undone."
                    confirmLabel="Delete"
                    danger
                    onConfirm={async () => {
                        await deleteRoom(room.id);
                        onRoomDeleted(room.id);
                        onClose();
                    }}
                    onCancel={() => setModal(null)}
                />
            )}
        </>
    );
}
