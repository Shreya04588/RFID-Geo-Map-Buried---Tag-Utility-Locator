import React from 'react';
import Navbar from './components/Navbar.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import MapView from './components/MapView.jsx';
import DetectionTable from './components/DetectionTable.jsx';
import ScanSimulator from './components/ScanSimulator.jsx';
import { useDetections } from './hooks/useDetections.js';

export default function App() {
  const { detections, loading, simulateScan } = useDetections();

  return (
    <div className="app">
      <Navbar />
      <main>
        {loading ? (
          <p className="loading">Loading detections…</p>
        ) : (
          <>
            <StatsPanel detections={detections} />
            <div className="main-grid">
              <MapView detections={detections} />
              <ScanSimulator onScan={simulateScan} />
            </div>
            <DetectionTable detections={detections} />
          </>
        )}
      </main>
    </div>
  );
}
