import React from 'react';

const FleetLogisticsAdmin = ({ onBack }) => {
  return (
    <>

<!-- BEGIN: SidebarNavigation -->
<aside className="w-64 flex flex-col border-r border-borderMain bg-obsidian flex-shrink-0" data-purpose="main-sidebar">
<!-- Brand Identity -->
<div className="h-16 flex items-center px-6 border-b border-borderMain">
<div className="w-4 h-4 bg-accent mr-3"></div>
<h1 className="text-sm font-bold tracking-widest uppercase">HyperFlow</h1>
</div>
<!-- Navigation Links -->
<nav className="flex-1 overflow-y-auto py-4" data-purpose="navigation-menu">
<ul className="space-y-1">
<li>
<a className="flex items-center px-6 py-2 text-sm bg-surfaceHover border-l-2 border-accent text-textPrimary cursor-pointer" onClick={onBack} href="#">
<svg className="w-4 h-4 mr-3 text-accent" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Ops Control
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Fleet Status
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Riders
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Analytics
          </a>
</li>
</ul>
<div className="mt-8 mb-2 px-6">
<h3 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Logistics</h3>
</div>
<ul className="space-y-1">
<li>
<a className="flex items-center px-6 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Routes
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
            Incidents
          </a>
</li>
</ul>
</nav>
<!-- User Profile Area -->
<div className="p-4 border-t border-borderMain">
<div className="flex items-center">
<div className="w-8 h-8 bg-surface border border-borderMain flex items-center justify-center text-xs font-bold text-accent">
          AD
        </div>
<div className="ml-3">
<p className="text-sm font-medium text-textPrimary">Admin User</p>
<p className="text-xs text-textSecondary">System Operator</p>
</div>
</div>
</div>
</aside>
<!-- END: SidebarNavigation -->
<!-- BEGIN: MainContentArea -->
<main className="flex-1 flex flex-col min-w-0" data-purpose="main-dashboard-area">
<!-- BEGIN: TopHeader -->
<header className="h-16 flex items-center justify-between px-8 border-b border-borderMain bg-obsidian shrink-0">
<div className="flex items-center">
<h2 className="text-lg font-medium text-textPrimary">Global Ops Control Center</h2>
<span className="ml-4 px-2 py-0.5 text-xs font-medium bg-surface border border-success text-success">
          SYSTEM OPTIMAL
        </span>
</div>
<div className="flex items-center space-x-6 text-sm text-textSecondary">
<div className="flex items-center">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
          Zone: NA-EAST
        </div>
<div>
<span className="text-textPrimary font-mono">14:42:09 UTC</span>
</div>
</div>
</header>
<!-- END: TopHeader -->
<!-- Dashboard Content Scrollable Area -->
<div className="flex-1 overflow-auto p-8 bg-obsidian flex flex-col space-y-6">
<!-- BEGIN: KeyMetricsSection -->
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-purpose="logistics-metrics">
<!-- Metric Card 1 -->
<article className="bg-surface border border-borderMain p-5 flex flex-col justify-between h-28">
<div className="flex justify-between items-start">
<h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">Active Riders</h3>
<svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
</div>
<div className="flex items-baseline space-x-2">
<span className="text-3xl font-light text-textPrimary">1,204</span>
<span className="text-xs font-medium text-success">+4.2%</span>
</div>
</article>
<!-- Metric Card 2 -->
<article className="bg-surface border border-borderMain p-5 flex flex-col justify-between h-28">
<div className="flex justify-between items-start">
<h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">Deliveries in Transit</h3>
</div>
<div className="flex items-baseline space-x-2">
<span className="text-3xl font-light text-textPrimary">842</span>
<span className="text-xs font-medium text-warning">High Load</span>
</div>
</article>
<!-- Metric Card 3 -->
<article className="bg-surface border border-borderMain p-5 flex flex-col justify-between h-28">
<div className="flex justify-between items-start">
<h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">Avg Delivery Time</h3>
<svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5"></path></svg>
</div>
<div className="flex items-baseline space-x-2">
<span className="text-3xl font-light text-textPrimary">24m</span>
<span className="text-xs font-medium text-textSecondary">-2m vs avg</span>
</div>
</article>
<!-- Metric Card 4 -->
<article className="bg-surface border border-borderMain p-5 flex flex-col justify-between h-28">
<div className="flex justify-between items-start">
<h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">Success Rate (Daily)</h3>
</div>
<div className="flex items-baseline space-x-2">
<span className="text-3xl font-light text-textPrimary">98.5%</span>
</div>
<div className="w-full bg-obsidian h-1 mt-2 border border-borderMain">
<div className="bg-success h-full" style="width: 98.5%"></div>
</div>
</article>
</section>
<!-- END: KeyMetricsSection -->
<!-- BEGIN: MainDashboardGrid -->
<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
<!-- Live Rider Tracking Map (Left / Center) -->
<div className="lg:col-span-2 border border-borderMain bg-surface flex flex-col relative" data-purpose="rider-tracking-map">
<div className="px-5 py-3 border-b border-borderMain flex justify-between items-center bg-obsidian">
<h3 className="text-sm font-medium text-textPrimary">Live Rider Tracking</h3>
<div className="flex space-x-2">
<button className="px-3 py-1 text-xs border border-borderMain text-textSecondary hover:text-textPrimary hover:bg-surfaceHover">Filter: All</button>
<button className="px-3 py-1 text-xs border border-borderMain text-textSecondary hover:text-textPrimary hover:bg-surfaceHover">Map View</button>
</div>
</div>
<!-- Map Image Placeholder Container -->
<div className="flex-1 relative bg-obsidian overflow-hidden">
<!-- Using the requested image as the map visual -->
<img alt="Live Rider Map Visual" className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale contrast-125" src="https://lh3.googleusercontent.com/aida/AP1WRLs0Jeh45OI-ZPsSnh1UdfZRoLM1W96iLTXc16YE0Q6UaO9vwEOwoCgb8v9UY_k5A6w7xxARXUL-m_dzIX2Vn1RDPOgZe5omMv4InqVXGGiAcDXN5NRyenk4smjPa51I-6tNrMu5e46lr-CGTpy7er-mmqz9_DnuF6_XFtA5MBePdStaQaqogmWW-y_mxd69_SJa8BliqPjk00Zn3Ao5ny6DAav2gTAboczygIQL8PPWLB4TYvZqheZiW2kH"/>
<!-- Map Overlay UI Elements -->
<div className="absolute top-4 left-4 bg-surface border border-borderMain p-3 max-w-xs">
<h4 className="text-xs font-bold text-textPrimary mb-2">Zone Alpha Alert</h4>
<p className="text-xs text-textSecondary">High traffic density detected in sector 4G. Routing algorithms updated automatically.</p>
</div>
<!-- Simulated Map Markers (using precision styling) -->
<div className="absolute top-1/3 left-1/4 flex flex-col items-center">
<div className="w-3 h-3 bg-accent border border-obsidian mb-1"></div>
<div className="px-1.5 py-0.5 bg-surface border border-borderMain text-[10px] text-textPrimary">R-492</div>
</div>
<div className="absolute top-1/2 left-2/3 flex flex-col items-center">
<div className="w-3 h-3 bg-success border border-obsidian mb-1"></div>
<div className="px-1.5 py-0.5 bg-surface border border-borderMain text-[10px] text-textPrimary">R-118</div>
</div>
<div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
<div className="w-3 h-3 bg-warning border border-obsidian mb-1"></div>
<div className="px-1.5 py-0.5 bg-surface border border-borderMain text-[10px] text-textPrimary">R-883</div>
</div>
</div>
</div>
<!-- Logistics Events & Alerts Sidebar (Right) -->
<div className="border border-borderMain bg-surface flex flex-col" data-purpose="events-sidebar">
<div className="px-5 py-3 border-b border-borderMain bg-obsidian">
<h3 className="text-sm font-medium text-textPrimary">System Events</h3>
</div>
<div className="flex-1 overflow-y-auto">
<ul className="divide-y divide-borderMain">
<!-- Event Item: Alert -->
<li className="p-4 hover:bg-surfaceHover transition-colors cursor-pointer border-l-2 border-danger">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold text-danger">CRITICAL ALERT</span>
<span className="text-xs text-textSecondary">2m ago</span>
</div>
<p className="text-sm text-textPrimary">Rider R-112 connection lost in Sector 7. Last known location saved.</p>
</li>
<!-- Event Item: Warning -->
<li className="p-4 hover:bg-surfaceHover transition-colors cursor-pointer border-l-2 border-warning">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold text-warning">DELAY WARNING</span>
<span className="text-xs text-textSecondary">14m ago</span>
</div>
<p className="text-sm text-textPrimary">ETA for Order #99281 exceeded by 5 minutes. Customer notified.</p>
</li>
<!-- Event Item: Info -->
<li className="p-4 hover:bg-surfaceHover transition-colors cursor-pointer border-l-2 border-accent">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold text-accent">ROUTE UPDATE</span>
<span className="text-xs text-textSecondary">32m ago</span>
</div>
<p className="text-sm text-textPrimary">Global optimization matrix updated. 45 active routes adjusted for efficiency.</p>
</li>
<!-- Event Item: Info -->
<li className="p-4 hover:bg-surfaceHover transition-colors cursor-pointer border-l-2 border-borderMain">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold text-textSecondary">SYSTEM LOG</span>
<span className="text-xs text-textSecondary">1h ago</span>
</div>
<p className="text-sm text-textSecondary">Shift change completed. 412 new riders authenticated.</p>
</li>
<!-- Event Item: Info -->
<li className="p-4 hover:bg-surfaceHover transition-colors cursor-pointer border-l-2 border-borderMain">
<div className="flex justify-between items-start mb-1">
<span className="text-xs font-semibold text-textSecondary">SYSTEM LOG</span>
<span className="text-xs text-textSecondary">2h ago</span>
</div>
<p className="text-sm text-textSecondary">Database backup confirmed for NA-EAST cluster.</p>
</li>
</ul>
</div>
<div className="p-4 border-t border-borderMain bg-obsidian">
<button className="w-full py-2 text-sm text-textPrimary bg-surface border border-borderMain hover:bg-surfaceHover transition-colors">
              View All Events
            </button>
</div>
</div>
</section>
<!-- END: MainDashboardGrid -->
</div>
</main>
<!-- END: MainContentArea -->

    </>
  );
};

export default FleetLogisticsAdmin;
