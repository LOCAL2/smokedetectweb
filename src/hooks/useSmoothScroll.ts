import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Custom Smooth Scroll Hook using Lenis
 * Provides premium "scroll-jacking" feel with high performance
 * @param enabled - เปิด/ปิด smooth scroll (ค่าเริ่มต้น true)
 */
export const useSmoothScroll = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [enabled]);
};

export default useSmoothScroll;
