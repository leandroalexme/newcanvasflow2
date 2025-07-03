import { useState, useEffect } from 'react';

export const useAnimatedRender = (isOpen, animationDuration = 200) => {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration]);

  return isRendered;
}; 