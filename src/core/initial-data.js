import { createArtboard } from '../modules/artboard/artboardUtils';
import { createElement } from './element';

export const rawElements = [
  createArtboard(0, 0, 500, 400, 'Artboard 1'),
  createArtboard(600, 0, 300, 400, 'Artboard 2'),
  createElement('rect', { x: 50, y: 50, width: 100, height: 100, rotation: 0, fill: '#FFC107', name: 'Rectangle' }),
  createElement('rect', { x: 800, y: 500, width: 150, height: 80, rotation: 0, fill: '#03A9F4', name: 'Rectangle' }),
  createElement('circle', { x: 400, y: 150, radius: 50, fill: '#4CAF50', name: 'Circle' }),
  createElement('text', { 
    x: 100, 
    y: 250, 
    width: 300,
    content: [
        { text: 'Texto ', styles: {} },
        { text: 'Negrito', styles: { fontWeight: 'bold' } },
        { text: ' e ', styles: {} },
        { text: 'Itálico', styles: { fontStyle: 'italic' } }
    ],
    fontSize: 24,
    name: 'Rich Text Example'
  }),
]; 