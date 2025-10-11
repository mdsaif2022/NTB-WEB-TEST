import React, { useEffect, useState } from 'react';

const AdsterraAds: React.FC = () => {
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);

  useEffect(() => {
    // Check if user has disabled ads
    const adsDisabled = localStorage.getItem('adsterra-ads-disabled');
    if (adsDisabled === 'true') {
      setAdsEnabled(false);
      return;
    }

    // Load Adsterra SocialBar Script (less intrusive)
    const loadSocialBarScript = () => {
      if (!document.querySelector('script[src*="pl27831226.effectivegatecpm.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://pl27831226.effectivegatecpm.com/3c/00/d5/3c00d5ac864175d19630e24d8d0fb487.js';
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

    // Load popunder script only after user interaction and with delays
    const loadPopunderScript = () => {
      const now = Date.now();
      // Only show popunder if:
      // 1. User has clicked at least 3 times
      // 2. At least 30 seconds have passed since last ad
      // 3. User is not on admin pages
      if (clickCount >= 3 && (now - lastAdTime) > 30000 && !window.location.pathname.includes('/admin')) {
        if (!document.querySelector('script[src*="pl27831213.effectivegatecpm.com"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://pl27831213.effectivegatecpm.com/22/61/3f/22613f9c4d51cc586b52e81ec81554b7.js';
          script.async = true;
          
          script.onload = () => {
            console.log('Adsterra Popunder script loaded successfully');
            setLastAdTime(now);
            setClickCount(0); // Reset click count after showing ad
          };
          
          script.onerror = () => {
            console.warn('Adsterra Popunder script failed to load');
          };
          
          document.head.appendChild(script);
        }
      }
    };

    // Track clicks globally
    const handleClick = (e: MouseEvent) => {
      // Don't count clicks on admin elements or ad controls
      const target = e.target as HTMLElement;
      if (target.closest('.ad-controls') || target.closest('[data-no-ad]')) {
        return;
      }
      
      setClickCount(prev => prev + 1);
      loadPopunderScript();
    };

    // Load social bar immediately
    loadSocialBarScript();

    // Add click listener
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [clickCount, lastAdTime]);

  const disableAds = () => {
    setAdsEnabled(false);
    localStorage.setItem('adsterra-ads-disabled', 'true');
    
    // Remove existing ad scripts
    const existingScripts = document.querySelectorAll('script[src*="effectivegatecpm.com"]');
    existingScripts.forEach(script => script.remove());
  };

  const enableAds = () => {
    setAdsEnabled(true);
    localStorage.removeItem('adsterra-ads-disabled');
    window.location.reload(); // Reload to reinitialize ads
  };

  // Don't render anything if ads are disabled
  if (!adsEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={enableAds}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          Enable Ads
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 ad-controls">
      <button
        onClick={disableAds}
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        title="Disable ads"
      >
        ×
      </button>
    </div>
  );
};

export default AdsterraAds;
