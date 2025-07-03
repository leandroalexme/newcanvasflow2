import { getAxisAlignedBoundingBox, isPointInsideRotatedBox, getIntersectionArea } from "../../core/geometry";

/**
 * Finds the artboard that currently contains the largest area of the given element.
 * @param {object} element - The element to check.
 * @param {Array<object>} artboards - A list of all artboard elements.
 * @returns {string|null} The ID of the artboard with the largest intersection, or null if none.
 */
const findParentArtboard = (element, artboards) => {
    let bestFit = null;
    let maxIntersection = 0;

    const elementBounds = getAxisAlignedBoundingBox([element]);
    const elementArea = elementBounds.width * elementBounds.height;

    artboards.forEach(artboard => {
        const artboardBounds = { x: artboard.x, y: artboard.y, width: artboard.width, height: artboard.height };
        const intersection = getIntersectionArea(elementBounds, artboardBounds);

        if (intersection > 0 && intersection > maxIntersection) {
            maxIntersection = intersection;
            bestFit = artboard.id;
        }
    });

    // If the element is more than 50% on an artboard, it belongs to it.
    if (maxIntersection / elementArea > 0.5) {
        return bestFit;
    }

  return null;
}

/**
 * Finds the artboard to be highlighted when an element is dragged over it.
 * @param {Array<object>} movedElements - The elements being moved.
 * @param {Array<object>} allElements - The full list of all elements in the scene.
 * @returns {string|null} The ID of the artboard to highlight.
 */
export const getArtboardHighlight = (movedElements, allElements) => {
  if (movedElements.length === 0) {
    return null;
  }
  const artboards = allElements.filter(el => el.type === 'artboard');
  const primaryDraggedElement = movedElements[0];
  return findParentArtboard(primaryDraggedElement, artboards);
};

/**
 * Updates the parent artboard for a list of elements being moved.
 * @param {Array<object>} movedElements - The elements being moved.
 * @param {Array<object>} allElements - The full list of all elements in the scene.
 * @returns {{updatedElements: Array<object>}}
 */
export const updateArtboardAssociation = (movedElements, allElements) => {
  const artboards = allElements.filter(el => el.type === 'artboard');
    
    // Update parent for all moved elements
  const updatedElements = allElements.map(el => {
        if (movedElements.some(movedEl => movedEl.id === el.id)) {
            // Find the best new artboard for this element
            const bestArtboardId = findParentArtboard(el, artboards);
            return { ...el, parentId: bestArtboardId };
    }
    return el;
  });

  return { updatedElements };
};

/**
 * Finds the best artboard for a given element based on intersection area.
 * @param {object} element - The element to find the best artboard for.
 * @param {Array<object>} artboards - The list of all artboards.
 * @returns {string|null} The ID of the artboard with the largest intersection, or null if none.
 */
const findBestArtboardForElement = (element, artboards) => {
  let bestArtboardId = null;
  let maxArea = 0;

  const elementBounds = getAxisAlignedBoundingBox([element]);

  artboards.forEach(artboard => {
    const artboardBounds = {
      x: artboard.x,
      y: artboard.y,
      width: artboard.width,
      height: artboard.height
    };
    const intersectionArea = getIntersectionArea(elementBounds, artboardBounds);

    if (intersectionArea > maxArea) {
      maxArea = intersectionArea;
      bestArtboardId = artboard.id;
    }
  });

  return bestArtboardId;
};

/**
 * Processes the initial list of elements to set their parent artboard and opacity.
 * @param {Array<object>} elements - The initial list of elements.
 * @returns {Array<object>} The processed list of elements with correct parentId and opacity.
 */
export const initializeElementParents = (elements) => {
  const artboards = elements.filter(el => el.type === 'artboard');
  return elements.map(element => {
    // Se for um artboard, retorne-o imediatamente sem alterações.
    if (element.type === 'artboard') {
      return element;
    }

    // Se o elemento já tiver um pai válido, mantenha-o.
    if (element.parentId && elements.some(a => a.id === element.parentId)) {
        return element;
    }
    
    // Para outros elementos, encontre e atribua o artboard pai.
    return {
      ...element,
      parentId: findBestArtboardForElement(element, artboards)
    };
  });
}; 