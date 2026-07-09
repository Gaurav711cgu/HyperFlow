import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as API from './api.js';
import { 
  Shield, X, CreditCard, Wallet, Smartphone, Activity, Settings, 
  MapPin, ChevronDown, Search, MessageSquare, Award, 
  Zap, ShoppingBasket, ShoppingCart, User, Check, Plus, 
  RotateCcw, Info, CheckCircle, Star, Sparkles, Flame, CalendarDays,
  ShieldCheck, HelpCircle, TrendingUp, AlertTriangle, Play
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import './App.css';

// Real coordinates in Bhubaneswar (Patia / Prasanti Vihar area)
const HUB_COORDINATES = {
  Bhubaneswar: {
    center: [20.3533, 85.8333],
    route: [
      [20.3533, 85.8333], // Swiggy Instamart Warehouse (Patia)
      [20.3562, 85.8315], // Prasanti Vihar road
      [20.3585, 85.8288], // Near Lp 60
      [20.3601, 85.8272]  // Gaurav Home
    ]
  }
};

const getInterpolatedPosition = (route, progress) => {
  if (!route || route.length === 0) return null;
  if (route.length === 1) return route[0];
  const totalSegments = route.length - 1;
  const progressPercent = progress / 100;
  const segmentIndex = Math.min(
    Math.floor(progressPercent * totalSegments),
    totalSegments - 1
  );
  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];
  const segmentProgress = (progressPercent * totalSegments) - segmentIndex;
  const lat = start[0] + (end[0] - start[0]) * segmentProgress;
  const lng = start[1] + (end[1] - start[1]) * segmentProgress;
  return [lat, lng];
};

function LeafletMap({ center, routePoints, riderPos, theme, zoom = 14 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const customerMarkersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    
    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, zoom);

    mapInstanceRef.current = map;

    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    window.L.tileLayer(theme === 'dark' ? darkTiles : lightTiles, {
      maxZoom: 19
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    map.eachLayer((layer) => {
      if (layer instanceof window.L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    window.L.tileLayer(theme === 'dark' ? darkTiles : lightTiles, {
      maxZoom: 19
    }).addTo(map);
  }, [theme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    if (routePoints && routePoints.length > 0) {
      routeLayerRef.current = window.L.polyline(routePoints, {
        color: '#6C63FF', 
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95
      }).addTo(map);
    }

    if (storeMarkerRef.current) map.removeLayer(storeMarkerRef.current);
    if (riderMarkerRef.current) map.removeLayer(riderMarkerRef.current);
    customerMarkersRef.current.forEach(m => map.removeLayer(m));
    customerMarkersRef.current = [];

    const createCircleIcon = (color, size, pulse = false) => {
      return window.L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.6); ${pulse ? 'animation: pulse 1.5s infinite;' : ''}"></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });
    };

    if (routePoints && routePoints.length > 0) {
      storeMarkerRef.current = window.L.marker(routePoints[0], {
        icon: createCircleIcon('#6C63FF', 14)
      }).addTo(map);
      
      const lastPoint = routePoints[routePoints.length - 1];
      const marker = window.L.marker(lastPoint, {
        icon: createCircleIcon('#00D4AA', 14)
      }).addTo(map);
      customerMarkersRef.current.push(marker);
    }

    if (riderPos) {
      riderMarkerRef.current = window.L.marker(riderPos, {
        icon: createCircleIcon('#FF4757', 18, true)
      }).addTo(map);
    }

  }, [routePoints, riderPos]);

  return <div ref={mapRef} className="absolute inset-0 w-full h-full rounded-2xl z-0" />;
}

function CategoryIcon({ name, className }) {
  if (name === "Biryani") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M6 8h12c1 0 2 .8 2 2v6c0 2-1.8 4-4 4H8c-2 0-4-2-4-4v-6c0-1.2 1-2 2-2z" />
        <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
        <path d="M2 8h20" strokeLinecap="round" />
        <circle cx="9" cy="13" r="0.8" fill="currentColor" />
        <circle cx="15" cy="13" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (name === "Pizzas") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M12 2L2 20h20L12 2z" strokeLinejoin="round" />
        <path d="M5 15c2 .5 5 1 7 0s5-.5 7-1" />
        <circle cx="12" cy="9" r="0.8" fill="currentColor" />
        <circle cx="9" cy="13" r="0.8" fill="currentColor" />
        <circle cx="14" cy="14" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (name === "North Indian") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M3 10h18v4a7 7 0 01-14 0v-4z" />
        <path d="M2 10a2 2 0 012-2h16a2 2 0 012 2" />
        <path d="M6 8V5a1 1 0 011-1h10a1 1 0 011 1v3" />
        <path d="M12 18v2m-3 0h6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "Healthy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M2 10a10 10 0 0020 0H2z" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M6 10c0-2.5 1-4 2-5.5M10 10c0-3 .5-4.5 1.5-6M14 10c0-3 .5-4.5 1.5-6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "Groceries") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" strokeLinejoin="round" />
        <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

const promoBanners = [
  { title: "Diwali Special: Up to 50% Off", desc: "Celebrate with royal Biryani from Behrouz & more partners", color: "from-[#FFB347] to-[#FF4757]", badge: "Festive" },
  { title: "9-Min Groceries Delivery", desc: "Get fresh milk, vegetables, and essentials instantly", color: "from-[#6C63FF] to-[#A078FF]", badge: "Quick" },
  { title: "Dineout Slot Bookings Open", desc: "Book dining slots at Mayfair Lagoon & premium buffets", color: "from-[#00D4AA] to-[#6C63FF]", badge: "Dineout" }
];

const categories = [
  { name: "Biryani" },
  { name: "Pizzas" },
  { name: "North Indian" },
  { name: "Healthy" },
  { name: "Groceries" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [appView, setAppView] = useState('consumer'); 
  const [isSimulatorMode, setIsSimulatorMode] = useState(true); 
  const [donateClimate, setDonateClimate] = useState(true);
  const [donateFoodSafety, setDonateFoodSafety] = useState(true);
  
  // Swiggy, Zomato, Blinkit Operations & SOP states
  const [adminSubTab, setAdminSubTab] = useState('system'); // 'system', 'restaurant', 'picking', 'logistics'
  const [restaurantOrders, setRestaurantOrders] = useState([
    { id: "O-8374", name: "Anjali Patnaik", items: "1x Dum Gosht Biryani", elapsed: 0, status: "PENDING", limit: 45, price: 349 },
    { id: "O-2938", name: "Siddharth Sen", items: "2x Butter Chicken, 1x Paneer Tikka", elapsed: 0, status: "PENDING", limit: 45, price: 770 },
  ]);
  const [pickingList, setPickingList] = useState([
    { id: "g_milk", name: "Amul Taaza Milk (1L)", qty: 2, location: "Aisle 2, A1", status: "PENDING" },
    { id: "g_tomatoes", name: "Fresh Tomatoes (500g)", qty: 1, location: "Aisle 5, C3", status: "PENDING" },
    { id: "g_bananas", name: "Organic Bananas (1 doz)", qty: 1, location: "Aisle 1, B2", status: "PENDING" }
  ]);
  const [pickingSLA, setPickingSLA] = useState(0);
  const [pickingActive, setPickingActive] = useState(true);
  const [riderList, setRiderList] = useState([
    { id: "R-01", name: "Sourav M.", status: "IDLE", location: "Patia Hub", batchedOrders: [] },
    { id: "R-02", name: "Amit K.", status: "DELIVERING", location: "Prasanti Vihar Rd", batchedOrders: ["O-8374"] },
    { id: "R-03", name: "Ranjan D.", status: "DELIVERING", location: "Lp 60 Lane", batchedOrders: ["O-2938"] }
  ]);
  const [rainIncentive, setRainIncentive] = useState(false);

  // Operational Simulation Timers
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Restaurant SLA order timer
      setRestaurantOrders(prev => prev.map(order => {
        if (order.status === "PENDING") {
          const nextElapsed = order.elapsed + 1;
          if (nextElapsed >= order.limit) {
            return { ...order, elapsed: order.limit, status: "TIMEOUT (Lapsed)" };
          }
          return { ...order, elapsed: nextElapsed };
        }
        return order;
      }));

      // 2. Picking SLA timer
      setPickingSLA(prev => {
        if (pickingActive) return prev + 1;
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pickingActive]);
  
  const savedAddresses = [
    { id: "187465656", tag: "Home", name: "Gaurav Nayak", detail: "Plot Lp 60, Prasanti Vihar, Patia, Bhubaneswar, 751024" },
    { id: "d7n8j7j5p2h33j28em90", tag: "Work", name: "Gaurav Nayak", detail: "In front of Swiggy Instamart Warehouse, Patia, Bhubaneswar" },
    { id: "252492248", tag: "Other", name: "Gaurav Nayak", detail: "Lp 60, Prasanti Vihar, Patia, Bhubaneswar" }
  ];
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0]);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  // Cart & Orders State
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [riderProgress, setRiderProgress] = useState(0);
  const [restaurantPageOpen, setRestaurantPageOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  // AI Agent Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hey Gaurav! I can query restaurants and groceries using Swiggy tools. Tell me your dietary goals or cravings.', time: '9:15pm', tools: [] }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentThinkingTools, setAgentThinkingTools] = useState([]);

  // Telemetry & Anomaly parameters
  const [censoringRate, setCensoringRate] = useState(0.40);
  const [forecastOutput, setForecastOutput] = useState({
    censoring_rate: 0.40,
    ols_wmape: 0.208,
    tobit_wmape: 0.139,
    lift_pct: 33.1,
    converged: true
  });
  const [stormSurge, setStormSurge] = useState(false);
  const [driftInjected, setDriftInjected] = useState(false);
  const [arbitrageMessage, setArbitrageMessage] = useState("");
  const [rescueOffers, setRescueOffers] = useState([]);
  const [rescueTimer, setRescueTimer] = useState(299);
  const [securityLogs, setSecurityLogs] = useState([
    { time: "14:10:02", event: "SYSTEM BOOT SEQUENCE INITIATED...", type: "info" },
    { time: "14:10:12", event: "Anti-Arbitrage Guard active on Patia subnets.", type: "success" }
  ]);
  const [activeGroceryForecast, setActiveGroceryForecast] = useState(null);

  // Payment Gateway States
  const [paymentScreenOpen, setPaymentScreenOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cobranded");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || "http://localhost:7860");
  const [theme, setTheme] = useState('dark');

  // Customer Loyalty & Retention Metrics States
  const [isPro, setIsPro] = useState(false); // HyperFlow Pro membership
  const [streakOrders, setStreakOrders] = useState(1); // Gamified progress
  const [lastOrderedItem, setLastOrderedItem] = useState({
    id: "dum_gosht",
    name: "Dum Gosht Biryani",
    price: 349,
    restaurantName: "Behrouz Biryani",
    restaurantId: "rest_behrouz",
    protein: 36,
    calories: 540
  });

  // Festive theme overrides
  const [festivalTheme, setFestivalTheme] = useState('nominal'); // 'nominal', 'diwali', 'holi'
  
  // Coupons database
  const [coupons, setCoupons] = useState([
    { code: "HYPERPRO", pct: 15, minOrder: 300, desc: "15% off above ₹300" },
    { code: "DIWALI50", pct: 50, minOrder: 500, desc: "Festive 50% off above ₹500" },
    { code: "FREEFEES", pct: 100, minOrder: 0, desc: "Zero delivery fees coupon" }
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Expense Logs database
  const [expenseLogs, setExpenseLogs] = useState([
    { id: 1, name: "July 04", amount: 480, calories: 1250 },
    { id: 2, name: "July 05", amount: 620, calories: 1800 },
    { id: 3, name: "July 06", amount: 290, calories: 950 },
    { id: 4, name: "July 07", amount: 840, calories: 2100 },
    { id: 5, name: "July 08", amount: 350, calories: 1100 }
  ]);

  // Dineout slots reservation database
  const [reservations, setReservations] = useState([
    { id: "res_101", hotel: "Mayfair Lagoon", time: "08:30 PM", party: 2, status: "CONFIRMED" }
  ]);

  // Dynamic Databases
  const [restaurants, setRestaurants] = useState([
    {
      id: "rest_behrouz",
      name: "Behrouz Biryani",
      cuisine: "Biryani · Mughlai · Royal",
      rating: 4.6,
      distance: "2.1 km",
      time: "28 min",
      slaConfidence: 97,
      isAIPick: true,
      isExclusive: true,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=60",
      menu: [
        { id: "dum_gosht", name: "Dum Gosht Biryani", price: 349, rating: 4.6, desc: "Fragrant long-grain basmati rice layered with juicy mutton in royal spices.", protein: 36, cal: 540, veg: false },
        { id: "lazeez_chicken", name: "Lazeez Bhuna Murgh Biryani", price: 299, rating: 4.5, desc: "Tender boneless chicken in bhuna spices layered with basmati rice.", protein: 32, cal: 480, veg: false },
        { id: "mint_raita", name: "Mint Raita", price: 49, rating: 4.2, desc: "Refreshing raita flavored with fresh mint leaves.", protein: 2, cal: 60, veg: true }
      ]
    },
    {
      id: "rest_tandoor",
      name: "Tandoor Imperial",
      cuisine: "North Indian · Kababs",
      rating: 4.3,
      distance: "1.4 km",
      time: "22 min",
      slaConfidence: 94,
      isAIPick: false,
      isExclusive: false,
      image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&auto=format&fit=crop&q=60",
      menu: [
        { id: "butter_chicken", name: "Butter Chicken", price: 280, rating: 4.5, desc: "Creamy chicken cooked in rich buttery tomato gravy.", protein: 28, cal: 410, veg: false },
        { id: "paneer_tikka", name: "Paneer Tikka", price: 210, rating: 4.3, desc: "Cottage cheese cubes grilled with rich tikka seasonings.", protein: 18, cal: 290, veg: true }
      ]
    },
    {
      id: "rest_pizza",
      name: "Pizza & Co",
      cuisine: "Pizzas · Italian · Fast Food",
      rating: 4.4,
      distance: "3.2 km",
      time: "18 min",
      slaConfidence: 98,
      isAIPick: false,
      isExclusive: true,
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&auto=format&fit=crop&q=60",
      menu: [
        { id: "marg_pizza", name: "Margherita Pizza", price: 220, rating: 4.4, desc: "Classic mozzarella cheese and fresh basil leaves on thin crust.", protein: 14, cal: 320, veg: true },
        { id: "pep_pizza", name: "Pepperoni Pizza", price: 299, rating: 4.6, desc: "Spiced pepperoni and double mozzarella cheese load.", protein: 20, cal: 440, veg: false }
      ]
    }
  ]);

  const [groceries, setGroceries] = useState([
    { id: "g_milk", name: "Amul Taaza Milk (1L)", brand: "Amul", price: 56, weight: "1L", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=60", stock: 0, latent_demand: 48, restock: 55, replacementName: "GoodLife Tetra Pack Milk (1L)" },
    { id: "g_tomatoes", name: "Fresh Tomatoes (500g)", brand: "Organic Farms", price: 32, weight: "500g", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=60", stock: 3, latent_demand: 24, restock: 30 },
    { id: "g_bananas", name: "Organic Bananas (1 doz)", brand: "Fresh Produce", price: 60, weight: "1 Dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=60", stock: 18, latent_demand: 82, restock: 90 }
  ]);

  const [disputesQueue, setDisputesQueue] = useState([
    { id: "disp_1", customer: "Gaurav Nayak", merchantId: "rest_behrouz", type: "Cold Delivery", text: "Mutton Biryani was cold and dry on arrival.", items: "1x Dum Gosht Biryani", status: "PENDING", refundAmt: 349 },
    { id: "disp_2", customer: "Anjali Patnaik", merchantId: "rest_pizza", type: "Missing Items", text: "Did not receive the pepperoni topping on pizza.", items: "1x Pepperoni Pizza", status: "PENDING", refundAmt: 299 }
  ]);

  // Dineout Hotels Database
  const mockHotels = [
    { id: "hot_mayfair", name: "Mayfair Lagoon", cuisine: "Multi-Cuisine · Premium Buffet", rating: 4.8, distance: "3.0 km", costForTwo: 2500, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=60", slots: ["07:30 PM", "08:00 PM", "09:00 PM", "09:30 PM"] },
    { id: "hot_swosti", name: "Swosti Grand Hotels", cuisine: "North Indian · Bar & Grill", rating: 4.5, distance: "1.8 km", costForTwo: 1800, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&auto=format&fit=crop&q=60", slots: ["07:00 PM", "08:30 PM", "09:00 PM"] },
    { id: "hot_taj", name: "Taj Vivanta", cuisine: "Global Gourmet · Fine Dine", rating: 4.9, distance: "4.5 km", costForTwo: 4000, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&auto=format&fit=crop&q=60", slots: ["08:00 PM", "09:30 PM"] }
  ];

  // Forms states for Admin additions
  const [newRestName, setNewRestName] = useState("");
  const [newRestCuisine, setNewRestCuisine] = useState("");
  const [newRestImage, setNewRestImage] = useState("");
  const [newRestSLA, setNewRestSLA] = useState(25);
  const [newRestExclusive, setNewRestExclusive] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPct, setNewCouponPct] = useState(20);
  const [newCouponMin, setNewCouponMin] = useState(300);

  // Sync theme and festival attributes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-festival', festivalTheme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, festivalTheme]);

  // Animated rider track simulation loop
  useEffect(() => {
    let interval;
    if (activeOrder) {
      interval = setInterval(() => {
        setRiderProgress(prev => {
          if (prev >= 100) {
            setActiveOrder(prevOrder => ({ ...prevOrder, status: "Delivered!" }));
            const totalSpend = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalCals = activeOrder.items.reduce((sum, item) => sum + (item.calories || 0) * item.quantity, 0);
            
            // Increment streaks
            setStreakOrders(prevStreak => prevStreak + 1);

            setExpenseLogs(prevLogs => [
              ...prevLogs,
              { id: Date.now(), name: "Today", amount: totalSpend, calories: totalCals }
            ]);
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [activeOrder]);

  // ─── Backend Integration — on-mount data sync ─────────────────────────────
  useEffect(() => {
    // 1. Hydrate restaurants from backend
    API.fetchRestaurants().then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        // Merge backend list with local menus (backend doesn't store menus yet)
        setRestaurants(prev => {
          const merged = [...prev];
          data.forEach(beRest => {
            const existing = merged.find(r => r.id === beRest.id);
            if (!existing) merged.push({ ...beRest, menu: [] });
            else Object.assign(existing, { ...beRest, menu: existing.menu });
          });
          return merged;
        });
      }
    });

    // 2. Hydrate coupons from backend
    API.fetchCoupons().then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setCoupons(data);
      }
    });

    // 3. Hydrate dineout reservations from backend
    API.fetchDineoutReservations().then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setReservations(data);
      }
    });

    // 4. Hydrate expense logs from backend
    API.fetchExpenseLogs().then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setExpenseLogs(data.map(e => ({ id: e.id, name: e.date || e.name || 'Day', amount: e.amount, calories: e.calories })));
      }
    });

    // 5. Hydrate festival theme from backend
    API.fetchFestivalSettings().then(data => {
      if (data?.festival_theme) setFestivalTheme(data.festival_theme);
    });
  }, []);

  // ─── Backend Integration — live WebSocket metrics ────────────────────────
  const [liveMetrics, setLiveMetrics] = useState(null);
  useEffect(() => {
    const ws = API.connectLiveMetrics(data => {
      setLiveMetrics(data);
    });
    return () => ws.close();
  }, []);

  // ─── Backend Integration — ML robustness polling (every 15s) ────────────
  const [mlRobustness, setMlRobustness] = useState(null);
  useEffect(() => {
    const poll = () => {
      API.fetchRobustness().then(data => {
        if (data) setMlRobustness(data);
      });
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => clearInterval(iv);
  }, []);

  // ─── Backend Integration — availability metrics ──────────────────────────
  const [availabilityMetrics, setAvailabilityMetrics] = useState(null);
  useEffect(() => {
    API.fetchAvailabilityMetrics('store_01').then(data => {
      if (data) setAvailabilityMetrics(data);
    });
  }, []);

  // ─── Backend Integration — bump rate metrics ─────────────────────────────
  const [bumpRateMetrics, setBumpRateMetrics] = useState(null);
  useEffect(() => {
    API.fetchBumpRate().then(data => {
      if (data) setBumpRateMetrics(data);
    });
  }, []);

  // ─── Backend Integration — store profitability ───────────────────────────
  const [profitabilityData, setProfitabilityData] = useState({});
  useEffect(() => {
    ['store_01', 'store_02', 'store_03'].forEach(storeId => {
      API.fetchProfitability(storeId).then(data => {
        if (data) setProfitabilityData(prev => ({ ...prev, [storeId]: data }));
      });
    });
  }, []);



  // Dynamic Loyalty Tier Calculations based on spent levels
  const getTotalSpent = () => expenseLogs.reduce((sum, log) => sum + log.amount, 0);
  
  const getLoyaltyTier = () => {
    const total = getTotalSpent();
    if (total >= 10000) return { name: "VIP Platinum Elite", color: "from-[#6C63FF] via-[#A078FF] to-[#00D4AA]", limit: 10000, cashback: 10, bg: "glow-primary" };
    if (total >= 5000) return { name: "Gold Executive", color: "from-[#FFB347] to-[#FF4757]", limit: 10000, next: "VIP Platinum Elite", cashback: 5, bg: "glow-gold" };
    return { name: "Silver Explorer", color: "from-[#A0A0B8] to-[#606075]", limit: 5000, next: "Gold Executive", cashback: 3, bg: "" };
  };

  const currentTier = getLoyaltyTier();

  // Helpers
  const getCartSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const getPackingFee = () => (cart.length > 0 ? 15 : 0);
  
  const getGSTAmount = () => Math.round(getCartSubtotal() * 0.05 * 100) / 100;
  
  const getDonations = () => {
    let amount = 0;
    if (donateClimate) amount += 2;
    if (donateFoodSafety) amount += 2;
    return amount;
  };

  const getDeliveryFee = () => {
    if (currentTier.name === "VIP Platinum Elite" || isPro) return 0;
    if (currentTier.name === "Gold Executive" && getCartSubtotal() >= 300) return 0;
    
    if (cart.length > 0 && cart[0].restaurantId === 'im_store') return 15;
    if (cart.length > 0) {
      const rest = restaurants.find(r => r.id === cart[0].restaurantId);
      if (rest && rest.isExclusive) return 0;
    }
    return stormSurge ? 45 : 30;
  };

  const getDiscountAmount = () => {
    const subtotal = getCartSubtotal();
    let discount = 0;
    if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
      if (appliedCoupon.code !== "FREEFEES") {
        discount = Math.round(subtotal * (appliedCoupon.pct / 100));
      }
    }
    if (isPro || currentTier.name === "VIP Platinum Elite") {
      discount += Math.round(subtotal * 0.1); // Extra 10% off
    } else if (currentTier.name === "Gold Executive") {
      discount += Math.round(subtotal * 0.05); // Extra 5% off
    }
    return discount;
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const packing = getPackingFee();
    const gst = getGSTAmount();
    const delivery = (appliedCoupon?.code === "FREEFEES" || isPro || currentTier.name === "VIP Platinum Elite") ? 0 : getDeliveryFee();
    const donations = getDonations();
    const discount = getDiscountAmount();
    // Return precise 2-decimal rounded grand total
    return Math.round((subtotal + packing + gst + delivery + donations - discount) * 100) / 100;
  };

  const handleAddToCart = (item, restName, restId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, restaurantName: restName, restaurantId: restId, quantity: 1, protein: item.protein || 0, calories: item.calories || item.cal || 0 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const payload = {
      items: [...cart],
      restaurantName: cart[0].restaurantName,
      restaurantId: cart[0].restaurantId,
      total: getCartTotal()
    };
    setCheckoutPayload(payload);
    setPaymentScreenOpen(true);
  };

  const handleInstantReorder = () => {
    if (!lastOrderedItem) return;
    const payload = {
      items: [{ ...lastOrderedItem, quantity: 1 }],
      restaurantName: lastOrderedItem.restaurantName,
      restaurantId: lastOrderedItem.restaurantId,
      total: lastOrderedItem.price
    };
    setCheckoutPayload(payload);
    setPaymentScreenOpen(true);
  };

  const executePaymentSuccess = async () => {
    if (!checkoutPayload) return;
    
    const orderId = `HF-${Math.floor(Math.random() * 8999) + 1000}`;
    const timestamp = new Date().toLocaleTimeString();

    // Fire Confetti Blast
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Wire to backend inventory reserve lock manager
    for (const item of checkoutPayload.items) {
      // Map frontend item IDs to backend SKU IDs
      let skuId = "g4"; // default mock restaurant item
      if (item.id === "g_milk") skuId = "g1";
      else if (item.id === "g_bananas") skuId = "g2";
      else if (item.id === "g_tomatoes") skuId = "g3";

      try {
        const res = await API.reserveInventory({
          order_id: orderId,
          store_id: "store_01",
          sku_id: skuId,
          qty_requested: item.quantity
        });
        if (res) {
          setSecurityLogs(prev => [
            { time: timestamp, event: `LOCK MANAGER: Reserved ${item.quantity}x ${item.name} (SKU: ${skuId}) via ${res.latency_ms ? `p99 Redis lock (${res.latency_ms}ms)` : 'lock manager'}.`, type: 'success' },
            ...prev
          ]);
        }
      } catch (err) {
        setSecurityLogs(prev => [
          { time: timestamp, event: `LOCK CONFLICT: Failed to reserve ${item.name}. Lock acquisition timeout or insufficient stock.`, type: 'error' },
          ...prev
        ]);
      }
    }

    setActiveOrder({
      id: orderId,
      items: checkoutPayload.items,
      status: "Preparing at kitchen",
      restaurantName: checkoutPayload.restaurantName
    });
    
    if (checkoutPayload.items.length > 0) {
      setLastOrderedItem({
        id: checkoutPayload.items[0].id,
        name: checkoutPayload.items[0].name,
        price: checkoutPayload.items[0].price,
        restaurantName: checkoutPayload.restaurantName,
        restaurantId: checkoutPayload.restaurantId,
        protein: checkoutPayload.items[0].protein,
        calories: checkoutPayload.items[0].calories
      });
    }

    setCart([]);
    setAppliedCoupon(null);
    setCheckoutPayload(null);
    setActiveTab('orders');
  };

  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    const matched = coupons.find(c => c.code === code);
    if (!matched) {
      setCouponMessage("Invalid Coupon Code ❌");
      return;
    }
    const subtotal = getCartSubtotal();
    if (subtotal < matched.minOrder) {
      setCouponMessage(`Min order value must be ₹${matched.minOrder} ⚠️`);
      return;
    }
    setAppliedCoupon(matched);
    setCouponMessage(`Coupon ${matched.code} applied successfully! ✓`);
  };

  const triggerCancelOrder = () => {
    if (!activeOrder) return;
    const itemsLabel = activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const originalPrice = activeOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const timeNow = new Date().toLocaleTimeString();

    setRescueOffers([
      {
        order_id: `rescue_${activeOrder.id}`,
        restaurant_name: activeOrder.restaurantName || "Quick Kitchen",
        items: itemsLabel,
        original_price_inr: originalPrice,
        rescue_price_inr: Math.round(originalPrice * 0.5),
        sensory_quality_index: 94
      }
    ]);

    setSecurityLogs(prev => [
      { time: timeNow, event: `CANCEL: Order ${activeOrder.id} aborted by user.`, type: 'info' },
      { time: timeNow, event: `RESCUE QUEUE: Initialized cooling thermal curve (SQI=94/100).`, type: 'info' },
      ...prev
    ]);

    setActiveOrder(null);
  };

  const claimRescueOffer = (offer) => {
    const timestamp = new Date().toLocaleTimeString();
    setArbitrageMessage("Arbitrage Blocked: CO_LOCATION_PROXIMITY_ALERT, SHARED_IP_SUBNET_ALERT");
    setSecurityLogs(prev => [
      { time: timestamp, event: `ALERT: Blocked self-buyback exploit (Co-Location distance: 11 meters)`, type: 'error' },
      ...prev
    ]);
    setRescueOffers([]);
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestName.trim()) return;
    const payload = {
      name: newRestName,
      cuisine: newRestCuisine || "Global Cuisine",
      rating: 4.5,
      distance: "1.5 km",
      time: `${newRestSLA} min`,
      slaConfidence: 96,
      isAIPick: false,
      isExclusive: newRestExclusive,
      image: newRestImage.trim() || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=60"
    };
    // Optimistic update
    const localObj = { ...payload, id: `rest_${Date.now()}`, menu: [{ id: `dish_${Date.now()}_1`, name: "Signature Combo Pack", price: 299, rating: 4.5, desc: "A custom signature combo.", protein: 22, cal: 380, veg: true }] };
    setRestaurants(prev => [...prev, localObj]);
    // Persist to backend
    const result = await API.createRestaurant(payload);
    if (result?.restaurant) {
      // Replace local placeholder with backend ID
      setRestaurants(prev => prev.map(r => r.id === localObj.id ? { ...localObj, ...result.restaurant } : r));
    }
    setSecurityLogs(prev => [
      { time: new Date().toLocaleTimeString(), event: `ADMIN: Added merchant "${newRestName}" | Exclusive: ${newRestExclusive ? 'Yes' : 'No'} | Backend: ${result ? '✓ Synced' : '⚠ Local only'}`, type: 'success' },
      ...prev
    ]);
    setNewRestName("");
    setNewRestCuisine("");
    setNewRestImage("");
    setNewRestExclusive(false);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const code = newCouponCode.toUpperCase().replace(/\s+/g, "");
    const newCop = {
      code,
      pct: parseInt(newCouponPct) || 10,
      minOrder: parseInt(newCouponMin) || 100,
      desc: `${newCouponPct}% off above ₹${newCouponMin}`
    };
    // Optimistic update
    setCoupons(prev => [...prev, newCop]);
    // Persist to backend
    const result = await API.createCoupon(newCop);
    setSecurityLogs(prev => [
      { time: new Date().toLocaleTimeString(), event: `ADMIN: Created coupon "${code}" (${newCouponPct}% off) | Backend: ${result ? '✓ Synced' : '⚠ Local only'}`, type: 'success' },
      ...prev
    ]);
    setNewCouponCode("");
  };

  const handleBookTableSlot = async (hotelName, slotTime) => {
    const localRes = {
      id: `res_${Math.floor(Math.random() * 89999) + 10000}`,
      hotel: hotelName,
      time: slotTime,
      party: 2,
      status: "CONFIRMED"
    };
    // Optimistic update
    setReservations(prev => [localRes, ...prev]);
    // Persist to backend
    const result = await API.reserveDineout({ hotel: hotelName, time: slotTime, party: 2 });
    if (result?.reservation) {
      setReservations(prev => prev.map(r => r.id === localRes.id ? { ...localRes, ...result.reservation } : r));
    }
    confetti({ particleCount: 60, spread: 50 });
    alert(`Table Reserved successfully at ${hotelName} for ${slotTime}! ✓`);
  };

  const handleSwapOOSItem = (itemId, altItemName, altPrice) => {
    setGroceries(prev => prev.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          name: altItemName, 
          price: altPrice, 
          stock: 12, 
          brand: "GoodLife",
          image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&auto=format&fit=crop&q=60"
        };
      }
      return item;
    }));
    setSecurityLogs(prev => [
      { time: new Date().toLocaleTimeString(), event: `REPLACEMENT: Swapped out-of-stock ${itemId} with alternative "${altItemName}"`, type: 'success' },
      ...prev
    ]);
  };

  const handleToggleGroceryStock = (id) => {
    setGroceries(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = item.stock === 0 ? 20 : 0;
        setSecurityLogs(prevLogs => [
          { time: new Date().toLocaleTimeString(), event: `ADMIN: SKU ${id} stock toggled to ${newStock === 0 ? 'STOCKOUT (Censored)' : 'IN_STOCK'}`, type: 'info' },
          ...prevLogs
        ]);
        return { ...item, stock: newStock };
      }
      return item;
    }));
  };

  const processRefundTriage = (disputeId) => {
    const timestamp = new Date().toLocaleTimeString();
    setDisputesQueue(prev => prev.map(disp => {
      if (disp.id === disputeId) {
        const isBehrouz = disp.merchantId === 'rest_behrouz';
        let decision = "APPROVED (Auto-Refund)";
        let reason = "Approved: High tenant tenure, 0 recent refund requests.";
        let fraudProb = 0.08;

        if (isBehrouz) {
          decision = "FLAGGED (Manual Triage)";
          reason = "Flagged: Multiple claims from same IP subnet on high-end merchant.";
          fraudProb = 0.89;
        }

        setSecurityLogs(prevLogs => [
          { time: timestamp, event: `FRAUD GUARD: Dispute ${disputeId} processed. Decision: ${decision}. Score: ${(fraudProb * 100).toFixed(0)}%`, type: fraudProb > 0.5 ? 'error' : 'success' },
          ...prevLogs
        ]);

        return { ...disp, status: decision, fraudProb, reason };
      }
      return disp;
    }));
  };

  const handlePayUpgradeTier = (upgradeAmount, targetTierName) => {
    setExpenseLogs(prev => [
      ...prev,
      { id: Date.now(), name: "Upgrade", amount: upgradeAmount, calories: 0 }
    ]);
    
    // Blast confetti celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });

    setSecurityLogs(prev => [
      { time: new Date().toLocaleTimeString(), event: `LOYALTY TIER: User completed direct pay upgrade to ${targetTierName} card.`, type: 'success' },
      ...prev
    ]);
  };

  const sendAgentMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString() }]);
    setIsAgentThinking(true);
    setAgentThinkingTools(['search_restaurants', 'search_menu']);

    setTimeout(() => {
      setIsAgentThinking(false);
      const lower = userMsg.toLowerCase();
      let reply = "I parsed your query. Would you like me to book a Dineout slot or search for exclusive restaurants?";
      let toolsCalled = ['get_addresses', 'search_restaurants'];
      
      if (lower.includes("card") || lower.includes("tier") || lower.includes("level")) {
        reply = `Your active loyalty tier is the ${currentTier.name} card (Cashback: ${currentTier.cashback}%). You can increase your tier by ordering food (spend ₹${currentTier.limit - getTotalSpent()} more to unlock the next level) or by purchasing a direct card upgrade in the profile tab.`;
      } else if (lower.includes("pro") || lower.includes("membership")) {
        reply = "You can upgrade to HyperFlow Pro inside your Profile. Pro offers: Free delivery on all orders & extra 10% discount on food orders.";
      } else if (lower.includes("protein") || lower.includes("gym")) {
        reply = "Found 2 meals near Patia matching high protein goals:\n\n1. 🍛 **Dum Gosht Biryani** - 36g Protein | ₹349\n2. 🥗 **Butter Chicken** - 28g Protein | ₹280\n\nI can add either to your cart directly using the `update_food_cart` tool.";
        toolsCalled = ['search_restaurants', 'search_menu'];
      }
      
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: reply,
        time: new Date().toLocaleTimeString(),
        tools: toolsCalled
      }]);
    }, 1500);
  };

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen font-body-md overflow-hidden relative">
      
      {/* ─── Premium Glassmorphic Header ─── */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 flex justify-between items-center px-6 glass-panel border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#00D4AA] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]">
            HF
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            HyperFlow <span className="text-[10px] text-[#00D4AA] font-mono ml-1">3.0</span>
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#12121A] border border-white/10 p-1 rounded-full">
            <button 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${appView === 'consumer' ? 'bg-[#FF0077] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setAppView('consumer')}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Consumer App
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${appView === 'intel' ? 'bg-[#FF0077] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setAppView('intel')}
            >
              <Activity className="w-3.5 h-3.5" />
              Intel Dashboard
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${appView === 'admin' ? 'bg-[#FF0077] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setAppView('admin')}
            >
              <Settings className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          </div>

          {/* Simulator vs Web Layout Switcher */}
          {appView === 'consumer' && (
            <div className="flex items-center gap-1 bg-[#12121A] border border-white/10 p-1 rounded-full">
              <button 
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${isSimulatorMode ? 'bg-[#8F00FF] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setIsSimulatorMode(true)}
              >
                📱 Mobile
              </button>
              <button 
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${!isSimulatorMode ? 'bg-[#8F00FF] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setIsSimulatorMode(false)}
              >
                💻 Web Portal
              </button>
            </div>
          )}
        </div>

        {/* User Badging */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {liveMetrics ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse"></span>
              <span>API: LIVE</span>
              <span className="text-white/40">|</span>
              <span className="text-white">✓ {liveMetrics.reservation_success_rate}%</span>
              <span className="text-white/40">|</span>
              <span className="text-amber-400">ETA Δ {liveMetrics.eta_bump_rate}%</span>
              <span className="text-white/40">|</span>
              <span className="text-[#6C63FF]">⚠ {liveMetrics.restock_alerts_count}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] animate-pulse"></span>
              SWIGGY MCP: ACTIVE
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Gaurav Nayak</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white">GN</div>
          </div>
        </div>
      </header>


      {/* ─── Main Viewport Grid ─── */}
      <main className="pt-16 h-[calc(100vh-64px)] flex overflow-hidden">
        
        {/* VIEW 1: CONSUMER EXPERIENCE */}
        {appView === 'consumer' && (
          <div className="flex-grow flex justify-center items-start p-6 bg-[#07070B] overflow-y-auto w-full h-full">
            {isSimulatorMode ? (
              <div className="flex flex-col lg:flex-row gap-12 max-w-6xl w-full justify-center items-center">
              
              {/* Smartphone Simulator */}
              <div className="phone-frame glass-panel flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
                
                {/* Warning banner triggered dynamically by monsoon surge */}
                {stormSurge && (
                  <div className="bg-[#FF4757] text-white text-[9px] py-1 px-4 text-center font-bold tracking-wider z-50 animate-pulse">
                    STORM SURGE: REDUCED FLEET SLA ADJUSTED
                  </div>
                )}

                {/* Status Bar */}
                <div className="h-8 px-6 flex justify-between items-end pb-1 text-white text-[11px] font-medium z-10 bg-black/20">
                  <span>9:41</span>
                  <div className="flex gap-1.5 items-center opacity-85">
                    <Smartphone className="w-3 h-3" />
                    <Activity className="w-3 h-3" />
                  </div>
                </div>

                {/* Screens Router Container */}
                <div className="flex-grow overflow-y-auto hide-scrollbar bg-[#0A0A0F] relative flex flex-col pb-16">
                  
                  {restaurantPageOpen && selectedRestaurant ? (
                    /* ─── SCREEN: Restaurant Detail Page ─── */
                    <div className="flex-col flex flex-grow animate-fade-in">
                      <div className="relative h-44 w-full flex-shrink-0">
                        <img className="w-full h-full object-cover" src={selectedRestaurant.image} alt={selectedRestaurant.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent"></div>
                        <button 
                          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                          onClick={() => setRestaurantPageOpen(false)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="px-4 -mt-8 relative z-10">
                        <div className="bg-[#12121A] border border-white/5 p-4 rounded-xl shadow-lg mb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="font-bold text-base text-white">{selectedRestaurant.name}</h2>
                              <p className="text-[11px] text-gray-400">{selectedRestaurant.cuisine}</p>
                            </div>
                            {selectedRestaurant.isExclusive && (
                              <span className="text-[8px] bg-gradient-to-tr from-[#6C63FF] to-[#00D4AA] text-white px-2 py-0.5 rounded-full font-bold shadow pulse-neon">EXCLUSIVE</span>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-xs font-semibold text-gray-300 border-t border-white/5 pt-2 mt-2">
                            <span>⭐ {selectedRestaurant.rating}</span>
                            <span>•</span>
                            <span>{selectedRestaurant.distance}</span>
                            <span>•</span>
                            <span>{selectedRestaurant.time}</span>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#00D4AA] bg-[#00D4AA]/10 w-max px-2 py-0.5 rounded border border-[#00D4AA]/20 font-bold">
                            <span className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full"></span>
                            AI SLA CONFIDENCE: {selectedRestaurant.slaConfidence}%
                          </div>
                        </div>

                        {/* Menu list */}
                        <div className="space-y-3 mb-12">
                          <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Popular Menu</h3>
                          {selectedRestaurant.menu.map(dish => (
                            <div key={dish.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between gap-4">
                              <div className="flex-grow">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${dish.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <h4 className="font-bold text-sm text-white">{dish.name}</h4>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 leading-snug">{dish.desc}</p>
                                <div className="flex gap-3 text-[10px] text-gray-500 font-semibold mt-2">
                                  <span>🥩 {dish.protein}g Protein</span>
                                  <span>🔥 {dish.cal} kcal</span>
                                </div>
                                <span className="font-bold text-sm text-[#00D4AA] block mt-1">₹{dish.price}</span>
                              </div>
                              <div className="flex-shrink-0 flex items-center">
                                <button 
                                  className="px-4 py-1.5 rounded-full bg-[#6C63FF] hover:bg-[#574FEB] active:scale-95 text-xs font-bold transition-all shadow-md"
                                  onClick={() => handleAddToCart(dish, selectedRestaurant.name, selectedRestaurant.id)}
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'home' ? (
                    /* ─── SCREEN: Home Feed ─── */
                    <>
                      <div className="px-4 pt-3 flex justify-between items-center z-20">
                        <div className="relative">
                          <div 
                            className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => setAddressDropdownOpen(!addressDropdownOpen)}
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#6C63FF]" />
                            <span className="text-xs font-bold text-white max-w-[120px] truncate">{selectedAddress.tag}</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>
                          
                          {addressDropdownOpen && (
                            <div className="absolute top-10 left-0 bg-[#12121A] border border-white/10 rounded-xl shadow-2xl p-2 w-64 z-50 animate-fade-in">
                              {savedAddresses.map(addr => (
                                <div 
                                  key={addr.id}
                                  className={`p-2 rounded-lg cursor-pointer text-xs mt-1 hover:bg-white/5 ${selectedAddress.id === addr.id ? 'bg-[#6C63FF]/20 text-[#6C63FF] font-bold' : 'text-gray-300'}`}
                                  onClick={() => {
                                    setSelectedAddress(addr);
                                    setAddressDropdownOpen(false);
                                  }}
                                >
                                  <span>{addr.tag}</span>
                                  <p className="text-[10px] opacity-70 truncate">{addr.detail}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white" onClick={() => setActiveTab('search')}>
                            <Search className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white relative" onClick={() => setChatOpen(true)}>
                            <MessageSquare className="w-4 h-4" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#00D4AA] rounded-full"></span>
                          </button>
                        </div>
                      </div>

                      {/* Gamified Weekly Challenge progress card */}
                      <div className="mt-4 px-4">
                        <div className="bg-[#12121A] border border-[#6C63FF]/20 p-3.5 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-[#00D4AA] font-mono font-bold tracking-wider uppercase flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Weekly Streak Challenge
                            </span>
                            <p className="text-xs font-bold text-white mt-0.5">Order 3 times for ₹100 cashback</p>
                            <div className="flex gap-1.5 mt-2">
                              {[1, 2, 3].map(step => (
                                <div 
                                  key={step} 
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    streakOrders >= step 
                                      ? 'bg-[#00D4AA] text-black shadow' 
                                      : 'bg-white/5 text-gray-500 border border-white/10'
                                  }`}
                                >
                                  ✓
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block">Streak status</span>
                            <span className="text-xs font-bold text-[#6C63FF] font-mono">{streakOrders}/3 Orders</span>
                          </div>
                        </div>
                      </div>

                      {/* One-Click Quick Reorder Strip */}
                      {lastOrderedItem && (
                        <div className="mt-4 px-4">
                          <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-2">Your Usual? (Fast Checkout)</h4>
                          <div className="bg-gradient-to-r from-[#6C63FF]/20 to-transparent border border-white/5 p-3 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="text-[8px] bg-[#6C63FF]/20 text-[#6C63FF] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 w-max">
                                <Zap className="w-2.5 h-2.5" />
                                1-TAP REORDER
                              </span>
                              <h5 className="font-bold text-xs text-white mt-1 leading-tight">{lastOrderedItem.name}</h5>
                              <p className="text-[9px] text-gray-400">from {lastOrderedItem.restaurantName} • ₹{lastOrderedItem.price}</p>
                            </div>
                            <button 
                              className="bg-[#6C63FF] hover:bg-[#574FEB] text-white text-[10px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all shadow"
                              onClick={handleInstantReorder}
                            >
                              ⚡ Reorder
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Promo banners */}
                      <div className="mt-4 px-4 overflow-hidden">
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
                          {promoBanners.map((promo, idx) => (
                            <div 
                              key={idx} 
                              className={`min-w-[260px] w-[85%] snap-center rounded-xl p-4 flex flex-col justify-end h-28 relative overflow-hidden bg-gradient-to-tr ${promo.color}`}
                              onClick={() => {
                                if (promo.badge === "Quick") setActiveTab('quick');
                              }}
                            >
                              <div className="absolute top-3 right-3 bg-black/30 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {promo.badge}
                              </div>
                              <h4 className="font-bold text-sm text-white drop-shadow">{promo.title}</h4>
                              <p className="text-[10px] text-white/80 leading-tight mt-0.5 truncate">{promo.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Category pills */}
                      <div className="mt-4 px-4 overflow-hidden">
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                          {categories.map((cat, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer text-xs font-semibold whitespace-nowrap active:scale-95 transition-all ${
                                selectedCuisine === cat.name 
                                  ? 'bg-[#6C63FF] border-[#6C63FF] text-white' 
                                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                              }`}
                              onClick={() => setSelectedCuisine(prev => prev === cat.name ? null : cat.name)}
                            >
                              <CategoryIcon name={cat.name} className="w-3.5 h-3.5 stroke-current" />
                              <span>{cat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Pick Section */}
                      <div className="mt-5 px-4">
                        <div className="flex justify-between items-center mb-2.5">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">⚡ AI Recommendation</h3>
                        </div>
                        {restaurants.filter(r => r.isAIPick).map(rest => (
                          <div 
                            key={rest.id} 
                            className="bg-[#12121A] border border-white/5 rounded-xl overflow-hidden cursor-pointer card-hover-lift"
                            onClick={() => {
                              setSelectedRestaurant(rest);
                              setRestaurantPageOpen(true);
                            }}
                          >
                            <div className="h-32 w-full relative">
                              <img className="w-full h-full object-cover" src={rest.image} alt={rest.name} />
                              <span className="absolute top-3 left-3 bg-[#6C63FF] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">AI PICK</span>
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-sm text-white">{rest.name}</h4>
                              <p className="text-[11px] text-gray-400 mt-0.5">{rest.cuisine}</p>
                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                                <div className="flex gap-2 text-[10px] text-gray-400 font-semibold">
                                  <span>⭐ {rest.rating}</span>
                                  <span>•</span>
                                  <span>{rest.time}</span>
                                </div>
                                <span className="text-[10px] text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded font-mono font-bold">🧬 High Protein Target</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dineout Hotels Search List */}
                      <div className="mt-5 px-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2.5">🍽️ Dineout Hotel Bookings</h3>
                        <div className="space-y-3">
                          {mockHotels.map(hotel => (
                            <div key={hotel.id} className="bg-[#12121A] border border-white/5 rounded-xl overflow-hidden flex gap-3 p-2.5">
                              <img className="w-20 h-20 rounded object-cover flex-shrink-0" src={hotel.image} alt={hotel.name} />
                              <div className="flex-grow flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-xs text-white">{hotel.name}</h4>
                                    <span className="text-[9px] text-[#00D4AA] font-bold">⭐ {hotel.rating}</span>
                                  </div>
                                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">{hotel.cuisine}</p>
                                  <p className="text-[9px] text-gray-500 font-mono">Cost for 2: ₹{hotel.costForTwo}</p>
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1.5">
                                  {hotel.slots.map((slot, sIdx) => (
                                    <button 
                                      key={sIdx}
                                      className="px-2 py-0.5 bg-[#6C63FF]/10 hover:bg-[#6C63FF]/30 border border-[#6C63FF]/20 text-[#6C63FF] rounded text-[8px] font-mono font-bold whitespace-nowrap active:scale-95 transition-all"
                                      onClick={() => handleBookTableSlot(hotel.name, slot)}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Normal Restaurants Feed */}
                      <div className="mt-5 px-4 mb-20">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">All Partners</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {restaurants.map(rest => (
                            <div 
                              key={rest.id} 
                              className="bg-[#12121A] border border-white/5 rounded-lg overflow-hidden cursor-pointer card-hover-lift"
                              onClick={() => {
                                setSelectedRestaurant(rest);
                                setRestaurantPageOpen(true);
                              }}
                            >
                              <div className="h-24 w-full relative">
                                <img className="w-full h-full object-cover" src={rest.image} alt={rest.name} />
                                {rest.isExclusive && (
                                  <span className="absolute top-2 left-2 bg-gradient-to-tr from-[#6C63FF] to-[#00D4AA] text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded shadow">EXCLUSIVE</span>
                                )}
                              </div>
                              <div className="p-2.5">
                                <h4 className="font-bold text-xs text-white truncate">{rest.name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{rest.cuisine.split('·')[0]}</p>
                                <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-white/5 text-[10px] text-gray-400">
                                  <span>⭐ {rest.rating}</span>
                                  <span className="text-[#00D4AA] font-bold">{rest.slaConfidence}% SLA</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'search' ? (
                    /* ─── SCREEN: Search ─── */
                    <div className="px-4 pt-3 flex-grow flex flex-col animate-fade-in">
                      <div className="bg-[#12121A] border border-white/5 rounded-xl p-3 flex items-center gap-2 mb-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input 
                          className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500" 
                          placeholder="Search restaurants, cuisines..." 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-400 font-semibold">Filters</span>
                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                          <input 
                            type="checkbox" 
                            checked={vegOnly} 
                            onChange={() => setVegOnly(!vegOnly)}
                            className="rounded border-white/10 bg-[#12121A] text-[#6C63FF] focus:ring-0 w-3.5 h-3.5"
                          />
                          <span className="text-gray-300">Veg Only</span>
                        </label>
                      </div>

                      {/* Matches */}
                      <div className="space-y-3">
                        {restaurants.flatMap(r => r.menu.map(m => ({ ...m, restaurantName: r.name, restaurantId: r.id })))
                          .filter(item => {
                            if (vegOnly && !item.veg) return false;
                            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                            return true;
                          })
                          .map(item => (
                            <div key={item.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between gap-4">
                              <div>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-bold text-xs text-white">{item.name}</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">from {item.restaurantName}</p>
                                <span className="font-semibold text-xs text-[#00D4AA] block mt-1">₹{item.price}</span>
                              </div>
                              <div className="flex items-center">
                                <button 
                                  className="px-3 py-1 rounded-full bg-[#6C63FF] hover:bg-[#574FEB] active:scale-95 text-[10px] font-bold"
                                  onClick={() => handleAddToCart(item, item.restaurantName, item.restaurantId)}
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : activeTab === 'quick' ? (
                    /* ─── SCREEN: Instamart Grocery Tab ─── */
                    <div className="px-4 pt-3 flex-grow flex flex-col animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-base text-white">⚡ Instamart</h3>
                        <div className="text-xs font-mono bg-[#00D4AA]/10 text-[#00D4AA] px-2.5 py-1 rounded-full border border-[#00D4AA]/20">
                          ⏱️ 9 MIN TO DOOR
                        </div>
                      </div>

                      <div className="space-y-3 mb-20">
                        {groceries.map(item => (
                          <div key={item.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between gap-4">
                            <div className="flex gap-3">
                              <img className="w-12 h-12 rounded object-cover" src={item.image} alt={item.name} />
                              <div>
                                <h4 className="font-bold text-xs text-white leading-tight">{item.name}</h4>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{item.weight}</span>
                                <span className="font-bold text-xs text-[#00D4AA] mt-1 block">₹{item.price}</span>
                              </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                              {item.stock === 0 ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-bold font-mono">STOCKOUT</span>
                                  {item.replacementName && (
                                    <button 
                                      className="text-[7.5px] bg-[#00D4AA]/10 hover:bg-[#00D4AA]/20 border border-[#00D4AA]/30 text-[#00D4AA] px-1 rounded font-bold whitespace-nowrap active:scale-95 transition-all"
                                      onClick={() => handleSwapOOSItem(item.id, item.replacementName, 64)}
                                    >
                                      🔄 Swap Alt
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded font-bold font-mono">IN STOCK</span>
                              )}
                              
                              <button 
                                className="px-3 py-1 rounded bg-[#6C63FF] hover:bg-[#574FEB] text-[10px] font-bold active:scale-95 transition-all mt-1"
                                onClick={() => {
                                  if (item.stock === 0) {
                                    setActiveGroceryForecast(item);
                                    runForecast(censoringRate);
                                  } else {
                                    handleAddToCart(item, "Instamart Store", "im_store");
                                  }
                                }}
                              >
                                {item.stock === 0 ? 'Impute' : '+ Add'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeTab === 'orders' ? (
                    /* ─── SCREEN: Live Tracking ─── */
                    <div className="px-4 pt-3 flex-grow flex flex-col animate-fade-in">
                      {activeOrder ? (
                        <div className="flex-grow flex flex-col animate-fade-in">
                          <h3 className="font-bold text-sm text-white mb-2">Live Tracking · {activeOrder.id}</h3>
                          
                          <div className="h-44 w-full rounded-xl relative overflow-hidden border border-white/10 mb-4 z-0">
                            <LeafletMap 
                              center={HUB_COORDINATES.Bhubaneswar.center}
                              routePoints={HUB_COORDINATES.Bhubaneswar.route}
                              riderPos={getInterpolatedPosition(HUB_COORDINATES.Bhubaneswar.route, riderProgress)}
                              theme={theme}
                              zoom={15}
                            />
                          </div>

                          <div className="bg-[#12121A] border border-white/5 p-3 rounded-xl mb-4 text-xs space-y-2">
                            <div className="flex justify-between font-bold text-white mb-2">
                              <span>Rider Rajesh Kumar</span>
                              <span className="text-[#00D4AA]">En Route</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#6C63FF] h-full transition-all duration-300" style={{ width: `${riderProgress}%` }}></div>
                            </div>
                          </div>

                          <button 
                            className="w-full border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs py-2 rounded-lg font-bold mt-auto active:scale-95 transition-all mb-4"
                            onClick={triggerCancelOrder}
                          >
                            Cancel & Rescue Order
                          </button>
                        </div>
                      ) : (
                        <div className="flex-grow flex flex-col justify-center items-center text-center p-6 opacity-60">
                          <ShoppingCart className="w-10 h-10 text-[#6C63FF] mb-2" />
                          <h4 className="font-bold text-sm text-white">No active orders</h4>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ─── SCREEN: Profile, Loyalty Cards, & Expense Logs ─── */
                    <div className="px-4 pt-3 flex-grow flex flex-col animate-fade-in pb-20">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white">GN</div>
                        <div>
                          <h3 className="font-bold text-sm text-white leading-tight">Gaurav Nayak</h3>
                          {isPro ? (
                            <span className="text-[10px] text-amber-400 font-mono font-bold block flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              👑 HYPERFLOW PRO MEMBER (ACTIVE)
                            </span>
                          ) : (
                            <button 
                              className="text-[9px] bg-amber-500 hover:bg-amber-600 text-black px-2 py-0.5 rounded font-bold font-mono active:scale-95 transition-all mt-0.5"
                              onClick={() => {
                                setIsPro(true);
                                confetti({ particleCount: 50, spread: 60 });
                                setSecurityLogs(prev => [
                                  { time: new Date().toLocaleTimeString(), event: "RETENTION: User upgraded to HYPERFLOW PRO tier subscription.", type: 'success' },
                                  ...prev
                                ]);
                              }}
                            >
                              Join Pro for Free Delivery
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Co-Branded Partnered Card Showcase */}
                      <div className="mb-4">
                        <h4 className="font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-2">Your Co-Branded Partner Card</h4>
                        <div className={`rounded-xl p-4 flex flex-col justify-between h-36 relative overflow-hidden border border-white/15 shadow-2xl ${currentTier.color} ${currentTier.bg} bg-gradient-to-tr`}>
                          
                          {/* Reflective light glow */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                          
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <span className="text-[8px] bg-black/40 text-white px-2 py-0.5 rounded-full font-bold uppercase">HyperFlow Partner Card</span>
                              <h4 className="font-bold text-sm text-white mt-1 leading-none drop-shadow">{currentTier.name}</h4>
                            </div>
                            <CreditCard className="w-5 h-5 text-white/40" />
                          </div>

                          {/* Metallic Gold Chip vector */}
                          <div className="w-8 h-6 rounded gold-chip-shimmer border border-[#A08830] flex flex-col justify-between p-1 select-none overflow-hidden relative z-10 my-1">
                            <div className="flex justify-between w-full h-[1px] bg-black/20"></div>
                            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-black/20"></div>
                            <div className="absolute inset-y-0 right-1/3 w-[1px] bg-black/20"></div>
                            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/20"></div>
                            <svg className="w-full h-full absolute inset-0 opacity-80" viewBox="0 0 32 24">
                              <path d="M 0,8 h 32 M 0,16 h 32 M 10,0 v 24 M 22,0 v 24" stroke="#5C4D1C" strokeWidth="0.8" fill="none" />
                            </svg>
                          </div>
                          
                          <div className="flex justify-between items-end mt-auto font-mono relative z-10">
                            <div>
                              <span className="text-[7px] text-white/70 block">CARD NUMBER</span>
                              <span className="text-[11px] text-white font-bold tracking-widest block text-embossed mb-1 font-mono">4092 8812 7462 9051</span>
                              <span className="text-[7px] text-white/70 block">CARD HOLDER</span>
                              <span className="text-[10px] text-white font-bold tracking-wider text-embossed font-mono leading-none">GAURAV NAYAK</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[7px] text-white/70 block">CASHBACK</span>
                              <span className="text-[11px] text-[#E2C96C] font-bold text-embossed">{currentTier.cashback}% Points</span>
                            </div>
                          </div>
                        </div>

                        {/* Spend Chase Progress Bar with Milestone tick markers */}
                        <div className="mt-3 bg-white/5 border border-white/5 rounded-xl p-3 text-xs">
                          <div className="flex justify-between text-gray-400 text-[10px] font-mono mb-2">
                            <span>Spend progress: ₹{getTotalSpent()}/₹10,000</span>
                            <span className="text-[#FF0077] font-bold">{currentTier.next ? `Next: ${currentTier.next}` : 'Max Tier Active'}</span>
                          </div>
                          
                          {/* Milestone Progress Track */}
                          <div className="relative w-full bg-white/10 h-2 rounded-full overflow-visible mb-6 mt-1">
                            <div 
                              className="bg-gradient-to-r from-[#FF0077] to-[#8F00FF] h-full rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, (getTotalSpent() / 10000) * 100)}%` }}
                            ></div>
                            
                            {/* ₹5,000 Gold Tick Marker */}
                            <div className="absolute left-[50%] -top-1 -translate-x-1/2 flex flex-col items-center z-20 group/tick">
                              <div className="w-3.5 h-3.5 rounded-full bg-[#FFB300] border-2 border-[#0A0A0F] shadow-lg cursor-pointer flex items-center justify-center">
                                <span className="text-[7.5px] font-bold text-black font-mono">G</span>
                              </div>
                              <div className="absolute bottom-5 bg-[#12121A] border border-[#FFB300]/30 text-[#FFB300] text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover/tick:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Gold Tier (₹5,000)
                              </div>
                            </div>
                            
                            {/* ₹10,000 Platinum Tick Marker */}
                            <div className="absolute left-[100%] -top-1 -translate-x-1/2 flex flex-col items-center z-20 group/tick2">
                              <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] border-2 border-[#0A0A0F] shadow-lg cursor-pointer flex items-center justify-center">
                                <span className="text-[7.5px] font-bold text-black font-mono">P</span>
                              </div>
                              <div className="absolute bottom-5 bg-[#12121A] border border-[#00E676]/30 text-[#00E676] text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover/tick2:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Platinum VIP (₹10,000)
                              </div>
                            </div>
                          </div>

                          {currentTier.next ? (
                            <>
                              <p className="text-[10px] text-gray-400">
                                Spend <strong>₹{currentTier.limit - getTotalSpent()} more</strong> to auto-unlock the <strong>{currentTier.next}</strong> card!
                              </p>
                              
                              {/* Fast upgrade payments options */}
                              <div className="mt-2.5 flex justify-between gap-2 border-t border-white/5 pt-2.5">
                                <button 
                                  className="flex-grow bg-[#FFB347]/10 hover:bg-[#FFB347]/20 border border-[#FFB347]/30 text-[#FFB347] py-1 rounded text-[9px] font-bold active:scale-95 transition-all"
                                  onClick={() => handlePayUpgradeTier(2420, "Gold Executive")}
                                >
                                  Pay ₹199 (Unlock Gold)
                                </button>
                                <button 
                                  className="flex-grow bg-[#8F00FF]/10 hover:bg-[#8F00FF]/20 border border-[#8F00FF]/30 text-[#8F00FF] py-1 rounded text-[9px] font-bold active:scale-95 transition-all"
                                  onClick={() => handlePayUpgradeTier(7420, "VIP Platinum Elite")}
                                >
                                  Pay ₹499 (Unlock Platinum)
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px] text-[#00D4AA] font-bold text-center">
                              🎉 Congratulations! You have fully unlocked all milestone benefit levels!
                            </p>
                          )}
                        </div>
                      </div>

                        {/* Bento Benefits Grid */}
                        <div className="mt-3">
                          <h5 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF0077]" />
                            Bento Privileges Grid ({currentTier.name})
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {/* Cashback Card */}
                            <div className="bg-[#0A0A0F] benefit-outline-purple p-3 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#8F00FF]/15 rounded-full blur-xl group-hover:bg-[#8F00FF]/25 transition-all"></div>
                              <div className="flex items-center gap-1.5 text-[#8F00FF] font-bold text-[9px] relative z-10">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>CASHBACK CARD</span>
                              </div>
                              <p className="text-[9px] text-gray-300 font-mono leading-tight mt-2 relative z-10">
                                {currentTier.cashback}% flat points returned to your loyalty wallet balance.
                              </p>
                            </div>

                            {/* Zero Delivery */}
                            <div className="bg-[#0A0A0F] benefit-outline-green p-3 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#00E676]/15 rounded-full blur-xl group-hover:bg-[#00E676]/25 transition-all"></div>
                              <div className="flex items-center gap-1.5 text-[#00E676] font-bold text-[9px] relative z-10">
                                <Zap className="w-3.5 h-3.5" />
                                <span>ZERO DELIVERY</span>
                              </div>
                              <p className="text-[9px] text-gray-300 font-mono leading-tight mt-2 relative z-10">
                                Waived shipping SLA and zero delivery partner fees for {currentTier.name === "VIP Platinum Elite" ? "all orders" : "orders over ₹300"}.
                              </p>
                            </div>

                            {/* Instant Triage */}
                            <div className="bg-[#0A0A0F] benefit-outline-red p-3 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#FF3366]/15 rounded-full blur-xl group-hover:bg-[#FF3366]/25 transition-all"></div>
                              <div className="flex items-center gap-1.5 text-[#FF3366] font-bold text-[9px] relative z-10">
                                <Activity className="w-3.5 h-3.5" />
                                <span>INSTANT TRIAGE</span>
                              </div>
                              <p className="text-[9px] text-gray-300 font-mono leading-tight mt-2 relative z-10">
                                Automated refund triage & real-time dispute resolution gates active.
                              </p>
                            </div>

                            {/* VIP Concierge */}
                            <div className="bg-[#0A0A0F] border border-white/5 p-3 rounded-xl flex flex-col justify-between h-24 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-lg">
                              <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
                              <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[9px] relative z-10">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>VIP CONCIERGE</span>
                              </div>
                              <p className="text-[9px] text-gray-300 font-mono leading-tight mt-2 relative z-10">
                                Dedicated support desk routing & priority dispatch queuing system.
                              </p>
                            </div>
                          </div>
                        </div>

                      {/* Dynamic Expense & Calorie Tracker using Recharts AreaChart */}
                      <div className="bg-[#12121A] border border-white/5 p-4 rounded-xl mb-4">
                        <h4 className="font-bold text-xs text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-[#6C63FF]" />
                          Expenditure & Calorie logs
                        </h4>
                        
                        <div className="h-32 w-full mt-2.5">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={expenseLogs} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="name" stroke="#555" fontSize={9} />
                              <YAxis stroke="#555" fontSize={9} />
                              <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', fontSize: 10, borderRadius: 8 }} />
                              <Area type="monotone" dataKey="amount" name="Spend (₹)" stroke="#6C63FF" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
                              <Area type="monotone" dataKey="calories" name="Calories (kcal)" stroke="#00D4AA" fillOpacity={1} fill="url(#colorCals)" strokeWidth={1.5} strokeDasharray="3 3" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Registered Booking Reservations */}
                      <div className="bg-[#12121A] border border-white/5 p-4 rounded-xl mb-4">
                        <h4 className="font-bold text-xs text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-[#6C63FF]" />
                          Hotel Dineout Reservations
                        </h4>
                        <div className="space-y-2">
                          {reservations.map(res => (
                            <div key={res.id} className="bg-black/30 border border-white/5 p-2 rounded flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-white block">{res.hotel}</span>
                                <span className="text-[10px] text-gray-500 font-mono">Time: {res.time} · Party: {res.party}</span>
                              </div>
                              <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold">{res.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Saved addresses */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Saved Addresses</h4>
                        {savedAddresses.map(addr => (
                          <div key={addr.id} className="bg-[#12121A] border border-white/5 p-2.5 rounded-lg text-xs">
                            <span className="font-bold text-white block">{addr.tag}</span>
                            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{addr.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FLOATING CART BAR */}
                  {cart.length > 0 && !restaurantPageOpen && activeTab !== 'cart' && (
                    <div 
                      className="absolute bottom-16 left-3 right-3 bg-[#12121A] border border-[#6C63FF]/30 p-2.5 rounded-xl flex justify-between items-center cursor-pointer shadow-lg animate-slide-up glow-primary"
                      onClick={() => {
                        setSelectedRestaurant(restaurants[0]);
                        setRestaurantPageOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBasket className="w-4 h-4 text-[#6C63FF]" />
                        <div className="text-xs">
                          <p className="font-bold text-white">{cart.length} item(s) selected</p>
                          <p className="text-[10px] text-gray-400 font-mono">Total: ₹{getCartTotal()}</p>
                        </div>
                      </div>
                      <button className="bg-[#6C63FF] text-white text-[11px] font-bold px-3 py-1.5 rounded-full">Checkout →</button>
                    </div>
                  )}

                  {/* Detailed Cart Checkout Drawer */}
                  {cart.length > 0 && restaurantPageOpen && (
                    <div className="absolute bottom-0 left-0 w-full bg-[#12121A] border-t border-[#FF0077]/30 p-4 z-40 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] flex flex-col rounded-t-2xl max-h-[85%] overflow-y-auto">
                      
                      {/* Invoice Title */}
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
                        <span className="font-bold text-xs text-white uppercase tracking-wider">Bill Summary & Invoice</span>
                        <button className="text-[10px] text-gray-500 hover:text-white" onClick={() => setRestaurantPageOpen(false)}>Close</button>
                      </div>

                      {/* Item List inside Drawer */}
                      <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between text-[11px] text-gray-300">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="font-mono">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Math Checklist */}
                      <div className="space-y-2 border-t border-white/5 pt-2 mb-3 text-[11px] text-gray-400 font-mono">
                        <div className="flex justify-between">
                          <span>Items Subtotal</span>
                          <span>₹{getCartSubtotal()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Restaurant Packing Fee</span>
                          <span>₹{getPackingFee()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST and Restaurant Taxes (5%)</span>
                          <span>₹{getGSTAmount()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Partner Fee</span>
                          <span className={getDeliveryFee() === 0 ? "text-[#00D4AA]" : ""}>
                            {getDeliveryFee() === 0 ? "₹0 (Free via Card)" : `₹${getDeliveryFee()}`}
                          </span>
                        </div>
                        
                        {/* Climate/Safety donation checkboxes */}
                        <div className="flex justify-between items-center text-[10px] pt-1 select-none">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={donateClimate} 
                              onChange={() => setDonateClimate(!donateClimate)}
                              className="rounded border-white/10 bg-black text-[#FF0077] w-3 h-3 focus:ring-0" 
                            />
                            <span>Climate Donation (₹2)</span>
                          </label>
                          <span>+₹{donateClimate ? 2 : 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] select-none">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={donateFoodSafety} 
                              onChange={() => setDonateFoodSafety(!donateFoodSafety)}
                              className="rounded border-white/10 bg-black text-[#FF0077] w-3 h-3 focus:ring-0" 
                            />
                            <span>Food Safety Fund (₹2)</span>
                          </label>
                          <span>+₹{donateFoodSafety ? 2 : 0}</span>
                        </div>

                        {appliedCoupon && (
                          <div className="flex justify-between text-[#00D4AA] font-bold border-t border-white/5 pt-1">
                            <span>Coupon Discount ({appliedCoupon.code})</span>
                            <span>-₹{getDiscountAmount()}</span>
                          </div>
                        )}
                      </div>

                      {/* Dynamic Coupons apply input */}
                      <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl mb-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                          <span>Coupons & Offers</span>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter Code (e.g. DIWALI50)"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-white outline-none flex-grow"
                          />
                          <button 
                            className="bg-[#FF0077] text-white text-xs px-3 py-1 rounded font-bold"
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </button>
                        </div>
                        {couponMessage && <span className="text-[9px] font-bold text-[#FFB347]">{couponMessage}</span>}
                        
                        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1">
                          {coupons.map(cop => (
                            <button 
                              key={cop.code}
                              onClick={() => setCouponCodeInput(cop.code)}
                              className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] text-gray-400 whitespace-nowrap"
                            >
                              {cop.code} ({cop.pct}%)
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        className="w-full bg-[#FF0077] hover:bg-[#E20066] text-white text-xs py-2.5 rounded-xl font-bold shadow-md glow-primary active:scale-95 transition-all"
                        onClick={handlePlaceOrder}
                      >
                        Place Order (₹{getCartTotal()})
                      </button>
                    </div>
                  )}

                  {/* Navigation tabs */}
                  <nav className="absolute bottom-0 left-0 w-full h-14 bg-[#12121A] border-t border-white/5 flex justify-around items-center z-30">
                    {[
                      { tab: 'home', icon: 'home', label: 'Home' },
                      { tab: 'search', icon: 'search', label: 'Search' },
                      { tab: 'quick', icon: 'bolt', label: 'Quick' },
                      { tab: 'orders', icon: 'receipt_long', label: 'Orders' },
                      { tab: 'profile', icon: 'person', label: 'Profile' }
                    ].map(t => (
                      <button 
                        key={t.tab}
                        className={`flex flex-col items-center justify-center w-12 h-full relative transition-all ${activeTab === t.tab ? 'text-[#6C63FF] font-bold scale-105' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => {
                          setRestaurantPageOpen(false);
                          setActiveTab(t.tab);
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                        <span className="text-[9px] mt-0.5">{t.label}</span>
                        {activeTab === t.tab && <span className="absolute top-0 w-4 h-[2px] bg-[#6C63FF] rounded-full shadow-[0_0_8px_#6C63FF]"></span>}
                      </button>
                    ))}
                  </nav>

                </div>
              </div>

              {/* Showcase Info Panel */}
              <div className="flex-grow max-w-md bg-[#12121A] border border-white/5 rounded-2xl p-6 shadow-xl hidden lg:block">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#6C63FF]" />
                  <h3 className="text-base font-bold text-white">HyperFlow Premium Engine</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Powered by award-winning React integrations including Recharts Area visualization and dynamic Canvas Confetti bursts.
                </p>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="font-bold text-[#6C63FF] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Loyalty Levels & Cards
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Silver, Gold, and VIP Platinum co-branded card tiers with integrated spend tracking and direct premium upgrade checkpoints.
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="font-bold text-[#00D4AA] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Dynamic Area Charts
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Monitors weekly calorie goals and consumer expenses using smooth responsive vector layouts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              /* ─── WEB PORTAL VIEW (3-COLUMN LAYOUT) ─── */
              <div className="w-full max-w-[1400px] mx-auto h-full flex gap-6 text-white overflow-hidden animate-fade-in select-none">
                
                {/* COLUMN 1: LEFT NAVIGATION & PROFILE (24%) */}
                <div className="w-[24%] flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar h-full pb-10">
                  {/* User Profile Header */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-base text-white font-mono">GN</div>
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">Gaurav Nayak</h3>
                      <span className="text-[9px] text-[#00D4AA] font-mono font-bold uppercase tracking-wider block mt-0.5">
                        {isPro ? "👑 PRO MEMBER" : "SILVER MEMBER"}
                      </span>
                    </div>
                  </div>

                  {/* Co-Branded Card Mockup (Metallic gold chip + embossed details) */}
                  <div className={`rounded-xl p-4 flex flex-col justify-between h-36 relative overflow-hidden border border-white/15 shadow-2xl ${currentTier.color} ${currentTier.bg} bg-gradient-to-tr`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="text-[8px] bg-black/40 text-white px-2 py-0.5 rounded-full font-bold uppercase">HyperFlow Partner Card</span>
                        <h4 className="font-bold text-xs text-white mt-1 leading-none drop-shadow">{currentTier.name}</h4>
                      </div>
                      <CreditCard className="w-4 h-4 text-white/40" />
                    </div>
                    {/* Metallic Gold Chip */}
                    <div className="w-8 h-6 rounded gold-chip-shimmer border border-[#A08830] flex flex-col justify-between p-1 select-none overflow-hidden relative z-10 my-1">
                      <div className="flex justify-between w-full h-[1px] bg-black/20"></div>
                      <div className="absolute inset-y-0 left-1/3 w-[1px] bg-black/20"></div>
                      <div className="absolute inset-y-0 right-1/3 w-[1px] bg-black/20"></div>
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/20"></div>
                      <svg className="w-full h-full absolute inset-0 opacity-80" viewBox="0 0 32 24">
                        <path d="M 0,8 h 32 M 0,16 h 32 M 10,0 v 24 M 22,0 v 24" stroke="#5C4D1C" strokeWidth="0.8" fill="none" />
                      </svg>
                    </div>
                    <div className="flex justify-between items-end mt-auto font-mono relative z-10">
                      <div>
                        <span className="text-[7px] text-white/70 block font-mono">CARD NUMBER</span>
                        <span className="text-[10px] text-white font-bold tracking-widest block text-embossed mb-1 font-mono">4092 8812 7462 9051</span>
                        <span className="text-[7px] text-white/70 block font-mono">CARD HOLDER</span>
                        <span className="text-[9px] text-white font-bold tracking-wider text-embossed font-mono leading-none">GAURAV NAYAK</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] text-white/70 block font-mono">CASHBACK</span>
                        <span className="text-[10px] text-[#E2C96C] font-bold text-embossed">{currentTier.cashback}% Points</span>
                      </div>
                    </div>
                  </div>

                  {/* Spend milestones progress bar */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl text-xs">
                    <div className="flex justify-between text-gray-400 text-[10px] font-mono mb-2">
                      <span>Milestones: ₹{getTotalSpent()}/₹10,000</span>
                      <span className="text-[#FF0077] font-bold font-mono">{currentTier.next ? `Next: ${currentTier.next}` : 'Max Tier Active'}</span>
                    </div>
                    {/* Progress Track */}
                    <div className="relative w-full bg-white/10 h-2 rounded-full overflow-visible mb-6 mt-1">
                      <div 
                        className="bg-gradient-to-r from-[#FF0077] to-[#8F00FF] h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (getTotalSpent() / 10000) * 100)}%` }}
                      ></div>
                      {/* Ticks */}
                      <div className="absolute left-[50%] -top-1 -translate-x-1/2 flex flex-col items-center z-20 group/tick">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FFB300] border-2 border-[#0A0A0F] shadow-lg cursor-pointer flex items-center justify-center">
                          <span className="text-[7.5px] font-bold text-black font-mono">G</span>
                        </div>
                        <div className="absolute bottom-5 bg-[#12121A] border border-[#FFB300]/30 text-[#FFB300] text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover/tick:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Gold Tier (₹5,000)
                        </div>
                      </div>
                      <div className="absolute left-[100%] -top-1 -translate-x-1/2 flex flex-col items-center z-20 group/tick2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] border-2 border-[#0A0A0F] shadow-lg cursor-pointer flex items-center justify-center">
                          <span className="text-[7.5px] font-bold text-black font-mono">P</span>
                        </div>
                        <div className="absolute bottom-5 bg-[#12121A] border border-[#00E676]/30 text-[#00E676] text-[8px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover/tick2:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Platinum VIP (₹10,000)
                        </div>
                      </div>
                    </div>
                    {currentTier.next ? (
                      <p className="text-[9px] text-gray-400 leading-normal">
                        Spend <strong>₹{currentTier.limit - getTotalSpent()} more</strong> to auto-unlock the {currentTier.next}!
                      </p>
                    ) : (
                      <p className="text-[9px] text-[#00D4AA] font-bold text-center">
                        🎉 VIP Card Fully Unlocked!
                      </p>
                    )}
                  </div>

                  {/* Bento Benefits Grid (Purple, Green, Red outlines) */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                    <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF0077]" />
                      Bento Benefits Grid
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                      <div className="bg-[#12121A]/85 benefit-outline-purple p-2.5 rounded-lg flex flex-col justify-between h-20 relative overflow-hidden group">
                        <div className="absolute -right-3 -top-3 w-8 h-8 bg-[#8F00FF]/15 rounded-full blur-lg"></div>
                        <span className="text-[#8F00FF] font-bold">10% CASHBACK</span>
                        <p className="text-gray-400 leading-tight mt-1 text-[8px]">Points credited to co-branded card balance.</p>
                      </div>
                      <div className="bg-[#12121A]/85 benefit-outline-green p-2.5 rounded-lg flex flex-col justify-between h-20 relative overflow-hidden group">
                        <div className="absolute -right-3 -top-3 w-8 h-8 bg-[#00E676]/15 rounded-full blur-lg"></div>
                        <span className="text-[#00E676] font-bold">FREE DELIVERY</span>
                        <p className="text-gray-400 leading-tight mt-1 text-[8px]">Waived delivery fees on qualifying orders.</p>
                      </div>
                      <div className="bg-[#12121A]/85 benefit-outline-red p-2.5 rounded-lg flex flex-col justify-between h-20 relative overflow-hidden group col-span-2">
                        <div className="absolute -right-3 -top-3 w-8 h-8 bg-[#FF3366]/15 rounded-full blur-lg"></div>
                        <span className="text-[#FF3366] font-bold">INSTANT TRIAGE</span>
                        <p className="text-gray-400 leading-tight mt-1 text-[8px]">AI-powered refund triage and live dispute desk access.</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Tab Navigator */}
                  <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-2 flex flex-col gap-1">
                    {[
                      { id: 'home', label: '🍔 Discovery Hub', desc: 'Browse food & dineout' },
                      { id: 'quick', label: '⚡ Instamart Store', desc: '9-minute grocery dispatch' },
                      { id: 'orders', label: '📍 Live Tracking Map', desc: 'Real-time rider routing' },
                      { id: 'search', label: '🔍 Search Autocomplete', desc: 'Filter restaurants & menus' },
                      { id: 'profile', label: '📈 Spend Analytics', desc: 'Expense charts & tier status' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setRestaurantPageOpen(false);
                          setActiveTab(tab.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all active:scale-[0.98] ${activeTab === tab.id && !restaurantPageOpen ? 'bg-[#FF0077]/10 border-l-4 border-l-[#FF0077] text-white' : 'hover:bg-white/5 text-gray-400'}`}
                      >
                        <span className="font-bold text-xs block">{tab.label}</span>
                        <span className="text-[9px] opacity-60 block mt-0.5 leading-tight">{tab.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLUMN 2: CENTER ACTIVE FEED (52%) */}
                <div className="w-[52%] flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar h-full pb-10">
                  
                  {/* Top Bar with Search & Quick Options */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[#FF0077]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <span className="font-bold">Home: Patia, Bhubaneswar</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold" onClick={() => setActiveTab('search')}>
                        🔍 Search Menus
                      </button>
                      <button className="bg-[#FF0077]/10 hover:bg-[#FF0077]/20 border border-[#FF0077]/30 text-[#FF0077] px-3.5 py-1.5 rounded-full text-xs font-bold animate-pulse" onClick={() => setChatOpen(true)}>
                        💬 AI Agent Chat
                      </button>
                    </div>
                  </div>

                  {/* Weekly Challenge progress */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-[#00E676] font-mono font-bold flex items-center gap-1">🏆 Weekly Order Streak Challenge</span>
                      <span className="text-[10px] text-gray-500 font-mono">{streakOrders}/3 Completed</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {[1,2,3].map(st => (
                        <div key={st} className={`flex-grow h-1.5 rounded-full ${streakOrders >= st ? "bg-[#00E676]" : "bg-white/5"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">Order 3 times from food menu or Instamart to claim your flat ₹100 cashback bonus!</p>
                  </div>

                  {/* Horizontal Categories Grid */}
                  <div className="grid grid-cols-5 gap-3">
                    {categories.map((cat, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedCuisine(prev => prev === cat.name ? null : cat.name);
                          setActiveTab('home');
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer active:scale-95 transition-all ${selectedCuisine === cat.name ? 'bg-[#FF0077]/10 border-[#FF0077] text-white shadow' : 'bg-[#0A0A0F] border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        <CategoryIcon name={cat.name} className="w-6 h-6 stroke-current" />
                        <span className="text-[10px] font-bold font-mono tracking-wider">{cat.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* DYNAMIC SCREEN ROUTER */}
                  {restaurantPageOpen && selectedRestaurant ? (
                    /* SCREEN 1: Restaurant Menu details */
                    <div className="bg-[#0A0A0F] border border-white/5 rounded-xl overflow-hidden animate-fade-in">
                      <div className="h-48 w-full relative">
                        <img className="w-full h-full object-cover" src={selectedRestaurant.image} alt={selectedRestaurant.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
                        <button className="absolute top-4 right-4 bg-black/60 w-8 h-8 rounded-full flex items-center justify-center" onClick={() => setRestaurantPageOpen(false)}>
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                        <div className="absolute bottom-4 left-4">
                          <h2 className="font-bold text-lg text-white">{selectedRestaurant.name}</h2>
                          <p className="text-xs text-gray-300">{selectedRestaurant.cuisine}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span>⭐ {selectedRestaurant.rating}</span>
                            <span>•</span>
                            <span>⏱️ {selectedRestaurant.time}</span>
                            <span>•</span>
                            <span className="text-[#00E676] font-mono font-bold">{selectedRestaurant.slaConfidence}% SLA</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Popular dishes</h3>
                          {selectedRestaurant.menu.map(item => (
                            <div key={item.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between gap-4">
                              <div>
                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${item.veg ? 'bg-[#00E676]' : 'bg-[#FF3366]'}`} />
                                <span className="font-bold text-xs text-white">{item.name}</span>
                                <p className="text-[10px] text-gray-400 mt-1 leading-snug">{item.desc}</p>
                                <span className="font-bold text-xs text-[#00E676] block mt-1.5">₹{item.price}</span>
                              </div>
                              <button 
                                className="bg-[#FF0077] hover:bg-[#E20066] text-white text-[10px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all self-center whitespace-nowrap"
                                onClick={() => handleAddToCart(item, selectedRestaurant.name, selectedRestaurant.id)}
                              >
                                + Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'home' ? (
                    /* SCREEN 2: Home Feed */
                    <div className="space-y-4">
                      {/* One tap Usual order strip */}
                      {lastOrderedItem && (
                        <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="text-[8px] bg-[#FF0077]/10 border border-[#FF0077]/30 text-[#FF0077] px-2 py-0.5 rounded font-mono font-bold">⚡ 1-TAP REORDER</span>
                            <h4 className="font-bold text-sm text-white mt-1.5">{lastOrderedItem.name}</h4>
                            <p className="text-[10px] text-gray-400">from {lastOrderedItem.restaurantName} • ₹{lastOrderedItem.price}</p>
                          </div>
                          <button className="bg-[#FF0077] text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-all" onClick={handleInstantReorder}>
                            ⚡ Instant Reorder
                          </button>
                        </div>
                      )}

                      {/* AI Recommendations */}
                      <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">🧬 Selected AI Pick</h3>
                        {restaurants.filter(r => r.isAIPick).map(rest => (
                          <div 
                            key={rest.id} 
                            onClick={() => {
                              setSelectedRestaurant(rest);
                              setRestaurantPageOpen(true);
                            }}
                            className="bg-[#12121A] border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-white/10 transition-colors"
                          >
                            <img className="w-full h-32 object-cover" src={rest.image} alt={rest.name} />
                            <div className="p-3">
                              <h4 className="font-bold text-sm text-white">{rest.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">{rest.cuisine}</p>
                              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-white/5 mt-3 pt-2">
                                <span>⭐ {rest.rating} ({rest.time})</span>
                                <span className="text-[#FF0077] font-mono font-bold bg-[#FF0077]/10 px-2 py-0.5 rounded">High Protein Spec</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dineout Slot Reservations */}
                      <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">🍽️ Dineout Reservations (Free Booking)</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {mockHotels.map(hotel => (
                            <div key={hotel.id} className="bg-[#12121A] border border-white/5 rounded-lg p-3 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-xs text-white truncate">{hotel.name}</h4>
                                <p className="text-[9px] text-gray-400 truncate mt-0.5">{hotel.cuisine}</p>
                              </div>
                              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mt-3 pb-1">
                                {hotel.slots.map((sl, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => handleBookTableSlot(hotel.name, sl)}
                                    className="bg-[#8F00FF]/10 hover:bg-[#8F00FF]/30 border border-[#8F00FF]/20 text-[#8F00FF] px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap active:scale-95"
                                  >
                                    {sl}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Restaurant Partner Cards */}
                      <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">All Merchants & Partners</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {restaurants.map(rest => (
                            <div 
                              key={rest.id} 
                              onClick={() => {
                                setSelectedRestaurant(rest);
                                setRestaurantPageOpen(true);
                              }}
                              className="bg-[#12121A] border border-white/5 rounded-lg overflow-hidden cursor-pointer hover:border-white/10 transition-all active:scale-[0.98]"
                            >
                              <img className="w-full h-24 object-cover" src={rest.image} alt={rest.name} />
                              <div className="p-2.5">
                                <h4 className="font-bold text-xs text-white truncate">{rest.name}</h4>
                                <p className="text-[9px] text-gray-400 truncate">{rest.cuisine}</p>
                                <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 mt-2 pt-1.5 font-mono">
                                  <span>⭐ {rest.rating}</span>
                                  <span className="text-[#00E676]">{rest.slaConfidence}% SLA</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === 'search' ? (
                    /* SCREEN 3: Search list */
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                      <div className="flex items-center gap-2 bg-[#12121A] border border-white/5 p-3 rounded-lg mb-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search restaurants, cuisines..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none text-xs text-white outline-none w-full placeholder-gray-500 focus:ring-0" 
                        />
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-400 font-semibold">Veg Only Filter</span>
                        <input 
                          type="checkbox" 
                          checked={vegOnly} 
                          onChange={() => setVegOnly(!vegOnly)}
                          className="rounded border-white/10 bg-[#12121A] text-[#FF0077] focus:ring-0 w-4 h-4" 
                        />
                      </div>

                      <div className="space-y-2">
                        {restaurants.flatMap(r => r.menu.map(m => ({ ...m, restaurantName: r.name, restaurantId: r.id })))
                          .filter(item => {
                            if (vegOnly && !item.veg) return false;
                            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                            return true;
                          })
                          .map(item => (
                            <div key={item.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between items-center">
                              <div>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${item.veg ? 'bg-[#00E676]' : 'bg-[#FF3366]'}`} />
                                <span className="font-bold text-xs text-white">{item.name}</span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">from {item.restaurantName}</span>
                                <span className="text-xs font-mono font-bold text-[#00E676] block mt-1">₹{item.price}</span>
                              </div>
                              <button 
                                className="bg-[#FF0077] text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                                onClick={() => handleAddToCart(item, item.restaurantName, item.restaurantId)}
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : activeTab === 'quick' ? (
                    /* SCREEN 4: Instamart Groceries list */
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm text-white">⚡ Instamart Fresh Store</h3>
                        <span className="bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 px-2 py-0.5 rounded text-[8px] font-mono font-bold">⏱️ 9 MIN DELIVERY</span>
                      </div>

                      <div className="space-y-3">
                        {groceries.map(item => (
                          <div key={item.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex justify-between items-center">
                            <div className="flex gap-3">
                              <img className="w-12 h-12 rounded object-cover" src={item.image} alt={item.name} />
                              <div>
                                <h4 className="font-bold text-xs text-white">{item.name}</h4>
                                <span className="text-[9px] text-gray-400 block">{item.weight}</span>
                                <span className="font-bold text-xs text-[#00E676] mt-1 block">₹{item.price}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              {item.stock === 0 ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-bold font-mono">STOCKOUT</span>
                                  {item.replacementName && (
                                    <button 
                                      className="text-[7.5px] bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] px-1 rounded font-bold"
                                      onClick={() => handleSwapOOSItem(item.id, item.replacementName, 64)}
                                    >
                                      🔄 Swap Alt
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded font-bold font-mono">IN STOCK</span>
                              )}
                              <button 
                                className="bg-[#FF0077] hover:bg-[#E20066] text-white text-[10px] font-bold px-3 py-1 rounded"
                                onClick={() => {
                                  if (item.stock === 0) {
                                    setActiveGroceryForecast(item);
                                    runForecast(censoringRate);
                                  } else {
                                    handleAddToCart(item, "Instamart Store", "im_store");
                                  }
                                }}
                              >
                                {item.stock === 0 ? "Impute" : "+ Add"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeTab === 'orders' ? (
                    /* SCREEN 5: Live Order Tracking Maps */
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl space-y-4">
                      {activeOrder ? (
                        <>
                          <h3 className="font-bold text-xs text-white">Active Order Progress · {activeOrder.id}</h3>
                          <div className="h-56 w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
                            <LeafletMap 
                              center={HUB_COORDINATES.Bhubaneswar.center}
                              routePoints={HUB_COORDINATES.Bhubaneswar.route}
                              riderPos={getInterpolatedPosition(HUB_COORDINATES.Bhubaneswar.route, riderProgress)}
                              theme={theme}
                              zoom={15}
                            />
                          </div>
                          <div className="bg-[#12121A] p-3 rounded-lg text-xs space-y-2 border border-white/5">
                            <div className="flex justify-between font-bold">
                              <span>Courier Executive: Rajesh Kumar</span>
                              <span className="text-[#00E676]">En Route (EV Electric vehicle)</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#FF0077] h-full transition-all duration-300" style={{ width: `${riderProgress}%` }}></div>
                            </div>
                          </div>
                          <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold rounded-lg text-xs" onClick={triggerCancelOrder}>
                            Cancel & Rescue Order
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-8 opacity-60">
                          <span className="material-symbols-outlined text-4xl text-[#FF0077] mb-2">shopping_cart</span>
                          <h4 className="font-bold text-xs text-white">No active deliveries at the moment.</h4>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SCREEN 6: Profile reservations & list */
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl space-y-4">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Reservations & Addresses</h3>
                      
                      <div className="space-y-2">
                        <h4 className="font-bold text-[10px] text-gray-400">Dineout Reservations</h4>
                        {reservations.map(res => (
                          <div key={res.id} className="bg-[#12121A] border border-white/5 p-2 rounded flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-white block">{res.hotel}</span>
                              <span className="text-[10px] text-gray-500 font-mono">Time: {res.time} · Party: {res.party}</span>
                            </div>
                            <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold">{res.status}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-[10px] text-gray-400">Saved Addresses</h4>
                        {savedAddresses.map(addr => (
                          <div key={addr.id} className="bg-[#12121A] border border-white/5 p-2.5 rounded-lg text-xs">
                            <span className="font-bold text-white block">{addr.tag}</span>
                            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{addr.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* COLUMN 3: BASKET PERSISTENT CHECKOUT & LOGS (24%) */}
                <div className="w-[24%] flex flex-col gap-4 overflow-y-auto pr-2 hide-scrollbar h-full pb-10">
                  
                  {/* Shopping Basket invoice */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <ShoppingBasket className="w-4 h-4 text-[#FF0077]" />
                      <span>Shopping Basket</span>
                    </h3>

                    {cart.length > 0 ? (
                      <div className="space-y-4">
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold block text-white">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono">₹{item.price} x {item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 p-0.5 font-mono">
                                <button className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-white/10" onClick={() => updateCartQty(item.id, -1)}>-</button>
                                <span className="text-[10px] font-mono px-1">{item.quantity}</span>
                                <button className="w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-white/10" onClick={() => updateCartQty(item.id, 1)}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bill invoice list */}
                        <div className="space-y-1.5 border-t border-white/5 pt-3 text-[10px] text-gray-400 font-mono">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{getCartSubtotal()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Restaurant Packing</span>
                            <span>₹{getPackingFee()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST & Taxes (5%)</span>
                            <span>₹{getGSTAmount()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Partner</span>
                            <span>
                              {getDeliveryFee() === 0 ? "₹0 (Waived)" : `₹${getDeliveryFee()}`}
                            </span>
                          </div>
                          {/* Climate Checkbox */}
                          <div className="flex justify-between items-center text-[9px] pt-1">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={donateClimate} 
                                onChange={() => setDonateClimate(!donateClimate)}
                                className="rounded border-white/10 bg-black text-[#FF0077] w-2.5 h-2.5 focus:ring-0" 
                              />
                              <span>Climate Don. (₹2)</span>
                            </label>
                            <span>+₹{donateClimate ? 2 : 0}</span>
                          </div>
                          {/* Food Safety Checkbox */}
                          <div className="flex justify-between items-center text-[9px]">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={donateFoodSafety} 
                                onChange={() => setDonateFoodSafety(!donateFoodSafety)}
                                className="rounded border-white/10 bg-black text-[#FF0077] w-2.5 h-2.5 focus:ring-0" 
                              />
                              <span>Food Safety (₹2)</span>
                            </label>
                            <span>+₹{donateFoodSafety ? 2 : 0}</span>
                          </div>
                          
                          {appliedCoupon && (
                            <div className="flex justify-between text-[#00E676] font-bold border-t border-white/5 pt-1.5">
                              <span>Coupon Discount</span>
                              <span>-₹{getDiscountAmount()}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-xs text-white font-bold border-t border-white/10 pt-2.5">
                            <span>Grand Total</span>
                            <span className="text-[#FF0077]">₹{getCartTotal()}</span>
                          </div>
                        </div>

                        {/* Apply Coupon code */}
                        <div className="bg-black/30 border border-white/5 p-2 rounded-lg flex flex-col gap-1.5 mt-2">
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              placeholder="DIWALI50" 
                              value={couponCodeInput}
                              onChange={(e) => setCouponCodeInput(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white outline-none flex-grow"
                            />
                            <button className="bg-[#FF0077] hover:bg-[#E20066] text-white text-[9px] px-2.5 py-0.5 rounded font-bold" onClick={handleApplyCoupon}>Apply</button>
                          </div>
                          {couponMessage && <span className="text-[8px] font-bold text-[#FFB300]">{couponMessage}</span>}
                        </div>

                        <button 
                          className="w-full bg-[#FF0077] hover:bg-[#E20066] text-white text-xs font-bold py-2.5 rounded-xl shadow-lg glow-primary mt-2 active:scale-95 transition-transform"
                          onClick={handlePlaceOrder}
                        >
                          💸 Lock & Pay ₹{getCartTotal()}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 opacity-60 text-xs">
                        <span>Your basket is empty. Select items from categories or menus.</span>
                      </div>
                    )}
                  </div>

                  {/* Dual-Axis Weekly Recharts graph */}
                  <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-[10px] text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#FF0077]" />
                      Weekly spend vs Calories log
                    </h4>
                    <div className="h-36 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={expenseLogs} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWebSpend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF0077" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#FF0077" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorWebCals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8F00FF" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8F00FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#555" fontSize={8} />
                          <YAxis stroke="#555" fontSize={8} />
                          <Tooltip contentStyle={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', fontSize: 9, borderRadius: 6 }} />
                          <Area type="monotone" dataKey="amount" name="Spend (₹)" stroke="#FF0077" fillOpacity={1} fill="url(#colorWebSpend)" strokeWidth={2} />
                          <Area type="monotone" dataKey="calories" name="Calories (kcal)" stroke="#8F00FF" fillOpacity={1} fill="url(#colorWebCals)" strokeWidth={1.5} strokeDasharray="2 2" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 2: OPERATIONS COMMAND DESK (INTEL VIEW) */}
        {appView === 'intel' && (
          <div className="flex-grow p-6 bg-[#07070B] overflow-y-auto flex flex-col gap-6 w-full animate-fade-in">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-[#6C63FF] flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg text-white">Operations & Intel Command Center</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">
                  Active monitoring of Tobit MLE parameters, spatial route optimization algorithms, and anti-fraud filters.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Tobit MLE — live from /api/v1/metrics/availability */}
              <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse" />
                  Q1: Tobit MLE Demand Estimator
                  {availabilityMetrics && <span className="ml-auto text-[9px] text-[#00D4AA] font-mono">● LIVE</span>}
                </h3>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Censored Rate:</span>
                    <span className="font-bold font-mono">{availabilityMetrics ? `${(availabilityMetrics.censoring_rate * 100).toFixed(0)}%` : `${(censoringRate * 100).toFixed(0)}%`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Availability Rate:</span>
                    <span className="font-bold font-mono text-[#00D4AA]">{availabilityMetrics ? `${(availabilityMetrics.availability_rate * 100).toFixed(1)}%` : '94.7%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">WMAPE Lift:</span>
                    <span className="font-bold font-mono text-[#6C63FF]">{availabilityMetrics ? `+${(availabilityMetrics.wmape_lift * 100).toFixed(1)}%` : `+${forecastOutput.lift_pct.toFixed(1)}%`}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-gray-400">Avg Wastage:</span>
                    <span className="font-bold font-mono text-amber-400">{availabilityMetrics ? `${availabilityMetrics.average_wastage_units} units` : '4.2 units'}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: ETA Jitter Smoother — live from /api/v1/metrics/bump-rate */}
              <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                  Q2: ETA Jitter Smoother
                  {bumpRateMetrics && <span className="ml-auto text-[9px] text-[#00D4AA] font-mono">● LIVE</span>}
                </h3>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Raw MIMO Bumps:</span>
                    <span className="font-bold font-mono text-[#FF4757]">{bumpRateMetrics?.raw_mimo_bumps ?? 113}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gated Bumps:</span>
                    <span className="font-bold font-mono">{bumpRateMetrics?.gated_smoother_bumps ?? 21}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="font-bold text-white">Suppression:</span>
                    <span className="font-bold font-mono text-[#00D4AA]">{bumpRateMetrics ? `${bumpRateMetrics.jitter_suppression_pct}%` : '81.4%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storm Surge:</span>
                    <span className={`font-bold font-mono ${stormSurge ? 'text-[#FF4757]' : 'text-gray-400'}`}>
                      {bumpRateMetrics?.zone_status ?? (stormSurge ? 'ACTIVE' : 'INACTIVE')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: ML Robustness — live from /api/v1/metrics/robustness */}
              <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Q3: ML Robustness (PSI)
                  {mlRobustness && <span className="ml-auto text-[9px] text-[#00D4AA] font-mono">● LIVE</span>}
                </h3>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs space-y-2">
                  {mlRobustness ? (
                    <>
                      {Object.entries(mlRobustness.features_drift || {}).map(([feat, m]) => (
                        <div key={feat} className="flex justify-between">
                          <span className="text-gray-400 truncate">{feat.replace('weather_', '').replace('_elapsed_sec', '_time')}:</span>
                          <span className={`font-bold font-mono ${m.status === 'green' ? 'text-[#00D4AA]' : m.status === 'yellow' ? 'text-amber-400' : 'text-[#FF4757]'}`}>
                            PSI {m.psi?.toFixed(3)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-gray-400">Clipped Today:</span>
                        <span className="font-bold font-mono">{mlRobustness.clipping_guard?.total_clipped_observations_today ?? 0}</span>
                      </div>
                      <button
                        onClick={() => API.triggerRetrain().then(r => r && setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: 'MLOPS: Manual retrain triggered via dashboard.', type: 'success' }, ...p]))}
                        className="w-full mt-1 bg-[#6C63FF]/20 hover:bg-[#6C63FF]/40 border border-[#6C63FF]/30 text-[#6C63FF] py-1 rounded text-[9px] font-bold font-mono transition-all active:scale-95"
                      >
                        ⚡ TRIGGER RETRAIN
                      </button>
                    </>
                  ) : (
                    <>
                      {rescueOffers.length > 0 ? (
                        <div className="bg-[#FF4757]/10 p-2.5 rounded border border-[#FF4757]/20 text-[10px] text-white">
                          <p className="font-bold">Resale Opportunity Identified:</p>
                          <button className="w-full bg-[#FF4757] text-white py-1 rounded font-bold mt-2" onClick={() => claimRescueOffer(rescueOffers[0])}>Claim Resale</button>
                        </div>
                      ) : (
                        <div className="bg-white/5 p-3 rounded text-center text-[10px] text-gray-400">Sybil-Guard: No active resale offers in pool.</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>


            {/* GIS Routing Map and security log terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
              <div className="glass-panel p-5 rounded-xl lg:col-span-2 relative min-h-[300px] flex flex-col">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Spatial Routing (Bhubaneswar Hub)</h3>
                <div className="relative flex-grow rounded-xl overflow-hidden border border-white/10 z-0">
                  <LeafletMap 
                    center={HUB_COORDINATES.Bhubaneswar.center}
                    routePoints={HUB_COORDINATES.Bhubaneswar.route}
                    riderPos={activeOrder ? getInterpolatedPosition(HUB_COORDINATES.Bhubaneswar.route, riderProgress) : null}
                    theme={theme}
                    zoom={14}
                  />
                </div>
              </div>

              <div className="glass-panel p-5 rounded-xl flex flex-col">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Live Console Logs</h3>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex-grow font-mono text-[10px] text-gray-300 space-y-2 overflow-y-auto max-h-[300px]">
                  {arbitrageMessage && <div className="text-[#FF4757] font-bold p-1 bg-[#FF4757]/10 rounded border border-[#FF4757]/30">{arbitrageMessage}</div>}
                  {securityLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-gray-500">[{log.time}]</span>
                      <span className={log.type === 'error' ? 'text-[#FF4757]' : log.type === 'success' ? 'text-[#00D4AA]' : 'text-gray-300'}>{log.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {appView === 'admin' && (
          <div className="flex-grow p-6 bg-[#07070B] overflow-y-auto flex flex-col gap-6 w-full animate-fade-in pb-20">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-[#00D4AA] flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-bold text-lg text-white">Operations Parameter Configurator</h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">
                  Inject anomalies, monitor pick deadlines, review merchant portals, and configure logistics surge incentives.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0A0A0F] p-1 border border-white/10 rounded-lg">
                {[
                  { id: 'system', name: '⚙️ System' },
                  { id: 'restaurant', name: '🍳 Partner Portal' },
                  { id: 'picking', name: '📦 Dark Store Pick' },
                  { id: 'logistics', name: '🚴 Fleet Dispatch' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminSubTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all active:scale-95 ${
                      adminSubTab === tab.id 
                        ? 'bg-[#00D4AA] text-black shadow' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CONDITIONAL SUB-TABS RENDERING */}
            {adminSubTab === 'system' && (
              <>
                {/* Catalog Additions and Coupon Creators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Creator Card 1: Add New Restaurant */}
                  <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C63FF] flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-[#6C63FF]" />
                      Merchant Restaurant Creator
                    </h3>
                    <form onSubmit={handleCreateRestaurant} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-mono">Restaurant Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Subway Patia" 
                            value={newRestName}
                            onChange={(e) => setNewRestName(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-mono">Cuisine Tags</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Salads · Healthy" 
                            value={newRestCuisine}
                            onChange={(e) => setNewRestCuisine(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 uppercase font-mono">Image URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="https://..." 
                          value={newRestImage}
                          onChange={(e) => setNewRestImage(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none"
                        />
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-[9px] text-gray-400 uppercase font-mono">SLA Prep Time (min)</label>
                          <input 
                            type="number" 
                            value={newRestSLA}
                            onChange={(e) => setNewRestSLA(parseInt(e.target.value) || 20)}
                            className="bg-black/40 border border-white/10 rounded w-16 text-center text-xs p-1 text-white outline-none"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={newRestExclusive}
                            onChange={() => setNewRestExclusive(!newRestExclusive)}
                            className="rounded border-white/10 bg-black/40 text-[#6C63FF] focus:ring-0"
                          />
                          <span>Exclusive Partner?</span>
                        </label>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-[#6C63FF] text-white text-xs font-bold py-2 rounded-lg mt-2 active:scale-95 transition-all shadow"
                      >
                        Add Restaurant to Swiggy Feed
                      </button>
                    </form>
                  </div>

                  {/* Creator Card 2: Coupon Manager */}
                  <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#00D4AA] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#00D4AA]" />
                      Coupon & Offer Builder
                    </h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="text-[9px] text-gray-400 uppercase font-mono">Coupon Code</label>
                          <input 
                            type="text" 
                            placeholder="e.g. FESTIVAL60" 
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 uppercase font-mono">Discount %</label>
                          <input 
                            type="number" 
                            value={newCouponPct}
                            onChange={(e) => setNewCouponPct(parseInt(e.target.value) || 10)}
                            className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none text-center"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-400 uppercase font-mono">Minimum Order Value (₹)</label>
                        <input 
                          type="number" 
                          value={newCouponMin}
                          onChange={(e) => setNewCouponMin(parseInt(e.target.value) || 200)}
                          className="bg-black/40 border border-white/10 rounded w-full text-xs p-2 text-white outline-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-[#00D4AA] text-black text-xs font-bold py-2 rounded-lg mt-2 active:scale-95 transition-all shadow"
                      >
                        Generate & Publish Coupon
                      </button>
                    </form>
                  </div>
                </div>

                {/* Existing Stock, Dispute, and Festival settings */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                  {/* Column 1: Catalog Stock Controls */}
                  <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Instamart Stock Management</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[380px]">
                      {groceries.map(item => (
                        <div key={item.id} className="bg-white/5 border border-white/5 p-3 rounded-lg flex justify-between items-center">
                          <span className="font-bold text-xs text-white">{item.name}</span>
                          <button 
                            className={`px-3 py-1 rounded text-[10px] font-bold ${item.stock > 0 ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-red-500/10 text-red-500'}`}
                            onClick={() => handleToggleGroceryStock(item.id)}
                          >
                            {item.stock > 0 ? 'Stock: IN' : 'Stock: OUT'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: System Settings & Festive themes */}
                  <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">System Parameters & Overrides</h3>
                    
                    {/* Festival Override selections */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-2.5">
                      <div>
                        <span className="font-bold text-xs text-white block">Festival Overlay Overrides</span>
                        <span className="text-[9px] text-gray-500 font-mono">Dynamically injects visual themes</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['nominal', 'diwali', 'holi'].map(tName => (
                          <button 
                            key={tName}
                            onClick={() => {
                              setFestivalTheme(tName);
                              setSecurityLogs(prev => [
                                { time: new Date().toLocaleTimeString(), event: `ADMIN: Global festival override changed to "${tName.toUpperCase()}"`, type: 'success' },
                                ...prev
                              ]);
                            }}
                            className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all active:scale-95 ${
                              festivalTheme === tName 
                                ? 'bg-[#6C63FF] text-white font-bold shadow' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {tName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-white block">Monsoon Surge</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={stormSurge} 
                          onChange={() => setStormSurge(!stormSurge)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-[#FF4757] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>
                  </div>

                  {/* Column 3: Refund Disputes */}
                  <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Refund Disputes Triage</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[380px]">
                      {disputesQueue.map(disp => (
                        <div key={disp.id} className="bg-white/5 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-white">{disp.customer}</span>
                            <span className="text-[9px] font-mono">{disp.status}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">"{disp.text}"</p>
                          {disp.status === 'PENDING' && (
                            <button 
                              className="bg-[#6C63FF] text-white text-[10px] font-bold py-1 rounded"
                              onClick={() => processRefundTriage(disp.id)}
                            >
                              Run Triage
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: PARTNER PORTAL */}
            {adminSubTab === 'restaurant' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {/* Left Column: Live SLA Accepting queue */}
                <div className="glass-panel p-5 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF3366] animate-pulse" />
                    Incoming Zomato/Swiggy Orders (SOP-01 SLA accepting)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurantOrders.map(order => (
                      <div key={order.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-3 relative">
                        {order.status === 'PENDING' && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold font-mono text-[#FF3366]">
                            <Flame className="w-3.5 h-3.5 text-[#FF3366] animate-bounce" />
                            <span>{order.limit - order.elapsed}s LEFT</span>
                          </div>
                        )}
                        <div>
                          <span className="font-mono text-[10px] text-gray-500">{order.id}</span>
                          <h4 className="font-bold text-sm text-white mt-0.5">{order.name}</h4>
                          <span className="text-[11px] text-gray-400 block mt-1">{order.items}</span>
                          <span className="text-[11px] text-[#00D4AA] font-bold mt-1 block">Value: ₹{order.price}</span>
                        </div>

                        {/* Progress Bar showing elapsed SLA accept limit */}
                        {order.status === 'PENDING' && (
                          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-[#FF3366] transition-all duration-1000"
                              style={{ width: `${(order.elapsed / order.limit) * 100}%` }}
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          {order.status === 'PENDING' ? (
                            <>
                              <button 
                                onClick={() => {
                                  setRestaurantOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'COOKING', elapsed: 0 } : o));
                                  setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `SLA ACCEPT: Accepted order ${order.id} for preparation.`, type: 'success' }, ...p]);
                                }}
                                className="flex-grow bg-[#00D4AA] hover:bg-[#00D4AA]/80 text-black font-bold text-xs py-1.5 rounded transition-all active:scale-95"
                              >
                                Accept Order
                              </button>
                              <button 
                                onClick={() => {
                                  setRestaurantOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'REJECTED' } : o));
                                  setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `SLA REJECT: Merchant rejected order ${order.id}.`, type: 'error' }, ...p]);
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded transition-all active:scale-95"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className="w-full flex justify-between items-center text-xs py-1 bg-white/5 border border-white/5 px-3 rounded text-gray-400 font-mono">
                              <span>Status:</span>
                              <span className={`font-bold uppercase ${
                                order.status === 'COOKING' ? 'text-amber-400' : order.status === 'REJECTED' ? 'text-red-500' : 'text-gray-400'
                              }`}>{order.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Kitchen state flow tracker */}
                <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Merchant Kitchen SLA SOPs</h3>
                  <div className="space-y-4 font-mono text-[10px]">
                    <div className="p-3 bg-white/5 rounded border border-white/5 space-y-2">
                      <span className="font-bold text-white block">Active Preparation Pipelines</span>
                      <div className="space-y-2.5">
                        {restaurantOrders.filter(o => o.status === 'COOKING').length === 0 ? (
                          <span className="text-gray-500 text-[9px]">No items currently cooking.</span>
                        ) : (
                          restaurantOrders.filter(o => o.status === 'COOKING').map(o => (
                            <div key={o.id} className="flex flex-col gap-1 border-l-2 border-l-amber-500 pl-2">
                              <span className="text-white font-bold">{o.id} - Preparing</span>
                              <div className="flex gap-2.5 mt-1">
                                <button 
                                  onClick={() => {
                                    setRestaurantOrders(prev => prev.map(order => order.id === o.id ? { ...order, status: 'READY FOR PICKUP' } : order));
                                    setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `KITCHEN SOP: Marked order ${o.id} ready for delivery driver pickup.`, type: 'info' }, ...p]);
                                  }}
                                  className="bg-amber-500 text-black px-2 py-0.5 rounded text-[8px] font-bold"
                                >
                                  Ready to Pack
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded border border-white/5 space-y-2">
                      <span className="font-bold text-white block">Completed Ready-to-Deliver Queue</span>
                      <div className="space-y-1.5">
                        {restaurantOrders.filter(o => o.status === 'READY FOR PICKUP').map(o => (
                          <div key={o.id} className="flex justify-between items-center bg-[#00D4AA]/5 p-2 rounded border border-[#00D4AA]/10 text-[#00D4AA]">
                            <span>{o.id}</span>
                            <span className="font-bold text-[9px] uppercase">RIDER ASSIGNED</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DARK STORE PICKING */}
            {adminSubTab === 'picking' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {/* Left Column: picking sequence checklist */}
                <div className="glass-panel p-5 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                      Blinkit Picking Layout & Sequence (SOP-02 Target: 90s)
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span>Pick Time:</span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded ${pickingSLA > 90 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {Math.floor(pickingSLA / 60)}m {pickingSLA % 60}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {pickingList.map(item => (
                      <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs font-mono text-[#00E676]">
                            {item.location.split(',')[1].trim()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-white leading-tight">{item.name}</h4>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Location: <span className="text-[#00E676]">{item.location}</span> | Qty: {item.qty}</span>
                          </div>
                        </div>
                        <div>
                          {item.status === 'PENDING' ? (
                            <button 
                              onClick={() => {
                                setPickingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'PICKED' } : i));
                                setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `PICKING SOP: Scanned and verified barcode for item SKU ${item.id} in ${item.location}.`, type: 'success' }, ...p]);
                                
                                // Check if all items are picked to stop SLA timer
                                const temp = pickingList.map(i => i.id === item.id ? { ...i, status: 'PICKED' } : i);
                                if (temp.every(i => i.status === 'PICKED')) {
                                  setPickingActive(false);
                                  confetti({ particleCount: 50, spread: 45 });
                                }
                              }}
                              className="bg-[#00E676] hover:bg-[#00E676]/80 text-black text-[10px] font-bold px-3 py-1 rounded transition-all active:scale-95 font-mono"
                            >
                              Scan Barcode
                            </button>
                          ) : (
                            <span className="text-[10px] bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 px-3 py-1 rounded font-bold font-mono">
                              ✓ VERIFIED
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Visual Pathway path grid optimizer */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 font-mono text-[9.5px]">
                    <span className="font-bold text-white block">Optimized Picking Path Sequence:</span>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      <span className="bg-white/10 px-2 py-1 rounded text-white border border-white/15">Aisle 1 (B2)</span>
                      <span className="text-gray-500">➔</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white border border-white/15">Aisle 2 (A1)</span>
                      <span className="text-gray-500">➔</span>
                      <span className="bg-white/10 px-2 py-1 rounded text-white border border-white/15">Aisle 5 (C3)</span>
                      <span className="text-gray-500">➔</span>
                      <span className="bg-[#00E676]/20 border border-[#00E676]/30 px-2 py-1 rounded text-[#00E676]">Billing Counter</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Picking operations manual override */}
                <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Picking Console SOPs</h3>
                  <div className="space-y-4 font-mono text-[10px]">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
                      <span className="font-bold text-white block">Reset Picking Queue</span>
                      <p className="text-gray-400 leading-relaxed">Simulate a fresh order arrival inside the Dark Store warehouse.</p>
                      <button 
                        onClick={() => {
                          setPickingList(prev => prev.map(i => ({ ...i, status: 'PENDING' })));
                          setPickingSLA(0);
                          setPickingActive(true);
                          setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `PICKING SOP: Reset picking queue. Target SLA timer restarted.`, type: 'info' }, ...p]);
                        }}
                        className="w-full bg-[#6C63FF] text-white py-1.5 rounded text-xs font-bold"
                      >
                        Reset & Generate Run
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RIDER LOGISTICS */}
            {adminSubTab === 'logistics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                {/* Left Column: Rider dispatch & route batching */}
                <div className="glass-panel p-5 rounded-xl lg:col-span-2 flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                    Active Delivery Fleet & Route Batching Resolver
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {riderList.map(rider => (
                      <div key={rider.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-white">{rider.name}</span>
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold ${
                            rider.status === 'IDLE' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-amber-500/10 text-amber-500'
                          }`}>{rider.status}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">Location: {rider.location}</span>
                        {rider.batchedOrders.length > 0 && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[9px] text-gray-500">Batched Runs:</span>
                            {rider.batchedOrders.map(oId => (
                              <span key={oId} className="bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-[#6C63FF] px-1.5 py-0.2 rounded text-[8px] font-bold font-mono">
                                {oId}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Batch routing simulator details */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 font-mono text-[10px]">
                    <span className="font-bold text-white block">Logistics Engine SOP-03: Route Batching Rules</span>
                    <p className="text-gray-400 leading-normal">
                      Assigning two separate orders destined for co-located apartments to a single rider reduces cost per delivery (CPD) by 34% and improves rider payouts during peak surge windows.
                    </p>
                  </div>
                </div>

                {/* Right Column: Fleet weather modifiers */}
                <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Weather & Surge Modifiers</h3>
                  
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-white block">Rain Storm Incentives</span>
                        <span className="text-[9px] text-gray-500 font-mono">Applies +₹20 / order to rider payouts</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={stormSurge} 
                          onChange={() => {
                            setStormSurge(!stormSurge);
                            setSecurityLogs(p => [{ time: new Date().toLocaleTimeString(), event: `LOGISTICS SOP: Storm Surge ${!stormSurge ? 'ENABLED' : 'DISABLED'}. Rain incentive payouts recalculated.`, type: !stormSurge ? 'success' : 'error' }, ...p]);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-[#FF3366] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                      </label>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                      <span className="text-gray-400">Delivery Fee (Consumer side):</span>
                      <span className="font-bold text-white font-mono">{stormSurge ? '₹45 (Rain Surge)' : '₹30'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── SCREEN: Floating AI Agent Chat Drawer ─── */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setChatOpen(false)}>
          <div className="w-full max-w-[390px] h-full bg-[#0A0A0F] border-l border-white/10 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 px-4 border-b border-white/10 flex justify-between items-center bg-[#12121A]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#6C63FF]" />
                <div>
                  <h4 className="font-bold text-sm text-white">AI Agent</h4>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={() => setChatOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-[#6C63FF] text-white rounded-tr-none' : 'bg-[#12121A] border border-white/5 text-gray-200 rounded-tl-none'}`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-[#12121A]">
              <div className="flex gap-2">
                <input 
                  className="flex-grow bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none"
                  placeholder="Ask agent for high protein, low budget..."
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendAgentMessage();
                  }}
                />
                <button className="w-8 h-8 rounded-xl bg-[#6C63FF] text-white flex items-center justify-center" onClick={sendAgentMessage}>
                  <Play className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tobit Forecast Modal */}
      {activeGroceryForecast && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4" onClick={() => setActiveGroceryForecast(null)}>
          <div className="bg-[#12121A] border border-white/10 p-6 rounded-2xl max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm text-[#6C63FF] uppercase tracking-wider mb-1">Tobit Latent Demand Model</h3>
            <div className="bg-black/40 border border-white/5 p-3.5 rounded-xl text-xs space-y-2 font-mono mb-4">
              <div className="flex justify-between">
                <span>Imputed Latent Demand:</span>
                <span className="font-bold text-[#00D4AA]">{activeGroceryForecast.latent_demand} units / day</span>
              </div>
            </div>
            <button className="w-full bg-[#6C63FF] text-white py-2 rounded-lg text-xs font-bold" onClick={() => setActiveGroceryForecast(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* ─── PAYMENT GATEWAY MODAL ─── */}
      {paymentScreenOpen && checkoutPayload && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setPaymentScreenOpen(false)}>
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-sm w-full p-5 relative flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6C63FF]" />
                <span className="font-bold text-sm tracking-tight text-white font-mono">Secure Payment Gateway</span>
              </div>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setPaymentScreenOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Processing/Loading payment */}
            {paymentProcessing ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-t-[#6C63FF] border-white/10 animate-spin"></div>
                <div>
                  <h4 className="font-bold text-sm text-white">Processing Secure Payment</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Please do not refresh or close the page</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-[#00D4AA] rounded-full text-[9px] font-mono">
                  <span>🔒 PCI-DSS 256-Bit SSL Encrypted</span>
                </div>
              </div>
            ) : paymentSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-scale-up">
                <div className="w-12 h-12 rounded-full bg-[#00D4AA] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,212,170,0.4)]">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Payment Successful!</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Order placed with {checkoutPayload.restaurantName}</p>
                </div>
              </div>
            ) : (
              /* Payment Options selection list */
              <div className="space-y-4">
                
                {/* Cart summary */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400 block text-[9px]">TOTAL PAYABLE</span>
                    <span className="font-bold text-sm text-[#00D4AA] font-mono">₹{checkoutPayload.total}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">{checkoutPayload.items.length} Item(s)</span>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest block font-bold">Choose Payment Method</span>

                  {/* Co-Branded Card */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === 'cobranded' ? 'bg-[#6C63FF]/10 border-[#6C63FF]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment_opt" 
                        value="cobranded"
                        checked={selectedPaymentMethod === 'cobranded'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <CreditCard className="w-4 h-4 text-[#6C63FF]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">HyperFlow Co-Branded Card</span>
                        <span className="text-[9px] text-[#00D4AA] font-semibold">{currentTier.cashback}% Cashback Active</span>
                      </div>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'cobranded' ? 'border-[#6C63FF]' : 'border-gray-500'}`}>
                      {selectedPaymentMethod === 'cobranded' && <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>}
                    </span>
                  </label>

                  {/* UPI */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === 'upi_gpay' ? 'bg-[#6C63FF]/10 border-[#6C63FF]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment_opt" 
                        value="upi_gpay"
                        checked={selectedPaymentMethod === 'upi_gpay'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <Wallet className="w-4 h-4 text-[#00D4AA]" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">Google Pay / UPI</span>
                        <span className="text-[9px] text-gray-400">Direct instant transfer</span>
                      </div>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'upi_gpay' ? 'border-[#6C63FF]' : 'border-gray-500'}`}>
                      {selectedPaymentMethod === 'upi_gpay' && <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>}
                    </span>
                  </label>

                  {/* Credit Card */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === 'cc_visa' ? 'bg-[#6C63FF]/10 border-[#6C63FF]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment_opt" 
                        value="cc_visa"
                        checked={selectedPaymentMethod === 'cc_visa'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">Credit or Debit Card</span>
                        <span className="text-[9px] text-gray-400">Visa, MasterCard, RuPay</span>
                      </div>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'cc_visa' ? 'border-[#6C63FF]' : 'border-gray-500'}`}>
                      {selectedPaymentMethod === 'cc_visa' && <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>}
                    </span>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedPaymentMethod === 'cod' ? 'bg-[#6C63FF]/10 border-[#6C63FF]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="payment_opt" 
                        value="cod"
                        checked={selectedPaymentMethod === 'cod'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="hidden"
                      />
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white block">Cash on Delivery (COD)</span>
                        <span className="text-[9px] text-gray-400">Pay on doorstep</span>
                      </div>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedPaymentMethod === 'cod' ? 'border-[#6C63FF]' : 'border-gray-500'}`}>
                      {selectedPaymentMethod === 'cod' && <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></span>}
                    </span>
                  </label>

                </div>

                {/* Confirm Pay Button */}
                <button 
                  className="w-full bg-[#6C63FF] hover:bg-[#574FEB] text-white text-xs py-2.5 rounded-xl font-bold mt-2 shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  onClick={() => {
                    setPaymentProcessing(true);
                    setTimeout(() => {
                      setPaymentProcessing(false);
                      setPaymentSuccess(true);
                      setTimeout(() => {
                        setPaymentSuccess(false);
                        setPaymentScreenOpen(false);
                        executePaymentSuccess();
                      }, 1000);
                    }, 1500);
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pay & Confirm Order
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
