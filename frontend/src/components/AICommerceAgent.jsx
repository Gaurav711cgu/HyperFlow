import React from 'react';

const AICommerceAgent = () => {
  return (
    <>

{/* Top Navigation Bar (Shared Component Anchor) */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-margin-mobile pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="flex items-center justify-between w-full h-12">
<div className="flex items-center gap-md">
<span className="text-hero-display font-hero-display font-bold text-primary tracking-tighter">District</span>
<div className="hidden md:flex gap-md px-lg border-l border-border-glass">
<span className="text-primary font-bold transition-opacity hover:opacity-80 cursor-pointer">AI Agent</span>
<span className="text-on-surface-variant font-body-default transition-opacity hover:opacity-80 cursor-pointer">Delivery</span>
<span className="text-on-surface-variant font-body-default transition-opacity hover:opacity-80 cursor-pointer">Groceries</span>
</div>
</div>
<div className="flex items-center gap-md">
<button className="flex items-center gap-xs text-primary bg-primary/10 px-md py-xs rounded-full border border-primary/20">
<span className="material-symbols-outlined text-[18px]">location_on</span>
<span className="text-label-small font-label-small">Downtown Hub</span>
</button>
<div className="w-8 h-8 rounded-full overflow-hidden border border-border-glass">
<img className="w-full h-full object-cover" data-alt="A futuristic professional portrait of a tech-savvy user in a dimly lit obsidian environment with neon pink lighting accents reflecting off a glass background. The person looks confident and sophisticated, dressed in high-performance minimalist techwear. The visual style is crisp, cinematic, and emphasizes the premium high-velocity brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2tO3fncNv4404QJYfcR4maXfhawZqSQgoXfQ5O8B54qj9eJsItCXkM1VpHC_LJ-ZCtdz4hiDtBENK72IykdxC27Dkym1yh8gV18d3xy-yUVoUzw94tObL0wpmlmDo5UwH3zVfGgtFgcahfIgIiCkTt9PZMadV1wHhff0S7D-XCfaeFdFEAsxT-oCm9sKs587BI069qB0mc8Hpp7-eGRoEvwhTyaWcjf4Zi84T59pR5FeL6oZ_OLxVi-nfQWP95zOs7rQjJZ-pRvvF"/>
</div>
</div>
</div>
</header>
<main className="flex flex-1 pt-[68px] overflow-hidden">
{/* Left Pane: History & MCP Tools */}
<aside className="w-[320px] glass-panel flex flex-col h-full border-r border-border-glass">
<div className="p-lg border-b border-border-glass">
<h2 className="text-section-header font-section-header text-on-surface uppercase tracking-widest flex items-center gap-sm">
<span className="material-symbols-outlined text-primary text-[18px]">history</span>
                    System Logs
                </h2>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar p-md space-y-md">
{/* Tool Active State */}
<div className="p-md rounded-xl bg-surface-elevated border border-primary/20 neon-glow-pink">
<div className="flex justify-between items-start mb-sm">
<span className="text-metric-mono font-metric-mono text-primary">MCP-V1.4.2</span>
<span className="text-[8px] px-sm py-[1px] rounded bg-primary text-on-primary font-bold">ACTIVE</span>
</div>
<p className="text-body-medium font-body-medium text-on-surface">Route Optimization Tool</p>
<div className="mt-md space-y-xs">
<div className="flex justify-between text-label-small font-label-small text-on-surface-variant">
<span>Latency</span>
<span className="text-tertiary">12ms</span>
</div>
<div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-tertiary w-3/4"></div>
</div>
</div>
</div>
{/* History Item 1 */}
<div className="p-md rounded-xl bg-surface-panel hover:bg-surface-elevated transition-colors cursor-pointer border border-transparent hover:border-border-glass group">
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">inventory_2</span>
<span className="text-label-small font-label-small text-on-surface-variant">2h ago</span>
</div>
<p className="text-body-default font-body-default text-on-surface line-clamp-1">Inventory check: Premium Carbon Fiber</p>
</div>
{/* History Item 2 */}
<div className="p-md rounded-xl bg-surface-panel hover:bg-surface-elevated transition-colors cursor-pointer border border-transparent hover:border-border-glass group">
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">payments</span>
<span className="text-label-small font-label-small text-on-surface-variant">5h ago</span>
</div>
<p className="text-body-default font-body-default text-on-surface line-clamp-1">Transactional validation: District ID 902</p>
</div>
{/* History Item 3 */}
<div className="p-md rounded-xl bg-surface-panel hover:bg-surface-elevated transition-colors cursor-pointer border border-transparent hover:border-border-glass group">
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">map</span>
<span className="text-label-small font-label-small text-on-surface-variant">Yesterday</span>
</div>
<p className="text-body-default font-body-default text-on-surface line-clamp-1">New logistics route: Sector 7G</p>
</div>
</div>
{/* System Metrics Footer */}
<div className="p-lg bg-surface-container-low border-t border-border-glass">
<div className="grid grid-cols-2 gap-md">
<div>
<span className="block text-label-small font-label-small text-on-surface-variant mb-[2px]">Credits</span>
<span className="text-metric-mono font-metric-mono text-primary">12,450.00</span>
</div>
<div>
<span className="block text-label-small font-label-small text-on-surface-variant mb-[2px]">Tier</span>
<span className="text-metric-mono font-metric-mono text-tertiary">PLATINUM</span>
</div>
</div>
</div>
</aside>
{/* Right Pane: Chat Window */}
<section className="flex-1 flex flex-col relative bg-[#040406]">
{/* Subtle atmospheric background */}
<div className="absolute inset-0 opacity-10 pointer-events-none">

</div>
{/* Chat Content */}
<div className="flex-1 overflow-y-auto custom-scrollbar p-xl space-y-xl relative z-10">
{/* Agent Welcome */}
<div className="flex flex-col items-center justify-center py-xl space-y-md">
<div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center shimmer-effect border-primary/30">
<span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: '\'FILL\' 1'}}>smart_toy</span>
</div>
<div className="text-center">
<h1 className="text-hero-display font-hero-display text-on-surface">District Intelligence</h1>
<p className="text-body-medium font-body-medium text-on-surface-variant max-w-sm">How can I assist your logistics operations today?</p>
</div>
</div>
{/* Chat Bubble: User */}
<div className="flex justify-end">
<div className="max-w-[70%] bg-surface-elevated border border-border-glass rounded-2xl rounded-tr-none p-lg">
<p className="text-body-default font-body-default text-on-surface">
                            Can you analyze the fastest delivery route for the Obsidian-class cargo from Downtown Hub to Sector 4? I need to account for current atmospheric turbulence.
                        </p>
<span className="block text-right text-[10px] text-on-surface-variant mt-sm">14:22</span>
</div>
</div>
{/* Chat Bubble: Agent */}
<div className="flex justify-start">
<div className="max-w-[85%] bg-surface-panel border border-primary/10 rounded-2xl rounded-tl-none p-lg relative">
<div className="flex items-center gap-sm mb-md">
<span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
<span className="text-label-small font-label-small text-primary uppercase tracking-tighter">Processing Logistics Data...</span>
</div>
{/* Mini Bento Results Grid */}
<div className="grid grid-cols-5 gap-sm mb-md">
<div className="col-span-3 h-32 rounded-lg bg-surface-elevated border border-border-glass overflow-hidden relative">
<div className="absolute inset-0 p-md flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
<span className="text-label-small font-label-small text-on-surface-variant">Optimal Route Map</span>
<span className="text-section-header font-section-header text-on-surface">Route Alpha-9</span>
</div>
<div className="w-full h-full bg-cover bg-center" data-alt="A stylized glowing digital map of a futuristic urban city with neon pink and blue light trails representing high-speed logistics routes. The map shows intricate grid patterns and elevated transport corridors in a dark obsidian-themed environment, with data points and holographic markers. High-key technological precision and atmospheric depth." style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuDjnx17DvYwaxx29La-hl9AIOk8rcHdPJWtycgwAHXv8-Osnbhnc46Y-C-xu1gpviYHGTSqK839JmDwitsi7GLfHWax1uI_1u_BBDg0HD9fG8oxn0pVSav8dNnydGMTY7L2Kk8EwhOmzqxlUuojfBNzy8U9YnpszdtvQTJBGhbv8nH2ysQzjv8xYfxXVmVnh4N_SQD3KANE12z_qeQvL4c_XZy0pAuPYX2jcE7jNGdIT3g6PLsUaoL10gE1CrT_oG8WiG9JB_Gp7ebT\')'}}></div>
</div>
<div className="col-span-2 h-32 flex flex-col gap-sm">
<div className="flex-1 rounded-lg bg-surface-elevated border border-border-glass p-sm flex flex-col justify-center items-center">
<span className="text-metric-mono font-metric-mono text-tertiary text-lg">18.4s</span>
<span className="text-[8px] text-on-surface-variant uppercase">Est. Time</span>
</div>
<div className="flex-1 rounded-lg bg-surface-elevated border border-border-glass p-sm flex flex-col justify-center items-center">
<span className="text-metric-mono font-metric-mono text-primary text-lg">99.8%</span>
<span className="text-[8px] text-on-surface-variant uppercase">Stability</span>
</div>
</div>
</div>
<p className="text-body-default font-body-default text-on-surface">
                            Analysis complete. <strong className="text-primary">Route Alpha-9</strong> is the most efficient. By leveraging the low-pressure corridors in Sector 4, we can bypass 80% of the turbulence.
                        </p>
<div className="mt-lg flex gap-md">
<button className="px-lg py-sm rounded-full bg-primary text-on-primary font-bold text-body-medium shimmer-effect neon-glow-pink">
                                Initialize Dispatch
                            </button>
<button className="px-lg py-sm rounded-full border border-border-glass text-on-surface font-bold text-body-medium hover:bg-surface-elevated transition-colors">
                                View Details
                            </button>
</div>
<span className="block text-left text-[10px] text-on-surface-variant mt-sm">14:23</span>
</div>
</div>
{/* Spacer for fixed input */}
<div className="h-32"></div>
</div>
{/* Input Dock */}
<div className="absolute bottom-0 left-0 w-full p-xl pointer-events-none">
<div className="max-w-4xl mx-auto pointer-events-auto">
<div className="glass-panel p-md rounded-2xl flex items-center gap-md shadow-2xl border-primary/10">
<button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-elevated text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">attach_file</span>
</button>
<div className="flex-1">
<textarea className="w-full bg-transparent border-none focus:ring-0 text-body-default text-on-surface placeholder-on-surface-variant/40 resize-none" placeholder="Message District Intelligence..." rows="1"></textarea>
</div>
<div className="flex items-center gap-sm">
<button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-elevated text-on-surface-variant">
<span className="material-symbols-outlined">mic</span>
</button>
<button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary hover:scale-105 transition-transform duration-200">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
<div className="mt-sm flex justify-center gap-md">
<span className="text-[10px] text-on-surface-variant/60 flex items-center gap-xs">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                            System Online
                        </span>
<span className="text-[10px] text-on-surface-variant/60">MCP 1.4.2 Connected</span>
</div>
</div>
</div>
</section>
{/* Right Side: Status/Loyalty (Shared Component Hinting) */}
<aside className="w-[300px] glass-panel hidden xl:flex flex-col border-l border-border-glass">
<div className="p-lg">
<div className="p-md rounded-xl bg-gradient-to-br from-[#14141F] to-[#0A0A0F] border border-border-glass mb-xl">
<div className="flex justify-between items-center mb-md">
<h3 className="text-section-header font-section-header text-on-surface">Loyalty Status</h3>
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '\'FILL\' 1'}}>verified</span>
</div>
<div className="space-y-md">
<div className="flex justify-between items-end">
<span className="text-label-small font-label-small text-on-surface-variant">Elite Progress</span>
<span className="text-metric-mono font-metric-mono text-primary">82%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-secondary w-[82%]"></div>
</div>
<p className="text-[10px] text-on-surface-variant italic">Next Tier: Platinum Elite Diamond</p>
</div>
</div>
<h3 className="text-section-header font-section-header text-on-surface uppercase tracking-widest mb-md flex items-center gap-sm px-sm">
<span className="material-symbols-outlined text-secondary text-[18px]">flash_on</span>
                    Active Tools
                </h3>
<div className="space-y-sm px-sm">
<div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-glass cursor-pointer">
<div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">shopping_cart</span>
</div>
<div className="flex-1">
<div className="text-body-medium font-body-medium text-on-surface">Cart Sync</div>
<div className="text-[10px] text-tertiary">Real-time</div>
</div>
</div>
<div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-elevated transition-colors border border-transparent hover:border-border-glass cursor-pointer">
<div className="w-8 h-8 rounded bg-secondary/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[20px]">shield</span>
</div>
<div className="flex-1">
<div className="text-body-medium font-body-medium text-on-surface">Privacy Shield</div>
<div className="text-[10px] text-on-surface-variant">Encrypted</div>
</div>
</div>
</div>
</div>
</aside>
</main>
{/* Bottom Navigation Bar (Mobile Only - Suppressed by shared component logic for desktop view) */}
<nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-panel/90 backdrop-blur-2xl border-t border-border-glass shadow-[0_-8px_24px_rgba(0,0,0,0.5)] rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">delivery_dining</span>
<span className="text-label-small font-label-small">Delivery</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">restaurant</span>
<span className="text-label-small font-label-small">Dining</span>
</div>
<div className="flex flex-col items-center justify-center text-primary font-bold scale-110">
<span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: '\'FILL\' 1'}}>smart_toy</span>
<span className="text-label-small font-label-small">AI Agent</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">local_mall</span>
<span className="text-label-small font-label-small">Groceries</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">person</span>
<span className="text-label-small font-label-small">Profile</span>
</div>
</nav>


    </>
  );
};

export default AICommerceAgent;
