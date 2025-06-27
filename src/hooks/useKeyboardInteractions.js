import { useEffect, useRef } from 'react';

export const useKeyboardInteractions = ({ 
  elements, 
  selectedElementIds, 
  commit, 
  setSelectedElementIds,
  undo,
  redo,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward
}) => {
  const clipboardRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Undo/Redo
      if (event.metaKey || event.ctrlKey) {
        if (event.key === 'z') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        // Layer ordering
        if (event.key === ']') {
          event.preventDefault();
          if (event.shiftKey) {
            bringToFront();
          } else {
            bringForward();
          }
        }
        if (event.key === '[') {
          event.preventDefault();
          if (event.shiftKey) {
            sendToBack();
          } else {
            sendBackward();
          }
        }
      }

      // Copy
      if (event.key === 'c' && (event.metaKey || event.ctrlKey)) {
        const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
        if (selectedElements.length > 0) {
          clipboardRef.current = selectedElements;
        }
      }

      // Paste
      if (event.key === 'v' && (event.metaKey || event.ctrlKey)) {
        if (clipboardRef.current) {
          const newElements = clipboardRef.current.map(el => ({
            ...el,
            id: Date.now() + Math.random(),
            x: el.x + 20,
            y: el.y + 20,
          }));
          const updatedElements = [...elements, ...newElements];
          commit(updatedElements);
          setSelectedElementIds(newElements.map(el => el.id));
        }
      }

      // Delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        const updatedElements = elements.filter(el => !selectedElementIds.includes(el.id));
        commit(updatedElements);
        setSelectedElementIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, selectedElementIds, commit, setSelectedElementIds, undo, redo, bringToFront, sendToBack, bringForward, sendBackward]);
};
