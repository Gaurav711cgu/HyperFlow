import React from 'react';

const ChatbotHelp = () => {
  return (
    <>

{/* TopAppBar (from JSON Source of Truth) */}
<header className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-border-glass flex items-center justify-between px-margin-mobile h-16">
<button className="material-symbols-outlined icon-thin text-primary hover:opacity-80 transition-opacity active:scale-95 transition-transform" data-icon="arrow_back">
            arrow_back
        </button>
{/* Brand/Headline - Forced JSON content with requested styling adjustments where compliant */}
<h1 className="font-hero-display text-hero-display text-primary tracking-tighter">
            Order Review
        </h1>
<button className="material-symbols-outlined icon-thin text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform" data-icon="support_agent">
            support_agent
        </button>
</header>
{/* Main Content Canvas */}
<main className="flex-grow pt-[104px] pb-xl px-lg md:px-0 flex justify-center w-full">
{/* Central Glassmorphic Container */}
<div className="w-full max-w-[800px] bg-surface-panel border border-border-glass sharp p-lg md:p-xl flex flex-col gap-xl">
{/* Order Status Header */}
<section className="flex flex-col gap-sm border-b border-border-glass pb-lg">
<div className="flex items-center gap-sm text-tertiary">
<span className="material-symbols-outlined icon-thin text-[20px]" data-icon="check_circle">check_circle</span>
<h2 className="font-section-header text-section-header uppercase tracking-widest text-on-surface">Delivered: Order #HF-8821</h2>
</div>
<div className="flex items-center gap-md text-on-surface-variant font-metric-mono text-metric-mono opacity-60">
<span className="material-symbols-outlined icon-thin text-[14px]" data-icon="schedule">schedule</span>
<span>TODAY, 19:42 PM</span>
</div>
</section>
{/* Dual-Column Feedback Section */}
<section className="grid grid-cols-1 md:grid-cols-2 gap-xl border-b border-border-glass pb-xl">
{/* Left Column: Food */}
<div className="flex flex-col gap-lg">
<h3 className="font-hero-display-mobile text-hero-display-mobile text-on-background">How was the food?</h3>
{/* Star Rating */}
<div className="flex gap-sm">
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined icon-thin text-[32px] cursor-pointer hover:scale-110 transition-transform text-on-surface-variant" data-icon="star">star</span>
</div>
{/* Technical Chips */}
<div className="flex flex-wrap gap-sm mt-sm">
<button className="border border-danger/50 bg-danger/10 text-danger sharp px-md py-sm font-body-medium text-body-medium hover:bg-danger/20 transition-colors">Taste</button>
<button className="border border-border-glass bg-transparent text-on-surface-variant sharp px-md py-sm font-body-medium text-body-medium hover:bg-surface-container transition-colors">Portion</button>
<button className="border border-border-glass bg-transparent text-on-surface-variant sharp px-md py-sm font-body-medium text-body-medium hover:bg-surface-container transition-colors">Packaging</button>
<button className="border border-danger/50 bg-danger/10 text-danger sharp px-md py-sm font-body-medium text-body-medium hover:bg-danger/20 transition-colors">Temperature</button>
</div>
</div>
{/* Right Column: Driver */}
<div className="flex flex-col gap-lg">
<div className="flex items-center gap-sm">
<h3 className="font-hero-display-mobile text-hero-display-mobile text-on-background">How was Gaurav?</h3>
<span className="border border-border-glass bg-surface-container px-sm py-xs font-metric-mono text-metric-mono text-on-surface-variant sharp">COURIER</span>
</div>
{/* Star Rating */}
<div className="flex gap-sm">
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
<span className="material-symbols-outlined star-active text-[32px] cursor-pointer hover:scale-110 transition-transform text-danger" data-icon="star">star</span>
</div>
{/* Driver Chips */}
<div className="flex flex-wrap gap-sm mt-sm">
<button className="border border-danger/50 bg-danger/10 text-danger sharp px-md py-sm font-body-medium text-body-medium hover:bg-danger/20 transition-colors">Polite</button>
<button className="border border-danger/50 bg-danger/10 text-danger sharp px-md py-sm font-body-medium text-body-medium hover:bg-danger/20 transition-colors">Fast</button>
<button className="border border-border-glass bg-transparent text-on-surface-variant sharp px-md py-sm font-body-medium text-body-medium hover:bg-surface-container transition-colors">Safe Driving</button>
</div>
</div>
</section>
{/* Detailed Note Area */}
<section className="flex flex-col gap-md">
<label className="font-section-header text-section-header text-on-surface uppercase tracking-widest" htmlFor="feedback-note">Additional Details</label>
<textarea className="w-full bg-surface-container-lowest border border-border-glass sharp p-md font-body-default text-body-default text-on-surface placeholder:text-on-surface-variant/50 focus:border-danger focus:ring-0 transition-colors resize-none" id="feedback-note" placeholder="Add a note... (e.g., The fries were slightly cold, but everything else was perfect.)" rows="4"></textarea>
</section>
{/* Help & Support Block */}
<section className="mt-md"><div className="flex flex-col gap-lg">
<h3 className="font-section-header text-section-header text-on-surface uppercase tracking-widest">Need Help with this Order?</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Missing Items</span>
</button>
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Wrong Order Received</span>
</button>
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Poor Food Quality</span>
</button>
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Package Tampered</span>
</button>
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Spillage Issues</span>
</button>
<button className="flex items-center p-md bg-[rgba(30,30,30,0.6)] border border-white/10 sharp hover:bg-surface-container-high transition-colors text-left">
<span className="font-body-medium text-body-medium text-on-surface">Delayed Delivery</span>
</button>
</div>
<button className="w-full bg-[#FF2D78] text-white sharp py-lg font-section-header text-section-header uppercase tracking-widest hover:opacity-90 active:scale-[0.99] transition-all">
    Continue with Chatbot
  </button>
</div></section>
{/* Action Footer */}
<section className="mt-xl pt-lg border-t border-border-glass">
<button className="w-full bg-danger text-on-error sharp py-lg font-section-header text-section-header uppercase tracking-widest hover:bg-danger/90 active:scale-[0.99] transition-all shadow-none">
                    Submit Feedback
                </button>
</section>
</div>
</main>
<button className="fixed right-lg top-1/2 -translate-y-1/2 z-50 bg-surface-panel border border-border-glass sharp p-md flex flex-col items-center gap-xs hover:bg-surface-container-high transition-colors shadow-xl">
<span className="material-symbols-outlined icon-thin text-primary" data-icon="help">help</span>
<span className="font-metric-mono text-[10px] uppercase tracking-tighter text-on-surface-variant">Help</span>
</button>
    </>
  );
};

export default ChatbotHelp;
