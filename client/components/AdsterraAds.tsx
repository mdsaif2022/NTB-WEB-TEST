import React, { useEffect } from 'react';

const AdsterraAds: React.FC = () => {
  useEffect(() => {
    // Load Adsterra Popunder Script
    const loadPopunderScript = () => {
      if (!document.querySelector('script[src*="pl27831213.effectivegatecpm.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl27831213.effectivegatecpm.com/22/61/3f/22613f9c4d51cc586b52e81ec81554b7.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Adsterra Popunder script loaded successfully');
        };
        
        script.onerror = () => {
          console.warn('Adsterra Popunder script failed to load');
        };
        
        document.head.appendChild(script);
      }
    };

    // Load Adsterra SocialBar Script
    const loadSocialBarScript = () => {
      if (!document.querySelector('script[src*="pl27831226.effectivegatecpm.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl27831226.effectivegatecpm.com/3c/00/d5/3c00d5ac864175d19630e24d8d0fb487.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Adsterra SocialBar script loaded successfully');
        };
        
        script.onerror = () => {
          console.warn('Adsterra SocialBar script failed to load');
        };
        
        document.head.appendChild(script);
      }
    };

    // Load scripts after a short delay to ensure page is ready
    const timer = setTimeout(() => {
      loadPopunderScript();
      loadSocialBarScript();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // This component doesn't render anything visible
  // It only loads the Adsterra scripts
  return null;
};

export default AdsterraAds;
