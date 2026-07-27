import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics/summary`);
      setData(await res.json());
    } catch {
      // backend offline
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, []);

  const revenueData = data?.weekly_revenue || [];
  const accuracy = data?.ml_model_accuracy || {};

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Analytics Command Center</div>
          <div className="page-subtitle">
            Aggregated from all 5 surfaces · ML model performance · Swiggy MCP call volume
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={fetchSummary}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
          Refresh
        </button>
      </div>

      {/* KPI row */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-label">GMV Today</div>
          <div className="kpi-value">₹{loading ? '—' : data?.gmv_today_lakhs}L</div>
          <div className="kpi-change" style={{ color: 'var(--accent)' }}>
            +{data?.gmv_change_pct}% vs yesterday
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Orders Today</div>
          <div className="kpi-value">{loading ? '—' : data?.order_volume_today?.toLocaleString()}</div>
          <div className="kpi-change">AOV ₹{data?.avg_order_value}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MCP Calls Today</div>
          <div className="kpi-value" style={{ fontSize: 22, color: 'var(--primary)' }}>
            {loading ? '—' : data?.mcp_calls_today?.toLocaleString()}
          </div>
          <div className="kpi-change">{data?.agent_sessions_today} agent sessions</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fraud Blocked</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>
            {loading ? '—' : data?.fraud_blocked_today}
          </div>
          <div className="kpi-change">orders intercepted</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2">
        {/* Revenue chart */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Weekly Revenue (Lakhs)</div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
            Last 7 days · GMV across all verticals
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#131316', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,0,119,0.06)' }}
              />
              <Bar dataKey="revenue_lakhs" fill="#FF0077" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order volume chart */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Weekly Order Volume</div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
            Food + Instamart + Dineout combined
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00E475" />
                  <stop offset="100%" stopColor="#FF0077" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#131316', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="orders" stroke="url(#lineGrad)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ML model accuracy */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 16 }}>
          ML Model Performance
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <ModelMetric
            label="Demand Forecast MAPE"
            value={`${accuracy.demand_forecast_mape}%`}
            model="Tobit Regression (Right-Censored)"
            color="var(--primary)"
            good={accuracy.demand_forecast_mape < 7}
          />
          <ModelMetric
            label="ETA Prediction MAE"
            value={`${accuracy.eta_mae_minutes} min`}
            model="Kalman Filter ETA Smoother"
            color="var(--accent)"
            good={accuracy.eta_mae_minutes < 3}
          />
          <ModelMetric
            label="Fraud Detection Precision"
            value={accuracy.fraud_precision}
            model="FraudGuard v2 Logistic"
            color="var(--warning)"
            good={accuracy.fraud_precision > 0.9}
          />
        </div>
      </div>

      {/* System info */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 14 }}>
          Platform Stack
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            'LangGraph Multi-Agent', 'Gemini 2.0 Flash', 'Swiggy MCP (35 tools)',
            'Tobit Regression', 'Kalman ETA Smoother', 'FraudGuard v2',
            'FastAPI + WebSocket', 'Recharts', 'React 19 + Vite',
          ].map(tag => (
            <span key={tag} className="badge badge-gray">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelMetric({ label, value, model, color, good }) {
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontFamily: 'var(--font-mono)', fontWeight: 700, color, marginBottom: 6, lineHeight: 1 }}>{value || '—'}</div>
      <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginBottom: 8 }}>{model}</div>
      <span className={`badge ${good ? 'badge-green' : 'badge-orange'}`}>
        {good ? 'Good' : 'Acceptable'}
      </span>
    </div>
  );
}
