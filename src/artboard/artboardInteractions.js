import { getHandleAtPoint } from '../utils/geometry';
import { resizeArtboard } from './artboardTransform';

// Helper para clonar profundamente
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Lida com o redimensionamento de um artboard durante o movimento do mouse.
 */
export const handleArtboardResizing = (context) => {
  const { worldPos, event, data, elements } = context;
  const { startElements, activeHandle } = data;
  const { element, pivot } = startElements[0];

  const updatedArtboard = resizeArtboard(
    element, 
    pivot, 
    worldPos, 
    activeHandle, 
    event.shiftKey,
    event.ctrlKey || event.metaKey
  );
  
  const updatedElements = elements.map(el => (el.id === element.id ? updatedArtboard : el));

  return { updatedElements, newBoundingBox: updatedArtboard };
};

/**
 * Tenta iniciar uma interação de redimensionamento de artboard.
 * Verifica se o clique foi em um handle de um artboard selecionado.
 */
export const tryStartArtboardResize = (context) => {
  const { worldPos, elements, selectedElementIds, scale } = context;
  
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  
  // Só prossegue se UM único elemento estiver selecionado E for um artboard.
  if (selectedElements.length !== 1 || selectedElements[0].type !== 'artboard') {
    return null;
  }

  const artboard = selectedElements[0];
  const handle = getHandleAtPoint(worldPos, artboard, scale);

  if (!handle) {
    return null;
  }

  return {
    handler: handleArtboardResizing,
    data: {
      type: 'resizing-artboard',
      startElements: [{
        element: deepClone(artboard),
        pivot: handle.pivot,
      }],
      activeHandle: handle.type,
      liveElements: deepClone(elements),
      lastWorldPos: worldPos,
    },
  };
}; 