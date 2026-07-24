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
      // In a real environment, this connects to the backend route
      const response = await fetch('/api/v1/auth/demo', {
        method: 'POST',
      });
      
      let token = "demo_jwt_token_fallback";
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          token = data.access_token;
        }
      }
      
      localStorage.setItem('swiggy_access_token', token);
      
      // Give a slight delay for realistic UX feeling
      setTimeout(() => {
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 800);
      
    } catch (err) {
      console.error("Demo login failed:", err);
      // Fallback for demo without backend running
      localStorage.setItem('swiggy_access_token', "demo_jwt_token_fallback");
      setTimeout(() => {
        setLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }, 800);
    }
  };

  return (
    <div className="w-full h-screen relative bg-district-obsidian overflow-hidden">
      {/* Global Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-district-pink rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-district-purple rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Main Container (Split Pane) */}
      <main className="w-full h-screen flex z-10 relative">
        {/* Left Pane: Brand & Abstract Visuals (60%) */}
        <section className="w-3/5 h-screen relative overflow-hidden flex items-center justify-center">
          {/* Background Image with Detailed Prompt */}
          <div className="absolute inset-0 z-0 bg-district-obsidian bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuD9p-quxV0ahQq5Wiua4pvGcNuRVvSGZYFEHiG-2hVkCNzq6v7nu8fM_HkkSx0kE0iHbee5B-In_Mlp7T1oXmIWpLE0fxFMtn22JvLw1sS-ZjL0MNewwRIO5mcuJIv8rVBIwXwiJWk4aq67PxMTojegMt4eTLcwBukraOf3HA5L1hrrn3RfoGZwK5bJQvRQ1UFw90jX8dLKHeDRHwVuIePNxPdpcSE3f1XzyudeoelwSKQaH-R8GGSmMIwZvMKdPyEqBFAdylVyfpH8\')'}}>
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
          </div>
        </section>

        {/* Right Pane: Onboarding Login (40%) */}
        <section className="w-2/5 h-screen bg-district-obsidian flex items-center justify-center px-xl">
          {/* Login Card */}
          <div className="glass-panel w-full max-w-md p-xl rounded-[24px] flex flex-col relative overflow-hidden">
            {/* Top Header */}
            <div className="mb-xl">
              <h1 className="font-hero-display text-hero-display text-white mb-xs">Welcome to HyperFlow</h1>
              <p className="font-body-default text-body-default text-on-surface-variant">Explore the Hyperlocal Intelligence Platform</p>
            </div>

            {/* Actions Section */}
            <div className="space-y-4 flex flex-col w-full mt-4">
              <button 
                type="button" 
                onClick={handleSwiggyLogin}
                disabled={loading}
                className="shimmer-btn w-full py-md bg-gradient-to-r from-[#6C63FF] to-[#A078FF] text-white rounded-full font-section-header neon-glow-primary hover:opacity-90 transition-all flex items-center justify-center gap-sm shadow-lg shadow-[#6C63FF]/20"
              >
                {loading ? 'Connecting...' : 'Login with Phone (Swiggy)'}
                {!loading && <span className="material-symbols-outlined text-[18px]">smartphone</span>}
              </button>

              <button 
                type="button" 
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-md bg-white/10 border border-white/20 text-white rounded-full font-section-header hover:bg-white/20 transition-all flex items-center justify-center gap-sm"
              >
                {loading ? 'Authenticating...' : 'Continue in Demo Mode'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </div>

            {/* OR CONTINUE WITH Section - Matching Reference Theme */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-4">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#E8A2B8] uppercase">
                OR CONTINUE WITH
              </span>

              <div className="flex items-center justify-center gap-6 my-1">
                {/* Fingerprint Bio-Sync Button */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  title="Bio-Sync Authentication"
                  className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 hover:border-[#E8A2B8]/50 transition-all flex items-center justify-center text-white shadow-inner group"
                >
                  <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform text-white/90">
                    fingerprint
                  </span>
                </button>

                {/* Passkey / User Key Button */}
                <button
                  type="button"
                  onClick={handleSwiggyLogin}
                  title="Passkey Authentication"
                  className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 hover:border-[#E8A2B8]/50 transition-all flex items-center justify-center text-white shadow-inner group"
                >
                  <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform text-white/90">
                    vpn_key
                  </span>
                </button>
              </div>

              <p className="text-[12px] text-[#E8A2B8]/60 text-center font-medium mt-1">
                Secure verification by HyperFlow Bio-Sync
              </p>
              
              <div className="flex gap-4 text-[12px] text-[#E8A2B8]/70">
                <a className="hover:text-[#E8A2B8] transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-[#E8A2B8] transition-colors" href="#">Support</a>
              </div>
            </div>

            {/* Ornamental Detail */}
            <div className="absolute bottom-2 right-3 opacity-30">
              <span className="font-metric-mono text-[9px] text-[#E8A2B8] tracking-widest">AUTH_V3.0.0</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthPortal;
