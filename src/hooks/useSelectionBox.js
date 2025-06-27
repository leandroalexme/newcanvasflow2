import { useMemo, useState, useEffect } from 'react';
import { getAxisAlignedBoundingBox, calculateGroupSelectionBox } from '../utils/geometry';

export const useSelectionBox = (elements, selectedElementIds) => {
  const [activeGroupBoundingBox, setActiveGroupBoundingBox] = useState(null);

  const { selectionBox, groupRotation } = useMemo(() => {
    // Se uma interação (como redimensionar) está ativa, use a caixa dela.
    if (activeGroupBoundingBox) {
        return { 
            selectionBox: activeGroupBoundingBox, 
            groupRotation: activeGroupBoundingBox.rotation || 0 
        };
    }

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

    // Se nada estiver selecionado
    if (selectedElements.length === 0) {
        return { selectionBox: null, groupRotation: 0 };
    }

    // Se apenas um elemento estiver selecionado
    if (selectedElements.length === 1) {
        return { selectionBox: selectedElements[0], groupRotation: 0 };
    }

    // LÓGICA CENTRALIZADA PARA GRUPOS
    const ROTATION_EPSILON = 1e-5; // Epsilon para comparação de rotações
    // 1. Calcular a rotação do grupo com base nos elementos atuais
    const firstRotation = selectedElements[0]?.rotation || 0;
    const allSameRotation = selectedElements.every(
        el => Math.abs((el.rotation || 0) - firstRotation) < ROTATION_EPSILON
    );
    const currentGroupRotation = allSameRotation ? firstRotation : 0;

    // 2. Escolher a função de cálculo da caixa COM BASE na rotação recém-calculada
    if (currentGroupRotation !== 0) {
        // Se o grupo tem uma rotação uniforme, calcula a caixa rotacionada.
        const box = calculateGroupSelectionBox(selectedElements, currentGroupRotation);
        return { selectionBox: box, groupRotation: currentGroupRotation };
    } else {
        // Se não, usa a função corrigida que calcula a caixa alinhada aos eixos.
        const box = getAxisAlignedBoundingBox(selectedElements);
        return { selectionBox: box, groupRotation: 0 };
    }
  }, [selectedElementIds, elements, activeGroupBoundingBox]);

  useEffect(() => {
    // Quando a seleção muda, a caixa de grupo ativa (da interação) é invalidada.
    setActiveGroupBoundingBox(null);
  }, [selectedElementIds]);

  return { selectionBox, groupRotation, activeGroupBoundingBox, setActiveGroupBoundingBox };
};
