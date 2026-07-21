import React, { useState } from 'react';

const AuthPortal = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

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

            {/* Form Section */}
            <form className="space-y-lg" onSubmit={handleDemoLogin}>
              <button 
                type="submit" 
                disabled={loading}
                className="shimmer-btn w-full py-md bg-district-pink text-white rounded-full font-section-header neon-glow-pink hover:opacity-90 transition-all flex items-center justify-center gap-sm"
              >
                {loading ? 'Authenticating...' : 'Demo Access'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </form>

            {/* Ornamental Detail */}
            <div className="absolute bottom-0 right-0 p-xs opacity-20">
              <span className="font-metric-mono text-[8px] text-white">AUTH_V3.0.0</span>
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
