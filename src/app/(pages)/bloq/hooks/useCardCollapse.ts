import { useState, useRef, useEffect } from 'react'

export const useCardCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (scrollY > 50 && !hasScrolled) {
        setHasScrolled(true)
        setIsCollapsed(true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [hasScrolled])

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
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