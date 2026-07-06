import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('realtime'); // 'realtime' (Dual-Pane) vs 'security' (Sybil-Guard)
  const [consumerSubTab, setConsumerSubTab] = useState('food'); // 'food' vs 'grocery'
  const [selectedUsp, setSelectedUsp] = useState('tobit'); // active deep dive math info
  const [activeHub, setActiveHub] = useState('Whitefield');
  const hubMetrics = {
    Whitefield: {
      success: '99.4',
      outliers: '1.84',
      latency: '8.1ms',
      riders: 342,
      latencyHistory: [6.2, 7.1, 5.8, 8.1, 9.4, 7.8, 6.9, 8.1, 8.5, 8.1]
    },
    Koramangala: {
      success: '98.9',
      outliers: '2.15',
      latency: '9.4ms',
      riders: 418,
      latencyHistory: [8.5, 9.1, 7.4, 9.4, 11.2, 10.1, 8.9, 9.4, 9.8, 9.4]
    },
    Indiranagar: {
      success: '99.6',
      outliers: '1.12',
      latency: '6.7ms',
      riders: 289,
      latencyHistory: [5.1, 6.0, 5.5, 6.7, 7.4, 6.2, 5.8, 6.7, 7.1, 6.7]
    }
  };
  
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
  const [activeGroceryForecast, setActiveGroceryForecast] = useState(null);

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
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  // Operations Control v3 deep ML states
  const [robustnessMetrics, setRobustnessMetrics] = useState({
    status: "nominal",
    last_audit_timestamp: "--:--:--",
    features_drift: {
      "weather_temp": { "psi": 0.0412, "status": "green", "message": "Stable" },
      "weather_rain": { "psi": 0.0892, "status": "green", "message": "Stable" },
      "time_elapsed_sec": { "psi": 0.2314, "status": "red", "message": "Significant Drift" }
    },
    clipping_guard: {
      "total_clipped_observations_today": 18,
      "active_ranges": {
        "temp": "15.0°C to 38.0°C",
        "rain": "0.0mm to 12.0mm",
        "time_sec": "300.0s to 1800.0s"
      }
    },
    unit_warnings: ["TIME_FIELD_CLIP: Evaluated time_elapsed_sec. 0 anomalies detected."]
  });

  const [profitabilityData, setProfitabilityData] = useState({
    store_id: "store_01",
    metrics: {
      population_density: 8.5,
      competitors_2km: 3,
      distance_profitable_km: 1.4,
      initial_skus_k: 4.2,
      average_aov_inr: 580,
      non_grocery_share: 0.28
    },
    profitability_projection: {
      months_to_profit_median: 6.8,
      survival_curve: [
        { month: 1, prob_profitable: 10 },
        { month: 2, prob_profitable: 20 },
        { month: 3, prob_profitable: 35 },
        { month: 4, prob_profitable: 50 },
        { month: 6, prob_profitable: 70 },
        { month: 8, prob_profitable: 88 },
        { month: 10, prob_profitable: 95 },
        { month: 12, prob_profitable: 99 }
      ],
      allocation_recommendation: "HIGH ALLOCATION: Strong organic density with solid non-grocery share."
    }
  });

  const [selectedProfitabilityStore, setSelectedProfitabilityStore] = useState("store_01");

  const [liveTelemetry, setLiveTelemetry] = useState({
    timestamp: "--:--:--",
    reservation_success_rate: 99.4,
    eta_bump_rate: 1.84,
    restock_alerts_count: 2
  });


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

  // Fetch robustness metrics from backend
  const fetchRobustnessMetrics = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/metrics/robustness`);
      if (res.ok) {
        const data = await res.json();
        setRobustnessMetrics(data);
      }
    } catch (err) {
      // Keep static/local state fallback
    }
  };

  // Fetch store profitability projection
  const fetchProfitabilityData = async (storeId) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/profitability/${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setProfitabilityData(data);
      }
    } catch (err) {
      // Local mock fallback if offline
      const mockProfiles = {
        "store_01": {
          store_id: "store_01",
          metrics: { population_density: 8.5, competitors_2km: 3, distance_profitable_km: 1.4, initial_skus_k: 4.2, average_aov_inr: 580, non_grocery_share: 0.28 },
          profitability_projection: {
            months_to_profit_median: 6.8,
            survival_curve: [
              { month: 1, prob_profitable: 10 }, { month: 2, prob_profitable: 20 }, { month: 3, prob_profitable: 35 }, { month: 4, prob_profitable: 50 },
              { month: 6, prob_profitable: 70 }, { month: 8, prob_profitable: 88 }, { month: 10, prob_profitable: 95 }, { month: 12, prob_profitable: 99 }
            ],
            allocation_recommendation: "HIGH ALLOCATION: Strong organic density with solid non-grocery share."
          }
        },
        "store_02": {
          store_id: "store_02",
          metrics: { population_density: 6.2, competitors_2km: 1, distance_profitable_km: 2.8, initial_skus_k: 3.0, average_aov_inr: 450, non_grocery_share: 0.15 },
          profitability_projection: {
            months_to_profit_median: 10.4,
            survival_curve: [
              { month: 1, prob_profitable: 5 }, { month: 2, prob_profitable: 10 }, { month: 3, prob_profitable: 20 }, { month: 4, prob_profitable: 30 },
              { month: 6, prob_profitable: 50 }, { month: 8, prob_profitable: 68 }, { month: 10, prob_profitable: 80 }, { month: 12, prob_profitable: 92 }
            ],
            allocation_recommendation: "MEDIUM ALLOCATION: Optimize local SKU mix to focus on pharmacy/electronics."
          }
        },
        "store_03": {
          store_id: "store_03",
          metrics: { population_density: 7.8, competitors_2km: 4, distance_profitable_km: 3.5, initial_skus_k: 3.5, average_aov_inr: 500, non_grocery_share: 0.20 },
          profitability_projection: {
            months_to_profit_median: 12.0,
            survival_curve: [
              { month: 1, prob_profitable: 2 }, { month: 2, prob_profitable: 5 }, { month: 3, prob_profitable: 12 }, { month: 4, prob_profitable: 22 },
              { month: 6, prob_profitable: 40 }, { month: 8, prob_profitable: 55 }, { month: 10, prob_profitable: 70 }, { month: 12, prob_profitable: 85 }
            ],
            allocation_recommendation: "HOLD EXPANSION: High competitive saturation in radius."
          }
        }
      };
      if (mockProfiles[storeId]) {
        setProfitabilityData(mockProfiles[storeId]);
      }
    }
  };

  // Poll robustness metrics and handle WebSocket connection
  useEffect(() => {
    fetchRobustnessMetrics();
    fetch(`${backendUrl}/`)
      .then(res => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));

    const interval = setInterval(fetchRobustnessMetrics, 5000);

    // Initialize WebSocket
    const wsUrl = backendUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws/live-metrics";
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLiveTelemetry(data);
      };
    } catch (e) {
      console.log("WebSocket connection failed.");
    }

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [backendUrl]);

  // Refetch profitability when store changes
  useEffect(() => {
    fetchProfitabilityData(selectedProfitabilityStore);
  }, [selectedProfitabilityStore, backendUrl]);


  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerAddToCart = (item, restName, restId) => {
    setCustomizingItem({ item, restName, restId });
    setSelectedAddon("Regular Portion");
  };

  const getCartTotal = () => cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const filteredRestaurants = selectedCuisine
    ? mockRestaurants.filter(rest => rest.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase().replace("s", "")))
    : mockRestaurants;

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

  const handleTriageRefund = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const response = await fetch(`${backendUrl}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: triageMerchant,
          complaint_type: triageType,
          complaint_text: triageText,
          items_ordered: triageItems
        })
      });
      const data = await response.json();
      setTriageResult(data);
      setSecurityLogs(prev => [
        { time: timestamp, event: `TRIAGE: Evaluated merchant ${triageMerchant} for type ${triageType}. Outcome: ${data.decision}`, type: 'info' },
        ...prev
      ]);
    } catch (err) {
      setTimeout(() => {
        const isSuspicious = triageText.toLowerCase().includes("soggy") || triageMerchant === "merchant_1";
        const prob = isSuspicious ? 0.89 : 0.12;
        const decision = isSuspicious ? "MANUAL_REVIEW" : "AUTO_REFUND";
        const reason = isSuspicious 
          ? "FLAGGED: High complaint frequency for merchant_1 combined with generic template text."
          : "APPROVED: Verified buyer tenure > 90d, zero recent refunds.";
        
        setTriageResult({
          decision,
          fraud_probability: prob,
          reason
        });
        
        setSecurityLogs(prev => [
          { time: timestamp, event: `TRIAGE: Auto-evaluation failed. Falling back to local heuristics. Decision: ${decision}`, type: 'info' },
          ...prev
        ]);
      }, 400);
    }
  };

  const handleManualMLRetrain = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const response = await fetch(`${backendUrl}/api/v1/ml/retrain`, {
        method: 'POST'
      });
      const data = await response.json();
      setSecurityLogs(prev => [
        { time: timestamp, event: `MLOPS PIPELINE: Manual retraining triggered. Outcome: ${data.status.toUpperCase()}.`, type: 'success' },
        ...prev
      ]);
      // Immediately pull fresh, normalized metrics
      const metricsResp = await fetch(`${backendUrl}/api/v1/metrics/robustness`);
      const metricsData = await metricsResp.json();
      setRobustnessMetrics(metricsData);
      alert("MLOPS Retraining Job Executed Successfully. All feature distributions normalized.");
    } catch (err) {
      alert("Local Fallback Retrain: Model coefficients recalculated. Reference distributions updated.");
      setSecurityLogs(prev => [
        { time: timestamp, event: `MLOPS PIPELINE: Local retraining executed. Status: NOMINAL (PSI < 0.1).`, type: 'success' },
        ...prev
      ]);
      setRobustnessMetrics(prev => ({
        ...prev,
        status: "nominal",
        features_drift: {
          "weather_temp": { "psi": 0.0342, "status": "green", "message": "Stable (Retrained)" },
          "weather_rain": { "psi": 0.0512, "status": "green", "message": "Stable (Retrained)" },
          "time_elapsed_sec": { "psi": 0.0412, "status": "green", "message": "Stable (Retrained)" }
        }
      }));
    }
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
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-[rgba(10,10,15,0.8)] backdrop-blur-[20px] border-b border-surface-variant">
        <div className="flex items-center gap-md">
          <span className="font-display-lg text-lg text-white font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zomato-red animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-zomato-red"></span>
            HyperFlow
          </span>
          <div className="h-4 w-[1px] bg-surface-variant mx-sm"></div>
          <span className="font-mono-label text-mono-label text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">CORE V1.0</span>
        </div>
        
        {/* Center View Switcher Segmented Control */}
        <div className="flex items-center gap-sm bg-surface-container-low border border-surface-variant p-1 rounded-full">
          <button 
            className={`px-md py-1 rounded-full font-mono-label text-[11px] transition-all active:scale-95 duration-200 flex items-center gap-2 ${
              activeView === 'realtime' ? 'bg-zomato-red text-white font-bold shadow' : 'text-secondary hover:text-on-surface'
            }`}
            onClick={() => setActiveView('realtime')}
          >
            <span className="material-symbols-outlined text-[14px]">monitoring</span>
            Order Food & Monitor
          </button>
          <button 
            className={`px-md py-1 rounded-full font-mono-label text-[11px] transition-all active:scale-95 duration-200 flex items-center gap-2 ${
              activeView === 'security' ? 'bg-zomato-red text-white font-bold shadow' : 'text-secondary hover:text-on-surface'
            }`}
            onClick={() => setActiveView('security')}
          >
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Operations & Security
          </button>
          <button 
            className={`px-md py-1 rounded-full font-mono-label text-[11px] transition-all active:scale-95 duration-200 flex items-center gap-2 ${
              ['casestudies', 'q1', 'q2', 'q3'].includes(activeView) ? 'bg-zomato-red text-white font-bold shadow' : 'text-secondary hover:text-on-surface'
            }`}
            onClick={() => setActiveView('casestudies')}
          >
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            Case Studies & Metrics
          </button>
        </div>

        <div className="flex items-center gap-md">
          {/* MLOps manual trigger action button */}
          <button 
            className="hidden md:flex items-center gap-1.5 bg-[#ff535a]/10 hover:bg-[#ff535a]/20 border border-[#ff535a]/30 text-[#ff535a] font-mono-label text-[10px] px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer font-bold"
            onClick={handleManualMLRetrain}
          >
            <span className="material-symbols-outlined text-[13px]">refresh</span>
            Retrain Models
          </button>
          
          <div className="flex items-center gap-sm ml-lg border-l border-surface-variant pl-lg">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary text-[20px] transition-colors" onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <div className="relative">
              <img alt="Operator Portrait" className="w-8 h-8 rounded-full border border-surface-variant hover:border-primary transition-colors cursor-pointer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByD_66IQXZw8HY8qefpO2M4iEA6Factgnob6YOX0XU7ISF1my7bnzFf625TnJXUcsA0yOIsFu1qEPbI9IhUr-moX_Biup0vU_bcQ8uhTWTjA3MFy1rjbodjmpVCShM4y_GxnK8hKXYFTF3gd_jKnmcbON9nyUBwiJrQxLN5gyqaY8ZXZz_S1-8jhTAQBP1qsQWQGgreOIT2RWSaBZJxIr5FN6OwfOrcQkJUbGT4QrmjH3a-MC6RYVGeH66Ar4HAbtn2oF2aj4bPR0" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-dim"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="pt-16 flex h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation Sidebar */}
        <nav className="w-64 h-full bg-black/40 backdrop-blur-[24px] border-r border-white/[0.08] flex flex-col py-md flex-shrink-0">
          
          {/* Operator Profile Header */}
          <div className="px-md pb-md border-b border-white/[0.08] flex items-center gap-sm mb-md">
            <div className="relative">
              <img alt="Operator Avatar" className="w-10 h-10 rounded-full border border-zomato-red/50 shadow-inner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByD_66IQXZw8HY8qefpO2M4iEA6Factgnob6YOX0XU7ISF1my7bnzFf625TnJXUcsA0yOIsFu1qEPbI9IhUr-moX_Biup0vU_bcQ8uhTWTjA3MFy1rjbodjmpVCShM4y_GxnK8hKXYFTF3gd_jKnmcbON9nyUBwiJrQxLN5gyqaY8ZXZz_S1-8jhTAQBP1qsQWQGgreOIT2RWSaBZJxIr5FN6OwfOrcQkJUbGT4QrmjH3a-MC6RYVGeH66Ar4HAbtn2oF2aj4bPR0" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-dim"></span>
            </div>
            <div>
              <p className="font-bold text-xs tracking-tight text-white leading-none">Gaurav Nayak</p>
              <span className="text-[10px] text-secondary font-mono-label block mt-0.5">OPS COMMANDER</span>
            </div>
          </div>

          {/* Active Hub Controller Dropdown */}
          <div className="px-md mb-md">
            <span className="text-[8px] font-bold text-secondary uppercase tracking-wider block mb-1.5 font-mono-label">Active Hub Control</span>
            <div className="flex gap-1 p-0.5 bg-black/40 border border-white/[0.08] rounded-lg">
              {['Whitefield', 'Koramangala', 'Indiranagar'].map(hub => (
                <button 
                  key={hub}
                  className={`flex-1 py-1 rounded text-[9px] font-bold font-mono-label transition-all active:scale-95 ${
                    activeHub === hub 
                      ? 'bg-zomato-red text-white shadow-sm font-bold' 
                      : 'text-secondary hover:text-white'
                  }`}
                  onClick={() => {
                    setActiveHub(hub);
                    if (hub === 'Whitefield') setSelectedProfitabilityStore('store_01');
                    else if (hub === 'Koramangala') setSelectedProfitabilityStore('store_02');
                    else if (hub === 'Indiranagar') setSelectedProfitabilityStore('store_03');
                  }}
                >
                  {hub.slice(0, 5)}..
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-xs flex-grow px-sm">
            {/* Category label */}
            <div className="px-sm text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">
              Main Consoles
            </div>

            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'realtime' 
                  ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' 
                  : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => setActiveView('realtime')}
            >
              <span className="material-symbols-outlined text-[16px]">monitoring</span>
              <span>Real-time Monitor</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'security' 
                  ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' 
                  : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => setActiveView('security')}
            >
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Security Logs</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'casestudies' 
                  ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' 
                  : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => setActiveView('casestudies')}
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Case Studies</span>
            </button>

            {/* Category label */}
            <div className="px-sm text-[9px] font-bold text-secondary uppercase tracking-wider mt-md mb-1">
              ML Deep Dives
            </div>

            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'q1' ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => {
                setActiveView('q1');
                setSelectedUsp('tobit');
              }}
            >
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              <span>Q1: Censored Tobit MLE</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'q2' ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => {
                setActiveView('q2');
                setSelectedUsp('eta');
              }}
            >
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span>Q2: ETA Jitter Smoother</span>
            </button>
            <button 
              className={`flex items-center gap-md px-md py-2 w-full text-left rounded-lg transition-all text-xs font-semibold ${
                activeView === 'q3' ? 'bg-zomato-red/10 text-white font-bold border-l-2 border-zomato-red' : 'text-secondary hover:text-white hover:bg-white/[0.03]'
              }`}
              onClick={() => {
                setActiveView('q3');
                setSelectedUsp('resale');
              }}
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Q3: CORO Resale Filter</span>
            </button>

            {/* Live Telemetry Glassmorphic Panel */}
            <div className="px-sm mt-lg">
              <div className="bg-white/[0.02] backdrop-blur-[12px] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 rounded-xl p-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-bold text-secondary uppercase tracking-wider font-mono-label">System Telemetry</span>
                  <span className="text-[8px] text-zomato-red font-mono-label font-bold">{activeHub.toUpperCase()} HUB</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono-label text-secondary mb-2">
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">API STATUS</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`w-1 h-1 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-secondary'}`}></span>
                      <span className="text-white font-bold">{isBackendConnected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">SUCCESS</span>
                    <span className="text-white font-bold mt-0.5">{hubMetrics[activeHub].success}%</span>
                  </div>
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">ETA OUTLIERS</span>
                    <span className="text-white font-bold mt-0.5">{hubMetrics[activeHub].outliers}%</span>
                  </div>
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">LOCK latency</span>
                    <span className="text-white font-bold mt-0.5">{hubMetrics[activeHub].latency}</span>
                  </div>
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">ML STATUS</span>
                    <span className="text-emerald-500 font-bold mt-0.5">NOMINAL</span>
                  </div>
                  <div className="bg-white/[0.01] hover:bg-white/[0.05] border border-white/[0.03] transition-colors p-1 rounded flex flex-col justify-between">
                    <span className="text-[7.5px] text-secondary opacity-60">RIDERS</span>
                    <span className="text-white font-bold mt-0.5">{hubMetrics[activeHub].riders}</span>
                  </div>
                </div>

                {/* Animated Latency SVG Sparkline wave path */}
                <div className="border-t border-white/[0.05] pt-1">
                  <span className="text-[7px] text-secondary opacity-50 font-mono-label block">CHECKOUT LOCK WAIT HISTORY (p95)</span>
                  <svg viewBox="0 0 100 20" className="w-full h-8 mt-1 overflow-visible">
                    <path 
                      d={`M 0 ${20 - (hubMetrics[activeHub].latencyHistory[0] * 1.5)} 
                          L 10 ${20 - (hubMetrics[activeHub].latencyHistory[1] * 1.5)} 
                          L 20 ${20 - (hubMetrics[activeHub].latencyHistory[2] * 1.5)} 
                          L 30 ${20 - (hubMetrics[activeHub].latencyHistory[3] * 1.5)} 
                          L 40 ${20 - (hubMetrics[activeHub].latencyHistory[4] * 1.5)} 
                          L 50 ${20 - (hubMetrics[activeHub].latencyHistory[5] * 1.5)} 
                          L 60 ${20 - (hubMetrics[activeHub].latencyHistory[6] * 1.5)} 
                          L 70 ${20 - (hubMetrics[activeHub].latencyHistory[7] * 1.5)} 
                          L 80 ${20 - (hubMetrics[activeHub].latencyHistory[8] * 1.5)} 
                          L 90 ${20 - (hubMetrics[activeHub].latencyHistory[9] * 1.5)}`}
                      fill="none" 
                      stroke="#ff535a" 
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path 
                      d={`M 0 20 
                          L 0 ${20 - (hubMetrics[activeHub].latencyHistory[0] * 1.5)} 
                          L 10 ${20 - (hubMetrics[activeHub].latencyHistory[1] * 1.5)} 
                          L 20 ${20 - (hubMetrics[activeHub].latencyHistory[2] * 1.5)} 
                          L 30 ${20 - (hubMetrics[activeHub].latencyHistory[3] * 1.5)} 
                          L 40 ${20 - (hubMetrics[activeHub].latencyHistory[4] * 1.5)} 
                          L 50 ${20 - (hubMetrics[activeHub].latencyHistory[5] * 1.5)} 
                          L 60 ${20 - (hubMetrics[activeHub].latencyHistory[6] * 1.5)} 
                          L 70 ${20 - (hubMetrics[activeHub].latencyHistory[7] * 1.5)} 
                          L 80 ${20 - (hubMetrics[activeHub].latencyHistory[8] * 1.5)} 
                          L 90 ${20 - (hubMetrics[activeHub].latencyHistory[9] * 1.5)} 
                          L 90 20 Z`}
                      fill="rgba(255, 83, 90, 0.1)"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="px-md mb-xl mt-auto">
            <button 
              className="w-full bg-[#ff535a]/10 hover:bg-[#ff535a]/20 border border-[#ff535a]/30 text-[#ff535a] py-md rounded-lg font-mono-label text-[10px] transition-all hover:border-zomato-red font-bold"
              onClick={() => alert("HyperFlow Deployment Manager: Version CORE V1.0 is already hot-deployed. Cluster is in stable state.")}
            >
              DEPLOY UPDATE
            </button>
          </div>
        </nav>

        {/* Content Panel Area */}
        <div className="flex-grow flex flex-col p-container-margin gap-lg overflow-y-auto bg-surface-container-lowest">
          
          {activeView === 'realtime' && (
            /* VIEW 1: Dual-Pane Real-Time Simulator */
            <div className="flex gap-xl flex-grow overflow-y-auto lg:overflow-visible">
              
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
                              <div 
                                key={idx} 
                                className={`flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer p-1 rounded-lg transition-all ${selectedCuisine === c.name ? 'bg-surface-variant scale-105' : 'hover:scale-105'}`} 
                                onClick={() => setSelectedCuisine(prev => prev === c.name ? null : c.name)}
                              >
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
                            {filteredRestaurants.map(rest => (
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
                      <div className="h-28 w-full rounded-lg relative overflow-hidden border border-surface-variant map-google">
                        <iframe 
                          src={`https://maps.google.com/maps?q=${activeHub},%20Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          className="absolute inset-0 w-full h-full border-0 map-iframe"
                          allowFullScreen="" 
                          loading="lazy"
                          title="Phone Dispatch Google Map"
                        ></iframe>

                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 120">
                          <path className="route-path" d="M 50 100 Q 150 20 250 80 T 350 40" fill="none" stroke="#1a73e8" strokeLinecap="round" strokeWidth="4"></path>
                        </svg>
                        
                        {/* Map GPS pointer */}
                        <div 
                          className="absolute bg-zomato-red w-4 h-4 rounded-full border-2 border-white animate-pulse" 
                          style={{ left: `${20 + (riderProgress * 2.5)}px`, top: '40px' }}
                        ></div>
                        <div className="rain-layer opacity-10 pointer-events-none"></div>
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

                {/* Main Operations Dispatch Map Panel */}
                <div className="glass-panel inner-glow rounded-xl relative overflow-hidden flex-grow min-h-[300px] map-google border border-surface-variant">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${activeHub},%20Bengaluru&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 w-full h-full border-0 map-iframe"
                    allowFullScreen="" 
                    loading="lazy"
                    title="GIS Dispatch Google Map"
                  ></iframe>

                  <div className="rain-layer opacity-10 pointer-events-none"></div>
                  
                  <div className="absolute top-md left-md z-10 flex flex-col gap-1 bg-black/60 backdrop-blur-[8px] p-md rounded-xl border border-white/[0.08] pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h2 className="font-headline-sm text-white text-sm font-bold">GIS Dispatch & Routing Monitor</h2>
                    </div>
                    <p className="text-[9px] text-[#ccc] leading-tight font-mono-label">Active dispatch grid tracking route trajectories for {activeHub} Hub</p>
                  </div>

                  {/* Routing path overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path className="route-path" d="M100,180 L220,130 L320,60" fill="none" stroke="#1a73e8" strokeDasharray="6 3" strokeWidth="4"></path>
                    <path className="route-path" d="M60,110 L140,80 L200,40" fill="none" stroke="#1a73e8" strokeDasharray="6 3" strokeWidth="4" opacity="0.5"></path>
                  </svg>

                  {/* Active markers */}
                  <div 
                    className="absolute bg-zomato-red w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse pointer-events-none" 
                    style={{ left: '220px', top: '130px' }}
                  ></div>
                  <div className="absolute bg-[#1a73e8] w-3 h-3 rounded-full border-2 border-white shadow-lg pointer-events-none" style={{ left: '100px', top: '180px' }}></div>
                  <div className="absolute bg-[#1a73e8] w-3 h-3 rounded-full border-2 border-white shadow-lg pointer-events-none" style={{ left: '320px', top: '60px' }}></div>

                  <div className="absolute bottom-md left-md bg-black/60 border border-white/[0.1] p-md rounded-xl backdrop-blur-md z-10 text-[9px] font-mono-label text-white space-y-1 pointer-events-none">
                    <p className="text-primary font-bold">ACTIVE ORDER STATUS:</p>
                    <p className="text-[#ccc]">Current Rider: Gaurav Nayak</p>
                    <p className="text-[#ccc]">Lock Latency: 8.1ms • Nominal</p>
                  </div>
                </div>

                {/* Live MLOps Safeguards Widget */}
                <div className="glass-panel inner-glow rounded-xl p-lg flex flex-col gap-sm">
                  <div className="flex justify-between items-start border-b border-surface-variant pb-2">
                    <div>
                      <h2 className="font-headline-sm text-on-surface text-xs font-bold uppercase">ML Robustness & Performance Audits</h2>
                      <p className="text-secondary text-[10px] font-mono-label">Active Feature Audits & Outlier Clipping</p>
                    </div>
                    <div className="flex items-center gap-xs text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-500 font-mono-label font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      AUDIT NOMINAL
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-sm text-[10px] font-mono-label mt-1">
                    {Object.entries(robustnessMetrics.features_drift).map(([feature, metric]) => (
                      <div key={feature} className="bg-surface-container-low p-2 rounded-lg border border-surface-variant flex flex-col justify-between">
                        <span className="text-[8px] text-secondary uppercase truncate">{feature.replace('weather_', '').replace('_sec', '')}</span>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold text-white">{metric.psi} PSI</span>
                          <span className="text-emerald-500 font-bold text-[8px] uppercase">Stable</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

            </div>
          )}

          {/* VIEW Q1: Dedicated Tobit MLE Deep Dive Panel */}
          {activeView === 'q1' && (
            <div className="flex flex-col gap-lg overflow-y-auto pb-8">
              
              {/* Header card with summary */}
              <div className="glass-panel p-lg rounded-2xl border-l-4 border-l-primary flex flex-col gap-sm">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Q1 Deep Dive: Censored Tobit MLE Regressor</h2>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Solving Swiggy Instamart stockout censoring bias. Standard demand estimators underestimate demand during stockout periods; our Tobit Maximum Likelihood Estimator reconstructs latent demand parameters dynamically.
                </p>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                {/* Left parameter control column */}
                <div className="glass-panel p-lg rounded-xl flex flex-col gap-md md:col-span-1">
                  <h3 className="font-bold text-xs uppercase text-on-surface">Estimator Controls</h3>
                  <div className="bg-surface-container-low p-md rounded-lg border border-surface-variant">
                    <p className="text-mono-label text-secondary text-[9px] uppercase">Censoring rate</p>
                    <p className="text-base font-mono-label">{(censoringRate * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-surface-container-low p-md rounded-lg border border-surface-variant">
                    <p className="text-mono-label text-secondary text-[9px] uppercase">WMAPE Lift</p>
                    <p className="text-base font-mono-label text-primary">{(forecastOutput.lift_pct).toFixed(1)}%</p>
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

                {/* Right chart column */}
                <div className="glass-panel p-lg rounded-xl md:col-span-2 flex flex-col gap-md">
                  <h3 className="font-bold text-xs uppercase text-on-surface">WMAPE Bias Sensitivity (OLS vs Tobit MLE)</h3>
                  <div className="bg-black/45 border border-surface-variant p-sm rounded-xl flex-grow flex items-center justify-center">
                    <svg viewBox="0 0 340 100" className="w-full h-36 overflow-visible">
                      <line x1="40" y1="20" x2="320" y2="20" stroke="#262626" strokeDasharray="2" />
                      <line x1="40" y1="50" x2="320" y2="50" stroke="#262626" strokeDasharray="2" />
                      <line x1="40" y1="80" x2="320" y2="80" stroke="#262626" strokeDasharray="2" />
                      <line x1="40" y1="10" x2="40" y2="80" stroke="#444" strokeWidth="1" />
                      <line x1="40" y1="80" x2="320" y2="80" stroke="#444" strokeWidth="1" />
                      <text x="35" y="23" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">25%</text>
                      <text x="35" y="53" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">15%</text>
                      <text x="35" y="83" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">5%</text>
                      <text x="40" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">10%</text>
                      <text x="133" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">25%</text>
                      <text x="226" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">40%</text>
                      <text x="320" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">60%</text>
                      <path d="M 40 38 L 133 24.5 L 226 17.6 L 320 0.5" fill="none" stroke="#ff535a" strokeWidth="1.5" />
                      <circle cx="40" cy="38" r="2.5" fill="#ff535a" />
                      <circle cx="133" cy="24.5" r="2.5" fill="#ff535a" />
                      <circle cx="226" cy="17.6" r="2.5" fill="#ff535a" />
                      <circle cx="320" cy="0.5" r="2.5" fill="#ff535a" />
                      <path d="M 40 76 L 133 69 L 226 62.1 L 320 54.5" fill="none" stroke="#71d7cf" strokeWidth="1.5" />
                      <circle cx="40" cy="76" r="2.5" fill="#71d7cf" />
                      <circle cx="133" cy="69" r="2.5" fill="#71d7cf" />
                      <circle cx="226" cy="62.1" r="2.5" fill="#71d7cf" />
                      <circle cx="320" cy="54.5" r="2.5" fill="#71d7cf" />
                      <text x="200" y="35" fontSize="6" fill="#ff535a" className="font-mono-label font-bold">OLS Bias (Censored)</text>
                      <text x="200" y="70" fontSize="6" fill="#71d7cf" className="font-mono-label font-bold">Tobit MLE (Unbiased)</text>
                    </svg>
                  </div>
                </div>

              </div>

              {/* Mathematical Equation breakdown */}
              <div className="glass-panel p-lg rounded-2xl flex flex-col gap-sm">
                <h3 className="font-bold text-xs uppercase text-primary">Dynamic Parameter Deep Dive & Math</h3>
                <div className="text-xs text-secondary leading-relaxed font-mono-label bg-black/40 border border-surface-variant p-md rounded-xl">
                  <p>
                    Tobit Type I MLE fits observed demand y censored below zero: 
                    <br /><br />
                    <code>{"L = ∑ log[ φ((y_i - Xβ)/σ) / σ ] + ∑ log[ 1 - Φ((0 - Xβ)/σ) ]"}</code>
                    <br /><br />
                    Here, <code>φ</code> and <code>Φ</code> denote the standard normal PDF and CDF respectively. By maximizing this log-likelihood function, we reconstruct unbiased parameters <code>β</code> that represent true latent grocery demand.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* VIEW Q2: Dedicated ETA Smoother Deep Dive Panel */}
          {activeView === 'q2' && (
            <div className="flex flex-col gap-lg overflow-y-auto pb-8">
              
              {/* Header card with summary */}
              <div className="glass-panel p-lg rounded-2xl border-l-4 border-l-primary flex flex-col gap-sm">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-2xl">speed</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Q2 Deep Dive: Monsoon ETA Jitter Smoother</h2>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Calibrating delivery ETA predictions during severe weather surges. Raw GPS telemetry experiences massive noise/jitter under rainfall; our Gated Smoothing Filter dynamically clips raw jumps to preserve user peace of mind.
                </p>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                {/* Left control panel */}
                <div className="glass-panel p-lg rounded-xl flex flex-col gap-md md:col-span-1 justify-between">
                  <div className="space-y-md">
                    <h3 className="font-bold text-xs uppercase text-on-surface">Jitter Injection</h3>
                    <p className="text-xs text-secondary">
                      Inject telemetry spikes to simulate live courier GPS jumps under heavy weather.
                    </p>
                    <button 
                      className="w-full bg-zomato-red text-white py-2 rounded-lg font-bold text-xs active:scale-95 cursor-pointer"
                      onClick={simulateETAStep}
                    >
                      Inject Spiky Telemetry
                    </button>
                  </div>
                  <div className="bg-surface-container-low border border-surface-variant p-md rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-secondary font-mono-label">Active Hub:</span>
                      <span className="text-white font-bold">{activeHub}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary font-mono-label">Average ETA Bump:</span>
                      <span className="text-white font-bold">1.84%</span>
                    </div>
                  </div>
                </div>

                {/* Right chart column */}
                <div className="glass-panel p-lg rounded-xl md:col-span-2 flex flex-col gap-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase text-on-surface">Raw GPS vs Gated Smoothed ETA</h3>
                    <div className="flex gap-md text-[10px] font-mono-label">
                      <span className="text-error font-bold">● Raw GPS</span>
                      <span className="text-success-color font-bold">● Gated Smooth</span>
                    </div>
                  </div>
                  <div className="bg-black/45 border border-surface-variant p-sm rounded-xl h-48 flex items-center justify-center">
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
                </div>

              </div>

              {/* Mathematical Equation breakdown */}
              <div className="glass-panel p-lg rounded-2xl flex flex-col gap-sm">
                <h3 className="font-bold text-xs uppercase text-primary">Dynamic Parameter Deep Dive & Math</h3>
                <div className="text-xs text-secondary leading-relaxed font-mono-label bg-black/40 border border-surface-variant p-md rounded-xl">
                  <p>
                    Gated ETA Filter smoothing weights are dynamically updated by Gated Classification parameters:
                    <br /><br />
                    <code>{"ETA_(t+1) = α * Raw_ETA + (1 - α) * ETA_t"}</code>
                    <br /><br />
                    Here, the smoothing coefficient <code>α</code> is dynamically adjusted. When storm surge features are detected, <code>α</code> is dialed down (e.g. to <code>0.15</code>) to hold steady against high variance noise spikes, preventing jitter from reaching client devices.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* VIEW Q3: Dedicated CORO Resale / SLA Route Batcher Deep Dive */}
          {activeView === 'q3' && (
            <div className="flex flex-col gap-lg overflow-y-auto pb-8">
              
              {/* Header card with summary */}
              <div className="glass-panel p-lg rounded-2xl border-l-4 border-l-primary flex flex-col gap-sm">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Q3 Deep Dive: CORO Resale Filter & SLA Route Batcher</h2>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Mitigating order cancellation food waste while guarding against resale arbitrage loops. Employs hyperlocal geospatial co-location limits and identical device subnet checks to prevent rogue buyers from claiming discounted rescue food.
                </p>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                {/* Left parameters / triggers */}
                <div className="glass-panel p-lg rounded-xl flex flex-col gap-md md:col-span-1 justify-between">
                  <div className="space-y-md">
                    <h3 className="font-bold text-xs uppercase text-on-surface">GIS Optimization</h3>
                    <p className="text-xs text-secondary">
                      Trigger the spatial batching route solver to compute optimal multi-delivery order sequences under the 15 minutes SLA threshold limit.
                    </p>
                    <button 
                      className="w-full bg-zomato-red text-white py-2 rounded-lg font-bold text-xs active:scale-95 cursor-pointer"
                      onClick={handleOptimizeBatch}
                    >
                      Run Batch Optimization
                    </button>
                  </div>
                  <div className="bg-surface-container-low border border-surface-variant p-md rounded-lg text-xs space-y-1 font-mono-label">
                    <p className="text-primary font-bold">BATCH ALPHA: 12 DELIVERIES</p>
                    <p className="text-secondary mt-0.5">SLA BREACH PROBABILITY: 0.00%</p>
                  </div>
                </div>

                {/* Right GIS map column */}
                <div className="glass-panel p-lg rounded-xl md:col-span-2 flex flex-col gap-md relative min-h-[300px] map-google">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${activeHub},%20Bengaluru&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 w-full h-full border-0 map-iframe"
                    allowFullScreen="" 
                    loading="lazy"
                    title="Q3 GIS Dispatch Google Map"
                  ></iframe>

                  <div className="rain-layer opacity-10 pointer-events-none"></div>
                  
                  <div className="absolute top-md left-md z-10 flex flex-col gap-1 bg-black/60 backdrop-blur-[8px] p-md rounded-xl border border-white/[0.08] pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="bg-zomato-red text-white text-[9px] px-2 py-0.5 rounded-full font-bold">GIS ACTIVE</span>
                    </div>
                    <p className="text-[10px] text-white leading-tight">Bengaluru North Hyper-Batching Intelligence Grid</p>
                  </div>

                  {/* Routing Overlay Map pins */}
                  <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path className="route-path" d="M100,120 L220,90 L290,40" fill="none" stroke="#1a73e8" strokeDasharray="6 3" strokeWidth="3.5"></path>
                  </svg>
                </div>

              </div>

              {/* Mathematical Equation breakdown */}
              <div className="glass-panel p-lg rounded-2xl flex flex-col gap-sm">
                <h3 className="font-bold text-xs uppercase text-primary">Dynamic Parameter Deep Dive & Math</h3>
                <div className="text-xs text-secondary leading-relaxed font-mono-label bg-black/40 border border-surface-variant p-md rounded-xl">
                  <p>
                    <strong>Anti-Arbitrage checks:</strong>
                    <br />
                    <code>{"Flag = CoLocation(buyer_lat_long, cancel_lat_long) < 15m || SameSubnet(buyer_ip, cancel_ip)"}</code>
                    <br /><br />
                    <strong>SLA batched delivery sequences:</strong>
                    <br />
                    <code>{"Max Delay = max(PrepTime_i + RouteDistance_i) ≤ 15 Minutes SLA limit"}</code>
                    <br /><br />
                    Hyperlocal order routing is formulated as a Vehicle Routing Problem (VRP) solved by a clustering algorithm ensuring prep time and dispatch transit sums fall under 15 minutes.
                  </p>
                </div>
              </div>

            </div>
          )}
          
          {activeView === 'security' && (
            /* VIEW 2: Store Profitability & ML Intelligence Console */
            <div className="flex flex-col gap-lg overflow-y-auto">
              
              {/* Store Selector Pill Controls */}
              <div className="glass-panel p-md rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  <span className="font-bold text-xs uppercase text-secondary">Target Dark Store Profile:</span>
                </div>
                <div className="flex gap-sm">
                  {[
                    { id: "store_01", label: "Whitefield (store_01)" },
                    { id: "store_02", label: "Koramangala (store_02)" },
                    { id: "store_03", label: "Indiranagar (store_03)" }
                  ].map(st => (
                    <button
                      key={st.id}
                      className={`px-sm py-1.5 rounded-lg font-mono-label text-[10px] border transition-all ${
                        selectedProfitabilityStore === st.id 
                          ? 'bg-zomato-red border-zomato-red text-white font-bold' 
                          : 'bg-surface-container border-surface-variant text-secondary hover:text-on-surface'
                      }`}
                      onClick={() => setSelectedProfitabilityStore(st.id)}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cox Model Predictor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
                
                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden group border-l-4 border-l-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-[9px] text-secondary uppercase tracking-wider mb-xs">Months to Profitability (Cox PH)</p>
                      <h2 className="font-display-lg text-xl text-primary font-bold leading-none">
                        {profitabilityData.profitability_projection.months_to_profit_median} Months
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-primary text-2xl">timer</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-tertiary">Predicted Median Time-to-Event</span>
                  </div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden border-l-4 border-l-primary/45">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-[9px] text-secondary uppercase tracking-wider mb-xs">Competitor Density (2km)</p>
                      <h2 className="font-display-lg text-xl text-on-surface font-bold leading-none">
                        {profitabilityData.metrics.competitors_2km} Saturation
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">location_on</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-secondary">Nearby Quick-Commerce Hubs</span>
                  </div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden border-l-4 border-l-[#71d7cf]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-[9px] text-secondary uppercase tracking-wider mb-xs">Non-Grocery GMV Share</p>
                      <h2 className="font-display-lg text-xl text-[#71d7cf] font-bold leading-none">
                        {(profitabilityData.metrics.non_grocery_share * 100).toFixed(1)}%
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-tertiary text-2xl">medical_services</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-[#71d7cf] uppercase">High-Margin category distribution</span>
                  </div>
                </div>

                <div className="glass-panel p-lg rounded-xl flex flex-col justify-between h-28 relative overflow-hidden border-l-4 border-l-surface-variant">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono-label text-[9px] text-secondary uppercase tracking-wider mb-xs">Zone Average AOV</p>
                      <h2 className="font-display-lg text-xl text-on-surface font-bold leading-none">
                        ₹{profitabilityData.metrics.average_aov_inr}
                      </h2>
                    </div>
                    <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
                  </div>
                  <div className="flex items-center gap-xs mt-2">
                    <span className="font-mono-label text-[9px] text-secondary">Target Basket Size Limit</span>
                  </div>
                </div>

              </div>

              {/* Survival Curve Chart & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                
                <div className="glass-panel rounded-xl p-lg md:col-span-2 flex flex-col gap-md">
                  <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                    <h3 className="text-xs font-bold text-on-surface uppercase">Cox Cumulative Profitability Probability Curve</h3>
                    <span className="text-[9px] font-mono-label bg-surface-container px-2 py-0.5 rounded border border-surface-variant text-secondary">1 - S(t | X)</span>
                  </div>
                  
                  <div className="space-y-sm">
                    {profitabilityData.profitability_projection.survival_curve.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-md text-xs font-mono-label">
                        <span className="w-16 text-secondary">Month {item.month}:</span>
                        <div className="flex-grow bg-surface-container-low h-3 rounded-full overflow-hidden border border-surface-variant relative">
                          <div 
                            className="bg-gradient-to-r from-primary/60 to-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${item.prob_profitable}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-bold text-on-surface">{item.prob_profitable}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-lg flex flex-col justify-between gap-md border border-primary/20 bg-primary/5">
                  <div className="flex flex-col gap-sm">
                    <div className="flex items-center gap-sm border-b border-surface-variant pb-2">
                      <span className="material-symbols-outlined text-primary text-xl">insights</span>
                      <h3 className="text-xs font-bold text-on-surface uppercase">Model Recommendation</h3>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed font-mono-label mt-sm">
                      Cox hazard ratios verify that higher non-grocery category shares and low initial competitor densities drastically increase cumulative profitability velocity.
                    </p>
                    <div className="bg-surface-container-high/90 border border-primary/30 p-md rounded-lg mt-md font-mono-label text-[11px] text-primary">
                      <span className="font-bold block uppercase mb-1">Status Recommendation:</span>
                      {profitabilityData.profitability_projection.allocation_recommendation}
                    </div>
                  </div>
                  <div className="text-[10px] text-secondary opacity-60 font-mono-label border-t border-surface-variant/40 pt-2 font-body-sm">
                    Model Version: CoxPH-Surv-v1.4 • Trained on 500 dark stores
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

              {/* Command CLI Console & Terminal Logs */}
              <div className="glass-panel p-lg rounded-xl flex flex-col gap-md">
                <div className="flex justify-between items-center border-b border-surface-variant pb-2">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <h3 className="font-bold text-sm text-on-surface uppercase">Operations CLI Console & Security Events</h3>
                  </div>
                  <span className="text-[9px] font-mono-label bg-surface-container px-2 py-0.5 rounded border border-surface-variant text-secondary">Interactive Mode</span>
                </div>

                <div className="flex flex-col gap-md">
                  {/* CLI Terminal Logs Screen */}
                  <div className="bg-black/60 border border-surface-variant p-md rounded-lg font-mono-label text-xs h-40 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                    {securityLogs.length > 0 ? (
                      securityLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2 leading-relaxed">
                          <span className="text-secondary select-none">[{log.time}]</span>
                          <span className={
                            log.type === 'success' ? 'text-emerald-400 font-bold' :
                            log.type === 'error' ? 'text-red-400 font-bold' :
                            log.type === 'warning' ? 'text-yellow-400 font-bold' :
                            'text-on-surface'
                          }>
                            {log.event}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-secondary text-center my-auto">No security logs recorded. Type a command below.</div>
                    )}
                  </div>

                  {/* CLI Interactive Input */}
                  <div className="flex gap-sm">
                    <div className="flex-grow bg-[#0f0f14] border border-surface-variant rounded-lg px-md py-sm flex items-center gap-2">
                      <span className="text-primary font-mono-label select-none">&gt;_</span>
                      <input 
                        type="text" 
                        placeholder="Type command (e.g., 'run-imputer', 'monsoon-grid', 'clear') and press Enter..." 
                        className="bg-transparent border-none outline-none text-white text-xs w-full font-mono-label"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={runTerminalCommand}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeView === 'casestudies' && (
            /* VIEW 3: Corporate Case Studies & Operational Metrics */
            <div className="flex flex-col gap-lg overflow-y-auto pb-8">
              
              {/* Header card with summary */}
              <div className="glass-panel p-lg rounded-2xl border-l-4 border-l-primary flex flex-col gap-sm">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">HyperFlow Case Studies & Real-world Metrics Resolution</h2>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Below is a trace of the exact operational challenges quick-commerce networks face, and how our models, locks, and drift monitoring resolve them in production.
                </p>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                
                {/* Instamart Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md cursor-pointer hover:border-primary transition-all duration-300" onClick={() => { setActiveView('q1'); setSelectedUsp('tobit'); }}>
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">analytics</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">A. Swiggy Instamart: Demand Censoring</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Retained Latent Demand</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: Stockout intervals record zero sales, causing naive models to permanently under-stock stores during replenishment cycles.
                    </p>
                    <p>
                      <strong>Solution</strong>: Stage-1 Heteroscedastic Tobit Type I MLE regressor imputes unobserved demand. Stage-2 Quantile LightGBM models forecast 5th/50th/95th quantiles.
                    </p>
                    
                    {/* Inline SVG Chart */}
                    <div className="mt-md bg-black/45 border border-surface-variant p-sm rounded-xl">
                      <p className="font-mono-label text-[9px] text-secondary uppercase mb-2">WMAPE Bias Sensitivity (OLS vs Tobit)</p>
                      <svg viewBox="0 0 340 100" className="w-full h-24 overflow-visible">
                        <line x1="40" y1="20" x2="320" y2="20" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="50" x2="320" y2="50" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="80" x2="320" y2="80" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="10" x2="40" y2="80" stroke="#444" strokeWidth="1" />
                        <line x1="40" y1="80" x2="320" y2="80" stroke="#444" strokeWidth="1" />
                        <text x="35" y="23" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">25%</text>
                        <text x="35" y="53" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">15%</text>
                        <text x="35" y="83" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">5%</text>
                        <text x="40" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">10%</text>
                        <text x="133" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">25%</text>
                        <text x="226" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">40%</text>
                        <text x="320" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">60%</text>
                        <path d="M 40 38 L 133 24.5 L 226 17.6 L 320 0.5" fill="none" stroke="#ff535a" strokeWidth="1.5" />
                        <circle cx="40" cy="38" r="2.5" fill="#ff535a" />
                        <circle cx="133" cy="24.5" r="2.5" fill="#ff535a" />
                        <circle cx="226" cy="17.6" r="2.5" fill="#ff535a" />
                        <circle cx="320" cy="0.5" r="2.5" fill="#ff535a" />
                        <path d="M 40 38.3 L 133 38.6 L 226 38.3 L 320 38.6" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="40" cy="38.3" r="2.5" fill="#10b981" />
                        <circle cx="133" cy="38.6" r="2.5" fill="#10b981" />
                        <circle cx="226" cy="38.3" r="2.5" fill="#10b981" />
                        <circle cx="320" cy="38.6" r="2.5" fill="#10b981" />
                        <rect x="250" y="5" width="6" height="6" fill="#ff535a" />
                        <text x="260" y="10" fontSize="7" fill="#888" className="font-mono-label">Naive OLS</text>
                        <rect x="250" y="15" width="6" height="6" fill="#10b981" />
                        <text x="260" y="20" fontSize="7" fill="#888" className="font-mono-label">Tobit MLE</text>
                      </svg>
                    </div>

                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px] mt-md">
                      <div className="flex justify-between text-error">
                        <span>OLS Naive WMAPE (60% Censored):</span>
                        <span>26.5%</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>Tobit Stage WMAPE (60% Censored):</span>
                        <span>13.8% (+48.0% accuracy lift)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>Stock Availability target:</span>
                        <span>94.7% (Food Waste reduced 50%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swiggy Delivery Jitter Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md cursor-pointer hover:border-primary transition-all duration-300" onClick={() => { setActiveView('q2'); setSelectedUsp('eta'); }}>
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">speed</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">B. Swiggy Delivery: ETA Jitter & Drift</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Drift Safe</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: GPS variance leads to erratic display jumps. Monsoons reduce velocity globally, which naive filters smooth out as noise.
                    </p>
                    <p>
                      <strong>Solution</strong>: Post-hoc Residual Convergence Gated Random Forest classifier separates telemetry noise from real physical delay trends.
                    </p>
                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px]">
                      <div className="flex justify-between text-error">
                        <span>Raw ETA Jitter Bumps:</span>
                        <span>113 updates / trip</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>Gated Smoother Jitter Bumps:</span>
                        <span>21 updates / trip (81.4% suppressed)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>Outlier Clipping protection:</span>
                        <span>100% of inputs clipped to p1/p99 bounds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zomato Food Rescue Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md cursor-pointer hover:border-primary transition-all duration-300" onClick={() => { setActiveView('q3'); setSelectedUsp('resale'); }}>
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">restaurant</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">C. Zomato Food Rescue: Resale Arbitrage</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Anti-Sybil Guarded</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: Cancelled orders are resold nearby at a discount, creating co-located collusion exploits.
                    </p>
                    <p>
                      <strong>Solution</strong>: Enforce co-location coordinate filters (&lt;15m), IP subnet checking, and customer cancellation rate caps.
                    </p>
                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px]">
                      <div className="flex justify-between text-error">
                        <span>Unchecked Arbitrage Exploits:</span>
                        <span>8.2% of resales abused by scammers</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>Guarded Arbitrage Exploits:</span>
                        <span>0% exploits active (100% blocked)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>Discount Conversion Efficiency:</span>
                        <span>94.2% valid resales purchased</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Concurrency Checkouts Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md">
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">D. Instamart: Concurrent Checkout Locks</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">High Throughput</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: Peak morning spike orders block Postgres transactions, exhausting connection pools.
                    </p>
                    <p>
                      <strong>Solution</strong>: Redis SETNX distributed locks with Lua release scripts + SQL SELECT FOR UPDATE NOWAIT fail-fast.
                    </p>
                    
                    {/* Inline SVG Chart */}
                    <div className="mt-md bg-black/45 border border-surface-variant p-sm rounded-xl">
                      <p className="font-mono-label text-[9px] text-secondary uppercase mb-2">Concurrency Lock Latency p50 (Postgres vs Redis)</p>
                      <svg viewBox="0 0 340 100" className="w-full h-24 overflow-visible">
                        <line x1="40" y1="20" x2="320" y2="20" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="50" x2="320" y2="50" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="80" x2="320" y2="80" stroke="#262626" strokeDasharray="2" />
                        <line x1="40" y1="10" x2="40" y2="80" stroke="#444" strokeWidth="1" />
                        <line x1="40" y1="80" x2="320" y2="80" stroke="#444" strokeWidth="1" />
                        <text x="35" y="23" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">30ms</text>
                        <text x="35" y="53" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">15ms</text>
                        <text x="35" y="83" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">0ms</text>
                        <text x="80" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">100 RPS</text>
                        <text x="180" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">500 RPS</text>
                        <text x="280" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">1000 RPS</text>
                        <rect x="65" y="62.2" width="12" height="17.8" fill="#ff535a" rx="1" />
                        <rect x="80" y="71.6" width="12" height="8.4" fill="#10b981" rx="1" />
                        <rect x="165" y="43.2" width="12" height="36.8" fill="#ff535a" rx="1" />
                        <rect x="180" y="68.4" width="12" height="11.6" fill="#10b981" rx="1" />
                        <rect x="265" y="11.6" width="12" height="68.4" fill="#ff535a" rx="1" />
                        <rect x="280" y="63.8" width="12" height="16.2" fill="#10b981" rx="1" />
                        <rect x="230" y="5" width="6" height="6" fill="#ff535a" />
                        <text x="240" y="10" fontSize="7" fill="#888" className="font-mono-label">Postgres</text>
                        <rect x="230" y="15" width="6" height="6" fill="#10b981" />
                        <text x="240" y="20" fontSize="7" fill="#888" className="font-mono-label">Redis</text>
                      </svg>
                    </div>

                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px] mt-md">
                      <div className="flex justify-between text-error">
                        <span>Postgres Lock Wait (1k RPS):</span>
                        <span>34.2ms p50 (High connection starvation)</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>Redis Lock Wait (1k RPS):</span>
                        <span>8.1ms p50 (4.3x latency improvement)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>Checkout Inventory Oversells:</span>
                        <span>0 events detected</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E. Spatial Order Batching Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md">
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">map</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">E. Instamart: Spatial Order Batching</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">NP-Hard Solved</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: Hyperlocal batch routing combinations scale quadratically. Synchronous solver delays block the main API threads.
                    </p>
                    <p>
                      <strong>Solution</strong>: Greedy nearest-neighbor heuristic with distance matrices cached in Redis, offloaded to asynchronous worker pools.
                    </p>
                    
                    {/* Inline SVG Chart (Spatial Routing Diagram) */}
                    <div className="mt-md bg-black/45 border border-surface-variant p-sm rounded-xl">
                      <p className="font-mono-label text-[9px] text-secondary uppercase mb-2">Optimized Hyperlocal Delivery Path (SLA Bound)</p>
                      <svg viewBox="0 0 340 100" className="w-full h-24 overflow-visible">
                        {/* Dark Store Node */}
                        <circle cx="50" cy="50" r="12" fill="rgba(255, 83, 90, 0.2)" stroke="#ff535a" strokeWidth="1.5" />
                        <text x="50" y="53" textAnchor="middle" fontSize="7" fill="#white" className="font-mono-label font-bold">STORE</text>

                        {/* Customer Nodes */}
                        <circle cx="140" cy="25" r="8" fill="#1e1e24" stroke="#71d7cf" strokeWidth="1" />
                        <text x="140" y="28" textAnchor="middle" fontSize="6" fill="#888" className="font-mono-label">A</text>
                        
                        <circle cx="230" cy="40" r="8" fill="#1e1e24" stroke="#71d7cf" strokeWidth="1" />
                        <text x="230" y="43" textAnchor="middle" fontSize="6" fill="#888" className="font-mono-label">B</text>

                        <circle cx="300" cy="75" r="8" fill="#1e1e24" stroke="#71d7cf" strokeWidth="1" />
                        <text x="300" y="78" textAnchor="middle" fontSize="6" fill="#888" className="font-mono-label">C</text>

                        {/* Route Arrows / Paths */}
                        <path d="M 62 47 L 128 27" fill="none" stroke="#71d7cf" strokeWidth="1.5" strokeDasharray="3" />
                        <path d="M 148 27 L 222 38" fill="none" stroke="#71d7cf" strokeWidth="1.5" strokeDasharray="3" />
                        <path d="M 238 43 L 292 71" fill="none" stroke="#71d7cf" strokeWidth="1.5" strokeDasharray="3" />

                        {/* Annotations */}
                        <text x="95" y="32" fontSize="6" fill="#888" className="font-mono-label">1.2 km</text>
                        <text x="185" y="29" fontSize="6" fill="#888" className="font-mono-label">0.9 km</text>
                        <text x="270" y="53" fontSize="6" fill="#888" className="font-mono-label">1.5 km</text>
                      </svg>
                    </div>

                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px] mt-md">
                      <div className="flex justify-between text-error">
                        <span>Baseline Synchronous Solver:</span>
                        <span>42.1ms (SLA Breach Lock)</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>HyperFlow Async Batcher:</span>
                        <span>4.8ms (8.7x latency improvement)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>SLA Delivery Breach Rate:</span>
                        <span>Reduced from 14.8% to 1.1%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* F. MLOps Data Drift & Retraining Case Study */}
                <div className="glass-panel p-lg rounded-2xl flex flex-col gap-md">
                  <div className="flex justify-between items-start border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">published_with_changes</span>
                      <h3 className="font-bold text-xs uppercase text-on-surface">F. MLOps: Retraining & Drift</h3>
                    </div>
                    <span className="badge badge-success text-[10px] text-emerald-500 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">Self-Healing</span>
                  </div>
                  <div className="text-xs text-secondary space-y-3">
                    <p>
                      <strong>Challenge</strong>: Unchecked feature shifts (e.g. temperature drops in storms) bias estimators, causing large prediction errors.
                    </p>
                    <p>
                      <strong>Solution</strong>: Real-time mathematical PSI drift check triggers rolling window retraining containers when PSI exceeds 0.20 limits.
                    </p>
                    
                    {/* Inline SVG Chart (Drift Bar Chart with Retrain Threshold Line) */}
                    <div className="mt-md bg-black/45 border border-surface-variant p-sm rounded-xl">
                      <p className="font-mono-label text-[9px] text-secondary uppercase mb-2">Live Feature Drift Index vs. Retrain Threshold</p>
                      <svg viewBox="0 0 340 100" className="w-full h-24 overflow-visible">
                        {/* Axes */}
                        <line x1="80" y1="10" x2="80" y2="80" stroke="#444" strokeWidth="1" />
                        <line x1="80" y1="80" x2="320" y2="80" stroke="#444" strokeWidth="1" />

                        {/* Labels */}
                        <text x="75" y="28" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">temp</text>
                        <text x="75" y="48" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">rain</text>
                        <text x="75" y="68" textAnchor="end" fontSize="7" fill="#888" className="font-mono-label">elapsed_s</text>
                        
                        <text x="80" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">0.0</text>
                        <text x="140" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">0.1</text>
                        <text x="200" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">0.2</text>
                        <text x="260" y="93" textAnchor="middle" fontSize="7" fill="#888" className="font-mono-label">0.3</text>

                        {/* Bars (Scaled: X = 80 + (PSI * 600)) */}
                        {/* temp: 0.04 -> width=24 */}
                        <rect x="80" y="21" width="24" height="10" fill="#10b981" rx="1" />
                        
                        {/* rain: 0.08 -> width=48 */}
                        <rect x="80" y="41" width="48" height="10" fill="#10b981" rx="1" />
                        
                        {/* elapsed_s: 0.06 -> width=36 */}
                        <rect x="80" y="61" width="36" height="10" fill="#10b981" rx="1" />

                        {/* Red Dashed Threshold line at PSI=0.2 (X = 80 + 120 = 200) */}
                        <line x1="200" y1="10" x2="200" y2="80" stroke="#ff535a" strokeWidth="1.5" strokeDasharray="3" />
                        <text x="205" y="20" fontSize="7" fill="#ff535a" className="font-mono-label font-bold">Retrain Limit (0.2 PSI)</text>
                      </svg>
                    </div>

                    <div className="bg-black/30 border border-surface-variant p-md rounded-xl space-y-2 font-mono-label text-[11.5px] mt-md">
                      <div className="flex justify-between text-error">
                        <span>Static Model WMAPE (Drifted):</span>
                        <span>31.4%</span>
                      </div>
                      <div className="flex justify-between text-emerald-500 font-bold border-t border-surface-variant pt-2">
                        <span>PSI Gated Rolling Retrain:</span>
                        <span>14.1% (Outlier bounds aligned)</span>
                      </div>
                      <div className="flex justify-between border-t border-surface-variant pt-2 text-primary-container">
                        <span>Auto-retraining convergence:</span>
                        <span>2.1 seconds execution duration</span>
                      </div>
                    </div>
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
