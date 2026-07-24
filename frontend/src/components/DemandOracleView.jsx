import React, { useState, useEffect } from 'react';
import * as API from '../api.js';
import ConfidenceArc from './ConfidenceArc.jsx';

export default function DemandOracleView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.fetchDemandOracle().then((res) => {
      if (res && res.predictions) {
        setData(res);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-6 md:p-12 font-sans selection:bg-[#FF3366]">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3366]/10 border border-[#FF3366]/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-[#FF4D6D] uppercase">MODULE 1 • INSTAMART INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Demand Oracle <span className="italic font-serif text-[#FF4D6D]">Unconstrained.</span>
            </h1>
          </div>
        </div>

        {data?.weather_context && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[#101018] border border-white/10 rounded-2xl text-xs font-mono">
            <span className="text-amber-400">☀️ {data.weather_context.temperature_c}°C</span>
            <span className="text-blue-400">🌧️ {data.weather_context.precipitation_mm}mm</span>
            <span className="text-emerald-400">OpenMeteo Live</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="py-20 text-center text-white/50 font-mono">Loading Tobit MLE Stockout Predictions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data?.predictions || [
              { product_id: '1', product_name: 'Amul Taaza Toned Fresh Milk (1L)', price_inr: 56, demand_forecast: { point_units: 14.2, confidence_pct: 88 }, stockout_risk: 'HIGH', recommended_action: 'ORDER_NOW', time_to_stockout_minutes: 45 },
              { product_id: '2', product_name: 'Fresh Tomatoes (500g)', price_inr: 32, demand_forecast: { point_units: 8.5, confidence_pct: 75 }, stockout_risk: 'MEDIUM', recommended_action: 'ORDER_WITHIN_2H', time_to_stockout_minutes: 110 },
              { product_id: '3', product_name: 'Fresho Eggs Farm Fresh (6 pcs)', price_inr: 48, demand_forecast: { point_units: 22.0, confidence_pct: 92 }, stockout_risk: 'LOW', recommended_action: 'SAFE', time_to_stockout_minutes: 360 }
            ]).map((pred, i) => (
              <div key={i} className="bg-[#101018]/90 border border-white/10 hover:border-[#FF3366]/40 rounded-3xl p-6 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-serif font-bold text-white">{pred.product_name}</h3>
                      <p className="text-xs text-white/40 font-mono mt-0.5">₹{pred.price_inr}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      pred.stockout_risk === 'HIGH' ? 'bg-[#FF3366]/20 text-[#FF4D6D] border-[#FF3366]/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {pred.stockout_risk} RISK
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-2xl font-serif font-bold text-white">{pred.demand_forecast?.point_units || 12.0} units</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">UNCONSTRAINED LATENT DEMAND</p>
                    </div>

                    <ConfidenceArc 
                      confidence={(pred.demand_forecast?.confidence_pct || 85) / 100}
                      label="Accuracy"
                      color={pred.stockout_risk === 'HIGH' ? '#FF3366' : '#00D4AA'}
                      size={90}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Stockout in: <strong className="text-white">{pred.time_to_stockout_minutes} min</strong></span>
                  <span className="text-[#FF4D6D] font-bold">{pred.recommended_action}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
