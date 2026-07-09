/**
 * HyperFlow 3.0 — API Service Layer
 * Connects the React frontend to the FastAPI backend
 * All endpoints proxied via Vite dev server → /api → http://localhost:8000
 */

const BASE = import.meta.env.VITE_BACKEND_URL || '';

async function apiFetch(path, options = {}) {
  try {
    const url = BASE ? `${BASE}${path}` : path;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API error');
    }
    return res.json();
  } catch (err) {
    console.warn(`[API] ${path} failed (offline fallback):`, err.message);
    return null; // caller uses null to fall back to local state
  }
}

// ─── Dark Store / Inventory ───────────────────────────────────────────────────

export async function fetchRestockAlerts(storeId = 'store_01') {
  return apiFetch(`/api/v1/forecast/${storeId}/restock-alerts`);
}

export async function fetchForecast(storeId, skuId) {
  return apiFetch(`/api/v1/forecast/${storeId}/${skuId}`);
}

export async function fetchAvailabilityMetrics(storeId = 'store_01') {
  return apiFetch(`/api/v1/metrics/availability/${storeId}`);
}

export async function fetchProfitability(storeId) {
  return apiFetch(`/api/v1/profitability/${storeId}`);
}

export async function fetchBumpRate() {
  return apiFetch('/api/v1/metrics/bump-rate');
}

export async function fetchRobustness() {
  return apiFetch('/api/v1/metrics/robustness');
}

export async function triggerRetrain() {
  return apiFetch('/api/v1/ml/retrain', { method: 'POST' });
}

// ─── Inventory Reservation ────────────────────────────────────────────────────

export async function reserveInventory({ order_id, store_id, sku_id, qty_requested }) {
  return apiFetch('/api/v1/orders/reserve', {
    method: 'POST',
    body: JSON.stringify({ order_id, store_id, sku_id, qty_requested }),
  });
}

// ─── Restaurants & Coupons ───────────────────────────────────────────────────

export async function fetchRestaurants() {
  return apiFetch('/api/v1/restaurants');
}

export async function fetchRestaurantMenu(restaurantId) {
  return apiFetch(`/api/v1/restaurants/${restaurantId}/menu`);
}

export async function createRestaurant(data) {
  return apiFetch('/api/v1/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCoupons() {
  return apiFetch('/api/v1/coupons');
}

export async function createCoupon(data) {
  return apiFetch('/api/v1/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Dineout ─────────────────────────────────────────────────────────────────

export async function fetchDineoutReservations() {
  return apiFetch('/api/v1/dineout/reservations');
}

export async function reserveDineout({ hotel, time, party }) {
  return apiFetch('/api/v1/dineout/reserve', {
    method: 'POST',
    body: JSON.stringify({ hotel, time, party }),
  });
}

// ─── Expense Logs ─────────────────────────────────────────────────────────────

export async function fetchExpenseLogs() {
  return apiFetch('/api/v1/user/expenses');
}

// ─── Festival Settings ────────────────────────────────────────────────────────

export async function fetchFestivalSettings() {
  return apiFetch('/api/v1/settings/festival');
}

export async function updateFestivalSettings(theme_name) {
  return apiFetch(`/api/v1/settings/festival?theme_name=${theme_name}`, {
    method: 'POST',
  });
}

// ─── WebSocket Live Metrics ───────────────────────────────────────────────────

/**
 * Opens a WebSocket connection to the live metrics stream.
 * @param {function} onMessage - callback(data: object)
 * @returns {WebSocket} - call .close() to disconnect
 */
export function connectLiveMetrics(onMessage) {
  const wsBase = BASE
    ? BASE.replace(/^http/, 'ws')
    : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
  const ws = new WebSocket(`${wsBase}/ws/live-metrics`);
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch {}
  };
  ws.onerror = (e) => console.warn('[WS] live-metrics error', e);
  return ws;
}
