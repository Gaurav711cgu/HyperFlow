import React, { useState, useEffect } from 'react';

export default function DiscoveryHub({ restaurants = [], groceries = [], selectedAddress, activeTab, setActiveTab, onSelectRestaurant, onAddToCart, onOpenChat, onOpenCheckout, onOpenOps, onOpenProfile, cart = [] }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredRestaurants = restaurants.filter(r => {
    const matchesCuisine = !selectedCuisine || r.cuisine === selectedCuisine;
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  const cartTotalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (discovery_hub) ─── */
    return (
      <div className="relative bg-[#000] min-h-screen text-[#e5e1e6] select-none font-sans overflow-y-auto pb-24">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col gap-3">
            {/* Location & Profile */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[#FF0077]">location_on</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">Home</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate max-w-[200px]">Plot LP 60, Prasanti Vihar, Patia, Bhubaneswar</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => onOpenOps && onOpenOps()} 
                  className="p-1.5 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 text-[#00D4AA] active:scale-95 transition-transform"
                  title="Ops Desk"
                >
                  <span className="material-symbols-outlined text-[18px] block">analytics</span>
                </button>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="User Avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0Uznd5BrEakyqV03TSlFHCHXw_TTR9NoiZrjWMX83oPzfPL86grMqD13aKT0QDWtFtRURT0zxK0U5PGph0YE-85gH0kYqPFNrxkJIVv-A-5FLYfmnTzXRUmurQzKSzdHPdwjaAcqq98ciPnMiyXrRP9vtJhGxu3_5vDomtUxqdJ03ATOOMMFCXPpnh4C90ZilJDpgsImzdQdVL2Adtcs8rV177FsVEfoveZebaPCjJOWo3BNAj7ReXUAukbuMudxED_8wA4AHUbhC"
                  />
                </div>
              </div>
            </div>
            {/* Search Input */}
            <div className="relative bg-white/5 rounded-xl h-11 flex items-center px-3 border border-white/5 focus-within:border-[#FF0077] transition-all">
              <span className="material-symbols-outlined text-gray-500 mr-2 text-[20px]">search</span>
              <input 
                className="bg-transparent border-none w-full text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-0 h-full" 
                placeholder="Search foods, cuisines..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="border-l border-white/10 pl-2 ml-2 flex items-center">
                <span className="material-symbols-outlined text-[#FF0077] text-[18px]">mic</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="pt-32 px-4 flex flex-col gap-6">
          {/* Tab Selector */}
          <div className="relative bg-white/5 rounded-full p-0.5 flex justify-between items-center border border-white/5 h-10 w-full">
            <button 
              onClick={() => setActiveTab('home')}
              className={`relative z-10 flex-1 text-center text-xs font-semibold py-1.5 rounded-full transition-all ${
                activeTab === 'home' ? 'bg-[#14141F] border border-white/5 text-[#FF0077]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Delivery
            </button>
            <button 
              onClick={() => setActiveTab('dineout')}
              className="relative z-10 flex-1 text-center text-xs font-semibold py-1.5 rounded-full text-gray-400 hover:text-white transition-all"
            >
              Dine-in
            </button>
            <button 
              onClick={() => setActiveTab('quick')}
              className="relative z-10 flex-1 text-center text-xs font-semibold py-1.5 rounded-full text-gray-400 hover:text-white transition-all"
            >
              Groceries
            </button>
          </div>

          {/* Gamified Streak Card */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white">Order 3 times to get Rs 100 cashback</span>
                <span className="text-[10px] text-gray-400">Complete your streak today!</span>
              </div>
              <div className="bg-white/5 rounded-full p-1.5 border border-white/5">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">local_fire_department</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-8 h-8 rounded-full border-2 border-[#00E676] flex items-center justify-center bg-[#00E676]/20">
                  <span className="material-symbols-outlined text-[#00E676] text-[14px]">check</span>
                </div>
              </div>
              <div className="h-[2px] flex-1 bg-white/5 relative">
                <div className="absolute left-0 top-0 h-full w-1/2 bg-[#00E676]/50"></div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5">
                  <span className="text-xs font-mono text-gray-400">2</span>
                </div>
              </div>
              <div className="h-[2px] flex-1 bg-white/5"></div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5">
                  <span className="text-xs font-mono text-gray-400">3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Usual Strip (1-Tap Reorder) */}
          {restaurants.length > 0 && (
            <div 
              onClick={() => onSelectRestaurant(restaurants[0])}
              className="bg-gradient-to-r from-[#FF0077]/10 to-[#8F00FF]/10 border border-white/5 rounded-2xl p-4 flex flex-row items-center gap-3 relative overflow-hidden cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <img 
                  alt="Biryani" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5CheHwb8sioaAeAvp3l0AB6QATvndcTkqxZkN1AonTgWhN3joVjbb-3hK7t1Ql-cahz-DULgYM12XnK9hp63UKnQtN0ucl-v46abYTOlLn2lflDBEZ7hX93afqgO0TABZBuBwaV2fiZl_SYHyQ7-I1cjaNwzMDo1kopEcdN9pDavwBS-TKiHimUfBZP7T5TEva1p0OkBSQGPR-T8NxMJvu8WaZsYaNfB7zeJenmuUaqYPmysuRNhIP2AtQ6_3zfROGW-kZW9Qcy9M"
                />
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <span className="text-[8px] text-[#FF0077] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">history</span> 1-Tap Reorder
                </span>
                <span className="text-xs font-bold text-white truncate">Dum Gosht Biryani</span>
                <span className="text-[10px] text-gray-400 truncate">{restaurants[0].name}</span>
                <div className="flex gap-2 mt-1">
                  <span className="bg-[#0A0A0F] px-1.5 py-0.5 rounded text-[8px] font-mono text-[#8F00FF] border border-white/5">36g Protein</span>
                  <span className="bg-[#0A0A0F] px-1.5 py-0.5 rounded text-[8px] font-mono text-white border border-white/5">Rs 349</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart({
                    id: 'usual-biryani',
                    name: 'Dum Gosht Biryani',
                    price: 349,
                    restaurantName: restaurants[0].name,
                    restaurantId: restaurants[0].id
                  });
                }}
                className="bg-[#FF0077] text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-lg active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </button>
            </div>
          )}

          {/* Categories Bento Grid */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Explore Categories</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div 
                onClick={() => setSelectedCuisine(selectedCuisine === 'Biryani' ? null : 'Biryani')}
                className={`flex flex-col items-center gap-1.5 group cursor-pointer`}
              >
                <div className={`w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center border transition-all ${
                  selectedCuisine === 'Biryani' ? 'border-[#FF0077] bg-[#FF0077]/10' : 'border-white/5'
                }`}>
                  <img src="/buttons/Frame (11).svg" alt="Biryani" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-white text-center leading-tight font-sans">Biryani</span>
              </div>
              <div 
                onClick={() => setSelectedCuisine(selectedCuisine === 'Pizzas' ? null : 'Pizzas')}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className={`w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center border transition-all ${
                  selectedCuisine === 'Pizzas' ? 'border-[#FFB300] bg-[#FFB300]/10' : 'border-white/5'
                }`}>
                  <img src="/buttons/Frame (10).svg" alt="Pizzas" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-white text-center leading-tight font-sans">Pizzas</span>
              </div>
              <div 
                onClick={() => setSelectedCuisine(selectedCuisine === 'Healthy' ? null : 'Healthy')}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className={`w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center border transition-all ${
                  selectedCuisine === 'Healthy' ? 'border-[#00E676] bg-[#00E676]/10' : 'border-white/5'
                }`}>
                  <img src="/buttons/Frame (3).svg" alt="Healthy" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-white text-center leading-tight font-sans">Healthy</span>
              </div>
              <div 
                onClick={() => setActiveTab('quick')}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-white/20 transition-all">
                  <img src="/buttons/Frame (8).svg" alt="Groceries" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-white text-center leading-tight font-sans">Groceries</span>
              </div>
              <div 
                onClick={() => setActiveTab('dineout')}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 hover:border-white/20 transition-all">
                  <img src="/buttons/Frame (6).svg" alt="Dineout" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-white text-center leading-tight font-sans">Dineout</span>
              </div>
            </div>
          </div>

          {/* Curated Feed */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Curated for You</h2>
              <span className="material-symbols-outlined text-gray-400 text-[18px] cursor-pointer">tune</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredRestaurants.map(rest => (
                <div 
                  key={rest.id}
                  onClick={() => onSelectRestaurant(rest)}
                  className="bg-white/5 rounded-2xl overflow-hidden flex flex-col group cursor-pointer relative border border-white/5 hover:border-[#FF0077]/40 transition-all"
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    <img 
                      alt={rest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={rest.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-[#0A0A0F]/80 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/5 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-amber-400 text-[10px] fill-current">star</span>
                      <span className="text-[8px] font-mono text-white">{rest.rating || '4.0'}</span>
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className="bg-[#14141F]/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono text-white border border-white/5">
                        {rest.deliveryTime || '25 min'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white truncate">{rest.name}</span>
                    <span className="text-[9px] text-gray-400 truncate">{rest.cuisine || 'North Indian'}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]"></span>
                      <span className="text-[8px] font-mono text-[#00E676]">SLA: {rest.sla || '97%'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Persistent Bottom Bar matching other layouts */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 py-2 flex justify-around items-center">
          <div onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'home' ? 'text-[#FF0077]' : 'text-gray-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>delivery_dining</span>
            <span className="text-[8px] font-medium font-sans">Delivery</span>
          </div>
          <div onClick={() => setActiveTab('dineout')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'dineout' ? 'text-[#FFB300]' : 'text-gray-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'dineout' ? "'FILL' 1" : "'FILL' 0" }}>restaurant</span>
            <span className="text-[8px] font-medium font-sans">Dining</span>
          </div>
          <div onClick={() => setActiveTab('quick')} className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'quick' ? 'text-[#00D4AA]' : 'text-gray-400 hover:text-white'}`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'quick' ? "'FILL' 1" : "'FILL' 0" }}>local_mall</span>
            <span className="text-[8px] font-medium font-sans">Groceries</span>
          </div>
          <div onClick={() => onOpenChat && onOpenChat()} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="text-[8px] font-medium font-sans">AI Agent</span>
          </div>
          <div onClick={() => onOpenProfile && onOpenProfile()} className="flex flex-col items-center gap-0.5 text-gray-400 cursor-pointer hover:text-white">
                <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-[8px] font-medium font-sans">Profile</span>
          </div>
        </footer>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (discovery_hub_desktop) ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 pt-2 pb-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <span 
              onClick={() => setActiveTab('home')}
              className="text-2xl font-extrabold text-[#FF0077] tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
            >
              HyperFlow
            </span>
            <div className="hidden md:flex items-center bg-[#131316] rounded-full px-4 py-1.5 border border-white/5 min-w-[400px]">
              <span className="material-symbols-outlined text-gray-500 text-[20px] mr-2">search</span>
              <input 
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-600 w-full focus:ring-0" 
                placeholder="Search curated merchants or delivery slots..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 px-3 py-1 bg-[#14141F] rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#FF0077] text-[18px]">location_on</span>
              <span className="text-xs font-semibold text-white">Patia, Bhubaneswar</span>
            </div>
            <button 
              onClick={() => onOpenOps && onOpenOps()} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 border border-[#6C63FF]/40 text-[#00D4AA] rounded-full text-xs font-bold tracking-tight shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              Ops Dashboard
            </button>
            <div 
              onClick={() => onOpenProfile && onOpenProfile()} 
              className="w-9 h-9 rounded-full border border-[#FF0077]/30 p-0.5 overflow-hidden shrink-0 cursor-pointer hover:border-[#FF0077] transition-colors"
            >
              <img 
                className="w-full h-full rounded-full object-cover" 
                alt="Profile Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkjIe7ftPr73AcnjOzX3-ui0Xbbho54xtdD5czbkz7DJ2mdigOasrDeMoDVaBjZSUFeCN0EAflCDpLXBD1NbzOvWFeB8YOQ9WGS0cnpYXWqc0urY7eRW76ES7_0Kla9qSWeTeKWvN-_g4r-xs7rFgIWOnskumKT1XW2XAuPWrFb5gaEsQDqj6mMVNQ4wZWCXFqRXTZSjMjOFa2xa8ph73fqXxyOKRPJ625oY-g_YuSygzfG0o6Vfy2GRwkO-e11nJSvyGZcjfHpsGS"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 min-h-screen max-w-[1440px] mx-auto px-8 pb-8 w-full">
        <div className="grid grid-cols-[240px_1fr_320px] gap-6 w-full">
          
          {/* Left Sidebar */}
          <aside className="flex flex-col gap-6 pr-2">
            <nav className="flex flex-col gap-1.5">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'home' ? 'bg-[#FF0077]/10 text-white font-bold border-l-4 border-[#FF0077]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">delivery_dining</span>
                <span className="text-xs">Delivery</span>
              </button>
              <button 
                onClick={() => setActiveTab('dineout')}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'dineout' ? 'bg-[#FFB300]/10 text-white font-bold border-l-4 border-[#FFB300]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
                <span className="text-xs">Dining</span>
              </button>
              <button 
                onClick={() => setActiveTab('quick')}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'quick' ? 'bg-[#00E676]/10 text-white font-bold border-l-4 border-[#00E676]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">local_mall</span>
                <span className="text-xs">Groceries</span>
              </button>
              <button 
                onClick={() => onOpenChat && onOpenChat()}
                className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <span className="absolute top-2.5 right-4 w-1.5 h-1.5 bg-[#FF0077] rounded-full animate-pulse"></span>
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                <span className="text-xs">AI Agent</span>
              </button>
            </nav>

            {/* Categories Circle Grid */}
            <div className="mt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 px-2">Categories</p>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {[
                  { name: 'Instant', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&q=80', cuisine: 'Fast Food' },
                  { name: 'Premium', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&q=80', cuisine: 'Premium' },
                  { name: 'Healthy', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&q=80', cuisine: 'Healthy' },
                  { name: 'Elite', img: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=100&q=80', cuisine: 'Continental' },
                  { name: 'Alcohol', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&q=80', cuisine: 'Beverages' },
                  { name: 'Pharmacy', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80', cuisine: 'Wellness' },
                  { name: 'Pet Care', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&q=80', cuisine: 'Pets' },
                  { name: 'Flower Delivery', img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=100&q=80', cuisine: 'Gifts' },
                  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80', cuisine: 'Gadgets' },
                ].map((cat) => (
                  <div 
                    key={cat.name}
                    onClick={() => setSelectedCuisine(selectedCuisine === cat.cuisine ? null : cat.cuisine)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-full overflow-hidden border transition-all ${
                      selectedCuisine === cat.cuisine ? 'border-[#FF0077] ring-2 ring-[#FF0077]/30 scale-105' : 'border-white/10 hover:border-white/30'
                    }`}>
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-white text-center leading-tight font-sans mt-1.5 truncate w-full px-1">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platinum Status Mini */}
            <div className="mt-auto bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
              <p className="text-[9px] font-bold text-gray-500 mb-1">PLATINUM STATUS</p>
              <h4 className="text-xs font-bold text-[#FF0077] mb-3">Elite Member</h4>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FF0077] h-full w-[80%] shadow-[0_0_10px_rgba(255,0,119,0.5)]"></div>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 font-mono">240 points until VIP Platinum</p>
            </div>
          </aside>

          {/* Center Panel */}
          <section className="flex flex-col gap-6 pr-1">
            {/* Streak Hero Card */}
            <div className="relative w-full h-44 rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A0A0F] to-[#14141F] border border-white/5 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#FF0077] text-[24px] animate-pulse">local_fire_department</span>
                <span className="font-mono text-xs text-[#FF0077] font-bold tracking-tighter">12 DAY STREAK</span>
              </div>
              <h2 className="text-lg font-bold text-white max-w-sm mb-4 leading-tight">Keep the fire burning, HyperFlow Elite.</h2>
              <button className="px-6 py-2 bg-[#FF0077] text-white font-bold rounded-full text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all w-fit">
                CLAIM DAILY REWARD
              </button>
            </div>

            {/* Featured Merchants Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Featured Merchants</h3>
                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
              
              {/* Top Featured Horizontal Banner (Behrouz Biryani style) */}
              <div 
                onClick={() => restaurants.length > 0 && onSelectRestaurant(restaurants[0])}
                className="w-full bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-[#FF0077]/40 transition-all duration-300 mb-6"
              >
                <div className="h-56 relative w-full">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Behrouz Biryani"
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80"
                  />
                  <div className="absolute top-4 right-4 bg-[#040406]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[#FF0077] text-[14px] fill-current">star</span>
                    <span className="text-[10px] font-mono font-bold text-white">4.8</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-[#FF0077] text-white px-3 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest">
                    Premium Partner
                  </div>
                </div>
                <div className="p-5 flex justify-between items-end">
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-base font-extrabold text-white">Behrouz Biryani</h4>
                    <p className="text-[11px] text-gray-400">Royal Recipes • North Indian • Elite Packaging</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-[#FF0077]/10 border border-[#FF0077]/20 text-[#FF0077] rounded text-[9px] font-bold font-mono">SSS</span>
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded text-[9px] font-bold">District Curated</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-[#FF0077] font-bold block">22 MIN DELIVERY WINDOW</span>
                  </div>
                </div>
              </div>

              {/* Smaller Cards Feed */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Yoko Ono Sushi', cuisine: 'Modern Japanoce', time: '18 min', rating: '4.7', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80' },
                  { name: 'Carbon Grill', cuisine: 'Artisanal Burgers', time: '25 min', rating: '4.6', img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => restaurants.length > idx && onSelectRestaurant(restaurants[idx])}
                    className="bg-[#0A0A0F] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300"
                  >
                    <div className="h-32 relative">
                      <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-warning text-[10px] fill-current">star</span>
                        <span className="text-[9px] font-mono font-bold text-white">{item.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.cuisine} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Your Usual Section */}
            <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">Your Usual</h4>
                <span className="material-symbols-outlined text-[#FF0077] cursor-pointer hover:rotate-180 transition-transform duration-500 text-[18px]">autorenew</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'Nitro Cold Brew', sub: 'Starbucks Reserve', img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80', icon: 'local_cafe' },
                  { name: 'Truffle Burger', sub: 'Carbon Grill', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', icon: 'lunch_dining' },
                  { name: 'Kale Caesar', sub: 'Sweetgreen', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', icon: 'eco' }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-[#131316] flex items-center justify-between group border border-transparent hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[9px] text-gray-500">{item.sub}</p>
                      </div>
                    </div>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart({
                          id: `usual-${idx}`,
                          name: item.name,
                          price: idx === 0 ? 249 : idx === 1 ? 349 : 299,
                          restaurantName: item.sub,
                          restaurantId: String(idx + 1)
                        });
                      }}
                      className="material-symbols-outlined text-gray-500 group-hover:text-[#FF0077] cursor-pointer transition-colors text-[20px]"
                    >
                      add_circle
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agent Banner */}
            <div className="bg-gradient-to-br from-[#0A0A0F] to-[#14141F] border border-white/5 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white font-mono">District Intelligence</h4>
              </div>
              <p className="text-[11px] text-gray-400 italic">"Your order is currently 4 minutes away. Shall I pre-heat your smart oven?"</p>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-1.5 bg-[#8F00FF]/15 border border-[#8F00FF]/25 text-[#8F00FF] rounded-lg text-[9px] font-bold hover:bg-[#8F00FF]/25 transition-all">YES, PLEASE</button>
                <button className="flex-1 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-[9px] font-bold hover:bg-white/10 transition-all">DISMISS</button>
              </div>
            </div>

            {/* Promo Card and Cart Button */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FF0077]/10 to-[#8F00FF]/10 border border-[#FF0077]/20 flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#FF0077] flex items-center justify-center shrink-0 shadow-lg">
                  <span className="material-symbols-outlined text-white">card_giftcard</span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Unlock VIPN</h5>
                  <p className="text-[9px] text-gray-500 leading-tight">Assocs to your Business<br/>NTC chelenyexlon</p>
                </div>
              </div>

              {/* Pink Cart Button */}
              <button 
                onClick={() => onOpenCheckout && onOpenCheckout()}
                className="w-full py-3.5 bg-[#FF0077] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-[#FF0077]/25"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                <span className="text-xs uppercase tracking-wider font-extrabold">CART • {cartTotalItems > 0 ? `${cartTotalItems} ITEMS` : 'EMPTY'}</span>
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
