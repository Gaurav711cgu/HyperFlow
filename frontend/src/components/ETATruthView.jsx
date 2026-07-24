import React, { useState, useEffect } from 'react';
import * as API from '../api.js';
import ConfidenceArc from './ConfidenceArc.jsx';

export default function ETATruthView({ onBack }) {
  const [feed, setFeed] = useState({
    raw_eta_min: 28,
    smoothed_eta_min: 26,
    is_jitter: true,
    confidence_score: 0.94,
    explanation: "Transient GPS velocity noise suppressed by learned RF smoother"
  });

  useEffect(() => {
    const ws = API.connectETALive('demo_order_1024', (data) => {
      if (data) setFeed(data);
    });
    return () => {
      try { ws.close(); } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-6 md:p-12 font-sans selection:bg-[#FF3366]">
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-[#00D4AA] uppercase">MODULE 2 • LIVE WEBSOCKET FEED</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              ETA Truth Detector <span className="italic font-serif text-[#00D4AA]">Smoothed.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono text-white/40 uppercase">ACTIVE ORDER TRACKING</span>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">Order #1024 — Dum Gosht Biryani</h3>
              <p className="text-xs text-white/60 font-light mt-1">Patia Warehouse ➔ Prasanti Vihar Segment</p>
            </div>

            <ConfidenceArc 
              confidence={feed.confidence_score || 0.94}
              label="Smoother Confidence"
              color="#00D4AA"
              size={110}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <span className="text-xs text-white/40 uppercase font-mono">RAW MIMO DISPLAY ETA</span>
              <p className="text-4xl font-serif font-bold text-red-400 mt-2">{feed.raw_eta_min} min</p>
              <p className="text-xs text-white/50 font-light mt-1">Contains un-gated GPS telemetry fluctuations</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
              <span className="text-xs text-emerald-400 uppercase font-mono font-bold">SMOOTHED ETA (LEARNED RF GATE)</span>
              <p className="text-4xl font-serif font-bold text-emerald-300 mt-2">{feed.smoothed_eta_min} min</p>
              <p className="text-xs text-emerald-400/80 font-light mt-1">Velocity-normalized display window</p>
            </div>
          </div>

          <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-white/60">CLASSIFIER DIAGNOSTIC:</span>
            <span className="text-[#00D4AA] font-bold">{feed.explanation}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
