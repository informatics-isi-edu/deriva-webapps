import { useState, useEffect } from 'react';

export type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

// slightly modified version from the website
// gets the current window size of the component
// https://usehooks.com/useWindowSize/
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
