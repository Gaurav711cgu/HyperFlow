import React, { useState, useEffect } from 'react';
import * as API from '../api.js';

export default function DineoutSniperView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('sniper'); // 'sniper' or 'grid'

  useEffect(() => {
    API.fetchDineoutSniper().then((res) => {
      if (res && res.venues) setData(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-6 md:p-12 font-sans selection:bg-[#FF3366]">
      
      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">MODULE 4 • DINEOUT SLOT SNIPER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Dineout Slot Sniper <span className="italic font-serif text-amber-400">Scored.</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Industry Differentiation Showcase Card */}
      <div className="max-w-6xl mx-auto mb-8 bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">WHY HYPERFLOW VS INDUSTRY BASELINE</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DYNAMIC SLOT PRESSURE SCORING
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Dynamic Slot Pressure Velocity vs Static Booking Grids</h3>
            <p className="text-xs text-white/60 font-light max-w-2xl mt-1">
              Standard booking apps show unranked, static availability grids. HyperFlow evaluates real-time dining velocity (rating, peak hours, weekend factors) to score slot pressure and estimate exact fill time in minutes.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.05] p-1.5 rounded-full border border-white/10 shrink-0">
            <button
              onClick={() => setMode('sniper')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'sniper'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              HyperFlow Slot Sniper
            </button>
            <button
              onClick={() => setMode('grid')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'grid'
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Standard Static Grid
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="py-20 text-center text-white/50 font-mono">Fetching Dineout slot predictions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data?.venues || []).map((venue, i) => (
              <div key={i} className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-serif font-bold text-white">{venue.venue_name}</h3>
                    <span className="text-xs font-mono text-amber-400 font-bold">★ {venue.rating}</span>
                  </div>
                  <p className="text-xs text-white/50 font-light">{venue.cuisine}</p>

                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <span className="text-xs text-white/40 uppercase font-mono">
                      {mode === 'sniper' ? 'SNIPED SLOT VELOCITY:' : 'STATIC AVAILABLE TIMES:'}
                    </span>
                    {venue.slots?.map((s, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-white font-mono">{s.time_slot}</span>
                        {mode === 'sniper' ? (
                          <div className="text-right">
                            <p className="text-amber-400 font-mono font-bold">Fills in ~{s.estimated_minutes_to_full}m</p>
                            <span className="text-[10px] text-white/40 uppercase">Demand: {s.demand_score}</span>
                          </div>
                        ) : (
                          <span className="text-white/50 font-mono">Available</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Slot booked at ${venue.venue_name}!`)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-bold rounded-full text-xs transition-all cursor-pointer mt-4"
                >
                  Snipe Slot Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
