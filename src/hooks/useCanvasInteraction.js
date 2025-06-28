import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getPointInWorld,
  getClickedElement,
  getHandleAtPoint,
  getHandles,
  isElementIntersectingSelection,
  getAxisAlignedBoundingBox,
  rotatePoint,
  calculateGroupSelectionBox,
  isPointInsideRotatedBox,
  getElementCenter
} from '../utils/geometry';
import {
  translateElements,
  rotateElement,
  resizeElement,
  rotateElements,
  resizeElements,
} from '../utils/transformations';
import { haveElementsChanged } from '../utils/history';
import { getMousePosition } from '../utils/geometry';
import { useSelectionBox } from './useSelectionBox';
import * as ActionHandler from '../utils/actionHandlers';
import { tryStartPanning } from '../interactions/pan';
import { tryStartTransform } from '../interactions/transform';
import { tryStartDragging } from '../interactions/drag';
import { startMarqueeSelection } from '../interactions/select';

// Helper para clonar profundamente, garantindo que não haja referências presas.
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const useCanvasInteraction = (elements, setElements, commit, canvasRef, offset, scale, setOffset) => {
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [selectionRect, setSelectionRect] = useState(null);
  const interactionState = useRef({ handler: null, data: {} });
  const didDuplicateOnDragRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && interactionState.current.data.type === 'dragging') {
        didDuplicateOnDragRef.current = true;
      }
    };
    const handleKeyUp = (event) => {
      if (!event.metaKey && !event.ctrlKey) {
        didDuplicateOnDragRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const { selectionBox, groupRotation, activeGroupBoundingBox, setActiveGroupBoundingBox } = useSelectionBox(elements, selectedElementIds);

  const handleMouseDown = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePosition(event, canvas);
    const worldPos = getPointInWorld(mousePos, offset, scale);

    const context = {
      event, canvas, mousePos, worldPos, offset, scale,
      elements, selectedElementIds, selectionBox,
      setElements, setSelectedElementIds, setOffset, setSelectionRect, setActiveGroupBoundingBox
    };

    // Ordem de prioridade das interações
    const interaction =
      tryStartPanning(context) ||
      tryStartTransform(context) ||
      tryStartDragging(context) ||
      startMarqueeSelection(context);

    interactionState.current = interaction;

  }, [elements, selectedElementIds, offset, scale, canvasRef, selectionBox, setElements, setSelectedElementIds, setOffset, setSelectionRect, setActiveGroupBoundingBox]);

  const handleMouseMove = useCallback((event) => {
    const { handler, data } = interactionState.current;
    if (!handler) return;

    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePosition(event, canvas);
    const worldPos = getPointInWorld(mousePos, offset, scale);

    let dx = 0;
    let dy = 0;
    if (data.lastWorldPos) {
      dx = worldPos.x - data.lastWorldPos.x;
      dy = worldPos.y - data.lastWorldPos.y;
    }

    const context = {
      worldPos, mousePos, event, data,
      elements: data.liveElements,
      selectedElementIds,
      dx, dy,
      setOffset,
      setSelectionRect,
    };

    const result = handler(context);

    if (result) {
      interactionState.current.data.liveElements = result.updatedElements;
      if (result.newBoundingBox) {
        interactionState.current.data.interactionBox = result.newBoundingBox;
      }
    }

    if (data.type === 'panning') {
      interactionState.current.data.lastPanPoint = mousePos;
    }
    if (data.lastWorldPos) {
      interactionState.current.data.lastWorldPos = worldPos;
    }
  }, [selectedElementIds, offset, scale, canvasRef, setOffset, setSelectionRect]);

  const handleMouseUp = useCallback(() => {
    const { handler, data } = interactionState.current;
    if (!handler) return;

    const { type, initialGroupState, startElements, liveElements } = data;

    if (type === 'dragging' && didDuplicateOnDragRef.current) {
      const movedElements = liveElements.filter(el =>
        startElements.some(startEl => startEl.id === el.id)
      );
      const newClones = movedElements.map(el => ({
        ...el,
        id: Date.now() + Math.random(),
      }));
      const newCloneIds = newClones.map(c => c.id);
      const finalElements = [...elements, ...newClones];
      commit(finalElements);
      setSelectedElementIds(newCloneIds);
    } else if (['dragging', 'resizing', 'rotating'].includes(type) && liveElements) {
      const initial = initialGroupState ? initialGroupState.elements : (startElements || []).map(s => s.element || s);
      if (haveElementsChanged(initial, liveElements.filter(el => initial.some(i => i.id === el.id)))) {
        commit(liveElements);
      }
    }

    if (type === 'selecting' && selectionRect) {
      const selectedIds = elements.filter(el => isElementIntersectingSelection(el, selectionRect)).map(el => el.id);
      setSelectedElementIds(selectedIds);
    }

    if (canvasRef.current) {
      canvasRef.current.style.cursor = type === 'panning' ? 'grab' : 'default';
    }

    interactionState.current = { handler: null, data: {} };
    setActiveGroupBoundingBox(null);
    setSelectionRect(null);
  }, [canvasRef, elements, selectionRect, commit, setSelectedElementIds, setActiveGroupBoundingBox]);

  return {
    selectedElementIds,
    setSelectedElementIds,
    selectionRect,
    selectionBox,
    groupRotation,
    interactionState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
