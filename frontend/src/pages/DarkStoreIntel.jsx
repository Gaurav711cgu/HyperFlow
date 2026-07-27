import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STORES = [
  { id: 'store_001', name: 'Patia Dark Store' },
  { id: 'store_002', name: 'Infocity Hub' },
  { id: 'store_003', name: 'Saheed Nagar Node' },
];

export default function DarkStoreIntel() {
  const [forecast, setForecast] = useState(null);
  const [storeHealth, setStoreHealth] = useState(null);
  const [selectedStore, setSelectedStore] = useState('store_001');
  const [loading, setLoading] = useState(true);

  const fetchData = async (storeId) => {
    setLoading(true);
    try {
      const [fcRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/ml/demand-forecast?store_id=${storeId}`),
        fetch(`${API_BASE}/api/ml/store-health`),
      ]);
      setForecast(await fcRes.json());
      setStoreHealth(await healthRes.json());
    } catch {
      // Backend not running — show placeholder
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(selectedStore); }, [selectedStore]);

  const currentStore = storeHealth?.stores?.find(s => s.id === selectedStore);
  const chartData = forecast?.forecast?.map(f => ({
    name: f.label,
    demand: f.predicted_units,
    lower: f.lower_ci,
    upper: f.upper_ci,
    isPeak: f.is_peak,
  })) || [];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dark Store Intel</div>
          <div className="page-subtitle">
            {forecast?.model || 'Heteroscedastic Tobit Regression (Type I Right-Censored)'} · Live demand forecasting
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {STORES.map(s => (
            <button
              key={s.id}
              className={`btn ${selectedStore === s.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedStore(s.id)}
              style={{ fontSize: 12, padding: '7px 14px' }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-label">Health Score</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>
            {loading ? '—' : currentStore?.health_score?.toFixed(1) ?? '—'}
          </div>
          <div className="kpi-change">/ 100 composite</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Orders</div>
          <div className="kpi-value">{loading ? '—' : currentStore?.active_orders ?? '—'}</div>
          <div className="kpi-change">live queue</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Fill Time</div>
          <div className="kpi-value">{loading ? '—' : `${currentStore?.avg_fill_time_min ?? '—'}m`}</div>
          <div className="kpi-change">pick + pack</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Model R²</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {forecast?.model_rsq ?? '—'}
          </div>
          <div className="kpi-change">Tobit fit quality</div>
        </div>
      </div>

      {/* Stock health bars */}
      {currentStore && (
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Stock Distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StockBar label="In Stock" pct={currentStore.in_stock_pct} color="var(--accent)" />
            <StockBar label="Low Stock" pct={currentStore.low_stock_pct} color="var(--warning)" />
            <StockBar label="Out of Stock" pct={currentStore.out_stock_pct} color="var(--danger)" />
          </div>
        </div>
      )}

      {/* Demand forecast chart */}
      <div className="glass" style={{ padding: 20, flex: 1, minHeight: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>24-Hour Demand Forecast</div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Predicted units with 95% confidence interval · Peak hours highlighted
            </div>
          </div>
          <span className="badge badge-green">Model live</span>
        </div>
        {loading ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
            Loading forecast...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF0077" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF0077" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="upperGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E475" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00E475" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#131316', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e5e1e6' }}
              />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#upperGrad)" />
              <Area type="monotone" dataKey="demand" stroke="#FF0077" strokeWidth={2} fill="url(#demandGrad)" dot={false} />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* All stores overview */}
      {storeHealth && (
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            All Stores
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {storeHealth.stores.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-glass)' }}>
                <span className="status-dot green" />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.health_score}</span>
                <span className="badge badge-gray">{s.active_orders} orders</span>
                <span className="badge badge-green">{s.in_stock_pct}% in stock</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StockBar({ label, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 100, fontSize: 12, color: 'var(--on-surface-variant)' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ width: 40, fontSize: 12, fontFamily: 'var(--font-mono)', color, textAlign: 'right' }}>{pct}%</div>
    </div>
  );
}
