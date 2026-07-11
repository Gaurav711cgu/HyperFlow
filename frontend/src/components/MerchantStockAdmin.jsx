import React from 'react';

const MerchantStockAdmin = () => {
  return (
    <>

{/* BEGIN: Sidebar Navigation */}
<aside className="w-64 flex-shrink-0 bg-panel border-r border-borderline flex flex-col" data-purpose="main-sidebar">
{/* Brand Logo Area */}
<div className="h-16 border-b border-borderline flex items-center px-6">
<div className="flex items-center gap-3">
<img alt="HyperFlow Logo" className="w-8 h-8 object-cover border border-borderline" onerror="this.src='https://placehold.co/32x32/111/fff?text=HF'" src="https://lh3.googleusercontent.com/aida/AP1WRLsikRCiFWzxa8uRYE01uf1ecBzjl1sRBQrWLNL1MWwfEA4tEBmUCDrKhjbNA5hm7wsV1ZYmX6FtRL5eRyrGB9cOM0cS9PMAwjLooiumNFhK0eVpTRyvnih-26nrz0cUtHz32F3xWm4kTPLbtMVEn08CxLZUFy4vV-d_rQP4mvsDenkD2ve5up6ymgS96aYiOxqPl9vziPsGuOpsVqqlpTzxOklcUl7FZv4sa7odVD_bQTTmro9KxUAfKA6t"/>
<span className="font-mono text-sm font-bold tracking-widest text-highlight">HYPERFLOW</span>
</div>
</div>
{/* Navigation Links */}
<nav className="flex-1 overflow-y-auto py-6" data-purpose="nav-links">
<ul className="space-y-1">
<li>
<a className="flex items-center px-6 py-2 text-sm font-mono text-muted hover:text-highlight hover:bg-borderline transition-colors" href="#">
<span className="w-5 h-5 mr-3 border border-current flex items-center justify-center text-[10px]">01</span>
            OVERVIEW
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm font-mono text-obsidian bg-highlight transition-colors relative" href="#">
<span className="w-5 h-5 mr-3 border border-obsidian flex items-center justify-center text-[10px]">02</span>
            MERCHANT &amp; STOCK
            <span className="absolute right-6 w-1.5 h-1.5 bg-obsidian rounded-none"></span>
</a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm font-mono text-muted hover:text-highlight hover:bg-borderline transition-colors" href="#">
<span className="w-5 h-5 mr-3 border border-current flex items-center justify-center text-[10px]">03</span>
            TRANSACTIONS
          </a>
</li>
<li>
<a className="flex items-center px-6 py-2 text-sm font-mono text-muted hover:text-highlight hover:bg-borderline transition-colors" href="#">
<span className="w-5 h-5 mr-3 border border-current flex items-center justify-center text-[10px]">04</span>
            SYSTEM CONFIG
          </a>
</li>
</ul>
</nav>
{/* User Profile Minimal */}
<div className="p-6 border-t border-borderline">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-obsidian border border-borderline flex items-center justify-center text-xs font-mono">AD</div>
<div>
<div className="text-xs font-mono text-highlight">ADMIN_ROOT</div>
<div className="text-[10px] font-mono text-accent">ONLINE</div>
</div>
</div>
</div>
</aside>
{/* END: Sidebar Navigation */}
{/* BEGIN: Main Content Area */}
<main className="flex-1 flex flex-col min-w-0 bg-obsidian" data-purpose="main-content-area">
{/* BEGIN: Top Header */}
<header className="h-16 border-b border-borderline flex items-center justify-between px-8 bg-panel/50 backdrop-blur-sm" data-purpose="top-header">
<div className="flex items-center gap-4">
<h1 className="text-lg font-mono font-medium tracking-wide">MERCHANT &amp; STOCK ADMIN</h1>
<span className="px-2 py-0.5 border border-borderline text-[10px] font-mono text-muted bg-obsidian">ENV: PROD</span>
</div>
<div className="flex items-center gap-4">
<div className="relative w-64">
<input className="input-tech" placeholder="SEARCH ID OR HASH..." type="text"/>
</div>
<button className="btn-tech">
          EXPORT LOG
        </button>
<button className="btn-tech btn-tech-primary">
          + NEW ENTITY
        </button>
</div>
</header>
{/* END: Top Header */}
{/* BEGIN: Scrollable Content */}
<div className="flex-1 overflow-y-auto p-8 space-y-8" data-purpose="dashboard-content">
{/* Layout Grid for Sections */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
{/* BEGIN: Merchant List Section */}
<section className="xl:col-span-2 flex flex-col gap-4" data-purpose="merchant-list-section">
<header className="flex justify-between items-end border-b border-borderline pb-2">
<h2 className="text-sm font-mono text-muted tracking-widest">MERCHANT DIRECTORY</h2>
<div className="text-xs font-mono text-muted">TOTAL: 1,042</div>
</header>
<div className="border border-borderline bg-panel overflow-hidden">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-borderline bg-obsidian">
<th className="p-3 text-xs font-mono text-muted font-normal uppercase border-r border-borderline w-16">ID</th>
<th className="p-3 text-xs font-mono text-muted font-normal uppercase border-r border-borderline">Entity Name</th>
<th className="p-3 text-xs font-mono text-muted font-normal uppercase border-r border-borderline">API Key Status</th>
<th className="p-3 text-xs font-mono text-muted font-normal uppercase border-r border-borderline">Volume (24H)</th>
<th className="p-3 text-xs font-mono text-muted font-normal uppercase w-24">Action</th>
</tr>
</thead>
<tbody className="font-mono text-sm">
<tr className="border-b border-borderline hover:bg-borderline/30 transition-colors">
<td className="p-3 border-r border-borderline text-muted">089</td>
<td className="p-3 border-r border-borderline">Nexus Corp Ltd.</td>
<td className="p-3 border-r border-borderline">
<span className="inline-flex items-center gap-1.5">
<span className="w-1.5 h-1.5 bg-accent rounded-none"></span> ACTIVE
                    </span>
</td>
<td className="p-3 border-r border-borderline">124.5K USD</td>
<td className="p-3">
<button className="text-xs text-muted hover:text-highlight">MANAGE</button>
</td>
</tr>
<tr className="border-b border-borderline hover:bg-borderline/30 transition-colors">
<td className="p-3 border-r border-borderline text-muted">090</td>
<td className="p-3 border-r border-borderline">CyberDyne Systems</td>
<td className="p-3 border-r border-borderline">
<span className="inline-flex items-center gap-1.5">
<span className="w-1.5 h-1.5 bg-accent rounded-none"></span> ACTIVE
                    </span>
</td>
<td className="p-3 border-r border-borderline">89.2K USD</td>
<td className="p-3">
<button className="text-xs text-muted hover:text-highlight">MANAGE</button>
</td>
</tr>
<tr className="border-b border-borderline hover:bg-borderline/30 transition-colors">
<td className="p-3 border-r border-borderline text-muted">091</td>
<td className="p-3 border-r border-borderline text-muted">Tyrell Gen.</td>
<td className="p-3 border-r border-borderline">
<span className="inline-flex items-center gap-1.5 text-alert">
<span className="w-1.5 h-1.5 bg-alert rounded-none"></span> REVOKED
                    </span>
</td>
<td className="p-3 border-r border-borderline text-muted">0.00 USD</td>
<td className="p-3">
<button className="text-xs text-muted hover:text-highlight">MANAGE</button>
</td>
</tr>
<tr className="hover:bg-borderline/30 transition-colors">
<td className="p-3 border-r border-borderline text-muted">092</td>
<td className="p-3 border-r border-borderline">Weyland-Yutani</td>
<td className="p-3 border-r border-borderline">
<span className="inline-flex items-center gap-1.5">
<span className="w-1.5 h-1.5 bg-accent rounded-none"></span> ACTIVE
                    </span>
</td>
<td className="p-3 border-r border-borderline">512.8K USD</td>
<td className="p-3">
<button className="text-xs text-muted hover:text-highlight">MANAGE</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="flex justify-between items-center mt-2">
<button className="btn-tech text-muted border-transparent hover:border-borderline">PREV</button>
<span className="text-xs font-mono text-muted">PAGE 01 / 45</span>
<button className="btn-tech">NEXT</button>
</div>
</section>
{/* END: Merchant List Section */}
{/* BEGIN: Stock Management Sidebar */}
<section className="xl:col-span-1 flex flex-col gap-6" data-purpose="stock-management-section">
<header className="flex justify-between items-end border-b border-borderline pb-2">
<h2 className="text-sm font-mono text-muted tracking-widest">GLOBAL STOCK CONTROLS</h2>
</header>
<div className="border border-borderline bg-panel p-5 space-y-6">
{/* Global Status */}
<div className="flex items-center justify-between">
<span className="text-sm font-mono text-muted">SYSTEM STATUS</span>
<span className="px-2 py-1 bg-obsidian border border-borderline text-accent text-xs font-mono">NOMINAL</span>
</div>
<hr className="border-borderline"/>
{/* Toggle Group */}
<div className="space-y-4">
{/* Toggle 1 */}
<div className="flex items-center justify-between">
<div>
<div className="text-sm font-mono text-highlight">AUTO-REPLENISH</div>
<div className="text-xs font-mono text-muted mt-1">Automatically order depleted SKUs</div>
</div>
<div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" className="toggle-checkbox absolute block w-5 h-5 border border-borderline bg-obsidian appearance-none cursor-pointer" id="toggle-replenish" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 border border-borderline bg-obsidian cursor-pointer" htmlFor="toggle-replenish"></label>
</div>
</div>
{/* Toggle 2 */}
<div className="flex items-center justify-between">
<div>
<div className="text-sm font-mono text-highlight">STRICT ALLOCATION</div>
<div className="text-xs font-mono text-muted mt-1">Prevent overselling global inventory</div>
</div>
<div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" className="toggle-checkbox absolute block w-5 h-5 border border-borderline bg-obsidian appearance-none cursor-pointer" id="toggle-allocation" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 border border-borderline bg-obsidian cursor-pointer" htmlFor="toggle-allocation"></label>
</div>
</div>
{/* Toggle 3 */}
<div className="flex items-center justify-between">
<div>
<div className="text-sm font-mono text-highlight text-alert">MAINTENANCE MODE</div>
<div className="text-xs font-mono text-muted mt-1">Halt all new stock assignments</div>
</div>
<div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input className="toggle-checkbox absolute block w-5 h-5 border border-borderline bg-obsidian appearance-none cursor-pointer" id="toggle-maint" name="toggle" type="checkbox"/>
<label className="toggle-label block overflow-hidden h-5 border border-borderline bg-obsidian cursor-pointer" htmlFor="toggle-maint"></label>
</div>
</div>
</div>
<hr className="border-borderline"/>
{/* Threshold Settings */}
<div className="space-y-3">
<label className="block text-sm font-mono text-muted">CRITICAL STOCK THRESHOLD (%)</label>
<div className="flex gap-2">
<input className="input-tech flex-1" type="number" value="15"/>
<button className="btn-tech">SET</button>
</div>
</div>
<button className="btn-tech w-full border-alert text-alert hover:bg-alert hover:text-obsidian mt-4">
              FORCE SYNC ALL
            </button>
</div>
</section>
{/* END: Stock Management Sidebar */}
</div>
</div>
{/* END: Scrollable Content */}
</main>
{/* END: Main Content Area */}

    </>
  );
};

export default MerchantStockAdmin;
