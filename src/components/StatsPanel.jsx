import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { UTILITY_TYPES } from '../api/mockData.js';

export default function StatsPanel({ detections }) {
  const counts = useMemo(() => {
    const map = Object.fromEntries(UTILITY_TYPES.map((t) => [t.id, 0]));
    detections.forEach((d) => {
      map[d.utility_type] = (map[d.utility_type] || 0) + 1;
    });
    return map;
  }, [detections]);

  const chartData = UTILITY_TYPES.map((t) => ({
    name: t.label,
    value: counts[t.id] || 0,
    color: t.color,
  })).filter((d) => d.value > 0);

  const avgDepth = useMemo(() => {
    if (!detections.length) return 0;
    const total = detections.reduce((sum, d) => sum + d.depth_cm, 0);
    return Math.round(total / detections.length);
  }, [detections]);

  return (
    <section className="stats-panel">
      <div className="stat-card">
        <span className="stat-value">{detections.length}</span>
        <span className="stat-label">Tags Detected</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{avgDepth} cm</span>
        <span className="stat-label">Avg. Depth</span>
      </div>
      <div className="stat-card chart-card">
        <ResponsiveContainer width="100%" height={110}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={28}
              outerRadius={48}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <span className="stat-label">By Utility Type</span>
      </div>
    </section>
  );
}
