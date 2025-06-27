import { useState, useCallback } from 'react';

const getMousePosition = (event, canvas) => {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

export const useCanvasNavigation = (canvasRef) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const mousePos = getMousePosition(event, canvas);

    const worldPointBeforeZoom = {
      x: (mousePos.x - offset.x) / scale,
      y: (mousePos.y - offset.y) / scale,
    };

    const zoomFactor = 1.05;
    const newScale = Math.max(0.1, event.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor);

    const newOffset = {
      x: mousePos.x - worldPointBeforeZoom.x * newScale,
      y: mousePos.y - worldPointBeforeZoom.y * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
  }, [scale, offset, canvasRef]);

  return { offset, setOffset, scale, setScale, handleWheel };
};
