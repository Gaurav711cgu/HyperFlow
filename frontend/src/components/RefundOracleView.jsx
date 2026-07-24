import React, { useState } from 'react';
import * as API from '../api.js';
import ConfidenceArc from './ConfidenceArc.jsx';

export default function RefundOracleView({ onBack }) {
  const [complaintType, setComplaintType] = useState('Cold Food');
  const [complaintText, setComplaintText] = useState('Mutton Biryani was cold on arrival.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await API.predictRefund({
      order_id: 'ORD-8374',
      complaint_type: complaintType,
      complaint_text: complaintText,
      item_name: 'Dum Gosht Biryani',
      item_price: 349.0
    });
    if (res) setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-6 md:p-12 font-sans selection:bg-[#FF3366]">
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/[0.05] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/30 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#6C63FF] animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-[#6C63FF] uppercase">MODULE 3 • FRAUDGUARD TRIAGE</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Refund Oracle <span className="italic font-serif text-[#6C63FF]">Predicted.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Input Form */}
        <form onSubmit={handleEvaluate} className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl space-y-5">
          <h3 className="text-lg font-serif font-bold text-white">Evaluate Refund Claim</h3>
          
          <div>
            <label className="block text-xs font-mono text-white/50 uppercase mb-1">Issue Category</label>
            <select 
              value={complaintType} 
              onChange={(e) => setComplaintType(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#6C63FF]"
            >
              <option value="Cold Food">Cold Food / Temperature Drift</option>
              <option value="Missing Item">Missing Item in Order</option>
              <option value="Spilled Container">Damaged / Spilled Packaging</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/50 uppercase mb-1">Customer Description</label>
            <textarea 
              rows={4}
              value={complaintText} 
              onChange={(e) => setComplaintText(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl p-4 text-sm text-white outline-none focus:border-[#6C63FF]"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#6C63FF] to-[#8A82FF] hover:opacity-90 text-white rounded-full font-bold text-sm shadow-xl transition-all cursor-pointer"
          >
            {loading ? 'Evaluating FraudGuard...' : 'Predict Outcome'}
          </button>
        </form>

        {/* Output Outcome Card */}
        <div className="bg-[#101018]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-2xl flex flex-col justify-between space-y-6">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-white/40 uppercase">PREDICTED TRIAGE OUTCOME</span>
                  <h2 className="text-2xl font-serif font-bold text-white mt-1">{result.predicted_outcome}</h2>
                </div>

                <ConfidenceArc 
                  confidence={result.confidence_score || 0.92}
                  label="Triage Confidence"
                  color="#6C63FF"
                  size={100}
                />
              </div>

              <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Fraud Risk Score:</span>
                  <span className="font-mono font-bold text-[#6C63FF]">{result.fraud_probability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Action Recommendation:</span>
                  <span className="font-mono font-bold text-emerald-400">{result.recommendation}</span>
                </div>
              </div>

              <p className="text-xs text-white/60 font-light italic bg-white/[0.02] p-4 rounded-xl border border-white/5">
                "{result.explanation}"
              </p>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-white/40 text-sm font-mono p-12">
              Submit a refund claim text on the left to trigger FraudGuard semantic triage predictions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
