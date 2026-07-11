import React from 'react';

const FinancialOpsAdmin = () => {
  return (
    <>

{/* BEGIN: Sidebar */}
<nav aria-label="Sidebar" className="w-64 flex-shrink-0 border-r border-obsidian-border bg-obsidian-bg flex flex-col justify-between">
<div>
{/* Brand */}
<div className="h-16 flex items-center px-6 border-b border-obsidian-border">
<svg className="w-6 h-6 text-obsidian-text mr-2" fill="none" stroke="currentColor" viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
<span className="font-semibold tracking-wide text-sm uppercase">HyperFlow</span>
</div>
{/* Navigation Links */}
<div className="p-4 space-y-1">
<a className="flex items-center px-3 py-2 text-sm font-medium bg-obsidian-border text-obsidian-text border border-obsidian-border" href="#">
<svg className="w-4 h-4 mr-3 text-obsidian-muted" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
          Dashboard
        </a>
<a className="flex items-center px-3 py-2 text-sm font-medium text-obsidian-muted hover:text-obsidian-text hover:bg-[#151515] border border-transparent hover:border-obsidian-border transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M9 17h6M9 13h6m-6-4h6M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
          Transactions
        </a>
<a className="flex items-center px-3 py-2 text-sm font-medium text-obsidian-muted hover:text-obsidian-text hover:bg-[#151515] border border-transparent hover:border-obsidian-border transition-colors" href="#">
<svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
          Payouts
        </a>
</div>
</div>
{/* User Section */}
<div className="p-4 border-t border-obsidian-border">
<div className="flex items-center">
<img alt="Admin User" className="h-8 w-8 object-cover border border-obsidian-border" src="https://lh3.googleusercontent.com/aida/AP1WRLv9wlAZe2hhMPwWygVWbbf7ZRu67jUQ2SYDC7XN9GufD2BtBPvEMf3WXFWwhqMVaBlnqkAJgYR2cG5NeLSCIBeVFbTkc8ruPttElEVkmtWZaoCGBiq3UCuigAiK4nXfOhT1tdv5g95PrxWV_ng1VToHIMv62-SwHaVmaMGItM7Id_r-Rs-_XCd7B_r3t0cBCqpIwaRYUHcd2o7JFcSHssf0e2arDxLlwtYjUlUI-BTe2cXiyZj9WiMT21s"/>
<div className="ml-3">
<p className="text-sm font-medium text-obsidian-text">SysAdmin</p>
<p className="text-xs text-obsidian-muted">Financial Ops</p>
</div>
</div>
</div>
</nav>
{/* END: Sidebar */}
{/* BEGIN: MainContent */}
<main className="flex-1 flex flex-col overflow-hidden bg-obsidian-bg">
{/* BEGIN: Header */}
<header className="h-16 flex items-center justify-between px-8 border-b border-obsidian-border precision-panel">
<h1 className="text-lg font-semibold text-obsidian-text">Financial Operations</h1>
<div className="flex items-center space-x-4">
{/* Date Range Filter */}
<div className="flex items-center space-x-2 text-sm text-obsidian-muted border border-obsidian-border px-3 py-1.5 bg-obsidian-bg">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
<span>Oct 1, 2023 - Oct 31, 2023</span>
</div>
{/* Action Button */}
<button className="precision-button px-4 py-1.5 text-sm font-medium text-obsidian-text flex items-center">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
          Export CSV
        </button>
</div>
</header>
{/* END: Header */}
<div className="flex-1 overflow-y-auto p-8">
<div className="max-w-7xl mx-auto space-y-8">
{/* BEGIN: FinancialOverview */}
<section aria-label="Financial Overview Cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
{/* Overview Card 1 */}
<article className="precision-panel p-5 flex flex-col justify-between">
<h3 className="text-xs font-medium text-obsidian-muted uppercase tracking-wider mb-1">Available Balance</h3>
<div className="text-2xl font-semibold text-obsidian-text font-mono">$1,240,500.00</div>
<div className="mt-4 flex items-center text-xs text-obsidian-success">
<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
<span>+2.4% from last week</span>
</div>
</article>
{/* Overview Card 2 */}
<article className="precision-panel p-5 flex flex-col justify-between">
<h3 className="text-xs font-medium text-obsidian-muted uppercase tracking-wider mb-1">Pending Payouts</h3>
<div className="text-2xl font-semibold text-obsidian-text font-mono">$45,200.00</div>
<div className="mt-4 flex items-center text-xs text-obsidian-warning">
<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
<span>12 transfers pending</span>
</div>
</article>
{/* Overview Card 3 */}
<article className="precision-panel p-5 flex flex-col justify-between">
<h3 className="text-xs font-medium text-obsidian-muted uppercase tracking-wider mb-1">30d Volume</h3>
<div className="text-2xl font-semibold text-obsidian-text font-mono">$5,420,100.00</div>
<div className="mt-4 flex items-center text-xs text-obsidian-success">
<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2"></path></svg>
<span>+14.1% vs previous 30d</span>
</div>
</article>
{/* Overview Card 4 */}
<article className="precision-panel p-5 flex flex-col justify-between">
<h3 className="text-xs font-medium text-obsidian-muted uppercase tracking-wider mb-1">Success Rate</h3>
<div className="text-2xl font-semibold text-obsidian-text font-mono">99.98%</div>
<div className="mt-4 flex items-center text-xs text-obsidian-muted">
<span>Based on 142k transactions</span>
</div>
</article>
</section>
{/* END: FinancialOverview */}
{/* BEGIN: Main Content Grid */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/* BEGIN: TransactionLogs */}
<section aria-label="Transaction Logs" className="lg:col-span-2 space-y-4">
<div className="flex items-center justify-between">
<h2 className="text-sm font-semibold text-obsidian-text uppercase tracking-wide">Recent Transactions</h2>
<a className="text-xs text-obsidian-accent hover:text-obsidian-accentHover font-medium" href="#">View All →</a>
</div>
<div className="precision-panel overflow-hidden">
<table className="min-w-full divide-y divide-obsidian-border">
<thead className="bg-[#151515]">
<tr>
<th className="px-4 py-3 text-left text-xs font-medium text-obsidian-muted uppercase tracking-wider" scope="col">Transaction ID</th>
<th className="px-4 py-3 text-left text-xs font-medium text-obsidian-muted uppercase tracking-wider" scope="col">Date &amp; Time</th>
<th className="px-4 py-3 text-right text-xs font-medium text-obsidian-muted uppercase tracking-wider" scope="col">Amount</th>
<th className="px-4 py-3 text-left text-xs font-medium text-obsidian-muted uppercase tracking-wider" scope="col">Destination</th>
<th className="px-4 py-3 text-left text-xs font-medium text-obsidian-muted uppercase tracking-wider" scope="col">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-obsidian-border bg-obsidian-surface">
<tr>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-obsidian-text">TXN-0982-A</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-muted">Oct 24, 14:32:01</td>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-obsidian-text">$1,250.00</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-text">Acme Corp</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 border border-obsidian-success text-xs font-medium text-obsidian-success bg-transparent">Completed</span>
</td>
</tr>
<tr>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-obsidian-text">TXN-0981-B</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-muted">Oct 24, 14:28:44</td>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-obsidian-text">$8,400.00</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-text">Stark Ind.</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 border border-obsidian-warning text-xs font-medium text-obsidian-warning bg-transparent">Pending</span>
</td>
</tr>
<tr>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-obsidian-text">TXN-0980-C</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-muted">Oct 24, 13:15:20</td>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-obsidian-text">$345.50</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-text">Wayne Ent.</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 border border-obsidian-success text-xs font-medium text-obsidian-success bg-transparent">Completed</span>
</td>
</tr>
<tr>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-obsidian-text">TXN-0979-D</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-muted">Oct 24, 11:05:12</td>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-obsidian-text">$12,000.00</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-text">LexCorp</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 border border-obsidian-danger text-xs font-medium text-obsidian-danger bg-transparent">Failed</span>
</td>
</tr>
<tr>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-obsidian-text">TXN-0978-E</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-muted">Oct 24, 09:45:00</td>
<td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-right text-obsidian-text">$2,100.00</td>
<td className="px-4 py-3 whitespace-nowrap text-sm text-obsidian-text">Globex</td>
<td className="px-4 py-3 whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 border border-obsidian-success text-xs font-medium text-obsidian-success bg-transparent">Completed</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* END: TransactionLogs */}
{/* BEGIN: PayoutControls */}
<section aria-label="Payout Controls" className="lg:col-span-1 space-y-4">
<h2 className="text-sm font-semibold text-obsidian-text uppercase tracking-wide">Manual Payout</h2>
<div className="precision-panel p-6">
<form className="space-y-5" onsubmit="event.preventDefault();">
{/* Amount Input */}
<div>
<label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase" htmlFor="payout-amount">Amount (USD)</label>
<div className="relative mt-1">
<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span className="text-obsidian-muted sm:text-sm">$</span>
</div>
<input className="precision-input block w-full pl-7 pr-12 sm:text-sm font-mono py-2" id="payout-amount" name="amount" placeholder="0.00" step="0.01" type="number"/>
<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
<span className="text-obsidian-muted sm:text-sm" id="price-currency">USD</span>
</div>
</div>
</div>
{/* Destination Select */}
<div>
<label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase" htmlFor="payout-destination">Destination Account</label>
<select className="precision-input mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm" id="payout-destination" name="destination">
<option>Select an account...</option>
<option>Acme Corp (**** 1234)</option>
<option>Stark Ind. (**** 9876)</option>
<option>Wayne Ent. (**** 4567)</option>
</select>
</div>
{/* Priority Toggle */}
<div className="flex items-center justify-between pt-2">
<span className="flex-grow flex flex-col">
<span className="text-sm font-medium text-obsidian-text" id="priority-label">Priority Processing</span>
<span className="text-xs text-obsidian-muted" id="priority-description">Incurs additional $15 fee</span>
</span>
{/* Custom Toggle Switch */}
<button aria-checked="false" className="relative inline-flex flex-shrink-0 h-6 w-11 border border-obsidian-border bg-obsidian-bg cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none" role="switch" type="button">
<span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 bg-obsidian-muted transform ring-0 transition ease-in-out duration-200 translate-x-0"></span>
</button>
</div>
{/* Submit Button */}
<div className="pt-4 border-t border-obsidian-border">
<button className="precision-button-primary w-full flex justify-center py-2 px-4 text-sm font-medium focus:outline-none uppercase tracking-wider" type="submit">
                    Initiate Payout
                  </button>
</div>
</form>
</div>
{/* System Status Widget */}
<div className="precision-panel p-4 flex items-center justify-between">
<div className="flex items-center">
<div className="w-2 h-2 bg-obsidian-success rounded-full mr-3"></div>
<span className="text-sm text-obsidian-text">Payment Gateway API</span>
</div>
<span className="text-xs font-mono text-obsidian-success">Operational</span>
</div>
</section>
{/* END: PayoutControls */}
</div>
{/* END: Main Content Grid */}
</div>
</div>
</main>
{/* END: MainContent */}

    </>
  );
};

export default FinancialOpsAdmin;
