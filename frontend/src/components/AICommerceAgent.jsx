import React, { useState, useEffect, useRef } from 'react';

export default function AICommerceAgent({ onBack, onSendMessage, messages = [] }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [inputValue, setInputValue] = useState('');
  const feedEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  // Default mock messages if none provided
  const chatMessages = messages.length > 0 ? messages : [
    {
      sender: 'user',
      text: 'Show me high-protein meals near Patia'
    },
    {
      sender: 'agent',
      text: 'Found 2 meals near Patia matching high protein goals:',
      toolCall: 'Called tool: search_restaurants (Params: Patia)',
      meals: [
        { name: 'Dum Gosht Biryani', protein: '36g Protein', price: 'Rs 349', icon: 'rice_bowl' },
        { name: 'Butter Chicken', protein: '28g Protein', price: 'Rs 280', icon: 'eco' }
      ]
    }
  ];

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (ai_commerce_agent) ─── */
    return (
      <div className="relative bg-[#040406] min-h-screen text-[#e5e1e6] select-none font-sans overflow-hidden flex flex-col w-full pb-[80px]">
        {/* Header */}
        <header className="bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3 flex flex-col shrink-0">
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="p-1 -ml-1 text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <h1 className="text-sm font-bold text-[#FF0077] tracking-wider uppercase">District AI</h1>
            </div>
            <span className="material-symbols-outlined text-gray-500 cursor-pointer text-[20px]">more_vert</span>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8F00FF]/50 bg-[#0A0A0F] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8F00FF] text-[24px]">smart_toy</span>
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00E676] rounded-full border-2 border-[#0A0A0F]"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white leading-tight">Multi-Agent System Online</span>
              <span className="text-[9px] text-gray-500 truncate">Food, Instamart, Dineout Agents active</span>
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-none">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'user' ? (
                  <div className="max-w-[85%] bg-[#8F00FF]/15 border border-[#8F00FF]/30 rounded-2xl rounded-tr-sm p-3.5 shadow-lg">
                    <p className="text-xs font-medium text-white leading-relaxed">{msg.text}</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/5 bg-white/5 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#8F00FF] text-[14px]">smart_toy</span>
                    </div>
                    <div className="bg-[#0A0A0F]/70 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 shadow-lg">
                      <p className="text-xs font-medium text-white leading-relaxed mb-3">{msg.text}</p>
                      
                      {msg.meals && (
                        <div className="flex flex-col gap-2 mb-3">
                          {msg.meals.map((meal, mIdx) => (
                            <div key={mIdx} className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400 text-[18px]">{meal.icon}</span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">{meal.name}</span>
                                  <span className="text-[9px] font-mono text-[#00E676]">{meal.protein}</span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#FF0077]">{meal.price}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] text-gray-500">I can add either to your cart directly using Swiggy Food MCP.</p>
                    </div>
                  </div>
                )}
              </div>

              {msg.toolCall && (
                <div className="ml-8 flex items-center">
                  <div className="bg-white/5 rounded-full px-3 py-1 border border-white/5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[12px] text-[#00E676]">check_circle</span>
                    <span className="font-mono text-[9px] text-gray-400 leading-none">{msg.toolCall}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={feedEndRef} />
        </main>

        {/* Input Area */}
        <footer className="bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 p-4 fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2">
          <form onSubmit={handleSend} className="flex-1 bg-white/5 rounded-full border border-white/10 h-12 flex items-center px-4 gap-2 focus-within:border-[#FF0077] transition-all">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">mic</span>
            <input 
              className="bg-transparent border-none text-xs text-white w-full focus:ring-0 placeholder:text-gray-600 outline-none" 
              placeholder="Ask food agent anything..." 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </form>
          <button 
            onClick={handleSend}
            className="w-12 h-12 bg-[#FF0077] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-white font-bold text-[20px]">send</span>
          </button>
        </footer>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (ai_commerce_agent_desktop) ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 py-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 rounded-full hover:bg-white/5 text-[#FF0077] transition-colors">
              <span className="material-symbols-outlined text-[28px]">arrow_back</span>
            </button>
            <h1 className="text-2xl font-extrabold text-[#FF0077] tracking-tighter">District AI</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#131316] rounded-full border border-white/5">
              <span className="material-symbols-outlined text-[#00E676] text-sm">verified</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Agent Command</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 min-h-screen max-w-[1440px] mx-auto px-8 pb-8">
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-100px)]">
          {/* Chat Feed Panel */}
          <div className="col-span-8 bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex flex-col shadow-2xl h-full relative overflow-hidden">
            <div className="flex-1 overflow-y-auto mb-16 pr-2 flex flex-col gap-6 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'user' ? (
                      <div className="max-w-[70%] bg-[#8F00FF]/15 border border-[#8F00FF]/30 rounded-2xl rounded-tr-sm p-4 shadow-md">
                        <p className="text-xs text-white leading-relaxed">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="flex items-end gap-3 max-w-[70%]">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/5 bg-white/5 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#8F00FF]">smart_toy</span>
                        </div>
                        <div className="bg-[#131316] border border-white/5 rounded-2xl rounded-tl-sm p-4 shadow-md w-full">
                          <p className="text-xs text-white leading-relaxed mb-4">{msg.text}</p>
                          
                          {msg.meals && (
                            <div className="flex flex-col gap-2 mb-4">
                              {msg.meals.map((meal, mIdx) => (
                                <div key={mIdx} className="bg-[#0A0A0F] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-500">{meal.icon}</span>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-white">{meal.name}</span>
                                      <span className="text-[9px] font-mono text-[#00E676]">{meal.protein}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-[#FF0077]">{meal.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-gray-500">Execution powered by LangGraph Food Agent.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.toolCall && (
                    <div className="ml-12 flex items-center">
                      <div className="bg-white/5 rounded-full px-3 py-1 border border-white/5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-[#00E676]">check_circle</span>
                        <span className="font-mono text-[9px] text-gray-400">{msg.toolCall}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={feedEndRef} />
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-3">
              <form onSubmit={handleSend} className="flex-1 bg-[#131316] rounded-full border border-white/10 h-12 flex items-center px-4 gap-2 focus-within:border-[#FF0077] transition-all">
                <input 
                  className="bg-transparent border-none text-xs text-white w-full focus:ring-0 placeholder:text-gray-600 outline-none" 
                  placeholder="Ask food agent anything..." 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </form>
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-[#FF0077] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-white text-[20px]">send</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Multi-Agent Process Monitor */}
          <div className="col-span-4 bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl h-full overflow-y-auto">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Multi-Agent Diagnostics</h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[10px] font-mono text-[#8F00FF] block mb-1">LANGGRAPH_COORDINATOR</span>
                <p className="text-xs text-white">Food app route matching success. Triaging target queries to Food MCP toolsets.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[10px] font-mono text-[#FF0077] block mb-1">FOOD_AGENT_STATE</span>
                <div className="text-[10px] font-mono text-gray-400 space-y-1">
                  <div>- query: "high-protein"</div>
                  <div>- location: "Patia, Bhubaneswar"</div>
                  <div>- schema_check: PASSED</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <span className="text-[10px] font-mono text-[#00E676] block mb-1">LIVE_TELEMETRY</span>
                <p className="text-xs text-white">Active session outbox queues: 0. Latency threshold stable.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
