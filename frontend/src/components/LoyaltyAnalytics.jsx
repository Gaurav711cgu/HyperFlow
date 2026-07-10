import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LoyaltyAnalytics({ onBack, onNavigate, cartCount = 0 }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = [
    { name: 'Mon', spend: 400, calories: 2100 },
    { name: 'Tue', spend: 300, calories: 2200 },
    { name: 'Wed', spend: 900, calories: 1900 },
    { name: 'Thu', spend: 200, calories: 2400 },
    { name: 'Fri', spend: 850, calories: 2300 },
    { name: 'Sat', spend: 1100, calories: 2500 },
    { name: 'Sun', spend: 450, calories: 2000 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0F]/95 border border-white/10 p-4 rounded-lg shadow-2xl backdrop-blur-xl font-sans">
          <p className="text-white font-bold mb-2">{label}</p>
          <p className="text-[#FF0077] font-mono text-xs">Spend: ${payload[0].value}</p>
          <p className="text-[#00D4AA] font-mono text-xs">Calories: {payload[1].value} kcal</p>
        </div>
      );
    }
    return null;
  };

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT ─── */
    return (
      <div className="relative bg-[#040406] min-h-screen text-[#e5e1e6] select-none font-sans overflow-y-auto pb-24 w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </button>
            <span className="text-lg font-bold text-[#FF0077] tracking-tight">Elite Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#00D4AA] uppercase tracking-wider bg-[#00D4AA]/10 px-2 py-0.5 rounded border border-[#00D4AA]/20">
              Platinum Elite
            </span>
          </div>
        </header>

        <main className="px-4 py-6 flex flex-col gap-6">
          {/* VIP Card */}
          <div 
            className="rounded-2xl p-6 flex flex-col justify-between h-48 relative border border-white/10 overflow-hidden shadow-xl"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #1f122d 0%, #0a0a0f 50%, #0e202d 100%)',
              backgroundSize: 'cover'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] text-gray-400 tracking-widest uppercase font-bold">District Membership</span>
                <h2 className="text-xl font-bold text-white mt-0.5 italic tracking-tight">VIP PLATINUM</h2>
              </div>
              <span className="material-symbols-outlined text-[#00D4AA] text-[28px]">contactless</span>
            </div>
            <div>
              <span className="font-mono text-sm text-white/90 tracking-[0.2em]">4429 • 8821 • 0092 • 4040</span>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <span className="text-[7px] text-gray-500 uppercase font-bold block">Member Since</span>
                  <span className="font-mono text-[10px] text-white">2021/04</span>
                </div>
                <span className="text-[9px] font-bold text-white/30 italic">DISTRICT</span>
              </div>
            </div>
          </div>

          {/* Spend Milestones */}
          <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Spend Milestones</h3>
              <span className="font-mono text-xs text-[#FF0077] font-semibold">$12,450.00 / $15k</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF0077] to-[#8F03FF] w-[83%] rounded-full relative">
                <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-gray-500 uppercase font-bold">Silver</span>
                <div className="h-1 bg-[#00D4AA] rounded-full opacity-40"></div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-gray-500 uppercase font-bold">Gold</span>
                <div className="h-1 bg-[#00D4AA] rounded-full opacity-80"></div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-[#FF0077] uppercase font-bold">VIP Platinum</span>
                <div className="h-1 bg-[#FF0077] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Spend vs Vitality Chart */}
          <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Spend vs Vitality</h4>
              <p className="text-[10px] text-gray-400 mt-1">Cross-analyzing food spend against biometric targets.</p>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mobColorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0077" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF0077" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="mobColorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={8} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#666" fontSize={8} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="spend" stroke="#FF0077" fillOpacity={1} fill="url(#mobColorSpend)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Total Spend</span>
              <span className="text-sm font-bold font-mono text-white">$4,281.40</span>
              <span className="text-[8px] text-[#00D4AA] font-bold mt-1">↑ +12% vs LY</span>
            </div>
            <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Avg Calories</span>
              <span className="text-sm font-bold font-mono text-white">2,140 kcal</span>
              <span className="text-[8px] text-red-500 font-bold mt-1">↓ -4% optimal</span>
            </div>
          </div>
        </main>

        {/* Persistent Bottom Bar matching other layouts */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 py-2 flex justify-around items-center">
          <div onClick={() => onNavigate('home')} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
            <span className="material-symbols-outlined text-[20px]">delivery_dining</span>
            <span className="text-[8px] font-medium font-sans">Delivery</span>
          </div>
          <div onClick={() => onNavigate('dineout')} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
            <span className="material-symbols-outlined text-[20px]">restaurant</span>
            <span className="text-[8px] font-medium font-sans">Dining</span>
          </div>
          <div onClick={() => onNavigate('quick')} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
            <span className="material-symbols-outlined text-[20px]">local_mall</span>
            <span className="text-[8px] font-medium font-sans">Groceries</span>
          </div>
          <div onClick={() => onNavigate('agent_chat')} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="text-[8px] font-medium font-sans">AI Agent</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-[#FF0077] cursor-pointer">
            <span className="material-symbols-outlined text-[20px] font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="text-[8px] font-bold font-sans">Profile</span>
          </div>
        </footer>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 pt-2 pb-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span 
              onClick={() => onNavigate('home')}
              className="text-2xl font-extrabold text-[#FF0077] tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
            >
              District
            </span>
            <nav className="hidden md:flex items-center gap-6">
              <span onClick={() => onNavigate('home')} className="text-xs text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors">Market</span>
              <span onClick={() => onNavigate('dineout')} className="text-xs text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors">Network</span>
              <span className="text-xs text-[#FF0077] font-bold cursor-default">Dashboard</span>
              <span onClick={() => onNavigate('agent_chat')} className="text-xs text-gray-400 font-semibold cursor-pointer hover:text-white transition-colors">Vault</span>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end shrink-0">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">VIP Tier</span>
              <span className="text-xs font-bold text-[#00D4AA] font-sans">PLATINUM ELITE</span>
            </div>
            <div className="w-9 h-9 rounded-full border border-[#FF0077]/30 p-0.5 overflow-hidden shrink-0">
              <img 
                className="w-full h-full rounded-full object-cover" 
                alt="Profile Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5u43FbnSbU9YJ8b9qkfFsWDKrUls0yW1EDXv9Ur4zomQ90bcTJd8_pYSwoe4NGIE_3kwm3oWSfbIrVvm3nmG_L2PXI12R9RIccm_5zrXnbNNFO8rNaTxCG6zJrMpbDSdG8q0cHtTIULiJCxZEcntXlJS8VcL4FrOOh07fTOFiZnkD019u6-zvBBb5QTmm1eIlwthHqlL60JU8Bamc-0HY8Ny53gBuTKdUSDA1VEutL_Q2TGuGr8PRcF50_8rloigpWhJcvOcpUvbU"
              />
            </div>
            <button onClick={onBack} className="p-1 rounded-full hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 min-h-screen max-w-[1440px] mx-auto px-8 pb-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* Left Sidebar: Profile & VIP Status */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Metallic VIP Card Render */}
            <div 
              className="rounded-2xl p-6 flex flex-col justify-between h-64 relative border border-white/10 overflow-hidden shadow-2xl group cursor-pointer hover:border-white/20 transition-all duration-300"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #1f122d 0%, #0a0a0f 50%, #0e202d 100%)',
                backgroundSize: 'cover'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 tracking-widest uppercase font-bold">District Membership</span>
                  <h2 className="text-2xl font-extrabold text-white mt-1 italic tracking-tight">VIP PLATINUM</h2>
                </div>
                <span className="material-symbols-outlined text-[#00D4AA] text-[32px] group-hover:scale-110 transition-transform">contactless</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-base text-white/90 tracking-[0.2em]">4429 • 8821 • 0092 • 4040</span>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase font-bold block">Member Since</span>
                    <span className="font-mono text-xs text-white">2021/04</span>
                  </div>
                  <div className="w-12 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/40 italic">DISTRICT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spend Milestones */}
            <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Spend Milestones</h3>
                <span className="font-mono text-[#FF0077] font-semibold text-xs">$12,450.00 / $15k</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF0077] to-[#8F03FF] w-[83%] rounded-full relative">
                  <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-gray-500 uppercase font-bold">Silver</span>
                  <div className="h-1 bg-[#00D4AA] rounded-full opacity-40"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-gray-500 uppercase font-bold">Gold</span>
                  <div className="h-1 bg-[#00D4AA] rounded-full opacity-80"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-[#FF0077] uppercase font-bold">VIP Platinum</span>
                  <div className="h-1 bg-[#FF0077] rounded-full"></div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF0077]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#FF0077] text-base">bolt</span>
                    </div>
                    <span className="text-xs font-semibold text-white">High-Velocity Rewards</span>
                  </div>
                  <span className="font-mono text-xs text-[#00D4AA]">Active</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8F03FF]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#8F03FF] text-base">auto_awesome</span>
                    </div>
                    <span className="text-xs font-semibold text-white">AI Concierge Priority</span>
                  </div>
                  <span className="font-mono text-xs text-[#00D4AA]">Enabled</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content: Analytics Chart */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
              {/* Background ambient glow */}
              <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-[#FF0077]/5 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white">Spend vs. Vitality</h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-md">
                    Cross-analyzing logistics expenditure against biometrics and calorie intake for maximum system optimization.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all">MONTHLY</button>
                  <button className="px-4 py-1.5 rounded-full bg-[#FF0077] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-[#FF0077]/20 hover:opacity-90 active:scale-95 transition-all">WEEKLY</button>
                </div>
              </div>

              {/* Recharts Chart Container */}
              <div className="w-full h-80 min-h-[320px] z-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF0077" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#FF0077" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="spend" 
                      stroke="#FF0077" 
                      fillOpacity={1} 
                      fill="url(#colorSpend)"
                      strokeWidth={3}
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#00D4AA" 
                      fillOpacity={1} 
                      fill="url(#colorCal)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-6 z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Total Spend</span>
                  <span className="text-xl font-bold font-mono text-white">$4,281.40</span>
                  <span className="text-[9px] text-[#00D4AA] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px] block">trending_up</span> +12% vs LY
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Avg Calories</span>
                  <span className="text-xl font-bold font-mono text-white">2,140 kcal</span>
                  <span className="text-[9px] text-[#FF3366] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px] block">trending_down</span> -4% optimal
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Logistics Hubs</span>
                  <span className="text-xl font-bold font-mono text-white">14</span>
                  <span className="text-[9px] text-gray-400 font-semibold">Across 3 Districts</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Efficiency</span>
                  <span className="text-xl font-bold font-mono text-[#00D4AA]">98.2%</span>
                  <span className="text-[9px] text-[#00D4AA] font-bold">PLATINUM LEVEL</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
