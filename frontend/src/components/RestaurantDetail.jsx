import React, { useState, useEffect } from 'react';
import * as API from '../api';

export default function RestaurantDetail({ restaurant, onBack, onAddToCart, cart = [], onCheckout }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock menu items dynamically adapted to the restaurant or default list
  const defaultMenu = [
    {
      id: 'item-1',
      name: 'Dum Gosht Biryani (Boneless)',
      price: 349,
      rating: '4.6',
      cuisine: 'Mughlai, Biryani',
      desc: 'Succulent pieces of boneless lamb, marinated in secret Persian spices, slow-cooked with long grain basmati rice.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy8Ulq_axTRp6t2EagRb5G-YtqpRnvPzPmyNLG-1FBJ0_p-83Hb7anlB2ZhXsi9Yd0x4n4HVmWhRYJ4r1J0aeYhAKyBpAHs5R59gryk1trq626wW1LuUFZ7SkM8OvhMdS78RXzvNqpn-E03C047MfVamHP-NIetglvLA2A5zzJjsUUJ8KlWdV_E4DdUow8sK7YValAPmnwch_EcyAii9s8yhA-yi925HvzzqKBSoWyYDzGpNFU46e2dbF68cDx_CA1jI2gcAKBGs_E',
      isVeg: false,
      isBestSeller: true
    },
    {
      id: 'item-2',
      name: 'Zaikedaar Paneer Biryani',
      price: 249,
      rating: '4.2',
      cuisine: 'Veg, Biryani',
      desc: 'Fresh cottage cheese cubes marinated in Persian spices, layered with rice. A vegetarian masterpiece.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnZO-SRXZaq8sEx-tCE5dp1XMUjEgXYU-qH6jmvb1R9yuD8CJgZOt8cLeisKDYrRZxNq-6e0z_S5LC-cK76ackRSYsOr5XtmM8YTo2X78jv-C4RuzBUhbj88A3m6fvt5IBoTR-C2yNoYSPKCwe2GHCQsOFNCj1uYFnMPGqnB3_aKqVmNHL7_uUZddTeyhUk0S4HOCY2q8o7INBf1BrsDdkRF4WejofkTVYm1PkkwQQ2vbZ1gDisIQajmcQGz6m4KaWunxNeVB_10FK',
      isVeg: true,
      isBestSeller: false
    },
    {
      id: 'item-3',
      name: 'Shahi Paneer',
      price: 249,
      rating: '4.2',
      cuisine: 'Veg, Gravy',
      desc: 'Cottage cheese cubes in a rich, creamy tomato and cashew gravy, finished with kasuri methi.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpHpuTXfOIGAtIK3Pga8n2A8dm8uJp9Vwyg_FsTJB99mEKnuo3It_upL6owTnMkfqpwdgtsesxklNSPMVyor9F7NEYKbCXZs-w2_l8mHvTIoVS-MbxH0zMVuU4XmKa_xobWm529AAcaKXeeGeHQRinxK5IpxrCt7ou_1XYAuTCSOOh4Yzcyw_UFKu_RGyzjrPY2MksLDX6tGvP3iMfiq__--aQ6us8wr-56e5qmUceVRQ1M0NTZJlb2f3_XJcRtErKUw-n6Bp_aJDB',
      isVeg: true,
      isBestSeller: false
    },
    {
      id: 'item-4',
      name: 'Amul Taaza Milk (1L)',
      price: 72,
      rating: '4.0',
      cuisine: 'Dairy',
      desc: 'Fresh homogenized milk. High pasteurization standard.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkO7UaMcN52sGRo8hGb_t0YXzFox7EE-kkn91x41LkRnlTujG9AAdBCnjxcNPFg1fm49ZYgtoelq6bVk-AgNh7D_jEJglUIDC4krM9uUrnaRraGyB9FGg75XnS7FhynZEpDejWV9m40O_ja2LAeAEiO5MABCau6JbHULsokNNsteNquHeRbA_K-szk7ADvUOFjvWF0WzgJZy-xeMDE6_yRwJPTrY7kZsQoK2u46kgKT3zClaKu60yeEixTIkrIloYfqohry1ufX-hJ',
      isVeg: true,
      isOutOfStock: true,
      swapSuggested: 'GoodLife Tetra Pack Milk (1L)'
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    setLoading(true);
    API.fetchRestaurantMenu(restaurant.id)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setMenu(data.map(item => ({
            id: item.id || `item-${Math.random()}`,
            name: item.name,
            price: item.price,
            rating: String(item.rating || '4.2'),
            cuisine: item.cuisine || (item.veg ? 'Veg' : 'Non-Veg'),
            desc: item.desc || item.description,
            image: item.image || item.imageUrl,
            isVeg: item.veg ?? item.isVeg ?? false,
            isBestSeller: item.rating >= 4.5
          })));
        } else {
          setMenu(defaultMenu);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("[Menu API] Failed to fetch menu, falling back:", err);
        setMenu(defaultMenu);
        setLoading(false);
      });
  }, [restaurant?.id]);

  if (!restaurant) return null;

  const menuItems = menu.filter(item => {
    const isVeg = item.isVeg ?? item.veg;
    const matchesVeg = !vegOnly || isVeg;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVeg && matchesSearch;
  });

  const cartTotalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + 2.20 : 0;

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (behrouz_biryani_detail) ─── */
    return (
      <div className="relative bg-[#040406] min-h-screen text-[#e5e1e6] select-none font-sans overflow-y-auto pb-24 w-full">
        {/* Top App Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-white">search</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-white">share</span>
            </button>
          </div>
        </div>

        {/* 1. Top Image Banner */}
        <div className="relative w-full h-[280px]">
          <img 
            className="w-full h-full object-cover rounded-b-[2rem]" 
            alt={restaurant.name}
            src={restaurant.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-[#040406]/20 to-transparent rounded-b-[2rem]"></div>
          
          <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-2">
            <div className="self-start px-3 py-1 rounded-full bg-[#8F00FF]/20 border border-[#8F00FF]/50 text-[#dab9ff] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_12px_rgba(143,3,255,0.3)]">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              Exclusive Partner
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs text-white">
                <span className="text-[#FFB300] font-bold">⭐ {restaurant.rating || '4.6'}</span>
                <span className="text-white/40">|</span>
                <span className="font-mono text-gray-300">{restaurant.distance || '2.1 km'}</span>
                <span className="text-white/40">|</span>
                <span className="font-mono text-gray-300">{restaurant.deliveryTime || '28 min'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Dietary Controls & Filters */}
        <div className="px-4 py-4 sticky top-0 z-40 bg-[#040406]/95 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <label className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-[#0A0A0F] cursor-pointer">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={vegOnly} 
              onChange={() => setVegOnly(!vegOnly)} 
            />
            <div className={`relative w-8 h-4 rounded-full border border-white/10 transition-colors ${vegOnly ? 'bg-[#00E676]' : 'bg-white/5'}`}>
              <div className={`absolute top-[1px] w-3 h-3 bg-white rounded-full transition-transform ${vegOnly ? 'translate-x-4' : 'translate-x-[2px]'}`}></div>
            </div>
            <span className="text-xs font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[#00E676] text-[16px]">eco</span>
              Veg Only
            </span>
          </label>
          <div className="w-px h-6 bg-white/10 flex-shrink-0"></div>
          <button className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[#FF0077]/30 bg-[#FF0077]/10 text-[#FF0077] text-xs font-semibold">
            Mughlai
          </button>
          <button className="flex-shrink-0 px-3 py-1.5 rounded-full border border-white/5 bg-[#0A0A0F] text-gray-400 text-xs hover:bg-white/5 transition-colors">
            Biryani
          </button>
        </div>

        {/* 3. Items List */}
        <div className="px-4 py-4 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Recommended</h2>
          
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex gap-4 relative overflow-hidden group ${item.isOutOfStock ? 'opacity-60' : ''}`}
            >
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[16px] ${item.isVeg ? 'text-[#00E676]' : 'text-[#FF3366]'}`}>
                    {item.isVeg ? 'eco' : 'change_history'}
                  </span>
                  <span className="text-[9px] font-mono text-warning bg-warning/10 px-1.5 rounded border border-warning/20">⭐ {item.rating}</span>
                </div>
                <h3 className={`text-xs font-bold text-white mt-1 ${item.isOutOfStock ? 'line-through' : ''}`}>{item.name}</h3>
                <div className="text-xs font-mono text-gray-300 mt-0.5">Rs {item.price}</div>
                <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">{item.desc}</p>

                {item.isOutOfStock && item.swapSuggested && (
                  <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between shadow-lg">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9px] text-[#FF0077] font-semibold">Swap suggestion:</span>
                      <span className="text-[10px] font-bold text-white truncate">{item.swapSuggested}</span>
                    </div>
                    <button 
                      onClick={() => onAddToCart({
                        id: item.id + '-swapped',
                        name: item.swapSuggested,
                        price: item.price,
                        restaurantName: restaurant.name,
                        restaurantId: restaurant.id
                      })}
                      className="bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-0.5 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[12px]">bolt</span>
                      Swap
                    </button>
                  </div>
                )}
              </div>

              {!item.isOutOfStock && (
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                  <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                  <button 
                    onClick={() => onAddToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      restaurantName: restaurant.name,
                      restaurantId: restaurant.id
                    })}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black font-semibold text-[10px] px-3 py-1 rounded-full shadow-lg border border-white/10 hover:bg-[#FF0077] hover:text-white transition-colors z-10 whitespace-nowrap"
                  >
                    + ADD
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (behrouz_biryani_detail_desktop) ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 pt-2 pb-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span 
              onClick={onBack}
              className="text-2xl font-extrabold text-[#FF0077] tracking-tighter cursor-pointer hover:opacity-85 transition-opacity"
            >
              District
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">Home Feed</button>
            <button className="text-[#FF0077] font-bold">Dining</button>
            <button className="text-gray-400 hover:text-white transition-colors">Delivery</button>
            <button className="text-gray-400 hover:text-white transition-colors">Groceries</button>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 px-3 py-1 bg-[#14141F] rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-[#FF0077] text-[18px]">location_on</span>
              <span className="text-xs font-semibold text-white">Patia, Bhubaneswar</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="pt-24 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr_340px] gap-8 px-8 w-full pb-16">
        {/* Left Sidebar Menu Collections */}
        <aside className="hidden lg:flex flex-col py-6 pr-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Collections</h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSelectedCategory('Recommended')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border-l-4 transition-all ${
                selectedCategory === 'Recommended' ? 'bg-[#0A0A0F] border-l-[#FF0077] text-[#FF0077] font-bold border border-white/5' : 'text-gray-400 border-l-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>Recommended</span>
              <span className="font-mono text-[9px]">{menuItems.length}</span>
            </button>
          </div>
          
          <div className="mt-auto p-4 bg-[#0A0A0F] border border-white/5 rounded-xl border-dashed border-[#FF0077]/20">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-warning text-[18px]">workspace_premium</span>
              <span className="text-[10px] text-warning font-bold">VIP STATUS</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">Earn reward multipliers on local premium dining checkouts.</p>
          </div>
        </aside>

        {/* Center Panel menu items */}
        <section className="flex flex-col py-6 pr-4">
          {/* Parallax Banner */}
          <div className="relative w-full h-[220px] rounded-2xl overflow-hidden mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-transparent to-transparent z-10"></div>
            <img 
              className="w-full h-full object-cover transition-transform duration-75 group-hover:scale-[1.01]" 
              alt={restaurant.name}
              src={restaurant.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"}
            />
            <div className="absolute bottom-6 left-6 z-20">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FF0077] text-white px-2 py-[2px] rounded text-[8px] font-bold uppercase tracking-wider">Legendary</span>
                <div className="flex items-center gap-0.5 text-warning">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span className="font-mono text-[10px] font-bold">{restaurant.rating || '4.8'}</span>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white leading-none mb-1">{restaurant.name}</h2>
              <p className="text-gray-400 text-xs">{restaurant.cuisine || 'North Indian • Persia Specialities'}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-[#0A0A0F] border border-white/5 rounded-full flex items-center px-4 py-1.5">
              <span className="material-symbols-outlined text-gray-500 mr-2 text-[18px]">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-xs w-full text-white placeholder-gray-600 outline-none" 
                placeholder={`Search in ${restaurant.name}...`} 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  vegOnly ? 'bg-[#00E676]/10 border-[#00E676] text-[#00E676]' : 'border-white/5 text-gray-400 hover:border-white'
                }`}
              >
                VEG ONLY
              </button>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-[#FF0077] uppercase tracking-[2px] mb-2">{selectedCategory}</h4>
            
            {menuItems.map(item => (
              <div 
                key={item.id}
                className={`bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex gap-4 hover:border-[#FF0077]/40 transition-all duration-300 ${
                  item.isOutOfStock ? 'opacity-60' : ''
                }`}
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                  <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-sm p-[2px] rounded border border-[#FF3366]">
                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#00E676]' : 'bg-[#FF3366]'}`}></div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-xs font-bold text-white truncate mr-2">{item.name}</h5>
                      <span className="font-mono text-xs text-[#FF0077] font-semibold">Rs {item.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-warning text-[14px]">thumb_up</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{item.rating} Rating</span>
                    </div>

                    {item.isOutOfStock && item.swapSuggested ? (
                      <div className="flex gap-2 items-center bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                        <span className="text-[9px] text-[#FF0077] truncate max-w-[120px]">Suggested: {item.swapSuggested}</span>
                        <button 
                          onClick={() => onAddToCart({
                            id: item.id + '-swapped',
                            name: item.swapSuggested,
                            price: item.price,
                            restaurantName: restaurant.name,
                            restaurantId: restaurant.id
                          })}
                          className="bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] px-2 py-0.5 rounded-full text-[8px] font-bold active:scale-95 transition-all"
                        >
                          Swap
                        </button>
                      </div>
                    ) : !item.isOutOfStock ? (
                      <button 
                        onClick={() => onAddToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          restaurantName: restaurant.name,
                          restaurantId: restaurant.id
                        })}
                        className="px-4 py-1 bg-[#FF0077] text-white rounded-full text-[10px] font-extrabold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                      >
                        + ADD TO BASKET
                      </button>
                    ) : (
                      <span className="text-[9px] text-gray-600 font-bold uppercase">SOLD OUT</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar: Basket Summary */}
        <aside className="hidden xl:flex flex-col py-6">
          <div className="bg-[#0A0A0F] border border-white/5 flex-1 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Basket</h3>
                <span className="font-mono bg-[#FF0077]/20 text-[#FF0077] px-2 py-0.5 rounded text-[9px] font-bold">{cartTotalItems} ITEMS</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="material-symbols-outlined text-[14px]">delivery_dining</span>
                <span>Delivery to <b className="text-white">Patia, Bhubaneswar</b></span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[9px] text-gray-500">Qty: {item.quantity || 1}</p>
                  </div>
                  <span className="font-mono text-xs text-[#FF0077]">Rs {item.price * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono text-white">Rs {cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-[11px] mb-3">
                <span className="text-gray-500">Taxes</span>
                <span className="font-mono text-white">Rs {cartSubtotal > 0 ? '2.20' : '0.00'}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FF0077] mb-4">
                <span>TOTAL</span>
                <span className="font-mono">Rs {cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={onCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-[#FF0077] text-white rounded-full font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span>PROCEED TO PAY</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
