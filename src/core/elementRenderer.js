/**
 * This file contains the rendering logic for individual geometric elements.
 * It is isolated to prevent circular dependencies, allowing both the main
 * scene renderer and the artboard renderer to use it safely.
 */

// NOTE: We don't import other renderers here to avoid circles.

export const drawElement = (context, element) => {
  context.save();

  // Apply the element's global opacity
  if (element.opacity !== undefined) {
    context.globalAlpha = element.opacity;
  } else if (element.parentId === null) {
    // Fallback for orphan elements that might not have their opacity set
    context.globalAlpha = 0.2;
  }

  switch (element.type) {
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
    case 'text': {
        context.save();
        
        // Basic setup from element properties
        const { x, y, width, content, textAlign } = element;
        context.textBaseline = 'top';

        let currentX = x;
        const startY = y;
        
        if (textAlign === 'center') {
            const totalWidth = content.reduce((acc, span) => {
                const { text, ...styles } = span;
                const fontWeight = styles.fontWeight || element.fontWeight;
                const fontStyle = styles.fontStyle || element.fontStyle;
                const fontSize = styles.fontSize || element.fontSize;
                const fontFamily = styles.fontFamily || element.fontFamily;
                context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                return acc + context.measureText(text).width;
            }, 0);
            currentX = x + (width - totalWidth) / 2;
        } else if (textAlign === 'right') {
            const totalWidth = content.reduce((acc, span) => {
                const { text, ...styles } = span;
                const fontWeight = styles.fontWeight || element.fontWeight;
                const fontStyle = styles.fontStyle || element.fontStyle;
                const fontSize = styles.fontSize || element.fontSize;
                const fontFamily = styles.fontFamily || element.fontFamily;
                context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                return acc + context.measureText(text).width;
            }, 0);
            currentX = x + width - totalWidth;
        }


        content.forEach(span => {
            const { text, ...styles } = span;
            const fontWeight = styles.fontWeight || element.fontWeight || 'normal';
            const fontStyle = styles.fontStyle || element.fontStyle || 'normal';
            const fontSize = styles.fontSize || element.fontSize || 16;
            const fontFamily = styles.fontFamily || element.fontFamily || 'Arial';
            const fill = styles.fill || element.fill || '#000000';

            context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            context.fillStyle = fill;
            
            context.fillText(text, currentX, startY);
            currentX += context.measureText(text).width;
        });

        context.restore();
        break;
    }
    // Note: Artboards are not drawn by this function.
  }

  context.restore();
}; 