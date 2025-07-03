import { COLOR_PRIMARY, COLOR_WHITE, LINE_WIDTH_DEFAULT } from '../constants';

/**
 * Draws a single resize/rotation handle on the canvas.
 * @param {CanvasRenderingContext2D} context - The canvas rendering context.
 * @param {object} handle - The handle object with x, y, and type.
 * @param {number} handleSize - The base size of the handle.
 * @param {number} scale - The current canvas scale.
 */
export const drawHandle = (context, handle, handleSize, scale) => {
  const scaledSize = handleSize / scale;

  context.save();
  context.fillStyle = COLOR_WHITE;
  context.strokeStyle = COLOR_PRIMARY;
  context.lineWidth = LINE_WIDTH_DEFAULT / scale;
  
  // All shapes are drawn relative to the handle's center.
  context.translate(handle.x, handle.y);
  
  context.beginPath();

  switch (handle.type) {
    case 'n':
    case 's': {
      // Vertical Pill
      const pillW = scaledSize;
      const pillH = scaledSize * 1.5;
      const radius = pillW / 2;
      const straightH = pillH - pillW;
      
      context.moveTo(-radius, -straightH / 2);
      context.lineTo(-radius, straightH / 2);
      context.arc(0, straightH / 2, radius, Math.PI, 0, false);
      context.lineTo(radius, -straightH / 2);
      context.arc(0, -straightH / 2, radius, 0, Math.PI, false);
      context.closePath();
      break;
    }
    case 'e':
    case 'w': {
      // Horizontal Pill
      const pillW = scaledSize * 1.5;
      const pillH = scaledSize;
      const radius = pillH / 2;
      const straightW = pillW - pillH;

      context.moveTo(straightW / 2, -radius);
      context.arc(straightW / 2, 0, radius, -Math.PI / 2, Math.PI / 2, false);
      context.lineTo(-straightW / 2, radius);
      context.arc(-straightW / 2, 0, radius, Math.PI / 2, -Math.PI / 2, false);
      context.closePath();
      break;
    }
    
    case 'nw':
    case 'ne':
    case 'sw':
    case 'se':
    case 'rotation':
    default: {
      // Circle for corners and rotation
      const radius = scaledSize / 2;
      context.arc(0, 0, radius, 0, 2 * Math.PI);
      break;
    }
  }
  
  context.fill();
  context.stroke();
  context.restore();
}; 