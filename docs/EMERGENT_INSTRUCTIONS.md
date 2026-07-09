# Emergent & Stitch Execution Guide: HyperFlow Zomato-District UI

This file serves as the definitive input instructions for **Emergent** (using the Claude Fable model) to generate, refine, and wire the visual layers of the **HyperFlow 3.0** platform in **Google Stitch**.

---

## 1. System Prompt & Instruction for Emergent

Copy and paste the following block directly as your initial prompt to Emergent:

```text
You are an expert design engineer running Claude Fable in Google Stitch. I have uploaded the 'EMERGENT_INSTRUCTIONS.md' file. 

Analyze this document to:
1. Initialize the Obsidian Hyperflow Design System using the exact color tokens, typography settings (Inter for UI, JetBrains Mono for metrics), and 8px/4px layout rhythm.
2. Edit and generate all 16 screen permutations described in the document.
3. Purge all placeholders: use authentic high-resolution restaurant images, real food menu photos, and proper payment provider logos (no cartoon drawings or placeholder cards).
4. Implement haptic click triggers, hover highlights, and haptic-style transitions between panels.

Read the uploaded EMERGENT_INSTRUCTIONS.md fully before starting the generation process.
```

---

## 2. Design System Configuration (Stitch JSON Settings)

Ensure your Stitch project's design system parameters match the following:

```json
{
  "designTheme": {
    "colorMode": "DARK",
    "font": "INTER",
    "roundness": "ROUND_EIGHT",
    "customColor": "#FF0077",
    "saturation": 3,
    "namedColors": {
      "background": "#040406",
      "surface": "#0A0A0F",
      "surface-elevated": "#14141F",
      "primary": "#FF0077",
      "secondary": "#8F00FF",
      "success": "#00E676",
      "warning": "#FFB300",
      "border-glass": "rgba(255, 255, 255, 0.06)"
    }
  },
  "deviceType": "MOBILE"
}
```

---

## 3. Screen Specifications (All 16 Screens)

### A. Mobile Smartphone Client (11 Screens/States)
1. **Splash & Onboarding** – Centered glowing monogram logo with a radial backdrop fade and "Continue with Phone" button.
2. **Auth Portal** – Phone login sheet prompting OTP passcode entry with haptic-feedback keypad.
3. **Home Discovery Feed** – Top location header (Indiranagar, BLR), promo card carousel, tab switches ("Zomato Food" vs. "Instamart Store"), category pills, and "AI Recommended Pick of the Day".
4. **Search / Autocomplete** – Search bar with text input and autocomplete dropdown tags for trending dishes.
5. **Restaurant Detail Page** – Parallax header image, menu cards with calorie/protein badges, and floating bottom basket summary.
6. **Cart Drawer** – Slide-up panel displaying active orders, Ev vs. Normal delivery options, and the circular **AI Macro Nutrition Progress Ring**.
7. **Coupon Selection** – Coupon drawer showcasing active codes (`DIWALI50`, `HYPERPRO`, `FREEFEES`) with active borders.
8. **Secure Payment Screen** – Selector for Google Pay, Paytm, and co-branded credit cards. Confirming orders triggers full-screen `canvas-confetti` celebrations.
9. **Active Delivery Tracker** – Leaflet-based dark tiles map with coordinates from Patia Warehouse to Gaurav's home (Plot Lp 60, Prasanti Vihar). Animates a rider marker.
10. **AI Agent Chat Console** – Typewriter dialog window, displaying active tool executions as glass badges.
11. **Dineout Slot Booking** – Booking slots calendar for premium hotels (e.g. Mayfair Lagoon) with party size counters.

### B. Operations Control Room Dashboard (5 Screens/Tabs)
12. **System Telemetry Quadrant** – Plots live PSI (Population Stability Index) feature drift and Outbox queue sizes on area charts.
13. **Restaurant SLA Dashboard** – Lists active kitchen preparation timers, transitioning borders to red as limits are reached.
14. **Dark Store Picking Console** – Warehouse checklist showing aisle coordinates (e.g. Aisle 5, C3) and "Mark Packed" checkbox triggers.
15. **Geospatial Dispatch Map** – Renders delivery routes, showing rider velocity (`m/s`) and weather sensor anomalies.
16. **ML Guard / Dispute Triage** – Fraud monitoring table illustrating dispute details and semantic plausibility indicators.
