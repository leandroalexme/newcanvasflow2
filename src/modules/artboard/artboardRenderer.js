import { getHandles } from '../../core/geometry';
import { drawElement } from '../../core/elementRenderer';
import { COLOR_PRIMARY, COLOR_WHITE, COLOR_ARTBOARD_HIGHLIGHT, LINE_WIDTH_SELECTED, HANDLE_SIZE } from '../../core/constants';
import { drawHandle } from '../../core/renderer/handleRenderer';

export const drawArtboard = (context, artboard, allElements, selectedElementIds, hoveredElementId, highlightedArtboardId, scale) => {
  const isSelected = selectedElementIds.includes(artboard.id);
  const isHovered = hoveredElementId === artboard.id;
  const isHighlighted = highlightedArtboardId === artboard.id;

  // --- 1. Draw Artboard and Children (with Clipping) ---
  context.save();

  // Draw background
  context.fillStyle = artboard.backgroundColor || '#FFFFFF';
  context.fillRect(artboard.x, artboard.y, artboard.width, artboard.height);

  // Set up the clipping mask
  context.beginPath();
  context.rect(artboard.x, artboard.y, artboard.width, artboard.height);
  context.clip();

  // Render child elements
  const childElements = allElements.filter(el => el.parentId === artboard.id);
  childElements.forEach(element => {
    drawElement(context, element);
  });

  // Restore context to remove the clipping mask
  context.restore();


  // --- 2. Draw Artboard Chrome (Borders, Title, Handles) on top ---
  
  // Draw border if selected, hovered or highlighted
  if (isSelected || isHovered) {
    context.strokeStyle = COLOR_PRIMARY;
    context.lineWidth = LINE_WIDTH_SELECTED / scale;
    context.strokeRect(artboard.x, artboard.y, artboard.width, artboard.height);
  } else if (isHighlighted) {
    context.strokeStyle = COLOR_ARTBOARD_HIGHLIGHT;
    context.lineWidth = LINE_WIDTH_SELECTED / scale;
    context.setLineDash([8, 4]);
    context.strokeRect(artboard.x, artboard.y, artboard.width, artboard.height);
    context.setLineDash([]);
  }

  // Draw artboard title
  const FONT_SIZE = 14;
  const PADDING = 10;
  context.font = `${FONT_SIZE / scale}px Arial`;
  context.fillStyle = (isSelected || isHovered) ? COLOR_PRIMARY : '#000000';
  context.textAlign = 'left';
  context.textBaseline = 'bottom';
  context.fillText(artboard.title, artboard.x, artboard.y - (PADDING / scale));

  // Draw resize handles if selected
  if (isSelected) {
    const handles = getHandles(artboard);
    Object.values(handles).forEach(handle => {
      drawHandle(context, handle, HANDLE_SIZE, scale);
    });
  }
}; 