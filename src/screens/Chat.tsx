import { useState } from 'react';
import { Search, Edit, Phone, Video, MoreVertical, Paperclip, Smile, Send, X, FileText, BarChart2 } from 'lucide-react';
import { Screen } from '../App';

export default function Chat({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [showForwardModal, setShowForwardModal] = useState(false);

  return (
    <div className="flex h-full w-full max-w-[1600px] mx-auto overflow-hidden bg-white shadow-2xl relative">
      {/* Forward Modal Overlay */}
      {showForwardModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Forward to...</h3>
              <button 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors" 
                onClick={() => setShowForwardModal(false)}
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {/* Contact Item */}
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors group">
                <img alt="Contact" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgeEibiXS5y3wU0AGdcsxs_2yLMQ1aB1V4UCR_Kz8vzUbIHOwn0KcDA4jXG3mqGPjlvb2aVNRyIctFg2dQzk3YOl_mZkQ4tK6Z-A1N6d6zNzoxW8eADNyPMX5LOXWfogTFVxCHvkdA5b_qb2EeY9tWYrLKQOdCkgGSEcwBfs09ACQ9ZlsOG_c6oM5qjts4XlW_aSem-__GEPIpTQx9LMWJfsYNEPvUQ8eMJp059_Rg_r7KgPJ4jzJOEE1bBZb_zNSInS0o-Bdp_w" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Sarah Jensen</h4>
                  <p className="text-xs text-slate-400">Recent</p>
                </div>
                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Send</button>
              </div>
              {/* Contact Item */}
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors group">
                <img alt="Contact" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMmCK-wOLCaIBvJrcTPahOw2IX1waA_RjeUnrcx0T65rMtRZhF2wRY4nRNqEJFwC__k8B9cIxs1O-VkVs7z9cCtzSqQzo9cJ7lHt2biLHhG4jbucl1McZVjKxzCeZW72qclz4gi_jVeq68fhcfbC5-cJwgYdpUQ07n2jMsSe6fXtMrA1oYzO87DoMVQAEjvVZxhWlyGzTD-dr7NPZ3jDRh69rA-24l_Zo9G_nuqyv3GGheoVIbciWJ_BNGYr8jU7OQFASE5b3mGA" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Q4 Strategy Group</h4>
                  <p className="text-xs text-slate-400">Group</p>
                </div>
                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Send</button>
              </div>
              {/* Contact Item */}
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors group">
                <img alt="Contact" className="w-12 h-12 rounded-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCADYFb15dEGIw_85Fb_BytXhMH9f7tc4u9pQflIi_GIkYImQ-9dQg5AL4r932Rp3IUaYE8L3f0COSz_mjjwaJU8lO5lhiQj1BqiUwWrsLwphPvN_foMjQCqgCRiCynt7NwrhTeRKmZC427aeBt4a6RP4YQ2tJyXWYGDiFB3DlA31qHDGFSYzL61WF9j7U1BqiOavyLepdNAAWfgUbtNSopCjv-S0X4oC1vRenxZ50TyCMmoZ4y4UlV92n1Ts7a7IcUg6WH1_7A3g" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">Marcus Lee</h4>
                  <p className="text-xs text-slate-400">Offline</p>
                </div>
                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="w-80 md:w-96 flex flex-col border-r border-slate-100 bg-slate-50/30">
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('settings')}
          >
            <div className="relative">
              <img alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOf8kcPAVSja39Pt3i8fTLLM_teqp3DdX5FdfHTo37KeNr10KenWKOkGzWmqJ4L7hjptnMsaXt4NnxWx8tB2DwUIETPg-H8SctOg8zxpxKrE3KOz3MJ90TOqLTOW1CQ9P-APjpdizymdZbu43H-Kzrr4IUEqrT4ute8txFfQzvRAPxg1M6dDnPRdKpkVd7s-9dUZQxRLpIe1oIWbYawiP9opGYMDy9L6baWpE7qN5DMDHM5Zrcl6W86_6orFx021J5gK2OPBWEUQ" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Alex Rivers</h2>
              <p className="text-xs text-slate-500">My Status: Available</p>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors" 
            title="New Chat"
            onClick={() => onNavigate('contacts')}
          >
            <Edit className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input className="block w-full pl-10 pr-3 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Search messages or people..." type="text" />
          </div>
        </div>

        {/* Conversations List */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4">
          {/* Chat Card: Active */}
          <div className="group flex items-center gap-4 p-3 mb-1 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 cursor-pointer transition-all hover:bg-white hover:shadow-md">
            <div className="relative flex-shrink-0">
              <img alt="Sarah Jensen" className="w-14 h-14 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgeEibiXS5y3wU0AGdcsxs_2yLMQ1aB1V4UCR_Kz8vzUbIHOwn0KcDA4jXG3mqGPjlvb2aVNRyIctFg2dQzk3YOl_mZkQ4tK6Z-A1N6d6zNzoxW8eADNyPMX5LOXWfogTFVxCHvkdA5b_qb2EeY9tWYrLKQOdCkgGSEcwBfs09ACQ9ZlsOG_c6oM5qjts4XlW_aSem-__GEPIpTQx9LMWJfsYNEPvUQ8eMJp059_Rg_r7KgPJ4jzJOEE1bBZb_zNSInS0o-Bdp_w" />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-slate-800 truncate">Sarah Jensen</h3>
                <span className="text-[10px] font-medium text-blue-600 uppercase">12:45 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 truncate font-medium">I've sent the final wireframes for your review!</p>
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">2</span>
              </div>
            </div>
          </div>

          {/* Chat Card: Normal */}
          <div className="group flex items-center gap-4 p-3 mb-1 rounded-2xl cursor-pointer transition-all hover:bg-slate-100">
            <div className="relative flex-shrink-0">
              <img alt="Marketing Group" className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMmCK-wOLCaIBvJrcTPahOw2IX1waA_RjeUnrcx0T65rMtRZhF2wRY4nRNqEJFwC__k8B9cIxs1O-VkVs7z9cCtzSqQzo9cJ7lHt2biLHhG4jbucl1McZVjKxzCeZW72qclz4gi_jVeq68fhcfbC5-cJwgYdpUQ07n2jMsSe6fXtMrA1oYzO87DoMVQAEjvVZxhWlyGzTD-dr7NPZ3jDRh69rA-24l_Zo9G_nuqyv3GGheoVIbciWJ_BNGYr8jU7OQFASE5b3mGA" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-slate-800 truncate">Q4 Strategy Group</h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase">11:20 AM</span>
              </div>
              <div className="flex items-center">
                <p className="text-sm text-slate-400 truncate">David: We should align on the budget.</p>
              </div>
            </div>
          </div>

          {/* Chat Card: Offline */}
          <div className="group flex items-center gap-4 p-3 mb-1 rounded-2xl cursor-pointer transition-all hover:bg-slate-100">
            <div className="relative flex-shrink-0">
              <img alt="Marcus Lee" className="w-14 h-14 rounded-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCADYFb15dEGIw_85Fb_BytXhMH9f7tc4u9pQflIi_GIkYImQ-9dQg5AL4r932Rp3IUaYE8L3f0COSz_mjjwaJU8lO5lhiQj1BqiUwWrsLwphPvN_foMjQCqgCRiCynt7NwrhTeRKmZC427aeBt4a6RP4YQ2tJyXWYGDiFB3DlA31qHDGFSYzL61WF9j7U1BqiOavyLepdNAAWfgUbtNSopCjv-S0X4oC1vRenxZ50TyCMmoZ4y4UlV92n1Ts7a7IcUg6WH1_7A3g" />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-slate-300 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-slate-800 truncate">Marcus Lee</h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase">Yesterday</span>
              </div>
              <p className="text-sm text-slate-400 truncate">Talk to you later, Alex.</p>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Bar */}
        <header className="h-20 px-6 border-b border-slate-100 flex items-center justify-between glass-effect sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img alt="Sarah Jensen" className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7B2NwLfgf5LdMb7qRHmLbsqZOqnRQoiQk0xo7TYqjqpWcW-UqY6w6IMlqi9_HtVuD3rTP32WUBsdOn2bMNyAmQWPNhy3MRM4INEfmOkhwfRNJplQw5OjGpacLMOLUraeG8lTF5sWHV3cOvGomkNZZSlsM94PhXWCkhaW7UXI_igcjJpqJL_Qp9fpWcFfu8f7XmmCx8vakPBDKblbVPSglk1fj-MCzFI3DMAIL2u-IfVfO0V0xRz6s2-VFscK8uEU1urLQ9ohX6g" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Sarah Jensen</h3>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all" title="Voice Call">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all" title="Video Call">
              <Video className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all" title="Search">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all" title="More Options">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Message Feed */}
        <section className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 no-scrollbar">
          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Today</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Received Message */}
          <div className="flex items-end gap-3 max-w-[85%] group message-group">
            <img alt="Sarah" className="w-8 h-8 rounded-full mb-1 flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe3QRcO4E-iDcZfmctwMSZexik4Pc0rolfwRkyLe8q_i8vcdVgkaQvyTzgmkXqOPSIA9TeOdc9zu1kVHjIgQX6YZKcjRj_Sq5P9yyVQwyJ5jTVDMSAP3AtQcVAb9NIr-Ttg2NH9ewgkaz6Ij0pea_uptJr1KCo7rTUV-eU5H4Meisooc-ElkB_BzeiTEAjxNtcwcuOnr8J1gAdVeO07wNeiQsjlHG_5OC0QD_AQM_dOhgEUfzZCMMZUoHktGarqTF6c_k7BUm3kg" />
            <div className="relative">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-slate-700 text-sm leading-relaxed relative">
                Hey Alex! I just finished the design system updates for the new project.
                <div className="absolute -bottom-3 left-2 flex items-center gap-1">
                  <span className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm">❤️ 1</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-4 block ml-1">12:30 PM</span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all self-center mb-4" 
              onClick={() => setShowForwardModal(true)} 
              title="Forward message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Sent Message */}
          <div className="flex items-end gap-3 max-w-[85%] ml-auto flex-row-reverse group message-group">
            <div className="relative flex flex-col items-end">
              <div className="bg-blue-600 p-4 rounded-2xl rounded-br-none shadow-lg text-white text-sm leading-relaxed relative">
                That's great news, Sarah! Can you share the Figma link so I can start the handoff?
                <div className="absolute -bottom-3 right-2 flex items-center gap-1">
                  <span className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm text-slate-700">👍 2</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 mr-1">
                <span className="text-[10px] text-slate-400">12:35 PM</span>
                <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              </div>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all self-center mb-4" 
              onClick={() => setShowForwardModal(true)} 
              title="Forward message"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Received Message with Attachment */}
          <div className="flex items-end gap-3 max-w-[85%] group message-group">
            <img alt="Sarah" className="w-8 h-8 rounded-full mb-1 flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ8frCTOTTVj41SseX2fc2hmVnlb4WdxsRQ7lmJ6SXqmMzzFTCFGmx-_PCIh30ld8neyj7kywUTBXaQbpgM6rZVYePaDAI3lyKrO9MLpAexyfXyCTLZvZYJQuNvTdappbJ_dFdcrNB4fZbuCpyrqBXRrtOMGtRwz1IS0FRfM8SDdIrIUlL-VXcn0Se1I_aj3VZZi8y3hYu2CBckNAgCCV3uxx_6PSvB_W3e7nh20Z7krfhDvVlg4xfAad2656MkyvkjOr42f1wZA" />
            <div className="relative">
              <div className="bg-white p-2 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 space-y-2 relative">
                <img alt="Design Preview" className="rounded-xl w-full object-cover max-h-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ARS0z3pCCSUAyfGlx6sOyr3U7trEAlyuB8fMdiqZcJImHqUIyxoGOXG-W2h9-1u1KN623Do99MXAxLATp_cSVBc4PqPOiJz_CejZ4KoX99GLzKk-IOOdWvjL_jlt2DJXRKnzzarZW8dUCGLXiZ8TQMffvaCzaWONHg-EHNqRI6K-HgWT2x0xnDzgruCrtcQ4SrpoRMjKhVDew5VVKLZb5YULUn4RL-RGOWHr8nBVdNHc0hBGQDe_KEGljoZNZLjMm5fTaYhX-w" />
                <div className="px-2 pb-2">
                  <p className="text-sm text-slate-700">I've sent the final wireframes for your review!</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block ml-1">12:45 PM</span>
            </div>
            <button 
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all self-center mb-4" 
              onClick={() => setShowForwardModal(true)} 
              title="Forward message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Input Area */}
        <footer className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-4 bg-slate-100/80 p-2 pl-4 rounded-[2rem] focus-within:bg-slate-100 transition-colors">
            <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Attach file">
              <Paperclip className="h-5 w-5" />
            </button>
            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-slate-400 outline-none" placeholder="Type a message..." type="text" />
            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors" title="Emoji">
              <Smile className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95" title="Send message">
              <Send className="h-4 w-4 ml-1" />
            </button>
          </div>
        </footer>
      </main>

      {/* Details Panel (Right Sidebar) */}
      <aside className="hidden lg:flex w-80 flex-col border-l border-slate-100 bg-white">
        <div className="p-8 flex flex-col items-center text-center border-b border-slate-50">
          <img alt="Sarah Jensen Large" className="w-24 h-24 rounded-3xl shadow-xl border-4 border-white mb-4 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHeEFog5cnwfvujX1vcWYTyNHlBlBALT1UNYaDdBzoadMhdITORDAfajfuXFNZZZOiVhrF_qelDtZxARcDdkcm5wNhSrRrddgDj62E19R7Nij95BnHPh2B4eOFdJLZKyFXzvCcIrKCfGG7l57dJRiRsS_A9ZcYOUZ8E79WhcIOKZzuD2iu8yqkqEHss4X8XMyiq-gv6jcgLjZaS3QQGAoBnVE0p4MVjOJUWUJWaKDd3dSNHjGI6iPjt0LR_ngt4iGAYImjNqjoOQ" />
          <h2 className="text-xl font-bold text-slate-800">Sarah Jensen</h2>
          <p className="text-sm text-slate-400 font-medium">Senior UI Designer</p>
          <div className="flex gap-4 mt-6">
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-3 bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-2xl transition-all">
                <Phone className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase">Call</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-3 bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-2xl transition-all">
                <Search className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 uppercase">Profile</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-3 bg-slate-50 group-hover:bg-red-50 group-hover:text-red-500 rounded-2xl transition-all">
                <X className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-500 uppercase">Block</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Media Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Shared Media</h4>
              <button className="text-xs text-blue-600 font-bold hover:underline">See all</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <img alt="Shared 1" className="w-full aspect-square rounded-xl object-cover hover:opacity-90 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAae9EU5q1Zbwe8PYHMw7YUmjIWZuLq9A1BgiUYe3Xy-B6J2laQs4YXWOzk1DetmvCmIXgieOhTLdzlbsJ1DKtNyDRtmLtZQhRXT6JnFNY7w2tZnxIif-pXQZbgbQ9VcGc3myhEH0w7B2tzm8JQuaUrAeJV3gx_Z38RMl4hgW8iAtp83ib3XtYUKTUj_K5S8LoiWkdInPALa2NBxlNzN972J0tTku3gtfRRtwJqR1uE9iz6SupvYNy-lBl0Tcklje0Xx4ZpYkviKw" />
              <img alt="Shared 2" className="w-full aspect-square rounded-xl object-cover hover:opacity-90 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF0Ky4RMx5pUpx3MzwKP9iJkW9B-S_nXNKHFu93UWKNGcWXoLges7LEXR0IuAEietbygnKfhaSXWEpnKWUNhn9asxppoR2i0LBIS5YoW3kFy85vE0ZvuEiIEy3y6HPALM4zEiQM7W2yF43ngWEqGGIVAI2cLKiN13MvSk-amyta85MdGxHn-REWBycFJbe-kQWWGslHjCB_Au5q3TMERLW9okVZ2fJ49bcxKz8uGSO9d109Vn_mu72GhjqsnFB3483P39OtlABVg" />
              <img alt="Shared 3" className="w-full aspect-square rounded-xl object-cover hover:opacity-90 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGGMcJUjpSrKEbqdw-OcusNoYVSKeqKuMKYTb0WXmgnPXa0VW2QgsVmviYN7dEw1xN3K7k2dHMri7EcQAyE91RFXr9iksGgFF6lJ0T3iJjBCGkwJO3T7qYivcAwiqqWUkgcSwdnHlXhQi5OLSxXJIZxYJMuhftFj4Eb49Vq0Dxn1vKAFjoueCQnndba0B_6dY46Who4_AZaLjIIdCa9HKgUlNT48Acu-LjFqaHiFD6c1jWR_rF69eTVDO2BH72Hyntqa2aIhP-0A" />
              <img alt="Shared 4" className="w-full aspect-square rounded-xl object-cover hover:opacity-90 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_WJDsO5jBxNpwhrjOqcUQDQ_u_QcpWeWtXHvqmARIOedd0puIEDOZqUesbmUSYjxou0FP6WtwvY962HkHR-FP81_W19S2QIIySY2oi510Dd2MMmeYyEzO7ugbNjWrbo9eRiIkGLTBDHmcgwHi09fj3HLJrXtvww8emKNCjQGYuHSpTJBn3x1r1vildeVvedFxNN3ZvLTNN4WWQuCxIkP4tFTrvbZ13MaVBz1j_GfqV-yR2jhHhrvaC_50nbcemAVkfWAm38LdQQ" />
              <img alt="Shared 5" className="w-full aspect-square rounded-xl object-cover hover:opacity-90 cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsyLjUNs-eDC94Hjhr24ctqizHjV2_57qnyaFHuy08YEoeIetDyPiQQ1d0UJlbDXbvO0DXr_Eq0EJw7Wk7t_Q2iQWcyxI9xC9_pihuiF0M0iPzqmrwWBssjeHN6gZJQcC98NEtl6-NOU4hmoMaikN-C4w0rBqanKAh3bFJHRYEny183aFMNZyXGJYaRPOOLs0eEcma_5xR_-IhRfvU2hu1leNqVWDExU7PB0uqXn11PiUhMfMuK6qKUOL9fOnX4i3HHCMS7n5bQw" />
              <div className="relative w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors">
                +14
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Documents</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">Project_Guidelines.pdf</p>
                  <p className="text-[10px] text-slate-400">1.2 MB • Oct 12, 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">Budget_Q4.xlsx</p>
                  <p className="text-[10px] text-slate-400">840 KB • Oct 10, 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-slate-50">
            <label className="flex items-center justify-between cursor-pointer py-2">
              <span className="text-xs font-semibold text-slate-600">Mute Notifications</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        </div>
      </aside>
    </div>
  );
}
