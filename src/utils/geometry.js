// src/utils/geometry.js

/**
 * Calculates the center of a given element based on its type.
 * @param {object} element - The element object.
 * @returns {{x: number, y: number}} The center coordinates.
 */
export const getElementCenter = (element) => {
  if (!element) return { x: 0, y: 0 };

  const { type, x, y, width, height } = element;

  switch (type) {
    case 'rectangle':
    case 'ellipse':
    case 'text':
      return { x: x + width / 2, y: y + height / 2 };
    case 'circle':
      return { x, y }; // For circles, x/y is the center
    default:
      // Generic fallback for elements with width/height
      if (width !== undefined && height !== undefined) {
        return { x: x + width / 2, y: y + height / 2 };
      }
      return { x, y };
  }
};

const HANDLE_SIZE = 20;
const ROTATION_HANDLE_OFFSET = 30; // Distância da alça de rotação da borda

/**
 * Rotaciona um ponto em torno de um ponto central.
 * @param {{x: number, y: number}} point - O ponto a ser rotacionado.
 * @param {{x: number, y: number}} center - O centro da rotação.
 * @param {number} angle - O ângulo de rotação em radianos.
 * @returns {{x: number, y: number}} O novo ponto rotacionado.
 */
/**
 * Rotaciona um ponto em torno de um centro por um dado ângulo.
 * @param {{x: number, y: number}} point - O ponto a ser rotacionado.
 * @param {{x: number, y: number}} center - O centro da rotação.
 * @param {number} angle - O ângulo de rotação em radianos.
 * @returns {{x: number, y: number}} O novo ponto rotacionado.
 */
export const rotatePoint = (point, center, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};

/**
 * Gera a lista de alças de transformação para um dado elemento.
 * @param {object} element - O elemento para o qual gerar as alças.
 * @param {{x: number, y: number}} offset - O deslocamento do canvas (não usado atualmente, mas pode ser útil).
 * @param {number} scale - O fator de zoom para dimensionar as alças.
 * @returns {Array<object>} Uma lista de objetos de alça, cada um com posição, tipo e cursor.
 */
export const getHandles = (element, offset, scale) => {
  if (!element) return {};

  const rotation = element.rotation || 0;
  const center = getElementCenter(element);
  let unrotatedHandles;

  if (element.type === 'rect' || element.type === 'group') {
    const { x, y, width, height } = element;


    const p = {
      tl: { x: x, y: y },
      tc: { x: x + width / 2, y: y },
      tr: { x: x + width, y: y },
      ml: { x: x, y: y + height / 2 },
      mr: { x: x + width, y: y + height / 2 },
      bl: { x: x, y: y + height },
      bc: { x: x + width / 2, y: y + height },
      br: { x: x + width, y: y + height },
    };

    unrotatedHandles = {
      'top-left': { ...p.tl, pivot: p.br },
      'top-center': { ...p.tc, pivot: p.bc },
      'top-right': { ...p.tr, pivot: p.bl },
      'middle-left': { ...p.ml, pivot: p.mr },
      'middle-right': { ...p.mr, pivot: p.ml },
      'bottom-left': { ...p.bl, pivot: p.tr },
      'bottom-center': { ...p.bc, pivot: p.tc },
      'bottom-right': { ...p.br, pivot: p.tl },
      'rotation': { x: p.tc.x, y: p.tc.y - ROTATION_HANDLE_OFFSET, pivot: center },
    };

  } else if (element.type === 'circle') {
    // Para círculos, as alças são baseadas na sua caixa delimitadora (bounding box).
    const radiusX = element.radiusX || element.radius;
    const radiusY = element.radiusY || element.radius;
    const x = element.x - radiusX;
    const y = element.y - radiusY;
    const width = radiusX * 2;
    const height = radiusY * 2;

    const p = {
      tl: { x: x, y: y },
      tc: { x: x + width / 2, y: y },
      tr: { x: x + width, y: y },
      ml: { x: x, y: y + height / 2 },
      mr: { x: x + width, y: y + height / 2 },
      bl: { x: x, y: y + height },
      bc: { x: x + width / 2, y: y + height },
      br: { x: x + width, y: y + height },
    };

    unrotatedHandles = {
      'top-left': { ...p.tl, pivot: p.br },
      'top-center': { ...p.tc, pivot: p.bc },
      'top-right': { ...p.tr, pivot: p.bl },
      'middle-left': { ...p.ml, pivot: p.mr },
      'middle-right': { ...p.mr, pivot: p.ml },
      'bottom-left': { ...p.bl, pivot: p.tr },
      'bottom-center': { ...p.bc, pivot: p.tc },
      'bottom-right': { ...p.br, pivot: p.tl },
      'rotation': { x: p.tc.x, y: p.tc.y - ROTATION_HANDLE_OFFSET, pivot: center },
    };

  }

  if (!unrotatedHandles) return {};

  const handles = {};
  for (const type in unrotatedHandles) {
    const point = unrotatedHandles[type];
    const rotatedPoint = rotatePoint(point, center, rotation);
    const rotatedPivot = point.pivot ? rotatePoint(point.pivot, center, rotation) : undefined;

    handles[type] = {
      type: type,
      pivot: rotatedPivot,
      x: rotatedPoint.x,
      y: rotatedPoint.y,
    };
  }

  return handles;
};

/**
 * Calcula a caixa delimitadora (bounding box) de um único elemento, considerando sua rotação.
 * @param {object} element - O elemento (retângulo ou círculo).
 * @returns {{x: number, y: number, width: number, height: number}} A caixa delimitadora não rotacionada que envolve o elemento.
 */
export const getElementBoundingBox = (element) => {
  const { x, y, width, height, type, radius, radiusX, radiusY, rotation = 0 } = element;

  if (type === 'rect') {
    if (!rotation || rotation === 0) {
      return { x, y, width, height };
    }
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const center = { x: centerX, y: centerY };
    const points = [
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x + width, y: y + height },
      { x: x, y: y + height }
    ].map(p => rotatePoint(p, center, rotation));
    
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  if (type === 'circle') {
    const rX = radiusX || radius;
    const rY = radiusY || radius;
    
    if (!rotation || rotation === 0) {
      return { x: x - rX, y: y - rY, width: 2 * rX, height: 2 * rY };
    }

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const w = Math.sqrt(rX * rX * cos * cos + rY * rY * sin * sin);
    const h = Math.sqrt(rX * rX * sin * sin + rY * rY * cos * cos);

    return { x: x - w, y: y - h, width: 2 * w, height: 2 * h };
  }

  // Default case for unknown types
  return { x: 0, y: 0, width: 0, height: 0 };
};

/**
 * Calcula a caixa delimitadora que envolve um grupo de elementos.
 * @param {Array<object>} elements - A lista de elementos selecionados.
 * @returns {{x: number, y: number, width: number, height: number, type: string, rotation: number}} A caixa delimitadora do grupo.
 */
// Função auxiliar interna. A ÚNICA fonte da verdade para o cálculo de vértices de elementos.
const _getElementCorners = (element) => {
    const { type, x, y, width, height, radius, radiusX, radiusY, rotation = 0 } = element;
    let corners;

    if (type === 'rect') {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const center = { x: centerX, y: centerY };
        corners = [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
        ];
        return corners.map(corner => rotatePoint(corner, center, rotation));
    }

    if (type === 'circle') {
        const rX = radiusX || radius;
        const rY = radiusY || radius;
        const center = { x, y };
        corners = [
            { x: x - rX, y: y - rY },
            { x: x + rX, y: y - rY },
            { x: x + rX, y: y + rY },
            { x: x - rX, y: y + rY },
        ];
        // Para uma elipse, os cantos da caixa delimitadora também precisam ser rotacionados.
        return corners.map(corner => rotatePoint(corner, center, rotation));
    }

    return []; // Retorna um array vazio para tipos desconhecidos.
};

const _getBoundingBoxFromPoints = (points) => {
  if (!points || points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const calculateGroupSelectionBox = (elements, forcedAngle = null) => {
  if (!elements || elements.length <= 1) return null;

  // Usa a fonte única da verdade
  const allVertices = elements.flatMap(_getElementCorners);

  const candidateAngles = forcedAngle !== null 
    ? [forcedAngle] 
    : [...new Set(elements.map(el => el.rotation || 0))];

  if (forcedAngle === null && !candidateAngles.includes(0)) {
    candidateAngles.push(0);
  }

  let bestAngle = 0;
  let minArea = Infinity;
  let bestBoundingBox = null;

  for (const angle of candidateAngles) {
    const rotatedVertices = allVertices.map(vertex => rotatePoint(vertex, { x: 0, y: 0 }, -angle));
    const boundingBox = _getBoundingBoxFromPoints(rotatedVertices);
    const area = boundingBox.width * boundingBox.height;

    if (area < minArea) {
      minArea = area;
      bestAngle = angle;
      bestBoundingBox = boundingBox;
    }
  }

  const boxCenter = {
    x: bestBoundingBox.x + bestBoundingBox.width / 2,
    y: bestBoundingBox.y + bestBoundingBox.height / 2,
  };

  const finalCenter = rotatePoint(boxCenter, { x: 0, y: 0 }, bestAngle);

  return {
    x: finalCenter.x - bestBoundingBox.width / 2,
    y: finalCenter.y - bestBoundingBox.height / 2,
    width: bestBoundingBox.width,
    height: bestBoundingBox.height,
    rotation: bestAngle,
    type: 'group',
  };
};

export const isPointInsideRotatedBox = (point, box) => {
  const center = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };

  // Rotaciona o ponto na direção oposta à rotação da caixa
  const rotatedPoint = rotatePoint(point, center, -(box.rotation || 0));

  // Agora, podemos fazer uma verificação de caixa delimitadora alinhada ao eixo
  const halfWidth = box.width / 2;
  const halfHeight = box.height / 2;

  return (
    rotatedPoint.x >= center.x - halfWidth &&
    rotatedPoint.x <= center.x + halfWidth &&
    rotatedPoint.y >= center.y - halfHeight &&
    rotatedPoint.y <= center.y + halfHeight
  );
};

export const getAxisAlignedBoundingBox = (elements) => {
  if (!elements || elements.length === 0) {
    return null;
  }

  const allPoints = elements.flatMap(el => _getElementCorners(el));
  const box = _getBoundingBoxFromPoints(allPoints);

  return {
    ...box,
    type: 'group',
    rotation: 0, // A caixa delimitadora geral é sempre alinhada aos eixos.
  };
};

/**
 * Verifica se a caixa delimitadora de um elemento cruza uma área de seleção retangular.
 * @param {object} element - O elemento a ser verificado.
 * @param {object} selectionRect - O retângulo de seleção.
 * @returns {boolean} Verdadeiro se houver interseção, falso caso contrário.
 */
export const isElementIntersectingSelection = (element, selectionRect) => {
  const elementBounds = getElementBoundingBox(element);
  if (!elementBounds) return false;

  const normalizedSelection = {
    x: selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x,
    y: selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y,
    width: Math.abs(selectionRect.width),
    height: Math.abs(selectionRect.height),
  };

  // Verificação de interseção AABB (Axis-Aligned Bounding Box)
  return (
    elementBounds.x < normalizedSelection.x + normalizedSelection.width &&
    elementBounds.x + elementBounds.width > normalizedSelection.x &&
    elementBounds.y < normalizedSelection.y + normalizedSelection.height &&
    elementBounds.y + elementBounds.height > normalizedSelection.y
  );
};

/**
 * Verifica se um ponto está dentro de um retângulo (usado para as alças).
 * @param {{x: number, y: number}} point - O ponto a ser verificado.
 * @param {{x: number, y: number, width: number, height: number}} rect - O retângulo.
 * @returns {boolean}
 */
export const isPointInRect = (point, rect) => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

/**
 * Verifica se um ponto está dentro de um elemento retangular rotacionado.
 * @param {{x: number, y: number}} point - O ponto do clique.
 * @param {object} element - O elemento com x, y, width, height e rotation.
 * @returns {boolean}
 */
export const isPointInRotatedRect = (point, element) => {
  const { x, y, width, height, rotation } = element;
  const center = { x: x + width / 2, y: y + height / 2 };

  // Rotaciona o ponto na direção oposta do retângulo para alinhar os eixos
  const rotatedPointX = Math.cos(-rotation) * (point.x - center.x) - Math.sin(-rotation) * (point.y - center.y) + center.x;
  const rotatedPointY = Math.sin(-rotation) * (point.x - center.x) + Math.cos(-rotation) * (point.y - center.y) + center.y;

  // Verifica se o ponto rotacionado está dentro do retângulo não rotacionado
  return rotatedPointX >= x && rotatedPointX <= x + width &&
         rotatedPointY >= y && rotatedPointY <= y + height;
};

/**
 * Verifica se um ponto está dentro de um círculo.
 * @param {{x: number, y: number}} point - O ponto a ser verificado.
 * @param {object} circle - O elemento círculo com x, y, e radius.
 * @returns {boolean}
 */
export const isPointInCircle = (point, circle) => {
  const { x, y, radius, rotation = 0 } = circle;
  const radiusX = circle.radiusX || radius;
  const radiusY = circle.radiusY || radius;

  // Transforma o ponto para o sistema de coordenadas local da elipse (não rotacionado)
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const dx = point.x - x;
  const dy = point.y - y;

  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  // Verifica se o ponto local está dentro da elipse não rotacionada
  // (x/a)^2 + (y/b)^2 <= 1
  return (localX * localX) / (radiusX * radiusX) + (localY * localY) / (radiusY * radiusY) <= 1;
};

/**
 * Converte coordenadas da tela (viewport) para coordenadas do mundo (canvas).
 * @param {{x: number, y: number}} point - O ponto na tela.
 * @param {{x: number, y: number}} offset - O deslocamento atual do canvas.
 * @param {number} scale - O fator de zoom atual.
 * @returns {{x: number, y: number}} O ponto correspondente no mundo.
 */
export const getPointInWorld = (point, offset, scale) => ({
  x: (point.x - offset.x) / scale,
  y: (point.y - offset.y) / scale,
});

/**
 * Encontra o elemento de mais alta ordem (último no array) que foi clicado.
 * @param {{x: number, y: number}} worldPos - A posição do clique nas coordenadas do mundo.
 * @param {Array<object>} elements - A lista de todos os elementos no canvas.
 * @returns {object|null} O elemento clicado ou nulo se nenhum foi encontrado.
 */
export const getClickedElement = (worldPos, elements) => {
  // Itera de trás para frente para checar os elementos renderizados por último primeiro
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    let hit = false;
    switch (element.type) {
      case 'rect':
        hit = isPointInRotatedRect(worldPos, element);
        break;
      case 'circle':
        hit = isPointInCircle(worldPos, element);
        break;
      default:
        break;
    }

    if (hit) {
      return element;
    }
  }
  return null;
};

/**
 * Verifica se um clique atingiu uma das alças de transformação de um elemento.
 * @param {{x: number, y: number}} worldPos - A posição do clique nas coordenadas do mundo.
 * @param {object} element - O elemento selecionado (ou a caixa delimitadora do grupo).
 * @returns {object|null} A alça atingida ou nulo.
 */
export const getHandleAtPoint = (worldPos, element, scale) => {
  if (!element) return null;

  const handles = getHandles(element);
  // A hitbox é maior que o handle visual e ajustada pelo zoom.
  // Isso cria uma margem de clique consistente em qualquer nível de zoom.
  const hitboxSize = (HANDLE_SIZE + 4) / scale; // Aumenta a área de clique em 4px e ajusta pelo zoom

  for (const type in handles) {
    const handle = handles[type];
    const handleRect = {
      x: handle.x - hitboxSize / 2,
      y: handle.y - hitboxSize / 2,
      width: hitboxSize,
      height: hitboxSize,
    };

    if (isPointInRect(worldPos, handleRect)) {
      let cursor = 'default';
      // O cálculo do cursor pode ser simplificado ou movido para getHandles se ficar complexo.
      switch (type) {
        case 'top-left': case 'bottom-right': cursor = 'nwse-resize'; break;
        case 'top-right': case 'bottom-left': cursor = 'nesw-resize'; break;
        case 'top-center': case 'bottom-center': cursor = 'ns-resize'; break;
        case 'middle-left': case 'middle-right': cursor = 'ew-resize'; break;
        case 'rotation': cursor = 'grab'; break;
        default: break;
      }
      return { ...handles[type], type, cursor };
    }
  }
  return null;
};

// --- Vector Math Utilities for Rotated Resizing ---

// Roda um ponto (vetor) em torno de uma origem (0,0) por um ângulo
export const rotateVector = (vector, angle) => ({
  x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
  y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
});

// Subtrai dois vetores (p2 - p1)
export const subtractVectors = (p1, p2) => ({
  x: p2.x - p1.x,
  y: p2.y - p1.y,
});

// Adiciona dois vetores
export const addVectors = (p1, p2) => {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
};

/**
 * Obtém as coordenadas do mouse relativas ao elemento canvas.
 * @param {MouseEvent} event - O evento do mouse.
 * @param {HTMLCanvasElement} canvas - O elemento canvas.
 * @returns {{x: number, y: number}} As coordenadas x e y do mouse no canvas.
 */
export const getMousePosition = (event, canvas) => {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};
