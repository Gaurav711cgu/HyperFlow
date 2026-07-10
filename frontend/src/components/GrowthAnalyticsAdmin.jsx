import React, { useState } from 'react';

export default function GrowthAnalyticsAdmin({ onBack }) {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const sources = [
    { name: 'Organic Search', percent: 45, color: '#3B82F6' },
    { name: 'Paid Social (Q3)', percent: 28, color: '#10B981' },
    { name: 'Referral Programs', percent: 18, color: '#F59E0B' },
    { name: 'Direct Traffic', percent: 9, color: '#8B5CF6' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#080808] text-zinc-300 font-sans antialiased flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0C0C0C] border-b md:border-b-0 md:border-r border-[#222222] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#222222] justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#10B981] mr-3"></div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white">HYPERFLOW</h1>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden text-xs font-mono text-zinc-500 hover:text-white px-2 py-1 border border-[#222222] hover:bg-[#222222] transition-colors"
            >
              BACK
            </button>
          )}
        </div>
        <nav className="flex-grow py-4">
          <ul className="space-y-1 px-3">
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm bg-[#12121A] text-white border border-[#222222]">
                Analytics Home
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm text-zinc-500 hover:text-white hover:bg-[#12121A] transition-colors border border-transparent">
                Campaigns
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-sm text-zinc-500 hover:text-white hover:bg-[#12121A] transition-colors border border-transparent">
                Retention Reports
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-[#222222]">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#12121A] border border-[#222222] flex items-center justify-center text-xs font-bold text-[#10B981]">
              GN
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-white">Gaurav Nayak</p>
              <p className="text-[10px] text-zinc-500">Growth Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#080808]">
        {/* Header */}
        <header className="h-16 border-b border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 bg-[#0C0C0C]/50 backdrop-blur-sm shrink-0 py-2 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm sm:text-base font-semibold text-white">Growth & Analytics</h1>
          </div>
          <div className="flex items-center space-x-4 text-xs text-zinc-500 w-full sm:w-auto justify-between sm:justify-start">
            {onBack && (
              <button 
                onClick={onBack}
                className="hidden md:inline-flex px-3 py-1.5 text-xs border border-[#222222] hover:bg-[#12121A] text-white transition-colors"
              >
                ← BACK
              </button>
            )}
            <select 
              className="bg-black border border-[#222222] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
            <button className="bg-zinc-100 hover:bg-white text-zinc-900 border border-transparent rounded px-4 py-1.5 text-xs font-medium transition-colors">
              Export Report
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {/* KPI grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col justify-between">
              <div className="text-xs text-zinc-400 font-medium mb-1">Total Users</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">124,592</div>
                <div className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  12.5%
                </div>
              </div>
            </div>

            <div className="bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col justify-between">
              <div className="text-xs text-zinc-400 font-medium mb-1">Active Campaigns</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">14</div>
                <div className="text-xs text-zinc-500">Steady</div>
              </div>
            </div>

            <div className="bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col justify-between">
              <div className="text-xs text-zinc-400 font-medium mb-1">Monthly Recurring Revenue</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">$84.2k</div>
                <div className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_up</span>
                  8.1%
                </div>
              </div>
            </div>

            <div className="bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col justify-between">
              <div className="text-xs text-zinc-400 font-medium mb-1">Avg. Retention (D30)</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">42.8%</div>
                <div className="text-xs text-rose-400 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">trending_down</span>
                  2.4%
                </div>
              </div>
            </div>
          </section>

          {/* Charts grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Growth Chart */}
            <div className="lg:col-span-2 bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">User Growth Trends</h3>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> New Signups
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF3366]"></span> Churn
                  </div>
                </div>
              </div>
              
              {/* Graphical Line SVG */}
              <div className="flex-1 w-full bg-black/40 border border-[#222222] rounded-xl flex items-center justify-center p-6">
                <svg className="w-full h-full min-h-[180px]" viewBox="0 0 500 150">
                  <g fill="none">
                    <path d="M0,120 Q80,90 160,80 T320,40 T480,25" stroke="#10B981" strokeWidth="3" />
                    <path d="M0,130 Q100,110 200,115 T400,95 T480,98" stroke="#FF3366" strokeWidth="1.5" strokeDasharray="4 4" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Conversion metrics */}
            <div className="bg-[#0C0C0C] border border-[#222222] rounded-lg p-5 flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Top Conversion Sources</h3>
              <div className="flex-grow space-y-4">
                {sources.map(s => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">{s.name}</span>
                      <span className="text-white font-bold">{s.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded overflow-hidden border border-[#222222]">
                      <div className="h-full rounded transition-all duration-500" style={{ width: `${s.percent}%`, backgroundColor: s.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
