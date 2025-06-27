import { useState, useCallback } from 'react';

export const useHistory = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  // setState é para atualizações ao vivo e não confirmadas (por exemplo, durante o arrasto).
  // Ele modifica o estado atual na pilha de histórico, mas não cria uma nova entrada.
  const setState = useCallback((action) => {
    const newState = typeof action === 'function' ? action(history[currentIndex]) : action;
    const newHistory = [...history];
    newHistory[currentIndex] = newState;
    setHistory(newHistory);
  }, [history, currentIndex]);

  // commit finaliza uma alteração e a adiciona ao histórico como uma nova entrada.
  const commit = useCallback((action) => {
    const newState = typeof action === 'function' ? action(history[currentIndex]) : action;
    // Trunca o histórico futuro se tivermos desfeito alguma ação
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  return { state, setState, commit, undo, redo };
};