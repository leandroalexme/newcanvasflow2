import { drawElement } from './elementRenderer';

function triggerDownload(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getArtboardContent(elements, artboard) {
  return elements.filter(el => el.parentId === artboard.id);
}

/**
 * Exports the content of an artboard to a raster image format (PNG or JPEG).
 * @param {Array<object>} elements - The full list of scene elements.
 * @param {object} artboard - The artboard to export.
 * @param {object} settings - The export settings { type, scale }.
 */
export function exportToRaster(elements, artboard, settings) {
  const { type, scale } = settings;
  const mimeType = type === 'jpeg' ? 'image/jpeg' : 'image/png';
  
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = artboard.width * scale;
  tempCanvas.height = artboard.height * scale;
  const ctx = tempCanvas.getContext('2d');

  if (!ctx) return;

  // Fill background for formats that don't support transparency (like JPEG)
  ctx.fillStyle = artboard.backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-artboard.x, -artboard.y);
  
  const artboardElements = getArtboardContent(elements, artboard);
  artboardElements.forEach(element => {
    drawElement(ctx, element);
  });
  
  ctx.restore();

  const dataUrl = tempCanvas.toDataURL(mimeType, 1.0);
  triggerDownload(dataUrl, `${artboard.title}.${type}`);
}


/**
 * Converts a hex color to an RGBA string for SVG.
 * @param {string} hex - The hex color string.
 * @param {number} [opacity=1] - The opacity value.
 * @returns {string} The RGBA color string.
 */
function hexToRgba(hex, opacity = 1) {
    if (!hex) return `rgba(0,0,0,${opacity})`;
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
    }
    return `rgba(0,0,0,${opacity})`;
}

/**
 * Exports the content of an artboard to SVG format.
 * @param {Array<object>} elements - The full list of scene elements.
 * @param {object} artboard - The artboard to export.
 */
export function exportToSVG(elements, artboard) {
  const artboardElements = getArtboardContent(elements, artboard);
  
  const svgElements = artboardElements.map(el => {
    const fill = el.fill ? hexToRgba(el.fill, el.opacity || 1) : 'none';
    const rotation = el.rotation ? `rotate(${el.rotation * (180 / Math.PI)} ${el.x + el.width / 2 - artboard.x} ${el.y + el.height / 2 - artboard.y})` : '';

    switch (el.type) {
      case 'rect':
        return `<rect x="${el.x - artboard.x}" y="${el.y - artboard.y}" width="${el.width}" height="${el.height}" fill="${fill}" transform="${rotation}" />`;
      case 'circle':
        const radius = el.radius || (el.width / 2); // Use radius or calculate from width
        return `<circle cx="${el.x - artboard.x + radius}" cy="${el.y - artboard.y + radius}" r="${radius}" fill="${fill}" transform="${rotation}" />`;
      default:
        return '';
    }
  }).join('\n  ');

  const svgContent = `<svg width="${artboard.width}" height="${artboard.height}" viewBox="0 0 ${artboard.width} ${artboard.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${artboard.backgroundColor || '#FFFFFF'}"/>
  ${svgElements}
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${artboard.title}.svg`);
  URL.revokeObjectURL(url);
} 