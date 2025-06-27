import * as ActionHandler from '../utils/actionHandlers';

/**
 * Inicia a interação de seleção por marquee (caixa de seleção).
 * Esta é geralmente a ação padrão.
 * @param {object} context - O contexto da interação.
 * @returns {object} O estado da interação de seleção.
 */
export const startMarqueeSelection = (context) => {
  const { worldPos, setSelectedElementIds, setSelectionRect } = context;

  setSelectedElementIds([]);
  setSelectionRect({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
  
  return {
    handler: ActionHandler.handleSelecting,
    data: { 
      type: 'selecting', 
      startWorldPoint: worldPos 
    },
  };
};
