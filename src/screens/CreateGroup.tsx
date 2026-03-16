import { ArrowLeft, X, Camera, Edit2, Search } from 'lucide-react';
import { Screen } from '../App';

export default function CreateGroup({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('chat')}
                className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold leading-tight tracking-tight">Create New Group</h2>
            </div>
            <button 
              onClick={() => onNavigate('chat')}
              className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </header>

          <main className="flex-1 flex justify-center overflow-y-auto">
            <div className="layout-content-container flex flex-col w-full max-w-[600px] p-6 gap-8">
              {/* Section 1: Group Info */}
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
                  <input className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base p-4 transition-all" placeholder="Enter group name (e.g. Design Team)" type="text" />
                </div>
              </section>

              {/* Section 2: Add Members */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-bold">Add Members</h3>
                  <span className="text-sm text-primary font-medium">1 selected</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input className="w-full rounded-xl border-none bg-slate-200/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none pl-12 pr-4 py-3 text-base transition-all" placeholder="Search contacts..." type="text" />
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  {/* Contact Item */}
                  <label className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img className="h-full w-full object-cover" alt="Alex Johnson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQJpKA1Qw10tdGrRF5WF12P_1FtwkMl56UzZSu5kd5X4Rfdfi0x7rBCfNelXTAlCCQATwAbno3sKQjZJjyciUihR7DYKW2fHhA2daQj7-YO-Rgw53mvTZKvDLdQY0r6R_koRP98PMzQssLVGyJWa29UZpxvwwXuaPIvmY81i6tOzJLdIWPPl7-G_6cwK03PT_z_Cm7MgX8q58sLsYStvqNGEyfDhxSwQByWYRk2Hq1hFBPN-MmZmTk3ehyWkVvLl23rFqwYxxpkQ" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Alex Johnson</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
                    </div>
                    <input className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                  </label>

                  <label className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img className="h-full w-full object-cover" alt="Sarah Williams" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnFXPKCz9xzbWKkN2irgpTmkY9SWYXibB-x73NmU_HIV2hYUjElMYcBpQaWGKHy_cnY85CAkep0ifF_C6HQlTvVGq7IMj3qm0MdkEz5hbzZzjp6a3uj47w6Zuh8OkDDopJsnH7y4IYARbEqCO9inV9iBdvhT4cbjGJfx42FkYshLvn6vEfVMBIlHMNPFRFUioU8FrVwPIXnAysgf5eRMFXrKbE9--KnyoNgLHkafFW73yH9g9Tg5wJDeRmYYPmoYbakTvZA7SNSw" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Sarah Williams</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Last seen 2h ago</p>
                    </div>
                    <input className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                  </label>

                  <label className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img className="h-full w-full object-cover" alt="Michael Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfJmc5YYAn0nnk_5POzvjLE5XkdlrqVu2W280VcerbVdT-TlQp4MWR1lUMQfIp1gq4Fsur6U0ilubN_nxN-uQFwnukX9H30l4nfwltn2zlZV5OQdfu0mGoxv_xV0XsNfYDbADXXlA0VLyxL_mRt8ef3eLi20mY58Qbo-s_J3zhWs3kLSmHn9wtq4Jmn3SJ0x7dhq5WwyMo91v65bT2j-oZNsc1iLeqx4m-M6b7udpt7t1CiWCVlv1EaowXazv9Iw50Glu4lKjvFA" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Michael Chen</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Away</p>
                    </div>
                    <input defaultChecked className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                  </label>

                  <label className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img className="h-full w-full object-cover" alt="Elena Rodriguez" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Hqa5g-2GN0tjga7TVQlKo1SSBxQxwIvLSKAtWHH4hjsUBZ9LMun9DxDe5DZMe8kiLRXqhuvIRqAg8Zlcj-b6dj_5jTaTdUFgMQbAl4dMRRL9kKNIXZKDC2dI-a37fMuU_XjAKMCFtEUW_xaJ123oHhy5J2-TcouiNg8ZK6jA-v9d8hHbpTald47N2zva6BE2kJdXFanNTY4NZe0Jdq-7JrGupNuoX46AJb9V1ec-K7fhwlVme7nfubI-yGRoB90XQbERscjq-Q" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Elena Rodriguez</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
                    </div>
                    <input className="w-6 h-6 rounded-full border-slate-300 text-primary focus:ring-primary focus:ring-offset-0" type="checkbox" />
                  </label>
                </div>
              </section>
            </div>
          </main>

          {/* Footer Buttons */}
          <footer className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky bottom-0">
            <div className="flex gap-4 max-w-[600px] mx-auto">
              <button 
                onClick={() => onNavigate('chat')}
                className="flex-1 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => onNavigate('chat')}
                className="flex-[2] py-4 rounded-xl font-bold text-white bg-primary hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Create Group
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
