import React from 'react';

const RestaurantDetail = () => {
  return (
    <>

{/* TopAppBar */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-margin-mobile pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A professional studio portrait of a sophisticated young tech executive with sharp features, wearing a sleek black turtleneck. The lighting is dramatic and cinematic, with high contrast and a cool-toned obsidian background that matches a premium luxury aesthetic. Soft pink neon rim lighting highlights his silhouette, emphasizing a high-velocity, elite personality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqcJN2QVbaQhhJ15ApZcKu2D7UvED18jYh5960NMP6QGTJwBUQS8cWzemfxwO-DQSNQMgvFUsntZH37QOHhv_oFUVORpynTGW-ZIIxJR-SOsWiRfAx0n_f0k1pHFAwX3dlBKqsPsJC0Sy1WpbBb8wRoucah1IpaTLWf392BbdDvozDO7W6vJ7vl4TO8FusAhAvoW8xSnM-Fi7mBNFt29WPEnzDpl2GSIKksYFYthrK2PWpRsnUbiDXTwejpM1WZPRH9R0sQtMsVpaY"/>
</div>
<h1 className="text-hero-display font-hero-display font-bold text-primary tracking-tighter">District</h1>
</div>
<nav className="hidden md:flex items-center gap-xl">
<a className="text-primary font-bold hover:opacity-80 transition-opacity" href="#">Dining</a>
<a className="text-on-surface-variant opacity-60 hover:opacity-80 transition-opacity" href="#">Delivery</a>
<a className="text-on-surface-variant opacity-60 hover:opacity-80 transition-opacity" href="#">Groceries</a>
<a className="text-on-surface-variant opacity-60 hover:opacity-80 transition-opacity" href="#">AI Agent</a>
</nav>
<div className="flex items-center gap-md">
<div className="flex items-center gap-xs px-md py-sm glass-panel rounded-full text-primary">
<span className="material-symbols-outlined text-[20px]">location_on</span>
<span className="text-label-small font-label-small">Dubai Marina</span>
</div>
<button className="material-symbols-outlined text-primary hover:opacity-80 active:scale-95 transition-all">shopping_bag</button>
</div>
</div>
</header>
<main className="pt-[80px] max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr_340px] gap-gutter h-[calc(100vh-80px)] px-gutter overflow-hidden">
{/* Left Sidebar: Menu Categories */}
<aside className="hidden md:flex flex-col py-xl custom-scrollbar overflow-y-auto">
<h3 className="text-section-header font-section-header text-primary mb-lg uppercase tracking-widest opacity-50">Collections</h3>
<div className="flex flex-col gap-sm">
<button className="flex items-center justify-between px-md py-sm glass-panel rounded-lg text-primary font-bold border-l-4 border-l-primary-container">
<span>Royal Biryani</span>
<span className="text-metric-mono font-metric-mono text-[10px]">12</span>
</button>
<button className="flex items-center justify-between px-md py-sm hover:bg-surface-variant/20 rounded-lg transition-colors group">
<span className="text-on-surface-variant group-hover:text-primary">Subz-e-Biryani</span>
<span className="text-metric-mono font-metric-mono text-on-surface-variant opacity-40">08</span>
</button>
<button className="flex items-center justify-between px-md py-sm hover:bg-surface-variant/20 rounded-lg transition-colors group">
<span className="text-on-surface-variant group-hover:text-primary">Kebabs & Starters</span>
<span className="text-metric-mono font-metric-mono text-on-surface-variant opacity-40">15</span>
</button>
<button className="flex items-center justify-between px-md py-sm hover:bg-surface-variant/20 rounded-lg transition-colors group">
<span className="text-on-surface-variant group-hover:text-primary">Shirini (Desserts)</span>
<span className="text-metric-mono font-metric-mono text-on-surface-variant opacity-40">05</span>
</button>
<button className="flex items-center justify-between px-md py-sm hover:bg-surface-variant/20 rounded-lg transition-colors group">
<span className="text-on-surface-variant group-hover:text-primary">Beverages</span>
<span className="text-metric-mono font-metric-mono text-on-surface-variant opacity-40">09</span>
</button>
</div>
<div className="mt-auto p-md glass-panel rounded-xl border-dashed border-primary/20">
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-warning text-[18px]" style={{fontVariationSettings: '\'FILL\' 1'}}>workspace_premium</span>
<span className="text-label-small font-label-small text-warning font-bold">VIP STATUS</span>
</div>
<p className="text-[11px] text-on-surface-variant mb-md">Spend $42 more to unlock Elite Platinum delivery perks.</p>
<div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-warning to-primary w-[65%]"></div>
</div>
</div>
</aside>
{/* Center Feed: Menu Items */}
<section className="flex flex-col py-xl overflow-y-auto custom-scrollbar pr-md">
{/* Brand Banner */}
<div className="relative w-full h-[220px] rounded-2xl overflow-hidden mb-xl group">
<div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="A luxurious, high-contrast overhead shot of authentic Behrouz Biryani served in traditional copper vessels. The scene is set on a dark, textured slate surface with scattered saffron strands, vibrant green mint leaves, and golden fried onions. Atmospheric steam rises elegantly against a dark obsidian background, illuminated by a warm amber spotlight and subtle pink neon accents reflecting off the metallic surfaces. The mood is opulent, high-end, and intensely appetizing." style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuBO8RUON-0Yl8JERiePhVFj8Z-Nmfi7A-U5kybOvYLPadTK0uNxXuT-6WSHyhmSSwZXdN6Fte6CFkXWaaytQN_GxD8URqNGmiThzbzJomV7WsXP5b5sMfO2GYRMLj8sagiUXcgUTLUwIUFJnGiJUSs-7ScqHOOE8RUkPjgy4cV7DtmYfeHPZKv-H3fBL4IixTqcLluBWbgeMFRFUL-KmmR84fv2SqqNVNdbM0gRUOUSAZJtf_kj549UYqg7Gm_Ch9KT0OcG1BiTR2qH\')'}}>
</div>
<div className="absolute bottom-lg left-lg z-20">
<div className="flex items-center gap-sm mb-xs">
<span className="bg-primary-container text-on-primary-container px-sm py-[2px] rounded text-[10px] font-bold uppercase tracking-tighter">Legendary</span>
<div className="flex items-center gap-1 text-warning">
<span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: '\'FILL\' 1'}}>star</span>
<span className="text-metric-mono font-metric-mono">4.8 (2k+)</span>
</div>
</div>
<h2 className="text-[32px] font-bold text-white tracking-tight leading-none mb-1">Behrouz Biryani</h2>
<p className="text-on-surface-variant text-body-medium opacity-80">The Secret Recipe of Persia. Royal spices & aged Basmati.</p>
</div>
<div className="absolute top-lg right-lg z-20 flex gap-sm">
<button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-white hover:bg-primary-container transition-colors">
<span className="material-symbols-outlined text-[20px]">favorite</span>
</button>
<button className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-white hover:bg-primary-container transition-colors">
<span className="material-symbols-outlined text-[20px]">share</span>
</button>
</div>
</div>
{/* Search & Filters */}
<div className="flex items-center gap-md mb-lg">
<div className="flex-1 glass-panel rounded-full flex items-center px-md py-sm">
<span className="material-symbols-outlined text-on-surface-variant opacity-60 mr-sm">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-default w-full text-on-surface" placeholder="Search in Behrouz Biryani..." type="text"/>
</div>
<div className="flex items-center gap-xs">
<button className="px-md py-sm glass-panel rounded-full text-label-small font-bold text-on-surface-variant hover:border-primary transition-all">VEG</button>
<button className="px-md py-sm glass-panel rounded-full text-label-small font-bold text-on-surface-variant hover:border-primary transition-all">NON-VEG</button>
</div>
</div>
{/* Menu List */}
<div className="flex flex-col gap-md">
<h4 className="text-section-header font-section-header text-primary uppercase tracking-[2px] mb-sm">Royal Biryani (Serves 1-2)</h4>
{/* Menu Card 1 */}
<div className="glass-panel p-md rounded-xl flex gap-md hover:border-primary/40 transition-all duration-300">
<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="A close-up of Dum Gosht Biryani in a dark ceramic bowl, showcasing succulent pieces of lamb nestled in aromatic, long-grain basmati rice. The lighting is moody and elite, with sharp focus on the glistening textures of the meat and the vibrant orange hues of saffron. The background is a deep charcoal texture with subtle cinematic shadows and a soft pink glow in the far distance, creating a high-velocity luxury food aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy8Ulq_axTRp6t2EagRb5G-YtqpRnvPzPmyNLG-1FBJ0_p-83Hb7anlB2ZhXsi9Yd0x4n4HVmWhRYJ4r1J0aeYhAKyBpAHs5R59gryk1trq626wW1LuUFZ7SkM8OvhMdS78RXzvNqpn-E03C047MfVamHP-NIetglvLA2A5zzJjsUUJ8KlWdV_E4DdUow8sK7YValAPmnwch_EcyAii9s8yhA-yi925HvzzqKBSoWyYDzGpNFU46e2dbF68cDx_CA1jI2gcAKBGs_E"/>
<div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm p-[2px] rounded border border-danger">
<div className="w-2 h-2 rounded-full bg-danger"></div>
</div>
</div>
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-1">
<h5 className="text-body-medium font-bold text-primary-fixed">Dum Gosht Biryani (Boneless)</h5>
<span className="text-metric-mono font-metric-mono text-primary">$18.50</span>
</div>
<p className="text-label-small text-on-surface-variant opacity-60 line-clamp-2">Succulent pieces of boneless lamb, marinated in secret spices, slow-cooked with long grain basmati rice.</p>
</div>
<div className="flex items-center justify-between mt-md">
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-warning text-[14px]" style={{fontVariationSettings: '\'FILL\' 1'}}>thumb_up</span>
<span className="text-[10px] text-on-surface-variant font-medium">Top Seller</span>
</div>
<div className="flex gap-sm">
<button className="px-md py-1 border border-primary/40 rounded-full text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors">SWAP</button>
<button className="px-xl py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-extrabold shadow-lg neon-glow-primary gloss-shimmer active:scale-95 transition-all">+ ADD</button>
</div>
</div>
</div>
</div>
{/* Menu Card 2 */}
<div className="glass-panel p-md rounded-xl flex gap-md hover:border-primary/40 transition-all duration-300">
<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="Exquisite Lazeez Bhuna Murgh Biryani presented in a sleek, modern black dish. The dish features tender chicken pieces coated in a rich, dark gravy, layered with pearl-white basmati rice and topped with caramelized onions. The environment is dark and atmospheric, with sharp high-key highlights and a subtle magenta neon ambient glow that emphasizes the premium tech-forward lifestyle brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVH7_iiDjEwAqM-iOH8jm3r4ljZMINGVU_Xp5Q-c5wjp04ir3wyacHOLYmjmdPdsAEKmN7NFvNQ8ccPIwOAUEqVu7ESWWZFV7ECSWX7JzlbDWyCtYJ_7mti2MWNy3Yuj77gJG8cjX2qVom1OGcFA8kzAFxQ4u3CBk-mzNORIV01WqDHbcX9ae4xKUwXCM69aXnh0vKIHvWcTm7xzkbIx4a_pAK1gBNf1lGPPzRLuDKikphdzej965g0gpkdAKQ1V-5hDx9OoV1vQMF"/>
<div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm p-[2px] rounded border border-danger">
<div className="w-2 h-2 rounded-full bg-danger"></div>
</div>
</div>
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-1">
<h5 className="text-body-medium font-bold text-primary-fixed">Lazeez Bhuna Murgh Biryani</h5>
<span className="text-metric-mono font-metric-mono text-primary">$15.20</span>
</div>
<p className="text-label-small text-on-surface-variant opacity-60 line-clamp-2">Tender chicken pieces bhuna'd with spices, layered with fragrant rice. Served with Raita.</p>
</div>
<div className="flex items-center justify-between mt-md">
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-on-surface-variant opacity-40 text-[14px]">timer</span>
<span className="text-[10px] text-on-surface-variant font-medium">25 mins</span>
</div>
<div className="flex gap-sm">
<button className="px-md py-1 border border-primary/40 rounded-full text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors">SWAP</button>
<button className="px-xl py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-extrabold shadow-lg neon-glow-primary gloss-shimmer active:scale-95 transition-all">+ ADD</button>
</div>
</div>
</div>
</div>
{/* Menu Card 3 (Veg) */}
<div className="glass-panel p-md rounded-xl flex gap-md hover:border-primary/40 transition-all duration-300">
<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="A vibrant Zaikedaar Paneer Biryani served in a high-end minimalist white ceramic vessel. Cubes of perfectly charred paneer are layered within saffron-stained rice and fresh green herbs. The background is a clean, dark obsidian surface with sophisticated lighting that creates deep shadows and brilliant highlights. A touch of neon pink light reflects off the side of the bowl, maintaining the hyper-premium elite brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnZO-SRXZaq8sEx-tCE5dp1XMUjEgXYU-qH6jmvb1R9yuD8CJgZOt8cLeisKDYrRZxNq-6e0z_S5LC-cK76ackRSYsOr5XtmM8YTo2X78jv-C4RuzBUhbj88A3m6fvt5IBoTR-C2yNoYSPKCwe2GHCQsOFNCj1uYFnMPGqnB3_aKqVmNHL7_uUZddTeyhUk0S4HOCY2q8o7INBf1BrsDdkRF4WejofkTVYm1PkkwQQ2vbZ1gDisIQajmcQGz6m4KaWunxNeVB_10FK"/>
<div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm p-[2px] rounded border border-tertiary-container">
<div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
</div>
</div>
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-1">
<h5 className="text-body-medium font-bold text-primary-fixed">Zaikedaar Paneer Biryani</h5>
<span className="text-metric-mono font-metric-mono text-primary">$14.00</span>
</div>
<p className="text-label-small text-on-surface-variant opacity-60 line-clamp-2">Fresh cottage cheese marinated in Persian spices, layered with rice. A vegetarian masterpiece.</p>
</div>
<div className="flex items-center justify-between mt-md">
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-tertiary text-[14px]" style={{fontVariationSettings: '\'FILL\' 1'}}>eco</span>
<span className="text-[10px] text-on-surface-variant font-medium">Pure Veg</span>
</div>
<div className="flex gap-sm">
<button className="px-md py-1 border border-primary/40 rounded-full text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors">SWAP</button>
<button className="px-xl py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] font-extrabold shadow-lg neon-glow-primary gloss-shimmer active:scale-95 transition-all">+ ADD</button>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Right Sidebar: Your Basket */}
<aside className="hidden md:flex flex-col py-xl overflow-hidden">
<div className="glass-panel flex-1 rounded-2xl flex flex-col overflow-hidden relative border-primary/10 shadow-2xl">
<div className="p-lg border-b border-border-glass">
<div className="flex items-center justify-between mb-sm">
<h3 className="text-section-header font-section-header text-on-surface font-extrabold">Your Basket</h3>
<span className="text-metric-mono font-metric-mono bg-primary-container/20 text-primary px-sm py-[2px] rounded text-[10px]">2 ITEMS</span>
</div>
<div className="flex items-center gap-xs text-[11px] text-on-surface-variant">
<span className="material-symbols-outlined text-[14px]">delivery_dining</span>
<span>Delivery to <b className="text-primary">Home (Marina)</b></span>
</div>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar p-md flex flex-col gap-md">
{/* Basket Item 1 */}
<div className="flex gap-sm group">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
<img className="w-full h-full object-cover" data-alt="Minimalist top-down view of a steaming cup of Persian Chai on a dark stone surface. Atmospheric steam and sharp lighting create a sense of elite luxury and system precision." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9dB7F5xSnF4KMn9vZmYR-rdDJJynymGxYucwoE-YBitPw0VKGSu-DN14kA90BSzp-2uy6VqlvfPFGUv1w1bAkAncDACJEjmjyIs5U_edIxKkwyJXxKBdiWMNunXofnk0gpGuMhOYRmiAlpBLt1eDqi27iQu4sKk2m2BOZdHLrGxGFXuHSxNxRfZrvdjjDlDh9Qzm9Bq8gJA1kCDLJqJ4Wt4tvK3bGLCdxh0ENy_AR1ED6oHIrCU53WfftTybXUz_QCYlouZZvj1fU"/>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<span className="text-[11px] font-bold text-on-surface leading-tight">Dum Gosht Biryani</span>
<span className="text-metric-mono font-metric-mono text-primary text-[10px]">$18.50</span>
</div>
<div className="flex items-center justify-between mt-xs">
<div className="flex items-center gap-sm bg-surface-elevated rounded-full px-2 py-[2px]">
<button className="text-primary hover:text-white transition-colors">-</button>
<span className="text-metric-mono text-[10px]">1</span>
<button className="text-primary hover:text-white transition-colors">+</button>
</div>
<button className="material-symbols-outlined text-[14px] text-danger opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
</div>
</div>
</div>
{/* Basket Item 2 */}
<div className="flex gap-sm group">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
<img className="w-full h-full object-cover" data-alt="A small plate of gourmet kebabs on a dark background. Fine dining aesthetic with professional lighting and rich textures." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Y0XaYext6eTrjmpu0XSmT41TnYOkAKU59FS_D29ZmQJCsBrbGmpAcO0TD5ojXzXRh1kOJUMoWOowUYmsUnhi7y5jtOyFrnJLoN8JBSFOqReOPFWoVPtanski-WJc97hj66phDWoytmWe_OLqV6KV4seipu2LB5QC6fCxy_Vc1Lo5nGie-XQvFIYJ0ALLQT9Sgvj4ik0GZ0TNkpT1DUDIh2SfO4TEa07oYtuXBX3XuDjONRbPNmakiEjLp7F2HqVEGlQZ4UrXspcl"/>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<span className="text-[11px] font-bold text-on-surface leading-tight">Murg Kelebi (Starter)</span>
<span className="text-metric-mono font-metric-mono text-primary text-[10px]">$9.00</span>
</div>
<div className="flex items-center justify-between mt-xs">
<div className="flex items-center gap-sm bg-surface-elevated rounded-full px-2 py-[2px]">
<button className="text-primary hover:text-white transition-colors">-</button>
<span className="text-metric-mono text-[10px]">1</span>
<button className="text-primary hover:text-white transition-colors">+</button>
</div>
<button className="material-symbols-outlined text-[14px] text-danger opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
</div>
</div>
</div>
<div className="mt-auto border-t border-dashed border-border-glass pt-md">
<div className="flex items-center justify-between text-[11px] mb-xs">
<span className="text-on-surface-variant">Subtotal</span>
<span className="text-metric-mono text-on-surface">$27.50</span>
</div>
<div className="flex items-center justify-between text-[11px] mb-xs">
<span className="text-on-surface-variant">Delivery Fee</span>
<span className="text-metric-mono text-tertiary">FREE</span>
</div>
<div className="flex items-center justify-between text-[11px] mb-md">
<span className="text-on-surface-variant">Govt Taxes</span>
<span className="text-metric-mono text-on-surface">$2.20</span>
</div>
<div className="flex items-center justify-between text-section-header font-bold text-primary mb-lg">
<span>TOTAL</span>
<span className="text-metric-mono">$29.70</span>
</div>
</div>
</div>
<div className="p-md bg-surface-elevated">
<button className="w-full py-md bg-primary-container text-on-primary-container rounded-full text-section-header font-extrabold shadow-lg neon-glow-primary gloss-shimmer active:scale-95 transition-all flex items-center justify-center gap-md">
<span>CHECKOUT NOW</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
{/* Subtle Animation in Background of Card */}
<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
</div>
{/* Loyalty Progress */}
<div className="mt-gutter p-md glass-panel rounded-xl flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[20px]" style={{fontVariationSettings: '\'FILL\' 1'}}>restaurant</span>
</div>
<div>
<h5 className="text-[11px] font-bold text-primary tracking-tight">District Rewards</h5>
<p className="text-[10px] text-on-surface-variant">Earn 30 points on this order</p>
</div>
</div>
</aside>
</main>
{/* Bottom Navigation (Mobile Only) */}
<nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-panel/90 backdrop-blur-2xl border-t border-border-glass shadow-[0_-8px_24px_rgba(0,0,0,0.5)] rounded-t-xl">
<div className="flex flex-col items-center justify-center text-primary font-bold scale-110">
<span className="material-symbols-outlined text-[24px]">restaurant</span>
<span className="text-label-small font-label-small">Dining</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-[24px]">delivery_dining</span>
<span className="text-label-small font-label-small">Delivery</span>
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
</nav>


    </>
  );
};

export default RestaurantDetail;
