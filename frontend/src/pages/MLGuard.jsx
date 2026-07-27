import React, { useState, useEffect, useRef } from 'react';

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace('http', 'ws');
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DECISION_COLOR = {
  APPROVED: 'var(--accent)',
  REVIEW:   'var(--warning)',
  BLOCKED:  'var(--danger)',
};
const DECISION_BG = {
  APPROVED: 'rgba(0,228,117,0.1)',
  REVIEW:   'rgba(255,179,0,0.1)',
  BLOCKED:  'rgba(255,51,102,0.1)',
};

export default function MLGuard() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({ approved: 0, review: 0, blocked: 0, total: 0, avgScore: 0 });
  const [refundResult, setRefundResult] = useState(null);
  const [refundOrderId, setRefundOrderId] = useState('');
  const wsRef = useRef(null);
  const feedEndRef = useRef(null);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const connect = () => {
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/fraud-feed`);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onmessage = (e) => {
        const ev = JSON.parse(e.data);
        setEvents(prev => [...prev.slice(-79), ev]);
        setStats(prev => {
          const total = prev.total + 1;
          const approved = prev.approved + (ev.decision === 'APPROVED' ? 1 : 0);
          const review   = prev.review   + (ev.decision === 'REVIEW'   ? 1 : 0);
          const blocked  = prev.blocked  + (ev.decision === 'BLOCKED'  ? 1 : 0);
          const avgScore = (prev.avgScore * prev.total + ev.fraud_score) / total;
          return { total, approved, review, blocked, avgScore };
        });
      };
    } catch {
      setTimeout(connect, 3000);
    }
  };

  const runRefundTriage = async () => {
    const oid = refundOrderId.trim() || 'HF-00001';
    try {
      const res = await fetch(`${API_BASE}/api/ml/refund-triage?order_id=${encodeURIComponent(oid)}`);
      setRefundResult(await res.json());
    } catch {
      setRefundResult({ error: 'Backend not reachable. Make sure FastAPI is running.' });
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">ML Guard</div>
          <div className="page-subtitle">
            FraudGuard v2 · COD Gatekeeper · Rider Theft Sentinel · Semantic Refund Checker
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot" style={{ background: connected ? 'var(--accent)' : 'var(--danger)' }} />
          <span style={{ fontSize: 12, color: connected ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
            {connected ? 'Feed Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-4">
        <div className="kpi-card">
          <div className="kpi-label">Scored Today</div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-change">orders processed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Approved</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{stats.approved}</div>
          <div className="kpi-change">{stats.total ? ((stats.approved / stats.total) * 100).toFixed(0) : 0}% pass rate</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Flagged / Review</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>{stats.review}</div>
          <div className="kpi-change">manual queue</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Blocked</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.blocked}</div>
          <div className="kpi-change">avg score {stats.avgScore.toFixed(3)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Live fraud feed */}
        <div className="glass" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-glass)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', flex: 1 }}>
              Live Fraud Scoring Feed
            </span>
            <span className="badge badge-gray">FraudGuard v2 · {connected ? 'streaming' : 'offline'}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {events.length === 0 ? (
              <div style={{ color: 'var(--on-surface-variant)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                Connecting to fraud detection WebSocket...
              </div>
            ) : events.map((ev, i) => (
              <FraudRow key={i} ev={ev} />
            ))}
            <div ref={feedEndRef} />
          </div>
        </div>

        {/* Refund triage panel */}
        <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)', marginBottom: 10 }}>
              Refund Triage
            </div>
            <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 12 }}>
              Semantic plausibility checker + SLA penalty engine. Auto-approves, flags for manual review, or escalates.
            </p>
            <input
              style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border-glass)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--on-surface)', outline: 'none', fontFamily: 'var(--font-mono)', marginBottom: 8 }}
              placeholder="Order ID (e.g. HF-00001)"
              value={refundOrderId}
              onChange={e => setRefundOrderId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runRefundTriage()}
            />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={runRefundTriage}>
              Run Triage
            </button>
          </div>

          {refundResult && !refundResult.error && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{refundResult.order_id}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                  background: refundResult.decision === 'AUTO_APPROVE' ? 'rgba(0,228,117,0.15)' : refundResult.decision === 'MANUAL_REVIEW' ? 'rgba(255,179,0,0.15)' : 'rgba(255,51,102,0.15)',
                  color: refundResult.decision === 'AUTO_APPROVE' ? 'var(--accent)' : refundResult.decision === 'MANUAL_REVIEW' ? 'var(--warning)' : 'var(--danger)',
                }}>
                  {refundResult.decision}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>
                Confidence: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--on-surface)' }}>{refundResult.confidence}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 8 }}>
                Escrow: <span style={{ fontFamily: 'var(--font-mono)', color: refundResult.escrow_action === 'RELEASE' ? 'var(--accent)' : 'var(--warning)' }}>{refundResult.escrow_action}</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {refundResult.detected_reasons?.map(r => (
                  <span key={r} className="badge badge-orange">{r}</span>
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginTop: 10, lineHeight: 1.5 }}>
                {refundResult.model}
              </div>
            </div>
          )}

          {refundResult?.error && (
            <div className="badge badge-red" style={{ padding: '8px 12px', borderRadius: 8, fontSize: 11 }}>
              {refundResult.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FraudRow({ ev }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${DECISION_BG[ev.decision] || 'var(--border-glass)'}`,
      borderLeft: `3px solid ${DECISION_COLOR[ev.decision] || 'var(--border-glass)'}`,
      borderRadius: 8,
    }}>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)', width: 50, flexShrink: 0 }}>
        {ev.timestamp?.slice(11, 19)}
      </span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--primary)', width: 90, flexShrink: 0 }}>
        {ev.order_id}
      </span>
      <span style={{ fontSize: 12, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {ev.restaurant}
      </span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)', width: 55, flexShrink: 0, textAlign: 'right' }}>
        Rs {ev.order_value?.toFixed(0)}
      </span>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', width: 50, flexShrink: 0, textAlign: 'right', color: ev.fraud_score > 0.5 ? 'var(--danger)' : ev.fraud_score > 0.25 ? 'var(--warning)' : 'var(--accent)' }}>
        {ev.fraud_score?.toFixed(3)}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
        background: DECISION_BG[ev.decision], color: DECISION_COLOR[ev.decision],
        fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexShrink: 0,
      }}>
        {ev.decision}
      </span>
    </div>
  );
}
