import React, { useState, useEffect, useRef } from 'react';

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');

const STATUS_COLOR = { DELIVERING: 'var(--accent)', RETURNING: 'var(--warning)', IDLE: 'var(--on-surface-variant)' };

export default function RouteIntelligence() {
  const [dispatch, setDispatch] = useState(null);
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState([]);
  const wsRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const connect = () => {
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/dispatch`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000); // auto-reconnect
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setDispatch(data);
        if (data.batch) {
          setLog(prev => [
            ...prev.slice(-49),
            {
              ts: new Date().toTimeString().slice(0, 8),
              rider: data.batch.rider_id,
              orders: data.batch.orders,
              efficiency: data.batch.efficiency_score,
              saved: data.batch.saved_distance_km,
            },
          ]);
        }
      };
    } catch {
      setTimeout(connect, 3000);
    }
  };

  const riders = dispatch?.riders || [];
  const delivering = riders.filter(r => r.status === 'DELIVERING').length;
  const idle = riders.filter(r => r.status === 'IDLE').length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Route Intelligence</div>
          <div className="page-subtitle">
            Greedy Radius Dispatch Batcher · Kalman ETA Smoother · WebSocket live feed
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot" style={{ background: connected ? 'var(--accent)' : 'var(--danger)', boxShadow: connected ? '0 0 6px var(--accent)' : 'none' }} />
          <span style={{ fontSize: 12, color: connected ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
            {connected ? 'WebSocket Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-label">Active Orders</div>
          <div className="kpi-value">{dispatch?.active_orders ?? '—'}</div>
          <div className="kpi-change">in flight</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg ETA</div>
          <div className="kpi-value">{dispatch?.avg_eta_min ? `${dispatch.avg_eta_min}m` : '—'}</div>
          <div className="kpi-change" style={{ color: 'var(--accent)' }}>
            {dispatch?.eta_confidence ? `${(dispatch.eta_confidence * 100).toFixed(0)}% confidence` : ''}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Riders Delivering</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{delivering || '—'}</div>
          <div className="kpi-change">{idle} idle</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Last Batch Saved</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {dispatch?.batch?.saved_distance_km ? `${dispatch.batch.saved_distance_km}km` : '—'}
          </div>
          <div className="kpi-change">distance optimized</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Rider board */}
        <div className="glass" style={{ padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, flexShrink: 0 }}>
            Rider Status Board
          </div>
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {riders.length === 0 ? (
              <div style={{ color: 'var(--on-surface-variant)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                Connecting to dispatch WebSocket...
              </div>
            ) : riders.map(r => (
              <div key={r.id} style={riderRow}>
                <span className="status-dot" style={{ background: STATUS_COLOR[r.status] }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-variant)', width: 40 }}>{r.id}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: STATUS_COLOR[r.status], fontWeight: 600, width: 80 }}>{r.status}</span>
                {r.order_id && (
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{r.order_id}</span>
                )}
                {r.eta_min && (
                  <span className="badge badge-green">{r.eta_min}m ETA</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch log */}
        <div className="glass" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-glass)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)' }}>
              Batch Dispatch Log
            </span>
            <span className="badge badge-pink">{log.length} batches</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{entry.rider}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{entry.ts}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  {entry.orders.join(', ')}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <span className="badge badge-green">eff {(entry.efficiency * 100).toFixed(0)}%</span>
                  <span className="badge badge-gray">-{entry.saved}km</span>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

const riderRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 10px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-glass)',
  borderRadius: 10,
};
