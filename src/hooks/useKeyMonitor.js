import { useEffect, useRef } from 'react';

/**
 * Hook para monitorar se uma tecla específica (ou um conjunto de teclas) está
 * atualmente pressionada.
 * @param {Array<string>} keysToMonitor - As teclas a serem monitoradas (ex: ['Meta', 'Control']).
 * @returns {React.MutableRefObject<boolean>} Uma referência que é `true` se a tecla estiver pressionada.
 */
export const useKeyMonitor = (keysToMonitor = ['Meta', 'Control']) => {
  const isKeyPressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (keysToMonitor.includes(event.key)) {
        isKeyPressedRef.current = true;
      }
    };

    const handleKeyUp = (event) => {
      if (keysToMonitor.includes(event.key)) {
        isKeyPressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysToMonitor]);

  return isKeyPressedRef;
};
