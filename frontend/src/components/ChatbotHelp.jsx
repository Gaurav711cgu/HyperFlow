import React, { useState } from 'react';

export default function ChatbotHelp({ onBack }) {
  const [foodRating, setFoodRating] = useState(4);
  const [courierRating, setCourierRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const issues = [
    'Missing Items',
    'Wrong Order Received',
    'Poor Food Quality',
    'Package Tampered',
    'Spillage Issues',
    'Delayed Delivery'
  ];

  const handleSubmit = () => {
    alert(`Feedback submitted! Food: ${foodRating} stars, Courier: ${courierRating} stars. Issue: ${selectedIssue || 'None'}`);
    if (onBack) onBack();
  };

  return (
    <div className="w-full min-h-screen bg-[#080808] text-[#e5e1e6] font-sans antialiased pb-20">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 h-16">
        <button 
          onClick={onBack}
          className="text-[#FF2D78] hover:opacity-80 transition-opacity flex items-center justify-center p-1 rounded-full hover:bg-white/5"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-bold text-base text-white tracking-tighter">Order Review</h1>
        <button 
          onClick={onBack}
          className="text-xs font-mono text-gray-500 hover:text-white px-3 py-1 border border-white/10 rounded-full transition-colors"
        >
          CLOSE
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 px-4 flex justify-center w-full">
        <div className="w-full max-w-[600px] bg-[#0C0C0C] border border-white/10 p-6 flex flex-col gap-6 rounded-2xl">
          {/* Order Status Header */}
          <section className="flex flex-col gap-2 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-[#00E676]">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white">Delivered: Order #HF-8821</h2>
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px]">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>TODAY, 19:42 PM</span>
            </div>
          </section>

          {/* Dual-Column Feedback Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/5 pb-6">
            {/* Food Rating */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white">How was the food?</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    onClick={() => setFoodRating(star)}
                    className={`material-symbols-outlined text-[28px] cursor-pointer hover:scale-110 transition-transform ${
                      star <= foodRating ? 'text-[#FF2D78] fill-current' : 'text-gray-600'
                    }`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>

            {/* Courier Rating */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">How was Courier?</h3>
                <span className="border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-gray-400">COURIER</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star}
                    onClick={() => setCourierRating(star)}
                    className={`material-symbols-outlined text-[28px] cursor-pointer hover:scale-110 transition-transform ${
                      star <= courierRating ? 'text-[#FF2D78] fill-current' : 'text-gray-600'
                    }`}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" htmlFor="feedback-note">Additional Details</label>
            <textarea 
              className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:border-[#FF2D78] focus:outline-none transition-colors resize-none" 
              id="feedback-note" 
              placeholder="Add a note... (e.g. The fries were slightly cold, but everything else was perfect.)" 
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </section>

          {/* Support Issues */}
          <section className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Need Help with this Order?</h3>
            <div className="grid grid-cols-2 gap-2">
              {issues.map(issue => (
                <button 
                  key={issue}
                  onClick={() => setSelectedIssue(selectedIssue === issue ? null : issue)}
                  className={`p-2.5 border rounded-xl text-left text-xs font-medium transition-all ${
                    selectedIssue === issue 
                      ? 'border-[#FF2D78] bg-[#FF2D78]/10 text-white' 
                      : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </section>

          {/* Submit */}
          <section className="pt-4 border-t border-white/5">
            <button 
              onClick={handleSubmit}
              className="w-full bg-[#FF2D78] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Submit Feedback
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
