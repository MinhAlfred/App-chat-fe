import { MessageSquare, Users, Settings as SettingsIcon, UserPlus, Search, MessageCircle } from 'lucide-react';
import { Screen } from '../App';

export default function Contacts({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-72 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-background-dark/50 flex flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          {/* User Profile Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary">
                <img className="w-full h-full object-cover" alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzZ1hUQG7cN8lZFhe5DJshqYq-oPQNi22WbeybTICypwTapC2dShV9lE8n82jolaB7JTko06tyeyQTKadcqzjkxQmYyEkYMcwAWV_Ld-S6s7dabRAefbHkS7hDhG5X75lntodqabyPUumP0e2RV8-4hDtCf4R0CYM2hnEpSExVbU8vOJUz2naMPkgus_rokqh1E0ele4UWBgyVVeoukSIy7nEOwcGPbENdEP7aiykI0R9G7CtIkTJ0QCVAK0_xk23xjjn9Pxy0Og" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-slate-100 font-bold text-base leading-tight">Alex Rivera</h1>
              <p className="text-primary text-xs font-medium">Online</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary w-full text-left"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold">Chats</span>
            </button>
            <button 
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-primary/10 text-primary w-full text-left"
            >
              <Users className="w-5 h-5 fill-current" />
              <span className="text-sm font-semibold">Contacts</span>
            </button>
            <button 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary w-full text-left"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Action */}
        <button 
          onClick={() => onNavigate('createGroup')}
          className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark">
        {/* Header with Search */}
        <header className="p-8 pb-4">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Contacts</h2>
              <span className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">124 Total</span>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary w-5 h-5" />
              <input className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100" placeholder="Search contacts by name, email or company..." type="text" />
            </div>
          </div>
        </header>

        {/* Contacts List Scrollable Area */}
        <section className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Alphabetical Section: A */}
            <div>
              <div className="sticky top-0 bg-white dark:bg-background-dark py-2 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">A</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Card */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="Alice Watson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFbAjCJeO6QXBpzsMPQy7UJQfIlNoIUYUibZnKCHCG38ZYU68IBUbOUoS3K0Tdk9uoOb0hibPltfApGSeRrmHj2zIqJVPEkwm7DTHfRHfLxiqdHdkwIPieeHTfVOkxmkNw5bdDZd2F4IoFvRyfoS0TSEEfByTDrXm0EXV73KjKzgvcixwvUzuhHsWrEdv-qUQdKp3EpcK8JKwK4GSEam5Y6rsMVLU3kyasJ8DClZLW0UV7YUSnUIvQ1ZBctrJ0f0oalCHy1lsWLg" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Alice Watson</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Senior Designer</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="Arthur Morgan" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy1Xq46joV8FgrohP9OQc4IcTaecgbPj-vONXghH8D_VUersEF7bTksq0GqHeTePRmY0vM0sVbrlpAbr0MoiDVYs_jIHMScWyZ3f8gTVR4qkV8lZKewaV79U-EsuyQa91xPX27wDvQIOHeqDBtNSR8nfkIVJF6U8F8eCiGd9q8W7QO9p9qkiN5hxJPAcbyFxXq8bHUY5RDmw0ZNy7eR6F6xNjvfjCdvKppgHWM74_LXkhkxnixbpaSisZWhKw92CHLhQMNLhMsEw" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-slate-300 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Arthur Morgan</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Project Manager</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Alphabetical Section: B */}
            <div>
              <div className="sticky top-0 bg-white dark:bg-background-dark py-2 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">B</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="Beatrice Stone" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2bSdOOVmBU4JvEz5WZ6qRgL8rUVgzZdMcUJqcv2FT-m9jM23J1tTsbrD7gonwQ7vdCg2nbBQ3XG93EUc9YrOpAc0PoNvA-0XaOGQFsax5hvBpS7Ig8jMs-DoeDlx3a4u_2zSnQr1PRi4molGEMXEWZvFjnErGj47Ff313TjmMuaRRWaymY9bqlKkJIBF0ezFo80JWesUZJpOKNXmbJf8XknorCGZzL3qrFEQNCXKViYKvJ0eSP43kWxbxmmAUjHentUBCSrmteA" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Beatrice Stone</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Software Engineer</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Alphabetical Section: D */}
            <div>
              <div className="sticky top-0 bg-white dark:bg-background-dark py-2 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">D</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="David Zhang" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHcovvNpWl3l6i5WAOWkP31vQeCRz9P-u-pJ8twzVnN7Te_cZnICReQASYIXxta-Qf_Ny3rNItErmHupia0lmJM5nFkMS4angOTTsKBTR0LP6xGDPgF8AMw5A00BXDP1J6j7e6RrPLGb8u0xNrsUU6ENZSdSqukGSIkrxP-TRJ-kQGb4kYL-ywl4vbH9z-J-asykKzhgLtaYOJTvWeqs0e3ranB3q49A4UvoICJfrQr_qrJh01hJgGonghowWBoOHFKvvt3tNoSw" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-primary border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">David Zhang</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Marketing Lead</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="Diana Prince" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw6HpkG1M9p7lbWjCnoqGiWIe5twfW6TMdpjEiQvGcf_kpspu4RNYE4KcRPyZOnN59xbYsAtjFefztNzgg_VdhnnhlLo90J1gY6v-QXW1RMFRi3J1EvKgTJAlvyHlyndI4Uw-esbH9kxyrFrUazA03sVTmdJ5KLOp6f0rNionQgrqj5k_rddncJqqQ3Ot_-Tz6ZpZQ6yKLhREwiyaKXSIi7P_hh1bhzVSWAe8vYGswH1aiTGRd0V6BMKbkm6LOYP7FXh2w9l9vcA" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Diana Prince</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Business Analyst</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Alphabetical Section: E */}
            <div>
              <div className="sticky top-0 bg-white dark:bg-background-dark py-2 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">E</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
                        <img className="w-full h-full object-cover" alt="Elena Rossi" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIDe5UI_BtVbARAMZdi5dZNX8bH-CJJuUHXjQyQmF89ako-zr4AbIyTGZKY19bvnig0KLNhD_ZC7mao42EHCxFpoAZqB1rR4Ak4VOMihjtZqiGV4OiOYvtEigYYz2l5tdaQv8nhiAj9blpdO2Pqsb96d3InZeoQIRJundzzz-Bzvselu18hv8ViS_5rhWE9zbzuuCh4RZXpNYQ38IbfqPlEPJPTf4tHA-5T3oYJocG3AcFEWSqxf8YS41_VQBOX5DQGjZ1FTjE6g" />
                      </div>
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-slate-300 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">Elena Rossi</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Product Designer</p>
                    </div>
                  </div>
                  <button className="p-3 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
