import { calculateGroupSelectionBox } from '../utils/geometry';

/**
 * Gera um ID único para um novo elemento.
 * @returns {number}
 */
const getNewId = () => Date.now();

/**
 * Tenta duplicar os elementos selecionados durante uma operação de arrastar.
 *
 * @param {object} context - O contexto da interação contendo o estado atual.
 * @returns {void} - A função modifica o estado da interação diretamente por referência.
 */
export const tryDuplicateOnDrag = (context) => {
  const { event, interactionState, setSelectedElementIds, didDuplicateOnDragRef } = context;
  const { data } = interactionState.current;

  // Condições para duplicar:
  // 1. A interação deve ser 'dragging'.
  // 2. A tecla Cmd (metaKey) ou Ctrl (ctrlKey) deve estar pressionada.
  // 3. A duplicação ainda não pode ter ocorrido neste ciclo de arrasto.
  const shouldDuplicate =
    data.type === 'dragging' &&
    (event.metaKey || event.ctrlKey) &&
    !didDuplicateOnDragRef.current;

  if (!shouldDuplicate) {
    return;
  }

  // Marca que a duplicação ocorreu para evitar múltiplas cópias.
  didDuplicateOnDragRef.current = true;

  const elementsToClone = data.startElements;
  const newIds = [];
  
  // Cria os clones com novos IDs
  const clonedElements = elementsToClone.map((element, index) => {
    const newId = getNewId() + index;
    newIds.push(newId);
    return { ...element, id: newId };
  });

  // [Ponto Crítico] Atualiza o estado da interação em tempo real:
  // 1. Adiciona os novos elementos à cópia "viva" que está sendo renderizada.
  data.liveElements = [...data.liveElements, ...clonedElements];

  // 2. Transfere o controle do arrasto para os elementos recém-criados.
  data.startElements = clonedElements;
  
  // 3. Atualiza a seleção no estado do React para a próxima renderização.
  setSelectedElementIds(newIds);
};