import React, { useState } from 'react';

export default function LockScreen({ onUnlock }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="fixed inset-0 bg-[#050b14] select-none flex items-center justify-center z-[9999] overflow-hidden font-sans">
      {/* ─── Premium Lock Screen Backdrop (Tree Silhouette + Starry Night Sky) ─── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#04060c] via-[#0a1120] to-[#121b2d] z-0">
        {/* Starry Sky effect (Generated pure CSS/SVG stars) */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]"></div>
        {/* Faint Stars */}
        <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-24 right-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute top-48 left-2/3 w-1 h-1 bg-white rounded-full opacity-40"></div>
        <div className="absolute top-64 right-1/4 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-50"></div>
        
        {/* Tree Silhouette at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 z-0 pointer-events-none opacity-90">
          <svg className="w-full h-full text-black" viewBox="0 0 400 400" preserveAspectRatio="none" fill="currentColor">
            <path d="M 0 400 
                     L 0 350 
                     Q 20 330 40 350 
                     T 80 340 
                     T 120 360 
                     T 160 330 
                     T 200 310 
                     T 240 330 
                     T 280 340 
                     T 320 320 
                     T 360 340 
                     T 400 310 
                     L 400 400 Z" />
            {/* Tree silhouette */}
            <path d="M 180 310 
                     Q 170 290 180 270 
                     Q 150 250 170 210 
                     Q 140 180 180 140 
                     Q 190 80 220 120 
                     Q 260 100 250 160 
                     Q 290 190 260 230 
                     Q 280 270 240 290 
                     Q 245 310 235 315 L 180 310" />
            <path d="M 90 350 
                     Q 80 335 90 320 
                     Q 70 300 95 280 
                     Q 115 250 135 285 
                     Q 145 310 130 330 
                     Q 135 350 120 350 L 90 350" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* ─── Phone Frame / Lock Screen Content ─── */}
      <div className="relative w-full h-full max-w-[412px] max-h-[892px] md:border-[8px] md:border-black md:rounded-[48px] md:shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-6 z-10 text-white">
        
        {/* Top Lock Indicator & Time */}
        <div className="flex flex-col items-center mt-8 z-10">
          {/* Padlock Icon */}
          <div className="mb-2 text-white/90 animate-bounce">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          {/* Time display */}
          <h1 className="text-[72px] font-light tracking-tight leading-none text-white/90">9:41</h1>
          {/* Date display */}
          <p className="text-sm font-medium tracking-wide text-white/80 mt-1">Tuesday, 23 June</p>
        </div>

        {/* Center: Push Notification Card */}
        <div className="flex-grow flex items-center justify-center px-2 z-10">
          {!dismissed && (
            <div className="w-full flex flex-col gap-4 animate-fade-in">
              {/* Notification Box */}
              <div className="bg-white/90 border border-white/35 rounded-2xl p-4 text-black shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md flex gap-3.5 relative overflow-hidden transition-all duration-300">
                {/* Swiggy Logo inside notification */}
                <div className="w-10 h-10 rounded-xl bg-[#FC8019] flex items-center justify-center shrink-0 shadow-md">
                  <img src="/buttons/Frame (11).svg" alt="Swiggy" className="w-7 h-7 object-contain" />
                </div>
                
                {/* Content */}
                <div className="flex-grow flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-900 tracking-tight leading-tight">
                    Make Your IPL Final Even Better!
                  </span>
                  <span className="text-[11px] text-gray-700 mt-1 leading-normal font-medium font-sans">
                    Missing Haldiram Chole Bhature with Lassi while watching IPL Final
                  </span>
                </div>
              </div>

              {/* Action Buttons underneath */}
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => onUnlock(true)}
                  className="flex-1 bg-[#FC8019] hover:bg-[#e77112] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                >
                  Order Now
                </button>
                <button 
                  onClick={() => setDismissed(true)}
                  className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow backdrop-blur-md active:scale-95 transition-all"
                >
                  Miss this opportunity
                </button>
              </div>
            </div>
          )}

          {dismissed && (
            <button 
              onClick={() => onUnlock(false)}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md animate-pulse"
            >
              Swipe up to unlock
            </button>
          )}
        </div>

        {/* Bottom Lockscreen controls (Flashlight, Camera, Home Indicator) */}
        <div className="flex flex-col gap-5 items-center z-10">
          <div className="w-full flex justify-between items-center px-4">
            {/* Flashlight button */}
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all backdrop-blur-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6H6a2 2 0 0 0-2 2v3a2 2 0 0 0 1 1.72V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.28A2 2 0 0 0 20 11V8a2 2 0 0 0-2-2z" />
                <path d="M12 2v4" />
                <path d="M7 2h10" />
              </svg>
            </button>
            
            {/* Camera button */}
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all backdrop-blur-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          {/* Swipe Indicator bar */}
          <div 
            onClick={() => onUnlock(false)}
            className="w-36 h-1 bg-white/60 rounded-full cursor-pointer hover:bg-white/80 transition-colors"
          ></div>
        </div>

      </div>
    </div>
  );
}
