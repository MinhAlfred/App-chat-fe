import { ArrowLeft, Check, Camera, Shield, Lock, ShieldCheck, Bell, Eye, Users, Ban, Palette, Sun, Moon, Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { Screen } from '../App';

export default function Settings({ onNavigate }: { onNavigate: (s: Screen) => void }) {
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
            <button 
              onClick={() => onNavigate('chat')}
              className="flex items-center justify-center rounded-xl h-10 bg-primary text-white gap-2 text-sm font-bold px-6 hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </header>

          <main className="flex-1 max-w-[960px] mx-auto w-full px-4 py-8 lg:px-10">
            {/* Profile Section */}
            <section className="mb-10">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                <div className="relative group">
                  <div 
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white dark:border-slate-800 shadow-lg" 
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCUXAfNgIBWnudDtLG4LD9ghQc5ozvvo4sJEb86Vlu3N2iHZvBfalKiwNhcupYyKDAo3E_MV90r2mXNT98Nd76wN6OH-F6ovD2yBCSRC-W46f6SFmKiTer0mewXvSQ6pKdq9LsQ4y9b4QWNJKbnkvNuGEObhXsiBvoZ2cH6SjtpJ5CGIwQuh-Las_OVCnkLVMW95PVnbJ-7mi4MJkSy1IGq9DTVZQrsm-Sm6BCb6Z3iovDzrR196eyEfGRdB02CTE4TZL3gscQT3w")' }}
                  ></div>
                  <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform border-2 border-white dark:border-slate-800">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col grow gap-4 w-full">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Display Name</label>
                    <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" type="text" defaultValue="Alex Johnson" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-600 dark:text-slate-400">Bio</label>
                    <textarea className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" rows={2} defaultValue="UX Designer & Coffee Enthusiast. Always online for a chat about design systems."></textarea>
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
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Changed 3 months ago</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Highly recommended for safety</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
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
                  <div className="flex items-center justify-between p-4 rounded-xl transition-colors">
                    <div className="flex flex-col">
                      <p className="font-medium">Sound Effects</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Play sounds for incoming messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" />
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
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Who can message me</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Contacts Only</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <Ban className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Blocked Contacts</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">12 people</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform w-6 h-6" />
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
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-primary bg-white dark:bg-slate-900 transition-all shadow-sm">
                    <div className="w-full h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <Sun className="text-primary w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Light Mode</span>
                  </button>
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div className="w-full h-20 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <Moon className="text-slate-500 w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Dark Mode</span>
                  </button>
                  <button className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent bg-slate-50 dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div className="w-full h-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden">
                      <div className="flex gap-1">
                        <SettingsIcon className="text-slate-500 w-6 h-6" />
                      </div>
                    </div>
                    <span className="font-bold text-sm">System</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Danger Zone */}
          <footer className="max-w-[960px] mx-auto w-full px-4 mb-12">
            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-red-600 dark:text-red-400 font-bold">Delete Account</h4>
                <p className="text-sm text-red-500/70 dark:text-red-400/60">Permanently delete your account and all your data.</p>
              </div>
              <button className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
            <div className="mt-8 text-center text-slate-400 dark:text-slate-600 text-xs">
              Pure Chat App Version 2.4.0 • Built with Love
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
