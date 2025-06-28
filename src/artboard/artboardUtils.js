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