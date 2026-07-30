import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommandHeader from './components/CommandHeader.jsx';
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
        <CommandHeader />
        <div className="app-body">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<AIAgent />} />
              <Route path="/agent" element={<AIAgent />} />
              <Route path="/dark-store-intel" element={<DarkStoreIntel />} />
              <Route path="/dark-store" element={<DarkStoreIntel />} />
              <Route path="/route-intelligence" element={<RouteIntelligence />} />
              <Route path="/route-intel" element={<RouteIntelligence />} />
              <Route path="/ml-guard" element={<MLGuard />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
