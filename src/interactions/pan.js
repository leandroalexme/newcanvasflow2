import * as ActionHandler from '../utils/actionHandlers';

/**
 * Tenta iniciar a interação de Pan (arrastar o canvas).
 * @param {object} context - O contexto da interação.
 * @returns {object|null} O estado da interação se o pan for iniciado, caso contrário, nulo.
 */
export const tryStartPanning = (context) => {
  const { event, canvas, mousePos } = context;

  // Ação de Pan só ocorre com o botão do meio do mouse.
  if (event.button !== 1) {
    return null;
  }

  canvas.style.cursor = 'grabbing';

  return {
    handler: ActionHandler.handlePanning,
    data: {
      type: 'panning',
      lastPanPoint: mousePos,
    },
  };
};
