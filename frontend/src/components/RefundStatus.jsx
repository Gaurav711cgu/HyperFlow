import React from 'react';

const RefundStatus = () => {
  return (
    <>

{/* Top Navigation (Shared Component implementation based on rules, adjusted for desktop) */}
<header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between px-xl h-16 shadow-[0_-8px_24px_rgba(255,76,135,0.05)]">
<div className="flex items-center gap-md">
<button className="text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center">
<span className="material-symbols-outlined">arrow_back</span>
</button>
<h1 className="font-hero-display text-hero-display text-primary tracking-tighter">Order Review</h1>
</div>
<div className="hidden md:flex gap-xl font-label-small text-label-small items-center">
<div className="flex items-center gap-xs text-on-surface-variant/60 hover:text-primary/80 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">grid_view</span>
<span>Feed</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant/60 hover:text-primary/80 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">receipt_long</span>
<span>Orders</span>
</div>
<div className="flex items-center gap-xs text-on-surface-variant/60 hover:text-primary/80 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">military_tech</span>
<span>Rewards</span>
</div>
<div className="flex items-center gap-xs text-primary font-bold hover:text-primary/80 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[16px]">person</span>
<span>Profile</span>
</div>
</div>
<button className="text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform flex items-center justify-center">
<span className="material-symbols-outlined">support_agent</span>
</button>
</header>
<main className="w-full max-w-[800px] mt-24 px-lg flex flex-col gap-xl relative z-10">
{/* Header */}
<div className="flex flex-col items-center justify-center gap-sm mb-lg">
<h2 className="font-hero-display text-hero-display text-on-surface text-center">HyperFlow Refund Status</h2>
<div className="w-12 h-1 bg-hyper-pink mt-sm"></div>
</div>
{/* Info Banner */}
<div className="bg-surface-panel border border-[rgba(255,255,255,0.08)] rounded-lg p-lg flex items-start gap-md">
<span className="material-symbols-outlined text-primary mt-[2px]">info</span>
<p className="font-body-medium text-body-medium text-on-surface-variant">
                Refunds will be processed and returned to your original HyperFlow payment source within 3-5 business days.
            </p>
</div>
{/* Completed Refunds Section */}
<section className="flex flex-col gap-lg mt-md">
<h3 className="font-section-header text-section-header text-on-surface uppercase tracking-widest text-on-surface-variant/80">Completed Refunds</h3>
<div className="flex flex-col gap-md">
{/* Refund Card 1 */}
<div className="bg-surface-panel border border-[rgba(255,255,255,0.08)] rounded-lg p-lg flex items-center justify-between transition-colors hover:bg-surface-container-low">
<div className="flex items-center gap-lg">
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-on-surface text-[20px]">storefront</span>
</div>
<div className="flex flex-col gap-xs">
<div className="font-body-medium text-body-medium text-on-surface">WOW! Bhubaneswar</div>
<div className="font-metric-mono text-metric-mono text-on-surface-variant/60">LazyPay • 24 Aug 2026</div>
</div>
</div>
<div className="flex flex-col items-end gap-xs">
<div className="font-metric-mono text-metric-mono text-on-surface text-[14px]">$12.50</div>
<div className="flex items-center gap-[4px] text-tertiary">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span className="font-label-small text-label-small font-bold uppercase tracking-wide">Completed</span>
</div>
</div>
</div>
{/* Refund Card 2 */}
<div className="bg-surface-panel border border-[rgba(255,255,255,0.08)] rounded-lg p-lg flex items-center justify-between transition-colors hover:bg-surface-container-low">
<div className="flex items-center gap-lg">
<div className="w-10 h-10 rounded-full bg-surface-container-high border border-[rgba(255,255,255,0.08)] flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-on-surface text-[20px]">restaurant</span>
</div>
<div className="flex flex-col gap-xs">
<div className="font-body-medium text-body-medium text-on-surface">Four Spoon</div>
<div className="font-metric-mono text-metric-mono text-on-surface-variant/60">Visa ending in 4242 • 22 Aug 2026</div>
</div>
</div>
<div className="flex flex-col items-end gap-xs">
<div className="font-metric-mono text-metric-mono text-on-surface text-[14px]">$8.75</div>
<div className="flex items-center gap-[4px] text-tertiary">
<span className="material-symbols-outlined text-[14px]">check_circle</span>
<span className="font-label-small text-label-small font-bold uppercase tracking-wide">Completed</span>
</div>
</div>
</div>
</div>
</section>
{/* CTA Button */}
<div className="mt-xl flex justify-center w-full">
<button className="bg-hyper-pink text-white font-section-header text-section-header py-[12px] px-xl rounded-full flex items-center justify-center gap-sm hover:opacity-90 transition-opacity active:scale-[0.98] w-full max-w-[320px]">
<span className="material-symbols-outlined text-[18px]">history</span>
                Show Older Refunds
            </button>
</div>
</main>

    </>
  );
};

export default RefundStatus;
