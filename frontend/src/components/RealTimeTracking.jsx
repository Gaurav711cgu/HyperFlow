import React, { useState, useEffect, useRef } from 'react';

function LeafletMap({ center, routePoints, riderPos, theme = 'dark', zoom = 14 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    
    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(center, zoom);

    mapInstanceRef.current = map;

    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    window.L.tileLayer(darkTiles, {
      maxZoom: 19
    }).addTo(map);

    // Draw route if points exist
    if (routePoints && routePoints.length > 0) {
      routeLayerRef.current = window.L.polyline(routePoints, {
        color: '#FF0077', 
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95
      }).addTo(map);
    }

    // Add Destination Marker (Customer Home)
    const destPos = routePoints && routePoints.length > 0 ? routePoints[routePoints.length - 1] : center;
    destinationMarkerRef.current = window.L.circleMarker(destPos, {
      radius: 8,
      fillColor: '#00E676',
      color: '#131316',
      weight: 2,
      fillOpacity: 1
    }).addTo(map);

    // Add Rider Marker
    const riderIcon = window.L.divIcon({
      html: `<div class="w-7 h-7 bg-[#FF0077] rounded-full flex items-center justify-center border border-white/20 shadow-lg animate-pulse">
               <span class="material-symbols-outlined text-white text-[16px]">two_wheeler</span>
             </div>`,
      className: 'custom-div-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    riderMarkerRef.current = window.L.marker(riderPos || center, { icon: riderIcon }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Center
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update Rider Marker Location
  useEffect(() => {
    if (riderMarkerRef.current && riderPos) {
      riderMarkerRef.current.setLatLng(riderPos);
    }
  }, [riderPos]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px]" />;
}

export default function RealTimeTracking({ 
  riderPos = [20.3001, 85.8302], 
  routePoints = [[20.2980, 85.8280], [20.2990, 85.8290], [20.3001, 85.8302]], 
  onBack, 
  orderStatus = 'Rider is picking up food', 
  etaMinutes = 14, 
  onChatClick 
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressPercent = orderStatus.includes('Arrived') ? 100 : orderStatus.includes('delivering') ? 70 : 33;

  if (isMobile) {
    /* ─── MOBILE VIEW LAYOUT (real_time_tracking_premium_map_upgrades) ─── */
    return (
      <div className="relative bg-[#131316] min-h-screen text-[#e5e1e6] select-none font-sans overflow-hidden w-full">
        {/* Back navigation */}
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#0A0A0F]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </div>

        {/* Map Canvas */}
        <div className="absolute inset-0 z-0">
          <LeafletMap center={riderPos} routePoints={routePoints} riderPos={riderPos} />
        </div>

        {/* Weather Alerts Banner */}
        <div className="absolute top-16 left-4 right-4 z-40">
          <div className="bg-[#FF3366]/10 border border-[#FF3366]/30 backdrop-blur-md rounded-xl p-3 flex items-start gap-3 shadow-lg">
            <span className="material-symbols-outlined text-[#FF3366] text-[20px] animate-pulse">warning</span>
            <div>
              <h3 className="text-xs font-bold text-white leading-none">Monsoon Storm Surge active</h3>
              <p className="text-[9px] text-gray-400 mt-1">Expect delivery delays of up to 10 min.</p>
            </div>
          </div>
        </div>

        {/* Floating Chat Button */}
        <button 
          onClick={onChatClick}
          className="absolute bottom-64 right-4 w-12 h-12 bg-[#0A0A0F] border border-[#8F00FF] rounded-full flex items-center justify-center shadow-2xl hover:bg-white/5 transition-all z-40 shadow-[0_0_15px_rgba(143,3,255,0.4)]"
        >
          <span className="material-symbols-outlined text-white">chat</span>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF3366] rounded-full border border-[#0A0A0F]"></span>
        </button>

        {/* Bottom Status Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-30">
          <div className="bg-[#0A0A0F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-sm font-bold text-white mb-0.5">{orderStatus}</h2>
                <p className="text-xs font-mono font-bold text-[#FF0077]">Arriving in {etaMinutes} min</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-pulse"></span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF0077]/50 to-[#FF0077] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Rider Info Card */}
            <div className="flex items-center p-3 bg-white/5 rounded-xl border border-white/5 mt-4">
              <img 
                className="w-10 h-10 rounded-full object-cover mr-3 shrink-0" 
                alt="Rider Portrait"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDablPlwz77pTQgtlPLvgUDuM_6ywhMKk11G0hwH51LswkRwKO-TA2DDpTRSYit8gPD91e04iH8Qf5ZYNkB5nJ5isFgmrcTBYvUEXobylBGJVUhh0ge4-66eTSjK64hx8xLWkusEdlc_bS6NcNQY-jfAdlX55Evc7DH_gaVcBsJnuSeZkDyURkZjSVlR4rBUL954RosW2GQcz34dCjyNAkw0nsRljg1n_Ik6TEO2a-j_Fadfbi1dSwFSxRGB3BfPVvSjdRUxk5AWqTo"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white leading-tight">Alex M.</h4>
                <div className="flex items-center gap-1 bg-[#00E676]/10 border border-[#00E676]/20 px-2 py-0.5 rounded-full w-fit mt-1">
                  <span className="material-symbols-outlined text-[9px] text-[#00E676]">eco</span>
                  <span className="text-[8px] font-bold text-[#00E676]">Eco EV Partner</span>
                </div>
              </div>
              <button className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[16px] text-white">call</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── DESKTOP VIEW LAYOUT (real_time_tracking_desktop) ─── */
  return (
    <div className="w-full min-h-screen bg-[#040406] text-[#e5e1e6] select-none font-sans antialiased relative">
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
              <span className="material-symbols-outlined text-[#00E676] text-sm">verified</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Live Delivery</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 min-h-screen max-w-[1440px] mx-auto px-8 pb-8">
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-100px)]">
          {/* Map Section (70% width) */}
          <div className="col-span-8 bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl h-full">
            <LeafletMap center={riderPos} routePoints={routePoints} riderPos={riderPos} />
            
            {/* Floating weather notification */}
            <div className="absolute top-4 left-4 z-40 max-w-sm">
              <div className="bg-[#FF3366]/10 border border-[#FF3366]/30 backdrop-blur-md rounded-xl p-3 flex items-start gap-3 shadow-lg">
                <span className="material-symbols-outlined text-[#FF3366] text-[20px] animate-pulse">warning</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Monsoon Storm Surge</h4>
                  <p className="text-[9px] text-gray-400 mt-0.5">Expect dynamic route changes and 10 min delays.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info Section (30% width) */}
          <div className="col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Status Card */}
            <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <h3 className="text-base font-bold text-white">{orderStatus}</h3>
                <span className="font-mono text-sm font-bold text-[#FF0077] block mt-1">Arriving in {etaMinutes} minutes</span>
              </div>

              <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF0077]/50 to-[#FF0077] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Rider Profile Card */}
            <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
              <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Delivery Partner</h4>
              <div className="flex items-center gap-4">
                <img 
                  className="w-12 h-12 rounded-full object-cover shrink-0" 
                  alt="Rider Portrait"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDablPlwz77pTQgtlPLvgUDuM_6ywhMKk11G0hwH51LswkRwKO-TA2DDpTRSYit8gPD91e04iH8Qf5ZYNkB5nJ5isFgmrcTBYvUEXobylBGJVUhh0ge4-66eTSjK64hx8xLWkusEdlc_bS6NcNQY-jfAdlX55Evc7DH_gaVcBsJnuSeZkDyURkZjSVlR4rBUL954RosW2GQcz34dCjyNAkw0nsRljg1n_Ik6TEO2a-j_Fadfbi1dSwFSxRGB3BfPVvSjdRUxk5AWqTo"
                />
                <div>
                  <h5 className="text-xs font-bold text-white leading-tight">Alex M.</h5>
                  <div className="flex items-center gap-1 bg-[#00E676]/10 border border-[#00E676]/20 px-2 py-0.5 rounded-full w-fit mt-1">
                    <span className="material-symbols-outlined text-[9px] text-[#00E676]">eco</span>
                    <span className="text-[8px] font-bold text-[#00E676]">Eco EV Partner</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call</span>
                Call Partner
              </button>
            </div>

            {/* AI Agent Chat Prompt */}
            <div className="bg-gradient-to-br from-[#0A0A0F] to-[#14141F] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8F00FF] animate-pulse"></span>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Live Assistance</h4>
              </div>
              <p className="text-[11px] text-gray-400 italic">"I am monitoring your delivery path. If you need to make changes or have questions, just ask."</p>
              <button 
                onClick={onChatClick}
                className="w-full py-2.5 bg-[#8F00FF] text-white rounded-xl text-xs font-bold hover:bg-[#8F00FF]/90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Chat with Assistant
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
