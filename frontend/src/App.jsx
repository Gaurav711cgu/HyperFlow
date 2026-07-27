import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import AIAgent from './pages/AIAgent.jsx';
import DarkStoreIntel from './pages/DarkStoreIntel.jsx';
import RouteIntelligence from './pages/RouteIntelligence.jsx';
import MLGuard from './pages/MLGuard.jsx';
import Analytics from './pages/Analytics.jsx';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/agent" replace />} />
            <Route path="/agent" element={<AIAgent />} />
            <Route path="/dark-store" element={<DarkStoreIntel />} />
            <Route path="/route-intel" element={<RouteIntelligence />} />
            <Route path="/ml-guard" element={<MLGuard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
