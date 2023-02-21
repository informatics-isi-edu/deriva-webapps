import { useState, useEffect } from 'react';

export type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

/**
 * Hook to gets the current window size of the component,
 * automatically updates on resizing the window/viewport
 * 
 * A slightly modified version from this website:
 * https://usehooks.com/useWindowSize/
 *
 * @returns {WindowSize} width and height of the window
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  // Effect for updating width and height when viewport is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
