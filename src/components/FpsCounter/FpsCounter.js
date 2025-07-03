import React from 'react';
import './FpsCounter.css';

const FpsCounter = ({ perfMetrics }) => (
  <div className="fps-counter">
    {`FPS: ${perfMetrics.fps} | MS: ${perfMetrics.ms.toFixed(2)}`}
  </div>
);

export default FpsCounter;
