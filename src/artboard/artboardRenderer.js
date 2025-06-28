import { getHandles } from '../utils/geometry';

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

export const drawArtboard = (context, artboard, selectedElementIds, hoveredElementId, highlightedArtboardId, scale) => {
  const isSelected = selectedElementIds.includes(artboard.id);
  const isHovered = hoveredElementId === artboard.id;
  const isHighlighted = highlightedArtboardId === artboard.id;

  // Draw artboard background
  context.fillStyle = artboard.backgroundColor || '#FFFFFF';
  context.fillRect(artboard.x, artboard.y, artboard.width, artboard.height);

  // Draw border if selected, hovered or highlighted
  if (isSelected || isHovered) {
    context.strokeStyle = '#007AFF';
    context.lineWidth = 2 / scale;
    context.strokeRect(artboard.x, artboard.y, artboard.width, artboard.height);
  } else if (isHighlighted) {
    context.strokeStyle = 'rgba(0, 123, 255, 0.5)';
    context.lineWidth = 2 / scale;
    context.setLineDash([8, 4]);
    context.strokeRect(artboard.x, artboard.y, artboard.width, artboard.height);
    context.setLineDash([]);
  }

  // Draw artboard title
  context.font = '14px Arial';
  context.fillStyle = (isSelected || isHovered) ? '#007AFF' : '#000000';
  context.textAlign = 'left';
  context.textBaseline = 'bottom';
  context.fillText(artboard.title, artboard.x, artboard.y - 10);

  // Draw resize handles if selected
  if (isSelected) {
    const handles = getHandles(artboard);
    const handleSize = 10;
    Object.values(handles).forEach(handle => {
      drawHandle(context, handle, handleSize, scale);
    });
  }
}; 