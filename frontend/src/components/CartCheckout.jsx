import React from 'react';

const CartCheckout = () => {
  return (
    <>

{/* Top Navigation Anchor */}
<header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
<div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary text-[28px]">arrow_back</span>
<h1 className="text-hero-display font-hero-display font-bold text-primary tracking-tighter">District</h1>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-border-glass">
<span className="material-symbols-outlined text-warning text-sm" style={{fontVariationSettings: '\'FILL\' 1'}}>verified</span>
<span className="font-metric-mono text-label-small uppercase tracking-widest text-on-surface-variant">Secure Checkout</span>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A sharp, high-fashion close-up portrait of a tech-savvy executive with sleek neon rim lighting, set against a dark obsidian background. The visual style is premium and cinematic, echoing the luxury aesthetic of the District brand with deep shadows and vibrant pink highlights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Myf163McJvrgmlRaETIYuoBrhpYdgLFLNhGoTp-Ltr2LBYDPIX9R39NV2w5KNvdQJknxzdiQH1kl5fiTP5bOQIH27M05yBbuxEhq8yDE8pYmPMeYli71pQZHzlycY-cB9VmG2zRpw7lJy-1ISmUBC2iR0Qi4A5tbZOYaCNZWe7XG_fNOU_CrdXIGz2oLgBoojFUCQw1-xkCsTjbZNj-chfPa4Zx9iPouUPneceRBsYXoRYo6ccbU6Ddxp3QXPWDE-fR9qaV4xn0l" />
</div>
</div>
</div>
</header>
<main className="mt-24 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-xl pb-24">
{/* Left Column: Order Review */}
<div className="col-span-7 flex flex-col gap-lg">
<div className="flex items-center justify-between mb-2">
<h2 className="text-hero-display font-hero-display text-primary">Review Your Order</h2>
<span className="font-metric-mono text-primary text-body-medium bg-primary/10 px-3 py-1 rounded-full border border-primary/20">3 Items</span>
</div>
{/* Cart Items Bento */}
<div className="glass-panel rounded-xl p-lg flex flex-col gap-md">
{/* Item 1 */}
<div className="flex items-center justify-between py-md border-b border-border-glass last:border-0">
<div className="flex items-center gap-lg">
<div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container border border-border-glass">
<img className="w-full h-full object-cover" data-alt="A gourmet truffle wagyu burger presented on a sleek black slate plate, illuminated by moody neon pink and purple kitchen lights. The style is hyper-realistic luxury food photography with a shallow depth of field and high-velocity motion blur in the background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD44I7sz_WVLfebQAPGVHQ2HZJmxcWS0XLU1aySPBxBilPi9-hLTh_xdluMPqn2Ms5SVndkfYRcooJsCx5tyhlinQ2BJUEwCykGQAeRuh-cd0VeMP9kIraAAEM1kEidk_RhqE6ce85DNLsRRpooiXrTT6BDgQf67fcFfcsID22abMPrtXajNj3IFypO5gQlcMNMxK1jSTPzLhQ6s1-e1_0VlKZzACEXALdzMB253VagIxbMp9dpX7oiEzL9Cg391y9jE0frL8zqmyl6" />
</div>
<div className="flex flex-col">
<span className="font-section-header text-on-surface">Black Gold Truffle Wagyu</span>
<span className="font-body-medium text-on-surface-variant">Signature Edition • 250g Patty</span>
<div className="flex items-center gap-3 mt-2">
<button className="w-6 h-6 flex items-center justify-center rounded-full border border-border-glass text-primary hover:bg-primary/10">-</button>
<span className="font-metric-mono">01</span>
<button className="w-6 h-6 flex items-center justify-center rounded-full border border-border-glass text-primary hover:bg-primary/10">+</button>
</div>
</div>
</div>
<span className="font-metric-mono text-section-header text-primary">$42.00</span>
</div>
{/* Item 2 */}
<div className="flex items-center justify-between py-md border-b border-border-glass last:border-0">
<div className="flex items-center gap-lg">
<div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container border border-border-glass">
<img className="w-full h-full object-cover" data-alt="Exotic dragon fruit and lychee cocktail in a crystal geometric glass with a silver leaf garnish. The drink is glowing under atmospheric blue and pink lighting, reflecting on a polished carbon surface. High-end lifestyle photography for an elite audience." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYaPjXd_cpfHXEFWegVKANM9xCECqHCixfoRl0srYfkPKum7-kbKw8lz3yYuI3REK7o6i1m6Z77BXLmSShNnNak34_ucQnnPztoapmuGXfXM_aeZmPvCrW9q_yK4IfPJ6OO-bKjtPufqkROqbmGxcrPRe4m_EZav-kgfK4G6b9BrTq-5TB-63ZBla0R7kBaJIozrShyKgag17cwBH5Aqr3OxC9IDFfV8UBRzDEsukAc7MKZWTySwq1wCbDjbxzw9jeFUwgAn7rlys5" />
</div>
<div className="flex flex-col">
<span className="font-section-header text-on-surface">Neon Lychee Elixir</span>
<span className="font-body-medium text-on-surface-variant">Cold Pressed • 500ml</span>
<div className="flex items-center gap-3 mt-2">
<button className="w-6 h-6 flex items-center justify-center rounded-full border border-border-glass text-primary hover:bg-primary/10">-</button>
<span className="font-metric-mono">02</span>
<button className="w-6 h-6 flex items-center justify-center rounded-full border border-border-glass text-primary hover:bg-primary/10">+</button>
</div>
</div>
</div>
<span className="font-metric-mono text-section-header text-primary">$24.00</span>
</div>
</div>
{/* Detailed Swiggy-style Invoice */}
<div className="glass-panel rounded-xl p-lg bg-surface-container-low/50">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
<h3 className="text-section-header uppercase tracking-widest text-on-surface-variant">Bill Details</h3>
</div>
<div className="flex flex-col gap-md border-b border-border-glass pb-md">
<div className="flex justify-between items-center">
<span className="text-body-default text-on-surface-variant">Item Total</span>
<span className="font-metric-mono text-on-surface">$66.00</span>
</div>
<div className="flex justify-between items-center">
<span className="text-body-default text-on-surface-variant">Priority Logistics Fee</span>
<span className="font-metric-mono text-on-surface">$5.50</span>
</div>
<div className="flex justify-between items-center">
<span className="text-body-default text-on-surface-variant">District Platform Tax</span>
<span className="font-metric-mono text-on-surface">$2.40</span>
</div>
<div className="flex justify-between items-center text-tertiary">
<span className="text-body-default">VIP Platinum Discount</span>
<span className="font-metric-mono">- $12.00</span>
</div><div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="Google Pay" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLuOgKEgnakm8Yd6gsy6IN9wREeQCo8oWHizzzpofgvqU_qsyfC5EpHe2uTvqU9kp-AImPK9TjyZlMkt3BbMl0JEt6kTrIFUHsYN-K_UZWcu1x9IO5Jt9laF_7Ap1dOBICeMYSLUbaZqPYwsj_xtp1MoDxWpJf39vn4SwlCbNa_uIvu9NAtbwxiyYQlJZUMsx1NPnPRCrYsP02Hj34L3Zgm3U9CWBooEFJ2l8TyzttfatLc2OpC5731-Zac" /></div><div className="flex flex-col"><span className="font-section-header">Google Pay</span><span className="text-body-default text-on-surface-variant">Fast &amp; Secure Checkout</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div>
</div>
<div className="pt-md flex justify-between items-center">
<div className="flex flex-col">
<span className="text-section-header font-bold text-on-surface">Total Payable</span>
<span className="text-label-small text-on-surface-variant italic">Inclusive of all district taxes</span>
</div>
<span className="text-hero-display font-hero-display text-primary">$61.90</span>
</div>
</div>
{/* Delivery Slot Bento */}
<div className="glass-panel rounded-xl p-lg flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">bolt</span>
</div>
<div className="flex flex-col">
<span className="font-section-header">Elite Hyper-Speed Delivery</span>
<span className="text-body-default text-on-surface-variant">Arriving in <span className="text-primary font-bold">12-18 mins</span></span>
</div>
</div>
<button className="text-primary font-section-header underline">Change</button>
</div>
</div>
{/* Right Column: Secure Payment Gateway */}
<div className="col-span-5 flex flex-col gap-lg">
<h2 className="text-hero-display font-hero-display text-primary mb-2">Payment</h2>
{/* VIP Platinum Card Mockup */}
<div className="metallic-card w-full h-64 rounded-2xl p-xl flex flex-col justify-between shadow-2xl border border-white/10" style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuB7cid4u3NLNTJUWbO3yAVrZ2IRMkr_ZQJf4hexyFHsl4TomESyOt77Wcud1HR6zaF9xoPbVmqqkta5UoNFDSQt1u5VARLfwYEVd3XYhVQ3kqbRvyHuTJrzxT9z3s6Nm_MYhj9vDRCmtK_0fJlxZUqQAAV12JmR1VnkuJlIKDcebaXAM7JeJFJ4d0tPvQCH0BD6qd0as72JAyJS1Vrfc0MHYmvVVHRTfLAaWU9g8U5vHWezceBsW4yqJIZaZu7d1DHAMAzZlmJitDNX\')', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 100px inset, rgba(0, 0, 0, 0.4) 0px 20px 40px'}}>
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="text-label-small font-bold text-white/60 tracking-widest uppercase">District Elite</span>
<span className="text-section-header font-extrabold text-white tracking-tighter">VIP PLATINUM</span>
</div>
<span className="material-symbols-outlined text-primary text-[40px]" style={{fontVariationSettings: '\'FILL\' 1'}}>contactless</span>
</div>
<div className="flex flex-col gap-xs">
<span className="font-metric-mono text-hero-display text-white tracking-[4px]" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '4px'}}>**** **** **** 8842</span>
<div className="flex justify-between items-end">
<div className="flex flex-col">
<span className="text-[8px] text-white/40 uppercase">Card Holder</span>
<span className="font-metric-mono text-body-medium text-white/90" style={{textShadow: 'rgba(255, 255, 255, 0.2) -0.5px -0.5px 0.5px, rgba(0, 0, 0, 0.8) 1px 1px 1px'}}>ALEXANDER VOX</span>
</div>
<div className="flex flex-col items-end">
<span className="text-[8px] text-white/40 uppercase">Expires</span>
<span className="font-metric-mono text-body-medium text-white/90" style={{textShadow: 'rgba(255, 255, 255, 0.2) -0.5px -0.5px 0.5px, rgba(0, 0, 0, 0.8) 1px 1px 1px'}}>12 / 28</span>
</div>
</div>
</div>
</div>
{/* Payment Methods List */}
<div className="flex flex-col gap-md">
<h3 className="text-label-small uppercase tracking-widest text-on-surface-variant font-bold ml-1">Alternative Methods</h3>
{/* District Pay (Active State) */}

{/* Apple Pay */}
<div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="Apple Pay" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLsO6AUkCwStHVPlm_opcBKKC6lBoBxqiYyL8L1oAyJQHNKfcMEWLcV97VeLZXjG8OHapqKbas8hlo4o2d1eeB_VbxnpITdFbDhNj0wcagG3B2eegqS1Kjak62tRhG4kap0U_x2WZxDIoFYWAmFlSlpqwwbIV7G0RbsrtVZDZfpajltk9--h1Dv80I4c_m2YwgbawYmnCQXE2q_3NAO9nEQYEYSJS6DV9wEvxocELW9CP6NCoktBvoiY6rAo" /></div>
<div className="flex flex-col">
<span className="font-section-header">Apple Pay</span>
<span className="text-body-default text-on-surface-variant">Instant Authentication</span>
</div>
</div>
<div className="w-5 h-5 rounded-full border-2 border-border-glass"></div>
</div>
{/* Crypto */}
<div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="Google Pay" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLuOgKEgnakm8Yd6gsy6IN9wREeQCo8oWHizzzpofgvqU_qsyfC5EpHe2uTvqU9kp-AImPK9TjyZlMkt3BbMl0JEt6kTrIFUHsYN-K_UZWcu1x9IO5Jt9laF_7Ap1dOBICeMYSLUbaZqPYwsj_xtp1MoDxWpJf39vn4SwlCbNa_uIvu9NAtbwxiyYQlJZUMsx1NPnPRCrYsP02Hj34L3Zgm3U9CWBooEFJ2l8TyzttfatLc2OpC5731-Zac" /></div><div className="flex flex-col"><span className="font-section-header">Google Pay</span><span className="text-body-default text-on-surface-variant">Fast &amp; Secure Checkout</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div>
<div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="PhonePe" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLu2SQ3ErvoSfKSeIu3vdlgZBbE_IlBbsax3Lg3HBr7plOZthrezsvamBQAd3TZBTP9pmHVrgEYTUBsCdASnvA8bo5A3ejuLnbeFTGA41dQQ5DtDVGXDKdf-gRMkgkcnOq8a6HZDovPF0nkGXwXCA7Ssq9y6bk6q1YEeYQJh3VZxBWS6ZjPPGGyCmJTHtCwD2thzhhRZ90CzRv5eciK3vKUKfBArKMrO4TUuR-jZwv8oDTmtPTwVapmD3jXv" /></div><div className="flex flex-col"><span className="font-section-header">PhonePe</span><span className="text-body-default text-on-surface-variant">UPI &amp; Wallets</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div><div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="Paytm" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV-SYaOhFmkx2EdqQ3-NbLE76IA5Iw9uRtX9FUrdexbDhUIOTdCwnFlm2EUHpCRrdaeMpB2JcEF74o1PsEQpSplbR8_fhplstRRdVfokhU8NDgMuEom4WZO8KaMntsi7Bf8h0grwtj4-ETczvVpB6POztyHToZVdKLuWQDGTPTk5pFZpGYhViTxpjMbf6S2yuOx5BvCqFmGr3uDozZAwJuNPOq3Hydr-Kg7RPCmt6y5G65-hcJ97C6ajseqKMt6EbBw3OzC6AhclKV" /></div><div className="flex flex-col"><span className="font-section-header">Paytm</span><span className="text-body-default text-on-surface-variant">Fast Checkout</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div></div>
{/* Order Confirmation CTA */}
<div className="mt-lg flex flex-col gap-md">
<button className="gloss-shimmer w-full bg-primary text-on-primary py-4 rounded-full font-hero-display text-hero-display-mobile flex items-center justify-center gap-3 neon-glow-primary hover:opacity-90 transition-all active:scale-95">
                    Pay $61.90
                    <span className="material-symbols-outlined">lock</span>
</button>
<p className="text-center text-label-small text-on-surface-variant opacity-60">
                    By confirming this order, you agree to District's Terms of High-Velocity Commerce. Your connection is encrypted with 256-bit military grade protection.
                </p>
<div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="PhonePe" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLu2SQ3ErvoSfKSeIu3vdlgZBbE_IlBbsax3Lg3HBr7plOZthrezsvamBQAd3TZBTP9pmHVrgEYTUBsCdASnvA8bo5A3ejuLnbeFTGA41dQQ5DtDVGXDKdf-gRMkgkcnOq8a6HZDovPF0nkGXwXCA7Ssq9y6bk6q1YEeYQJh3VZxBWS6ZjPPGGyCmJTHtCwD2thzhhRZ90CzRv5eciK3vKUKfBArKMrO4TUuR-jZwv8oDTmtPTwVapmD3jXv" /></div><div className="flex flex-col"><span className="font-section-header">PhonePe</span><span className="text-body-default text-on-surface-variant">UPI &amp; Wallets</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div><div className="glass-panel rounded-xl p-md flex items-center justify-between cursor-pointer transition-all hover:bg-surface-elevated"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"><img alt="Paytm" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV-SYaOhFmkx2EdqQ3-NbLE76IA5Iw9uRtX9FUrdexbDhUIOTdCwnFlm2EUHpCRrdaeMpB2JcEF74o1PsEQpSplbR8_fhplstRRdVfokhU8NDgMuEom4WZO8KaMntsi7Bf8h0grwtj4-ETczvVpB6POztyHToZVdKLuWQDGTPTk5pFZpGYhViTxpjMbf6S2yuOx5BvCqFmGr3uDozZAwJuNPOq3Hydr-Kg7RPCmt6y5G65-hcJ97C6ajseqKMt6EbBw3OzC6AhclKV" /></div><div className="flex flex-col"><span className="font-section-header">Paytm</span><span className="text-body-default text-on-surface-variant">Fast Checkout</span></div></div><div className="w-5 h-5 rounded-full border-2 border-border-glass"></div></div></div>
</div>
</main>
{/* Background Atmospheric Elements */}
<div className="fixed top-1/4 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10"></div>
<div className="fixed bottom-1/4 -right-24 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -z-10"></div>




    </>
  );
};

export default CartCheckout;
