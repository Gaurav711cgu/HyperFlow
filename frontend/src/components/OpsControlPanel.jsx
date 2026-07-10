import React, { useState, useEffect } from 'react';

export default function OpsControlPanel({ onBack }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isEvSurge, setIsEvSurge] = useState(true);
  const [demandThreshold, setDemandThreshold] = useState(65);
  const [activeTab, setActiveTab] = useState('food');
  const [isApiOnline, setIsApiOnline] = useState(true);
  const [latency, setLatency] = useState(42);
  const [fleetSize, setFleetSize] = useState(1402);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jitter simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(10, Math.min(200, prev + Math.floor(Math.random() * 7) - 3)));
      setFleetSize(prev => Math.max(1000, Math.min(2000, prev + Math.floor(Math.random() * 5) - 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (district operations_control mockup) ─── */
    return (
      <div className="bg-[#040406] min-h-screen text-[#e5e1e6] font-sans overflow-y-auto pb-12 select-none w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 -ml-1 text-[#FF0077]">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">Ops Intel Control</h1>
          </div>
          <span className="material-symbols-outlined text-[#00E676] animate-pulse">sensors</span>
        </header>

        <main className="p-4 flex flex-col gap-6">
          {/* Active Storm Surge Card */}
          <section className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FF3366] text-[24px]">thunderstorm</span>
              <div>
                <h3 className="text-xs font-bold text-white">Monsoon Surge Override</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Fleet multiplier is active (1.5x)</p>
              </div>
            </div>
            <div 
              onClick={() => setIsEvSurge(!isEvSurge)}
              className={`w-9 h-5 rounded-full relative flex items-center px-0.5 cursor-pointer transition-all ${
                isEvSurge ? 'bg-red-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                isEvSurge ? 'translate-x-4' : 'translate-x-0'
              }`}></div>
            </div>
          </section>

          {/* Tobit Demand Solver Stats */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Tobit Demand Forecasting</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#14141F] rounded-lg p-3 border border-white/5">
                <span className="text-[9px] text-gray-500 font-mono block">COEFFICIENT</span>
                <span className="text-sm font-bold text-white font-mono">0.942</span>
              </div>
              <div className="bg-[#14141F] rounded-lg p-3 border border-white/5">
                <span className="text-[9px] text-gray-500 font-mono block">UNCERTAINTY</span>
                <span className="text-sm font-bold text-[#FF0077] font-mono">4.1%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Sensitivity Threshold</span>
                <span className="font-mono text-white">{demandThreshold}%</span>
              </div>
              <input 
                type="range"
                className="w-full accent-[#FF0077] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                value={demandThreshold}
                onChange={(e) => setDemandThreshold(e.target.value)}
              />
            </div>
          </section>

          {/* Platform API Integrations status */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">API Sync States</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-[#14141F] rounded-lg p-3 border border-white/5">
                <span className="text-xs text-white font-semibold">Swiggy Builders Club</span>
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">Online</span>
              </div>
              <div className="flex justify-between items-center bg-[#14141F] rounded-lg p-3 border border-white/5">
                <span className="text-xs text-white font-semibold">Zomato Engine</span>
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">Online</span>
              </div>
              <div className="flex justify-between items-center bg-[#14141F] rounded-lg p-3 border border-white/5">
                <span className="text-xs text-white font-semibold">Blinkit Darkstore</span>
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">Online</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (hyperflow_operations_control_v3_high_fidelity) ─── */
  return (
    <div className="w-full min-h-screen bg-[#131318] text-[#e4e1e9] select-none font-sans overflow-hidden relative">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#262626]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/5 text-[#ffb3b1] transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <span className="text-xl font-bold tracking-tighter text-white">HyperFlow</span>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <span className="font-mono text-[9px] text-[#ff535a] uppercase tracking-widest">Ops Core V3</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-[#1f1f25] px-4 py-1.5 rounded-full border border-[#262626]">
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              Swiggy <div className="w-2.5 h-2.5 rounded-full bg-[#71d7cf] animate-pulse"></div>
            </span>
            <div className="h-3 w-px bg-white/10"></div>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              Zomato <div className="w-2.5 h-2.5 rounded-full bg-[#71d7cf] animate-pulse"></div>
            </span>
            <div className="h-3 w-px bg-white/10"></div>
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              Blinkit <div className="w-2.5 h-2.5 rounded-full bg-[#71d7cf] animate-pulse"></div>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-16 flex h-screen overflow-hidden">
        {/* Left Side Navigation Panel */}
        <nav className="w-64 h-full bg-[#131318] border-r border-[#262626] flex flex-col py-6 shrink-0">
          <div className="px-6 mb-8">
            <p className="text-sm font-bold text-white tracking-wide uppercase">Operator Console</p>
            <p className="font-mono text-[9px] text-gray-500 mt-1">SYSADMIN DIRECTORY</p>
          </div>
          <div className="flex flex-col gap-1 flex-grow">
            <a className="flex items-center gap-4 px-6 py-3 text-[#ff535a] border-r-4 border-[#ff535a] bg-[#1f1f25] transition-all" href="#">
              <span className="material-symbols-outlined">monitoring</span>
              <span className="font-mono text-xs">Real-time Monitor</span>
            </a>
            <a className="flex items-center gap-4 px-6 py-3 text-gray-400 hover:bg-[#1f1f25] transition-all" href="#">
              <span className="material-symbols-outlined">local_shipping</span>
              <span className="font-mono text-xs">Fleet Logistics</span>
            </a>
            <a className="flex items-center gap-4 px-6 py-3 text-gray-400 hover:bg-[#1f1f25] transition-all" href="#">
              <span className="material-symbols-outlined">model_training</span>
              <span className="font-mono text-xs">ML Training</span>
            </a>
          </div>
          <div className="px-6 pb-6">
            <button className="w-full bg-[#1f1f25] border border-[#262626] py-3 rounded-xl font-mono text-xs text-white hover:bg-white/5 transition-colors">
              DEPLOY SYSTEM UPDATE
            </button>
          </div>
        </nav>

        {/* Content Canvas */}
        <div className="flex-grow flex p-8 gap-8 overflow-y-auto bg-[#0e0e13]">
          {/* Left Panel: Simulated phone view */}
          <div className="w-[410px] h-[760px] border-[12px] border-[#1f1f25] rounded-[48px] overflow-hidden relative shadow-2xl shrink-0 bg-[#0f0f14] flex flex-col">
            <div className="bg-[#ff535a] text-white text-[9px] py-1 px-4 text-center font-bold tracking-widest animate-pulse">
              SURGE OVERRIDE ACTIVE • STORM MULTIPLIER
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none">
              {/* Simple Search bar */}
              <div className="bg-[#1f1f25] border border-[#262626] rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff535a]">search</span>
                <span className="text-gray-500 text-xs font-semibold">Search Biryani, Groceries...</span>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-[#262626] gap-6 mt-2">
                <button 
                  onClick={() => setActiveTab('food')} 
                  className={`pb-2 text-xs font-bold transition-all ${
                    activeTab === 'food' ? 'border-b-2 border-[#ff535a] text-[#ff535a]' : 'text-gray-500'
                  }`}
                >
                  Food Delivery
                </button>
                <button 
                  onClick={() => setActiveTab('im')} 
                  className={`pb-2 text-xs font-bold transition-all ${
                    activeTab === 'im' ? 'border-b-2 border-[#ff535a] text-[#ff535a]' : 'text-gray-500'
                  }`}
                >
                  Instamart
                </button>
              </div>

              {/* Grocery grid */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2">Instamart Essentials</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[#1f1f25] border border-[#262626] rounded-xl p-3 flex flex-col items-center">
                    <span className="material-symbols-outlined text-gray-400 mb-1">apple</span>
                    <span className="text-[9px] text-gray-500 text-center font-medium">Fruits</span>
                  </div>
                  <div className="bg-[#1f1f25] border border-[#262626] rounded-xl p-3 flex flex-col items-center">
                    <span className="material-symbols-outlined text-gray-400 mb-1">local_drink</span>
                    <span className="text-[9px] text-gray-500 text-center font-medium">Dairy</span>
                  </div>
                  <div className="bg-[#1f1f25] border border-[#262626] rounded-xl p-3 flex flex-col items-center">
                    <span className="material-symbols-outlined text-gray-400 mb-1">lunch_dining</span>
                    <span className="text-[9px] text-gray-500 text-center font-medium">Bakery</span>
                  </div>
                  <div className="bg-[#1f1f25] border border-[#262626] rounded-xl p-3 flex flex-col items-center">
                    <span className="material-symbols-outlined text-gray-400 mb-1">kebab_dining</span>
                    <span className="text-[9px] text-gray-500 text-center font-medium">Meats</span>
                  </div>
                </div>
              </div>

              {/* Restaurant view */}
              <div className="mt-2">
                <h4 className="text-xs font-bold text-white mb-2">Popular Restaurants</h4>
                <div className="flex gap-4 bg-[#1f1f25] border border-[#262626] rounded-2xl p-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden shrink-0">
                    <img alt="Wagyu" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60" />
                  </div>
                  <div className="flex flex-col justify-between py-1 flex-1">
                    <h5 className="text-xs font-bold text-white">Umami Central</h5>
                    <p className="text-[9px] text-gray-500">Mughlai • 25 min SLA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Advanced analytics & configuration */}
          <div className="flex-grow flex flex-col gap-6">
            {/* API Status Banner */}
            <div className="bg-[#0A0A0F]/80 backdrop-blur-md border border-[#262626] rounded-2xl p-6 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 border border-[#71d7cf]/30 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#71d7cf] animate-pulse"></div>
                  <span className="text-xs font-mono font-bold text-[#71d7cf] uppercase">API Online</span>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <span className="font-mono text-xs text-gray-400">LATENCY: {latency}ms</span>
                <span className="font-mono text-xs text-gray-400">FLEET: {fleetSize}</span>
              </div>
              <span className="font-mono text-xs text-[#ff535a] font-bold">MONSOON JITTER INDEX: 1.1x</span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Tobit Forecast */}
              <div className="bg-[#0A0A0F]/80 border border-[#262626] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">Tobit Latent Demand Solver</h3>
                    <p className="text-[10px] text-gray-500">Demand projection and fleet placement model</p>
                  </div>
                  <span className="material-symbols-outlined text-[#ffb3b1]">query_stats</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1f1f25] border border-[#262626] p-4 rounded-xl">
                    <span className="text-[9px] text-gray-500 font-mono block">DEMAND MATRIX</span>
                    <span className="text-base font-bold text-white font-mono">0.942</span>
                  </div>
                  <div className="bg-[#1f1f25] border border-[#262626] p-4 rounded-xl">
                    <span className="text-[9px] text-gray-500 font-mono block">MODEL DELAY</span>
                    <span className="text-base font-bold text-[#ff535a] font-mono">4.1%</span>
                  </div>
                </div>
              </div>

              {/* Monsoon Jitter chart */}
              <div className="bg-[#0A0A0F]/80 border border-[#262626] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">Monsoon ETA Jitter</h3>
                    <p className="text-[10px] text-gray-500">Real-time ETA smoothing chart</p>
                  </div>
                  <span className="material-symbols-outlined text-[#71d7cf]">timeline</span>
                </div>
                <div className="h-28 bg-[#1f1f25] border border-[#262626] rounded-xl flex items-center justify-center p-4">
                  {/* Visual SVG graph line */}
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path 
                      d="M0,40 Q50,20 100,50 T200,30 T300,45" 
                      fill="none" 
                      stroke="#ff535a" 
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Health Bar */}
            <div className="bg-[#0A0A0F]/80 border border-[#262626] rounded-2xl p-4 grid grid-cols-3 gap-6 text-xs mt-auto">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase text-[9px] font-bold">CPU Utilization</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-grow bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff535a] w-[68%]"></div>
                  </div>
                  <span className="font-mono text-[10px]">68%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
                <span className="text-gray-500 uppercase text-[9px] font-bold">API cluster nodes</span>
                <span className="font-bold text-[#71d7cf] font-mono">18 / 18 HEALTHY</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
                <span className="text-gray-500 uppercase text-[9px] font-bold">Memory utilization</span>
                <span className="font-bold text-white font-mono">1.2 TB / 4.0 TB</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
