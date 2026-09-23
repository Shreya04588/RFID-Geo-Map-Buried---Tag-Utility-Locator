import { useCallback, useEffect, useState } from 'react';
import { getDetections, addDetection, subscribeToDetections } from '../api/client.js';

export function useDetections() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDetections().then((data) => {
      if (mounted) {
        setDetections(data);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToDetections((detection) => {
      setDetections((prev) => [detection, ...prev]);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const simulateScan = useCallback((overrides) => {
    return addDetection(overrides);
  }, []);

  return { detections, loading, simulateScan };
}
