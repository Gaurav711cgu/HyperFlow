import React from 'react';

const HelpSupport = () => {
  return (
    <>

{/* TopNav / Header */}
<header className="w-full max-w-[1440px] px-8 h-16 flex items-center justify-between razor-border border-b border-t-0 border-l-0 border-r-0 sticky top-0 z-50 bg-[#080808]">
<div className="flex items-center gap-4 cursor-pointer">
<span className="material-symbols-outlined text-hyper-pink" style={{fontVariationSettings: '\'FILL\' 1'}}>data_exploration</span>
<span className="font-hero-display text-hero-display text-on-surface tracking-tight">HyperFlow</span>
</div>
<div className="flex items-center gap-6">
<button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
<span className="material-symbols-outlined text-on-surface-variant">person</span>
<span className="font-body-medium text-body-medium text-on-surface-variant">Account</span>
</button>
<button className="flex items-center justify-center w-10 h-10 rounded-full razor-border hover:bg-surface-panel transition-colors">
<span className="material-symbols-outlined text-on-surface">search</span>
</button>
</div>
</header>
{/* Main Content Canvas */}
<main className="w-full max-w-[800px] mt-12 mb-24 px-6 flex flex-col gap-10">
{/* Page Header */}
<section className="flex flex-col gap-2">
<h1 className="font-hero-display text-hero-display text-on-surface">Support Center</h1>
<p className="font-body-medium text-body-medium text-on-surface-variant">Manage your orders and resolve issues quickly.</p>
</section>
{/* Help with your orders */}
<section className="flex flex-col gap-4">
<h2 className="font-section-header text-section-header text-on-surface uppercase tracking-wider text-xs">Help with your orders</h2>
{/* Recent Order Card */}
<div className="bg-surface-panel razor-border rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
<div className="flex items-start gap-4">
<div className="w-12 h-12 rounded-lg bg-[#14141F] razor-border flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary">receipt_long</span>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="font-body-medium text-body-medium text-on-surface">Order #HF-9982X</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim font-metric-mono text-metric-mono">Delivered</span>
</div>
<span className="font-body-default text-body-default text-on-surface-variant mt-1">1x Golden Corn, 1x Margherita Pizza</span>
<span className="font-metric-mono text-metric-mono text-on-surface-variant/60 mt-1">Today, 14:32</span>
</div>
</div>
<button className="matte-pink-border text-hyper-pink font-body-medium text-body-medium px-6 py-2 rounded-full hover:bg-[#FF2D78]/10 transition-colors shrink-0 w-full md:w-auto">
                    VIEW DETAILS
                </button>
</div>
{/* Issues with Previous Orders */}
<button className="bg-surface-panel razor-border rounded-xl p-5 flex justify-between items-center hover:bg-[#14141F] transition-colors w-full group">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">history</span>
<span className="font-body-medium text-body-medium text-on-surface">Issues with Previous Orders</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
</button>
</section>
{/* HELP WITH OTHER QUERIES */}
<section className="flex flex-col gap-4 mt-4">
<h2 className="font-section-header text-section-header text-on-surface uppercase tracking-wider text-xs">Help with other queries</h2>
<div className="bg-surface-panel razor-border rounded-xl flex flex-col overflow-hidden">
{/* List Item 1 */}
<button className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] hover:bg-[#14141F] transition-colors w-full text-left group">
<span className="font-body-medium text-body-medium text-on-surface group-hover:text-primary transition-colors">HyperFlow One FAQs</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
</button>
{/* List Item 2 */}
<button className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] hover:bg-[#14141F] transition-colors w-full text-left group">
<span className="font-body-medium text-body-medium text-on-surface group-hover:text-primary transition-colors">General issues</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
</button>
{/* List Item 3 */}
<button className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] hover:bg-[#14141F] transition-colors w-full text-left group">
<span className="font-body-medium text-body-medium text-on-surface group-hover:text-primary transition-colors">Partner Onboarding</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
</button>
{/* List Item 4 */}
<button className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] hover:bg-[#14141F] transition-colors w-full text-left group">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-danger text-sm" style={{fontVariationSettings: '\'FILL\' 1'}}>warning</span>
<span className="font-body-medium text-body-medium text-danger">Report Safety Emergency</span>
</div>
<span className="material-symbols-outlined text-danger text-sm">arrow_forward</span>
</button>
{/* List Item 5 */}
<button className="flex justify-between items-center p-4 hover:bg-[#14141F] transition-colors w-full text-left group">
<span className="font-body-medium text-body-medium text-on-surface group-hover:text-primary transition-colors">HyperMart Onboarding</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
</button>
</div>
</section>
</main>

    </>
  );
};

export default HelpSupport;
