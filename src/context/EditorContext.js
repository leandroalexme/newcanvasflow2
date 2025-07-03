import React, { createContext, useContext, useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { initializeElementParents } from '../modules/artboard/artboardAssociation';
import { rawElements } from '../core/initial-data';

const EditorContext = createContext();

const initialElements = initializeElementParents(rawElements);

export const EditorProvider = ({ children }) => {
  const { state: elements, setState: setElements, commit, undo, redo } = useHistory(initialElements);
  const [selectedElementIds, setSelectedElementIds] = useState([]);

  const value = {
    elements,
    setElements,
    commit,
    undo,
    redo,
    selectedElementIds,
    setSelectedElementIds,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}; 