import React, { useState } from 'react';

export default function FinancialOpsAdmin({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    { id: 'TXN-0982-A', dateTime: 'Oct 24, 14:32:01', amount: '$1,250.00', destination: 'Acme Corp', status: 'Completed' },
    { id: 'TXN-0981-B', dateTime: 'Oct 24, 14:28:44', amount: '$8,400.00', destination: 'Stark Ind.', status: 'Completed' },
    { id: 'TXN-0980-C', dateTime: 'Oct 24, 14:15:30', amount: '$430.50', destination: 'Wayne Ent.', status: 'Pending' },
    { id: 'TXN-0979-D', dateTime: 'Oct 24, 14:02:12', amount: '$12,500.00', destination: 'Tyrell Corp', status: 'Completed' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0F] text-[#e4e1e9] font-sans antialiased flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0A0A0F] border-b md:border-b-0 md:border-r border-[#262626] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#262626] justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FF0077] mr-3"></div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white">HYPERFLOW</h1>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden text-xs font-mono text-gray-500 hover:text-white px-2 py-1 border border-[#262626] hover:bg-[#262626] transition-colors"
            >
              BACK
            </button>
          )}
        </div>
        <nav className="flex-grow py-4">
          <ul className="space-y-1 px-3">
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm bg-[#12121A] text-white border border-[#262626]">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-[#12121A] transition-colors border border-transparent">
                Transactions
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-[#12121A] transition-colors border border-transparent">
                Payouts
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-[#262626]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#12121A] border border-[#262626] flex items-center justify-center text-xs font-bold text-[#FF0077]">
              AD
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-white">SysAdmin</p>
              <p className="text-[10px] text-gray-500">Financial Ops</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#0A0A0F]">
        <header className="h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 border-b border-[#262626] bg-[#0A0A0F] shrink-0 py-2 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm sm:text-base font-semibold text-white">Financial Operations</h1>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            {onBack && (
              <button 
                onClick={onBack}
                className="hidden md:inline-flex px-3 py-1.5 text-xs border border-[#262626] hover:bg-[#12121A] text-white transition-colors"
              >
                ← BACK
              </button>
            )}
            <div className="flex items-center space-x-2 border border-[#262626] px-3 py-1.5 bg-[#080808]">
              <span>Oct 1, 2023 - Oct 31, 2023</span>
            </div>
            <button className="px-3 py-1.5 border border-[#262626] hover:bg-[#12121A] text-white text-xs font-bold transition-all">
              Export CSV
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Overview cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <article className="border border-[#262626] bg-[#0C0C0C] p-5 flex flex-col justify-between rounded-xl">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Available Balance</h3>
                <div className="text-xl font-bold text-white font-mono">$1,240,500.00</div>
                <div className="mt-4 flex items-center text-xs text-[#00E676]">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                  <span>+2.4% from last week</span>
                </div>
              </article>

              <article className="border border-[#262626] bg-[#0C0C0C] p-5 flex flex-col justify-between rounded-xl">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pending Payouts</h3>
                <div className="text-xl font-bold text-white font-mono">$45,200.00</div>
                <div className="mt-4 flex items-center text-xs text-[#F59E0B]">
                  <span className="material-symbols-outlined text-[14px] mr-1">pending_actions</span>
                  <span>12 transfers pending</span>
                </div>
              </article>

              <article className="border border-[#262626] bg-[#0C0C0C] p-5 flex flex-col justify-between rounded-xl">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">30d Volume</h3>
                <div className="text-xl font-bold text-white font-mono">$5,420,100.00</div>
                <div className="mt-4 flex items-center text-xs text-[#00E676]">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                  <span>+14.1% vs previous 30d</span>
                </div>
              </article>

              <article className="border border-[#262626] bg-[#0C0C0C] p-5 flex flex-col justify-between rounded-xl">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Success Rate</h3>
                <div className="text-xl font-bold text-white font-mono">99.98%</div>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <span>Based on 142k transactions</span>
                </div>
              </article>
            </section>

            {/* Content Table Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <section className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wide">Recent Transactions</h2>
                  <button className="text-xs text-[#FF0077] hover:underline font-bold">View All →</button>
                </div>
                
                <div className="border border-[#262626] bg-[#0C0C0C] rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-[#12121A] border-b border-[#262626]">
                      <tr>
                        <th className="p-3 text-xs font-mono text-gray-500 font-normal uppercase">Transaction ID</th>
                        <th className="p-3 text-xs font-mono text-gray-500 font-normal uppercase">Date & Time</th>
                        <th className="p-3 text-xs font-mono text-gray-500 font-normal uppercase text-right">Amount</th>
                        <th className="p-3 text-xs font-mono text-gray-500 font-normal uppercase">Destination</th>
                        <th className="p-3 text-xs font-mono text-gray-500 font-normal uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs text-[#e4e1e9]">
                      {transactions.map(t => (
                        <tr key={t.id} className="border-b border-[#262626] hover:bg-[#12121A]/30 transition-colors">
                          <td className="p-3 text-white">{t.id}</td>
                          <td className="p-3 text-gray-500">{t.dateTime}</td>
                          <td className="p-3 text-right text-white font-semibold">{t.amount}</td>
                          <td className="p-3 text-[#e4e1e9]">{t.destination}</td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold ${
                              t.status === 'Completed' ? 'border-[#00E676] text-[#00E676]' : 'border-[#F59E0B] text-[#F59E0B]'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Quick Transfer sidebar */}
              <section className="lg:col-span-1 border border-[#262626] bg-[#0C0C0C] p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#262626] pb-2">Quick Transfer</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-500">RECIPIENT ADDRESS</label>
                    <input 
                      className="w-full bg-[#0A0A0F] border border-[#262626] text-white px-3 py-2 text-xs font-mono focus:border-white focus:outline-none" 
                      placeholder="0x71C...3A9" 
                      type="text"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-gray-500">AMOUNT (USD)</label>
                    <input 
                      className="w-full bg-[#0A0A0F] border border-[#262626] text-white px-3 py-2 text-xs font-mono focus:border-white focus:outline-none" 
                      placeholder="0.00" 
                      type="number"
                    />
                  </div>
                  
                  <button className="w-full py-2.5 bg-[#FF0077] hover:bg-[#FF0077]/90 text-white text-xs font-mono font-bold transition-colors">
                    INITIATE PAYOUT
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
