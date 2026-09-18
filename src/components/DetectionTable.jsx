import React, { useState } from 'react';
import { UTILITY_TYPES } from '../api/mockData.js';

export default function DetectionTable({ detections }) {
  const [filter, setFilter] = useState('all');

  const rows =
    filter === 'all' ? detections : detections.filter((d) => d.utility_type === filter);

  return (
    <section className="table-panel">
      <div className="table-header">
        <h2>Detection Log</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All types</option>
          {UTILITY_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tag ID</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Depth</th>
              <th>Soil</th>
              <th>Signal</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="mono">{d.tag_id}</td>
                <td>
                  <span className={`pill pill-${d.utility_type}`}>
                    {d.utility_type.replace('_', ' ')}
                  </span>
                </td>
                <td>{d.owner}</td>
                <td>{d.depth_cm} cm</td>
                <td>{d.soil_condition}</td>
                <td>{d.signal_strength}%</td>
                <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  No detections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
