import React, { useState } from 'react';
import { UTILITY_TYPES } from '../api/mockData.js';
import { USE_MOCK } from '../api/client.js';

export default function ScanSimulator({ onScan }) {
  const [busy, setBusy] = useState(false);

  const handleScan = async (utility_type) => {
    setBusy(true);
    // Small delay to mimic reader + GPS fix latency
    await new Promise((r) => setTimeout(r, 350));
    await onScan(utility_type ? { utility_type } : {});
    setBusy(false);
  };

  return (
    <section className="scan-panel">
      <h2>Scan Simulator</h2>
      <p className="hint">
        {USE_MOCK
          ? 'Stands in for the Raspberry Pi + RFID reader until the hardware is connected. See README for the wiring plan.'
          : 'Connected to live reader — manual simulation disabled.'}
      </p>
      <div className="scan-buttons">
        <button disabled={busy || !USE_MOCK} onClick={() => handleScan()}>
          {busy ? 'Scanning…' : 'Simulate Random Scan'}
        </button>
        {UTILITY_TYPES.map((t) => (
          <button
            key={t.id}
            disabled={busy || !USE_MOCK}
            className="scan-type-btn"
            style={{ borderColor: t.color }}
            onClick={() => handleScan(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
