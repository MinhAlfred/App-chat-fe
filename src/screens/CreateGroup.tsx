import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, X, Camera, Edit2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Screen, screenPath } from '../navigation/routes';
import { getAdminUsers, getMe } from '../api/users-api';
import { createGroupConversation } from '../api/chat-api';
import { UserResponse } from '../types/auth';

export default function CreateGroup({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [contacts, setContacts] = useState<UserResponse[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadContacts = async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const [page, me] = await Promise.all([
                    getAdminUsers(0, 100),
                    getMe().catch(() => null),
                ]);

                const sourceContacts = page.content || [];
                if (!me) {
                    setContacts(sourceContacts);
                    return;
                }

                const filtered = sourceContacts.filter(
                    (contact) =>
                        contact.id !== me.id &&
                        contact.username !== me.username &&
                        contact.email !== me.email,
                );

                setContacts(filtered);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Không tải được danh sách members.';
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadContacts();
    }, []);

    const filteredContacts = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) {
            return contacts;
        }

        return contacts.filter((contact) =>
            [contact.displayName, contact.username, contact.email].some((field) => field?.toLowerCase().includes(keyword)),
        );
    }, [contacts, searchKeyword]);

    const toggleMember = (userId: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            setErrorMessage('Vui lòng nhập tên nhóm.');
            return;
        }

        if (!selectedMemberIds.length) {
            setErrorMessage('Vui lòng chọn ít nhất 1 thành viên.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const room = await createGroupConversation({
                name: groupName.trim(),
                memberIds: selectedMemberIds,
            });

            navigate(`${screenPath.chat}?roomId=${encodeURIComponent(room.id)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Tạo nhóm thất bại.';
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate('chat')}
                                className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                type="button"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold leading-tight tracking-tight">Create New Group</h2>
                        </div>
                        <button
                            onClick={() => onNavigate('chat')}
                            className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            type="button"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </header>

                    <main className="flex-1 flex justify-center overflow-y-auto">
                        <div className="layout-content-container flex flex-col w-full max-w-[600px] p-6 gap-8">
                            <section className="flex flex-col gap-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="bg-primary/10 dark:bg-primary/20 flex items-center justify-center aspect-square rounded-full h-32 w-32 border-2 border-dashed border-primary/40 overflow-hidden">
                                            <Camera className="text-primary w-12 h-12" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg border-4 border-background-light dark:border-background-dark">
                                            <Edit2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold">Group Icon</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tap to upload group image</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold px-1 text-slate-700 dark:text-slate-300">Group Name</label>
                                    <input
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base p-4 transition-all"
                                        placeholder="Enter group name (e.g. Design Team)"
                                        type="text"
                                        value={groupName}
                                        onChange={(event) => setGroupName(event.target.value)}
                                    />
                                </div>
                            </section>

                            <section className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-lg font-bold">Add Members</h3>
                                    <span className="text-sm text-primary font-medium">{selectedMemberIds.length} selected</span>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        className="w-full rounded-xl border-none bg-slate-200/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none pl-12 pr-4 py-3 text-base transition-all"
                                        placeholder="Search contacts..."
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(event) => setSearchKeyword(event.target.value)}
                                    />
                                </div>

                                {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                                {isLoading && <p className="text-sm text-slate-500">Loading contacts...</p>}

                                <div className="flex flex-col gap-1 mt-2">
                                    {!isLoading && filteredContacts.length === 0 && (
                                        <p className="text-sm text-slate-500 px-1">No contact found.</p>
                                    )}

                                    {filteredContacts.map((contact) => (
                                        <label
                                            key={contact.id}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 text-slate-600 font-bold flex items-center justify-center">
                                                {(contact.displayName || contact.username || 'U').slice(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{contact.displayName || contact.username}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{contact.username}</p>
                                            </div>
                                            <input
                                                className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0"
                                                type="checkbox"
                                                checked={selectedMemberIds.includes(contact.id)}
                                                onChange={() => toggleMember(contact.id)}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </main>

                    <footer className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0">
                        <div className="flex gap-4 max-w-[600px] mx-auto">
                            <button
                                onClick={() => onNavigate('chat')}
                                className="flex-1 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleCreateGroup()}
                                className="flex-[2] py-4 rounded-xl font-bold text-white bg-primary hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
                                type="button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
