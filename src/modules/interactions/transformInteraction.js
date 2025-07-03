import { getHandleAtPoint, getElementCenter } from "../../core/geometry";
import { rotateElement, resizeElement, transformGroup_rotate, transformGroup_resize } from "../../core/transformations";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

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
    handler: isRotation ? handleRotating : handleResizing,
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

export const handleRotating = (context) => {
  const { worldPos, event, data, elements, selectedElementIds } = context;
  const { initialGroupState, startElements } = data;

  if (initialGroupState) {
    const { boundingBox, startAngle, rotation } = initialGroupState;
    const groupCenter = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
    const currentAngle = Math.atan2(worldPos.y - groupCenter.y, worldPos.x - groupCenter.x);
    let newAngle = rotation + (currentAngle - startAngle);

    if (event.shiftKey) {
      const snapAngle = 15 * (Math.PI / 180);
      newAngle = Math.round(newAngle / snapAngle) * snapAngle;
    }

    return transformGroup_rotate(elements, selectedElementIds, groupCenter, newAngle, initialGroupState);
  } else {
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

  if (initialGroupState) {
    const { pivot } = initialGroupState;
    const newBoundingBox = resizeElement(initialGroupState.boundingBox, pivot, worldPos, activeHandle, event.shiftKey, event.ctrlKey || event.metaKey);
    if (newBoundingBox) {
      const updatedElements = transformGroup_resize(elements, selectedElementIds, newBoundingBox, initialGroupState);
      return { updatedElements, newBoundingBox };
    }
  } else {
    const { element, pivot } = startElements[0];
    const updatedElement = resizeElement(element, pivot, worldPos, activeHandle, event.shiftKey, event.ctrlKey || event.metaKey);
    const updatedElements = elements.map(el => (el.id === element.id ? updatedElement : el));
    return { updatedElements, newBoundingBox: updatedElement };
  }
  return { updatedElements: elements };
}; 