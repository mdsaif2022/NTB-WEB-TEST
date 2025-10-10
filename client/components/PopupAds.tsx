import React, { useState, useEffect } from 'react';
import { usePopupAds } from '@/contexts/PopupAdsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ExternalLink } from 'lucide-react';

interface PopupAdProps {
  ad: any;
  onClose: () => void;
}

const PopupAdComponent: React.FC<PopupAdProps> = ({ ad, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ad.autoCloseDelay);

  useEffect(() => {
    // Show popup after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, ad.showDelay * 1000);

    return () => clearTimeout(showTimer);
  }, [ad.showDelay]);

  useEffect(() => {
    if (!ad.autoClose || !isVisible) return;

    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [ad.autoClose, isVisible, onClose]);

  const handleButtonClick = () => {
    if (ad.buttonLink.startsWith('http')) {
      window.open(ad.buttonLink, '_blank');
    } else {
      window.location.href = ad.buttonLink;
    }
    onClose();
  };

  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (ad.position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getSizeClasses = () => {
    switch (ad.size) {
      case 'small':
        return 'w-80 max-w-sm';
      case 'large':
        return 'w-96 max-w-md';
      case 'medium':
      default:
        return 'w-80 max-w-sm';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <Card 
        className={`relative ${getSizeClasses()} animate-in zoom-in-95 duration-300`}
        style={{
          backgroundColor: ad.backgroundColor,
          color: ad.textColor,
          border: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <CardContent className="p-6">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/20 z-10"
            style={{ color: ad.textColor }}
            title="Close popup"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Content */}
          <div className="space-y-4">
            {/* Image */}
            {ad.image && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-center">
              {ad.title}
            </h3>

            {/* Description */}
            <p className="text-center text-sm opacity-90 leading-relaxed">
              {ad.description}
            </p>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleButtonClick}
                className="px-6 py-2 font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: ad.buttonColor,
                  color: ad.buttonTextColor,
                }}
              >
                {ad.buttonText}
                {ad.buttonLink.startsWith('http') && (
                  <ExternalLink className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Auto-close countdown */}
            {ad.autoClose && timeLeft > 0 && (
              <div className="text-center text-xs opacity-75">
                Auto-closes in {timeLeft}s
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PopupAds() {
  const { getActivePopupAds, shouldShowPopup, markPopupShown, markPopupSeen, loading } = usePopupAds();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // Check if we're on admin panel - don't show popup ads there
  const isAdminPanel = window.location.pathname.startsWith('/admin');

  // Mark user as visited (for targeting)
  useEffect(() => {
    localStorage.setItem('userVisited', 'true');
  }, []);

  // Get active ads (moved before conditional return)
  const activeAds = getActivePopupAds().filter(shouldShowPopup);

  // Handle popup display logic
  useEffect(() => {
    if (activeAds.length === 0) return;

    const currentAd = activeAds[currentAdIndex];
    if (currentAd) {
      setShowPopup(true);
    }
  }, [activeAds, currentAdIndex]);

  // Don't show popup ads on admin panel
  if (isAdminPanel || loading) {
    return null;
  }

  const handleClose = () => {
    const currentAd = activeAds[currentAdIndex];
    if (currentAd) {
      markPopupShown(currentAd.id);
      markPopupSeen(currentAd.id); // Mark as seen so it won't show again
    }
    
    setShowPopup(false);
    
    // Show next ad after a delay (only if there are more ads)
    setTimeout(() => {
      if (currentAdIndex < activeAds.length - 1) {
        setCurrentAdIndex(prev => prev + 1);
      } else {
        setCurrentAdIndex(0);
      }
    }, 1000);
  };

  if (!showPopup || activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentAdIndex];
  if (!currentAd) return null;

  return <PopupAdComponent ad={currentAd} onClose={handleClose} />;
}
