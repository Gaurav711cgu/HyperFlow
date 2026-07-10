import React, { useState, useEffect } from 'react';

export default function FleetLogisticsAdmin({ onBack }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activeRiders, setActiveRiders] = useState(1204);
  const [inTransit, setInTransit] = useState(842);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setActiveRiders(prev => prev + Math.floor(Math.random() * 5) - 2);
      setInTransit(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const alerts = [
    { id: 1, sector: '4G', text: 'High traffic density detected in sector 4G. Routing algorithms updated automatically.' },
    { id: 2, sector: '2B', text: 'Heavy rainfall in patia circle. Speed threshold reduced.' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#F3F4F6] font-sans antialiased flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#080808] border-b md:border-b-0 md:border-r border-[#2A2A2A] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#2A2A2A] justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#3B82F6] mr-3"></div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white">HYPERFLOW</h1>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden text-xs font-mono text-[#9CA3AF] hover:text-white px-2 py-1 border border-[#2A2A2A] hover:bg-[#2A2A2A] transition-colors"
            >
              BACK
            </button>
          )}
        </div>
        <nav className="flex-grow py-4">
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm bg-[#1c1c1c] border-l-2 border-[#3B82F6] text-white">
                Ops Control
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#121212] transition-colors">
                Fleet Status
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#121212] transition-colors">
                Riders
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm text-[#9CA3AF] hover:text-white hover:bg-[#121212] transition-colors">
                Analytics
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-[#2A2A2A]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
              AD
            </div>
            <div className="ml-3">
              <p className="text-xs font-semibold text-white">Admin User</p>
              <p className="text-[10px] text-[#9CA3AF]">System Operator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        {/* Header */}
        <header className="h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 border-b border-[#2A2A2A] bg-[#080808] shrink-0 py-2 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm sm:text-base font-medium text-white">Global Ops Control Center</h2>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#121212] border border-[#10B981] text-[#10B981]">
              SYSTEM OPTIMAL
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-[#9CA3AF] w-full sm:w-auto justify-between sm:justify-start">
            {onBack && (
              <button 
                onClick={onBack}
                className="hidden md:inline-flex px-3 py-1 text-xs border border-[#2A2A2A] hover:bg-[#1c1c1c] text-white transition-colors"
              >
                ← BACK
              </button>
            )}
            <div className="flex items-center">
              Zone: NA-EAST
            </div>
            <span className="text-white font-mono">{currentTime}</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col space-y-6">
          {/* Key Metrics Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="bg-[#121212] border border-[#2A2A2A] p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Active Riders</h3>
                <span className="material-symbols-outlined text-[#3B82F6] text-lg">trending_up</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-light text-white">{activeRiders}</span>
                <span className="text-[10px] font-medium text-[#10B981]">+4.2%</span>
              </div>
            </article>

            <article className="bg-[#121212] border border-[#2A2A2A] p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Deliveries in Transit</h3>
                <span className="material-symbols-outlined text-[#F59E0B] text-lg">pending_actions</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-light text-white">{inTransit}</span>
                <span className="text-[10px] font-bold text-[#F59E0B] uppercase">High Load</span>
              </div>
            </article>

            <article className="bg-[#121212] border border-[#2A2A2A] p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Avg Delivery Time</h3>
                <span className="material-symbols-outlined text-[#10B981] text-lg">schedule</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-light text-white">24m</span>
                <span className="text-[10px] text-[#9CA3AF]">-2m vs avg</span>
              </div>
            </article>

            <article className="bg-[#121212] border border-[#2A2A2A] p-5 flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Success Rate (Daily)</h3>
                <span className="material-symbols-outlined text-[#10B981] text-lg">check_circle</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-light text-white">98.5%</span>
              </div>
              <div className="w-full bg-black h-1 mt-2 border border-[#2A2A2A]">
                <div className="bg-[#10B981] h-full" style={{ width: '98.5%' }}></div>
              </div>
            </article>
          </section>

          {/* Map and Alerts Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
            <div className="lg:col-span-2 border border-[#2A2A2A] bg-[#121212] flex flex-col relative min-h-[400px]">
              <div className="px-5 py-3 border-b border-[#2A2A2A] flex justify-between items-center bg-black">
                <h3 className="text-xs font-semibold text-white">Live Rider Tracking</h3>
                <span className="text-[9px] font-mono text-[#9CA3AF]">MAP MODE: AUTOMATIC</span>
              </div>
              
              {/* Simulated Map Background */}
              <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-8">
                <img 
                  alt="Live Rider Map Visual" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLs0Jeh45OI-ZPsSnh1UdfZRoLM1W96iLTXc16YE0Q6UaO9vwEOwoCgb8v9UY_k5A6w7xxARXUL-m_dzIX2Vn1RDPOgZe5omMv4InqVXGGiAcDXN5NRyenk4smjPa51I-6tNrMu5e46lr-CGTpy7er-mmqz9_DnuF6_XFtA5MBePdStaQaqogmWW-y_mxd69_SJa8BliqPjk00Zn3Ao5ny6DAav2gTAboczygIQL8PPWLB4TYvZqheZiW2kH"
                />
                <div className="absolute top-4 left-4 bg-[#121212] border border-[#2A2A2A] p-4 max-w-xs z-10">
                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[16px] animate-pulse">warning</span>
                    Zone Alpha Alert
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF] leading-relaxed">High traffic density detected in sector 4G. Routing algorithms updated automatically.</p>
                </div>
                
                {/* Simulated markers */}
                <div className="absolute top-1/3 left-1/2 w-6 h-6 bg-[#3B82F6] border-2 border-white rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <span className="material-symbols-outlined text-[12px] text-white">two_wheeler</span>
                </div>
                <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-[#10B981] border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[12px] text-white">sports_motorsports</span>
                </div>
              </div>
            </div>

            {/* Sidebar alerts and logs */}
            <div className="lg:col-span-1 bg-[#121212] border border-[#2A2A2A] p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2A2A2A] pb-2">Active Incidents</h3>
              
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {alerts.map(a => (
                  <div key={a.id} className="p-3 bg-black border border-[#2A2A2A] rounded flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 rounded">SECTOR: {a.sector}</span>
                      <span className="text-[9px] text-[#9CA3AF]">1m ago</span>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] leading-normal">{a.text}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-xs font-mono font-bold transition-colors">
                RESOLVE ALL ALERTS
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
