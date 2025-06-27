import { useState, useRef, useCallback } from 'react';

/**
 * Hook customizado para calcular métricas de performance como FPS (Frames Per Second).
 * @returns {{perfMetrics: {fps: number, ms: number}, markFrame: function}}
 */
export const useFpsCalculator = () => {
  const [perfMetrics, setPerfMetrics] = useState({ fps: 0, ms: 0 });
  const lastTime = useRef(window.performance.now());
  const frameCount = useRef(0);

  const markFrame = useCallback(() => {
    frameCount.current++;
    const currentTime = window.performance.now();
    const deltaTime = currentTime - lastTime.current;

    if (deltaTime >= 1000) {
      const fps = frameCount.current;
      const ms = deltaTime / frameCount.current;
      setPerfMetrics({ fps, ms });
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  }, []);

  return { perfMetrics, markFrame };
};
