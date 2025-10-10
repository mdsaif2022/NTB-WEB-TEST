import React, { useEffect, useRef } from 'react';

const AdBanner = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load the AdSense script only once
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7550212696162488';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
    // Push adsbygoogle after script is loaded
    if (typeof window !== 'undefined' && adRef.current) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="my-8 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-7550212696162488"
        data-ad-slot="1046984247"
        ref={adRef}
      ></ins>
    </div>
  );
};

export default AdBanner; 