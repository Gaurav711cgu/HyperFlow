import React, { useState, useRef, useEffect } from 'react';
import MCPToolTrace from '../components/MCPToolTrace.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STARTER_PROMPTS = [
  'Search for the best biryani restaurants near me',
  'What are my recent food orders?',
  'Find vegetarian options on Instamart',
  'Search for dineout restaurants for 2 people tonight',
  'Show me available coupons and offers',
];

export default function AIAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I am the HyperFlow AI Commerce Agent, connected to Swiggy\'s live MCP platform. I have access to 35 real-time tools across Food delivery, Instamart, and Dineout.\n\nTry asking me to search for restaurants, browse menus, check your orders, or find grocery products.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceEvents, setTraceEvents] = useState([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

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
            // skip malformed event
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const copy = [...prev];
        const last = { ...copy[copy.length - 1] };
        last.content = `Connection error: ${err.message}. Make sure the backend is running on port 8000.`;
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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>AI Commerce Agent</div>
          <div style={styles.subtitle}>LangGraph agent · Gemini 2.0 Flash · 35 Swiggy MCP tools</div>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.stat}>
            <span style={styles.statDot} />
            <span style={styles.statLabel}>Live</span>
          </div>
          <div style={styles.statPill}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)' }}>
              {totalCalls}
            </span>
            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}> MCP calls</span>
          </div>
        </div>
      </div>

      {/* Main layout: chat + trace */}
      <div style={styles.layout}>
        {/* Chat */}
        <div style={styles.chatPanel}>
          {/* Starter prompts */}
          {messages.length <= 1 && (
            <div style={styles.starters}>
              {STARTER_PROMPTS.map((p, i) => (
                <button key={i} style={styles.starterBtn} onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <input
              ref={inputRef}
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask the agent to search restaurants, check orders, find products..."
              disabled={isStreaming}
            />
            <button
              style={{ ...styles.sendBtn, opacity: isStreaming || !input.trim() ? 0.5 : 1 }}
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
            >
              {isStreaming ? (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>hourglass_top</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
              )}
            </button>
          </div>
        </div>

        {/* MCP Trace Panel */}
        <div style={styles.tracePanel}>
          <MCPToolTrace events={traceEvents} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ ...styles.bubble, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={styles.agentAvatar}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>smart_toy</span>
        </div>
      )}
      <div style={{
        ...styles.bubbleContent,
        background: isUser ? 'var(--primary)' : 'var(--surface-elevated)',
        borderColor: isUser ? 'var(--primary)' : 'var(--border-glass)',
        color: isUser ? '#fff' : 'var(--on-surface)',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: isUser ? '70%' : '85%',
        opacity: msg.streaming ? 0.85 : 1,
        borderBottomRightRadius: isUser ? 4 : 14,
        borderBottomLeftRadius: isUser ? 14 : 4,
      }}>
        <span style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 }}>
          {msg.content}
          {msg.streaming && <span style={styles.cursor} />}
        </span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '20px 24px',
    gap: 16,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' },
  subtitle: { fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 },
  headerStats: { display: 'flex', alignItems: 'center', gap: 12 },
  stat: { display: 'flex', alignItems: 'center', gap: 6 },
  statDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
  },
  statLabel: { fontSize: 12, color: 'var(--accent)', fontWeight: 600 },
  statPill: {
    background: 'var(--surface-panel)',
    border: '1px solid var(--border-glass)',
    borderRadius: 8,
    padding: '5px 12px',
  },
  layout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 16,
    overflow: 'hidden',
    minHeight: 0,
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface-panel)',
    border: '1px solid var(--border-glass)',
    borderRadius: 16,
    overflow: 'hidden',
    gap: 0,
  },
  tracePanel: {
    background: 'var(--surface-panel)',
    border: '1px solid var(--border-glass)',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  starters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 16,
    flexShrink: 0,
  },
  starterBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-glass)',
    borderRadius: 10,
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 12,
    color: 'var(--on-surface-variant)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  bubble: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'rgba(255,0,119,0.1)',
    border: '1px solid rgba(255,0,119,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubbleContent: {
    border: '1px solid',
    borderRadius: 14,
    padding: '10px 14px',
  },
  cursor: {
    display: 'inline-block',
    width: 2,
    height: 13,
    background: 'var(--primary)',
    borderRadius: 1,
    marginLeft: 3,
    verticalAlign: 'middle',
    animation: 'blink 1s step-end infinite',
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    padding: '12px 14px',
    borderTop: '1px solid var(--border-glass)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'var(--surface)',
    border: '1px solid var(--border-glass)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--on-surface)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'var(--primary)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 0 14px var(--primary-glow)',
  },
};
