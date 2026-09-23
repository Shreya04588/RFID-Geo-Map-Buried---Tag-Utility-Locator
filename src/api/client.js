import axios from 'axios';
import { generateDetection, generateInitialDataset } from './mockData.js';

// ---------------------------------------------------------------------
// This file is the ONLY place that needs to change when you plug in the
// real Raspberry Pi + RFID reader + GPS backend. Everything above it
// (components, hooks) talks to the functions exported below and does
// not care whether the data is mocked or real.
// ---------------------------------------------------------------------

export const USE_MOCK = true; // flip to false once your backend is running

const API_BASE = import.meta.env.VITE_API_BASE || 'http://raspberrypi.local:5000/api';

const http = axios.create({ baseURL: API_BASE, timeout: 5000 });

// ---- Mock implementation ----------------------------------------------
let mockStore = generateInitialDataset(14);
const listeners = new Set();

function mockGetDetections() {
  return Promise.resolve([...mockStore]);
}

function mockAddDetection(partial = {}) {
  const detection = generateDetection(partial);
  mockStore = [detection, ...mockStore];
  listeners.forEach((cb) => cb(detection));
  return Promise.resolve(detection);
}

// Simulates the Pi pushing a new scan every so often, the way a real
// reader would over a WebSocket once you're in the field.
function mockSubscribe(onDetection) {
  listeners.add(onDetection);
  return () => listeners.delete(onDetection);
}

// ---- Real backend implementation (used once USE_MOCK = false) --------
// Expected REST contract from the Raspberry Pi side (FastAPI/Flask):
//   GET  /api/detections          -> Detection[]
//   POST /api/detections          -> Detection   (reader posts a new read)
//   WS   /api/detections/stream   -> live push of new Detection objects
async function realGetDetections() {
  const { data } = await http.get('/detections');
  return data;
}

async function realAddDetection(partial) {
  const { data } = await http.post('/detections', partial);
  return data;
}

function realSubscribe(onDetection) {
  const wsUrl = API_BASE.replace(/^http/, 'ws') + '/detections/stream';
  const socket = new WebSocket(wsUrl);
  socket.onmessage = (event) => {
    try {
      onDetection(JSON.parse(event.data));
    } catch (err) {
      console.error('Bad detection payload from reader stream', err);
    }
  };
  return () => socket.close();
}

// ---- Public API ---------------------------------------------------------
export const getDetections = USE_MOCK ? mockGetDetections : realGetDetections;
export const addDetection = USE_MOCK ? mockAddDetection : realAddDetection;
export const subscribeToDetections = USE_MOCK ? mockSubscribe : realSubscribe;
