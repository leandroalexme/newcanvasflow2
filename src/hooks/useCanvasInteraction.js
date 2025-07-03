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
} from '../core/geometry';
import {
  translateElements,
  rotateElement,
  resizeElement,
  rotateElements,
  resizeElements,
} from '../core/transformations';
import { haveElementsChanged, deepClone } from '../utils/helpers';
import { getMousePosition } from '../core/geometry';
import { useSelectionBox } from './useSelectionBox';
import { tryStartPanning } from '../modules/interactions/panInteraction';
import { tryStartTransform } from '../modules/interactions/transformInteraction';
import { tryStartDragging } from '../modules/interactions/dragInteraction';
import { startMarqueeSelection } from '../modules/interactions/selectionInteraction';
import { tryStartArtboardResize } from '../modules/artboard/artboardInteractions';
import { updateArtboardAssociation } from '../modules/artboard/artboardAssociation';
import useHistory from './useHistory';
import { snapManager } from '../modules/snapping/snapManager';
import { useEditor } from '../context/EditorContext';

export const useCanvasInteraction = (
  canvasRef, 
  offset, 
  scale, 
  setOffset,
  snapSettings
) => {
  const { 
    elements, 
    setElements, 
    commit, 
    selectedElementIds, 
    setSelectedElementIds 
  } = useEditor();
  const [hoveredElementId, setHoveredElementId] = useState(null);
  const [highlightedArtboardId, setHighlightedArtboardId] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [snapLines, setSnapLines] = useState([]);
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

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    const singleSelectedArtboard = selectedElements.length === 1 && selectedElements[0].type === 'artboard' ? selectedElements[0] : null;

    const context = {
      event, canvas, mousePos, worldPos, offset, scale,
      elements, selectedElementIds, selectionBox: selectionBox || singleSelectedArtboard,
      setElements, setSelectedElementIds, setOffset, setSelectionRect, setActiveGroupBoundingBox,
      setSnapLines,
      snapSettings
    };

    // Ordem de prioridade das interações
    const interaction =
      tryStartArtboardResize(context) ||
      tryStartPanning(context) ||
      tryStartTransform(context) ||
      tryStartDragging(context) ||
      startMarqueeSelection(context);

    interactionState.current = interaction;

  }, [elements, selectedElementIds, offset, scale, canvasRef, selectionBox, setElements, setSelectedElementIds, setOffset, setSelectionRect, setActiveGroupBoundingBox, setSnapLines, snapSettings]);

  const handleMouseMove = useCallback((event) => {
    const { handler, data } = interactionState.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mousePos = getMousePosition(event, canvas);
    const worldPos = getPointInWorld(mousePos, offset, scale);

    // If no interaction is active, just check hover
    if (!handler) {
      const hoveredElement = getClickedElement(worldPos, elements);
      setHoveredElementId(hoveredElement ? hoveredElement.id : null);
      return;
    }

    event.preventDefault();

    let dx = 0;
    let dy = 0;
    if (data.lastWorldPos) {
      dx = worldPos.x - data.lastWorldPos.x;
      dy = worldPos.y - data.lastWorldPos.y;
    }

    const context = {
      worldPos,
      mousePos,
      event,
      data,
      elements: data.liveElements,
      selectedElementIds,
      dx,
      dy,
      scale,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      setOffset,
      setSelectionRect,
      setHighlightedArtboardId,
      setSnapLines,
      snapSettings
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
  }, [elements, selectedElementIds, offset, scale, canvasRef, setOffset, setSelectionRect, setHoveredElementId, setHighlightedArtboardId, setSnapLines, snapSettings]);

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
    } else if (['dragging', 'resizing', 'rotating', 'resizing-artboard'].includes(type) && liveElements) {
      const movedElementIds = new Set(startElements.map(e => e.element ? e.element.id : e.id));
      const movedElements = liveElements.filter(el => movedElementIds.has(el.id));
      
      const { updatedElements: elementsWithNewParents } = updateArtboardAssociation(movedElements, liveElements);

      const initial = initialGroupState ? initialGroupState.elements : (startElements || []).map(s => s.element || s);
      if (haveElementsChanged(initial, elementsWithNewParents.filter(el => initial.some(i => i.id === el.id)))) {
        commit(elementsWithNewParents);
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
    setHighlightedArtboardId(null);
    setSnapLines([]);
  }, [canvasRef, elements, selectionRect, commit, setSelectedElementIds, setActiveGroupBoundingBox, setSnapLines]);

  return {
    hoveredElementId,
    highlightedArtboardId,
    setHighlightedArtboardId,
    selectionRect,
    selectionBox,
    groupRotation,
    interactionState,
    snapLines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
