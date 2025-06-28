import { isPointInRect, getElementCenter } from '../utils/geometry';

/**
 * Encontra o artboard que está sob o centro de um elemento.
 * @param {object} element - O elemento sendo verificado.
 * @param {Array<object>} artboards - A lista de todos os artboards.
 * @returns {object|null} O artboard encontrado ou nulo.
 */
const getArtboardUnderElement = (element, artboards) => {
  const center = getElementCenter(element);
  // Itera de trás para frente para pegar o de cima, caso haja sobreposição.
  for (let i = artboards.length - 1; i >= 0; i--) {
    const artboard = artboards[i];
    if (isPointInRect(center, artboard)) {
      return artboard;
    }
  }
  return null;
};

/**
 * Atualiza a associação de elementos com artboards durante o arraste.
 * @param {Array<object>} draggedElements - Os elementos sendo arrastados.
 * @param {Array<object>} allElements - A lista completa de todos os elementos.
 * @returns {{updatedElements: Array<object>, highlightedArtboardId: string|null}}
 */
export const updateArtboardAssociation = (draggedElements, allElements) => {
  let highlightedArtboardId = null;
  const artboards = allElements.filter(el => el.type === 'artboard');
  const draggedElementIds = new Set(draggedElements.map(el => el.id));

  // O elemento principal sendo arrastado determinará a associação.
  const primaryDraggedElement = draggedElements[0];
  if (!primaryDraggedElement || primaryDraggedElement.type === 'artboard') {
    return { updatedElements: allElements, highlightedArtboardId };
  }

  const targetArtboard = getArtboardUnderElement(primaryDraggedElement, artboards);
  highlightedArtboardId = targetArtboard ? targetArtboard.id : null;

  const updatedElements = allElements.map(el => {
    // Só atualiza os elementos que estão sendo arrastados.
    if (draggedElementIds.has(el.id)) {
      return { ...el, parentId: highlightedArtboardId };
    }
    return el;
  });

  return { updatedElements, highlightedArtboardId };
}; 