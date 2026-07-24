import React, { useState } from 'react';
import * as API from '../api.js';

const AuthPortal = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSwiggyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.fetchLoginUrl();
      if (res && res.auth_url) {
        localStorage.setItem('swiggy_oauth_state', res.state);
        window.location.href = res.auth_url;
      } else {
        alert("Failed to fetch login URL");
        setLoading(false);
      }
    } catch (err) {
      console.error("Swiggy login error:", err);
      alert("Failed to initiate Swiggy login");
      setLoading(false);
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/demo', { method: 'POST' });
      let token = "demo_jwt_token_fallback";
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) token = data.access_token;
      }
      localStorage.setItem('swiggy_access_token', token);
      setTimeout(() => {
        setLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    } catch (err) {
      localStorage.setItem('swiggy_access_token', "demo_jwt_token_fallback");
      setTimeout(() => {
        setLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#07070B] text-white relative overflow-hidden flex items-center justify-center p-6 md:p-12 font-sans">
      {/* Background Starry Glow & Ambient Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#FF3366] rounded-full blur-[140px] opacity-15"></div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#6C63FF] rounded-full blur-[140px] opacity-15"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Section: Editorial Serif Hero Title & CTAs (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF3366]/10 border border-[#FF3366]/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#FF4D6D] uppercase">
              AN OPERATING SYSTEM FOR QUICK COMMERCE
            </span>
          </div>

          {/* Giant Hero Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif tracking-tight text-white leading-[1.05]">
            Hyperlocal Operations. <br />
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] via-[#FF4D6D] to-[#FF758F]">
              Simplified.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-lg md:text-xl text-[#9A9AB0] max-w-xl font-light leading-relaxed">
            Unconstrain demand, smooth ETA jitter, and triage refunds — <span className="italic text-white">all in one intelligent platform powered by Swiggy MCP.</span>
          </p>

          {/* Feature Quick Bar (6 Icon Grid) */}
          <div className="pt-4 grid grid-cols-6 gap-3 sm:gap-4 w-full max-w-lg">
            {[
              { icon: 'shopping_bag', label: 'DEMAND' },
              { icon: 'schedule', label: 'ETA TRUTH' },
              { icon: 'verified_user', label: 'REFUND' },
              { icon: 'restaurant', label: 'DINEOUT' },
              { icon: 'local_shipping', label: 'DISPATCH' },
              { icon: 'chat', label: 'MCP AGENT' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-[#FF3366]/50 group-hover:bg-[#FF3366]/10 transition-all flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-[#FF4D6D] text-2xl transition-colors">
                    {f.icon}
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-[0.15em] text-[#7A7A90] group-hover:text-white transition-colors">
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          {/* Primary CTA Buttons */}
          <div className="pt-6 flex flex-wrap items-center gap-4 w-full">
            <button
              type="button"
              onClick={handleSwiggyLogin}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-[#FF3366] to-[#FF4D6D] hover:opacity-95 text-white rounded-full font-semibold text-base shadow-xl shadow-[#FF3366]/25 transition-all flex items-center gap-3 group cursor-pointer"
            >
              <span>{loading ? 'Connecting...' : 'Enter the flow'}</span>
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.12] border border-white/15 text-white rounded-full font-semibold text-base backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[#FF4D6D] text-lg">✦</span>
              <span>Try the demo</span>
            </button>
          </div>

        </div>

        {/* Right Section: Stacked Floating Intelligence Cards (5 Cols) */}
        <div className="lg:col-span-5 relative flex flex-col gap-6">
          
          {/* Card 1: Demand Oracle Live Forecast */}
          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-ping"></span>
                <span className="text-xs font-bold tracking-widest text-[#FF4D6D] uppercase">INVENTORY ORACLE</span>
              </div>
              <span className="text-xs text-white/40 font-mono">LIVE TELEMETRY</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-serif font-bold text-white">₹1,85,600</p>
                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">TOTAL DEMAND UNCONSTRAINED</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FF3366]/20 text-[#FF4D6D] border border-[#FF3366]/30">
                  +24.28% WMAPE LIFT
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-white/80 font-medium">Amul Fresh Milk (1L)</span>
              </div>
              <span className="text-[#FF4D6D] font-mono font-bold">81% Stockout Risk (45m)</span>
            </div>
          </div>

          {/* Card 2: Live Active Order & ETA Truth */}
          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white font-mono">Order #1024</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF3366]/20 text-[#FF4D6D] border border-[#FF3366]/30">
                In Progress
              </span>
            </div>

            <div className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-white/40 uppercase text-xs font-bold tracking-wider">CLIENT</span>
                <span className="text-white font-semibold">Gaurav Nayak</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase text-xs font-bold tracking-wider">ITEMS</span>
                <span className="text-white font-semibold">1x Dum Gosht Biryani</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 uppercase text-xs font-bold tracking-wider">ETA SMOOTHER</span>
                <span className="text-emerald-400 font-mono font-bold">GPS Jitter Suppressed</span>
              </div>
            </div>
          </div>

          {/* Card 3: Client & Auth Profile */}
          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#6C63FF] flex items-center justify-center font-bold text-lg text-white shadow-md">
                GN
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Gaurav Nayak</h4>
                <p className="text-xs text-white/50 font-mono">+91 98765 43210 • Patia Hub</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>Swiggy OAuth 2.1 PKCE</span>
              <span className="text-[#FF4D6D] font-mono font-semibold">Verified Active</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AuthPortal;

