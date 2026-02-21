import { useState, useEffect, useRef, useCallback } from 'react';

export type TransitionState = 'idle' | 'exiting' | 'moving';

export interface TransitionData {
  from: number;
  to: number;
}

export function useSlideNavigation(totalSlides: number) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [transitionData, setTransitionData] = useState<TransitionData | null>(null);
  const slideRef = useRef(0);
  const lastScrollTime = useRef(0);
  const overscrollAccumulator = useRef(0);
  const OVERSCROLL_THRESHOLD = 50; // Increased threshold for "margin" feel

  // Keep ref in sync with state
  const updateSlide = useCallback((newSlide: number) => {
    slideRef.current = newSlide;
    setCurrentSlide(newSlide);
    overscrollAccumulator.current = 0; // Reset accumulator on slide change
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (transitionState !== 'idle') return; // Block input during transition
    const clamped = Math.max(0, Math.min(totalSlides - 1, index));
    if (clamped !== slideRef.current) {
      // Check if this is the internal Strategy slide transition (6 <-> 7)
      const isStrategySwap = (slideRef.current === 6 && clamped === 7) || (slideRef.current === 7 && clamped === 6);
      
      // 1. Start exiting content
      setTransitionData({ from: slideRef.current, to: clamped });
      setTransitionState('exiting');
      
      // 2. Wait for content to disappear (600ms), then move camera
      setTimeout(() => {
        updateSlide(clamped);
        setTransitionState('moving');
        
        // 3. Wait for camera to settle (1400ms normally, 50ms for strategy swap), then show new content
        setTimeout(() => {
          setTransitionState('idle');
          setTransitionData(null);
        }, isStrategySwap ? 50 : 1400);
      }, 600);
    }
  }, [totalSlides, updateSlide, transitionState]);

  const next = useCallback(() => {
    goToSlide(slideRef.current + 1);
  }, [goToSlide]);

  const prev = useCallback(() => {
    goToSlide(slideRef.current - 1);
  }, [goToSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        next();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Find scrollable container
      let target = e.target as HTMLElement;
      let scrollable: HTMLElement | null = null;
      
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        const overflowY = style.overflowY;
        // Check if element is scrollable and has content to scroll
        const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
        
        if (isScrollable) {
          scrollable = target;
          break;
        }
        target = target.parentElement as HTMLElement;
      }

      const now = Date.now();
      // Reset accumulator if scrolling stops for a bit (debounce)
      if (now - lastScrollTime.current > 200) {
         overscrollAccumulator.current = 0;
      }
      lastScrollTime.current = now;

      if (scrollable) {
        // We are in a scrollable area. Check if at boundaries.
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) < 2.0;

        // If not at boundary, let native scroll happen
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
          overscrollAccumulator.current = 0;
          return;
        }
        
        // At boundary - accumulate overscroll
        e.preventDefault();
        overscrollAccumulator.current += e.deltaY;
      } else {
        // Not in scrollable area - default behavior with threshold
        e.preventDefault();
        overscrollAccumulator.current += e.deltaY;
      }

      // Check threshold
      if (Math.abs(overscrollAccumulator.current) > OVERSCROLL_THRESHOLD) {
        if (overscrollAccumulator.current > 0) {
          next();
          overscrollAccumulator.current = 0;
        } else {
          prev();
          overscrollAccumulator.current = 0;
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) next();
        else prev();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [next, prev]);

  return { currentSlide, next, prev, goToSlide, transitionState, transitionData };
}
