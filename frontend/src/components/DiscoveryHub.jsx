import React from 'react';
import { motion } from 'framer-motion';

const DiscoveryHub = () => {
  return (
    <>

{/* TopAppBar */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-xl pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="flex items-center justify-between max-w-[1440px] mx-auto w-full">
<div className="flex items-center gap-xl">
<span className="text-hero-display font-hero-display font-bold text-primary tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">District</span>
<div className="hidden md:flex items-center bg-surface-container rounded-full px-lg py-sm border border-border-glass min-w-[400px]">
<span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-sm">search</span>
<input className="bg-transparent border-none outline-none text-body-default text-on-surface placeholder:text-on-surface-variant/50 w-full" placeholder="Search curated merchants or delivery slots..." type="text"/>
</div>
</div>
<div className="flex items-center gap-lg">
<div className="flex items-center gap-xs px-md py-xs bg-surface-container-high rounded-lg border border-border-glass cursor-pointer hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
<span className="text-body-medium font-body-medium text-on-surface">Lower Manhattan, NY</span>
</div>
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-full border-2 border-primary-container p-0.5 overflow-hidden">
<img className="w-full h-auto rounded-full object-cover" data-alt="A professional high-fidelity studio portrait of a tech-savvy executive in their late 20s. The lighting is moody and cinematic with hints of hot pink neon reflecting off their sharp features. The background is a blurred obsidian tech workspace with high-end hardware. The overall vibe is premium, exclusive, and hyper-modern, fitting a luxury digital platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkjIe7ftPr73AcnjOzX3-ui0Xbbho54xtdD5czbkz7DJ2mdigOasrDeMoDVaBjZSUFeCN0EAflCDpLXBD1NbzOvWFeB8YOQ9WGS0cnpYXWqc0urY7eRW76ES7_0Kla9qSWeTeKWvN-_g4r-xs7rFgIWOnskumKT1XW2XAuPWrFb5gaEsQDqj6mMVNQ4wZWCXFqRXTZSjMjOFa2xa8ph73fqXxyOKRPJ625oY-g_YuSygzfG0o6Vfy2GRwkO-e11nJSvyGZcjfHpsGS"/>
</div>
</div>
</div>
</div>
</header>
<main className="pt-[84px] min-h-screen max-w-[1440px] mx-auto px-xl pb-xl">
<div className="grid grid-cols-1 md:grid-cols-[240px_1fr_320px] gap-xl h-[calc(100vh-100px)]">
{/* Left Sidebar: Categories & Navigation */}
<aside className="flex flex-col gap-lg overflow-y-auto pr-xs">
<nav className="flex flex-col gap-sm">
<a className="flex items-center gap-md px-md py-sm rounded-xl bg-primary-container/10 text-primary font-bold transition-all" href="#">
<span className="material-symbols-outlined">delivery_dining</span>
<span className="text-section-header font-section-header">Delivery</span>
</a>
<a className="flex items-center gap-md px-md py-sm rounded-xl text-on-surface-variant hover:bg-surface-container transition-all" href="#">
<span className="material-symbols-outlined">restaurant</span>
<span className="text-section-header font-section-header">Dining</span>
</a>
<a className="flex items-center gap-md px-md py-sm rounded-xl text-on-surface-variant hover:bg-surface-container transition-all" href="#">
<span className="material-symbols-outlined">local_mall</span>
<span className="text-section-header font-section-header">Groceries</span>
</a>
<a className="flex items-center gap-md px-md py-sm rounded-xl text-on-surface-variant hover:bg-surface-container transition-all" href="#">
<span className="material-symbols-outlined">smart_toy</span>
<span className="text-section-header font-section-header">AI Agent</span>
</a>
</nav>
<div className="mt-md">
<p className="text-label-small font-label-small uppercase tracking-widest text-on-surface-variant/40 mb-sm px-md">Categories</p>
<div className="grid grid-cols-2 gap-sm">
<div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center gap-xs cursor-pointer hover:scale-105 transition-transform group">
<span className="material-symbols-outlined text-primary group-hover:drop-shadow-[0_0_8px_#ffb1c2]">bolt</span>
<span className="text-label-small font-label-small">Instant</span>
</div>
<div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center gap-xs cursor-pointer hover:scale-105 transition-transform group">
<span className="material-symbols-outlined text-secondary group-hover:drop-shadow-[0_0_8px_#dab9ff]">liquor</span>
<span className="text-label-small font-label-small">Premium</span>
</div>
<div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center gap-xs cursor-pointer hover:scale-105 transition-transform group">
<span className="material-symbols-outlined text-tertiary group-hover:drop-shadow-[0_0_8px_#00e475]">nutrition</span>
<span className="text-label-small font-label-small">Healthy</span>
</div>
<div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center gap-xs cursor-pointer hover:scale-105 transition-transform group">
<span className="material-symbols-outlined text-warning group-hover:drop-shadow-[0_0_8px_#FFB300]">star</span>
<span className="text-label-small font-label-small">Elite</span>
</div>
</div>
</div>
{/* Loyalty Card Mini */}
<div className="mt-auto glass-panel p-lg rounded-2xl relative overflow-hidden">
<div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/20 blur-3xl"></div>
<p className="text-label-small font-label-small text-on-surface-variant mb-xs">PLATINUM STATUS</p>
<h4 className="text-section-header font-section-header text-primary mb-md">Elite Member</h4>
<div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full w-3/4 shadow-[0_0_10px_rgba(255,177,194,0.5)]"></div>
</div>
<p className="text-label-small font-label-small text-on-surface-variant/60 mt-sm">240 points until VIP Platinum</p>
</div>
</aside>
{/* Center Panel: Feed & Hero */}
<section className="flex flex-col gap-xl overflow-y-auto no-scrollbar">
{/* Streak Hero Card */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="relative w-full h-48 rounded-3xl overflow-hidden glass-panel group border border-primary/20"
>

<div className="absolute inset-0 bg-gradient-to-r from-[#040406] via-[#040406]/60 to-transparent p-xl flex flex-col justify-center">
<div className="flex items-center gap-md mb-sm">
<span className="material-symbols-outlined text-primary text-[32px] animate-pulse" style={{fontVariationSettings: '\'FILL\' 1'}}>local_fire_department</span>
<span className="text-metric-mono font-metric-mono text-primary text-xl uppercase tracking-tighter">12 Day Streak</span>
</div>
<h2 className="text-hero-display font-hero-display max-w-[300px] mb-md">Keep the fire burning, District Elite.</h2>
<button className="shimmer-btn w-fit px-xl py-md bg-primary-container text-on-primary font-bold rounded-full text-body-medium neon-glow-primary">
                            CLAIM DAILY REWARD
                        </button>
</div>
</motion.div>
{/* Restaurant Feed Section */}
<div>
<div className="flex items-center justify-between mb-lg">
<h3 className="text-hero-display font-hero-display">Featured Merchants</h3>
<div className="flex gap-sm">
<button className="p-xs rounded-full border border-border-glass hover:bg-surface-container"><span className="material-symbols-outlined">chevron_left</span></button>
<button className="p-xs rounded-full border border-border-glass hover:bg-surface-container"><span className="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
{/* Main Restaurant Card: Behrouz Biryani */}
<div className="glass-panel rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/40 transition-all duration-300">
<div className="h-64 relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Exquisite and artistic food photography of Behrouz Biryani, showcasing a golden-hued, saffron-infused rice dish in a handcrafted royal brass pot. The steam rises elegantly against a dark obsidian background, illuminated by soft golden light and sharp neon pink highlights. Glistening roasted nuts and deep green mint leaves garnish the dish, emphasizing luxury and high-velocity gourmet delivery." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3O6h3kN5v2ZfZDd3Ufds1_PUUHBmlla4WShhsUOwN1BiWVty9aGs9k-ujSiY3HWg0c-a6yUVCpufZJTK3hqLopqOy-INM9HYG-SKcVE0PbA__mUudSLa2FZF4yeu1q6fwxpjVZXn7yNLyelP_KZmven-uKjmR8Q3bG2PkZi64JiSya_N0Zb1Ww0kf3A7LW34llf4b4dpiTff9GbejYkJFooJR4Slc4fs85sLnGz-kZjWnuFABxdtocK8oviRGW5vmkB6XF1IMU4YS"/>
<div className="absolute top-lg right-lg bg-[#040406]/80 backdrop-blur-md px-md py-sm rounded-xl border border-border-glass">
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-warning text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>star</span>
<span className="text-metric-mono font-metric-mono text-on-surface">4.8</span>
</div>
</div>
<div className="absolute bottom-lg left-lg bg-primary-container text-on-primary px-md py-xs rounded-full text-label-small font-bold uppercase tracking-widest">
                                Premium Partner
                            </div>
</div>
<div className="p-xl flex flex-col gap-md">
<div className="flex items-start justify-between">
<div>
<h4 className="text-hero-display font-hero-display mb-xs">Behrouz Biryani</h4>
<p className="text-body-default text-on-surface-variant">Royal Recipes • North Indian • Elite Packaging</p>
</div>
<div className="text-right">
<span className="text-metric-mono font-metric-mono text-primary text-lg">22 MIN</span>
<p className="text-label-small font-label-small text-on-surface-variant/60 uppercase">Delivery Window</p>
</div>
</div>
<div className="flex items-center gap-xl mt-sm">
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">payments</span>
<span className="text-body-medium font-body-medium text-on-surface">$$$</span>
</div>
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-on-surface-variant text-[18px]">verified</span>
<span className="text-body-medium font-body-medium text-on-surface">District Curated</span>
</div>
</div>
</div>
</div>
{/* Additional Grid Feed */}
<div className="grid grid-cols-2 gap-lg mt-lg">
<div className="glass-panel rounded-2xl overflow-hidden group cursor-pointer hover:border-secondary/40 transition-all">
<div className="h-40 relative">
<img className="w-full h-full object-cover" data-alt="High-end sushi platter arrangement with vibrant orange salmon and deep red tuna nigiri on a sleek black slate board. Subtle purple neon glows illuminate the edges of the fish. Soft depth of field with a dark, atmospheric restaurant background. Minimalist luxury aesthetic with clean lines and sharp focus on texture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
</div>
<div className="p-lg">
<h5 className="text-section-header font-section-header mb-xs">Yoko Ono Sushi</h5>
<p className="text-label-small font-label-small text-on-surface-variant">Modern Japanese • 18 min</p>
</div>
</div>
<div className="glass-panel rounded-2xl overflow-hidden group cursor-pointer hover:border-tertiary/40 transition-all">
<div className="h-40 relative">
<img className="w-full h-full object-cover" data-alt="Gourmet artisanal burger with melting cheese and caramelized onions, captured with high-contrast macro photography. Neon green lighting highlights the crisp textures of the bun. The background is a dark, industrial chic setting. The composition is dynamic and appetizing, reflecting a premium urban dining experience." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
</div>
<div className="p-lg">
<h5 className="text-section-header font-section-header mb-xs">Carbon Grill</h5>
<p className="text-label-small font-label-small text-on-surface-variant">Artisanal Burgers • 25 min</p>
</div>
</div>
</div>
</div>
</section>
{/* Right Sidebar: Reorder & Cart */}
<aside className="flex flex-col gap-xl">
{/* Your Usual Section */}
<div className="glass-panel rounded-3xl p-xl flex flex-col gap-lg border border-border-glass">
<div className="flex items-center justify-between">
<h4 className="text-section-header font-section-header uppercase tracking-widest text-on-surface-variant">Your Usual</h4>
<span className="material-symbols-outlined text-primary cursor-pointer hover:rotate-180 transition-transform duration-500">autorenew</span>
</div>
<div className="flex flex-col gap-md">
<div className="p-md rounded-2xl bg-surface-container flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors border border-transparent hover:border-border-glass">
<div className="flex items-center gap-md">
<div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-primary">local_cafe</span>
</div>
<div>
<p className="text-body-medium font-bold text-on-surface">Nitro Cold Brew</p>
<p className="text-label-small font-label-small text-on-surface-variant">Starbucks Reserve</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">add_circle</span>
</div>
<div className="p-md rounded-2xl bg-surface-container flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors border border-transparent hover:border-border-glass">
<div className="flex items-center gap-md">
<div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-secondary">lunch_dining</span>
</div>
<div>
<p className="text-body-medium font-bold text-on-surface">Truffle Burger</p>
<p className="text-label-small font-label-small text-on-surface-variant">Carbon Grill</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors">add_circle</span>
</div>
<div className="p-md rounded-2xl bg-surface-container flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors border border-transparent hover:border-border-glass">
<div className="flex items-center gap-md">
<div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary">eco</span>
</div>
<div>
<p className="text-body-medium font-bold text-on-surface">Kale Caesar</p>
<p className="text-label-small font-label-small text-on-surface-variant">Sweetgreen</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors">add_circle</span>
</div>
</div>
<button className="w-full py-md rounded-full bg-surface-container-highest border border-border-glass text-body-medium font-bold hover:bg-surface-variant transition-colors">
                        VIEW ALL HISTORY
                    </button>
</div>
{/* AI Agent / Order Status */}
<div className="glass-panel rounded-3xl p-xl flex flex-col gap-md relative overflow-hidden bg-gradient-to-br from-[#0A0A0F] to-[#14141F]">
<div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/10 blur-3xl"></div>
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
<h4 className="text-section-header font-section-header text-on-surface">District Intelligence</h4>
</div>
<p className="text-body-default text-on-surface-variant italic">"Your order from 'The Butcher's Daughter' is currently 4 minutes away. Shall I pre-heat your smart oven?"</p>
<div className="flex gap-sm mt-sm">
<button className="flex-1 py-sm bg-secondary/10 border border-secondary/20 text-secondary rounded-lg text-label-small font-bold hover:bg-secondary/20 transition-all">YES, PLEASE</button>
<button className="flex-1 py-sm bg-surface-container border border-border-glass text-on-surface-variant rounded-lg text-label-small font-bold hover:bg-surface-variant transition-all">DISMISS</button>
</div>
</div>
{/* Promo / VIP Badge */}
<div className="mt-auto p-xl rounded-3xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 flex items-center gap-lg group cursor-pointer">
<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,177,194,0.4)]">
<span className="material-symbols-outlined text-on-primary">card_giftcard</span>
</div>
<div>
<h5 className="text-body-medium font-bold text-on-surface group-hover:text-primary transition-colors">Unlock VIP Lounge</h5>
<p className="text-label-small font-label-small text-on-surface-variant">Access exclusive off-menu items from top NYC chefs.</p>
</div>
</div>
</aside>
</div>
</main>
{/* Contextual FAB (Only for main landing) */}
<div className="fixed bottom-xl right-xl z-50">
<button className="flex items-center gap-md px-xl py-lg bg-primary text-on-primary rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all shimmer-btn neon-glow-primary">
<span className="material-symbols-outlined">shopping_cart</span>
<span className="text-body-medium uppercase tracking-widest">Cart • 2 Items</span>
</button>
</div>
{/* Micro-interactions Script */}


    </>
  );
};

export default DiscoveryHub;
