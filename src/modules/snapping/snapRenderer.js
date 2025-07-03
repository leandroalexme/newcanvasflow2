import { COLOR_SNAP_LINE, LINE_WIDTH_DEFAULT } from '../../core/constants';

/**
 * Renders the snap lines on the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Array<object>} snapLines - An array of snap line objects to draw.
 * @param {number} scale - The current canvas scale, to ensure lines are sharp.
 */
export const renderSnapLines = (ctx, snapLines, scale) => {
  if (!snapLines || snapLines.length === 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = COLOR_SNAP_LINE;
  ctx.lineWidth = LINE_WIDTH_DEFAULT / scale; // Keep line width consistent regardless of zoom
  ctx.beginPath();

  snapLines.forEach(line => {
    if (line.type === 'vertical') {
      ctx.moveTo(line.x, line.y1);
      ctx.lineTo(line.x, line.y2);
    } else if (line.type === 'horizontal') {
      ctx.moveTo(line.x1, line.y);
      ctx.lineTo(line.x2, line.y);
    }
  });

  ctx.stroke();
  ctx.restore();
};
