import React, { useState, useEffect } from 'react';

export default function CartCheckout({ cart = [], onBack, onUpdateQuantity, onPlaceOrder, coupons = [] }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isEvDelivery, setIsEvDelivery] = useState(true);
  const [deliveryMode, setDeliveryMode] = useState('saver'); // 'saver' or 'normal'
  const [selectedPayment, setSelectedPayment] = useState('gpay');
  const [appliedCoupon, setAppliedCoupon] = useState('DIWALI50');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const packingCharges = cart.length > 0 ? 15 : 0;
  const gstCharges = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const deliveryFee = 0; // Free for platinum members
  
  // Calculations matching mockups
  let couponDiscount = 0;
  if (appliedCoupon === 'DIWALI50' && cartSubtotal > 0) {
    couponDiscount = Math.round(cartSubtotal * 0.5 * 100) / 100;
  }

  const grandTotal = Math.max(0, cartSubtotal + packingCharges + gstCharges + (isEvDelivery ? 2 : 0) - couponDiscount);

  const handleCheckoutSubmit = () => {
    onPlaceOrder({
      items: cart,
      subtotal: cartSubtotal,
      grandTotal: grandTotal,
      isEv: isEvDelivery,
      deliveryMode: deliveryMode,
      paymentMethod: selectedPayment,
      coupon: appliedCoupon
    });
  };

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (detailed_checkout_climate_selection) ─── */
    return (
      <div className="relative bg-[#040406] min-h-screen text-[#e5e1e6] select-none font-sans overflow-y-auto pb-28 w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#040406]/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-white/5">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <h1 className="ml-2 text-sm font-bold text-white uppercase tracking-wider">Cart Checkout</h1>
        </header>

        <main className="flex-1 px-4 py-6 flex flex-col gap-6">
          {/* Address Card */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <div className="mt-1">
              <span className="material-symbols-outlined text-[#FF0077]">location_on</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white">Delivering to Home</h3>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">Plot LP 60, Prasanti Vihar, Patia, Bhubaneswar</p>
            </div>
            <button className="text-[#FF0077] text-xs font-bold uppercase shrink-0">Change</button>
          </section>

          {/* Item List */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border border-[#00E676] rounded-sm flex items-center justify-center p-[2px]">
                    <div className="w-2 h-2 rounded-full bg-[#00E676]"></div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="font-mono text-[10px] text-gray-500">Rs {item.price}</p>
                  </div>
                </div>
                <div className="flex items-center bg-[#14141F] rounded-lg border border-white/5 h-8">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="w-8 h-full flex items-center justify-center text-[#FF0077]"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-mono text-xs px-2 text-white">{item.quantity || 1}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="w-8 h-full flex items-center justify-center text-[#FF0077]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">Your basket is empty</p>
            )}
          </section>

          {/* Delivery Mode Grid */}
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Delivery Mode</h2>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setDeliveryMode('saver')}
                className={`bg-[#0A0A0F] border rounded-xl p-4 flex flex-col relative overflow-hidden cursor-pointer transition-all ${
                  deliveryMode === 'saver' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
                }`}
              >
                <div className="absolute top-0 right-0 bg-[#FF0077]/20 text-[#FF0077] text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
                  EV Partner
                </div>
                <span className="material-symbols-outlined text-[#00E676] mb-2 text-[20px]">bolt</span>
                <h3 className="text-xs font-bold text-white mb-0.5">Time Saver</h3>
                <p className="font-mono text-[10px] text-gray-500">18 min ETA</p>
              </div>
              <div 
                onClick={() => setDeliveryMode('normal')}
                className={`bg-[#0A0A0F] border rounded-xl p-4 flex flex-col relative overflow-hidden cursor-pointer transition-all ${
                  deliveryMode === 'normal' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-gray-500 mb-2 text-[20px]">local_shipping</span>
                <h3 className="text-xs font-bold text-white mb-0.5">Normal</h3>
                <p className="font-mono text-[10px] text-gray-500">25 min ETA</p>
              </div>
            </div>
          </section>

          {/* Climate Toggle */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="material-symbols-outlined text-[#00E676] shrink-0">electrical_services</span>
              <p className="text-[10px] text-gray-400">Select Electric Delivery Partner to save the climate (EV delivery)</p>
            </div>
            <div 
              onClick={() => setIsEvDelivery(!isEvDelivery)}
              className={`w-10 h-6 rounded-full relative flex items-center px-1 cursor-pointer transition-all ${
                isEvDelivery ? 'bg-[#00E676]/30' : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full transition-transform ${
                isEvDelivery ? 'bg-[#00E676] translate-x-4' : 'bg-gray-500 translate-x-0'
              }`}></div>
            </div>
          </section>

          {/* Bill Details */}
          <section className="bg-[#0A0A0F] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Bill Details</h2>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Item Total</span>
              <span className="font-mono text-white">Rs {cartSubtotal}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Packing Charges</span>
              <span className="font-mono text-white">Rs {packingCharges}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">GST & Taxes</span>
              <span className="font-mono text-white">Rs {gstCharges}</span>
            </div>
            <div className="flex justify-between items-start text-xs my-0.5">
              <div className="flex flex-col">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="text-[9px] text-[#00E676] font-semibold mt-0.5">Free via Platinum Membership</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono text-gray-500 line-through">Rs 30.00</span>
                <span className="font-mono text-[#00E676]">-Rs 30.00</span>
              </div>
            </div>
            {isEvDelivery && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">EV Climate Contribution</span>
                <span className="font-mono text-[#00E676]">Rs 2.00</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-xs bg-[#00E676]/10 border border-dashed border-[#00E676]/20 p-2 rounded-lg">
                <span className="text-white font-semibold">Coupon (DIWALI50)</span>
                <span className="font-mono text-[#00E676]">-Rs {couponDiscount}</span>
              </div>
            )}
            <div className="h-[1px] w-full bg-white/5 my-1"></div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-white">Grand Total</span>
              <span className="text-[#FF0077]">Rs {grandTotal.toFixed(2)}</span>
            </div>
          </section>
        </main>

        {/* Bottom Payment Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#040406]/95 backdrop-blur-xl border-t border-white/5 z-50">
          <button 
            onClick={handleCheckoutSubmit}
            disabled={cart.length === 0}
            className="w-full bg-[#FF0077] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 transition-all"
          >
            <span>Proceed to Payments</span>
            <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-xs">Rs {grandTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (secure_payment_invoice_authentic_brand_logos) ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col px-8 py-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 rounded-full hover:bg-white/5 text-[#FF0077] transition-colors">
              <span className="material-symbols-outlined text-[28px]">arrow_back</span>
            </button>
            <h1 className="text-2xl font-extrabold text-[#FF0077] tracking-tighter">District</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#131316] rounded-full border border-white/5">
              <span className="material-symbols-outlined text-amber-400 text-sm">verified</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mt-24 max-w-[1440px] mx-auto px-8 grid grid-cols-12 gap-8 pb-24">
        {/* Left Column: Order Review */}
        <div className="col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#FF0077]">Review Your Order</h2>
            <span className="font-mono text-[#FF0077] text-xs bg-[#FF0077]/10 px-3 py-1 rounded-full border border-[#FF0077]/20">
              {cartTotalItems} Items
            </span>
          </div>

          {/* Cart Items Bento */}
          <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#131316] border border-white/10 shrink-0">
                    <img 
                      className="w-full h-full object-cover" 
                      alt={item.name}
                      src={item.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className="text-[10px] text-gray-500">{item.restaurantName}</span>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 text-[#FF0077] hover:bg-[#FF0077]/10"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs">{item.quantity || 1}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 text-[#FF0077] hover:bg-[#FF0077]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-sm text-[#FF0077] font-semibold">Rs {item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          {/* Invoice */}
          <div className="bg-[#0A0A0F] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#FF0077] text-sm">receipt_long</span>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bill Details</h3>
            </div>
            <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Item Total</span>
                <span className="font-mono text-white">Rs {cartSubtotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Priority Logistics Fee</span>
                <span className="font-mono text-white">Rs {packingCharges}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">District Platform Tax</span>
                <span className="font-mono text-white">Rs {gstCharges}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center text-xs text-[#00E676]">
                  <span>VIP Coupon Discount</span>
                  <span className="font-mono">- Rs {couponDiscount}</span>
                </div>
              )}
            </div>
            <div className="pt-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Total Payable</span>
                <span className="text-[9px] text-gray-500 italic">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl font-extrabold text-[#FF0077] font-mono">Rs {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Secure Payment Gateway */}
        <div className="col-span-5 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#FF0077]">Payment</h2>
          
          {/* Card Mockup */}
          <div className="w-full h-56 rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-white/10 metallic-card select-none">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">District Elite</span>
                <span className="text-xs font-extrabold text-white tracking-tighter">VIP PLATINUM</span>
              </div>
              <span className="material-symbols-outlined text-[#FF0077] text-[36px]">contactless</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xl text-white tracking-[3px] block">**** **** **** 8842</span>
              <div className="flex justify-between items-end text-[10px]">
                <div className="flex flex-col">
                  <span className="text-[7px] text-white/40 uppercase">Card Holder</span>
                  <span className="font-mono text-white/80">GAURAV NAYAK</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] text-white/40 uppercase">Expires</span>
                  <span className="font-mono text-white/80">12 / 28</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Payment Methods</h3>
            
            {/* Google Pay */}
            <div 
              onClick={() => setSelectedPayment('gpay')}
              className={`bg-[#0A0A0F] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedPayment === 'gpay' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img alt="Google Pay" className="w-full h-full object-contain" src="/buttons/Frame (9).svg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white font-sans">Google Pay</span>
                  <span className="text-[10px] text-gray-500 font-sans">Instant UPI Checkout</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'gpay' ? 'border-[#FF0077]' : 'border-white/20'}`}>
                {selectedPayment === 'gpay' && <div className="w-2 h-2 rounded-full bg-[#FF0077]"></div>}
              </div>
            </div>

            {/* PhonePe */}
            <div 
              onClick={() => setSelectedPayment('phonepe')}
              className={`bg-[#0A0A0F] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedPayment === 'phonepe' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img alt="PhonePe" className="w-full h-full object-contain" src="/buttons/Frame (12).svg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white font-sans">PhonePe</span>
                  <span className="text-[10px] text-gray-500 font-sans">Direct Bank Transfer</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'phonepe' ? 'border-[#FF0077]' : 'border-white/20'}`}>
                {selectedPayment === 'phonepe' && <div className="w-2 h-2 rounded-full bg-[#FF0077]"></div>}
              </div>
            </div>

            {/* Paytm Wallet */}
            <div 
              onClick={() => setSelectedPayment('paytm')}
              className={`bg-[#0A0A0F] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedPayment === 'paytm' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img alt="Paytm" className="w-full h-full object-contain" src="/buttons/Frame (13).svg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white font-sans">Paytm Wallet</span>
                  <span className="text-[10px] text-gray-500 font-sans">Fast Payment Authentication</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'paytm' ? 'border-[#FF0077]' : 'border-white/20'}`}>
                {selectedPayment === 'paytm' && <div className="w-2 h-2 rounded-full bg-[#FF0077]"></div>}
              </div>
            </div>

            {/* Credit/Debit Card */}
            <div 
              onClick={() => setSelectedPayment('card')}
              className={`bg-[#0A0A0F] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                selectedPayment === 'card' ? 'border-[#FF0077] bg-[#14141F]' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <img alt="Cards" className="w-full h-full object-contain" src="/buttons/Frame (10).svg" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white font-sans">Credit / Debit Card</span>
                  <span className="text-[10px] text-gray-500 font-sans">Visa, Mastercard, RuPay</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'card' ? 'border-[#FF0077]' : 'border-white/20'}`}>
                {selectedPayment === 'card' && <div className="w-2 h-2 rounded-full bg-[#FF0077]"></div>}
              </div>
            </div>
          </div>

          {/* Action Confirmation Button */}
          <div className="mt-4 flex flex-col gap-3">
            <button 
              onClick={handleCheckoutSubmit}
              disabled={cart.length === 0}
              className="w-full bg-[#FF0077] text-white py-3.5 rounded-full font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
            >
              <span>Pay Rs {grandTotal.toFixed(2)}</span>
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </button>
            <p className="text-center text-[10px] text-gray-500 leading-normal">
              By confirming this order, you agree to District's Terms of High-Velocity Commerce. Connection encrypted with 256-bit protection.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
