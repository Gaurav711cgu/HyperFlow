import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/agent',       label: 'AI Commerce Agent',   icon: 'smart_toy',    desc: 'LangGraph + Swiggy MCP' },
  { to: '/dark-store',  label: 'Dark Store Intel',     icon: 'warehouse',    desc: 'Tobit Demand Forecasting' },
  { to: '/route-intel', label: 'Route Intelligence',   icon: 'alt_route',    desc: 'Dispatch Optimization' },
  { to: '/ml-guard',    label: 'ML Guard',             icon: 'security',     desc: 'Fraud Detection' },
  { to: '/analytics',   label: 'Analytics',            icon: 'analytics',    desc: 'Command Center' },
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>H</div>
        <div>
          <div style={styles.logoText}>HyperFlow</div>
          <div style={styles.logoSub}>AI Commerce Platform</div>
        </div>
      </div>

      {/* Swiggy MCP badge */}
      <div style={styles.mcpBadge}>
        <span style={styles.mcpDot} />
        <span style={styles.mcpLabel}>Swiggy MCP Connected</span>
        <span style={styles.mcpCount}>35 tools</span>
      </div>

      <div style={styles.divider} />

      {/* Navigation */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ ...styles.navIcon, color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: 20 }}
                >
                  {item.icon}
                </span>
                <div style={styles.navText}>
                  <div style={{ ...styles.navLabel, color: isActive ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                    {item.label}
                  </div>
                  <div style={styles.navDesc}>{item.desc}</div>
                </div>
                {isActive && <div style={styles.activeBar} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerDot} />
        <div>
          <div style={styles.footerName}>Gaurav K.</div>
          <div style={styles.footerRole}>ML Engineer</div>
        </div>
        <div style={styles.footerVersion}>v3.0</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    flexShrink: 0,
    height: '100vh',
    background: 'var(--surface-panel)',
    borderRight: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    gap: 0,
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 4px 16px',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    color: '#fff',
    boxShadow: '0 0 16px var(--primary-glow)',
    flexShrink: 0,
  },
  logoText: {
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '-0.01em',
    color: 'var(--on-surface)',
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--on-surface-variant)',
    marginTop: 1,
  },
  mcpBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(0,228,117,0.08)',
    border: '1px solid rgba(0,228,117,0.2)',
    borderRadius: 8,
    padding: '7px 10px',
    marginBottom: 14,
  },
  mcpDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
    boxShadow: '0 0 6px var(--accent)',
  },
  mcpLabel: {
    fontSize: 11,
    color: 'var(--accent)',
    fontWeight: 500,
    flex: 1,
  },
  mcpCount: {
    fontSize: 10,
    color: 'rgba(0,228,117,0.6)',
    fontFamily: 'var(--font-mono)',
  },
  divider: {
    height: 1,
    background: 'var(--border-glass)',
    margin: '0 0 12px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 10px',
    borderRadius: 10,
    textDecoration: 'none',
    position: 'relative',
    transition: 'background 0.15s',
    cursor: 'pointer',
    background: 'transparent',
  },
  navItemActive: {
    background: 'rgba(255,0,119,0.08)',
    border: '1px solid rgba(255,0,119,0.15)',
  },
  navIcon: {
    flexShrink: 0,
  },
  navText: {
    flex: 1,
    minWidth: 0,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navDesc: {
    fontSize: 10,
    color: 'var(--on-surface-variant)',
    marginTop: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%',
    height: '60%',
    width: 3,
    borderRadius: '0 2px 2px 0',
    background: 'var(--primary)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 6px 0',
    borderTop: '1px solid var(--border-glass)',
    marginTop: 8,
  },
  footerDot: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--surface-high)',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--primary)',
    flexShrink: 0,
  },
  footerName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--on-surface)',
  },
  footerRole: {
    fontSize: 10,
    color: 'var(--on-surface-variant)',
  },
  footerVersion: {
    marginLeft: 'auto',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: 'var(--on-surface-variant)',
  },
};
