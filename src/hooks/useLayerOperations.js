import { useCallback } from 'react';
import { useEditor } from '../context/EditorContext';

/**
 * Hook para operações de ordenação de camadas (trazer para frente, enviar para trás, etc.).
 * @returns {{bringToFront: Function, sendToBack: Function, bringForward: Function, sendBackward: Function}}
 */
export const useLayerOperations = () => {
  const { elements, selectedElementIds, setElements, commit } = useEditor();

  const bringToFront = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const unselected = elements.filter(el => !selectedElementIds.includes(el.id));
    const newElements = [...unselected, ...selected];
    setElements(newElements);
    commit(newElements);
  }, [elements, selectedElementIds, setElements, commit]);

  const sendToBack = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const unselected = elements.filter(el => !selectedElementIds.includes(el.id));
    const newElements = [...selected, ...unselected];
    setElements(newElements);
    commit(newElements);
  }, [elements, selectedElementIds, setElements, commit]);

  const bringForward = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const newElements = [...elements];
    const selectedIndices = selectedElementIds
      .map(id => newElements.findIndex(el => el.id === id))
      .sort((a, b) => b - a); 

    selectedIndices.forEach(index => {
      if (index < newElements.length - 1) {
        const temp = newElements[index];
        newElements[index] = newElements[index + 1];
        newElements[index + 1] = temp;
      }
    });
    
    setElements(newElements);
    commit(newElements);
  }, [elements, selectedElementIds, setElements, commit]);

  const sendBackward = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const newElements = [...elements];
    const selectedIndices = selectedElementIds
      .map(id => newElements.findIndex(el => el.id === id))
      .sort((a, b) => a - b);

    selectedIndices.forEach(index => {
      if (index > 0) {
        const temp = newElements[index];
        newElements[index] = newElements[index - 1];
        newElements[index - 1] = temp;
      }
    });
    
    setElements(newElements);
    commit(newElements);
  }, [elements, selectedElementIds, setElements, commit]);

  return { bringToFront, sendToBack, bringForward, sendBackward };
};
