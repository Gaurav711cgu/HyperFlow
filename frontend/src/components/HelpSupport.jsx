import React from 'react';

export default function HelpSupport({ onBack, onOpenChatbot }) {
  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#e5e1e6] font-sans antialiased pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#080808] border-b border-white/10 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4 cursor-pointer">
          <button 
            onClick={onBack}
            className="text-[#FF2D78] hover:opacity-80 transition-opacity flex items-center justify-center p-1 rounded-full hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <span className="font-bold text-base tracking-tight text-white">HyperFlow Support</span>
        </div>
        <button 
          onClick={onBack}
          className="text-xs font-mono text-gray-500 hover:text-white px-3 py-1 border border-white/10 rounded-full transition-colors"
        >
          CLOSE
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[600px] mx-auto mt-24 px-4 flex flex-col gap-8">
        <section className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">Support Center</h1>
          <p className="text-xs text-gray-400">Manage your orders and resolve issues quickly.</p>
        </section>

        {/* Order support */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Help with your orders</h2>
          
          <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#FF2D78]">receipt_long</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Order #HF-9982X</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] font-mono text-[9px]">Delivered</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1">1x Golden Corn, 1x Margherita Pizza</span>
                <span className="text-[9px] font-mono text-gray-500 mt-0.5">Today, 14:32</span>
              </div>
            </div>
            <button 
              onClick={onOpenChatbot}
              className="border border-[#FF2D78] text-[#FF2D78] hover:bg-[#FF2D78]/10 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors shrink-0 w-full sm:w-auto"
            >
              CHAT SUPPORT
            </button>
          </div>

          <button 
            onClick={onOpenChatbot}
            className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors w-full text-left"
          >
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <span className="material-symbols-outlined text-gray-400">history</span>
              Issues with Previous Orders
            </div>
            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
          </button>
        </section>

        {/* Other Queries */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Help with other queries</h2>
          
          <div className="bg-[#0A0A0F] border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <button className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors w-full text-left">
              <span className="text-xs text-white">HyperFlow One FAQs</span>
              <span className="material-symbols-outlined text-gray-500 text-sm">arrow_forward</span>
            </button>
            
            <button className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors w-full text-left">
              <span className="text-xs text-white">General issues</span>
              <span className="material-symbols-outlined text-gray-500 text-sm">arrow_forward</span>
            </button>

            <button className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors w-full text-left">
              <span className="text-xs text-white">Partner Onboarding</span>
              <span className="material-symbols-outlined text-gray-500 text-sm">arrow_forward</span>
            </button>

            <button className="flex justify-between items-center p-4 border-b border-[#FF3366]/10 hover:bg-white/5 transition-colors w-full text-left">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF3366] text-sm">warning</span>
                <span className="text-xs text-[#FF3366] font-bold">Report Safety Emergency</span>
              </div>
              <span className="material-symbols-outlined text-[#FF3366] text-sm">arrow_forward</span>
            </button>

            <button className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors w-full text-left">
              <span className="text-xs text-white">HyperMart Onboarding</span>
              <span className="material-symbols-outlined text-gray-500 text-sm">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
