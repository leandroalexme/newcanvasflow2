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
    handler: handlePanning,
    data: {
      type: 'panning',
      lastPanPoint: mousePos,
    },
  };
};

/**
 * Manipula a ação de Pan durante o movimento do mouse.
 * @param {object} context - O contexto da interação.
 */
export const handlePanning = (context) => {
  const { mousePos, data, setOffset } = context;
  const { lastPanPoint } = data;

  if (!lastPanPoint) {
    return;
  }
  const dx = mousePos.x - lastPanPoint.x;
  const dy = mousePos.y - lastPanPoint.y;
  setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  // Retorna o novo ponto de pan para ser atualizado no hook
  return mousePos;
}; 