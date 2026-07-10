import React from 'react';

export default function RefundStatus({ onBack }) {
  const refunds = [
    { id: 1, merchant: 'WOW! Bhubaneswar', method: 'LazyPay', date: '24 Aug 2026', amount: 'Rs 420.00', status: 'Completed', icon: 'storefront' },
    { id: 2, merchant: 'Four Spoon', method: 'Visa ending in 4242', date: '22 Aug 2026', amount: 'Rs 290.00', status: 'Completed', icon: 'restaurant' },
    { id: 3, merchant: 'Behrouz Biryani', method: 'Paytm Wallet', date: '19 Aug 2026', amount: 'Rs 349.00', status: 'Completed', icon: 'lunch_dining' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#e5e1e6] font-sans antialiased pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-[#ffb1c2] hover:opacity-80 transition-opacity flex items-center justify-center p-1 rounded-full hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-bold text-base text-[#ffb1c2] tracking-tighter">Refund Status</h1>
        </div>
        <button 
          onClick={onBack}
          className="text-xs font-mono text-gray-500 hover:text-white px-3 py-1 border border-white/10 rounded-full transition-colors"
        >
          CLOSE
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[600px] mx-auto mt-24 px-4 flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-white text-center">HyperFlow Refund Status</h2>
          <div className="w-12 h-1 bg-[#FF2D78]"></div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#ffb1c2] mt-0.5">info</span>
          <p className="text-xs text-gray-400 leading-normal">
            Refunds will be processed and returned to your original payment source within 3-5 business days.
          </p>
        </div>

        {/* Refund Cards */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed Refunds</h3>
          <div className="flex flex-col gap-3">
            {refunds.map(r => (
              <div 
                key={r.id} 
                className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[20px]">{r.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight">{r.merchant}</span>
                    <span className="text-[10px] text-gray-500 mt-1 font-mono">{r.method} • {r.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-xs font-bold text-white">{r.amount}</span>
                  <div className="flex items-center gap-1 text-[#00E676]">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{r.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Show Older Button */}
        <div className="mt-8 flex justify-center">
          <button className="w-full max-w-[280px] py-3 bg-[#FF2D78] text-white rounded-full text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">history</span>
            Show Older Refunds
          </button>
        </div>
      </main>
    </div>
  );
}
