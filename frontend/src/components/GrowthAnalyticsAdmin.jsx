import React from 'react';

const GrowthAnalyticsAdmin = ({ onBack }) => {
  return (
    <>

<!-- BEGIN: SidebarNavigation -->
<aside className="w-64 border-r border-obsidian-border bg-obsidian-900 flex flex-col flex-shrink-0 z-20">
<!-- Brand Logo -->
<div className="h-16 flex items-center px-6 border-b border-obsidian-border">
<div className="flex items-center gap-2 text-zinc-100 font-semibold tracking-wide">
<svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" strokeWidth="2" viewbox="0 0 24 24">
<path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
        HyperFlow
      </div>
</div>
<!-- Navigation Links -->
<nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
<a className="flex items-center gap-3 px-3 py-2 rounded bg-obsidian-800 border border-obsidian-border text-zinc-100 transition-colors group cursor-pointer" onClick={onBack} href="#">
<svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-sm font-medium">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-obsidian-700 text-zinc-400 hover:text-zinc-100 transition-colors group" href="#">
<svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-sm font-medium">Analytics</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-obsidian-700 text-zinc-400 hover:text-zinc-100 transition-colors group" href="#">
<svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-sm font-medium">Campaigns</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 rounded hover:bg-obsidian-700 text-zinc-400 hover:text-zinc-100 transition-colors group" href="#">
<svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="text-sm font-medium">Users</span>
</a>
</nav>
</aside>
<!-- END: SidebarNavigation -->
<!-- BEGIN: MainContentArea -->
<main className="flex-1 flex flex-col min-w-0 bg-obsidian-900 z-10 relative">
<!-- BEGIN: TopHeader -->
<header className="h-16 border-b border-obsidian-border bg-obsidian-900 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20">
<!-- Search -->
<div className="flex-1 max-w-md relative">
<svg className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<input className="w-full bg-obsidian-800 border border-obsidian-border rounded pl-9 pr-4 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors" placeholder="Search analytics..." type="text"/>
</div>
<!-- Right Actions -->
<div className="flex items-center gap-4 ml-4">
<button className="text-zinc-400 hover:text-zinc-200 transition-colors">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
</button>
<!-- User Avatar Container -->
<div className="w-8 h-8 rounded-full border border-obsidian-border overflow-hidden bg-obsidian-800">
<img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLs8ICeO9hIXxS0I65mspRo4MYHMSNpqxY4xzosQR8V187PTBxfMXWhQa9C6s2Hobl93IUmx58bbg79iSQRugsFpqkAvhTlOuNO0UIE9mft1eW7JHY2_V3px21XpRiqsmH0YVOjihO5lzdSw9Fud6PyR-ryqISNsoTaOfZl89Q1z5B4fOmb82WhxN6gTUpKfn2x7n8kHbtYg9B0yYYCddpBdFTl-BwrYxWPBFsIg69BGadxTVg6v46JIiunZ"/>
</div>
</div>
</header>
<!-- END: TopHeader -->
<!-- BEGIN: DashboardContent -->
<div className="flex-1 overflow-y-auto p-6 lg:p-8">
<div className="max-w-7xl mx-auto space-y-6">
<!-- Page Title & Actions -->
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Growth &amp; Analytics</h1>
<div className="flex items-center gap-2">
<select className="bg-obsidian-800 border border-obsidian-border rounded px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500">
<option>Last 30 Days</option>
<option>Last Quarter</option>
<option>Year to Date</option>
</select>
<button className="bg-zinc-100 hover:bg-white text-zinc-900 border border-transparent rounded px-4 py-1.5 text-sm font-medium transition-colors">
              Export Report
            </button>
</div>
</div>
<!-- BEGIN: KPIGrid -->
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-purpose="kpi-metrics">
<!-- KPI 1 -->
<div className="bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col justify-between">
<div className="text-sm text-zinc-400 font-medium mb-1">Total Users</div>
<div className="flex items-end justify-between">
<div className="text-3xl font-semibold text-zinc-100">124,592</div>
<div className="text-sm text-emerald-400 flex items-center gap-1">
<svg className="w-3 h-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                12.5%
              </div>
</div>
</div>
<!-- KPI 2 -->
<div className="bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col justify-between">
<div className="text-sm text-zinc-400 font-medium mb-1">Active Campaigns</div>
<div className="flex items-end justify-between">
<div className="text-3xl font-semibold text-zinc-100">14</div>
<div className="text-sm text-zinc-500 flex items-center gap-1">
                --
              </div>
</div>
</div>
<!-- KPI 3 -->
<div className="bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col justify-between">
<div className="text-sm text-zinc-400 font-medium mb-1">Monthly Recurring Revenue</div>
<div className="flex items-end justify-between">
<div className="text-3xl font-semibold text-zinc-100">$84.2k</div>
<div className="text-sm text-emerald-400 flex items-center gap-1">
<svg className="w-3 h-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                8.1%
              </div>
</div>
</div>
<!-- KPI 4 -->
<div className="bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col justify-between">
<div className="text-sm text-zinc-400 font-medium mb-1">Avg. Retention (D30)</div>
<div className="flex items-end justify-between">
<div className="text-3xl font-semibold text-zinc-100">42.8%</div>
<div className="text-sm text-rose-400 flex items-center gap-1">
<svg className="w-3 h-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                2.4%
              </div>
</div>
</div>
</section>
<!-- END: KPIGrid -->
<!-- BEGIN: MainChartsSection -->
<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<!-- User Growth Chart (2 columns wide) -->
<div className="lg:col-span-2 bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col min-h-[300px]">
<div className="flex items-center justify-between mb-4">
<h3 className="text-base font-medium text-zinc-200">User Growth Trends</h3>
<div className="flex items-center gap-3 text-xs text-zinc-400">
<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-500"></span> New Signups</div>
<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Churn</div>
</div>
</div>
<!-- Chart Container (Placeholder for Canvas/SVG) -->
<div className="flex-1 w-full relative" id="growth-chart-container">
<canvas className="w-full h-full" id="growthChart"></canvas>
</div>
</div>
<!-- Retention Metrics (1 column wide) -->
<div className="bg-obsidian-800 border border-obsidian-border rounded-lg p-5 flex flex-col">
<h3 className="text-base font-medium text-zinc-200 mb-4">Top Conversion Sources</h3>
<div className="flex-1 space-y-4">
<!-- Source Item -->
<div className="space-y-1">
<div className="flex justify-between text-sm">
<span className="text-zinc-300">Organic Search</span>
<span className="text-zinc-100 font-medium">45%</span>
</div>
<div className="w-full h-1.5 bg-obsidian-900 rounded overflow-hidden border border-obsidian-border">
<div className="h-full bg-accent-500 w-[45%]"></div>
</div>
</div>
<!-- Source Item -->
<div className="space-y-1">
<div className="flex justify-between text-sm">
<span className="text-zinc-300">Paid Social (Q3)</span>
<span className="text-zinc-100 font-medium">28%</span>
</div>
<div className="w-full h-1.5 bg-obsidian-900 rounded overflow-hidden border border-obsidian-border">
<div className="h-full bg-accent-400 w-[28%]"></div>
</div>
</div>
<!-- Source Item -->
<div className="space-y-1">
<div className="flex justify-between text-sm">
<span className="text-zinc-300">Referrals</span>
<span className="text-zinc-100 font-medium">15%</span>
</div>
<div className="w-full h-1.5 bg-obsidian-900 rounded overflow-hidden border border-obsidian-border">
<div className="h-full bg-zinc-400 w-[15%]"></div>
</div>
</div>
</div>
</div>
</section>
<!-- END: MainChartsSection -->
<!-- BEGIN: CampaignTable -->
<section className="bg-obsidian-800 border border-obsidian-border rounded-lg overflow-hidden">
<div className="px-5 py-4 border-b border-obsidian-border flex items-center justify-between bg-obsidian-900/50">
<h3 className="text-base font-medium text-zinc-200">Active Marketing Campaigns</h3>
<button className="text-sm text-accent-400 hover:text-accent-300 font-medium">View All</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse whitespace-nowrap">
<thead>
<tr className="bg-obsidian-900/20">
<th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-obsidian-border">Campaign Name</th>
<th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-obsidian-border">Status</th>
<th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-obsidian-border">Spend</th>
<th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-obsidian-border">Conversion (CPA)</th>
<th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-obsidian-border text-right">ROI</th>
</tr>
</thead>
<tbody className="divide-y divide-obsidian-border">
<!-- Row 1 -->
<tr className="hover:bg-obsidian-700/30 transition-colors">
<td className="px-5 py-4 text-sm text-zinc-200 font-medium">Q3 Retargeting Alpha</td>
<td className="px-5 py-4 text-sm">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                    </span>
</td>
<td className="px-5 py-4 text-sm text-zinc-400">$12,450</td>
<td className="px-5 py-4 text-sm text-zinc-400">$42.50</td>
<td className="px-5 py-4 text-sm text-emerald-400 text-right">+245%</td>
</tr>
<!-- Row 2 -->
<tr className="hover:bg-obsidian-700/30 transition-colors">
<td className="px-5 py-4 text-sm text-zinc-200 font-medium">Influencer Batch #4</td>
<td className="px-5 py-4 text-sm">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                    </span>
</td>
<td className="px-5 py-4 text-sm text-zinc-400">$8,200</td>
<td className="px-5 py-4 text-sm text-zinc-400">$38.10</td>
<td className="px-5 py-4 text-sm text-emerald-400 text-right">+180%</td>
</tr>
<!-- Row 3 -->
<tr className="hover:bg-obsidian-700/30 transition-colors">
<td className="px-5 py-4 text-sm text-zinc-200 font-medium">Cold Outreach UK</td>
<td className="px-5 py-4 text-sm">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
<span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Paused
                    </span>
</td>
<td className="px-5 py-4 text-sm text-zinc-400">$3,100</td>
<td className="px-5 py-4 text-sm text-zinc-400">$85.00</td>
<td className="px-5 py-4 text-sm text-rose-400 text-right">-12%</td>
</tr>
</tbody>
</table>
</div>
</section>
<!-- END: CampaignTable -->
</div>
</div>
<!-- END: DashboardContent -->
</main>
<!-- END: MainContentArea -->
<!-- Script for rendering a mockup chart on the canvas -->
<script data-purpose="chart-mockup">
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('growthChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      // Handle high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const width = rect.width;
      const height = rect.height;

      // Mock Data points
      const points = [20, 35, 30, 50, 45, 70, 65, 85, 100, 90, 110, 130];
      const maxVal = Math.max(...points);
      
      const padding = 20;
      const graphWidth = width - (padding * 2);
      const graphHeight = height - (padding * 2);

      // Draw subtle grid lines
      ctx.strokeStyle = '#27272a'; // obsidian-border
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<=4; i++) {
        const y = padding + (graphHeight / 4) * i;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
      }
      ctx.stroke();

      // Draw Line Chart
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6'; // accent-500
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      
      points.forEach((val, index) => {
        const x = padding + (graphWidth / (points.length - 1)) * index;
        const y = padding + graphHeight - ((val / maxVal) * graphHeight);
        
        if(index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Create subtle gradient fill under the line (simulating an area chart slightly)
      // Removing area fill to strictly adhere to 'no glow/blur' and keep it sharp 1px style, 
      // but a flat subtle fill is acceptable. Let's keep it just a clean line for precision.
    });
  </script>

    </>
  );
};

export default GrowthAnalyticsAdmin;
