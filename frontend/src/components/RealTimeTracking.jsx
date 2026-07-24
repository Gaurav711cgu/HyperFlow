import React, { useState, useEffect } from 'react';
import ConfidenceArc from './ConfidenceArc.jsx';

export default function RealTimeTracking({ 
  onBack = () => {}, 
  riderPos, 
  routePoints = [], 
  orderStatus = "Rider is delivering", 
  etaMinutes = 14, 
  onChatClick = () => {} 
}) {
  const [simulatedJitter, setSimulatedJitter] = useState(false);
  const [stormSurge, setStormSurge] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProgress(prev => (prev >= 95 ? 10 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayEta = stormSurge ? etaMinutes + 12 : (simulatedJitter ? etaMinutes + 2 : etaMinutes);

  return (
    <div className="min-h-screen bg-[#07070B] text-white font-sans selection:bg-[#FF3366] flex flex-col">
      
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-[#0A0A10]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <span className="text-xs font-mono text-[#FF4D6D] font-bold uppercase tracking-widest">LIVE TRACKING TELEMETRY</span>
            <h1 className="text-lg font-serif font-bold text-white">Order #DX-9902-TRK</h1>
          </div>
        </div>

        {/* Demo Controls Panel inside Header */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setSimulatedJitter(!simulatedJitter)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              simulatedJitter ? 'bg-[#FF3366]/20 border-[#FF3366] text-[#FF4D6D]' : 'bg-white/5 border-white/15 text-white/70'
            }`}
          >
            {simulatedJitter ? 'GPS JITTER: ACTIVE' : 'SIMULATE GPS JITTER'}
          </button>

          <button
            onClick={() => setStormSurge(!stormSurge)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              stormSurge ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/15 text-white/70'
            }`}
          >
            {stormSurge ? 'WEATHER SURGE: ACTIVE' : 'NORMAL WEATHER'}
          </button>

          <button
            onClick={onChatClick}
            className="px-4 py-1.5 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#A098FF] hover:bg-[#6C63FF]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span>AI AGENT</span>
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="pt-20 flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-80px)]">
        
        {/* Left Map Simulation (8 Cols) */}
        <div className="lg:col-span-8 bg-[#040408] relative overflow-hidden flex items-center justify-center border-r border-white/10">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale contrast-125" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB08upXHFJ6nW5ZH3Av5rTtjSqlGo52B25C8KunPKEjHivY59W41_pEDWQ27Vh1MCcMj-d4Y7G08l4rwef6LrMzO7awCtVQ51qKaRlQf3Fh9ScELeTW5VGWLLAmHzTwJXAK-vIR2__HWARBAEautRoJ4q-9f4N7oDWCqZXcPAI28XVSn_-iu2MMp9crWqYxDUp20-0Z9E8Ws1ygenKlP32sDB28A25BUiLsVbgNt9yO7ylaGAt4zFH2sGyfy55VqqzG3xs9otH9-lXP')" }}></div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 150 450 Q 350 400 450 300 T 700 150" fill="none" stroke="rgba(255, 51, 102, 0.3)" strokeDasharray="8 8" strokeWidth="4" />
            <path d="M 150 450 Q 350 400 450 300" fill="none" stroke="#FF3366" strokeWidth="4" />
            <circle cx="700" cy="150" fill="#FF3366" r="10" />
            <circle cx="700" cy="150" fill="none" r="20" stroke="#FF3366" strokeWidth="2" className="animate-ping" />
          </svg>

          <div 
            className="absolute transition-all duration-1000 ease-linear flex flex-col items-center"
            style={{ left: `${15 + currentProgress * 0.6}%`, top: `${55 - currentProgress * 0.4}%` }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#FF758F] border-2 border-white flex items-center justify-center shadow-2xl shadow-[#FF3366]/50">
              <span className="material-symbols-outlined text-white text-xl">two_wheeler</span>
            </div>
            <div className="mt-1 px-3 py-1 bg-[#101018]/90 border border-white/20 rounded-full backdrop-blur-md text-[10px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
              Rider: Sourav M. (Patia Route)
            </div>
          </div>

          <div className="absolute bottom-6 left-6 bg-[#101018]/95 border border-white/15 rounded-2xl p-4 backdrop-blur-2xl max-w-sm shadow-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-ping"></span>
              <span className="text-xs font-bold text-white uppercase font-mono">{orderStatus}</span>
            </div>
            <p className="text-xs text-white/60 font-light">
              Learned ETA Smoother: <strong className="text-emerald-400 font-mono">Velocity-Normalized</strong>
            </p>
          </div>
        </div>

        {/* Right Details Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0A0A10] p-6 space-y-6 overflow-y-auto">
          
          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-white/40 uppercase font-mono">ESTIMATED ARRIVAL</span>
              <p className="text-4xl font-serif font-bold text-white mt-1">{displayEta} min</p>
              <p className="text-xs text-[#FF4D6D] font-mono mt-1">94% Confidence Gate</p>
            </div>

            <ConfidenceArc 
              confidence={0.94}
              label="Gate Quality"
              color="#00D4AA"
              size={95}
            />
          </div>

          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C63FF] to-[#FF3366] flex items-center justify-center font-mono font-bold text-white">
                  SM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sourav Mohapatra</h4>
                  <p className="text-xs text-white/40 font-mono">EV Express Rider RATING: 4.9</p>
                </div>
              </div>

              <button 
                onClick={() => alert("Calling Courier Sourav...")}
                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">call</span>
              </button>
            </div>
          </div>

          <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-white/40 uppercase">LIVE MILESTONES</h4>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center gap-3 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Order Picked Up at Patia Warehouse</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Thermal SQI Packaging Sealed</span>
              </div>
              <div className="flex items-center gap-3 text-[#FF4D6D] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#FF4D6D]"></span>
                <span>Rider en route on Prasanti Vihar Segment</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
