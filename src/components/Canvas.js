import React, { useRef } from 'react';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useCanvasNavigation } from '../hooks/useCanvasNavigation';
import { useKeyboardInteractions } from '../hooks/useKeyboardInteractions';
import { useRenderLoop } from '../hooks/useRenderLoop';
import { useEditor } from '../context/EditorContext';

const Canvas = ({ 
  setPerfMetrics,
  onContextMenu,
  snapSettings
}) => {
  const canvasRef = useRef(null);
  const { elements, selectedElementIds } = useEditor();
  
  const { offset, setOffset, scale, handleWheel } = useCanvasNavigation(canvasRef);
  const { 
    hoveredElementId,
    highlightedArtboardId,
    selectionRect, 
    selectionBox,
    interactionState,
    snapLines,
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp
  } = useCanvasInteraction(
    canvasRef, 
    offset, 
    scale, 
    setOffset,
    snapSettings
  );

  useKeyboardInteractions();

  // O novo hook de renderização assume a complexidade do useEffect.
  const { perfMetrics } = useRenderLoop(canvasRef, { width: window.innerWidth, height: window.innerHeight }, {
    elements,
    selectedElementIds,
    hoveredElementId,
    highlightedArtboardId,
    selectionRect,
    interactionState,
    selectionBox,
    offset,
    scale,
    handleWheel,
    snapLines,
  });

  // Atualiza o estado no App para exibir o FPS
  React.useEffect(() => {
    setPerfMetrics(perfMetrics);
  }, [perfMetrics, setPerfMetrics]);

  return (
    <div className="canvas-container" onContextMenu={onContextMenu}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Canvas;



