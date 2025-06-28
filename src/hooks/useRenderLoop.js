import { useEffect } from 'react';
import { drawScene } from '../utils/renderer';
import { useFpsCalculator } from './useFpsCalculator';

/**
 * Hook customizado para gerenciar o loop de renderização do canvas.
 * Isola a lógica de requestAnimationFrame e desenho da cena.
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - A referência para o elemento canvas.
 * @param {object} dimensions - As dimensões do canvas (width, height).
 * @param {object} sceneState - O estado da cena a ser renderizada.
 * @returns {{perfMetrics: {fps: number, ms: number}}} - As métricas de performance.
 */
export const useRenderLoop = (canvasRef, dimensions, sceneState) => {
  const {
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
  } = sceneState;

  const { perfMetrics, markFrame } = useFpsCalculator();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animationFrameId;

    const renderLoop = () => {
      markFrame(); // Marca um quadro para o cálculo de FPS

      const elementsToRender = interactionState.current?.data?.liveElements || elements;
      const boxToDraw = interactionState.current?.data?.interactionBox || selectionBox;

      drawScene(context, offset, scale, elementsToRender, selectedElementIds, hoveredElementId, highlightedArtboardId, selectionRect, perfMetrics, boxToDraw);
      animationFrameId = window.requestAnimationFrame(renderLoop);
    };
    renderLoop();

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [
    canvasRef,
    dimensions,
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
    markFrame,
    perfMetrics,
  ]);

  return { perfMetrics };
};
