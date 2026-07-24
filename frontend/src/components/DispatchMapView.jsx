import React, { useState, useEffect } from 'react';
import * as API from '../api.js';

export default function DispatchMapView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.analyzeDispatch().then((res) => {
      if (res) setData(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-6 md:p-12 font-sans selection:bg-[#FF3366]">
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-[#00D4FF] uppercase">MODULE 5 • ROUTE BATCH OPTIMIZER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Dispatch Intelligence <span className="italic font-serif text-[#00D4FF]">Optimized.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
              <span className="text-xs text-white/40 uppercase font-mono">TOTAL ORDERS</span>
              <p className="text-3xl font-serif font-bold text-white mt-1">{data?.total_deliveries || 5} orders</p>
            </div>

            <div className="p-5 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-2xl">
              <span className="text-xs text-[#00D4FF] uppercase font-mono font-bold">OPTIMIZED BATCHES</span>
              <p className="text-3xl font-serif font-bold text-[#00D4FF] mt-1">{data?.optimized_batches_count || 2} routes</p>
            </div>

            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <span className="text-xs text-emerald-400 uppercase font-mono font-bold">ESTIMATED TIME SAVED</span>
              <p className="text-3xl font-serif font-bold text-emerald-300 mt-1">~{data?.estimated_time_saved_min || 14} min</p>
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl font-mono text-xs space-y-3">
            <p className="text-white/60 font-bold uppercase tracking-wider">HUB ORIGIN: Patia Warehouse [20.3533, 85.8333]</p>
            <div className="space-y-2 text-white/80">
              <div className="p-3 bg-white/[0.03] rounded-xl flex justify-between">
                <span>Route Batch 1: Patia Hub ➔ Prasanti Vihar (20.3562, 85.8315) ➔ Lp 60 (20.3585, 85.8288)</span>
                <span className="text-[#00D4FF] font-bold">SLA: 18m</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl flex justify-between">
                <span>Route Batch 2: Patia Hub ➔ KIIT Campus 3 (20.3540, 85.8360) ➔ Damana (20.3510, 85.8380)</span>
                <span className="text-[#00D4FF] font-bold">SLA: 22m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
