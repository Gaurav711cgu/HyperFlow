import React from 'react';

const AuthPortal = () => {
  return (
    <div className="w-full min-h-screen relative bg-district-obsidian overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-district-pink rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-district-purple rounded-full blur-[100px] opacity-30"></div>
      </div>
      {/* Main Container (Split Pane) */}
      <main className="w-full min-h-screen flex z-10 relative">
        {/* Left Pane: Brand & Abstract Visuals (60%) */}
<section className="w-3/5 h-full relative overflow-hidden flex items-center justify-center">
{/* Background Image with Detailed Prompt */}
<div className="absolute inset-0 z-0 bg-district-obsidian bg-cover bg-center bg-no-repeat" data-alt="A macro digital rendering of metallic purple silk-like waves flowing through a deep obsidian void. The texture is hyper-realistic with sharp, liquid chrome highlights reflecting vibrant neon pink ambient light. The composition follows a high-velocity diagonal flow with intricate micro-shadows that emphasize technological precision and luxury depth. The overall aesthetic is elite, high-premium, and atmospheric, perfectly blending dark obsidian with neon purple and hot pink accents." style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuD9p-quxV0ahQq5Wiua4pvGcNuRVvSGZYFEHiG-2hVkCNzq6v7nu8fM_HkkSx0kE0iHbee5B-In_Mlp7T1oXmIWpLE0fxFMtn22JvLw1sS-ZjL0MNewwRIO5mcuJIv8rVBIwXwiJWk4aq67PxMTojegMt4eTLcwBukraOf3HA5L1hrrn3RfoGZwK5bJQvRQ1UFw90jX8dLKHeDRHwVuIePNxPdpcSE3f1XzyudeoelwSKQaH-R8GGSmMIwZvMKdPyEqBFAdylVyfpH8\')'}}>
</div>
{/* Branding Overlay */}
<div className="relative z-10 flex flex-col items-center text-center">
<div className="mb-xl flex items-center gap-md">
<span className="text-primary font-hero-display text-hero-display tracking-tighter uppercase font-extrabold italic bg-clip-text text-transparent bg-gradient-to-r from-district-pink to-district-purple">
                        HyperFlow
                    </span>
<div className="h-8 w-px bg-white/20"></div>
<span className="text-on-surface font-hero-display text-hero-display tracking-tighter uppercase font-bold opacity-80">
                        District
                    </span>
</div>
<p className="font-body-medium text-body-medium text-on-surface-variant max-w-sm tracking-wide leading-relaxed">
                    Experience high-density logistics through a premium glassmorphic lens. Join the elite network of precision delivery.
                </p>
{/* Status Ticker (Corporate Modern Detail) */}
<div className="mt-xl flex gap-lg bg-black/40 backdrop-blur-md px-lg py-sm rounded-full border border-white/5">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
<span className="font-metric-mono text-metric-mono text-on-tertiary-fixed-variant">NODE_ACTIVE: 04-DX</span>
</div>
<div className="flex items-center gap-sm">
<span className="font-metric-mono text-metric-mono text-district-pink">LATENCY: 12ms</span>
</div>
</div>
</div>
</section>
{/* Right Pane: Onboarding Login (40%) */}
<section className="w-2/5 h-full bg-district-obsidian flex items-center justify-center px-xl">
{/* Login Card */}
<div className="glass-panel w-full max-w-md p-xl rounded-[24px] flex flex-col relative overflow-hidden">
{/* Top Header */}
<div className="mb-xl">
<h1 className="font-hero-display text-hero-display text-white mb-xs">Welcome Back</h1>
<p className="font-body-default text-body-default text-on-surface-variant">Enter your credentials to access your dashboard.</p>
</div>
{/* Form Section */}
<form className="space-y-lg" onsubmit="event.preventDefault(); showOtp();">
<div className="space-y-sm">
<label className="font-section-header text-section-header text-white px-xs block">Phone Number</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">smartphone</span>
<input className="w-full bg-surface-panel border border-white/10 rounded-xl py-md pl-[44px] pr-md text-white font-body-default focus:border-district-pink transition-all outline-none" placeholder="+1 (555) 000-0000" type="tel"/>
</div>
</div>
<button className="shimmer-btn w-full py-md bg-district-pink text-white rounded-full font-section-header neon-glow-pink hover:opacity-90 transition-all flex items-center justify-center gap-sm" id="request-btn" type="submit">
                        Request OTP
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</form>
{/* OTP Hidden Section (Toggled via JS) */}
<div className="hidden mt-xl space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500" id="otp-container">
<div className="space-y-sm">
<label className="font-section-header text-section-header text-white px-xs block">Verification Code</label>
<div className="flex justify-between gap-sm">
<input className="otp-input w-14 h-16 bg-surface-panel border border-white/10 rounded-xl text-center text-xl font-bold text-district-pink" maxlength="1" type="text"/>
<input className="otp-input w-14 h-16 bg-surface-panel border border-white/10 rounded-xl text-center text-xl font-bold text-district-pink" maxlength="1" type="text"/>
<input className="otp-input w-14 h-16 bg-surface-panel border border-white/10 rounded-xl text-center text-xl font-bold text-district-pink" maxlength="1" type="text"/>
<input className="otp-input w-14 h-16 bg-surface-panel border border-white/10 rounded-xl text-center text-xl font-bold text-district-pink" maxlength="1" type="text"/>
</div>
</div>
<button className="shimmer-btn w-full py-md bg-district-purple text-white rounded-full font-section-header neon-glow-purple hover:opacity-90 transition-all">
                        Authenticate Access
                    </button>
</div>
{/* Footer Links */}
<div className="mt-xl pt-lg border-t border-white/5 flex flex-col items-center gap-md">
<p className="font-label-small text-label-small text-on-surface-variant uppercase tracking-widest">or continue with</p>
<div className="flex gap-lg">
<button className="p-sm rounded-full border border-white/10 hover:bg-white/5 transition-colors">
<span className="material-symbols-outlined text-white">fingerprint</span>
</button>
<button className="p-sm rounded-full border border-white/10 hover:bg-white/5 transition-colors">
<span className="material-symbols-outlined text-white">passkey</span>
</button>
</div>
</div>
{/* Ornamental Detail */}
<div className="absolute bottom-0 right-0 p-xs opacity-20">
<span className="font-metric-mono text-[8px] text-white">AUTH_V2.0.4</span>
</div>
</div>
{/* Footer Text */}
<div className="absolute bottom-xl flex flex-col items-center gap-xs">
<p className="font-label-small text-label-small text-on-surface-variant/40">Secure verification by HyperFlow Bio-Sync</p>
<div className="flex gap-md">
<a className="font-label-small text-label-small text-district-pink/60 hover:text-district-pink transition-colors" href="#">Privacy Policy</a>
<a className="font-label-small text-label-small text-district-pink/60 hover:text-district-pink transition-colors" href="#">Support</a>
</div>
</div>
</section>
</main>


    </div>
  );
};

export default AuthPortal;
