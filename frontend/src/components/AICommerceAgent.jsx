import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const AICommerceAgent = () => {
    const [messages, setMessages] = useState([
        { role: 'agent', text: 'How can I assist your logistics operations today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTools, setActiveTools] = useState([]);
    const [checkoutStatus, setCheckoutStatus] = useState(null); // { status: 'processing' | 'success', orderId?: string }
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, checkoutStatus]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        
        const userMessage = { role: 'user', text: inputText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);
        setActiveTools([]);

        try {
            // Construct history for API (only user/model roles, mapping 'agent' to 'model')
            const history = messages.map(msg => ({
                role: msg.role === 'agent' ? 'model' : 'user',
                text: msg.text
            }));

            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: history
                })
            });

            if (!response.ok) throw new Error('Chat API failed');

            const data = await response.json();
            
            if (data.tools && data.tools.length > 0) {
                setActiveTools(data.tools);
            }

            const agentMessage = { 
                role: 'agent', 
                text: data.reply,
                hasCheckout: data.reply.toLowerCase().includes('order') || data.reply.toLowerCase().includes('checkout') || data.reply.toLowerCase().includes('book') || data.reply.toLowerCase().includes('restaurant')
            };
            setMessages(prev => [...prev, agentMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'agent', text: 'Connection to District Intelligence failed.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCheckout = async () => {
        setCheckoutStatus({ status: 'processing' });
        try {
            const token = localStorage.getItem('demo_token');
            const response = await fetch('/api/v1/orders/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: [{ product_id: "prd_101", quantity: 1, price: 50.0 }],
                    total_amount: 50.0
                })
            });

            if (!response.ok) throw new Error('Checkout failed');

            const data = await response.json();
            setCheckoutStatus({ status: 'success', orderId: data.transaction_id });
            setMessages(prev => [...prev, { role: 'agent', text: `Transaction complete. Order ID: ${data.transaction_id}. Logistics route verified.` }]);
        } catch (error) {
            console.error('Checkout error:', error);
            setCheckoutStatus({ status: 'error' });
            setMessages(prev => [...prev, { role: 'agent', text: `Transaction failed. Error verifying inventory.` }]);
        }
    };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-margin-mobile pt-sm pb-md bg-surface-panel/80 backdrop-blur-xl border-b border-border-glass">
        <div className="flex items-center justify-between w-full h-12">
          <div className="flex items-center gap-md">
            <span className="text-hero-display font-hero-display font-bold text-primary tracking-tighter">District</span>
            <div className="hidden md:flex gap-md px-lg border-l border-border-glass">
              <span className="text-primary font-bold transition-opacity hover:opacity-80 cursor-pointer">AI Agent</span>
              <span className="text-on-surface-variant font-body-default transition-opacity hover:opacity-80 cursor-pointer">Delivery</span>
              <span className="text-on-surface-variant font-body-default transition-opacity hover:opacity-80 cursor-pointer">Groceries</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="flex items-center gap-xs text-primary bg-primary/10 px-md py-xs rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-label-small font-label-small">Downtown Hub</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border-glass">
              <img className="w-full h-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2tO3fncNv4404QJYfcR4maXfhawZqSQgoXfQ5O8B54qj9eJsItCXkM1VpHC_LJ-ZCtdz4hiDtBENK72IykdxC27Dkym1yh8gV18d3xy-yUVoUzw94tObL0wpmlmDo5UwH3zVfGgtFgcahfIgIiCkTt9PZMadV1wHhff0S7D-XCfaeFdFEAsxT-oCm9sKs587BI069qB0mc8Hpp7-eGRoEvwhTyaWcjf4Zi84T59pR5FeL6oZ_OLxVi-nfQWP95zOs7rQjJZ-pRvvF"/>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 pt-[68px] overflow-hidden">
        {/* Left Pane: History & MCP Tools */}
        <aside className="w-[320px] glass-panel hidden md:flex flex-col h-full border-r border-border-glass">
          <div className="p-lg border-b border-border-glass">
            <h2 className="text-section-header font-section-header text-on-surface uppercase tracking-widest flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">history</span>
              System Logs
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-md space-y-md">
            {/* Tool Active State */}
            {activeTools.map((tool, idx) => (
                <div key={idx} className="p-md rounded-xl bg-surface-elevated border border-primary/20 neon-glow-pink">
                    <div className="flex justify-between items-start mb-sm">
                        <span className="text-metric-mono font-metric-mono text-primary">MCP-V1.4.2</span>
                        <span className="text-[8px] px-sm py-[1px] rounded bg-primary text-on-primary font-bold">ACTIVE</span>
                    </div>
                    <p className="text-body-medium font-body-medium text-on-surface">Tool: {tool}</p>
                    <div className="mt-md space-y-xs">
                        <div className="flex justify-between text-label-small font-label-small text-on-surface-variant">
                            <span>Latency</span>
                            <span className="text-tertiary">12ms</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-tertiary w-3/4"></div>
                        </div>
                    </div>
                </div>
            ))}
            
            {activeTools.length === 0 && (
                <div className="text-center text-on-surface-variant p-md">
                    No active MCP tools
                </div>
            )}
          </div>
          {/* System Metrics Footer */}
          <div className="p-lg bg-surface-container-low border-t border-border-glass">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <span className="block text-label-small font-label-small text-on-surface-variant mb-[2px]">Credits</span>
                <span className="text-metric-mono font-metric-mono text-primary">12,450.00</span>
              </div>
              <div>
                <span className="block text-label-small font-label-small text-on-surface-variant mb-[2px]">Tier</span>
                <span className="text-metric-mono font-metric-mono text-tertiary">PLATINUM</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Pane: Chat Window */}
        <section className="flex-1 flex flex-col relative bg-[#040406]">
          {/* Subtle atmospheric background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"></div>

          {/* Chat Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-xl space-y-xl relative z-10">
            {/* Agent Welcome */}
            <div className="flex flex-col items-center justify-center py-xl space-y-md">
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center shimmer-effect border-primary/30">
                <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: '\'FILL\' 1'}}>smart_toy</span>
              </div>
              <div className="text-center">
                <h1 className="text-hero-display font-hero-display text-on-surface">District Intelligence</h1>
                <p className="text-body-medium font-body-medium text-on-surface-variant max-w-sm">Powered by Gemini 2.0 & Swiggy MCP</p>
              </div>
            </div>

            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] border p-lg relative ${
                        msg.role === 'user' 
                            ? 'bg-surface-elevated border-border-glass rounded-2xl rounded-tr-none' 
                            : 'bg-surface-panel border-primary/10 rounded-2xl rounded-tl-none'
                    }`}>
                        {msg.role === 'agent' && (
                            <div className="flex items-center gap-sm mb-md">
                                <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
                                <span className="text-label-small font-label-small text-primary uppercase tracking-tighter">System Output</span>
                            </div>
                        )}
                        <p className="text-body-default font-body-default text-on-surface whitespace-pre-wrap">
                            {msg.text}
                        </p>
                        
                        {msg.hasCheckout && checkoutStatus?.status !== 'success' && (
                             <div className="mt-lg flex gap-md">
                                <button 
                                    onClick={handleCheckout}
                                    disabled={checkoutStatus?.status === 'processing'}
                                    className={`px-lg py-sm rounded-full font-bold text-body-medium shimmer-effect ${
                                        checkoutStatus?.status === 'processing' 
                                        ? 'bg-surface-elevated text-on-surface-variant' 
                                        : 'bg-primary text-on-primary neon-glow-pink'
                                    }`}>
                                    {checkoutStatus?.status === 'processing' ? 'Processing...' : 'Authorize Transaction'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {loading && (
                <div className="flex justify-start">
                    <div className="max-w-[85%] bg-surface-panel border border-primary/10 rounded-2xl rounded-tl-none p-lg relative flex items-center gap-2">
                        <span className="text-label-small font-label-small text-primary uppercase tracking-tighter">Processing</span>
                        <div className="flex gap-1">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                        </div>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} className="h-32"></div>
          </div>

          {/* Input Dock */}
          <div className="absolute bottom-0 left-0 w-full p-xl pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="glass-panel p-md rounded-2xl flex items-center gap-md shadow-2xl border-primary/10 bg-surface-panel/95 backdrop-blur-2xl">
                <div className="flex-1">
                  <textarea 
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-body-default text-on-surface placeholder-on-surface-variant/40 resize-none h-[24px]" 
                    placeholder="Message District Intelligence..." 
                    rows="1"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  ></textarea>
                </div>
                <div className="flex items-center gap-sm">
                  <button 
                    onClick={handleSend}
                    disabled={loading || !inputText.trim()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-transform duration-200 ${
                        loading || !inputText.trim() ? 'bg-surface-elevated text-on-surface-variant' : 'bg-primary text-on-primary hover:scale-105'
                    }`}>
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
              <div className="mt-sm flex justify-center gap-md">
                <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  System Online
                </span>
                <span className="text-[10px] text-on-surface-variant/60">MCP 1.4.2 Connected</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default AICommerceAgent;

