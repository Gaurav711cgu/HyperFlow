import React, { useState, useEffect } from 'react';

export default function AuthPortal({ onLoginSuccess }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['4', '2', '', '']);
  const [resendTimer, setResendTimer] = useState(45);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    setOtpSent(true);
    setResendTimer(45);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-authenticate when all 4 digits are entered
    if (newOtp.every(digit => digit !== '')) {
      handleAuthenticate(newOtp.join(''));
    }
  };

  const handleAuthenticate = (code = otp.join('')) => {
    onLoginSuccess(phoneNumber);
  };

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (district_auth_portal) ─── */
    return (
      <div className="relative flex flex-col items-center justify-between min-h-screen px-6 py-8 bg-[#040406] text-[#e5e1e6] select-none font-sans overflow-hidden">
        {/* Background Grid & Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none radial-dots-pattern opacity-10"></div>
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-[#8F00FF]/15 blur-[60px] rounded-full pointer-events-none"></div>

        {/* 1. Header Branding */}
        <header className="flex flex-col items-center mt-8 w-full z-10">
          <div className="w-20 h-20 rounded-full flex items-center justify-center glow-ring mb-6 relative">
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-[#FF0077] via-[#8F00FF] to-[#FF0077] animate-spin opacity-80 blur-[8px]"></div>
            <div className="absolute inset-[-2px] rounded-full bg-[#040406]"></div>
            <span className="text-3xl font-bold text-white tracking-tighter relative z-10">HF</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">
            HyperFlow x <span className="text-[#FF0077]">DISTRICT</span>
          </h1>
          <p className="text-xs text-gray-400/80 text-center px-4">
            Unified Quick Commerce & Dining Portal
          </p>
        </header>

        {/* Main Content Container */}
        <main className="w-full flex-1 flex flex-col justify-center space-y-8 z-10 mt-6 max-w-sm">
          {/* 2. Auth Toggle */}
          <div className="bg-[#0A0A0F]/70 backdrop-blur-xl border border-white/10 rounded-full p-1 flex relative mx-auto w-3/4 max-w-[280px]">
            <button className="flex-1 py-2 text-sm font-semibold rounded-full bg-[#FF0077] text-white shadow-[0_0_15px_rgba(255,0,119,0.4)] transition-all z-10">
              Log In
            </button>
            <button className="flex-1 py-2 text-sm font-medium rounded-full text-gray-400 hover:text-white transition-all z-10">
              Sign Up
            </button>
          </div>

          {/* 3. Phone & OTP Panel */}
          <div className="bg-[#0A0A0F]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col space-y-6 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF0077]/50 to-transparent"></div>
            
            {/* Phone Field */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Mobile Number</label>
              <div className="flex space-x-2">
                <div className="bg-white/5 border border-white/10 h-12 px-3 rounded-xl flex items-center justify-center space-x-2 text-sm">
                  <span>🇮🇳</span>
                  <span className="text-white font-medium">+91</span>
                </div>
                <input 
                  className="flex-1 bg-white/5 border border-white/10 h-12 px-4 rounded-xl text-white font-medium text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FF0077] focus:ring-1 focus:ring-[#FF0077] transition-all" 
                  placeholder="Enter Phone Number" 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {/* OTP Section */}
            {otpSent && (
              <div className="flex flex-col space-y-2 pt-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-[#FF0077]">OTP sent to your number</label>
                  <button 
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0}
                    className={`text-[10px] font-semibold transition-colors ${resendTimer > 0 ? 'text-gray-500' : 'text-[#8F00FF] hover:text-[#FF0077]'}`}
                  >
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
                  </button>
                </div>
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx}
                      id={`otp-${idx}`}
                      className="w-12 h-14 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-bold text-white focus:outline-none focus:border-[#FF0077] focus:ring-1 focus:ring-[#FF0077]"
                      maxLength="1"
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Button */}
          {!otpSent ? (
            <button 
              onClick={handleSendOtp}
              className="w-full h-14 rounded-full bg-gradient-to-r from-[#FF0077] to-[#8F00FF] flex items-center justify-center shadow-[0_8px_24px_rgba(255,0,119,0.25)] hover:scale-[0.98] transition-transform"
            >
              <span className="text-white font-bold text-base tracking-wide flex items-center">
                Continue Securely
                <span className="material-symbols-outlined ml-2 text-[20px]">chevron_right</span>
              </span>
            </button>
          ) : (
            <button 
              onClick={() => handleAuthenticate()}
              className="w-full h-14 rounded-full bg-[#8F00FF] flex items-center justify-center shadow-[0_8px_24px_rgba(143,0,255,0.25)] hover:scale-[0.98] transition-transform"
            >
              <span className="text-white font-bold text-base tracking-wide flex items-center">
                Authenticate Access
                <span className="material-symbols-outlined ml-2 text-[20px]">lock</span>
              </span>
            </button>
          )}

          {/* 5. Social Auth */}
          <div className="flex flex-col space-y-4 w-full">
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">or connect with</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>
            <div className="flex space-x-3 w-full">
              <button 
                onClick={() => handleAuthenticate()}
                className="flex-1 h-12 rounded-xl bg-white flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-black font-semibold text-sm">Google</span>
              </button>
              <button 
                onClick={() => handleAuthenticate()}
                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-white">mail</span>
                <span className="text-white font-semibold text-sm">Email</span>
              </button>
            </div>
          </div>
        </main>

        {/* 6. Footer */}
        <footer className="w-full flex justify-center pb-4 z-10 mt-auto pt-6">
          <div className="flex items-center space-x-2 text-gray-500 text-[10px]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>PCI-DSS Compliant Secure Login</span>
          </div>
        </footer>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (district_auth_portal_desktop) ─── */
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#131316] relative overflow-hidden select-none font-sans">
      {/* Global Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF0077] blur-[120px] opacity-25"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#8F00FF] blur-[120px] opacity-25"></div>
      </div>

      <main className="w-full h-full min-h-screen flex z-10">
        {/* Left Pane: Brand & Abstract Visuals (60%) */}
        <section className="w-3/5 min-h-screen relative overflow-hidden flex items-center justify-center bg-[#040406]">
          {/* High-fidelity abstract flow background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9p-quxV0ahQq5Wiua4pvGcNuRVvSGZYFEHiG-2hVkCNzq6v7nu8fM_HkkSx0kE0iHbee5B-In_Mlp7T1oXmIWpLE0fxFMtn22JvLw1sS-ZjL0MNewwRIO5mcuJIv8rVBIwXwiJWk4aq67PxMTojegMt4eTLcwBukraOf3HA5L1hrrn3RfoGZwK5bJQvRQ1UFw90jX8dLKHeDRHwVuIePNxPdpcSE3f1XzyudeoelwSKQaH-R8GGSmMIwZvMKdPyEqBFAdylVyfpH8')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#040406] via-[#040406]/70 to-transparent"></div>
          
          {/* Branding Overlay */}
          <div className="relative z-10 flex flex-col items-center text-center px-8">
            <div className="mb-6 flex items-center gap-4">
              <span className="text-white font-extrabold italic text-4xl bg-clip-text text-transparent bg-gradient-to-r from-[#FF0077] to-[#8F00FF] tracking-tighter uppercase">
                HyperFlow
              </span>
              <div className="h-8 w-px bg-white/20"></div>
              <span className="text-white text-4xl tracking-tighter uppercase font-bold opacity-80">
                District
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm tracking-wide leading-relaxed">
              Experience high-density logistics through a premium glassmorphic lens. Join the elite network of precision delivery.
            </p>
            {/* Status Ticker */}
            <div className="mt-8 flex gap-6 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                <span className="font-mono text-[10px] text-[#00E676]">NODE_ACTIVE: 04-DX</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#FF0077]">LATENCY: 12ms</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: Onboarding Login (40%) */}
        <section className="w-2/5 min-h-screen bg-[#040406] border-l border-white/5 flex items-center justify-center px-12">
          {/* Login Card */}
          <div className="bg-[#0A0A0F]/50 backdrop-blur-2xl w-full max-w-md p-8 rounded-[24px] border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
            {/* Top Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-xs text-gray-400">Enter your credentials to access your dashboard.</p>
            </div>
            
            {/* Form Section */}
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white px-1 block">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">smartphone</span>
                  <input 
                    className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-medium placeholder-gray-600 focus:border-[#FF0077] focus:ring-1 focus:ring-[#FF0077] outline-none transition-all" 
                    placeholder="+91 98765 43210" 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              
              {!otpSent && (
                <button 
                  className="w-full py-3 bg-[#FF0077] text-white rounded-full font-semibold hover:bg-[#FF0077]/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,0,119,0.3)]" 
                  type="submit"
                >
                  Request OTP
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              )}
            </form>

            {/* OTP Hidden Section */}
            {otpSent && (
              <div className="mt-6 space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white px-1 block">Verification Code</label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx}
                        id={`otp-desktop-${idx}`}
                        className="w-14 h-16 bg-[#0A0A0F] border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-[#FF0077] focus:ring-1 focus:ring-[#FF0077]"
                        maxLength="1"
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleAuthenticate()}
                  className="w-full py-3 bg-[#8F00FF] text-white rounded-full font-semibold hover:bg-[#8F00FF]/90 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(143,0,255,0.3)]"
                >
                  Authenticate Access
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </button>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">or continue with</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleAuthenticate()}
                  className="p-2.5 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                </button>
                <button 
                  onClick={() => handleAuthenticate()}
                  className="p-2.5 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">passkey</span>
                </button>
              </div>
            </div>

            {/* Ornamental Detail */}
            <div className="absolute bottom-2 right-4 opacity-20">
              <span className="font-mono text-[8px] text-white">AUTH_V2.0.4</span>
            </div>
          </div>

          {/* Footer Text */}
          <div className="absolute bottom-8 flex flex-col items-center gap-1">
            <p className="text-[10px] text-gray-600">Secure verification by HyperFlow Bio-Sync</p>
            <div className="flex gap-4">
              <a className="text-[10px] text-[#FF0077]/60 hover:text-[#FF0077] transition-colors" href="#privacy">Privacy Policy</a>
              <a className="text-[10px] text-[#FF0077]/60 hover:text-[#FF0077] transition-colors" href="#support">Support</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
