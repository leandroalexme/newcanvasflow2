/**
 * Inicia a interação de seleção por marquee (caixa de seleção).
 * @param {object} context - O contexto da interação.
 * @returns {object} O estado da interação de seleção.
 */
export const startMarqueeSelection = (context) => {
  const { worldPos, setSelectedElementIds, setSelectionRect } = context;

  setSelectedElementIds([]);
  setSelectionRect({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
  
  return {
    handler: handleSelecting,
    data: { 
      type: 'selecting', 
      startWorldPoint: worldPos 
    },
  };
};

/**
 * Manipula a ação de seleção durante o movimento do mouse, atualizando o retângulo de seleção.
 * @param {object} context - O contexto da interação.
 */
export const handleSelecting = (context) => {
  const { worldPos, data, setSelectionRect } = context;
  const { startWorldPoint } = data;
  setSelectionRect({
    x: startWorldPoint.x,
    y: startWorldPoint.y,
    width: worldPos.x - startWorldPoint.x,
    height: worldPos.y - startWorldPoint.y
  });
}; 