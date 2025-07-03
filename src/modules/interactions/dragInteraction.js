import { getClickedElement, isPointInsideRotatedBox, calculateGroupSelectionBox } from '../../core/geometry';
import {
  updateArtboardAssociation,
  getArtboardHighlight,
} from '../artboard/artboardAssociation';
import { findSnapAdjustments, SNAP_THRESHOLD_DEFAULT, SNAP_THRESHOLD_STRONG } from '../snapping/snapUtils';
import { deepClone } from '../../utils/helpers';
import { SNAP_STRENGTH_MODIFIER } from '../../core/constants';
import { getElementCenter, getMousePosition, getPointInWorld } from '../../core/geometry';
import { translateElements } from '../../core/transformations';
import { snapManager } from '../snapping/snapManager';

export const tryStartDragging = (context) => {
  const { worldPos, selectionBox, elements, selectedElementIds, event, setSelectedElementIds, canvas, setSelectionRect } = context;

  const clickedElement = getClickedElement(worldPos, elements);

  if (!clickedElement && !(selectionBox && isPointInsideRotatedBox(worldPos, selectionBox))) {
    return null;
  }

  if (clickedElement && event.shiftKey) {
    const newSelection = selectedElementIds.includes(clickedElement.id)
      ? selectedElementIds.filter(id => id !== clickedElement.id)
      : [...selectedElementIds, clickedElement.id];
    setSelectedElementIds(newSelection);
    return { handler: null, data: {} };
  }

  const isNewSelection = clickedElement && !selectedElementIds.includes(clickedElement.id);
  
  const elementsToDrag = isNewSelection
    ? [clickedElement]
    : elements.filter(el => selectedElementIds.includes(el.id));

  if (elementsToDrag.length === 0) {
    if (!clickedElement) {
       setSelectionRect({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
       // Temporariamente, isso pode precisar de um handler de seleção daqui
       // Mas por enquanto vamos simplificar.
       return null; 
    }
    return null;
  }
  
  if (isNewSelection) {
    setSelectedElementIds([clickedElement.id]);
  }

  canvas.style.cursor = 'move';
  
  const interactionBox = isNewSelection
    ? (elementsToDrag.length === 1 ? elementsToDrag[0] : calculateGroupSelectionBox(elementsToDrag))
    : selectionBox;

  const elementOffsets = elementsToDrag.map(el => ({
    id: el.id,
    offsetX: worldPos.x - el.x,
    offsetY: worldPos.y - el.y,
  }));

  let initialGroupState = null;
  if (interactionBox) {
    initialGroupState = { elements: deepClone(elementsToDrag), boundingBox: interactionBox };
  }

  return {
    handler: handleDragging,
    data: {
      type: 'dragging',
      startWorldPoint: worldPos,
      lastWorldPos: worldPos,
      startElements: deepClone(elementsToDrag),
      elementOffsets,
      initialGroupState,
      interactionBox,
      liveElements: deepClone(elements),
    },
  };
};

export const handleDragging = (context) => {
  const { data, elements, worldPos, setHighlightedArtboardId, scale, snapSettings, shiftKey, metaKey, ctrlKey } = context;
  const { startElements, interactionBox, elementOffsets, initialGroupState } = data;

  if (!interactionBox || !snapSettings || !elementOffsets || !initialGroupState) {
    return { updatedElements: elements };
  }

  const primaryElementOffset = elementOffsets.find(offset => offset.id === startElements[0].id);
  if (!primaryElementOffset) {
    return { updatedElements: elements };
  }

  // 1. Calculate the ideal position based on the current mouse position and the initial click offset.
  const idealX = worldPos.x - primaryElementOffset.offsetX;
  const idealY = worldPos.y - primaryElementOffset.offsetY;

  // 2. Determine snap threshold and check for snaps based on the ideal position.
  let snapOffset = { x: 0, y: 0 };
  let snapLines = [];

  if (snapSettings.isEnabled) {
    // Determine snap threshold based on key modifiers and settings
    let currentTolerance = snapSettings.tolerance;
    if (shiftKey) {
      currentTolerance *= SNAP_STRENGTH_MODIFIER;
    } else if (metaKey || ctrlKey) {
      currentTolerance = 0; // Disable snapping
    }

    if (currentTolerance > 0) {
      const potentialNextElement = { ...startElements[0], x: idealX, y: idealY };
      const staticElements = elements.filter(el => !startElements.some(startEl => startEl.id === el.id));
      const snapResult = findSnapAdjustments(potentialNextElement, staticElements, scale, currentTolerance, snapSettings);
      snapOffset = snapResult.snapOffset;
      snapLines = snapResult.snapLines;
    }
  }
  
  context.setSnapLines(snapLines);

  // 3. Calculate the final position and the total delta from the start of the drag.
  const finalX = idealX + snapOffset.x;
  const finalY = idealY + snapOffset.y;

  const totalDx = finalX - startElements[0].x;
  const totalDy = finalY - startElements[0].y;

  // 4. Apply the total delta to all dragged elements based on their original start positions.
  const elementIdsToMove = new Set(startElements.map(el => el.id));
  let updatedElements = elements.map(el => {
    if (elementIdsToMove.has(el.id)) {
      const startElement = startElements.find(se => se.id === el.id);
      return { ...el, x: startElement.x + totalDx, y: startElement.y + totalDy };
    }
    return el;
  });
  
  // Handle artboard association and other side effects
  const primaryDraggedElement = updatedElements.find(
    el => el.id === startElements[0].id,
  );
  if (primaryDraggedElement.type === 'artboard') {
    updatedElements.forEach(el => {
      const startElement = startElements.find(se => se.id === el.id);
      if (startElement && startElement.parentId === primaryDraggedElement.id) {
        elementIdsToMove.add(el.id);
      }
    });
  }

  const highlightedArtboardId = getArtboardHighlight(
    updatedElements.filter(el => elementIdsToMove.has(el.id)),
    elements,
  );
  setHighlightedArtboardId(highlightedArtboardId);
  
  // 5. Update the visual bounding box based on its ORIGINAL start position.
  const { boundingBox: initialBoundingBox } = initialGroupState;
  const newBoundingBox = {
    ...initialBoundingBox,
    x: initialBoundingBox.x + totalDx,
    y: initialBoundingBox.y + totalDy,
  };

  return { updatedElements, newBoundingBox };
}; 