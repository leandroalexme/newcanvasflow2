import { useCallback } from 'react';

export const useLayerOperations = ({ elements, selectedElementIds, setElements, commit }) => {
  const bringToFront = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const others = elements.filter(el => !selectedElementIds.includes(el.id));

    const newElements = [...others, ...selected];
    setElements(newElements);
    commit(newElements);
  }, [elements, selectedElementIds, setElements, commit]);

  const sendToBack = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const others = elements.filter(el => !selectedElementIds.includes(el.id));

    const newElements = [...selected, ...others];
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

  return {
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  };
};
