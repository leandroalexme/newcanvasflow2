import { getHandles, rotatePoint } from './geometry';
import { drawArtboard } from '../artboard/artboardRenderer';

const drawElement = (context, element, selectedElementIds, hoveredElementId, highlightedArtboardId, scale) => {
  context.save();

  switch (element.type) {
    case 'artboard':
      drawArtboard(context, element, selectedElementIds, hoveredElementId, highlightedArtboardId, scale);
      break;
    case 'rect':
      context.fillStyle = element.fill;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      context.translate(centerX, centerY);
      context.rotate(element.rotation || 0);
      context.translate(-centerX, -centerY);
      context.fillRect(element.x, element.y, element.width, element.height);
      break;
    case 'circle': {
      context.fillStyle = element.fill;
      const { x, y, radius, rotation = 0 } = element;
      const radiusX = element.radiusX || radius;
      const radiusY = element.radiusY || radius;

      context.beginPath();
      context.ellipse(x, y, radiusX, radiusY, rotation, 0, 2 * Math.PI);
      context.fill();
      break;
    }
    default:
      break;
  }

  context.restore();
};

const drawHandle = (context, handle, handleSize, scale) => {
  const radius = handleSize / 2;
  context.beginPath();
  context.arc(handle.x, handle.y, radius, 0, 2 * Math.PI);
  context.fillStyle = '#FFFFFF';
  context.strokeStyle = '#007AFF';
  context.lineWidth = 1 / scale;
  context.fill();
  context.stroke();
};

const drawSelection = (context, elements, selectedElementIds, scale, groupBoundingBox) => {
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  if (selectedElements.length === 0) return;

  const elementToDrawHandlesFor = groupBoundingBox || (selectedElements.length === 1 ? selectedElements[0] : null);

  if (!elementToDrawHandlesFor || elementToDrawHandlesFor.type === 'artboard') {
    return;
  }

  const handles = getHandles(elementToDrawHandlesFor);
  const { x, y, width, height, rotation = 0 } = elementToDrawHandlesFor;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // 1. Draw the main bounding box
  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);
  context.strokeStyle = 'rgba(0, 123, 255, 0.9)';
  context.lineWidth = 1 / scale;
  context.strokeRect(-width / 2, -height / 2, width, height);
  context.restore();

  // 2. Draw all handles
  const handleSize = 10 / scale;
  Object.values(handles).forEach(handle => {
    // Se for o handle de rotação, desenha a linha de conexão primeiro
    if (handle.type === 'rotation') {
      context.save();
      context.strokeStyle = 'rgba(0, 123, 255, 0.9)';
      context.lineWidth = 1 / scale;
      
      // Ponto superior central da caixa para iniciar a linha
      const lineStartPoint = { x: x + width / 2, y: y }; 
      const rotatedLineStartPoint = rotatePoint(lineStartPoint, { x: centerX, y: centerY }, rotation);
      
      context.beginPath();
      context.moveTo(rotatedLineStartPoint.x, rotatedLineStartPoint.y);
      context.lineTo(handle.x, handle.y);
      context.stroke();
      context.restore();
    }

    // Desenha o círculo do handle (para todos os tipos)
    drawHandle(context, handle, handleSize, scale);
  });
};

const drawSelectionRect = (context, selectionRect) => {
  if (!selectionRect) return;

  context.fillStyle = 'rgba(0, 122, 255, 0.1)';
  context.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
  context.strokeStyle = 'rgba(0, 122, 255, 0.6)';
  context.lineWidth = 1;
  context.setLineDash([4, 2]);
  context.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
  context.setLineDash([]); // Reset line dash
};

const drawPerformanceMetrics = (context, perfMetrics) => {
  if (!perfMetrics) return;
  context.font = '14px Arial';
  context.fillStyle = 'black';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillText(`FPS: ${perfMetrics.fps.toFixed(0)}`, 10, 10);
  context.fillText(`MS: ${perfMetrics.ms.toFixed(2)}`, 10, 30);
};

export const drawScene = (context, offset, scale, elements, selectedElementIds, hoveredElementId, highlightedArtboardId, selectionRect, perfMetrics, groupBoundingBox) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  context.save();
  context.translate(offset.x, offset.y);
  context.scale(scale, scale);

  elements.forEach(element => {
    drawElement(context, element, selectedElementIds, hoveredElementId, highlightedArtboardId, scale);
  });

  drawSelection(context, elements, selectedElementIds, scale, groupBoundingBox);

  // Desenha a caixa de seleção por cima de tudo
  drawSelectionRect(context, selectionRect);

  context.restore();

  // Desenha as métricas de performance por cima de tudo, sem ser afetado pelo pan/zoom
  drawPerformanceMetrics(context, perfMetrics);
};
