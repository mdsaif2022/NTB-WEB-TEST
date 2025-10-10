import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
    
    // Also scroll to top after a short delay to handle any async loading
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
