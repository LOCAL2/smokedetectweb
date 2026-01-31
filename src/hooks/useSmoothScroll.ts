import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';



export const useSmoothScroll = (enabled: boolean = true) => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    
    lenisRef.current = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId: number;

    function raf(time: number) {
      lenisRef.current?.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  
  useEffect(() => {
    if (lenisRef.current) {
      
      lenisRef.current.scrollTo(0, { immediate: true });
      
      setTimeout(() => {
        lenisRef.current?.resize();
      }, 100);
    }
  }, [location.pathname]);
};

export default useSmoothScroll;
