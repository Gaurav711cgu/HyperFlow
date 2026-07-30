import React from 'react';

const MCP_SERVERS = [
  { id: 'food', name: 'Food MCP', icon: 'restaurant', count: 14, color: '#FF3366' },
  { id: 'instamart', name: 'Instamart MCP', icon: 'local_convenience_store', count: 13, color: '#00E475' },
  { id: 'dineout', name: 'Dineout MCP', icon: 'table_restaurant', count: 8, color: '#FFB300' },
];

export default function MCPToolTrace({ events = [] }) {
  const activeTool = events.length > 0 ? events[events.length - 1] : null;
  const toolCalls = events.filter(e => e.type === 'tool_call');
  const toolResults = events.filter(e => e.type === 'tool_result');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Swiggy MCP Trace</div>
          <div style={styles.subtitle}>Real-time tool execution pipeline</div>
        </div>
        <div style={styles.countBadge}>
          {toolCalls.length} Executed
        </div>
      </div>

      {/* Server Category Cards */}
      <div style={styles.serverGrid}>
        {MCP_SERVERS.map(s => {
          const serverCalls = toolCalls.filter(tc => tc.server === s.id || (tc.tool && tc.tool.includes(s.id)));
          const isActive = activeTool?.server === s.id || (activeTool?.tool && activeTool.tool.includes(s.id));

          return (
            <div
              key={s.id}
              style={{
                ...styles.serverCard,
                borderColor: isActive ? s.color : 'var(--bg-border)',
                boxShadow: isActive ? `0 4px 16px ${s.color}33` : 'none',
              }}
            >
              <div style={styles.serverCardTop}>
                <div style={{ ...styles.serverIcon, background: `${s.color}15`, borderColor: `${s.color}35` }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: s.color }}>
                    {s.icon}
                  </span>
                </div>
                <span style={{ ...styles.serverBadge, color: s.color, background: `${s.color}15` }}>
                  {s.count} Tools
                </span>
              </div>
              <div style={styles.serverName}>{s.name}</div>
              <div style={styles.serverCallsText}>
                {serverCalls.length} calls this session
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Execution Feed */}
      <div style={styles.feedHeader}>
        <span style={styles.feedTitle}>Execution Event Log</span>
        {activeTool?.streaming && (
          <span style={styles.livePulse}>
            <span style={styles.pulseDot} /> Live
          </span>
        )}
      </div>

      <div style={styles.feed}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--text-muted)' }}>
              sync
            </span>
            <span>Ask the AI Agent to trigger live Swiggy MCP tools</span>
          </div>
        ) : (
          events.map((ev, i) => (
            <div key={i} style={styles.eventRow}>
              <div style={{
                ...styles.statusDot,
                background: ev.type === 'tool_call' ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                boxShadow: ev.type === 'tool_call' ? '0 0 6px var(--accent-amber)' : '0 0 6px var(--accent-emerald)',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.eventTool}>
                  {ev.tool || ev.name || 'MCP Execution'}
                </div>
                {ev.args && (
                  <div style={styles.eventArgs}>
                    {JSON.stringify(ev.args).slice(0, 70)}...
                  </div>
                )}
              </div>
              {ev.latency_ms && (
                <span style={styles.latencyBadge}>{ev.latency_ms}ms</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>Total Latency: {toolResults.reduce((acc, r) => acc + (r.latency_ms || 0), 0)}ms</span>
        <span>•</span>
        <span>{toolCalls.length} tool calls</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 18,
    gap: 14,
    background: 'rgba(18, 16, 23, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 18,
    fontWeight: 700,
    color: '#FFF',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    color: 'var(--text-secondary)',
    marginTop: 2,
  },
  countBadge: {
    padding: '4px 10px',
    background: 'rgba(255, 51, 102, 0.1)',
    border: '1px solid rgba(255, 51, 102, 0.25)',
    borderRadius: 'var(--radius-pill)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--accent-coral-pink)',
  },
  serverGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  serverCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    transition: 'all 0.2s ease',
  },
  serverCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverBadge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
  },
  serverName: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 600,
    color: '#FFF',
  },
  serverCallsText: {
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  feedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  feedTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-secondary)',
  },
  livePulse: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--accent-emerald)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-emerald)',
    boxShadow: '0 0 6px var(--accent-emerald)',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: 'var(--text-muted)',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--bg-border)',
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  eventTool: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 600,
    color: '#FFF',
  },
  eventArgs: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-muted)',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  latencyBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--accent-coral-pink)',
    background: 'rgba(255, 51, 102, 0.1)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 11,
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--bg-border)',
    paddingTop: 10,
  },
};
