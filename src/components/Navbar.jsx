import React from 'react';
import { USE_MOCK } from '../api/client.js';

export default function Navbar() {
  return (
    <header className="navbar">
      <div>
        <h1>RFID-GeoMap</h1>
        <span className="subtitle">Buried-Tag Utility Locator</span>
      </div>
      <div className={`mode-badge ${USE_MOCK ? 'mock' : 'live'}`}>
        {USE_MOCK ? '● Mock Data Mode' : '● Live Reader'}
      </div>
    </header>
  );
}
