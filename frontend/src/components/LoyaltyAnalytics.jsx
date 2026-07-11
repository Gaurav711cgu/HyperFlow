import React from 'react';

const LoyaltyAnalytics = () => {
  return (
    <>

{/* TopAppBar */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-margin-mobile pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="flex items-center justify-between max-w-[1440px] mx-auto w-full">
<div className="flex items-center gap-xl">
<span className="text-hero-display font-hero-display font-bold text-primary dark:text-primary tracking-tighter">District</span>
<nav className="hidden md:flex items-center gap-lg">
<a className="text-on-surface-variant dark:text-on-surface-variant font-section-header hover:opacity-80 transition-opacity" href="#">Market</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-section-header hover:opacity-80 transition-opacity" href="#">Network</a>
<a className="text-primary dark:text-primary font-bold font-section-header" href="#">Dashboard</a>
<a className="text-on-surface-variant dark:text-on-surface-variant font-section-header hover:opacity-80 transition-opacity" href="#">Vault</a>
</nav>
</div>
<div className="flex items-center gap-md">
<div className="hidden lg:flex flex-col items-end mr-sm">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">VIP Tier</span>
<span className="text-body-medium font-bold text-tertiary">PLATINUM ELITE</span>
</div>
<div className="relative group cursor-pointer active:scale-95 transition-transform duration-200">
<div className="w-10 h-10 rounded-full border border-primary/30 p-0.5 overflow-hidden">
<img className="w-full h-full object-cover rounded-full" data-alt="A professional high-fashion portrait of a tech executive in a futuristic obsidian-themed studio. The lighting is moody with subtle neon pink highlights reflecting off their polished features. The overall aesthetic is ultra-premium, sleek, and high-velocity, matching a luxury tech platform's brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5u43FbnSbU9YJ8b9qkfFsWDKrUls0yW1EDXv9Ur4zomQ90bcTJd8_pYSwoe4NGIE_3kwm3oWSfbIrVvm3nmG_L2PXI12R9RIccm_5zrXnbNNFO8rNaTxCG6zJrMpbDSdG8q0cHtTIULiJCxZEcntXlJS8VcL4FrOOh07fTOFiZnkD019u6-zvBBb5QTmm1eIlwthHqlL60JU8Bamc-0HY8Ny53gBuTKdUSDA1VEutL_Q2TGuGr8PRcF50_8rloigpWhJcvOcpUvbU" />
</div>
</div>
<button className="material-symbols-outlined text-primary p-2 hover:opacity-80 transition-opacity">location_on</button>
</div>
</div>
</header>
<main className="flex-1 mt-[72px] mb-8 px-xl lg:px-24 w-full max-w-[1440px] mx-auto grid grid-cols-12 gap-xl">
{/* Left Sidebar: Profile & VIP Status */}
<section className="col-span-12 lg:col-span-4 flex flex-col gap-xl">
{/* Metallic VIP Card Render */}
<div className="vip-card-shimmer glass-panel rounded-xl p-xl flex flex-col justify-between h-64 relative border border-white/10 group cursor-default" style={{backgroundImage: 'url(&quot', https: '//lh3.googleusercontent.com/aida-public/AB6AXuC44lAJOv8nWiuBTlgmx2FY4tF0WBtku74oZ2nkIvqP3V9DsV0mTBc6Wcqoo889up4AMSNncoc7plStUc1YS8nrEMDzpZfHYEM2xSDne4pSecQXjvI-W_IshKrYAkGUxb40eUTN1FggZD5xUehAnKxqvSdGwWlhqBVoDXzlSkhvhTs-HP-awVo51aSHBti3tMDt8G1mSO0rqqxQOuUuWd8WCL3Dy4YScoSXTud8MpklGGHWUpth2HlYWhMSl1k1R1Fw684KW4mTqf_I&quot', backgroundSize: 'cover', backgroundPosition: 'center center'}}>
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="text-label-small font-label-small text-on-surface-variant tracking-widest uppercase">District Membership</span>
<h2 className="text-hero-display font-hero-display text-white mt-1 italic tracking-tight">VIP PLATINUM</h2>
</div>
<span className="material-symbols-outlined text-tertiary text-[32px]">contactless</span>
</div>
<div className="flex flex-col gap-base">
<span className="metric-mono text-lg text-white/90 tracking-[0.2em]">4429 • 8821 • 0092 • 4040</span>
<div className="flex justify-between items-end mt-4">
<div className="flex flex-col">
<span className="text-[8px] text-on-surface-variant uppercase font-bold">Member Since</span>
<span className="metric-mono text-body-medium text-white">2021/04</span>
</div>
<div className="w-12 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
<span className="text-[10px] font-bold text-white/40 italic">DISTRICT</span>
</div>
</div>
</div>
</div>
{/* Spend Milestones */}
<div className="glass-panel rounded-xl p-lg flex flex-col gap-md">
<div className="flex justify-between items-center">
<h3 className="text-section-header font-section-header text-white">Spend Milestones</h3>
<span className="metric-mono text-primary text-body-medium">$12,450.00 / $15k</span>
</div>
{/* Progress Bar */}
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-secondary w-[83%] rounded-full relative">
<div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
</div>
</div>
<div className="grid grid-cols-3 gap-sm mt-2">
<div className="flex flex-col gap-xs">
<span className="text-[9px] text-on-surface-variant uppercase font-bold">Silver</span>
<div className="h-1 bg-tertiary rounded-full opacity-40"></div>
</div>
<div className="flex flex-col gap-xs">
<span className="text-[9px] text-on-surface-variant uppercase font-bold">Gold</span>
<div className="h-1 bg-tertiary rounded-full opacity-80"></div>
</div>
<div className="flex flex-col gap-xs">
<span className="text-[9px] text-primary uppercase font-bold">VIP Platinum</span>
<div className="h-1 bg-primary rounded-full"></div>
</div>
</div>
<div className="mt-xl flex flex-col gap-md">
<div className="flex items-center justify-between p-md bg-surface-container/50 border border-border-glass rounded-lg">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-lg">bolt</span>
</div>
<span className="text-body-default font-body-default">High-Velocity Rewards</span>
</div>
<span className="metric-mono text-tertiary">Active</span>
</div>
<div className="flex items-center justify-between p-md bg-surface-container/50 border border-border-glass rounded-lg">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
</div>
<span className="text-body-default font-body-default">AI Concierge Priority</span>
</div>
<span className="metric-mono text-tertiary">Enabled</span>
</div>
</div>
</div>
</section>
{/* Right Content: Analytics Chart */}
<section className="col-span-12 lg:col-span-8 flex flex-col gap-xl">
<div className="glass-panel rounded-xl p-xl h-full flex flex-col gap-xl relative overflow-hidden">
{/* Background ambient glow */}
<div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full"></div>
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md z-10">
<div className="flex flex-col">
<h2 className="text-hero-display font-hero-display text-white">Spend vs. Vitality</h2>
<p className="text-body-default text-on-surface-variant max-w-md mt-1">Cross-analyzing logistics expenditure against biometrics and calorie intake for maximum system optimization.</p>
</div>
<div className="flex gap-sm">
<button className="px-md py-sm rounded-full bg-surface-container border border-border-glass text-label-small font-bold hover:bg-surface-variant transition-colors">MONTHLY</button>
<button className="px-md py-sm rounded-full bg-primary text-on-primary text-label-small font-bold shadow-lg shadow-primary/20">WEEKLY</button>
</div>
</div>
{/* Recharts Container */}
<div className="flex-1 w-full min-h-[400px] mt-xl relative z-10" id="chart-container">
{/* Chart logic implemented via scripts */}
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-xl border-t border-border-glass pt-xl z-10">
<div className="flex flex-col gap-xs">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">Total Spend</span>
<span className="text-hero-display-mobile font-hero-display-mobile text-white metric-mono">$4,281.40</span>
<span className="text-[10px] text-tertiary font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-sm">trending_up</span> +12% vs LY
                        </span>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">Avg Calories</span>
<span className="text-hero-display-mobile font-hero-display-mobile text-white metric-mono">2,140 kcal</span>
<span className="text-[10px] text-danger font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-sm">trending_down</span> -4% optimal
                        </span>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">Logistics Hubs</span>
<span className="text-hero-display-mobile font-hero-display-mobile text-white metric-mono">14</span>
<span className="text-[10px] text-on-surface-variant font-bold">Across 3 Districts</span>
</div>
<div className="flex flex-col gap-xs">
<span className="text-label-small font-label-small text-on-surface-variant uppercase tracking-widest">Efficiency</span>
<span className="text-hero-display-mobile font-hero-display-mobile text-tertiary metric-mono">98.2%</span>
<span className="text-[10px] text-tertiary font-bold">PLATINUM LEVEL</span>
</div>
</div>
</div>
</section>
</main>
{/* BottomNavBar (Mobile Only) */}
<footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-panel/90 backdrop-blur-2xl border-t border-border-glass shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-colors">
<span className="material-symbols-outlined text-[24px]">delivery_dining</span>
<span className="text-label-small font-label-small">Delivery</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-colors">
<span className="material-symbols-outlined text-[24px]">restaurant</span>
<span className="text-label-small font-label-small">Dining</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-colors">
<span className="material-symbols-outlined text-[24px]">local_mall</span>
<span className="text-label-small font-label-small">Groceries</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-colors">
<span className="material-symbols-outlined text-[24px]">smart_toy</span>
<span className="text-label-small font-label-small">AI Agent</span>
</div>
<div className="flex flex-col items-center justify-center text-primary font-bold scale-110">
<span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: '\'FILL\' 1'}}>person</span>
<span className="text-label-small font-label-small">Profile</span>
</div>
</footer>
{/* Chart Script */}







    </>
  );
};

export default LoyaltyAnalytics;
