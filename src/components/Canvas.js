import React, { useRef } from 'react';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useLayerOperations } from '../hooks/useLayerOperations';
import { useCanvasNavigation } from '../hooks/useCanvasNavigation';
import { useKeyboardInteractions } from '../hooks/useKeyboardInteractions';
import { useRenderLoop } from '../hooks/useRenderLoop';

const Canvas = ({ elements, setElements, commit, undo, redo, setPerfMetrics }) => {
  const canvasRef = useRef(null);
  
  const { offset, setOffset, scale, handleWheel } = useCanvasNavigation(canvasRef);
  const { 
    selectedElementIds, 
    setSelectedElementIds,
    selectionRect, 
    selectionBox,
    interactionState,
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp
  } = useCanvasInteraction(elements, setElements, commit, canvasRef, offset, scale, setOffset);

  const { bringToFront, sendToBack, bringForward, sendBackward } = useLayerOperations({ 
    elements, 
    selectedElementIds, 
    setElements, 
    commit 
  });

  useKeyboardInteractions({ 
    elements, 
    selectedElementIds, 
    commit, 
    setSelectedElementIds, 
    undo, 
    redo, 
    bringToFront, 
    sendToBack, 
    bringForward,
    sendBackward,
  });

  // O novo hook de renderização assume a complexidade do useEffect.
  const { perfMetrics } = useRenderLoop(canvasRef, { width: window.innerWidth, height: window.innerHeight }, {
    elements,
    selectedElementIds,
    selectionRect,
    interactionState,
    selectionBox,
    offset,
    scale,
    handleWheel,
  });

  // Atualiza o estado no App para exibir o FPS
  React.useEffect(() => {
    setPerfMetrics(perfMetrics);
  }, [perfMetrics, setPerfMetrics]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button onClick={bringToFront} disabled={selectedElementIds.length === 0}>Trazer para Frente</button>
        <button onClick={sendToBack} disabled={selectedElementIds.length === 0}>Enviar para Trás</button>
      </div>
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



