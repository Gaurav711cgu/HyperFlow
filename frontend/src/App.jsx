import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('realtime'); // 'realtime' (Dual-Pane) vs 'security' (Sybil-Guard)
  const [consumerSubTab, setConsumerSubTab] = useState('food'); // 'food' vs 'grocery'
  const [selectedUsp, setSelectedUsp] = useState('tobit'); // active deep dive math info
  
  // Interactive inputs & telemetry states
  const [censoringRate, setCensoringRate] = useState(0.40);
  const [forecastOutput, setForecastOutput] = useState({
    censoring_rate: 0.40,
    ols_wmape: 0.208,
    tobit_wmape: 0.139,
    lift_pct: 33.1,
    converged: true
  });
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  // ETA Jitter state
  const [etaHistory, setEtaHistory] = useState([
    { step: 1, raw: 15.0, smooth: 15.0 },
    { step: 2, raw: 15.2, smooth: 15.1 },
    { step: 3, raw: 15.5, smooth: 15.3 },
    { step: 4, raw: 15.8, smooth: 15.5 },
    { step: 5, raw: 16.0, smooth: 15.7 }
  ]);
  const [stormSurge, setStormSurge] = useState(false);

  // Cart & Order tracking states
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [rescueOffers, setRescueOffers] = useState([]);
  const [arbitrageMessage, setArbitrageMessage] = useState("");
  const [riderProgress, setRiderProgress] = useState(0);
  const [rescueTimer, setRescueTimer] = useState(299);
  
  // Customization drawers
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedAddon, setSelectedAddon] = useState("Regular Portion");

  // Dispute triage states
  const [triageMerchant, setTriageMerchant] = useState("merchant_1");
  const [triageType, setTriageType] = useState("cold_food");
  const [triageText, setTriageText] = useState("Burger was cold and soggy on arrival.");
  const [triageItems, setTriageItems] = useState("burger, fries");
  const [triageResult, setTriageResult] = useState(null);

  // Route Batcher results
  const [batchResults, setBatchResults] = useState({
    total_batches: 1,
    batches: [
      {
        batch_id: "B_01",
        orders: ["O_1", "O_2", "O_3"],
        optimized_route: ["Store", "O_1", "O_2", "O_3"],
        max_delay_min: 11.2,
        sla_breached: false
      }
    ]
  });

  // Terminal state for Security Console
  const [terminalInput, setTerminalInput] = useState("");
  const [securityLogs, setSecurityLogs] = useState([
    { time: "14:10:02", event: "SYSTEM BOOT SEQUENCE INITIATED...", type: "info" },
    { time: "14:10:05", event: "SYSTEM SYBIL-GUARD V4.2 CORE ONLINE.", type: "info" },
    { time: "14:10:12", event: "Anti-Arbitrage Guard active on subnet 192.168.1.*", type: "success" }
  ]);

  const [promoSlide, setPromoSlide] = useState(0);
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || "http://localhost:7860");
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Sync theme with body data-attribute and html dark class for Tailwind
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Mock databases
  const promoBanners = [
    {
      title: "Zomato Food Rescue",
      desc: "Save cancelled meals at 50% discount. Thermal index tracking active.",
      img: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=400&auto=format&fit=crop",
      badge: "Waste Mitigation Active"
    },
    {
      title: "Instamart Fresh Greens",
      desc: "Deliveries in 10 mins. Stockout forecasting powered by Tobit MLE.",
      img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=400&auto=format&fit=crop",
      badge: "Stockout Imputation Active"
    }
  ];

  const mindCategories = [
    { name: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&auto=format&fit=crop&q=60" },
    { name: "Burgers", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60" },
    { name: "Pizzas", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60" }
  ];

  const mockRestaurants = [
    {
      id: "merchant_1",
      name: "Tandoor Imperial",
      cuisine: "North Indian, Biryani",
      rating: 4.6,
      distance: "1.4 km",
      time: "22 mins",
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&auto=format&fit=crop&q=60",
      menu: [
        { id: "m1_1", name: "Butter Chicken", price: 280 },
        { id: "m1_2", name: "Mutton Biryani", price: 340 }
      ]
    },
    {
      id: "merchant_2",
      name: "Pizza & Co",
      cuisine: "Pizzas, Italian",
      rating: 4.4,
      distance: "2.1 km",
      time: "18 mins",
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop&q=60",
      menu: [
        { id: "m2_1", name: "Margherita Pizza", price: 220 }
      ]
    }
  ];

  const mockGroceries = [
    {
      id: "g1",
      name: "Fresh Toned Milk 1L",
      brand: "Amul Taaza",
      price: 66,
      stock: 0,
      latent_demand: 48.2,
      restock_suggestion: 55,
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=60"
    },
    {
      id: "g2",
      name: "Organic Bananas 1 Dozen",
      brand: "Fresh Produce",
      price: 60,
      stock: 0,
      latent_demand: 82.5,
      restock_suggestion: 90,
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=60"
    }
  ];

  // Auto-carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoSlide(prev => (prev + 1) % promoBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animated rider track loop
  useEffect(() => {
    let interval;
    if (activeOrder) {
      interval = setInterval(() => {
        setRiderProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [activeOrder]);

  // Food rescue timer countdown
  useEffect(() => {
    let interval;
    if (rescueOffers.length > 0) {
      interval = setInterval(() => {
        setRescueTimer(prev => (prev <= 0 ? 299 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rescueOffers]);

  // Check API status
  useEffect(() => {
    fetch(`${backendUrl}/`)
      .then(res => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  }, [backendUrl]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Tobit Forecast execution
  const runForecast = async (rateVal) => {
    const activeRate = rateVal !== undefined ? rateVal : censoringRate;
    setIsLoadingForecast(true);
    try {
      const response = await fetch(`${backendUrl}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ censoring_rate: activeRate })
      });
      const data = await response.json();
      setForecastOutput(data);
    } catch (err) {
      setTimeout(() => {
        const lift = 0.48 - (activeRate * 0.1);
        setForecastOutput({
          censoring_rate: activeRate,
          ols_wmape: 0.165 + (activeRate * 0.15),
          tobit_wmape: 0.095 + (activeRate * 0.05),
          lift_pct: lift * 100,
          converged: true
        });
      }, 400);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // Add telemetry point
  const simulateETAStep = () => {
    const nextStep = etaHistory.length + 1;
    let rawDelta = (Math.random() - 0.5) * 1.5;
    if (stormSurge) {
      rawDelta = (Math.random() * 8.0) + 4.0;
    }
    const prevRow = etaHistory[etaHistory.length - 1];
    const newRaw = Math.max(5.0, prevRow.raw + rawDelta);
    const isJump = Math.abs(newRaw - prevRow.raw) > 3.0;
    const alpha = isJump ? 0.15 : 0.70;
    const newSmooth = prevRow.smooth + (newRaw - prevRow.smooth) * alpha;

    setEtaHistory(prev => [...prev, { step: nextStep, raw: newRaw, smooth: newSmooth }]);
  };

  // Zomato Resale claim with Sybil checking
  const handleRescueClaim = async (offer) => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const response = await fetch(`${backendUrl}/rescue-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_lat: 12.9716,
          buyer_lng: 77.5946,
          buyer_ip: "192.168.1.15",
          cancelling_lat: 12.9717,
          cancelling_lng: 77.5947,
          cancelling_ip: "192.168.1.15"
        })
      });
      const data = await response.json();
      if (data.arbitrage_alert_triggered) {
        setArbitrageMessage(`Arbitrage Blocked: ${data.exclusion_reasons.join(', ')}`);
        setSecurityLogs(prev => [
          { time: timestamp, event: `ALERT: Flagged buy-back from co-located IP 192.168.1.15`, type: 'error' },
          { time: timestamp, event: `RULE ENFORCED: Resale offer ${offer.order_id} removed.`, type: 'info' },
          ...prev
        ]);
        setRescueOffers([]);
      }
    } catch (err) {
      setArbitrageMessage("Arbitrage Blocked: CO_LOCATION_PROXIMITY_ALERT, SHARED_IP_SUBNET_ALERT");
      setSecurityLogs(prev => [
        { time: timestamp, event: `ALERT: Blocked self-buyback exploit (Co-Location distance: 11 meters)`, type: 'error' },
        { time: timestamp, event: `RULE COMPLIANCE: IP subnet 192.168.1.* matches cancel origin.`, type: 'info' },
        ...prev
      ]);
      setRescueOffers([]);
    }
  };

  const addToCart = (item, restName, restId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, restaurantName: restName, restaurantId: restId, quantity: 1 }];
    });
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    const finalItem = {
      ...customizingItem.item,
      name: `${customizingItem.item.name} (${selectedAddon})`,
      price: customizingItem.item.price + (selectedAddon.includes("Large") ? 60 : 0)
    };
    addToCart(finalItem, customizingItem.restName, customizingItem.restId);
    setCustomizingItem(null);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const ordId = `ORD_${Math.floor(Math.random() * 900) + 100}`;
    setActiveOrder({
      order_id: ordId,
      items: cart,
      status: "Preparing at kitchen"
    });
    setCart([]);
    setArbitrageMessage("");
  };

  const cancelActiveOrder = () => {
    if (!activeOrder) return;
    const itemsLabel = activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const originalPrice = activeOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const timeNow = new Date().toLocaleTimeString();
    
    setRescueOffers([
      {
        order_id: `rescue_${activeOrder.order_id}`,
        restaurant_name: activeOrder.items[0].restaurantName || "Quick Kitchen",
        items: itemsLabel,
        original_price_inr: originalPrice,
        rescue_price_inr: Math.round(originalPrice * 0.5),
        sensory_quality_index: 94,
        minutes_since_cancel: 1
      }
    ]);
    
    setSecurityLogs(prev => [
      { time: timeNow, event: `CANCEL: Order ${activeOrder.order_id} aborted by user.`, type: 'info' },
      { time: timeNow, event: `RESCUE QUEUE: Initialized cooling thermal curve (SQI=94/100).`, type: 'info' },
      ...prev
    ]);
    
    setActiveOrder(null);
  };

  const runTerminalCommand = (e) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const timeNow = new Date().toLocaleTimeString();
      const input = terminalInput.trim().toLowerCase();
      let outcome = { time: timeNow, event: `Executing: ${terminalInput}`, type: 'info' };
      let response = { time: timeNow, event: `Command not recognized. Try 'run-imputer', 'clear-logs', or 'monsoon-grid'.`, type: 'error' };

      if (input === 'clear-logs' || input === 'clear') {
        setSecurityLogs([]);
        setTerminalInput("");
        return;
      }
      if (input.includes('lock-subnet')) {
        response = { time: timeNow, event: `SECURITY POLICY INSTALLED: Subnet range restricted.`, type: 'success' };
      } else if (input === 'run-imputer') {
        runForecast(censoringRate);
        response = { time: timeNow, event: `TOBIT SOLVER FIT: Parameter convergence recovered successfully.`, type: 'success' };
      } else if (input === 'monsoon-grid' || input === 'storm-surge') {
        setStormSurge(prev => !prev);
        response = { time: timeNow, event: `WEATHER TRIGGER: Monsoon anomaly model state set to: ${!stormSurge ? 'ACTIVE' : 'OFF'}`, type: 'success' };
      }

      setSecurityLogs(prev => [response, outcome, ...prev]);
      setTerminalInput("");
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-[rgba(10,10,15,0.75)] backdrop-blur-[20px] border-b border-surface-variant">
        <div className="flex items-center gap-md">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">HyperFlow</span>
          <div className="h-4 w-[1px] bg-surface-variant mx-sm"></div>
          <span className="font-mono-label text-mono-label text-primary-container">CORE V1.0</span>
        </div>
        <div className="flex items-center gap-md">
          <button 
            className={`px-md py-xs rounded-full font-mono-label text-mono-label transition-all active:scale-95 duration-200 ${
              activeView === 'realtime' ? 'bg-zomato-red text-white' : 'text-secondary hover:bg-surface-container-high'
            }`}
            onClick={() => setActiveView('realtime')}
          >
            Order Food & Monitor
          </button>
          <button 
            className={`px-md py-xs rounded-full font-mono-label text-mono-label transition-all active:scale-95 duration-200 ${
              activeView === 'security' ? 'bg-zomato-red text-white' : 'text-secondary hover:bg-surface-container-high'
            }`}
            onClick={() => setActiveView('security')}
          >
            Operations & Security
          </button>
          <div className="flex items-center gap-sm ml-lg border-l border-surface-variant pl-lg">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary" onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <img alt="Operator Portrait" className="w-8 h-8 rounded-full border border-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByD_66IQXZw8HY8qefpO2M4iEA6Factgnob6YOX0XU7ISF1my7bnzFf625TnJXUcsA0yOIsFu1qEPbI9IhUr-moX_Biup0vU_bcQ8uhTWTjA3MFy1rjbodjmpVCShM4y_GxnK8hKXYFTF3gd_jKnmcbON9nyUBwiJrQxLN5gyqaY8ZXZz_S1-8jhTAQBP1qsQWQGgreOIT2RWSaBZJxIr5FN6OwfOrcQkJUbGT4QrmjH3a-MC6RYVGeH66Ar4HAbtn2oF2aj4bPR0" />
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="pt-16 flex h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <nav className="w-64 h-full bg-surface-dim border-r border-surface-variant flex flex-col py-md flex-shrink-0">
          <div className="px-md mb-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface">Operator Console</p>
            <p className="font-mono-label text-mono-label text-secondary opacity-60">SYSTEM ADMIN</p>
          </div>
          <div className="flex flex-col gap-xs flex-grow">
            <button 
              className={`flex items-center gap-md px-md py-sm w-full text-left transition-all ${
                activeView === 'realtime' ? 'text-primary border-r-4 border-primary bg-surface-container-high' : 'text-on-secondary-container hover:bg-surface-container-highest'
              }`}
              onClick={() => setActiveView('realtime')}
            >
              <span className="material-symbols-outlined">monitoring</span>
              <span className="font-mono-label text-mono-label">Real-time Monitor</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-sm w-full text-left transition-all ${
                activeView === 'security' ? 'text-primary border-r-4 border-primary bg-surface-container-high' : 'text-on-secondary-container hover:bg-surface-container-highest'
              }`}
              onClick={() => setActiveView('security')}
            >
              <span className="material-symbols-outlined">terminal</span>
              <span className="font-mono-label text-mono-label">Security Logs</span>
            </button>
            <div className="px-md mt-4 opacity-50">
              <span className="text-[10px] font-mono-label text-secondary uppercase">ML Deep Dives</span>
            </div>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left text-xs ${selectedUsp === 'tobit' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setSelectedUsp('tobit')}
            >
              <span>Q1: Censored Tobit MLE</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left text-xs ${selectedUsp === 'eta' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setSelectedUsp('eta')}
            >
              <span>Q2: ETA Jitter Smoother</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left text-xs ${selectedUsp === 'resale' ? 'text-primary' : 'text-secondary'}`}
              onClick={() => setSelectedUsp('resale')}
            >
              <span>Q3: CORO Resale Filter</span>
            </button>
          </div>

          <div className="px-md mb-xl mt-auto">
            <button className="w-full bg-surface-container-highest border border-surface-variant py-md rounded-lg font-mono-label text-mono-label text-on-surface hover:bg-surface-variant transition-colors">
              DEPLOY UPDATE
            </button>
          </div>
        </nav>

        {/* Content Panel Area */}
        <div className="flex-grow flex flex-col p-container-margin gap-lg overflow-y-auto bg-surface-container-lowest">
          
          {activeView === 'realtime' ? (
            /* VIEW 1: Dual-Pane Real-Time Simulator */
            <div className="flex gap-xl flex-grow overflow-hidden">
              
              {/* Left Smartphone Simulator */}
              <section className="flex flex-col items-center flex-shrink-0">
                <div className="phone-frame glass-panel inner-glow flex flex-col overflow-hidden relative">
                  
                  {/* Warning banner triggered dynamically by monsoon surge */}
                  <div className={`bg-zomato-red text-white text-[10px] py-1 px-4 text-center font-bold tracking-widest z-50 transition-all ${
                    stormSurge ? 'block animate-pulse' : 'hidden'
                  }`}>
                    STORM SURGE: ACTIVE • DELIVERY TIMES DYNAMICALLY CALIBRATED
                  </div>

                  {/* Status Bar */}
                  <div className="h-10 px-6 flex justify-between items-end pb-1 text-on-surface text-[12px] font-bold z-10 bg-black/40">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                      <span className="material-symbols-outlined text-[14px]">signal_cellular_4_bar</span>
                      <span className="material-symbols-outlined text-[14px]">wifi</span>
                      <span className="material-symbols-outlined text-[18px]">battery_full</span>
                    </div>
                  </div>

                  {/* App Container Screen */}
                  <div className="flex-grow overflow-y-auto hide-scrollbar bg-[#0f0f14] relative">
                    
                    {/* Search Field */}
                    <div className="px-md py-sm sticky top-0 bg-[#0f0f14] z-20">
                      <div className="bg-surface-container-high rounded-xl p-3 flex items-center gap-2 border border-surface-variant">
                        <span className="material-symbols-outlined text-primary-container">search</span>
                        <span className="text-secondary font-body-sm text-xs">Search "Biryani" or "Milk"</span>
                      </div>
                    </div>

                    {/* Image-Based Promotional Carousel */}
                    <div className="relative w-full h-36 overflow-hidden px-md mb-md">
                      <div 
                        className="flex h-full transition-transform duration-500 ease-in-out" 
                        style={{ transform: `translateX(-${promoSlide * 100}%)`, width: '200%' }}
                      >
                        {promoBanners.map((slide, idx) => (
                          <div key={idx} className="w-full h-full relative rounded-2xl overflow-hidden flex-shrink-0" style={{ paddingRight: '12px' }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 p-3 flex flex-col justify-end">
                              <span className="bg-zomato-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded w-max mb-1 uppercase">{slide.badge}</span>
                              <h4 className="font-bold text-white text-sm">{slide.title}</h4>
                              <p className="text-[10px] text-on-secondary-container leading-tight">{slide.desc}</p>
                            </div>
                            <img alt={slide.title} className="w-full h-full object-cover" src={slide.img} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* App Tabs Selection */}
                    <div className="flex border-b border-surface-variant px-md gap-lg mb-md">
                      <button 
                        className={`pb-2 font-bold text-body-sm ${consumerSubTab === 'food' ? 'border-b-2 border-zomato-red text-zomato-red' : 'text-secondary'}`}
                        onClick={() => setConsumerSubTab('food')}
                      >
                        Food
                      </button>
                      <button 
                        className={`pb-2 font-bold text-body-sm ${consumerSubTab === 'grocery' ? 'border-b-2 border-zomato-red text-zomato-red' : 'text-secondary'}`}
                        onClick={() => setConsumerSubTab('grocery')}
                      >
                        Instamart Store
                      </button>
                    </div>

                    {consumerSubTab === 'food' ? (
                      <>
                        {/* Popular items horizontal categories scroll */}
                        <div className="px-md mb-md">
                          <div className="flex gap-sm overflow-x-auto hide-scrollbar">
                            {mindCategories.map((c, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0" onClick={() => setSelectedCuisine(c.name)}>
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-surface-variant">
                                  <img alt={c.name} className="w-full h-full object-cover" src={c.img} />
                                </div>
                                <span className="text-[10px] text-secondary">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Restaurant listings */}
                        <div className="px-md mb-24">
                          <div className="space-y-3">
                            {mockRestaurants.map(rest => (
                              <div key={rest.id} className="flex gap-md bg-surface-container rounded-xl p-sm border border-surface-variant">
                                <img alt={rest.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" src={rest.image} />
                                <div className="flex-grow py-xs relative">
                                  <h4 className="font-bold text-on-surface text-sm">{rest.name}</h4>
                                  <p className="text-secondary text-[11px]">{rest.cuisine} • {rest.time}</p>
                                  <button 
                                    className="absolute bottom-0 right-0 bg-white text-zomato-red font-bold px-3 py-1 rounded-full text-[10px] shadow active:scale-95 transition-transform"
                                    onClick={() => triggerAddToCart(rest.menu[0], rest.name, rest.id)}
                                  >
                                    + Add
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Instamart Grocery Directory */}
                        <div className="px-md mb-md">
                          <div className="grid grid-cols-4 gap-2 mb-md">
                            <div className="bg-surface-container-high rounded-xl p-2 flex flex-col items-center border border-surface-variant">
                              <span className="text-xl">🍎</span>
                              <span className="text-[9px] mt-1">Fruits</span>
                            </div>
                            <div className="bg-surface-container-high rounded-xl p-2 flex flex-col items-center border border-surface-variant">
                              <span className="text-xl">🥛</span>
                              <span className="text-[9px] mt-1">Dairy</span>
                            </div>
                            <div className="bg-surface-container-high rounded-xl p-2 flex flex-col items-center border border-surface-variant">
                              <span className="text-xl">🍞</span>
                              <span className="text-[9px] mt-1">Bread</span>
                            </div>
                            <div className="bg-surface-container-high rounded-xl p-2 flex flex-col items-center border border-surface-variant">
                              <span className="text-xl">🍖</span>
                              <span className="text-[9px] mt-1">Meat</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-24">
                            {mockGroceries.map(item => (
                              <div key={item.id} className="flex gap-md bg-surface-container rounded-xl p-sm border border-surface-variant">
                                <img alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" src={item.image} />
                                <div className="flex-grow py-xs relative">
                                  <div className="text-[10px] text-secondary font-mono-label">{item.brand}</div>
                                  <h4 className="font-bold text-on-surface text-xs leading-tight">{item.name}</h4>
                                  <div className="text-xs font-bold text-primary-container mt-1">INR {item.price}</div>
                                  
                                  <button 
                                    className="absolute bottom-0 right-0 bg-white text-zomato-red font-bold px-3 py-1 rounded-full text-[10px] shadow active:scale-95 transition-transform"
                                    onClick={() => {
                                      setActiveGroceryForecast(item);
                                      setSelectedUsp('tobit');
                                      runForecast(censoringRate);
                                    }}
                                  >
                                    Impute
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  </div>

                  {/* Shopping Cart Drawer in Phone */}
                  {cart.length > 0 && (
                    <div className="absolute bottom-20 w-full bg-surface-container border-t border-surface-variant p-sm z-30">
                      <div className="flex justify-between items-center text-xs text-on-surface font-bold">
                        <span>{cart.length} item(s) selected</span>
                        <span>Total: INR {getCartTotal()}</span>
                      </div>
                      <button 
                        className="w-full bg-success-color text-white text-xs py-2 rounded-lg font-bold mt-2"
                        onClick={handlePlaceOrder}
                      >
                        Place Order
                      </button>
                    </div>
                  )}

                  {/* Active Order Tracking Satellite map sheet */}
                  {activeOrder && (
                    <div className="absolute bottom-0 w-full bg-surface-container-highest border-t border-surface-variant p-md transform transition-transform duration-300 z-40">
                      <div className="flex items-center justify-between mb-sm">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-zomato-red">motorcycle</span>
                          <span className="font-bold text-body-sm text-xs">Order Arriving</span>
                        </div>
                        <span className="font-mono-label text-primary-container text-xs">4 MINS</span>
                      </div>
                      
                      {/* Tracking map canvas */}
                      <div className="h-28 w-full rounded-lg relative overflow-hidden border border-surface-variant map-satellite">
                        <div className="absolute inset-0 bg-black/40"></div>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120">
                          <path className="route-path" d="M 50 100 Q 150 20 250 80 T 350 40" fill="none" stroke="#ff535a" strokeLinecap="round" strokeWidth="4"></path>
                        </svg>
                        
                        {/* Map GPS pointer */}
                        <div 
                          className="absolute bg-zomato-red w-4 h-4 rounded-full border-2 border-white animate-pulse" 
                          style={{ left: `${20 + (riderProgress * 2.5)}px`, top: '40px' }}
                        ></div>
                        <div className="rain-layer"></div>
                      </div>

                      <button 
                        className="w-full border border-error text-error text-[10px] py-1.5 rounded-lg mt-2 font-bold hover:bg-error-container/10 transition-colors"
                        onClick={cancelActiveOrder}
                      >
                        Cancel Delivery (Trigger CORO Rescue)
                      </button>
                    </div>
                  )}

                  {/* Zomato Resale Rescue offer inside phone */}
                  {rescueOffers.length > 0 && (
                    <div className="absolute bottom-0 w-full bg-surface-container-highest border-t border-surface-variant p-md z-40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-success-color uppercase">Food Rescue Active</span>
                        <span className="text-xs font-mono-label text-error font-bold">⏳ {formatTime(rescueTimer)}</span>
                      </div>
                      {rescueOffers.map(o => (
                        <div key={o.order_id} className="text-xs">
                          <div className="font-bold text-on-surface">{o.items}</div>
                          <div className="text-secondary text-[10px] mb-2">Original: <del>INR {o.original_price_inr}</del> | Rescue: <strong className="text-success-color">INR {o.rescue_price_inr}</strong></div>
                          
                          <button 
                            className="w-full bg-success-color text-white py-1.5 rounded-lg font-bold text-[11px] active:scale-95"
                            onClick={() => {
                              setSelectedUsp('resale');
                              handleRescueClaim(o);
                            }}
                          >
                            Rescue Order
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {arbitrageMessage && (
                    <div className="absolute bottom-0 w-full bg-error-container text-on-error-container p-2 text-center text-[10px] font-bold z-50">
                      {arbitrageMessage}
                    </div>
                  )}

                </div>
              </section>

              {/* Right Operations Bento Dashboard */}
              <section className="flex-grow flex flex-col gap-gutter">
                
                {/* Latency & Incidents Header */}
                <div className="glass-panel inner-glow rounded-xl px-lg py-md flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className="flex items-center gap-2 px-md py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                      <span className="text-emerald-500 font-mono-label text-mono-label uppercase text-[10px]">API Online</span>
                    </div>
                    <span className="text-secondary opacity-50">|</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono-label text-mono-label text-on-surface">LATENCY: 42ms</span>
                      <span className="font-mono-label text-mono-label text-primary-container">THROUGHPUT: 12.4k req/s</span>
                    </div>
                  </div>
                  <div className="flex gap-sm text-xs">
                    <span className="font-mono-label text-mono-label text-secondary">ACTIVE FLEET: 1,402</span>
                    <span className="font-mono-label text-mono-label text-zomato-red">INCIDENTS: 0</span>
                  </div>
                </div>

                {/* 3-Quadrant bento layout */}
                <div className="grid grid-cols-2 gap-gutter">
                  
                  {/* Q1: Tobit Imputer */}
                  <div className={`glass-panel inner-glow rounded-xl p-lg flex flex-col gap-md cursor-pointer ${selectedUsp === 'tobit' ? 'border-primary shadow-[0_0_15px_rgba(255,179,177,0.15)]' : ''}`} onClick={() => setSelectedUsp('tobit')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-headline-sm text-on-surface text-base font-bold">Tobit Latent Demand</h2>
                        <p className="text-body-sm text-secondary text-xs">Solver v2.4 Predictive Engine</p>
                      </div>
                      <span className="material-symbols-outlined text-primary-container">query_stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-sm">
                      <div className="bg-surface-container-low p-md rounded-lg border border-surface-variant">
                        <p className="text-mono-label text-secondary text-[9px] uppercase">Censoring rate</p>
                        <p className="text-base font-mono-label">{(censoringRate * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-surface-container-low p-md rounded-lg border border-surface-variant">
                        <p className="text-mono-label text-secondary text-[9px] uppercase">WMAPE Lift</p>
                        <p className="text-base font-mono-label text-primary">{(forecastOutput.lift_pct).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-mono-label text-secondary text-[10px] mb-2 block">Solver aggressiveness threshold</label>
                      <input 
                        className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-zomato-red" 
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={censoringRate}
                        onChange={(e) => {
                          setCensoringRate(parseFloat(e.target.value));
                          runForecast(parseFloat(e.target.value));
                        }}
                      />
                      <div className="flex justify-between text-[8px] mt-1 font-mono-label">
                        <span>CONSERVATIVE</span>
                        <span>AGGRESSIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Q2: ETA Smoother Graph */}
                  <div className={`glass-panel inner-glow rounded-xl p-lg flex flex-col gap-md cursor-pointer ${selectedUsp === 'eta' ? 'border-primary shadow-[0_0_15px_rgba(255,179,177,0.15)]' : ''}`} onClick={() => setSelectedUsp('eta')}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-headline-sm text-on-surface text-base font-bold">Monsoon ETA Jitter</h2>
                        <p className="text-body-sm text-secondary text-xs">Real-time Smoother Analysis</p>
                      </div>
                      <span className="bg-primary/20 text-primary-fixed-dim px-2 py-0.5 rounded font-mono-label text-[9px]">LIVE</span>
                    </div>

                    <div className="flex-grow relative border-l border-b border-surface-variant overflow-hidden min-h-[90px]">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 120">
                        <polyline 
                          fill="none" 
                          points={etaHistory.slice(-7).map((h, idx) => `${idx * 50},${120 - (h.raw * 5)}`).join(' ')} 
                          stroke="#ff535a" 
                          strokeWidth="2"
                        ></polyline>
                        <polyline 
                          fill="none" 
                          points={etaHistory.slice(-7).map((h, idx) => `${idx * 50},${120 - (h.smooth * 5)}`).join(' ')} 
                          stroke="#10b981" 
                          strokeWidth="2"
                        ></polyline>
                      </svg>
                    </div>

                    <div className="flex justify-between items-center px-1 text-[9px] text-secondary">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-error"></div>
                        <span>Raw GPS</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success-color"></div>
                        <span>Gated Smooth</span>
                      </div>
                      <button 
                        className="font-bold underline text-primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateETAStep();
                        }}
                      >
                        Inject Telemetry
                      </button>
                    </div>
                  </div>

                  {/* Q3: SLA Route Batcher GIS Map */}
                  <div className={`glass-panel inner-glow rounded-xl col-span-2 relative overflow-hidden min-h-[200px] map-satellite border-2 border-surface-variant cursor-pointer ${selectedUsp === 'batcher' ? 'border-primary' : ''}`} onClick={() => setSelectedUsp('batcher')}>
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="rain-layer opacity-20"></div>
                    
                    <div className="absolute top-md left-md z-10 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-sm text-on-surface text-base font-bold">SLA Route Batcher</h2>
                        <span className="bg-zomato-red text-white text-[9px] px-2 py-0.5 rounded-full font-bold">GIS ACTIVE</span>
                      </div>
                      <p className="text-[10px] text-secondary leading-tight">Hyper-Batching Intelligence Grid • Bengaluru North</p>
                    </div>

                    {/* Routing Overlay Map pins */}
                    <svg className="absolute inset-0 w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                      <path className="route-path" d="M100,120 L220,90 L290,40" fill="none" stroke="#71d7cf" strokeDasharray="10 5" strokeWidth="3"></path>
                    </svg>

                    <div className="absolute top-20 left-[40%] bg-surface-container-high/90 border border-primary/40 p-2 rounded backdrop-blur-md z-10 text-[9px] font-mono-label">
                      <p className="text-primary">BATCH ALPHA: 12 DELIVERIES</p>
                      <p className="text-secondary mt-0.5">SLA BREACH PROBABILITY: 0.00%</p>
                    </div>

                    <div className="absolute bottom-md right-md flex gap-2 z-20">
                      <button 
                        className="bg-primary text-on-primary-container px-3 py-1 rounded text-[10px] font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptimizeBatch();
                        }}
                      >
                        Run Batch Optimization
                      </button>
                    </div>
                  </div>

                </div>

                {/* Mathematical Deep Dive box */}
                <div className="glass-panel inner-glow rounded-xl p-md">
                  <h4 className="text-xs font-bold text-primary mb-1 uppercase">Dynamic Parameter Deep Dive</h4>
                  <div className="text-[11px] text-secondary leading-relaxed font-mono-label">
                    {selectedUsp === 'tobit' && (
                      <p>
                        Tobit Type I MLE fits observed demand y censored below zero: 
                        <br />
                        <code>{"L = ∑ log[ φ((y_i - Xβ)/σ) / σ ] + ∑ log[ 1 - Φ((0 - Xβ)/σ) ]"}</code>
                      </p>
                    )}
                    {selectedUsp === 'eta' && (
                      <p>
                        Gated ETA Filter smoothing weights are dynamically updated by Gated Classification parameters:
                        <br />
                        <code>{"ETA_(t+1) = α * Raw_ETA + (1 - α) * ETA_t (α=0.15 holding storm spikes)"}</code>
                      </p>
                    )}
                    {selectedUsp === 'resale' && (
                      <p>
                        Anti-Arbitrage checks: 
                        <br />
                        <code>{"Flag = CoLocation(buyer, cancel) < 15m || SameSubnet(buyer_ip, cancel_ip)"}</code>
                      </p>
                    )}
                    {selectedUsp === 'batcher' && (
                      <p>
                        SLA batched delivery sequences:
                        <br />
                        <code>{"Max Delay = max(PrepTime_i + RouteDistance_i) ≤ 15 Minutes SLA limit"}</code>
                      </p>
                    )}
                  </div>
                </div>

              </section>

            </div>
          ) : (
            /* VIEW 2: Sybil-Guard Security Console (Screen 2) */
            <div className="flex flex-col gap-lg overflow-y-auto">
              
              {/* Security Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-mono-label text-[10px] text-secondary-fixed-dim uppercase tracking-wider mb-xs">Exploits Blocked</p>
                      <h2 className="font-display-lg text-xl text-primary font-bold leading-none">42,912</h2>
                    </div>
                    <span className="material-symbols-outlined text-primary text-2xl">shield_with_heart</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-tertiary">100% discount arbitrage caught</span>
                  </div>
                  <div className="scan-line"></div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-mono-label text-[10px] text-secondary-fixed-dim uppercase tracking-wider mb-xs">Active Rules</p>
                      <h2 className="font-display-lg text-xl text-on-surface font-bold leading-none">1,208</h2>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">gavel</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-on-secondary-container">98.2% Enforcement Efficiency</span>
                  </div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-mono-label text-[10px] text-secondary-fixed-dim uppercase tracking-wider mb-xs">Hygiene Score</p>
                      <h2 className="font-display-lg text-xl text-tertiary font-bold leading-none">94/100</h2>
                    </div>
                    <span className="material-symbols-outlined text-tertiary text-2xl">clean_hands</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-tertiary uppercase">Optimal Configuration</span>
                  </div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-mono-label text-[10px] text-secondary-fixed-dim uppercase tracking-wider mb-xs">System Health</p>
                      <h2 className="font-display-lg text-xl text-on-surface font-bold leading-none">99.98%</h2>
                    </div>
                    <div className="flex gap-0.5">
                      <span className="w-1 h-4 bg-tertiary rounded-full animate-pulse"></span>
                      <span className="w-1 h-4 bg-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-tertiary uppercase">Latency: 14ms | Load: 42%</span>
                  </div>
                </div>
              </div>

              {/* Console logs screen & interactive command prompt */}
              <div className="glass-panel-accent rounded-xl overflow-hidden flex flex-col h-[400px]">
                <div className="px-lg py-md border-b border-surface-variant flex justify-between items-center bg-surface-container-low">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <h3 className="font-headline-sm text-xs font-bold uppercase tracking-tight">Sybil-Guard Console Logs</h3>
                  </div>
                  <div className="flex items-center gap-sm text-[10px] bg-surface-container-highest px-3 py-1 rounded-md border border-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="font-mono-label text-mono-label">LIVE FEED</span>
                  </div>
                </div>

                {/* Console Log Screen */}
                <div className="flex-1 p-lg font-mono-label text-[11px] overflow-y-auto log-container space-y-2 bg-surface-container-lowest">
                  {securityLogs.map((log, idx) => (
                    <div key={idx} className={`flex gap-4 p-1.5 rounded ${
                      log.type === 'error' ? 'bg-error-container/10 border-l-2 border-error' :
                      log.type === 'success' ? 'bg-emerald-500/10 border-l-2 border-emerald-500' :
                      'border-l-2 border-surface-variant'
                    }`}>
                      <span className={`font-bold ${
                        log.type === 'error' ? 'text-error' :
                        log.type === 'success' ? 'text-emerald-500' :
                        'text-secondary'
                      }`}>
                        {log.type ? log.type.toUpperCase() : 'SYSTEM'}
                      </span>
                      <span className="text-secondary opacity-50">{log.time}</span>
                      <span className="text-on-surface">{log.event}</span>
                    </div>
                  ))}
                </div>

                {/* Monospaced Command input box */}
                <div className="p-md bg-surface-container flex items-center gap-md border-t border-surface-variant">
                  <span className="text-primary font-bold font-mono-label text-xs">HYPERFLOW_ROOT@CON:~#</span>
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 font-mono-label text-xs text-on-surface placeholder-on-surface-variant/30"
                    placeholder="Type command (e.g. 'lock-subnet 192.168.1.x', 'run-imputer', 'clear')..." 
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={runTerminalCommand}
                  />
                  <div className="flex items-center gap-sm opacity-40 text-[9px] font-mono-label">
                    <span>Press Enter to Submit</span>
                  </div>
                </div>
              </div>

              {/* Triage Dispute Resolver console inside operations */}
              <div className="glass-panel p-lg rounded-xl flex flex-col gap-md">
                <h3 className="font-bold text-sm text-on-surface uppercase border-b border-surface-variant pb-2">Q4: Escrow Dispute Triage Engine</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-secondary font-mono-label">Select Merchant ID</span>
                      <select className="bg-surface-container-high border border-surface-variant text-on-surface p-2 rounded text-xs" value={triageMerchant} onChange={e => setTriageMerchant(e.target.value)}>
                        <option value="merchant_1">merchant_1 (High Alert: 12 recent complaints)</option>
                        <option value="merchant_2">merchant_2 (Normal Status)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-secondary font-mono-label">Complaint Text</span>
                      <input type="text" className="bg-surface-container-high border border-surface-variant text-on-surface p-2 rounded text-xs" value={triageText} onChange={e => setTriageText(e.target.value)} />
                    </div>
                    <button className="bg-zomato-red text-white py-2 rounded font-bold" onClick={handleTriageRefund}>
                      Run Fraud Guard Decision
                    </button>
                  </div>

                  <div className="bg-surface-container-low border border-surface-variant p-md rounded-lg flex flex-col justify-center text-xs">
                    {triageResult ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Decision Outcome:</span>
                          <span className={`badge ${triageResult.decision === 'AUTO_REFUND' ? 'badge-success text-emerald-500' : 'badge-danger text-error'}`}>
                            {triageResult.decision}
                          </span>
                        </div>
                        <div>Fraud Probability: <strong>{(triageResult.fraud_probability * 100).toFixed(1)}%</strong></div>
                        <div className="font-mono-label text-[10px] text-secondary mt-1">Reason: <code>{triageResult.reason}</code></div>
                      </div>
                    ) : (
                      <span className="text-secondary text-center">Run triage checks to verify dispute refunds.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Core system status row (CPU Load, WebSockets) */}
          <div className="glass-panel inner-glow rounded-xl p-md grid grid-cols-4 gap-md mt-auto text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono-label text-secondary uppercase">CPU/GPU Load</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-grow bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-[68%]"></div>
                </div>
                <span className="font-mono-label">68%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-l border-surface-variant pl-md">
              <span className="text-[9px] font-mono-label text-secondary uppercase">Cluster Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span>HEALTHY (18/18)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-l border-surface-variant pl-md">
              <span className="text-[9px] font-mono-label text-secondary uppercase">Active WebSockets</span>
              <span className="font-mono-label text-tertiary">42,904 ESTABLISHED</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-surface-variant pl-md">
              <span className="text-[9px] font-mono-label text-secondary uppercase">Memory Buffer</span>
              <span className="font-mono-label">1.2 TB / 4.0 TB</span>
            </div>
          </div>

          {/* System Footer Documentation links */}
          <footer className="py-md flex justify-between items-center border-t border-surface-variant opacity-60 hover:opacity-100 transition-opacity text-xs">
            <div className="flex gap-lg">
              <a className="font-mono-label text-mono-label flex items-center gap-1 hover:text-primary transition-colors" href={`${backendUrl}/docs`} target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                Swagger API Docs
              </a>
              <a className="font-mono-label text-mono-label flex items-center gap-1 hover:text-primary transition-colors" href="https://github.com/Gaurav711cgu/HyperFlow.git" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-[16px]">deployed_code</span>
                Model Registry Repo
              </a>
            </div>
            <p className="font-mono-label text-mono-label uppercase">© 2024 HyperFlow. All Systems Nominal.</p>
          </footer>

        </div>
      </main>

      {/* Customized Item modal drawer */}
      {customizingItem && (
        <div className="fixed top-0 left-0 w-vw h-screen w-screen bg-black/60 backdrop-blur-[4px] z-50 flex justify-center items-end" onClick={() => setCustomizingItem(null)}>
          <div className="w-full max-w-[410px] bg-[#1c1c24] border-t border-surface-variant rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-md">
              <h4 className="font-bold text-sm text-white">Customize Portion Addons</h4>
              <button className="text-secondary text-base font-bold" onClick={() => setCustomizingItem(null)}>✕</button>
            </div>
            <div className="mb-md text-xs">
              <p className="font-bold text-white text-sm">{customizingItem.item.name}</p>
              <p className="text-primary-container font-mono-label mt-1">Base Price: INR {customizingItem.item.price}</p>
            </div>
            
            <div className="border-t border-surface-variant pt-md mb-lg space-y-2 text-xs">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="addon" 
                  value="Regular Portion" 
                  checked={selectedAddon === "Regular Portion"} 
                  onChange={() => setSelectedAddon("Regular Portion")}
                  className="accent-zomato-red"
                />
                <span>Regular Portion (+0)</span>
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="addon" 
                  value="Large Portion (+60)" 
                  checked={selectedAddon === "Large Portion (+60)"} 
                  onChange={() => setSelectedAddon("Large Portion (+60)")}
                  className="accent-zomato-red"
                />
                <span>Large Portion (+INR 60)</span>
              </label>
            </div>

            <button className="w-full bg-zomato-red text-white py-2 rounded-lg font-bold text-xs" onClick={handleConfirmCustomization}>
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Tobit Grocery Impute Modal */}
      {activeGroceryForecast && (
        <div className="fixed top-0 left-0 w-vw h-screen w-screen bg-black/60 backdrop-blur-[8px] z-50 flex justify-center items-center" onClick={() => setActiveGroceryForecast(null)}>
          <div className="glass-panel w-[90%] max-w-[480px] p-lg rounded-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-secondary text-base font-bold" onClick={() => setActiveGroceryForecast(null)}>✕</button>
            
            <h3 className="font-bold text-primary text-base mb-2">Tobit Latent Demand Prediction</h3>
            <p className="text-xs text-secondary mb-md">Solving stockout censoring bias for <strong>{activeGroceryForecast.brand} {activeGroceryForecast.name}</strong>.</p>
            
            <div className="bg-black/30 border border-surface-variant p-md rounded-lg space-y-2 font-mono-label text-xs mb-lg">
              <div className="flex justify-between">
                <span>Observed Sales (Censored):</span>
                <span className="text-error font-bold">0 units (Stockout)</span>
              </div>
              <div className="flex justify-between border-t border-surface-variant pt-2">
                <span>Imputed Latent Demand:</span>
                <span className="text-emerald-500 font-bold">{activeGroceryForecast.latent_demand} units / day</span>
              </div>
              <div className="flex justify-between border-t border-surface-variant pt-2">
                <span>Recommended Replenishment:</span>
                <span className="text-primary-container font-bold">{activeGroceryForecast.restock_suggestion} units</span>
              </div>
            </div>

            <p className="text-[11px] text-secondary leading-relaxed mb-lg">
              Because stock dropped to 0, standard inventory regressors predict demand of 0. The Tobit MLE model recovers latent demand parameters dynamically, preventing under-replenishment.
            </p>

            <button className="w-full bg-primary text-on-primary-container py-2 rounded-lg font-bold text-xs" onClick={() => setActiveGroceryForecast(null)}>
              Dismiss Forecast Console
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
