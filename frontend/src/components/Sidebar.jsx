import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',                    icon: 'smart_toy',   label: 'AI Agent',        desc: 'LangGraph Agent' },
  { to: '/dark-store-intel',    icon: 'warehouse',   label: 'Store Intel',     desc: 'Tobit Forecast' },
  { to: '/site-selection',      icon: 'domain',      label: 'Site Selection',  desc: 'Pincode Lab' },
  { to: '/route-intelligence',  icon: 'alt_route',   label: 'Route Intel',     desc: 'Kalman & Dispatch' },
  { to: '/ml-guard',            icon: 'security',    label: 'ML Guard',        desc: 'Fraud Protection' },
  { to: '/analytics',           icon: 'analytics',   label: 'Analytics',       desc: 'Command Center' },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Brand Title */}
      <div style={styles.brandBox}>
        <div style={styles.logoBadge}>H</div>
        <div>
          <div style={styles.brandName}>HyperFlow</div>
          <div style={styles.brandSub}>Commerce Intelligence</div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Navigation */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              ...styles.navCard,
              ...(isActive ? styles.navCardActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  ...styles.iconBox,
                  background: isActive ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isActive ? 'transparent' : 'var(--bg-border)',
                  boxShadow: isActive ? '0 4px 14px var(--accent-coral-glow)' : 'none',
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18, color: isActive ? '#FFF' : 'var(--text-secondary)' }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div style={styles.navText}>
                  <div style={{
                    ...styles.navLabel,
                    color: isActive ? '#FFF' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                  }}>
                    {item.label}
                  </div>
                  <div style={styles.navDesc}>{item.desc}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'rgba(14, 12, 18, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid var(--bg-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 14px',
    gap: 16,
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '4px 6px',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-serif)',
    fontSize: 18,
    fontWeight: 700,
    color: '#FFF',
    boxShadow: '0 4px 16px var(--accent-coral-glow)',
  },
  brandName: {
    fontFamily: 'var(--font-serif)',
    fontSize: 18,
    fontWeight: 700,
    color: '#FFF',
    letterSpacing: '-0.01em',
  },
  brandSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    color: 'var(--text-muted)',
    marginTop: 1,
  },
  divider: {
    height: 1,
    background: 'var(--bg-border)',
    margin: '0 4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  navCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    background: 'transparent',
    border: '1px solid transparent',
  },
  navCardActive: {
    background: 'rgba(255, 51, 102, 0.08)',
    borderColor: 'rgba(255, 51, 102, 0.2)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: '1px solid var(--bg-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  navText: {
    flex: 1,
    minWidth: 0,
  },
  navLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    letterSpacing: '-0.01em',
  },
  navDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    color: 'var(--text-muted)',
    marginTop: 1,
  },
};
