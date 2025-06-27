import { getHandleAtPoint, getElementCenter } from '../utils/geometry';
import * as ActionHandler from '../utils/actionHandlers';

// Helper para clonar profundamente, garantindo que não haja referências presas.
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Tenta iniciar uma interação de transformação (redimensionar ou rotacionar).
 * @param {object} context - O contexto da interação.
 * @returns {object|null} O estado da interação se a transformação for iniciada, caso contrário, nulo.
 */
export const tryStartTransform = (context) => {
  const { worldPos, selectionBox, scale, canvas, elements, selectedElementIds } = context;

  if (!selectionBox) {
    return null;
  }

  const handle = getHandleAtPoint(worldPos, selectionBox, scale);
  if (!handle) {
    return null;
  }

  canvas.style.cursor = handle.cursor;
  const isRotation = handle.type === 'rotation';
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // Prepara o estado inicial para a transformação (seja de grupo ou de elemento único)
  let initialGroupState = null;
  let startElements = [];
  if (selectionBox.type === 'group') {
    const groupCenter = { x: selectionBox.x + selectionBox.width / 2, y: selectionBox.y + selectionBox.height / 2 };
    initialGroupState = {
      elements: deepClone(selectedElements),
      boundingBox: { ...selectionBox },
      pivot: handle.pivot,
      startAngle: Math.atan2(worldPos.y - groupCenter.y, worldPos.x - groupCenter.x),
      rotation: selectionBox.rotation || 0,
    };
  } else {
    const element = selectedElements[0];
    const center = getElementCenter(element);
    startElements = [{
      element: { ...element, startAngle: Math.atan2(worldPos.y - center.y, worldPos.x - center.x) },
      pivot: handle.pivot,
    }];
  }

  return {
    handler: isRotation ? ActionHandler.handleRotating : ActionHandler.handleResizing,
    data: {
      type: isRotation ? 'rotating' : 'resizing',
      initialGroupState,
      startElements: deepClone(startElements),
      activeHandle: handle.type,
      interactionBox: selectionBox,
      liveElements: deepClone(elements),
      lastWorldPos: worldPos,
    },
  };
};
