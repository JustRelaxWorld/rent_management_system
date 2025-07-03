import { useState, useEffect } from 'react';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<BreakpointKey, number> = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

/**
 * A hook that returns the current screen size and responsive utilities
 */
export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  /**
   * Check if the current screen matches the given breakpoint or larger
   */
  const isAbove = (breakpoint: BreakpointKey): boolean => {
    return screenWidth >= breakpoints[breakpoint];
  };

  /**
   * Check if the current screen is smaller than the given breakpoint
   */
  const isBelow = (breakpoint: BreakpointKey): boolean => {
    return screenWidth < breakpoints[breakpoint];
  };

  /**
   * Check if the current screen is between two breakpoints
   */
  const isBetween = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return screenWidth >= breakpoints[min] && screenWidth < breakpoints[max];
  };

  return {
    screenWidth,
    isAbove,
    isBelow,
    isBetween,
    isMobile: isBelow('md'),
    isTablet: isBetween('md', 'lg'),
    isDesktop: isAbove('lg'),
  };
};

export default useResponsive; 