import { getClickedElement, isPointInsideRotatedBox, calculateGroupSelectionBox } from '../utils/geometry';
import * as ActionHandler from '../utils/actionHandlers';

// Helper para clonar profundamente, garantindo que não haja referências presas.
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Tenta iniciar a interação de arrastar um ou mais elementos.
 * @param {object} context - O contexto da interação.
 * @returns {object|null} O estado da interação se o arrasto for iniciado, caso contrário, nulo.
 */
export const tryStartDragging = (context) => {
  const { worldPos, selectionBox, elements, selectedElementIds, event, setSelectedElementIds, canvas, setSelectionRect } = context;

  const clickedElement = getClickedElement(worldPos, elements);

  // A condição para iniciar o arrasto é clicar em um elemento ou na caixa de seleção de um grupo.
  if (!clickedElement && !(selectionBox && isPointInsideRotatedBox(worldPos, selectionBox))) {
    return null;
  }

  // Caso 1: Shift-click para selecionar/deselecionar. Apenas seleciona, não inicia o arrasto.
  if (clickedElement && event.shiftKey) {
    const newSelection = selectedElementIds.includes(clickedElement.id)
      ? selectedElementIds.filter(id => id !== clickedElement.id)
      : [...selectedElementIds, clickedElement.id];
    setSelectedElementIds(newSelection);
    return { handler: null, data: {} }; // Indica que a interação deve parar aqui.
  }

  // Se chegamos aqui, uma ação de arrastar VAI acontecer.
  const isNewSelection = clickedElement && !selectedElementIds.includes(clickedElement.id);
  
  const elementsToDrag = isNewSelection
    ? [clickedElement]
    : elements.filter(el => selectedElementIds.includes(el.id));

  if (elementsToDrag.length === 0) {
    // Caso raro: clicou dentro de uma caixa de seleção "fantasma" de um grupo que foi esvaziado.
    // Inicia uma seleção por marquee como fallback.
    if (!clickedElement) {
       setSelectionRect({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
       return { 
         handler: ActionHandler.handleSelecting, 
         data: { type: 'selecting', startWorldPoint: worldPos }
       };
    }
    return null;
  }
  
  // Se for uma nova seleção, atualiza o estado para a próxima renderização.
  if (isNewSelection) {
    setSelectedElementIds([clickedElement.id]);
  }

  // Prepara o estado para a ação de arrastar.
  canvas.style.cursor = 'move';
  
  // Correção-chave: Se for uma nova seleção, calcula a caixa de interação
  // imediatamente, em vez de depender do `selectionBox` do estado anterior.
  const interactionBox = isNewSelection
    ? calculateGroupSelectionBox(elementsToDrag)
    : selectionBox;

  let initialGroupState = null;
  if (interactionBox) {
    initialGroupState = { elements: deepClone(elementsToDrag), boundingBox: interactionBox };
  }

  return {
    handler: ActionHandler.handleDragging,
    data: {
      type: 'dragging',
      startWorldPoint: worldPos,
      lastWorldPos: worldPos,
      startElements: deepClone(elementsToDrag),
      initialGroupState,
      interactionBox,
      liveElements: deepClone(elements),
    },
  };
};
