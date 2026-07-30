import React, { useState, useRef, useEffect } from 'react';
import MCPToolTrace from '../components/MCPToolTrace.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ACTION_CARDS = [
  { icon: 'restaurant', label: 'RESTAURANTS', prompt: 'Search top biryani restaurants near me' },
  { icon: 'local_convenience_store', label: 'INSTAMART', prompt: 'Search organic milk and bananas on Instamart' },
  { icon: 'table_restaurant', label: 'DINEOUT', prompt: 'Find available Dineout tables for 2 tonight' },
  { icon: 'trending_up', label: 'DEMAND ML', prompt: 'Predict demand for Whitefield Dark Store tomorrow' },
  { icon: 'security', label: 'FRAUD GUARD', prompt: 'Triage refund request for Order HF-00001' },
  { icon: 'alt_route', label: 'DISPATCH', prompt: 'Show active rider dispatch route optimization' },
];

export default function AIAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to HyperFlow 3.0. I am your AI Commerce Intelligence Agent, directly integrated with Swiggy\'s 35 live MCP tools across Food, Instamart, and Dineout.\n\nSelect a quick action card or type below to initiate real-time tool orchestration and ML inference.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceEvents, setTraceEvents] = useState([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    const userMsg = { role: 'user', content: msg };
    const assistantMsg = { role: 'assistant', content: '', streaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'token') {
              setMessages(prev => {
                const copy = [...prev];
                const last = { ...copy[copy.length - 1] };
                last.content = (last.content || '') + event.text;
                copy[copy.length - 1] = last;
                return copy;
              });
            } else if (event.type === 'tool_call') {
              setTraceEvents(prev => [...prev, event]);
              setTotalCalls(c => c + 1);
            } else if (event.type === 'tool_result') {
              setTraceEvents(prev => [...prev, event]);
            } else if (event.type === 'done') {
              setMessages(prev => {
                const copy = [...prev];
                const last = { ...copy[copy.length - 1] };
                delete last.streaming;
                copy[copy.length - 1] = last;
                return copy;
              });
              setIsStreaming(false);
            } else if (event.type === 'error') {
              setMessages(prev => {
                const copy = [...prev];
                const last = { ...copy[copy.length - 1] };
                last.content = `Error: ${event.message}`;
                last.isError = true;
                delete last.streaming;
                copy[copy.length - 1] = last;
                return copy;
              });
              setIsStreaming(false);
            }
          } catch {
            // skip malformed line
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const copy = [...prev];
        const last = { ...copy[copy.length - 1] };
        last.content = `Connection error: ${err.message}. Ensure backend is running on port 8000.`;
        last.isError = true;
        delete last.streaming;
        copy[copy.length - 1] = last;
        return copy;
      });
      setIsStreaming(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Hero Header Section matching ui frontend.png */}
      <div style={styles.heroSection}>
        <div style={styles.heroPill}>
          <span style={styles.heroDot} />
          AN OPERATING SYSTEM FOR HYPERLOCAL FOOD COMMERCE
        </div>

        <h1 style={styles.heroHeadline}>
          Food Commerce. <span style={styles.heroItalic}>Simplified.</span>
        </h1>

        <p style={styles.heroSub}>
          Manage orders, search menus, predict store demand, and triage refunds — <span style={{ fontStyle: 'italic' }}>all in one beautiful dashboard.</span>
        </p>

        {/* Action Buttons */}
        <div style={styles.heroActions}>
          <button className="btn btn-coral" onClick={() => sendMessage('Search for biryani near me')}>
            Enter the flow →
          </button>
          <button className="btn btn-dark" onClick={() => sendMessage('Check Instamart stock for Amul Milk')}>
            ✨ Try the demo
          </button>
        </div>

        {/* Quick Action Icon Grid matching ui frontend.png */}
        <div style={styles.actionGrid}>
          {ACTION_CARDS.map((card, i) => (
            <div key={i} style={styles.iconCard} onClick={() => sendMessage(card.prompt)}>
              <div style={styles.iconBox}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--accent-coral-pink)' }}>
                  {card.icon}
                </span>
              </div>
              <span style={styles.iconLabel}>{card.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Chat Panel + MCP Trace Panel */}
      <div style={styles.layout}>
        {/* Chat / Messages Panel */}
        <div className="glass" style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            <div style={styles.chatTitleGroup}>
              <span style={styles.chatTitle}>AI Intelligence Session</span>
              <span className="badge badge-coral">{totalCalls} Tool Invocations</span>
            </div>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...styles.msgWrapper, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  ...styles.msgCard,
                  background: msg.role === 'user' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: msg.role === 'user' ? 'transparent' : 'var(--bg-border)',
                  color: '#FFF',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.role === 'user' ? '75%' : '90%',
                  boxShadow: msg.role === 'user' ? '0 4px 20px var(--accent-coral-glow)' : '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                  <div style={styles.msgHeader}>
                    <span style={styles.roleTag}>{msg.role === 'user' ? 'CLIENT REQUEST' : 'HYPERFLOW AGENT'}</span>
                  </div>
                  <div style={styles.msgContent}>{msg.content}</div>

                  {/* Sample ML Prediction Card matching Order #1024 style */}
                  {msg.role === 'assistant' && msg.content.includes('Tobit') && (
                    <div style={styles.mlCard}>
                      <div style={styles.mlCardHeader}>
                        <span>ML PREDICTIONS</span>
                        <span className="badge badge-green">Tobit MLE</span>
                      </div>
                      <div style={styles.mlGrid}>
                        <div>
                          <div style={styles.mlLabel}>Demand Forecast</div>
                          <div style={styles.mlVal}>847 units</div>
                        </div>
                        <div>
                          <div style={styles.mlLabel}>Store Viability</div>
                          <div style={styles.mlVal}>HIGH</div>
                        </div>
                        <div>
                          <div style={styles.mlLabel}>PSI Drift</div>
                          <div style={styles.mlVal}>0.041 (Green)</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div style={styles.inputContainer}>
            <input
              style={styles.inputField}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything... (e.g. Search biryani, check Instamart stock, triage refund)"
              disabled={isStreaming}
            />
            <button
              className="btn btn-coral"
              style={{ borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? 'Thinking...' : 'Send →'}
            </button>
          </div>
        </div>

        {/* Live MCP Tool Trace Panel */}
        <div style={styles.traceWrapper}>
          <MCPToolTrace events={traceEvents} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: '24px 32px',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    padding: '10px 0',
  },
  heroPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    background: 'rgba(255, 51, 102, 0.08)',
    border: '1px solid rgba(255, 51, 102, 0.25)',
    borderRadius: 'var(--radius-pill)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--accent-coral-pink)',
    letterSpacing: '0.08em',
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent-coral)',
    boxShadow: '0 0 8px var(--accent-coral)',
  },
  heroHeadline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 42,
    fontWeight: 700,
    color: '#FFF',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  heroItalic: {
    fontStyle: 'italic',
    color: 'var(--accent-coral-pink)',
  },
  heroSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--text-secondary)',
    maxWidth: 600,
    lineHeight: 1.5,
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  actionGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  iconCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--bg-border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'rgba(255, 51, 102, 0.08)',
    border: '1px solid rgba(255, 51, 102, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.08em',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
    minHeight: 500,
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--bg-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  chatTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 16,
    fontWeight: 700,
    color: '#FFF',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  msgWrapper: {
    display: 'flex',
  },
  msgCard: {
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTag: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  msgContent: {
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  mlCard: {
    marginTop: 10,
    padding: 12,
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(0, 228, 117, 0.3)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  mlCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--accent-emerald)',
  },
  mlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  mlLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
  },
  mlVal: {
    fontSize: 12,
    fontWeight: 700,
    color: '#FFF',
  },
  inputContainer: {
    padding: '14px 18px',
    borderTop: '1px solid var(--bg-border)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(0, 0, 0, 0.2)',
  },
  inputField: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    color: '#FFF',
  },
  traceWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
};
