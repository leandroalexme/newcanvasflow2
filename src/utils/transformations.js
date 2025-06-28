import { rotatePoint, getElementCenter } from './geometry';

/**
 * Translada (move) um conjunto de elementos.
 * @param {Array<object>} elements - A lista completa de elementos do canvas.
 * @param {Array<object>} startElements - O estado dos elementos no início do arraste.
 * @param {number} dx - A mudança no eixo X.
 * @param {number} dy - A mudança no eixo Y.
 * @returns {Array<object>} A nova lista de elementos com as posições atualizadas.
 */
export const translateElements = (elements, startElements, dx, dy) => {
  // Usar um Map para lookups O(1) melhora drasticamente a performance
  // em vez de usar find() dentro de um map(), que é O(n*m).
  const startPositions = new Map(
    startElements.map(el => [el.id, { x: el.x, y: el.y }])
  );

  return elements.map(el => {
    const startPos = startPositions.get(el.id);
    if (startPos) {
      return { ...el, x: startPos.x + dx, y: startPos.y + dy };
    }
    return el;
  });
};

/**
 * Rotaciona um único elemento.
 * @param {object} element - O elemento a ser rotacionado.
 * @param {{x: number, y: number}} center - O centro de rotação do elemento.
 * @param {number} startAngle - O ângulo inicial no momento do clique.
 * @param {{x: number, y: number}} worldPos - A posição atual do mouse no mundo.
 * @param {boolean} isShiftPressed - Se deve ajustar a rotação para ângulos pré-definidos (ex: 15 graus).
 * @returns {object} O elemento com a rotação atualizada.
 */
export const rotateElement = (element, center, startAngle, worldPos, isShiftPressed) => {
  const currentAngle = Math.atan2(worldPos.y - center.y, worldPos.x - center.x);
  const initialRotation = element.rotation || 0;
  let newAngle = initialRotation + (currentAngle - element.startAngle);

  if (isShiftPressed) {
    const snapAngle = 15 * (Math.PI / 180); // Snap de 15 graus
    newAngle = Math.round(newAngle / snapAngle) * snapAngle;
  }

  return { ...element, rotation: newAngle };
};

/**
 * Redimensiona um único elemento (ou uma caixa delimitadora) com base na alça arrastada.
 * @param {object} element - O elemento a ser redimensionado.
 * @param {{x: number, y: number}} pivot - O ponto de pivô (o canto oposto à alça).
 * @param {{x: number, y: number}} worldPos - A posição atual do mouse.
 * @param {string} handleType - A alça que está sendo arrastada (ex: 'se', 'nw').
 * @returns {object} O elemento com as novas dimensões e posição.
 */
export const resizeElement = (
  element,
  pivot,
  worldPos,
  handleType,
  isShiftPressed = false,
  isCtrlPressed = false
) => {
  // --- 0. Setup ---
  const { rotation = 0 } = element;
  const originalWidth = element.type === 'circle' ? (element.radiusX || element.radius) * 2 : element.width;
  const originalHeight = element.type === 'circle' ? (element.radiusY || element.radius) * 2 : element.height;
  const aspectRatio = originalWidth > 0 && originalHeight > 0 ? originalWidth / originalHeight : 1;

  const elementCenter = getElementCenter(element);

  const localMouse = rotatePoint(worldPos, elementCenter, -rotation);
  const isCornerHandle = !handleType.includes('middle') && !handleType.includes('center');
  const isHorizontalSideHandle = handleType === 'middle-left' || handleType === 'middle-right';
  const isVerticalSideHandle = handleType === 'top-center' || handleType === 'bottom-center';

  let finalWidth, finalHeight, localNewCenter;

  // --- PATH A: Resize from Center (Ctrl/Cmd is pressed) ---
  if (isCtrlPressed) {
    let w, h;
    // 1. Calculate base dimensions (2x distance from center to mouse), respecting the handle type
    if (isCornerHandle) {
      w = Math.abs(localMouse.x - elementCenter.x) * 2;
      h = Math.abs(localMouse.y - elementCenter.y) * 2;
    } else if (isHorizontalSideHandle) {
      w = Math.abs(localMouse.x - elementCenter.x) * 2;
      h = originalHeight;
    } else { // isVerticalSideHandle
      w = originalWidth;
      h = Math.abs(localMouse.y - elementCenter.y) * 2;
    }

    // 2. Apply proportional constraint (Shift)
    if (isShiftPressed) {
      if (isCornerHandle) {
        if (w / aspectRatio > h) h = w / aspectRatio;
        else w = h * aspectRatio;
      } else if (isHorizontalSideHandle) {
        h = w / aspectRatio;
      } else { // isVerticalSideHandle
        w = h * aspectRatio;
      }
    }

    finalWidth = w;
    finalHeight = h;
    localNewCenter = elementCenter; // Center is always fixed

  } else {
    // --- PATH B: Resize from Pivot (No Ctrl/Cmd) ---
    const localPivot = rotatePoint(pivot, elementCenter, -rotation);

    let w, h;
    // 1. Calculate base dimensions (distance from pivot to mouse), respecting the handle type
    if (isCornerHandle) {
      w = Math.abs(localMouse.x - localPivot.x);
      h = Math.abs(localMouse.y - localPivot.y);
    } else if (isHorizontalSideHandle) {
      w = Math.abs(localMouse.x - localPivot.x);
      h = originalHeight;
    } else { // isVerticalSideHandle
      w = originalWidth;
      h = Math.abs(localMouse.y - localPivot.y);
    }

    // 2. Apply proportional constraint (Shift)
    if (isShiftPressed) {
      if (isCornerHandle) {
        if (w / aspectRatio > h) h = w / aspectRatio;
        else w = h * aspectRatio;
      } else if (isHorizontalSideHandle) {
        h = w / aspectRatio;
      } else { // isVerticalSideHandle
        w = h * aspectRatio;
      }
    }

    finalWidth = w;
    finalHeight = h;

    // 3. Calculate new center based on pivot, respecting the handle type and flipping
    const effectiveSignX = localMouse.x < localPivot.x ? -1 : 1;
    const effectiveSignY = localMouse.y < localPivot.y ? -1 : 1;

    if (isCornerHandle) {
      const newCorner = { x: localPivot.x + effectiveSignX * finalWidth, y: localPivot.y + effectiveSignY * finalHeight };
      localNewCenter = { x: (newCorner.x + localPivot.x) / 2, y: (newCorner.y + localPivot.y) / 2 };
    } else if (isHorizontalSideHandle) {
      const newCornerX = localPivot.x + effectiveSignX * finalWidth;
      localNewCenter = { x: (newCornerX + localPivot.x) / 2, y: localPivot.y };
    } else { // isVerticalSideHandle
      const newCornerY = localPivot.y + effectiveSignY * finalHeight;
      localNewCenter = { x: localPivot.x, y: (newCornerY + localPivot.y) / 2 };
    }
  }

  // --- 4. Finalize and Return ---
  if (!finalWidth || finalWidth <= 0 || !finalHeight || finalHeight <= 0) {
    return element;
  }

  const newWorldCenter = rotatePoint(localNewCenter, elementCenter, rotation);

  if (element.type === 'rect' || element.type === 'group') {
    return { ...element, x: newWorldCenter.x - finalWidth / 2, y: newWorldCenter.y - finalHeight / 2, width: finalWidth, height: finalHeight };
  }
  if (element.type === 'circle') {
    return { ...element, x: newWorldCenter.x, y: newWorldCenter.y, radiusX: finalWidth / 2, radiusY: finalHeight / 2 };
  }

  return element;
};

/**
 * Rotaciona um grupo de elementos em torno de um centro comum.
 * @param {Array<object>} elements - A lista completa de elementos.
 * @param {Array<string>} selectedElementIds - Os IDs dos elementos a serem rotacionados.
 * @param {{x: number, y: number}} groupCenter - O centro da caixa delimitadora do grupo.
 * @param {number} newAngle - O novo ângulo de rotação absoluto para o grupo.
 * @param {object} initialGroupState - O estado do grupo no início da rotação.
 * @returns {Array<object>} A nova lista de elementos com posições e rotações atualizadas.
 */
export const transformGroup_rotate = (elements, selectedElementIds, groupCenter, newAngle, initialGroupState) => {
  const initialAngle = initialGroupState.rotation || 0;
  const angleDelta = newAngle - initialAngle;
  const { boundingBox: initialBoundingBox } = initialGroupState;

  const updatedElements = elements.map(el => {
    if (!selectedElementIds.includes(el.id)) {
      return el;
    }

    const initialElement = initialGroupState.elements.find(e => e.id === el.id);
    if (!initialElement) return el;

    const elementCenter = {
      x: initialElement.x + (initialElement.width ? initialElement.width / 2 : 0),
      y: initialElement.y + (initialElement.height ? initialElement.height / 2 : 0),
    };

    const rotatedCenter = rotatePoint(elementCenter, groupCenter, angleDelta);

    return {
      ...el,
      x: rotatedCenter.x - (el.width ? el.width / 2 : 0),
      y: rotatedCenter.y - (el.height ? el.height / 2 : 0),
      rotation: (initialElement.rotation || 0) + angleDelta,
    };
  });

  // Calcula a nova bounding box rotacionada para o grupo
  const initialBoxCenter = {
    x: initialBoundingBox.x + initialBoundingBox.width / 2,
    y: initialBoundingBox.y + initialBoundingBox.height / 2,
  };
  const newBoxCenter = rotatePoint(initialBoxCenter, groupCenter, angleDelta);

  const newBoundingBox = {
    ...initialBoundingBox,
    x: newBoxCenter.x - initialBoundingBox.width / 2,
    y: newBoxCenter.y - initialBoundingBox.height / 2,
    rotation: newAngle,
  };

  return { updatedElements, newBoundingBox };
};

/**
 * Redimensiona um grupo de elementos proporcionalmente com base em uma nova caixa delimitadora.
 * @param {Array<object>} elements - A lista completa de elementos.
 * @param {Array<string>} selectedElementIds - Os IDs dos elementos a serem redimensionados.
 * @param {object} newBoundingBox - A nova caixa delimitadora do grupo.
 * @param {object} initialGroupState - O estado do grupo no início do redimensionamento.
 * @returns {Array<object>} A nova lista de elementos com posições e tamanhos atualizados.
 */
export const transformGroup_resize = (elements, selectedElementIds, newBoundingBox, initialGroupState) => {
  const { boundingBox: initialBoundingBox } = initialGroupState;
  const { rotation: initialRotation = 0 } = initialBoundingBox;
  const { rotation: newRotation = 0 } = newBoundingBox;

  const scaleX = initialBoundingBox.width ? newBoundingBox.width / initialBoundingBox.width : 1;
  const scaleY = initialBoundingBox.height ? newBoundingBox.height / initialBoundingBox.height : 1;

  const initialCenter = {
    x: initialBoundingBox.x + initialBoundingBox.width / 2,
    y: initialBoundingBox.y + initialBoundingBox.height / 2,
  };
  const newCenter = {
    x: newBoundingBox.x + newBoundingBox.width / 2,
    y: newBoundingBox.y + newBoundingBox.height / 2,
  };

  return elements.map(el => {
    if (!selectedElementIds.includes(el.id)) {
      return el;
    }

    const initialElement = initialGroupState.elements.find(e => e.id === el.id);
    if (!initialElement) return el;

    const initialElCenter = {
      x: initialElement.x + (initialElement.width ? initialElement.width / 2 : 0),
      y: initialElement.y + (initialElement.height ? initialElement.height / 2 : 0),
    };

    const worldVector = {
      x: initialElCenter.x - initialCenter.x,
      y: initialElCenter.y - initialCenter.y,
    };

    const localVector = rotatePoint(worldVector, { x: 0, y: 0 }, -initialRotation);

    const scaledLocalVector = {
      x: localVector.x * scaleX,
      y: localVector.y * scaleY,
    };

    const newWorldVector = rotatePoint(scaledLocalVector, { x: 0, y: 0 }, newRotation);

    const newElCenter = {
      x: newCenter.x + newWorldVector.x,
      y: newCenter.y + newWorldVector.y,
    };

    const rotationDelta = newRotation - initialRotation;

    if (el.type === 'rect') {
      const newElWidth = initialElement.width * scaleX;
      const newElHeight = initialElement.height * scaleY;
      return {
        ...el,
        x: newElCenter.x - newElWidth / 2,
        y: newElCenter.y - newElHeight / 2,
        width: newElWidth,
        height: newElHeight,
        rotation: (initialElement.rotation || 0) + rotationDelta,
      };
    } else if (el.type === 'circle') {
      const newRadiusX = (initialElement.radiusX || initialElement.radius) * scaleX;
      const newRadiusY = (initialElement.radiusY || initialElement.radius) * scaleY;
      return {
        ...el,
        x: newElCenter.x,
        y: newElCenter.y,
        radiusX: newRadiusX,
        radiusY: newRadiusY,
        rotation: (initialElement.rotation || 0) + rotationDelta,
      };
    }

    return el;
  });
};
