// Simulated data standing in for real Raspberry Pi + RFID reader + GPS
// output, until the hardware is wired up. Replace this module's role by
// pointing src/api/client.js at your real backend (see README).

// Colors follow the APWA uniform utility-marking color code, so the
// dashboard reads the same way a field crew's paint/flags would.
export const UTILITY_TYPES = [
  { id: 'water', label: 'Water', color: '#3b82f6' },
  { id: 'sewer', label: 'Sewer', color: '#22c55e' },
  { id: 'gas', label: 'Gas', color: '#eab308' },
  { id: 'electricity', label: 'Electricity', color: '#ef4444' },
  { id: 'fiber_optic', label: 'Comms / Fiber', color: '#f97316' },
];

// Demo center point (swap for your actual test site).
const CENTER = { lat: 18.4636, lng: 73.8636 };

function jitter(base, spread) {
  return base + (Math.random() - 0.5) * spread;
}

function randomTagId() {
  return 'TAG-' + Math.random().toString(16).slice(2, 8).toUpperCase();
}

// Avoid crypto.randomUUID(): it throws in non-secure contexts (e.g.
// opening the dev server over a LAN IP instead of localhost), which
// would break this module at import time and render a blank page.
function randomId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function randomOwner() {
  const owners = [
    'Municipal Water Board',
    'City Gas Corp',
    'State Electricity Board',
    'BharatNet Fiber',
    'City Sewage Dept.',
  ];
  return owners[Math.floor(Math.random() * owners.length)];
}

export function generateDetection(overrides = {}) {
  const type =
    overrides.utility_type ||
    UTILITY_TYPES[Math.floor(Math.random() * UTILITY_TYPES.length)].id;

  return {
    id: overrides.id || randomId(),
    tag_id: overrides.tag_id || randomTagId(),
    utility_type: type,
    owner: overrides.owner || randomOwner(),
    lat: overrides.lat ?? jitter(CENTER.lat, 0.004),
    lng: overrides.lng ?? jitter(CENTER.lng, 0.004),
    depth_cm: overrides.depth_cm ?? Math.round(30 + Math.random() * 90),
    soil_condition:
      overrides.soil_condition || (Math.random() > 0.5 ? 'dry' : 'wet'),
    signal_strength: overrides.signal_strength ?? Math.round(40 + Math.random() * 60),
    timestamp: overrides.timestamp || new Date().toISOString(),
  };
}

export function generateInitialDataset(count = 14) {
  return Array.from({ length: count }, () => generateDetection());
}
