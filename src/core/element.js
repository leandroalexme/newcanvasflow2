import { v4 as uuidv4 } from 'uuid';

export const createArtboard = (x, y, width, height, title = 'Artboard') => ({
  id: uuidv4(),
  type: 'artboard',
  x,
  y,
  width,
  height,
  title,
  backgroundColor: '#FFFFFF',
  elements: [],
});

export const createElement = (type, props) => {
  const baseElement = {
    id: uuidv4(),
    type,
    parentId: null, // Todos os elementos começam sem um pai
  };

  switch (type) {
    case 'rect':
      return {
        ...baseElement,
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height,
        rotation: props.rotation || 0,
        fill: props.fill || '#000000',
      };
    case 'circle':
      return {
        ...baseElement,
        x: props.x,
        y: props.y,
        radius: props.radius,
        rotation: props.rotation || 0,
        fill: props.fill || '#000000',
      };
    case 'text':
      return {
        ...baseElement,
        x: props.x,
        y: props.y,
        width: props.width || 200, // Default width
        height: props.height || 50, // Default height
        rotation: props.rotation || 0,
        content: props.content || [{ text: 'Type something...', styles: {} }],
        fontSize: props.fontSize || 16,
        fontFamily: props.fontFamily || 'Arial',
        fontWeight: props.fontWeight || 'normal',
        fontStyle: props.fontStyle || 'normal',
        textDecoration: props.textDecoration || 'none',
        textAlign: props.textAlign || 'left',
        letterSpacing: props.letterSpacing || 0,
        baselineShift: props.baselineShift || 0,
        textCase: props.textCase || 'none',
      };
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
};
