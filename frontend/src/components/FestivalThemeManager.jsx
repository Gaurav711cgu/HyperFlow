import React, { useState } from 'react';
import * as API from '../api';

export default function FestivalThemeManager({ activeTheme, onThemeChange, onBack }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const themes = [
    { id: 'default', name: 'Default Obsidian', primary: '#6C63FF', accent: '#00D4AA', desc: 'Core dark brand theme with electric violet gradients.' },
    { id: 'diwali', name: 'Diwali Spark', primary: '#FFB300', accent: '#FF0077', desc: 'Golden marigold glow with festive pink and yellow highlights.' },
    { id: 'holi', name: 'Holi Splash', primary: '#FF0077', accent: '#8F00FF', desc: 'Vibrant organic pigments, neon pink and purple overlays.' },
    { id: 'monsoon', name: 'Monsoon Jitter', primary: '#3B82F6', accent: '#00E676', desc: 'Deep storm blue tiles with emerald safe-dispatch routing.' }
  ];

  const handleSelectTheme = async (themeId) => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await API.updateFestivalSettings(themeId);
      if (res) {
        onThemeChange(themeId);
        setSuccessMsg(`Active festival settings updated to ${themeId.toUpperCase()}`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert("Failed to update festival theme: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#e5e1e6] font-sans antialiased pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-[#6C63FF] hover:opacity-80 transition-opacity flex items-center justify-center p-1 rounded-full hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-bold text-base text-white tracking-tighter">Festival Theme Manager</h1>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="text-xs font-mono text-gray-500 hover:text-white px-3 py-1 border border-white/10 rounded-full transition-colors"
          >
            CLOSE
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[800px] mx-auto mt-24 px-4 flex flex-col gap-8">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-white">HyperFlow Theme Orchestrator</h2>
          <p className="text-xs text-gray-400">Change CSS color variables across all user surfaces, riders, and maps in real time.</p>
        </section>

        {successMsg && (
          <div className="bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] px-4 py-3 rounded-xl text-xs font-mono animate-fade-in flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] animate-pulse">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Themes Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map(t => (
            <div 
              key={t.id} 
              onClick={() => !loading && handleSelectTheme(t.id)}
              className={`bg-[#0C0C0C] border p-6 flex flex-col gap-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden group ${
                activeTheme === t.id ? 'border-[#6C63FF] bg-[#6C63FF]/5' : 'border-white/5'
              }`}
            >
              {activeTheme === t.id && (
                <div className="absolute top-0 right-0 bg-[#6C63FF] text-black text-[9px] font-bold px-3 py-0.5 rounded-bl-lg font-mono">
                  ACTIVE
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-bold text-white">{t.name}</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t.desc}</p>
              </div>

              {/* Theme Color Indicator Strip */}
              <div className="flex gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-mono">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }}></span>
                  Primary
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-mono">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accent }}></span>
                  Accent
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
