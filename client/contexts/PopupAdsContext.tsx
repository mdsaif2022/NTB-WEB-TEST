import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, set, get, remove, onValue, off } from 'firebase/database';
import { realtimeDb } from '@/lib/firebaseConfig';

export interface PopupAd {
  id: number;
  title: string;
  description: string;
  image?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  position: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  showDelay: number; // seconds
  autoClose: boolean;
  autoCloseDelay: number; // seconds
  maxShows: number; // max times to show per user
  isActive: boolean;
  targetAudience: 'all' | 'new' | 'returning' | 'verified';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PopupAdsContextType {
  popupAds: PopupAd[];
  loading: boolean;
  addPopupAd: (ad: Omit<PopupAd, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PopupAd>;
  updatePopupAd: (id: number, ad: Partial<PopupAd>) => Promise<void>;
  deletePopupAd: (id: number) => Promise<void>;
  getActivePopupAds: () => PopupAd[];
  shouldShowPopup: (ad: PopupAd) => boolean;
  markPopupShown: (adId: number) => void;
  getPopupShowCount: (adId: number) => number;
  hasUserSeenPopup: (adId: number) => boolean;
  markPopupSeen: (adId: number) => void;
}

const PopupAdsContext = createContext<PopupAdsContextType | undefined>(undefined);

const initialPopupAds: PopupAd[] = [
  {
    id: 1,
    title: "🎉 Welcome to NTB Tours!",
    description: "Discover the beauty of Bangladesh with our amazing tour packages. Book now and get special discounts!",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#10b981",
    position: "center",
    size: "medium",
    showDelay: 2,
    autoClose: true,
    autoCloseDelay: 8,
    maxShows: 1,
    isActive: true,
    targetAudience: "all",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "📱 Download Our App",
    description: "Get exclusive deals and easier booking with our mobile app!",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    buttonText: "Download",
    buttonLink: "/app-download",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#3b82f6",
    position: "bottom-right",
    size: "small",
    showDelay: 5,
    autoClose: false,
    autoCloseDelay: 0,
    maxShows: 1,
    isActive: true,
    targetAudience: "verified",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const PopupAdsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds);
  const [loading, setLoading] = useState(true);

  // Load popup ads from Firebase Realtime Database
  useEffect(() => {
    if (!realtimeDb) {
      console.warn('Firebase Realtime Database not available, using local storage');
      console.warn('To enable Realtime Database: https://console.firebase.google.com/project/narayanganj-traveller-bd/database');
      const saved = localStorage.getItem('popupAds');
      if (saved) {
        try {
          setPopupAds(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing saved popup ads:', error);
          setPopupAds(initialPopupAds);
        }
      } else {
        setPopupAds(initialPopupAds);
        // Save initial ads to localStorage
        localStorage.setItem('popupAds', JSON.stringify(initialPopupAds));
      }
      setLoading(false);
      return;
    }

    const popupAdsRef = ref(realtimeDb, 'popupAds');
    
    const unsubscribe = onValue(popupAdsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adsArray = Object.values(data) as PopupAd[];
        setPopupAds(adsArray);
        // Also save to localStorage as backup
        localStorage.setItem('popupAds', JSON.stringify(adsArray));
      } else {
        // If no data in Firebase, initialize with default ads
        setPopupAds(initialPopupAds);
        // Save initial ads to Firebase
        initialPopupAds.forEach(ad => {
          set(ref(realtimeDb, `popupAds/${ad.id}`), ad);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading popup ads:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('popupAds');
      if (saved) {
        setPopupAds(JSON.parse(saved));
      }
      setLoading(false);
    });

    return () => {
      off(popupAdsRef, 'value', unsubscribe);
    };
  }, []);

  const addPopupAd = async (ad: Omit<PopupAd, 'id' | 'createdAt' | 'updatedAt'>): Promise<PopupAd> => {
    const newAd: PopupAd = {
      ...ad,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (realtimeDb) {
      try {
        await set(ref(realtimeDb, `popupAds/${newAd.id}`), newAd);
      } catch (error) {
        console.error('Error adding popup ad to Firebase:', error);
      }
    }
    
    setPopupAds(prev => [...prev, newAd]);
    localStorage.setItem('popupAds', JSON.stringify([...popupAds, newAd]));
    return newAd;
  };

  const updatePopupAd = async (id: number, ad: Partial<PopupAd>) => {
    const updatedAd = { ...ad, updatedAt: new Date().toISOString() };
    
    if (realtimeDb) {
      try {
        await set(ref(realtimeDb, `popupAds/${id}`), { ...popupAds.find(a => a.id === id), ...updatedAd });
      } catch (error) {
        console.error('Error updating popup ad in Firebase:', error);
      }
    }
    
    setPopupAds(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updatedAd }
          : item
      )
    );
    localStorage.setItem('popupAds', JSON.stringify(popupAds.map(item => 
      item.id === id ? { ...item, ...updatedAd } : item
    )));
  };

  const deletePopupAd = async (id: number) => {
    if (realtimeDb) {
      try {
        await remove(ref(realtimeDb, `popupAds/${id}`));
      } catch (error) {
        console.error('Error deleting popup ad from Firebase:', error);
      }
    }
    
    setPopupAds(prev => prev.filter(item => item.id !== id));
    localStorage.setItem('popupAds', JSON.stringify(popupAds.filter(item => item.id !== id)));
  };

  const getActivePopupAds = (): PopupAd[] => {
    const now = new Date();
    return popupAds.filter(ad => 
      ad.isActive && 
      new Date(ad.startDate) <= now && 
      new Date(ad.endDate) >= now
    );
  };

  const getPopupShowCount = (adId: number): number => {
    const key = `popupAd_${adId}_shows`;
    return parseInt(localStorage.getItem(key) || '0');
  };

  const markPopupShown = (adId: number) => {
    const key = `popupAd_${adId}_shows`;
    const currentCount = getPopupShowCount(adId);
    localStorage.setItem(key, (currentCount + 1).toString());
  };

  const hasUserSeenPopup = (adId: number): boolean => {
    const key = `popupAd_${adId}_seen`;
    return localStorage.getItem(key) === 'true';
  };

  const markPopupSeen = (adId: number) => {
    const key = `popupAd_${adId}_seen`;
    localStorage.setItem(key, 'true');
  };

  const shouldShowPopup = (ad: PopupAd): boolean => {
    // Check if user has already seen this popup (one-time display)
    if (hasUserSeenPopup(ad.id)) {
      return false;
    }

    const showCount = getPopupShowCount(ad.id);
    
    // Check if max shows reached
    if (showCount >= ad.maxShows) {
      return false;
    }

    // Check target audience
    const userVerificationStatus = localStorage.getItem('userVerified') === 'true';
    const isNewUser = !localStorage.getItem('userVisited');
    
    switch (ad.targetAudience) {
      case 'new':
        return isNewUser;
      case 'returning':
        return !isNewUser;
      case 'verified':
        return userVerificationStatus;
      case 'all':
      default:
        return true;
    }
  };

  const value: PopupAdsContextType = {
    popupAds,
    loading,
    addPopupAd,
    updatePopupAd,
    deletePopupAd,
    getActivePopupAds,
    shouldShowPopup,
    markPopupShown,
    getPopupShowCount,
    hasUserSeenPopup,
    markPopupSeen,
  };

  return (
    <PopupAdsContext.Provider value={value}>
      {children}
    </PopupAdsContext.Provider>
  );
};

export const usePopupAds = () => {
  const context = useContext(PopupAdsContext);
  if (context === undefined) {
    throw new Error('usePopupAds must be used within a PopupAdsProvider');
  }
  return context;
};
