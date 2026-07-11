import React from 'react';

const RealTimeTracking = () => {
  return (
    <>

{/* Top Navigation Bar */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-6 pt-4 pb-6 bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="flex justify-between items-center w-full">
<div className="flex items-center gap-4">
<span className="text-hero-display font-hero-display font-bold text-primary tracking-tighter">District</span>
<div className="h-6 w-[1px] bg-border-glass mx-2"></div>
<div className="flex flex-col">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">Order ID</span>
<span className="text-body-medium font-metric-mono text-primary">#DX-9902-TRK</span>
</div>
</div>
<nav className="hidden md:flex items-center gap-8">
<a className="text-primary font-bold text-body-medium transition-opacity hover:opacity-80" href="#">Delivery</a>
<a className="text-on-surface-variant text-body-medium transition-opacity hover:opacity-80" href="#">Dining</a>
<a className="text-on-surface-variant text-body-medium transition-opacity hover:opacity-80" href="#">Groceries</a>
<a className="text-on-surface-variant text-body-medium transition-opacity hover:opacity-80" href="#">AI Agent</a>
</nav>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-border-glass">
<span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
<span className="text-label-small font-label-small text-on-surface">Central District, Sector 7</span>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden p-0.5">
<img className="w-full h-full rounded-full object-cover" data-alt="Close-up professional studio portrait of a high-tech user for a premium digital platform. The lighting is dramatic and moody, with neon pink and obsidian tones reflecting on the subject's face. The aesthetic is clean, sophisticated, and fits an elite tech-forward audience. High resolution, hyper-detailed photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvWktm1h16B8dSrKlKVhN7JPKhf0FsRcbKFl9eUics1JKbEGqSEcR2bYpPhYwvg8nsaKIeFv2CmaxFhVBDXjP6asYh8-DGMerps0dotyQ_YiiNpwgIw4D1-ppY6jza1sfPZH6MUaW6-CxAhx51A2MFCkIiCqP_w4msTIbBz6hDD93r2PqgyhR1QHGguNJMDX7Bw2tDFhUjWDetkymhj4lEuGJcpZJaB9XOm9tnLtDyXtL2yvZn1qwV_FCR8LzDmWSJNJP54Nu1dexm"/>
</div>
</div>
</div>
</header>
{/* Main Content Area */}
<main className="flex-grow pt-[88px] flex overflow-hidden">
{/* Left Section: Map (65%) */}
<section className="w-[65%] relative h-full bg-[#040406]">
{/* Satellite Map Background */}
<div className="absolute inset-0 z-0">
<div className="w-full h-full grayscale brightness-[0.4] contrast-[1.2]" data-location="Tokyo Night Satellite View" style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuB08upXHFJ6nW5ZH3Av5rTtjSqlGo52B25C8KunPKEjHivY59W41_pEDWQ27Vh1MCcMj-d4Y7G08l4rwef6LrMzO7awCtVQ51qKaRlQf3Fh9ScELeTW5VGWLLAmHzTwJXAK-vIR2__HWARBAEautRoJ4q-9f4N7oDWCqZXcPAI28XVSn_-iu2MMp9crWqYxDUp20-0Z9E8Ws1ygenKlP32sDB28A25BUiLsVbgNt9yO7ylaGAt4zFH2sGyfy55VqqzG3xs9otH9-lXP\')'}}></div>
{/* SVG Route Overlay */}
<svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
<path d="M 200 600 Q 400 550 500 400 T 800 200" fill="none" stroke="rgba(255, 177, 194, 0.3)" stroke-dasharray="8 8" strokeWidth="4"></path>
<path d="M 200 600 Q 400 550 500 400" fill="none" id="route-path" stroke="#ffb1c2" strokeWidth="4"></path>
{/* Destination Marker */}
<circle cx="800" cy="200" fill="#ff4c87" r="8"></circle>
<circle className="pulse-animation" cx="800" cy="200" fill="none" r="16" stroke="#ff4c87" strokeWidth="1"></circle>
</svg>
{/* Animated Rider Marker */}
<div className="absolute" style={{left: '490px', top: '390px'}}>
<div className="relative">
<div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center neon-glow-pink border-2 border-white/20">
<span className="material-symbols-outlined text-white text-[20px]">pedal_bike</span>
</div>
<div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-panel px-3 py-1 rounded border border-border-glass">
<span className="text-metric-mono text-[10px] text-primary">RIDER: KENJI (2.4KM)</span>
</div>
</div>
</div>
</div>
{/* Monsoon Alert Overlay (Glassmorphic) */}
<div className="absolute bottom-10 left-10 z-10">
<div className="glass-panel p-6 rounded-xl max-w-md flex flex-col gap-3 overflow-hidden">
<div className="absolute top-0 left-0 w-full h-1 shimmer"></div>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center border border-warning/30">
<span className="material-symbols-outlined text-warning">thunderstorm</span>
</div>
<div>
<h3 className="text-section-header font-section-header text-on-surface">Monsoon Warning</h3>
<p className="text-label-small font-label-small text-on-surface-variant">Severe weather in Sector 4 &amp; 7</p>
</div>
</div>
<p className="text-body-default font-body-default text-on-surface-variant/80">
                        High-velocity winds and precipitation may cause a <span className="text-warning font-bold">+12 min</span> delay. Our elite couriers are equipped for all-weather transit.
                    </p>
<div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-warning h-full w-3/4"></div>
</div>
</div>
</div>
{/* Map Controls */}
<div className="absolute top-6 right-6 flex flex-col gap-2">
<button className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined text-white">layers</span>
</button>
<button className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined text-white">add</span>
</button>
<button className="w-10 h-10 glass-panel rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
<span className="material-symbols-outlined text-white">remove</span>
</button>
</div>
</section>
{/* Right Section: Details Panel (35%) */}
<aside className="w-[35%] h-full bg-surface-panel border-l border-border-glass flex flex-col overflow-y-auto">
{/* Courier Profile Card */}
<div className="p-xl border-b border-border-glass">
<div className="flex items-center justify-between mb-lg">
<h2 className="text-section-header font-section-header text-on-surface-variant uppercase tracking-widest">Active Courier</h2>
<span className="px-2 py-1 bg-tertiary/10 text-tertiary text-label-small font-metric-mono rounded border border-tertiary/20">VERIFIED PRO</span>
</div>
<div className="flex items-center gap-4 bg-surface-elevated p-4 rounded-xl border border-border-glass shadow-xl">
<div className="w-16 h-16 rounded-xl overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Cinematic close-up portrait of a Japanese delivery professional wearing a sleek, branded matte black carbon-fiber helmet and high-tech weather-resistant gear. Neon city lights in the background. The lighting is cinematic, highlighting the professional's focused expression. Deep shadows and vibrant pink accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd7IEqF7l1fAm-Yku136yrBlhcQ4HvCdLI_oI5eVYzHqDkKgPZtYBoT-krUph79ekiRqtkfzNwpMu52bnu2sdUArr8kuxdQfFGh6BmGhc2bVnfeq-UDjCrrkHa46PPlClql3Gb5aY8NkD2AmSJZzJf5uLbmmYqyOhDPw4mK-R9vT4qQc-QSpidqehFFSh7o0NJb4fpqjRPVnT_-YFNm-gIqnf_YFWV_h-4p10O4bx2aKAey6RxKyMDbQi39MciMk9L60tNxeIKZfKY"/>
</div>
<div className="flex-grow">
<div className="flex items-center justify-between">
<h4 className="text-hero-display-mobile font-hero-display-mobile text-on-surface">Kenji Sato</h4>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-warning text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>star</span>
<span className="text-body-medium font-metric-mono text-on-surface">4.9</span>
</div>
</div>
<p className="text-label-small font-label-small text-on-surface-variant">District Elite Fleet • 2,408 Deliveries</p>
<div className="flex gap-2 mt-3">
<button className="flex-grow py-2 rounded-full bg-primary text-on-primary font-bold text-body-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
<span className="material-symbols-outlined text-[18px]">chat</span>
                                Message
                            </button>
<button className="w-10 h-10 rounded-full border border-border-glass flex items-center justify-center hover:bg-white/5">
<span className="material-symbols-outlined text-on-surface">call</span>
</button>
</div>
</div>
</div>
</div>
{/* Progress Timeline */}
<div className="p-xl flex-grow">
<h2 className="text-section-header font-section-header text-on-surface-variant uppercase tracking-widest mb-lg">Live Timeline</h2>
<div className="relative space-y-8">
{/* Vertical Line */}
<div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-border-glass"></div>
<div className="absolute left-[15px] top-2 h-[60%] w-[2px] bg-primary"></div>
{/* Step 1: Confirmed */}
<div className="relative pl-10 flex items-start gap-4">
<div className="absolute left-0 w-8 h-8 rounded-full bg-surface-panel border-2 border-primary flex items-center justify-center z-10">
<span className="material-symbols-outlined text-primary text-[16px]">check</span>
</div>
<div>
<p className="text-body-medium font-body-medium text-on-surface">Order Confirmed</p>
<p className="text-label-small font-label-small text-on-surface-variant">District Kitchen • 18:42</p>
</div>
</div>
{/* Step 2: Preparing */}
<div className="relative pl-10 flex items-start gap-4">
<div className="absolute left-0 w-8 h-8 rounded-full bg-surface-panel border-2 border-primary flex items-center justify-center z-10">
<span className="material-symbols-outlined text-primary text-[16px]">restaurant</span>
</div>
<div>
<p className="text-body-medium font-body-medium text-on-surface">Kitchen Excellence</p>
<p className="text-label-small font-label-small text-on-surface-variant">Preparation Complete • 18:55</p>
</div>
</div>
{/* Step 3: Out for Delivery (Active) */}
<div className="relative pl-10 flex items-start gap-4">
<div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 neon-glow-pink">
<span className="material-symbols-outlined text-on-primary text-[16px]">delivery_dining</span>
</div>
<div>
<p className="text-body-medium font-body-medium text-primary font-bold">Courier Transit</p>
<p className="text-label-small font-label-small text-on-surface-variant">Kenji is 2.4km away • In Transit</p>
<div className="mt-3 flex items-center gap-4 bg-surface-container rounded-lg p-3 border border-border-glass">
<div className="text-center pr-4 border-r border-border-glass">
<span className="block text-metric-mono text-hero-display text-primary">08</span>
<span className="text-label-small font-label-small text-on-surface-variant">MINS</span>
</div>
<div>
<span className="text-label-small font-label-small text-on-surface-variant block">EST. ARRIVAL</span>
<span className="text-body-medium font-metric-mono text-on-surface">19:12 PM</span>
</div>
</div>
</div>
</div>
{/* Step 4: Arrival */}
<div className="relative pl-10 flex items-start gap-4 opacity-30">
<div className="absolute left-0 w-8 h-8 rounded-full bg-surface-panel border-2 border-border-glass flex items-center justify-center z-10">
<span className="material-symbols-outlined text-on-surface-variant text-[16px]">home</span>
</div>
<div>
<p className="text-body-medium font-body-medium text-on-surface">Final Handover</p>
<p className="text-label-small font-label-small text-on-surface-variant">Estimated 19:12</p>
</div>
</div>
</div>
</div>
{/* Order Summary (Bento-style metrics) */}
<div className="p-xl bg-surface-elevated border-t border-border-glass">
<h2 className="text-section-header font-section-header text-on-surface-variant uppercase tracking-widest mb-lg">Order Manifest</h2>
<div className="grid grid-cols-2 gap-3">
<div className="bg-surface-panel p-3 rounded-xl border border-border-glass">
<span className="text-label-small font-label-small text-on-surface-variant">ITEMS</span>
<span className="block text-body-medium font-metric-mono text-on-surface">03 Units</span>
</div>
<div className="bg-surface-panel p-3 rounded-xl border border-border-glass">
<span className="text-label-small font-label-small text-on-surface-variant">TEMP</span>
<span className="block text-body-medium font-metric-mono text-on-surface">62°C (Optimal)</span>
</div>
</div>
<div className="mt-4 flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
<div>
<span className="text-label-small font-label-small text-primary-container">LOYALTY REWARD</span>
<span className="block text-body-medium font-bold text-on-surface">+120 Diamond Credits</span>
</div>
<div className="w-12 h-12 loyalty-gradient rounded-full flex items-center justify-center shadow-lg">
<span className="material-symbols-outlined text-on-primary">military_tech</span>
</div>
</div>
</div>
</aside>
</main>
{/* Bottom Bar (Contextual) */}
<footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-panel/90 backdrop-blur-2xl border-t border-border-glass md:hidden">
<div className="flex flex-col items-center justify-center text-primary font-bold scale-110">
<span className="material-symbols-outlined text-[24px]">delivery_dining</span>
<span className="text-label-small font-label-small">Delivery</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">restaurant</span>
<span className="text-label-small font-label-small">Dining</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">local_mall</span>
<span className="text-label-small font-label-small">Groceries</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">smart_toy</span>
<span className="text-label-small font-label-small">AI Agent</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">person</span>
<span className="text-label-small font-label-small">Profile</span>
</div>
</footer>
{/* Atmosphere Effects */}
<div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-[60]">
<div className="absolute w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] -top-1/2 -right-1/4"></div>
<div className="absolute w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -bottom-1/4 -left-1/4"></div>
</div>


    </>
  );
};

export default RealTimeTracking;
