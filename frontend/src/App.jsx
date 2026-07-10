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

// Import Modular Components
import AuthPortal from './components/AuthPortal.jsx';
import DiscoveryHub from './components/DiscoveryHub.jsx';
import RestaurantDetail from './components/RestaurantDetail.jsx';
import CartCheckout from './components/CartCheckout.jsx';
import RealTimeTracking from './components/RealTimeTracking.jsx';
import AICommerceAgent from './components/AICommerceAgent.jsx';
import OpsControlPanel from './components/OpsControlPanel.jsx';
import LockScreen from './components/LockScreen.jsx';
import LoyaltyAnalytics from './components/LoyaltyAnalytics.jsx';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [appView, setAppView] = useState('consumer'); 
  const [isSimulatorMode, setIsSimulatorMode] = useState(window.innerWidth >= 1024); 
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth < 1024);
  const [donateClimate, setDonateClimate] = useState(true);
  const [donateFoodSafety, setDonateFoodSafety] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setIsSimulatorMode(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // run initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2200); // 2.2 seconds splash animation
      return () => clearTimeout(timer);
    }
  }, [showSplash]);
  
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
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedBeverage, setSelectedBeverage] = useState('raita'); // 'raita' or 'pepsi'
  const [selectedSweet, setSelectedSweet] = useState('jamun'); // 'jamun', 'meetha', or 'none'
  const [deliveryMode, setDeliveryMode] = useState('ev'); // 'ev' or 'normal'
  const [activeOrder, setActiveOrder] = useState(null);
  const [riderProgress, setRiderProgress] = useState(0);
  const [restaurantPageOpen, setRestaurantPageOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  const handleSelectRestaurant = (rest) => {
    setSelectedRestaurant(rest);
    setRestaurantPageOpen(true);
    if (!rest.menu || rest.menu.length === 0) {
      API.fetchRestaurantMenu(rest.id).then(menuData => {
        if (menuData && Array.isArray(menuData) && menuData.length > 0) {
          setRestaurants(prev => prev.map(r => r.id === rest.id ? { ...r, menu: menuData } : r));
          setSelectedRestaurant(prev => prev && prev.id === rest.id ? { ...prev, menu: menuData } : prev);
        }
      });
    }
  };
  
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
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3O6h3kN5v2ZfZDd3Ufds1_PUUHBmlla4WShhsUOwN1BiWVty9aGs9k-ujSiY3HWg0c-a6yUVCpufZJTK3hqLopqOy-INM9HYG-SKcVE0PbA__mUudSLa2FZF4yeu1q6fwxpjVZXn7yNLyelP_KZmven-uKjmR8Q3bG2PkZi64JiSya_N0Zb1Ww0kf3A7LW34llf4b4dpiTff9GbejYkJFooJR4Slc4fs85sLnGz-kZjWnuFABxdtocK8oviRGW5vmkB6XF1IMU4YS",
      menu: [
        { id: "dum_gosht", name: "Dum Gosht Biryani", price: 349, rating: 4.6, desc: "Fragrant long-grain basmati rice layered with juicy mutton in royal spices.", protein: 36, cal: 540, veg: false, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAy8Ulq_axTRp6t2EagRb5G-YtqpRnvPzPmyNLG-1FBJ0_p-83Hb7anlB2ZhXsi9Yd0x4n4HVmWhRYJ4r1J0aeYhAKyBpAHs5R59gryk1trq626wW1LuUFZ7SkM8OvhMdS78RXzvNqpn-E03C047MfVamHP-NIetglvLA2A5zzJjsUUJ8KlWdV_E4DdUow8sK7YValAPmnwch_EcyAii9s8yhA-yi925HvzzqKBSoWyYDzGpNFU46e2dbF68cDx_CA1jI2gcAKBGs_E" },
        { id: "lazeez_chicken", name: "Lazeez Bhuna Murgh Biryani", price: 299, rating: 4.5, desc: "Tender boneless chicken in bhuna spices layered with basmati rice.", protein: 32, cal: 480, veg: false, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVH7_iiDjEwAqM-iOH8jm3r4ljZMINGVU_Xp5Q-c5wjp04ir3wyacHOLYmjmdPdsAEKmN7NFvNQ8ccPIwOAUEqVu7ESWWZFV7ECSWX7JzlbDWyCtYJ_7mti2MWNy3Yuj77gJG8cjX2qVom1OGcFA8kzAFxQ4u3CBk-mzNORIV01WqDHbcX9ae4xKUwXCM69aXnh0vKIHvWcTm7xzkbIx4a_pAK1gBNf1lGPPzRLuDKikphdzej965g0gpkdAKQ1V-5hDx9OoV1vQMF" },
        { id: "mint_raita", name: "Mint Raita", price: 49, rating: 4.2, desc: "Refreshing raita flavored with fresh mint leaves.", protein: 2, cal: 60, veg: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9dB7F5xSnF4KMn9vZmYR-rdDJJynymGxYucwoE-YBitPw0VKGSu-DN14kA90BSzp-2uy6VqlvfPFGUv1w1bAkAncDACJEjmjyIs5U_edIxKkwyJXxKBdiWMNunXofnk0gpGuMhOYRmiAlpBLt1eDqi27iQu4sKk2m2BOZdHLrGxGFXuHSxNxRfZrvdjjDlDh9Qzm9Bq8gJA1kCDLJqJ4Wt4tvK3bGLCdxh0ENy_AR1ED6oHIrCU53WfftTybXUz_QCYlouZZvj1fU" }
      ]
    },
    {
      id: "rest_carbon_grill",
      name: "Carbon Grill",
      cuisine: "Burgers · Wings · Sides",
      rating: 4.3,
      distance: "1.4 km",
      time: "22 min",
      slaConfidence: 94,
      isAIPick: false,
      isExclusive: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV",
      menu: [
        { id: "truffle_burger", name: "Truffle Cheese Burger", price: 280, rating: 4.5, desc: "Gourmet double-patty burger with Swiss cheese and black truffle aioli.", protein: 34, cal: 620, veg: false, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV" },
        { id: "peri_fries", name: "Spicy Peri Peri Fries", price: 149, rating: 4.3, desc: "Crispy golden skin-on fries tossed in house peri-peri spice dust.", protein: 5, cal: 320, veg: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9C62CkwFO1Ta65rOPGt_zkQb3NWBfpIVfhSCWsS173P7Hw1t8O2CFnA1Swhsh03BFAJeCU4v8zMcs2FtgfS9UKrkQ-pgIxmQV0atKwEY1VvIrOO2nqjJirHB5LtlEy7v2E23zmpz5QUROCmGsEwpUTOxc6-W7bqEnwZTpjlEj84W0_wRNkm3oiChRsbQBbdUsj6iQ4IQ8MjgCXDjvXHjIGyb2EehurUmG2rcFE5E_2NQqMXhnC7sZPl5JUl0b-89s8s1A5HghkpjV" }
      ]
    },
    {
      id: "rest_yoko_ono",
      name: "Yoko Ono Sushi",
      cuisine: "Sushi · Asian · Japanese",
      rating: 4.4,
      distance: "3.2 km",
      time: "18 min",
      slaConfidence: 98,
      isAIPick: false,
      isExclusive: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6",
      menu: [
        { id: "salmon_nigiri", name: "Salmon Nigiri (2pcs)", price: 320, rating: 4.7, desc: "Slices of premium fresh Atlantic salmon laid over seasoned sushi rice.", protein: 14, cal: 180, veg: false, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6" },
        { id: "tuna_maki", name: "Tuna Maki Roll (6pcs)", price: 280, rating: 4.5, desc: "Yellowfin tuna wrapped in nori sheet with sushi rice.", protein: 18, cal: 220, veg: false, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBY63vuIkeBp6l5cHYDUYAUxyfZjekeIUDrgoaWXdYWfRsIItON9yVcNgasVY5EVJ_z9UCEYE7ifS6es_em8GXuQSZjL4elMAOcYKY-mFqvK7XoIYiCdoO9fXcs76s27BFjIlZ-jibt94sXMKAMiW-HDhL8Fx6YgFDMjXCKJuqgQvL6f2QokApfLDSvnpgf5uRCpVCyjlevWvENzKb2pD1gJvWBrOj_kU8HsHYg8siO1GP2yGFdEgOS79jFlelYdFjbEs_cIizY-X6" }
      ]
    }
  ]);

  const [groceries, setGroceries] = useState([
    { id: "g_milk", name: "Amul Taaza Milk (1L)", brand: "Amul", price: 56, weight: "1L", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&auto=format&fit=crop&q=60", stock: 0, latent_demand: 48, restock: 55, replacementName: "GoodLife Tetra Pack Milk (1L)" },
    { id: "g_tomatoes", name: "Fresh Tomatoes (500g)", brand: "Organic Farms", price: 32, weight: "500g", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=60", stock: 3, latent_demand: 24, restock: 30 },
    { id: "g_bananas", name: "Organic Bananas (1 doz)", brand: "Fresh Produce", price: 60, weight: "1 Dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=60", stock: 18, latent_demand: 82, restock: 90 }
  ]);

  const [disputesQueue, setDisputesQueue] = useState([
    { id: "disp_1", customer: "Gaurav Nayak", merchantId: "rest_behrouz", type: "Cold Delivery", text: "Mutton Biryani was cold and dry on arrival.", items: "1x Dum Gosht Biryani", status: "PENDING", refundAmt: 349 },
    { id: "disp_2", customer: "Anjali Patnaik", merchantId: "rest_yoko_ono", type: "Missing Items", text: "Did not receive the salmon nigiri pieces.", items: "1x Salmon Nigiri (2pcs)", status: "PENDING", refundAmt: 320 }
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

  const handleAddOrCustomize = (item, restName, restId) => {
    if (item.id === 'dum_gosht') {
      setCustomizingItem({ dish: item, restaurantName: restName, restaurantId: restId });
    } else {
      handleAddToCart(item, restName, restId);
    }
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

  const executePaymentSuccess = async (directPayload = null) => {
    const payload = directPayload || checkoutPayload;
    if (!payload) return;
    
    const orderId = `HF-${Math.floor(Math.random() * 8999) + 1000}`;
    const timestamp = new Date().toLocaleTimeString();

    // Fire Confetti Blast
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Wire to backend inventory reserve lock manager
    for (const item of payload.items) {
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
    
    const newMessages = [...chatMessages, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString() }];
    setChatMessages(newMessages);
    setIsAgentThinking(true);
    setAgentThinkingTools(['agent_brain_router']);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });
      
      const data = await response.json();
      setIsAgentThinking(false);
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: data.reply,
        time: new Date().toLocaleTimeString(),
        tools: data.tools || []
      }]);
    } catch (err) {
      console.error("AI Agent Chat error:", err);
      setIsAgentThinking(false);
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: "Sorry, I had trouble communicating with my backend brain. Please verify that your backend server is running and the Gemini API key is configured.",
        time: new Date().toLocaleTimeString(),
        tools: []
      }]);
    }
  };

  if (showLockScreen) {
    return (
      <LockScreen 
        onUnlock={(clickedOrder) => {
          setShowLockScreen(false);
          setShowSplash(true);
        }} 
      />
    );
  }

  if (showSplash) {
    return (
      <div 
        onClick={() => setShowSplash(false)}
        className="fixed inset-0 bg-[#FF5200] z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer font-sans"
      >
        {/* Swiggy Logo (Main File) */}
        <div className="flex flex-col items-center gap-6">
          {/* Swiggy Map Pin Logo in white */}
          <div className="w-32 h-32 flex items-center justify-center text-white">
            <svg viewBox="0 0 120 180" className="w-full h-full filter drop-shadow-lg" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 0C26.86 0 0 26.86 0 60C0 102.5 60 180 60 180C60 180 120 102.5 120 60C120 26.86 93.14 0 60 0ZM60 105C35.15 105 15 84.85 15 60C15 35.15 35.15 15 60 15C84.85 15 105 35.15 105 60C105 84.85 84.85 105 60 105Z" />
              <path d="M60 25C47.85 25 38 34.85 38 47C38 53.08 42.92 57 47.97 60.1C51.51 62.27 54 63.8 54 65.5C54 67.43 51.43 69 47 69C41.48 69 36.5 65.52 36.5 61C36.5 59.34 35.16 58 33.5 58C31.84 58 30.5 59.34 30.5 61C30.5 70.39 37.61 77 47 77C59.15 77 69 67.15 69 55C69 48.92 64.08 45 59.03 41.9C55.49 39.73 53 38.2 53 36.5C53 34.57 55.57 33 60 33C65.52 33 70.5 36.48 70.5 41C70.5 42.66 71.84 44 73.5 44C75.16 44 76.5 42.66 76.5 41C76.5 31.61 69.39 25 60 25Z" fill="#FF5200" />
            </svg>
          </div>
          {/* Swiggy text wordmark in white */}
          <h1 className="text-white text-4xl font-extrabold tracking-[0.2em] font-sans drop-shadow-md">
            SWIGGY
          </h1>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthPortal onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (appView === 'admin') {
    return <OpsControlPanel onBack={() => setAppView('consumer')} />;
  }

  if (appView === 'loyalty') {
    return (
      <LoyaltyAnalytics 
        onBack={() => setAppView('consumer')} 
        onNavigate={(tab) => {
          if (tab === 'home') {
            setAppView('consumer');
            setActiveTab('home');
          } else if (tab === 'dineout') {
            setAppView('consumer');
            setActiveTab('dineout');
          } else if (tab === 'quick') {
            setAppView('consumer');
            setActiveTab('quick');
          } else if (tab === 'agent_chat') {
            setAppView('consumer');
            setChatOpen(true);
          }
        }}
        cartCount={cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
      />
    );
  }

  if (chatOpen) {
    return (
      <AICommerceAgent 
        onBack={() => setChatOpen(false)} 
        messages={chatMessages} 
        onSendMessage={sendAgentMessage} 
      />
    );
  }

  if (activeOrder) {
    return (
      <RealTimeTracking 
        onBack={() => setActiveOrder(null)} 
        riderPos={getInterpolatedPosition(HUB_COORDINATES.Bhubaneswar.route, riderProgress)} 
        routePoints={HUB_COORDINATES.Bhubaneswar.route} 
        orderStatus={riderProgress >= 100 ? "Arrived" : riderProgress >= 70 ? "Rider is delivering" : "Rider is picking up food"} 
        etaMinutes={Math.max(1, Math.round(15 * (1 - riderProgress / 100)))} 
        onChatClick={() => setChatOpen(true)} 
      />
    );
  }

  if (paymentScreenOpen) {
    return (
      <CartCheckout 
        cart={cart} 
        onBack={() => setPaymentScreenOpen(false)} 
        onUpdateQuantity={updateCartQty} 
        onPlaceOrder={(payload) => {
          const directPayload = {
            items: cart,
            restaurantName: cart[0]?.restaurantName || 'Instamart Store',
            restaurantId: cart[0]?.restaurantId || 'im_store',
            total: payload.grandTotal
          };
          setCheckoutPayload(directPayload);
          setCart([]);
          setPaymentScreenOpen(false);
          setActiveOrder({
            id: 'ORD-' + (Math.floor(Math.random() * 89999) + 10000),
            items: cart,
            total: payload.grandTotal,
            status: 'Preparing your meal'
          });
          setRiderProgress(0);
          executePaymentSuccess(directPayload);
        }} 
        coupons={coupons} 
      />
    );
  }

  if (restaurantPageOpen && selectedRestaurant) {
    return (
      <RestaurantDetail 
        restaurant={selectedRestaurant} 
        onBack={() => setRestaurantPageOpen(false)} 
        onAddToCart={handleAddToCart} 
        onCheckout={() => { setRestaurantPageOpen(false); setPaymentScreenOpen(true); }} 
        cart={cart} 
      />
    );
  }

  if (appView === 'consumer') {
    return (
      <DiscoveryHub 
        restaurants={restaurants} 
        groceries={groceries} 
        selectedAddress={selectedAddress} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSelectRestaurant={handleSelectRestaurant} 
        onAddToCart={handleAddToCart} 
        onOpenChat={() => setChatOpen(true)} 
        onOpenCheckout={() => setPaymentScreenOpen(true)} 
        onOpenOps={() => setAppView('intel')} 
        onOpenProfile={() => setAppView('loyalty')} 
        cart={cart}
      />
    );
  }

  return (
    <div className="bg-[#0A0A0F] text-white min-h-screen font-body-md overflow-hidden relative">
      
      {/* ─── Premium Glassmorphic Header ─── */}
      {!isMobileDevice && (
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
      )}


      {/* ─── Main Viewport Grid ─── */}
      <main className={`flex overflow-hidden ${isMobileDevice ? 'pt-0 h-screen w-screen' : 'pt-16 h-[calc(100vh-64px)]'}`}>
        
        {/* VIEW 1: CONSUMER EXPERIENCE */}
        {appView === 'consumer' && (
          <DiscoveryHub 
            restaurants={restaurants} 
            groceries={groceries} 
            selectedAddress={selectedAddress} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onSelectRestaurant={handleSelectRestaurant} 
            onAddToCart={handleAddToCart} 
            onOpenChat={() => setChatOpen(true)} 
            onOpenCheckout={() => setPaymentScreenOpen(true)} 
            onOpenOps={() => setAppView('admin')} 
            cart={cart}
          />
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
                {/* Two-Column Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* Merchant Restaurant Creator */}
                  <section className="glass-panel p-5 flex flex-col gap-4 rounded-xl border border-white/5 bg-[#0A0A0F]">
                    <header className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#FF0077] text-[18px]">storefront</span>
                        Merchant Restaurant Creator
                      </h2>
                    </header>
                    <form onSubmit={handleCreateRestaurant} className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Restaurant Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Subway Patia" 
                          value={newRestName}
                          onChange={(e) => setNewRestName(e.target.value)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#FF0077]/50 focus:border-[#FF0077] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Cuisine Tags</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mughlai, North Indian" 
                          value={newRestCuisine}
                          onChange={(e) => setNewRestCuisine(e.target.value)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#FF0077]/50 focus:border-[#FF0077] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/..." 
                          value={newRestImage}
                          onChange={(e) => setNewRestImage(e.target.value)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#FF0077]/50 focus:border-[#FF0077] transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">SLA Prep (min)</label>
                        <input 
                          type="number" 
                          value={newRestSLA}
                          onChange={(e) => setNewRestSLA(parseInt(e.target.value) || 20)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#FF0077]/50 focus:border-[#FF0077] transition-all font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5 select-none">
                        <input 
                          type="checkbox" 
                          checked={newRestExclusive}
                          onChange={() => setNewRestExclusive(!newRestExclusive)}
                          className="w-4 h-4 rounded bg-white/5 border border-white/10 text-[#FF0077] focus:ring-0 cursor-pointer"
                          id="exclusivePartner"
                        />
                        <label htmlFor="exclusivePartner" className="text-xs font-bold text-gray-300 cursor-pointer">Exclusive Partner</label>
                      </div>
                      <button 
                        type="submit" 
                        className="mt-2 w-full col-span-2 bg-[#FF0077] hover:bg-[#FF0077]/80 text-white text-xs py-2.5 rounded-full shadow-[0_0_12px_rgba(255,0,119,0.3)] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Provision Merchant</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                      </button>
                    </form>
                  </section>

                  {/* Coupon & Offer Builder */}
                  <section className="glass-panel p-5 flex flex-col gap-4 rounded-xl border border-white/5 bg-[#0A0A0F]">
                    <header className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#8F00FF] text-[18px]">local_offer</span>
                        Coupon & Offer Builder
                      </h2>
                    </header>
                    <form onSubmit={handleCreateCoupon} className="grid grid-cols-2 gap-3 flex-grow justify-between">
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Coupon Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. FESTIVAL60" 
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#8F00FF]/50 focus:border-[#8F00FF] transition-all font-mono uppercase"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Discount %</label>
                        <input 
                          type="number" 
                          value={newCouponPct}
                          onChange={(e) => setNewCouponPct(parseInt(e.target.value) || 10)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#8F00FF]/50 focus:border-[#8F00FF] transition-all font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase font-mono">Min Order (₹)</label>
                        <input 
                          type="number" 
                          value={newCouponMin}
                          onChange={(e) => setNewCouponMin(parseInt(e.target.value) || 200)}
                          className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#8F00FF]/50 focus:border-[#8F00FF] transition-all font-mono"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="mt-2 w-full col-span-2 bg-[#8F00FF] hover:bg-[#8F00FF]/80 text-white text-xs py-2.5 rounded-full shadow-[0_0_12px_rgba(143,0,255,0.3)] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[16px]">publish</span>
                        <span>Deploy Campaign</span>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:animate-shimmer"></div>
                      </button>
                    </form>
                  </section>
                </div>

                {/* Three-Column Bottom Configurator Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
                  
                  {/* Column 1: Instamart Stock Controls */}
                  <section className="glass-panel p-5 rounded-xl border border-white/5 bg-[#0A0A0F] flex flex-col">
                    <header className="pb-3 border-b border-white/5 mb-3">
                      <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#00E676] text-[18px]">inventory_2</span>
                        Instamart Stock Sync
                      </h2>
                    </header>
                    <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                      {groceries.map(item => (
                        <div key={item.id} className="bg-[#12121A] border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                              <span className="material-symbols-outlined text-gray-400 text-[14px]">local_drink</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white leading-tight">{item.name}</span>
                              <span className="text-[8px] text-gray-400 font-mono">SKU: SKU-{item.id.toUpperCase()}</span>
                            </div>
                          </div>
                          <button 
                            className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold transition-all border ${
                              item.stock > 0 
                                ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#00E676]/25' 
                                : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/25'
                            }`}
                            onClick={() => handleToggleGroceryStock(item.id)}
                          >
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? 'bg-[#00E676]' : 'bg-red-500'}`} />
                              {item.stock > 0 ? 'IN' : 'OUT'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Column 2: System Parameters & Overrides */}
                  <section className="glass-panel p-5 rounded-xl border border-white/5 bg-[#0A0A0F] flex flex-col gap-4">
                    <header className="pb-3 border-b border-white/5">
                      <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#FF9900] text-[18px]">tune</span>
                        Global Overrides
                      </h2>
                    </header>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Festival Surge Profiles</label>
                      <div className="bg-white/5 border border-white/5 p-1 rounded-lg flex gap-1">
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
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all active:scale-95 ${
                              festivalTheme === tName 
                                ? 'bg-[#6C63FF] text-white font-bold shadow' 
                                : 'bg-transparent text-gray-400 hover:text-white'
                            }`}
                          >
                            {tName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center select-none">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-red-500 text-[18px] animate-pulse">thunderstorm</span>
                          <span className="text-xs font-bold text-red-500">Monsoon Surge Alert</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={stormSurge} 
                            onChange={() => setStormSurge(!stormSurge)}
                            className="sr-only peer"
                            id="stormSurgeToggle"
                          />
                          <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full border border-white/5"></div>
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">Activates dynamic pricing multiplier +1.5x across delivery fleet.</p>
                    </div>
                  </section>

                  {/* Column 3: Refund Disputes */}
                  <section className="glass-panel p-5 rounded-xl border border-white/5 bg-[#0A0A0F] flex flex-col">
                    <header className="pb-3 border-b border-white/5 mb-3">
                      <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#FF0077] text-[18px]">support_agent</span>
                        Dispute Triage
                      </h2>
                    </header>
                    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                      {disputesQueue.map(disp => (
                        <div key={disp.id} className="bg-[#12121A] border border-white/5 p-3 rounded-lg flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-white font-mono">{disp.id || 'ORD-9921-A'}</span>
                            <span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">2m ago</span>
                          </div>
                          <p className="text-[10px] text-gray-300 leading-snug">"{disp.text}"</p>
                          <button 
                            className={`w-full py-1.5 rounded-full text-xs font-bold transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                              disp.status === 'APPROVED' 
                                ? 'bg-[#00E676]/10 border-[#00E676]/20 text-[#00E676]' 
                                : 'bg-[#FF3366]/10 border-[#FF3366]/30 text-[#FF3366] hover:bg-[#FF3366]/20'
                            }`}
                            onClick={() => {
                              if (disp.status === 'PENDING') {
                                processRefundTriage(disp.id);
                              }
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            <span>{disp.status === 'APPROVED' ? 'Triage Approved' : 'Run AI Triage'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
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

    </div>
  );
}
