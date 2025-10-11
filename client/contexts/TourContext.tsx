import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { tourService } from "@/lib/firebaseServices";

export interface Tour {
  id: number;
  name: string;
  location: string;
  destination: string;
  duration: string;
  maxParticipants: number;
  price: number;
  rating: number;
  status: "active" | "draft" | "inactive";
  bookings: number;
  image: string;
  images?: string[]; // Cloudinary image URLs
  videos?: string[]; // Cloudinary video URLs
  description: string;
  highlights: string[];
  includes: string[];
  enableSeatSelection: boolean;
  createdDate: string;
}

interface TourContextType {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  addTour: (
    tour: Omit<Tour, "id" | "rating" | "bookings" | "createdDate">,
  ) => Promise<Tour | null>;
  updateTour: (id: number, tour: Partial<Tour>) => Promise<void>;
  deleteTour: (id: number) => Promise<void>;
  getTourById: (id: number) => Tour | undefined;
  getActiveTours: () => Tour[];
  refreshTours: () => void;
  clearError: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const initialTours: Tour[] = [
  {
    id: 1,
    name: "Sundarbans Adventure",
    location: "Khulna Division",
    destination: "Khulna",
    duration: "3 Days",
    maxParticipants: 12,
    price: 15000,
    rating: 4.9,
    status: "active",
    bookings: 142,
    image: "🌿",
    description:
      "Explore the world's largest mangrove forest and spot Bengal tigers in their natural habitat.",
    highlights: ["Royal Bengal Tiger", "Boat Safari", "Mangrove Ecosystem"],
    includes: ["Accommodation", "Meals", "Guide", "Transportation"],
    enableSeatSelection: true,
    createdDate: "2024-01-01",
  },
  {
    id: 2,
    name: "Cox's Bazar Beach",
    location: "Chittagong Division",
    destination: "Cox's Bazar",
    duration: "2 Days",
    maxParticipants: 20,
    price: 8000,
    rating: 4.8,
    status: "active",
    bookings: 98,
    image: "🏖️",
    description:
      "Experience the world's longest natural sea beach with golden sand and stunning sunsets.",
    highlights: ["Longest Sea Beach", "Sunset Views", "Water Sports"],
    includes: ["Hotel Stay", "Breakfast", "Transportation"],
    enableSeatSelection: true,
    createdDate: "2024-01-02",
  },
  {
    id: 3,
    name: "Srimangal Tea Gardens",
    location: "Sylhet Division",
    destination: "Sylhet",
    duration: "2 Days",
    maxParticipants: 15,
    price: 6500,
    rating: 4.7,
    status: "active",
    bookings: 76,
    image: "🍃",
    description:
      "Walk through rolling hills covered in lush tea gardens and learn about tea culture.",
    highlights: ["Tea Plantations", "Lawachara Forest", "Tribal Culture"],
    includes: ["Accommodation", "Tea Tasting", "Forest Guide"],
    enableSeatSelection: false,
    createdDate: "2024-01-03",
  },
  {
    id: 4,
    name: "Historical Dhaka",
    location: "Dhaka Division",
    destination: "Dhaka",
    duration: "1 Day",
    maxParticipants: 25,
    price: 3500,
    rating: 4.6,
    status: "draft",
    bookings: 0,
    image: "🏛️",
    description:
      "Discover ancient architecture, vibrant markets, and rich Mughal heritage.",
    highlights: ["Lalbagh Fort", "Old Dhaka", "Mughal Architecture"],
    includes: ["Guide", "Lunch", "Entry Tickets"],
    enableSeatSelection: true,
    createdDate: "2024-01-15",
  },
  {
    id: 5,
    name: "Bandarban Hills",
    location: "Chittagong Division",
    destination: "Bandarban",
    duration: "3 Days",
    maxParticipants: 10,
    price: 12000,
    rating: 4.5,
    status: "active",
    bookings: 45,
    image: "⛰️",
    description:
      "Adventure through the hills and valleys of Bandarban with tribal culture experience.",
    highlights: ["Hill Trekking", "Tribal Villages", "Natural Springs"],
    includes: ["Camping", "Local Guide", "Meals"],
    enableSeatSelection: false,
    createdDate: "2024-01-10",
  },
  {
    id: 6,
    name: "River Cruise",
    location: "Dhaka Division",
    destination: "Dhaka",
    duration: "1 Day",
    maxParticipants: 30,
    price: 5000,
    rating: 4.4,
    status: "active",
    bookings: 67,
    image: "🚤",
    description:
      "Enjoy a relaxing river cruise through the heart of Bangladesh.",
    highlights: ["River Views", "Local Life", "Traditional Boats"],
    includes: ["Boat Ride", "Lunch", "Guide"],
    enableSeatSelection: true,
    createdDate: "2024-01-12",
  },
];

// Local storage key for tours
const TOURS_STORAGE_KEY = "echoForgeTours";

// Helper function to load tours from localStorage
const loadToursFromStorage = (): Tour[] => {
  try {
    const savedTours = localStorage.getItem(TOURS_STORAGE_KEY);
    if (savedTours) {
      const parsedTours = JSON.parse(savedTours);
      // Validate that the parsed data is an array
      if (Array.isArray(parsedTours)) {
        return parsedTours;
      }
    }
  } catch (error) {
    console.error("Error loading tours from localStorage:", error);
  }
  return initialTours;
};

// Helper function to save tours to localStorage
const saveToursToStorage = (tours: Tour[]) => {
  try {
    const toursData = JSON.stringify(tours);
    
    // Check if data is too large (localStorage limit is ~5-10MB)
    if (toursData.length > 5 * 1024 * 1024) { // 5MB limit
      console.warn("Tours data too large for localStorage, skipping save");
      return;
    }
    
    localStorage.setItem(TOURS_STORAGE_KEY, toursData);
  } catch (error) {
    console.error("Error saving tours to localStorage:", error);
    
    // If quota exceeded, try to clear old data and retry
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(TOURS_STORAGE_KEY);
        console.log("Cleared old tours data due to quota exceeded");
      } catch (clearError) {
        console.error("Error clearing localStorage:", clearError);
      }
    }
  }
};

export function TourProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tours from Firebase Realtime Database
  useEffect(() => {
    const loadTours = async () => {
      console.log('TourContext: Starting to load tours...');
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('TourContext: Timeout reached, using localStorage fallback');
        const localTours = loadToursFromStorage();
        setTours(localTours);
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const firebaseTours = await tourService.getAllTours();
        clearTimeout(timeoutId);
        console.log('TourContext: Firebase tours loaded:', firebaseTours.length);
        if (firebaseTours.length > 0) {
          setTours(firebaseTours);
        } else {
          // Fallback to localStorage if no Firebase data
          console.log('TourContext: No Firebase data, using localStorage fallback');
          const localTours = loadToursFromStorage();
          setTours(localTours);
          // Save to Firebase for future use
          localTours.forEach(tour => {
            tourService.addTour(tour);
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('TourContext: Error loading tours:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tours');
        // Fallback to localStorage
        const localTours = loadToursFromStorage();
        setTours(localTours);
      } finally {
        console.log('TourContext: Loading completed, setting loading to false');
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  // Listen to Firebase Realtime Database changes
  useEffect(() => {
    const unsubscribe = tourService.onToursChange((firebaseTours) => {
      if (firebaseTours.length > 0) {
        setTours(firebaseTours);
        // Also save to localStorage as backup
        saveToursToStorage(firebaseTours);
      }
    });

    return unsubscribe;
  }, []);

  const addTour = async (
    newTour: Omit<Tour, "id" | "rating" | "bookings" | "createdDate">,
  ): Promise<Tour | null> => {
    try {
      const tourData = {
        ...newTour,
        rating: 0,
        bookings: 0,
        createdDate: new Date().toISOString().split("T")[0],
      };
      
      const addedTour = await tourService.addTour(tourData);
      if (addedTour) {
        // Firebase listener will update the state automatically
        return addedTour;
      }
      return null;
    } catch (error) {
      console.error('Error adding tour:', error);
      return null;
    }
  };

  const updateTour = async (id: number, updatedTour: Partial<Tour>) => {
    try {
      const success = await tourService.updateTour(id.toString(), updatedTour);
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Tour updated successfully");
      } else {
        console.error("Failed to update tour");
      }
    } catch (error) {
      console.error('Error updating tour:', error);
    }
  };

  const deleteTour = async (id: number) => {
    try {
      const success = await tourService.deleteTour(id.toString());
      if (success) {
        // Firebase listener will update the state automatically
        console.log("Tour deleted successfully");
      } else {
        console.error("Failed to delete tour");
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
    }
  };

  const getTourById = (id: number) => {
    return tours.find((tour) => tour.id === id);
  };

  const getActiveTours = () => {
    return tours.filter((tour) => tour.status === "active");
  };

  const refreshTours = () => {
    // Force a refresh by reloading from localStorage
    const storedTours = loadToursFromStorage();
    setTours(storedTours);
    setError(null); // Clear any previous errors
  };

  const clearError = () => {
    setError(null);
  };

  const value: TourContextType = {
    tours,
    loading,
    error,
    addTour,
    updateTour,
    deleteTour,
    getTourById,
    getActiveTours,
    refreshTours,
    clearError,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTours() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTours must be used within a TourProvider");
  }
  return context;
}
