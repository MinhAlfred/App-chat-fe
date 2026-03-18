import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Camera, Shield, Lock, Bell, Eye, Palette, Sun, Moon, Settings as SettingsIcon, ChevronRight, X } from 'lucide-react';
import { Screen } from '../navigation/routes';
import { useAuth } from '../auth/AuthContext';
import { getMe, updateMyProfile, updateMyAvatar, changeMyPassword } from '../api/users-api';
import { UserResponse } from '../types/auth';

type ChangePasswordModalProps = {
    onClose: () => void;
};

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword) { setError('Please fill in all fields.'); return; }
        if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }
        setLoading(true);
        setError('');
        try {
            await changeMyPassword({ oldPassword, newPassword });
            setSuccess(true);
            setTimeout(onClose, 1200);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-base">Change Password</h3>
                    <button onClick={onClose} type="button" className="p-1 hover:bg-slate-100 rounded-full">
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                </div>
                {success ? (
                    <p className="text-sm text-green-600 text-center py-2">Password changed successfully!</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-3">
                            <input
                                type="password"
                                placeholder="Current password"
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="New password"
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                onClick={onClose}
                                type="button"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() => void handleSubmit()}
                                type="button"
                                disabled={loading}
                            >
                                {loading ? '...' : 'Change'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Settings({ onNavigate }: { onNavigate: (s: Screen) => void }) {
    const { logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [me, setMe] = useState<UserResponse | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        getMe()
            .then((user) => {
                setMe(user);
                setDisplayName(user.displayName ?? '');
                setPhoneNumber(user.phoneNumber ?? '');
                setDateOfBirth(user.dateOfBirth ?? '');
            })
            .catch(() => undefined);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            const updated = await updateMyProfile({
                displayName: displayName.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                dateOfBirth: dateOfBirth || undefined,
            });
            setMe(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        try {
            const updated = await updateMyAvatar(file);
            setMe(updated);
        } catch {
            // silently ignore
        } finally {
            setIsUploadingAvatar(false);
            e.target.value = '';
        }
    };

    const handleLogout = async () => {
        await logout();
        onNavigate('login');
    };

    const avatarInitial = (me?.displayName || me?.username || 'U').slice(0, 1).toUpperCase();

    return (
        <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="layout-container flex h-full grow flex-col">
                    {/* Top Navigation Bar */}
                    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-40">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('chat')}
                                className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <ArrowLeft className="text-slate-700 dark:text-slate-300 w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                            {saveSuccess && <p className="text-xs text-green-600">Saved!</p>}
                            <button
                                onClick={() => void handleSave()}
                                disabled={isSaving}
                                className="flex items-center justify-center rounded-xl h-10 bg-primary text-white gap-2 text-sm font-bold px-6 hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                                <Check className="w-5 h-5" />
                                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 max-w-[960px] mx-auto w-full px-4 py-8 lg:px-10">
                        {/* Profile Section */}
                        <section className="mb-10">
                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                                <div className="relative group">
                                    {me?.avatar ? (
                                        <img
                                            src={me.avatar}
                                            alt={avatarInitial}
                                            className="aspect-square object-cover rounded-full h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg"
                                        />
                                    ) : (
                                        <div className="aspect-square rounded-full h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg bg-slate-200 text-slate-600 font-bold text-4xl flex items-center justify-center">
                                            {avatarInitial}
                                        </div>
                                    )}
                                    <button
                                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform border-2 border-white dark:border-slate-800 disabled:opacity-50"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        type="button"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => void handleAvatarChange(e)}
                                    />
                                </div>
                                <div className="flex flex-col grow gap-4 w-full">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Display Name</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your display name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Phone Number</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Date of Birth</label>
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        <span>@{me?.username}</span>
                                        {me?.email && <span className="ml-3">{me.email}</span>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Account Security */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Shield className="text-primary w-6 h-6" />
                                    Account Security
                                </h3>
                                <div className="space-y-1">
                                    <button
                                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                                        type="button"
                                        onClick={() => setShowPasswordModal(true)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                                <Lock className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">Password</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Click to change your password</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Bell className="text-primary w-6 h-6" />
                                    Notifications
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between p-4 rounded-xl transition-colors">
                                        <div className="flex flex-col">
                                            <p className="font-medium">Push Notifications</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts on your device</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input defaultChecked className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Eye className="text-primary w-6 h-6" />
                                    Privacy
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between p-4 rounded-xl">
                                        <div className="flex flex-col">
                                            <p className="font-medium">Account</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{me?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Selection */}
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 pb-12">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Palette className="text-primary w-6 h-6" />
                                    App Theme
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-primary bg-white dark:bg-slate-900 transition-all shadow-sm" type="button">
                                        <div className="w-full h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                                            <Sun className="text-primary w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-sm">Light Mode</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all" type="button">
                                        <div className="w-full h-20 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                                            <Moon className="text-slate-500 w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-sm">Dark Mode</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all" type="button">
                                        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden">
                                            <SettingsIcon className="text-slate-500 w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-sm">System</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="max-w-[960px] mx-auto w-full px-4 mb-12">
                        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="text-red-600 dark:text-red-400 font-bold">Danger Zone</h4>
                                <p className="text-sm text-red-500/70 dark:text-red-400/60">Permanently delete your account and all your data.</p>
                            </div>
                            <button className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors" type="button">
                                Delete Account
                            </button>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button
                                className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-colors"
                                onClick={() => void handleLogout()}
                                type="button"
                            >
                                Logout
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
        </div>
    );
}
