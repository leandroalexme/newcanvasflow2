import { getHandles, rotatePoint } from '../geometry';
import { drawArtboard } from '../../modules/artboard/artboardRenderer';
import { drawElement } from '../elementRenderer';
import { renderSnapLines } from '../../modules/snapping/snapRenderer';
import {
  COLOR_PRIMARY,
  COLOR_WHITE,
  COLOR_SELECTION,
  COLOR_SELECTION_RECT_FILL,
  COLOR_SELECTION_RECT_STROKE,
  LINE_WIDTH_DEFAULT,
  HANDLE_SIZE,
} from '../constants';
import { drawHandle } from './handleRenderer';

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
  context.strokeStyle = COLOR_SELECTION;
  context.lineWidth = LINE_WIDTH_DEFAULT / scale;
  context.strokeRect(-width / 2, -height / 2, width, height);
  context.restore();

  // 2. Draw all handles
  Object.values(handles).forEach(handle => {
    if (handle.type === 'rotation') {
      context.save();
      context.strokeStyle = COLOR_SELECTION;
      context.lineWidth = LINE_WIDTH_DEFAULT / scale;
      
      const lineStartPoint = { x: x + width / 2, y: y }; 
      const rotatedLineStartPoint = rotatePoint(lineStartPoint, { x: centerX, y: centerY }, rotation);
      
      context.beginPath();
      context.moveTo(rotatedLineStartPoint.x, rotatedLineStartPoint.y);
      context.lineTo(handle.x, handle.y);
      context.stroke();
      context.restore();
    }
    drawHandle(context, handle, HANDLE_SIZE, scale);
  });
};

const drawSelectionRect = (context, selectionRect) => {
  if (!selectionRect) return;

  context.fillStyle = COLOR_SELECTION_RECT_FILL;
  context.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
  context.strokeStyle = COLOR_SELECTION_RECT_STROKE;
  context.lineWidth = LINE_WIDTH_DEFAULT;
  context.setLineDash([4, 2]);
  context.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
  context.setLineDash([]);
};

export const drawScene = (context, offset, scale, elements, selectedElementIds, hoveredElementId, highlightedArtboardId, selectionRect, groupBoundingBox, snapLines) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  // Set the background color explicitly
  context.fillStyle = '#333';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  context.save();
  context.translate(offset.x, offset.y);
  context.scale(scale, scale);

  const artboards = elements.filter(el => el.type === 'artboard');
  const orphanElements = elements.filter(el => !el.parentId && el.type !== 'artboard');

  // Draw orphan elements first, so they are behind artboards
  orphanElements.forEach(element => {
    drawElement(context, element);
  });
  
  // Draw artboards, which will also handle drawing their children
  artboards.forEach(artboard => {
    drawArtboard(context, artboard, elements, selectedElementIds, hoveredElementId, highlightedArtboardId, scale);
  });

  drawSelection(context, elements, selectedElementIds, scale, groupBoundingBox);

  // As linhas de snap devem ser desenhadas por cima da seleção e dos elementos, mas respeitando o pan/zoom
  renderSnapLines(context, snapLines, scale);

  drawSelectionRect(context, selectionRect);

  context.restore();
};
