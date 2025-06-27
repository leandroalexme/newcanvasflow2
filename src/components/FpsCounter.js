import React from 'react';

/**
 * Um componente que exibe as métricas de performance (FPS e MS).
 * @param {{perfMetrics: {fps: number, ms: number}}} props
 */
const FpsCounter = ({ perfMetrics }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <span>FPS: {perfMetrics.fps.toFixed(0)}</span> | <span>MS: {perfMetrics.ms.toFixed(2)}</span>
    </div>
  );
};

export default FpsCounter;
