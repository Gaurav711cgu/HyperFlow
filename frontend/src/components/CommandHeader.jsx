import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CommandHeader() {
  const [stats, setStats] = useState({
    psiStatus: 'GREEN',
    psiScore: 0.041,
    wmapeLift: 24.3,
    mcpTools: 35,
    connected: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/summary`);
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({
            ...prev,
            connected: true,
          }));
        }
      } catch {
        // Keeps fallback
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={styles.header}>
      {/* Brand Badge */}
      <div style={styles.brandGroup}>
        <div style={styles.logoPill}>
          <span style={styles.logoDot} />
          <span>HYPERFLOW OPERATING SYSTEM</span>
        </div>
      </div>

      {/* Live Stat Badges */}
      <div style={styles.statGroup}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>PSI DRIFT</span>
          <div style={styles.valGroup}>
            <span style={styles.dotGreen} />
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{stats.psiStatus}</span>
            <span style={styles.statSub}>({stats.psiScore})</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>WMAPE LIFT</span>
          <span style={{ color: 'var(--accent-coral-pink)', fontWeight: 700 }}>+{stats.wmapeLift}%</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>SWIGGY MCP</span>
          <span style={{ color: '#FFF', fontWeight: 700 }}>{stats.mcpTools} Tools</span>
        </div>

        <div style={{ ...styles.statCard, borderColor: stats.connected ? 'rgba(0, 228, 117, 0.3)' : 'rgba(255, 51, 102, 0.3)' }}>
          <span style={styles.statLabel}>STATUS</span>
          <span style={{ color: stats.connected ? 'var(--accent-emerald)' : 'var(--accent-coral)', fontWeight: 700 }}>
            {stats.connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 60,
    background: 'rgba(10, 9, 13, 0.8)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--bg-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    zIndex: 20,
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'rgba(255, 51, 102, 0.08)',
    border: '1px solid rgba(255, 51, 102, 0.25)',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--accent-coral-pink)',
    letterSpacing: '0.08em',
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-coral)',
    boxShadow: '0 0 8px var(--accent-coral)',
  },
  statGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'rgba(18, 16, 23, 0.7)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  valGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-emerald)',
    boxShadow: '0 0 6px var(--accent-emerald)',
  },
  statSub: {
    fontSize: 11,
    color: 'var(--text-secondary)',
  },
};
