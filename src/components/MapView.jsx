import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { UTILITY_TYPES } from '../api/mockData.js';

const colorFor = (type) =>
  UTILITY_TYPES.find((t) => t.id === type)?.color || '#94a3b8';

export default function MapView({ detections }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersLayer = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (leafletMap.current) return;
    leafletMap.current = L.map(mapRef.current).setView([18.4636, 73.8636], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 20,
    }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);
  }, []);

  // Redraw markers whenever detections change
  useEffect(() => {
    if (!markersLayer.current) return;
    markersLayer.current.clearLayers();

    detections.forEach((d) => {
      const marker = L.circleMarker([d.lat, d.lng], {
        radius: 8,
        color: colorFor(d.utility_type),
        fillColor: colorFor(d.utility_type),
        fillOpacity: 0.85,
        weight: 2,
      });

      marker.bindPopup(`
        <strong>${d.tag_id}</strong><br/>
        Type: ${d.utility_type.replace('_', ' ')}<br/>
        Owner: ${d.owner}<br/>
        Depth: ${d.depth_cm} cm<br/>
        Soil: ${d.soil_condition}<br/>
        Signal: ${d.signal_strength}%<br/>
        ${new Date(d.timestamp).toLocaleString()}
      `);

      marker.addTo(markersLayer.current);
    });
  }, [detections]);

  return <div ref={mapRef} className="map-view" />;
}
