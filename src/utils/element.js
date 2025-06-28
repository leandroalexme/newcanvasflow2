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
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
};
