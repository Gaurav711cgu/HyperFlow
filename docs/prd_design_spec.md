# Product Requirement Document (PRD) & UI/UX Design Specification
**Project: HyperFlow Hyperlocal ML Operations Engine**

---

## 1. Product Overview & Core USP Blending
HyperFlow is a dual-purpose hyperlocal quick-commerce operations simulator. It demonstrates real-time production algorithms for food and grocery delivery platforms by pairing a **mock customer app** with a **live operational control room**. 

### The Interactivity Matrix (The "Blending" Rule)
Any action taken in the simulated phone client must dynamically alter the operational telemetry on the right pane:
1. **Grocery Stockouts (Instamart)**: When a user encounters an out-of-stock item (e.g., Milk or Bananas) in the phone simulator, they click "Impute Latent Demand." This triggers the backend Tobit MLE solver. The Control Room immediately updates to show the latent demand curve, censoring limits, and recommended replenishment units.
2. **Telemetry Weather Fluctuations (ETA)**: Toggling "Monsoon Storm Grid" in the phone simulator alters the status bar of the phone to a "Storm Surge Active" state and triggers rain telemetry. The Control Room graph starts plotting high-variance raw GPS arrival times (showing jitter) alongside our stable Gated Random Forest Smoother clock.
3. **Cancelled Food Resale (CORO)**: Placing an order and immediately cancelling it triggers the Zomato Food Rescue queue. The canceled items go on sale at a 50% markdown. When you attempt to purchase this discounted offer on the phone, the right-pane Sybil Guard monitor prints real-time safety inspection logs (matching IP subnets, device fingerprints, and coordinate ranges to block self-buyback exploits).
4. **SLA Batching**: Clicking "Optimize Route" on the phone or batcher widget calculates pairwise haversine distance matrices on the fly, rendering routing nodes (Dark Store, Customer 1, Customer 2) visually on a coordinate grid while ensuring max-delay does not exceed the 15-minute SLA.

---

## 2. UI/UX Architecture & Layout System

The dashboard is structured as a single-page responsive workspace divided into two main panels:

```
+-----------------------------------------------------------------------------------+
|  [Logo] HyperFlow  [ML Core v1.0] [API Status: ONLINE]        📍 Indiranagar, BLR  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------------------+  +-------------------------------------------------+  |
|  |  MOCK SMARTPHONE       |  |  OPERATIONS TELEMETRY CONTROL ROOM              |  |
|  |  Width: 410px          |  |  (60% Width, Responsive Grid)                    |  |
|  |  Height: 760px         |  |                                                 |  |
|  |                        |  |  +---------------------+ +--------------------+ |  |
|  |  +------------------+  |  |  | Q1: Tobit Imputer   | | Q2: ETA Smoother   | |  |
|  |  | OS Status Bar    |  |  |  |                     | | (Jitter Graph)     | |  |
|  |  +------------------+  |  |  +---------------------+ +--------------------+ |  |
|  |  | Auto-Promo Slide |  |  |  +---------------------+ +--------------------+ |  |
|  |  +------------------+  |  |  | Q3: Sybil Security  | | Q4: SLA Batcher    | |  |
|  |  | Food vs Groceries|  |  |  | (Monospace Logs)    | | (Routing Map)      | |  |
|  |  +------------------+  |  |  +---------------------+ +--------------------+ |  |
|  |  | Product Directory|  |  |                                                 |  |
|  |  | & Cart Triggers  |  |  |  +-------------------------------------------+  |  |
|  |  +------------------+  |  |  |  Swagger Interactive Documentation Link  |  |  |
|  |  | Active Tracker   |  |  |  +-------------------------------------------+  |  |
|  |  +------------------+  |  |                                                 |  |
|  +------------------------+  +-------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Spacing and Grid Rules
* **Outer Padding**: `1.5rem` (24px) around the main body container.
* **Grid Gap**: `2rem` (32px) between the Left Phone Simulator and Right Control Room.
* **Phone Frame Sizing**: Exact dimensions of `410px` width by `760px` height. Uses an outer border of `12px` solid charcoal grey (`#2d2d35`) and border-radius of `40px` to simulate modern smartphone bezels.
* **Telemetry Grid**: Displays as a 2x2 responsive grid on desktop screens, falling back to a single column on tablet/mobile screens.
* **Internal Card Padding**: `1.25rem` (20px) padding inside all control room quadrant cards.

---

## 3. Elite Color Palette (Nocturnal Epicure Specification)
To create a high-fidelity visual experience, Stitch should apply this curated dark-themed color system:

| Token Name | Hex Code / Value | CSS Variable | Applied Elements |
|---|---|---|---|
| **Midnight Backdrop** | `#0a0a0f` | `--bg-primary` | Main page background |
| **Dark Carbon Surface** | `#131317` | `--bg-secondary` | Telemetry container backdrop |
| **Glassmorphic Glass** | `rgba(25, 25, 30, 0.7)` | `--card-bg` | Phone screen & quadrant card background |
| **Zomato Crimson** | `#e23744` | `--accent-color` | Active highlights, Zomato logo, active order cancel buttons |
| **Zomato Glow** | `rgba(226, 55, 68, 0.2)` | `--accent-glow` | Hover glows and active borders |
| **Instamart Mint** | `#10b981` | `--success-color` | In-Stock tags, Tobit lift logs, ETA smoother line |
| **Telemetry Error** | `#ffb4ab` | `--error-color` | Out-Of-Stock labels, Raw GPS jumpy points, Sybil security alarms |
| **Blinkit Yellow** | `#f59e0b` | `--badge-warning` | Low stock thresholds |

---

## 4. Master Prompts for Stitch UI Generation

### Prompt A: Smartphone Customer App Mockup (Left Column)
```text
Generate a high-fidelity, vertical mobile application screen (dimensions: 410px by 760px) simulating a premium quick-commerce app. 
Use a dark background (#111115) and clean white/grey typography with Zomato red (#e23744) accents.

Sections to include from top to bottom:
1. Status Bar: Minimal bar with carrier name "HyperFlow OS", network signal icons, and battery percentage (94%).
2. Location Header: Interactive selector badge styled as "📍 Indiranagar, Bengaluru" with a dropdown caret.
3. Search Field: Rounded glassmorphic input bar containing text "Search dishes, fresh fruits, or resale deals..." with a magnifying glass icon.
4. Promotional Carousel: Auto-sliding card banner with gradient backdrops (e.g., Zomato Red to Maroon). Content: "Zomato Food Rescue - Get cancelled meals at 50% discount. Calibrated by weather thermal decay indexes."
5. Sub-Tab Switcher: Two pill buttons side-by-side: "Zomato Food" (active red state) and "Instamart Store" (inactive glass state).
6. Category Circular List: Four circular thumbnails with labels: Biryani, Burgers, Pizzas, Desserts. Active circular icon has a Zomato red border rings.
7. Active Order Progress Card: A floating card with a pulsing red status indicator. Title: "Order ORD_412 is preparing at kitchen." Includes a border button styled with red text: "Cancel Order (Triggers CORO)".
8. Food Rescue Alert Card: An active green alert box displaying: "Zomato Food Rescue Offer - 1x Mutton Biryani (INR 170). Original Price: Del INR 340 (50% off). SQI Thermal Quality: 94/100." Includes a solid green button: "Claim Resale".
```

### Prompt B: Operations Control Room Console (Right Column)
```text
Generate a responsive 2x2 dashboard grid simulating a live quick-commerce operations control room. 
Style: Glassmorphic cards with charcoal borders, glowing borders on active cards, and neon telemetry status signals.

Display the following four quadrants:
1. Quadrant 1 (Tobit Latent Demand Solver):
   - Title: "Q1: Tobit Latent Demand Solver" with a green "+33.1% Lift" badge.
   - Target SKU box: "Fresh Toned Milk 1L - Imputed Demand: 48.2 units/day (Recommended replenishment: 55 units)."
   - Slider Control: An active slider bar labeled "Simulation Censoring Rate: 40%".
   - Metrics: Two small boxes comparing "OLS WMAPE: 20.8%" and "Tobit WMAPE: 13.9%".

2. Quadrant 2 (Monsoon ETA Jitter Smoother):
   - Title: "Q2: Monsoon ETA Jitter Smoother" with a green status badge "81.4% Jitter Blocked".
   - Graph: A dark, grid-aligned line chart showing two paths. Path A (Raw GPS clock) shows jumpy, erratic red spikes. Path B (Gated Smoother) shows a smooth, stable green line.
   - Action Button: A wide button labeled "Inject Route Telemetry Update".

3. Quadrant 3 (Anti-Arbitrage Sybil-Guard Logs):
   - Title: "Q3: Anti-Arbitrage Sybil-Guard" with a red "100% Exploits Blocked" badge.
   - Log Screen: A black monospaced console window containing lines:
     "[01:10:12] Anti-Arbitrage Guard initialized on subnet 192.168.1.*"
     "[01:12:45] ALERT: Blocked self-buyback exploit (Co-Location distance: 11 meters)"
     "[01:12:46] RULE COMPLIANCE: IP subnet 192.168.1.* matches cancel origin."

4. Quadrant 4 (SLA Route Batcher Map):
   - Title: "Q4: SLA Route Batcher" with a green badge "Zero SLA Breaches".
   - Canvas: A dark map showing 4 node pins labeled "Dark Store", "ORD_1", "ORD_2", and "ORD_3" with thin connection lines.
   - Action Button: A blue button labeled "Optimize Route Permutations".
```
