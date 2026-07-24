import React from 'react';
import { motion } from 'framer-motion';

const DiscoveryHub = ({
  restaurants = [],
  groceries = [],
  selectedAddress,
  activeTab = 'home',
  setActiveTab = () => {},
  onSelectRestaurant = () => {},
  onAddToCart = () => {},
  onOpenChat = () => {},
  onOpenCheckout = () => {},
  onOpenOps = () => {},
  onOpenProfile = () => {},
  onOpenModule = () => {},
  cart = []
}) => {
  const totalCartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-[#07070B] text-white font-sans selection:bg-[#FF3366] selection:text-white">
      
      {/* Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#FF3366] rounded-full blur-[160px] opacity-10"></div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#6C63FF] rounded-full blur-[160px] opacity-10"></div>
      </div>

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-[#0A0A10]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Search */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">HyperFlow</span>
              <span className="text-xs font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#FF4D6D] font-semibold">
                3.0
              </span>
            </div>

            <div className="hidden md:flex items-center bg-white/[0.04] rounded-full px-4 py-2 border border-white/10 w-80">
              <span className="material-symbols-outlined text-white/40 text-xl mr-2">search</span>
              <input 
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 w-full font-light" 
                placeholder="Search Instamart items, cuisines, slots..." 
                type="text"
              />
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-full border border-white/10">
            {[
              { id: 'home', label: 'Hub', icon: 'grid_view' },
              { id: 'demand_oracle', label: 'Demand', icon: 'shopping_bag' },
              { id: 'eta_truth', label: 'ETA Truth', icon: 'schedule' },
              { id: 'refund_oracle', label: 'Refund', icon: 'verified_user' },
              { id: 'dineout_sniper', label: 'Dineout', icon: 'restaurant' },
              { id: 'dispatch_map', label: 'Dispatch', icon: 'local_shipping' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onOpenModule(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#FF3366] to-[#FF4D6D] text-white font-semibold shadow-md shadow-[#FF3366]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* User Controls & Location */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] rounded-full border border-white/10 text-xs text-white/80">
              <span className="material-symbols-outlined text-[#FF4D6D] text-sm">location_on</span>
              <span className="truncate max-w-[150px]">{selectedAddress?.tag || 'Patia, Bhubaneswar'}</span>
            </div>

            <button
              onClick={onOpenOps}
              className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#FF4D6D]">admin_panel_settings</span>
              <span>Ops Control</span>
            </button>

            <button
              onClick={onOpenChat}
              className="p-2 rounded-full bg-[#FF3366]/15 border border-[#FF3366]/30 text-[#FF4D6D] hover:bg-[#FF3366]/25 transition-all cursor-pointer relative"
              title="AI Commerce Agent"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span className="w-2 h-2 rounded-full bg-[#FF3366] absolute top-1 right-1 animate-ping"></span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Editorial Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full mb-10 rounded-3xl p-8 bg-[#101018]/90 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3366]/10 border border-[#FF3366]/30">
              <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#FF4D6D] uppercase">
                HYPERFLOW 4.0 ACTIVE OPERATING SYSTEM
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
              Boutique Operations. <br />
              <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#FF758F]">
                Simplified.
              </span>
            </h1>

            <p className="text-sm text-[#9A9AB0] font-light">
              Live Swiggy MCP Passthrough · OpenMeteo Weather Telemetry · Tobit MLE Stockout Predictions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenModule('demand_oracle')}
              className="px-6 py-3 bg-gradient-to-r from-[#FF3366] to-[#FF4D6D] text-white rounded-full font-semibold text-xs shadow-lg shadow-[#FF3366]/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Demand Oracle</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              onClick={() => onOpenModule('eta_truth')}
              className="px-6 py-3 bg-white/[0.05] border border-white/15 text-white rounded-full font-semibold text-xs hover:bg-white/[0.1] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[#FF4D6D]">✦</span>
              <span>Launch ETA Truth</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Modules Quick Bar (5 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {[
            { id: 'demand_oracle', title: 'Demand Oracle', desc: 'Instamart Stockout Risk', icon: 'shopping_bag', color: '#FF3366' },
            { id: 'eta_truth', title: 'ETA Truth', desc: 'Live WebSocket Smoother', icon: 'schedule', color: '#00D4AA' },
            { id: 'refund_oracle', title: 'Refund Oracle', desc: 'FraudGuard Triage', icon: 'verified_user', color: '#6C63FF' },
            { id: 'dineout_sniper', title: 'Dineout Sniper', desc: 'Slot Fill Time Scorer', icon: 'restaurant', color: '#FFB800' },
            { id: 'dispatch_map', title: 'Dispatch Map', desc: 'Route Batch Optimizer', icon: 'local_shipping', color: '#00D4FF' }
          ].map((mod) => (
            <div
              key={mod.id}
              onClick={() => onOpenModule(mod.id)}
              className="bg-[#101018]/80 border border-white/10 hover:border-[#FF3366]/50 rounded-2xl p-5 backdrop-blur-xl transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 group-hover:bg-[#FF3366]/15 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl transition-colors" style={{ color: mod.color }}>
                  {mod.icon}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#FF4D6D] transition-colors">{mod.title}</h4>
                <p className="text-[11px] text-white/50 font-light mt-0.5">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Restaurants / Items Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Curated Merchants & Products</h2>
              <p className="text-xs text-white/50 font-light">Real-time availability synced with Swiggy MCP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(restaurants && restaurants.length > 0 ? restaurants : [
              { id: 'rest_01', name: 'Behrouz Biryani', cuisine: 'Royal North Indian · Biryani', rating: 4.8, distance: '1.8 km', time: '22 min', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3O6h3kN5v2ZfZDd3Ufds1_PUUHBmlla4WShhsUOwN1BiWVty9aGs9k-ujSiY3HWg0c-a6yUVCpufZJTK3hqLopqOy-INM9HYG-SKcVE0PbA__mUudSLa2FZF4yeu1q6fwxpjVZXn7yNLyelP_KZmven-uKjmR8Q3bG2PkZi64JiSya_N0Zb1Ww0kf3A7LW34llf4b4dpiTff9GbejYkJFooJR4Slc4fs85sLnGz-kZjWnuFABxdtocK8oviRGW5vmkB6XF1IMU4YS' },
              { id: 'rest_02', name: 'Yoko Ono Gourmet Sushi', cuisine: 'Modern Japanese · Fresh Sashimi', rating: 4.9, distance: '2.4 km', time: '18 min', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6' },
              { id: 'rest_03', name: 'Carbon Grill Artisanal Burgers', cuisine: 'Gourmet Burgers · Craft Drinks', rating: 4.7, distance: '3.1 km', time: '25 min', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV' }
            ]).map((r) => (
              <div 
                key={r.id} 
                onClick={() => onSelectRestaurant(r)}
                className="bg-[#101018]/90 border border-white/10 rounded-3xl overflow-hidden hover:border-[#FF3366]/40 transition-all cursor-pointer group shadow-xl"
              >
                <div className="h-44 relative overflow-hidden bg-white/5">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400 border border-white/10 flex items-center gap-1">
                    <span>★</span>
                    <span>{r.rating}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#FF4D6D] transition-colors">{r.name}</h3>
                  <p className="text-xs text-white/50 font-light">{r.cuisine}</p>

                  <div className="pt-3 flex items-center justify-between border-t border-white/10 text-xs font-mono">
                    <span className="text-[#FF4D6D] font-bold">{r.time}</span>
                    <span className="text-white/40">{r.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Floating Action Button: Cart Trigger */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={onOpenCheckout}
            className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#FF3366] to-[#FF4D6D] text-white rounded-full font-bold text-xs shadow-2xl shadow-[#FF3366]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            <span className="uppercase tracking-widest">Cart • {totalCartCount} Items</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default DiscoveryHub;
