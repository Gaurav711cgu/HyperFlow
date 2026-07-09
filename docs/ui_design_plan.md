# HyperFlow 3.0 — UI / UX Design Master Plan
> **This is the FRONTEND / DESIGN plan. Backend plan lives in `implementation_plan.md` — do not merge.**

---

## 1. What Makes Us Different

| Feature | Swiggy | Zomato | Blinkit | **HyperFlow** |
|---|---|---|---|---|
| ETA display | Static estimate | Static estimate | Countdown timer | **Live ML-smoothed ETA with confidence band** |
| Restaurant cards | Rating + time | Rating + time | N/A | **Fraud score + SLA confidence + AI pick badge** |
| Search | Text + voice | Text + voice + image | Text | **Natural language + dietary constraint parser** |
| Nutrition | None | None | None | **Live macro tracker as you add items** |
| Group order | Basic | Basic | None | **Multi-person dietary constraint solver** |
| Membership | Swiggy One | Zomato Gold | None | **HyperFlow Pro — AI-powered benefits** |
| Dark mode | Yes | Yes | No | **Default dark, glassmorphism throughout** |
| Personalization | Order history | Order history | Order history | **ML demand forecast + predictive reorder** |
| Order tracking | Map + steps | Map + steps | Dark store map | **Live rider on real map + ML ETA smoother** |

---

## 2. WOW Factors Extracted (Best of All 3 Apps)

### From Swiggy
- 🔥 Floating persistent cart bar (always visible, swipe-up to expand)
- 🔥 "Trending near you" real-time section
- 🔥 Instamart 10-min promise with live countdown
- 🔥 Live rider tracking with animated scooter on map
- 🔥 Smart search returning dish-level results (not just restaurant)
- 🔥 "Your usual?" quick reorder strip
- 🔥 Schedule for later (dinner booking flow)

### From Zomato
- 🔥 Blinking urgency indicators (X people viewing this restaurant)
- 🔥 Collections curated by personality ("Date Night", "Healthy Eats", "Late Night")
- 🔥 Food diary / nutrition log per order
- 🔥 "Trending this week in [City]" social proof strip
- 🔥 Photo-rich reviews with dish tagging
- 🔥 Gold benefits stack display (how much saved this month)

### From Blinkit
- 🔥 10-minute delivery countdown WITH dark store distance visualization
- 🔥 "Running low?" smart pantry suggestions
- 🔥 Scan-to-search (camera opens, scans barcode)
- 🔥 Category speed tiles (Meds, Grocery, Electronics — all sub-10min)
- 🔥 Price drop alerts

### HyperFlow-Only Additions (no one has these)
- ⚡ **AI Confidence Badge** — every restaurant card shows ML SLA confidence %
- ⚡ **Live Macro Ring** — circular progress ring in cart showing protein/carb/fat as you add
- ⚡ **Surge Detector** — "Prices may be 12% higher than usual right now — order in 20 min for best rate"
- ⚡ **Group Solve** — enter dietary constraints for all people → AI filters to dishes everyone can eat
- ⚡ **Inventory Intelligence** — "Stock running low at this store" warnings from Tobit model
- ⚡ **Combined Evening** — single flow: book a table + order dessert delivery to arrive when you get home
- ⚡ **Carbon Score** — CO2 estimate per order, green alternatives shown
- ⚡ **Fraud Shield Badge** — on delivery: "Your rider is verified ✓ | Payment secured ✓"

---

## 3. Design System (Stitch Tokens)

```
Brand:       HyperFlow
Mode:        DARK (default, light optional)
Font:        INTER (headings), JetBrains Mono (metrics only)
Roundness:   ROUND_EIGHT (8px radius — modern, not bubbly)
Saturation:  3 (vibrant but not neon)

Colors:
  --hf-primary:    #6C63FF   Electric Violet  (CTAs, active states)
  --hf-accent:     #00D4AA   Emerald Teal     (live indicators, success)
  --hf-danger:     #FF4757   Alert Red        (fraud, SLA breach, urgent)
  --hf-warn:       #FFB347   Amber            (surge, low stock)
  --hf-surface-0:  #0A0A0F   Near Black       (page background)
  --hf-surface-1:  #12121A   Card background
  --hf-surface-2:  #1A1A26   Elevated card
  --hf-glass:      rgba(255,255,255,0.05) + backdrop-blur(20px)
  --hf-border:     rgba(255,255,255,0.08)
  --hf-text-1:     #FFFFFF   Primary text
  --hf-text-2:     #A0A0B8   Secondary text
  --hf-text-3:     #606075   Muted text

Gradients:
  --grad-hero:     linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)
  --grad-card:     linear-gradient(180deg, rgba(108,99,255,0.15) 0%, transparent 100%)
  --grad-danger:   linear-gradient(135deg, #FF4757 0%, #FF6B35 100%)

Animations:
  --ease-smooth:   cubic-bezier(0.23, 1, 0.32, 1)   (all transitions)
  --ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1) (micro-interactions)
  Duration fast:   150ms
  Duration normal: 300ms
  Duration slow:   500ms
```

---

## 4. App Structure — All Screens

### Bottom Navigation (5 tabs, always visible)
```
🏠 Home  |  🔍 Search  |  ⚡ Quick  |  📦 Orders  |  👤 Profile
```

---

### Screen 1: Splash / Onboarding
**Layout:** Full-screen gradient (#6C63FF → #00D4AA) + animated HyperFlow logo
- Logo: "HF" monogram, particle explosion on load
- Tagline: "Smarter Food. Faster Everything."
- 3-slide onboarding: Food → Grocery → Dineout, each with Lottie animation
- "Continue with Phone" button (violet CTA)
- Swiggy OAuth happens here silently in background

---

### Screen 2: Home Feed
**Layout:** Scrollable feed, sticky top bar, floating cart

**Section A — Top Bar (sticky)**
```
[HF logo]  [Bhubaneswar ▼]  [🔔 bell]  [avatar]
[Search bar — "Biriyani, groceries, restaurants..."]
```
- Location pill: tap to change address (shows saved addresses from MCP)
- Search bar: glassmorphism card, placeholder rotates between 4 suggestions
- Bell: shows order status badge when active

**Section B — Live Status Strip** (only when order active)
```
[🛵 animated scooter] Your Biryani is 4 min away — ETA 9:32pm [Track →]
```
- Full-width violet bar, pulsing animation, slides in from top

**Section C — Hero Banner**
- 3-card horizontal carousel, auto-advances every 4s
- Card 1: "10-min grocery delivery" → links to Quick tab
- Card 2: "Tuesday Offer: 30% off your usual" → personalized from ML
- Card 3: "Book a table tonight" → links to Dineout
- Parallax on scroll: banner images shift at 0.5x scroll speed

**Section D — Category Pills** (horizontal scroll, no scrollbar)
```
[🍕 Pizza] [🍗 Chicken] [🥗 Healthy] [🍜 Chinese] [🎂 Dessert] [🥤 Drinks] [🛒 Grocery]
```
- Active pill: filled violet
- Each pill: 48px tall, rounded pill shape, emoji + label
- Haptic-style scale animation on tap (0.95 → 1.05 → 1.0)

**Section E — AI Pick of the Day**
```
⚡ HyperFlow AI Pick
"Based on your order history and current weather — try this"
[Large restaurant card with AI badge]
```
- Single full-width card
- AI badge: small violet chip "🤖 AI Recommended"
- Shows: restaurant name, cuisine, rating, ETA (ML-smoothed), SLA confidence %

**Section F — Your Usual** (if returning user)
```
"Your Tuesday usual 👇"
[Horizontal scroll of past order items with quick re-add buttons]
```
- Each item: dish thumbnail, name, restaurant, "+Add" button
- Predictive based on day-of-week ML model

**Section G — Trending Near You**
```
Trending in Bhubaneswar 🔥
[Restaurant card grid — 2 columns]
```
- Cards show: image (4:3), name, cuisine tags, rating chip, time, HF confidence badge
- Confidence badge: green "98% on-time" or amber "SLA variable"

**Section H — Collections**
```
Curated for you
[Horizontal scroll of collection cards]
```
- "Date Night 🕯️" | "Healthy & Light 🥗" | "Late Night Cravings 🌙" | "Budget Bites 💰"
- Each: gradient background, 3 restaurant thumbnails peeking

**Section I — Grocery Strip**
```
⚡ Quick Delivery
"Fresh fruits, dairy, snacks — in 10 minutes"
[Horizontal product scroll]
```
- Products from Instamart MCP `your_go_to_items`
- Each card: image, name, weight/qty, price, "+Add" button
- Stock status: green "In stock" or amber "Only 3 left" (Tobit model)

**Section J — Dineout Spotlight**
```
Dine Out Tonight 🍽️
[Horizontal restaurant cards for table booking]
```
- From Dineout MCP `search_restaurants_dineout`
- Shows: image, name, cuisine, cost-for-two, available slots count

---

### Screen 3: Search
**Layout:** Full screen, keyboard-first

**Top:**
- Back arrow | large search input (auto-focused) | voice 🎤 | camera 📷

**Before typing — Discovery state:**
```
Recent Searches      [Clear all]
  Chicken Biryani  × | Paneer Tikka  × | Maggi  ×

Trending Dishes 🔥
  [Grid of dish cards with photos]

Popular Near You
  [Restaurant list]
```

**While typing — Live results (50ms debounce):**
```
Dishes matching "bir..."
  🍛 Chicken Biryani — Behrouz Biryani (2.1km, 28 min)
  🍛 Veg Biryani — Paradise (1.4km, 22 min)
  
Restaurants
  Biryani Blues (4.3⭐, 0.8km)
```

**Filters panel (bottom sheet, swipe up):**
- Veg only toggle
- Max delivery time slider
- Min rating selector
- Cuisine multi-select
- Sort: Relevance | Rating | ETA | Price

---

### Screen 4: Restaurant Page
**Layout:** Fullscreen hero → sticky header → menu

**Hero (parallax):**
- Full-width image (16:9), parallax at 0.4x scroll speed
- Gradient overlay bottom: restaurant name, cuisine, rating pill
- On scroll: image compresses, sticky header appears

**Sticky Header (appears at scroll 200px):**
```
← [Restaurant Name]           🔍 🤍 ⋯
```

**Info Bar:**
```
⭐ 4.2 (2.1k reviews) · 2.1 km · 28-35 min
[Offers available 🏷️]  [Pure Veg 🟢]  [AI: 97% SLA ✓]
```

**Offer Strip (horizontal scroll):**
```
[50% off up to ₹100] [Free delivery on ₹199+] [HYPERONE: Extra 10%]
```

**Menu (sectioned list):**
- Left: sticky category sidebar (vertical scroll)
- Right: items list

Each menu item card:
```
[item image 80x80]  Chicken Biryani
                    Fragrant rice with...    ⭐ 4.5 (312)
                    ₹249                     [+ Add]
                    🥩 Protein: 32g  🔥 Cal: 480
```
- Nutrition shown subtly — expandable with chevron
- "Bestseller" badge on top items
- Veg/Non-veg indicator dot (green/red)
- Customise button appears after Add

**Floating Bottom Cart Bar:**
```
[basket icon] 2 items | ₹498        [View Cart →]
```
- Slides up from bottom when first item added
- Shows live macro summary on tap

---

### Screen 5: Cart
**Layout:** Bottom sheet → full screen

**Top:**
```
Your Order                                    [Edit ✏️]
From: Behrouz Biryani
```

**Items list:**
```
Chicken Biryani x1                           ₹249
  [- 1 +]
  Customisation: Extra raita
  
Garlic Naan x2                               ₹120
  [- 2 +]
```

**AI Nutrition Ring** (collapsible section):
```
🧬 Your Meal
[Circular progress: Protein 42g/60g goal | Carbs 78g | Fat 22g]
[Suggested add: "Add a salad for complete nutrition →"]
```

**Offers:**
```
Offers & Benefits        [Browse coupons →]
[SWIGGY50] 50% off applied — Saving ₹124 ✓
```

**Bill Summary:**
```
Item total          ₹369
Delivery partner fee  ₹40
Platform fee          ₹5
Taxes               ₹18.45
━━━━━━━━━━━━━━━━━━
To Pay             ₹432.45

💳 Pay via UPI / Card / Cash
```

**Place Order CTA:**
```
[    Place Order — ₹432.45    ]    ← large violet button, full width
```
- Pulsing glow animation when ready
- Disabled state: grey + spinner while verifying

---

### Screen 6: Live Order Tracking
**Layout:** Map fills top 60%, status below

**Map section:**
- Leaflet map, dark tiles (Carto)
- Animated scooter marker (SVG, smooth interpolation)
- Store pin (purple), home pin (teal)
- Route line: dashed violet → solid teal as rider progresses
- Map auto-zooms to keep both store + rider visible

**Status section (below map):**
```
🟢 Rider picked up your order · 9:14pm

━━━●━━━━━━━━━━━━━━━━━━━━
Placed  Accepted  Picked  ●Nearby  Delivered

ETA: 9:28pm (14 min)  ·  ML confidence: High ✓
[Rider: Rajesh K  ★4.9]    [📞 Call]  [💬 Chat]
```

**Fraud Shield Footer:**
```
🛡️ Fraud Shield Active
Your rider is verified · Payment secured · Order insured
```

---

### Screen 7: Quick Tab (10-min Grocery)
**Layout:** Blinkit-inspired speed-first design

**Header:**
```
⚡ Quick Delivery
[Countdown: 00:09:42 to your door]
```

**Top Categories:**
```
[🥛 Dairy] [🥬 Veggies] [🍎 Fruits] [💊 Meds] [🧴 Care] [🧹 Home]
```
- Each: icon + label, pill shape, 56px tall, glassmorphism

**Your Go-To Items** (from `your_go_to_items` Instamart MCP):
```
"Restock your basics"
[Horizontal product cards]
```

**Flash Deals:**
```
⚡ Ends in 02:14:37
[Product grid — 2 columns, price strikethrough + new price]
```

**Inventory Intelligence Bar:**
```
⚠️ Tomatoes running low at your nearest store
   Order now — only ~12 units left   [Add to cart]
```
← Powered by Tobit demand model

---

### Screen 8: Orders Tab
**Layout:** Tab bar (Active / Past) at top

**Active Orders card:**
```
[Live animated status bar]
Chicken Biryani + 2 items
Behrouz Biryani → Home
ETA: 14 min  🟢 Rider en route
[Track Order]
```

**Past Orders (infinite scroll):**
```
[Restaurant image 48x48]  Behrouz Biryani     Tue, Jul 8
                          Chicken Biryani...  ₹432
                          ⭐ Rate order    [Reorder]
```

**Reorder button:**
- Tap → shows smart reorder sheet
- "Same items?" / "Update cart?"
- If any item unavailable: "Chicken Biryani unavailable — try X instead?"

---

### Screen 9: Profile Tab
**Layout:** Hero section + settings list

**Hero:**
```
[Avatar circle — initials GN]
Gaurav Nayak
📍 Bhubaneswar · Member since 2023
[HyperFlow Pro 👑]  [Edit Profile ✏️]
```

**Stats Strip:**
```
[47 Orders]  [₹12,840 spent]  [3.2kg CO2 saved]
```

**HyperFlow Pro Card:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 HyperFlow Pro
Free delivery · Extra 10% off · Priority support
Saved this month: ₹847
[Manage subscription]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Settings Sections:**

*Account*
- Saved Addresses (4 saved)
- Payment Methods
- Dietary Preferences (Veg / Keto / Gluten-free)
- Nutrition Goals (daily macro targets)

*HyperFlow*
- AI Preferences (what the agent knows about you)
- Notification Settings
- Order History Export

*Security*
- Fraud Shield Status ✓
- Active Sessions
- Change Phone Number

*App*
- Dark Mode (default on)
- Language
- About HyperFlow
- Rate the App

---

### Screen 10: AI Agent Chat (Hidden Power Feature)
**Access:** Long press on search bar → "Ask HyperFlow AI"

**Layout:** Chat interface

```
[← Back]   🤖 HyperFlow AI   [⚡ Powered by Gemini]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"I want 150g protein today. Already had 80g.
 Budget under ₹300."

🤖 Searching restaurants...
   🔧 search_restaurants(lat: 20.29, lng: 85.82...)  ✓
   🔧 search_menu(query: "high protein")...  ✓

Here's what works for you:
[Card: Grilled Chicken Bowl — 45g protein, ₹220]
[Card: Paneer Tikka Wrap — 32g protein, ₹180]

Want me to add one to cart?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- Tool calls shown as animated glass chips
- Each chip: tool name + status indicator
- Streaming text with typewriter effect

---

### Screen 11: Dineout / Table Booking
**Layout:** Discovery + booking flow

**Discovery:**
- Map view / List view toggle
- Filters: Cuisine, Occasion, Budget, Available Now
- Restaurant cards: image, name, rating, cost-for-two, distance, slots available

**Restaurant Detail:**
- Hero image gallery (swipeable)
- Ratings + reviews
- Available slots calendar (from `get_available_slots`)
- Slot grid: Morning / Afternoon / Evening
- Guest count selector

**Booking Confirmation:**
```
✓ Table booked!
[Restaurant name]
Saturday, Jul 12 · 8:00pm · 2 guests

Your booking ID: HF-2847
Add to Calendar  |  Get Directions
```

---

## 5. Animations Specification

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Screen transitions | Slide + fade | 300ms | ease-smooth |
| Bottom sheet open | Slide up + blur bg | 350ms | ease-smooth |
| Cart bar appear | Slide up from bottom | 250ms | ease-bounce |
| Add to cart button | Scale 0.95→1.05→1.0 | 200ms | ease-bounce |
| Restaurant card hover | Lift (translateY -4px) + shadow | 200ms | ease-smooth |
| Scooter on map | Linear interpolation | continuous | linear |
| ETA countdown | Flip number animation | 1000ms | ease |
| Macro ring progress | Stroke-dashoffset draw | 600ms | ease-smooth |
| Tool call chips | Slide in from left | 150ms | ease-smooth |
| Hero banner | Parallax at 0.4x | continuous | linear |
| Category pills | Scale on tap | 150ms | ease-bounce |
| Loading skeleton | Shimmer gradient | 1500ms | linear loop |

---

## 6. Stitch Build Order (Screen Priority)

Use Google Stitch MCP to generate each screen in this order:

| Priority | Screen | Stitch Prompt Theme |
|---|---|---|
| 1 | Home Feed | Dark food delivery home, violet/teal, glassmorphism |
| 2 | Restaurant Page | Menu browser, parallax hero, sticky nav |
| 3 | Cart + Checkout | Cart summary, nutrition ring, place order |
| 4 | Live Tracking | Map view, progress steps, rider info |
| 5 | Quick Grocery | Blinkit-style speed, 10min promise |
| 6 | Search | Keyboard-first discovery, filters |
| 7 | Profile | Account dashboard, membership card |
| 8 | Orders | Timeline view, reorder flow |
| 9 | AI Chat | Chat bubbles, tool call chips |
| 10 | Dineout | Table booking calendar |
| 11 | Onboarding | 3-slide intro, OAuth trigger |

---

## 7. Stitch Design System Config

```json
{
  "designTheme": {
    "colorMode": "DARK",
    "font": "INTER",
    "roundness": "ROUND_EIGHT",
    "customColor": "#6C63FF",
    "saturation": 3
  },
  "deviceType": "MOBILE"
}
```

---

## 8. File Structure (Frontend Only)

```
frontend/src/
├── App.jsx                    # Router + bottom nav shell
├── App.css                    # Global tokens + resets
├── screens/
│   ├── Home.jsx               # Home feed (Screen 2)
│   ├── Search.jsx             # Search (Screen 3)
│   ├── Restaurant.jsx         # Restaurant page (Screen 4)
│   ├── Cart.jsx               # Cart (Screen 5)
│   ├── Tracking.jsx           # Live tracking (Screen 6)
│   ├── Quick.jsx              # Grocery quick (Screen 7)
│   ├── Orders.jsx             # Orders tab (Screen 8)
│   ├── Profile.jsx            # Profile (Screen 9)
│   ├── AgentChat.jsx          # AI agent (Screen 10)
│   └── Dineout.jsx            # Table booking (Screen 11)
├── components/
│   ├── BottomNav.jsx          # 5-tab navigation
│   ├── TopBar.jsx             # Sticky header
│   ├── RestaurantCard.jsx     # Reusable restaurant card
│   ├── ProductCard.jsx        # Grocery product card
│   ├── CartBar.jsx            # Floating cart bar
│   ├── NutritionRing.jsx      # Macro circular progress
│   ├── LiveETA.jsx            # ETA display + ML confidence
│   ├── ToolCallChip.jsx       # Agent tool call display
│   ├── FraudShield.jsx        # Security status indicator
│   └── SkeletonLoader.jsx     # Loading states
├── hooks/
│   ├── useSwiggyMCP.js        # API calls to backend
│   ├── useCart.js             # Cart state management
│   ├── useLocation.js         # Address management
│   └── useAgent.js            # WebSocket for AI agent
└── utils/
    ├── nutrition.js           # Macro calculations
    └── animations.js          # Shared animation configs
```

---

## 9. What Makes HyperFlow DIFFERENT in 1 Sentence per Feature

- **Every restaurant card** → shows ML SLA confidence, not just a static rating
- **Every ETA** → ML-smoothed, with confidence band (not a guess)
- **Every cart** → live nutrition macro ring updating as you add items
- **Every order** → Fraud Shield active badge throughout delivery
- **Every grocery item** → Tobit model stock intelligence ("only 3 left")
- **Search** → natural language dietary constraint parser ("high protein, no onion, under ₹250")
- **Group order** → AI finds menu items every person can eat simultaneously
- **AI Chat** → shows every tool call transparently — you see the AI thinking
- **Combined Evening** → book table + schedule food delivery for when you get home, one flow
