import { useState, useRef } from 'react'

export const useCardCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const leaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Mouse handlers to expand/collapse on hover
  const handleMouseEnter = () => {
    // Clear any pending collapse
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    // Add delay to prevent accidental collapses
    leaveTimeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 200);
  };

  return { 
    isCollapsed, 
    mouseHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
}