import { useState, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

export const useScrollCollapse = () => {
  const { scrollY } = useScroll();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Micro-optimization: only update if crossing threshold
    // Hysteresis: Collapse > 60, Expand < 20
    if (latest > 70 && !isCollapsed) {
      setIsCollapsed(true);
    } else if (latest < 1 && isCollapsed) {
      setIsCollapsed(false);
    }
    lastYRef.current = latest;
  });

  return isCollapsed;
}
