import { useEffect, useState } from 'react';
import { MessageSquare, Users, Settings as SettingsIcon, UserPlus, Search, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Screen, screenPath } from '../navigation/routes';
import { getAdminUsers, getMe, search as searchUsers } from '../api/users-api';
import { startPrivateConversation } from '../api/chat-api';
import { UserResponse } from '../types/auth';

export default function Contacts({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<UserResponse[]>([]);
    const [me, setMe] = useState<UserResponse | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [startingChatId, setStartingChatId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const filterOutMe = (sourceContacts: UserResponse[], currentUser: UserResponse | null) => {
        if (!currentUser) {
            return sourceContacts;
        }

        return sourceContacts.filter(
            (contact) =>
                contact.id !== currentUser.id &&
                contact.username !== currentUser.username &&
                contact.email !== currentUser.email,
        );
    };

    useEffect(() => {
        const loadContacts = async () => {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const [page, me] = await Promise.all([
                    getAdminUsers(0, 50),
                    getMe().catch(() => null),
                ]);

                setMe(me);
                const sourceContacts = page.content || [];
                setContacts(filterOutMe(sourceContacts, me));
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Không tải được danh sách contacts.';
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadContacts();
    }, []);

    useEffect(() => {
        const trimmedKeyword = searchKeyword.trim();
        const timeoutId = window.setTimeout(() => {
            const performSearch = async () => {
                setIsLoading(true);
                setErrorMessage('');

                try {
                    if (!trimmedKeyword) {
                        const page = await getAdminUsers(0, 50);
                        setContacts(filterOutMe(page.content || [], me));
                        return;
                    }

                    const page = await searchUsers(trimmedKeyword, 0, 20);
                    setContacts(filterOutMe(page.content || [], me));
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Not found contacts.';
                    setErrorMessage(message);
                } finally {
                    setIsLoading(false);
                }
            };

            void performSearch();
        }, 350);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [searchKeyword, me]);

    const handleStartConversation = async (userId: string) => {
        setStartingChatId(userId);
        setErrorMessage('');

        try {
            const room = await startPrivateConversation(userId);
            navigate(`${screenPath.chat}?roomId=${encodeURIComponent(room.id)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể bắt đầu chat.';
            setErrorMessage(message);
        } finally {
            setStartingChatId(null);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
            <aside className="w-72 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-background-dark/50 flex flex-col justify-between p-6">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary text-primary font-bold">
                                U
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-slate-100 font-bold text-base leading-tight">My Contacts</h1>
                            <p className="text-primary text-xs font-medium">Online</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={() => onNavigate('chat')}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary w-full text-left"
                            type="button"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm font-semibold">Chats</span>
                        </button>
                        <button
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-primary/10 text-primary w-full text-left"
                            type="button"
                        >
                            <Users className="w-5 h-5 fill-current" />
                            <span className="text-sm font-semibold">Contacts</span>
                        </button>
                        <button
                            onClick={() => onNavigate('settings')}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary w-full text-left"
                            type="button"
                        >
                            <SettingsIcon className="w-5 h-5" />
                            <span className="text-sm font-semibold">Settings</span>
                        </button>
                    </nav>
                </div>

                <button
                    onClick={() => onNavigate('createGroup')}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20"
                    type="button"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Create Group</span>
                </button>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark">
                <header className="p-8 pb-4">
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Contacts</h2>
                            <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                                {contacts.length} Total
                            </span>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary w-5 h-5" />
                            <input
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
                                placeholder="Search contacts by name, username or email..."
                                type="text"
                                value={searchKeyword}
                                onChange={(event) => setSearchKeyword(event.target.value)}
                            />
                        </div>
                        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="max-w-4xl mx-auto">
                        {isLoading && <p className="text-sm text-slate-500">Loading contacts...</p>}
                        {!isLoading && contacts.length === 0 && (
                            <p className="text-sm text-slate-500">No contact found.</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 text-slate-600 font-bold flex items-center justify-center">
                                                {(contact.displayName || contact.username || 'U').slice(0, 1).toUpperCase()}
                                            </div>
                                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{contact.displayName || contact.username}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{contact.username}</p>
                                            <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="p-3 rounded-full bg-primary/5 text-primary opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white disabled:opacity-60"
                                        onClick={() => void handleStartConversation(contact.id)}
                                        type="button"
                                        disabled={startingChatId === contact.id}
                                        title="Start chat"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
