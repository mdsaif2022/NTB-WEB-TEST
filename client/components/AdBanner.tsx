import React, { useEffect, useRef, useState } from 'react';

const AdBanner = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load the AdSense script only once
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7550212696162488';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setScriptLoaded(true);
      };
      
      script.onerror = () => {
        console.warn('AdSense script failed to load');
      };
      
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Only push ads after script is loaded and container is ready
    if (scriptLoaded && adRef.current && typeof window !== 'undefined') {
      try {
        // Wait for next tick to ensure container is rendered
        setTimeout(() => {
          if (adRef.current) {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
          }
        }, 100);
      } catch (e) {
        console.warn('AdSense push failed:', e);
      }
    }
  }, [scriptLoaded]);

  return (
    <div className="my-8 flex justify-center">
      <div 
        ref={adRef}
        className="w-full max-w-4xl"
        style={{ minWidth: '250px', minHeight: '100px' }}
      >
        <ins
          className="adsbygoogle"
          style={{ 
            display: 'block',
            width: '100%',
            minWidth: '250px',
            minHeight: '100px'
          }}
          data-ad-format="fluid"
          data-ad-layout-key="-6t+ed+2i-1n-4w"
          data-ad-client="ca-pub-7550212696162488"
          data-ad-slot="1046984247"
        ></ins>
      </div>
    </div>
  );
};

export default AdBanner; 