import React, { useRef, useEffect } from 'react';

/**
 * MCPToolTrace — Live panel showing every Swiggy MCP tool call in real time.
 * Each event has: type (tool_call | tool_result), tool name, input, output, timing.
 */
export default function MCPToolTrace({ events }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  if (events.length === 0) {
    return (
      <div style={styles.empty}>
        <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--on-surface-variant)', opacity: 0.4 }}>
          electrical_services
        </span>
        <p style={styles.emptyText}>MCP tool calls will appear here</p>
        <p style={styles.emptyHint}>Send a message to watch the agent call Swiggy's real APIs live</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--accent)' }}>electrical_services</span>
        <span style={styles.headerText}>Live MCP Tool Trace</span>
        <span style={styles.count}>{events.filter(e => e.type === 'tool_call').length} calls</span>
      </div>
      <div style={styles.feed}>
        {events.map((event, i) => (
          <TraceEvent key={i} event={event} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function TraceEvent({ event }) {
  const [expanded, setExpanded] = React.useState(false);
  const ts = new Date().toTimeString().slice(0, 8);

  if (event.type === 'tool_call') {
    return (
      <div style={styles.event}>
        <div style={styles.eventHeader} onClick={() => setExpanded(p => !p)}>
          <span style={{ ...styles.tag, ...styles.tagCall }}>CALL</span>
          <span style={styles.toolName}>{event.tool}</span>
          <span style={styles.ts}>{ts}</span>
          <span style={{ ...styles.chevron, transform: expanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
        {expanded && (
          <div style={styles.body}>
            <div style={styles.bodyLabel}>INPUT</div>
            <pre style={styles.pre}>{JSON.stringify(event.input, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (event.type === 'tool_result') {
    const isError = event.is_error;
    return (
      <div style={{ ...styles.event, borderLeftColor: isError ? 'var(--danger)' : 'var(--accent)' }}>
        <div style={styles.eventHeader} onClick={() => setExpanded(p => !p)}>
          <span style={{ ...styles.tag, ...(isError ? styles.tagError : styles.tagResult) }}>
            {isError ? 'ERR' : 'OK'}
          </span>
          <span style={styles.toolName}>{event.tool}</span>
          <span style={{ ...styles.duration, color: isError ? 'var(--danger)' : 'var(--accent)' }}>
            {event.duration_ms}ms
          </span>
          <span style={styles.ts}>{ts}</span>
          <span style={{ ...styles.chevron, transform: expanded ? 'rotate(90deg)' : 'none' }}>›</span>
        </div>
        {expanded && (
          <div style={styles.body}>
            <div style={styles.bodyLabel}>OUTPUT</div>
            <pre style={{ ...styles.pre, maxHeight: 180, overflow: 'auto' }}>
              {JSON.stringify(event.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-glass)',
    flexShrink: 0,
  },
  headerText: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--on-surface-variant)',
    flex: 1,
  },
  count: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: 'var(--primary)',
    background: 'rgba(255,0,119,0.1)',
    padding: '2px 7px',
    borderRadius: 4,
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  event: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-glass)',
    borderLeft: '2px solid var(--primary)',
    borderRadius: 8,
    overflow: 'hidden',
    transition: 'border-color 0.15s',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '7px 10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  tag: {
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: 3,
    letterSpacing: '0.04em',
  },
  tagCall:   { background: 'rgba(255,0,119,0.2)',   color: 'var(--primary)' },
  tagResult: { background: 'rgba(0,228,117,0.2)',   color: 'var(--accent)'  },
  tagError:  { background: 'rgba(255,51,102,0.2)',  color: 'var(--danger)'  },
  toolName: {
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    color: 'var(--on-surface)',
    flex: 1,
  },
  duration: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
  },
  ts: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: 'var(--on-surface-variant)',
    opacity: 0.6,
  },
  chevron: {
    fontSize: 14,
    color: 'var(--on-surface-variant)',
    transition: 'transform 0.15s',
    lineHeight: 1,
  },
  body: {
    borderTop: '1px solid var(--border-glass)',
    padding: '8px 10px',
  },
  bodyLabel: {
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--on-surface-variant)',
    marginBottom: 5,
  },
  pre: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--on-surface)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    lineHeight: 1.6,
    margin: 0,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 10,
    padding: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--on-surface-variant)',
  },
  emptyHint: {
    fontSize: 11,
    color: 'var(--on-surface-variant)',
    opacity: 0.6,
    lineHeight: 1.5,
  },
};
