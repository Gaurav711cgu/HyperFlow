import React, { useState } from 'react';

export default function MerchantStockAdmin({ onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [autoReplenish, setAutoReplenish] = useState(true);
  const [strictAllocation, setStrictAllocation] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [threshold, setThreshold] = useState(15);

  const initialMerchants = [
    { id: '089', name: 'Nexus Corp Ltd.', status: 'ACTIVE', volume: '124.5K USD' },
    { id: '090', name: 'CyberDyne Systems', status: 'ACTIVE', volume: '89.2K USD' },
    { id: '091', name: 'Tyrell Gen.', status: 'REVOKED', volume: '0.00 USD' },
    { id: '092', name: 'Weyland-Yutani', status: 'ACTIVE', volume: '512.8K USD' },
    { id: '093', name: 'Oscorp Industries', status: 'ACTIVE', volume: '221.4K USD' },
    { id: '094', name: 'Umber Umbrella Co.', status: 'REVOKED', volume: '0.00 USD' }
  ];

  const filteredMerchants = initialMerchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.includes(searchTerm)
  );

  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#E5E5E5] font-sans antialiased flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0C0C0C] border-b md:border-b-0 md:border-r border-[#222222] flex flex-col shrink-0">
        {/* Brand Logo Area */}
        <div className="h-16 border-b border-[#222222] flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-[#00FF9D]"></div>
            <span className="font-mono text-sm font-bold tracking-widest text-white">HYPERFLOW</span>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden text-xs font-mono text-[#888888] hover:text-white px-2 py-1 border border-[#222222] hover:bg-[#222222] transition-colors"
            >
              BACK
            </button>
          )}
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm font-mono text-white bg-[#222222] relative">
                <span className="w-5 h-5 mr-3 border border-[#E5E5E5] flex items-center justify-center text-[10px] text-white">01</span>
                MERCHANT & STOCK
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm font-mono text-[#888888] hover:text-white hover:bg-[#222222] transition-colors">
                <span className="w-5 h-5 mr-3 border border-current flex items-center justify-center text-[10px]">02</span>
                TRANSACTIONS
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-6 py-2 text-sm font-mono text-[#888888] hover:text-[#E5E5E5] hover:bg-[#222222] transition-colors">
                <span className="w-5 h-5 mr-3 border border-current flex items-center justify-center text-[10px]">03</span>
                SYSTEM CONFIG
              </a>
            </li>
          </ul>
        </nav>
        {/* User Profile Minimal */}
        <div className="p-6 border-t border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black border border-[#222222] flex items-center justify-center text-xs font-mono text-white">AD</div>
            <div>
              <div className="text-xs font-mono text-white">ADMIN_ROOT</div>
              <div className="text-[10px] font-mono text-[#00FF9D]">ONLINE</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        {/* Header */}
        <header className="h-16 border-b border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 bg-[#0C0C0C]/50 backdrop-blur-sm shrink-0 py-2 sm:py-0 gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <h1 className="text-sm sm:text-base font-mono font-medium tracking-wide">MERCHANT & STOCK ADMIN</h1>
            <span className="px-2 py-0.5 border border-[#222222] text-[9px] font-mono text-[#888888] bg-black">ENV: PROD</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {onBack && (
              <button 
                onClick={onBack}
                className="hidden md:inline-flex px-3 py-1.5 text-xs font-mono border border-[#222222] hover:bg-[#222222] text-white transition-colors"
              >
                ← BACK
              </button>
            )}
            <input 
              className="bg-black border border-[#222222] text-white px-3 py-1.5 text-xs font-mono placeholder-[#888888] focus:border-white focus:outline-none w-44 sm:w-60" 
              placeholder="SEARCH ID OR NAME..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Merchant List Section */}
            <section className="xl:col-span-2 flex flex-col gap-4">
              <header className="flex justify-between items-end border-b border-[#222222] pb-2">
                <h2 className="text-xs font-mono text-[#888888] tracking-widest">MERCHANT DIRECTORY</h2>
                <div className="text-xs font-mono text-[#888888]">TOTAL: {filteredMerchants.length}</div>
              </header>
              <div className="border border-[#222222] bg-[#0C0C0C] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr class="border-b border-[#222222] bg-black">
                      <th class="p-3 text-xs font-mono text-[#888888] font-normal uppercase border-r border-[#222222] w-16">ID</th>
                      <th class="p-3 text-xs font-mono text-[#888888] font-normal uppercase border-r border-[#222222]">Entity Name</th>
                      <th class="p-3 text-xs font-mono text-[#888888] font-normal uppercase border-r border-[#222222]">API Status</th>
                      <th class="p-3 text-xs font-mono text-[#888888] font-normal uppercase border-r border-[#222222]">Volume (24H)</th>
                      <th class="p-3 text-xs font-mono text-[#888888] font-normal uppercase w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {filteredMerchants.map(m => (
                      <tr key={m.id} className="border-b border-[#222222] hover:bg-[#222222]/30 transition-colors">
                        <td className="p-3 border-r border-[#222222] text-[#888888]">{m.id}</td>
                        <td className="p-3 border-r border-[#222222] text-white font-semibold">{m.name}</td>
                        <td className="p-3 border-r border-[#222222]">
                          <span className={`inline-flex items-center gap-1.5 ${m.status === 'REVOKED' ? 'text-[#FF3366]' : 'text-[#00FF9D]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-none ${m.status === 'REVOKED' ? 'bg-[#FF3366]' : 'bg-[#00FF9D]'}`}></span>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 border-r border-[#222222] text-[#E5E5E5]">{m.volume}</td>
                        <td className="p-3">
                          <button className="text-xs text-[#888888] hover:text-white transition-colors">MANAGE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Stock Control Sidebar */}
            <section className="xl:col-span-1 flex flex-col gap-6">
              <header className="flex justify-between items-end border-b border-[#222222] pb-2">
                <h2 className="text-xs font-mono text-[#888888] tracking-widest">GLOBAL STOCK CONTROLS</h2>
              </header>
              <div className="border border-[#222222] bg-[#0C0C0C] p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#888888]">SYSTEM STATUS</span>
                  <span className="px-2 py-0.5 bg-black border border-[#222222] text-[#00FF9D] text-xs font-mono">NOMINAL</span>
                </div>
                <hr className="border-[#222222]" />
                
                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-white font-semibold">AUTO-REPLENISH</div>
                      <div className="text-[10px] font-mono text-[#888888] mt-0.5">Automatically order depleted SKUs</div>
                    </div>
                    <button 
                      onClick={() => setAutoReplenish(!autoReplenish)}
                      className={`w-9 h-5 rounded-full relative flex items-center px-0.5 transition-colors border ${
                        autoReplenish ? 'bg-[#00FF9D] border-[#00FF9D]' : 'bg-black border-[#222222]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${autoReplenish ? 'translate-x-4 bg-black' : 'translate-x-0 bg-[#888888]'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-white font-semibold">STRICT ALLOCATION</div>
                      <div className="text-[10px] font-mono text-[#888888] mt-0.5">Prevent overselling global inventory</div>
                    </div>
                    <button 
                      onClick={() => setStrictAllocation(!strictAllocation)}
                      className={`w-9 h-5 rounded-full relative flex items-center px-0.5 transition-colors border ${
                        strictAllocation ? 'bg-[#00FF9D] border-[#00FF9D]' : 'bg-black border-[#222222]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${strictAllocation ? 'translate-x-4 bg-black' : 'translate-x-0 bg-[#888888]'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-[#FF3366] font-semibold">MAINTENANCE MODE</div>
                      <div className="text-[10px] font-mono text-[#888888] mt-0.5">Halt all new stock assignments</div>
                    </div>
                    <button 
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-9 h-5 rounded-full relative flex items-center px-0.5 transition-colors border ${
                        maintenanceMode ? 'bg-[#FF3366] border-[#FF3366]' : 'bg-black border-[#222222]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full transition-transform ${maintenanceMode ? 'translate-x-4 bg-black' : 'translate-x-0 bg-[#888888]'}`}></div>
                    </button>
                  </div>
                </div>

                <hr className="border-[#222222]" />

                {/* Critical Threshold */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-mono text-[#888888]">CRITICAL STOCK THRESHOLD (%)</label>
                  <div className="flex gap-2">
                    <input 
                      className="bg-black border border-[#222222] text-white px-3 py-1.5 text-xs font-mono focus:border-white focus:outline-none flex-1" 
                      type="number" 
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                    />
                    <button className="px-3 py-1 bg-[#222222] border border-[#222222] hover:bg-[#333] hover:border-[#333] text-xs font-mono font-bold transition-colors">SET</button>
                  </div>
                </div>

                <button className="w-full py-2 bg-transparent border border-[#FF3366] text-[#FF3366] hover:bg-[#FF3366] hover:text-black text-xs font-mono font-bold transition-all uppercase tracking-wide">
                  FORCE SYNC ALL
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
