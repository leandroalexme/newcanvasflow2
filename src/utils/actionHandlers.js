import { translateElements, rotateElement, resizeElement, transformGroup_rotate, transformGroup_resize } from './transformations';

export const handlePanning = (mousePos, lastPanPoint, setOffset) => {
  if (!lastPanPoint) {
    // If it's the first pan event, just store the current position.
    return mousePos;
  }
  const dx = mousePos.x - lastPanPoint.x;
  const dy = mousePos.y - lastPanPoint.y;
  setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  // Return the new pan point to be updated in the hook
  return mousePos;
};

export const handleSelecting = (context) => {
  const { worldPos, data, setSelectionRect } = context;
  const { startWorldPoint } = data;
  setSelectionRect({
    x: startWorldPoint.x,
    y: startWorldPoint.y,
    width: worldPos.x - startWorldPoint.x,
    height: worldPos.y - startWorldPoint.y
  });
};

export const handleDragging = (context) => {
  const { data, elements, dx, dy } = context;
  const { startElements, interactionBox } = data;

  if (!interactionBox) {
    return { updatedElements: elements };
  }

  const elementIdsToMove = new Set(startElements.map(el => el.id));

  // Aplica o delta diretamente aos elementos selecionados na cópia "viva"
  const updatedElements = elements.map(el => {
    if (elementIdsToMove.has(el.id)) {
      return { ...el, x: el.x + dx, y: el.y + dy };
    }
    return el;
  });

  // Aplica o mesmo delta à caixa de interação
  const newBoundingBox = {
    ...interactionBox,
    x: interactionBox.x + dx,
    y: interactionBox.y + dy,
  };

  return { updatedElements, newBoundingBox };
};

export const handleRotating = (context) => {
  const { worldPos, event, data, elements, selectedElementIds } = context;
  const { initialGroupState, startElements } = data;

  if (initialGroupState) { // Rotação de Grupo
    const { boundingBox, startAngle, rotation } = initialGroupState;
    const groupCenter = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
    const currentAngle = Math.atan2(worldPos.y - groupCenter.y, worldPos.x - groupCenter.x);
    let newAngle = rotation + (currentAngle - startAngle);

    if (event.shiftKey) {
      const snapAngle = 15 * (Math.PI / 180);
      newAngle = Math.round(newAngle / snapAngle) * snapAngle;
    }

    return transformGroup_rotate(elements, selectedElementIds, groupCenter, newAngle, initialGroupState);
  } else { // Rotação de Elemento Único
    const { element } = startElements[0];
    const center = { x: element.x + (element.width || 0) / 2, y: element.y + (element.height || 0) / 2 };
    const updatedElement = rotateElement(element, center, element.startAngle, worldPos, event.shiftKey);
    const updatedElements = elements.map(el => (el.id === element.id ? updatedElement : el));
    return { updatedElements, newBoundingBox: updatedElement };
  }
};

export const handleResizing = (context) => {
  const { worldPos, event, data, elements, selectedElementIds } = context;
  const { initialGroupState, activeHandle, startElements } = data;

  if (initialGroupState) { // Redimensionamento de Grupo
    const { pivot } = initialGroupState;
    const newBoundingBox = resizeElement(initialGroupState.boundingBox, pivot, worldPos, activeHandle, event.shiftKey, event.ctrlKey || event.metaKey);
    if (newBoundingBox) {
      const updatedElements = transformGroup_resize(elements, selectedElementIds, newBoundingBox, initialGroupState);
      return { updatedElements, newBoundingBox };
    }
  } else { // Redimensionamento de Elemento Único
    const { element, pivot } = startElements[0];
    const updatedElement = resizeElement(element, pivot, worldPos, activeHandle, event.shiftKey, event.ctrlKey || event.metaKey);
    const updatedElements = elements.map(el => (el.id === element.id ? updatedElement : el));
    return { updatedElements, newBoundingBox: updatedElement };
  }
  return { updatedElements: elements };
};
