import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import React from "react";
import { bookingService } from "@/lib/firebaseServices";
import { emailService } from "@/lib/emailService";

export interface Booking {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  tourId: number;
  tourName: string;
  from: string;
  to: string;
  date: string;
  persons: number;
  selectedSeats: string[];
  notes: string;
  amount: number;
  status: "pending" | "confirmed" | "cancelled";
  transactionId: string;
  paymentProof?: string;
  bookingDate: string;
}

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  addBooking: (booking: Omit<Booking, "id" | "bookingDate">) => Promise<Booking | null>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
  getRecentBookings: (limit?: number) => Booking[];
  getPendingBookings: () => Booking[];
  getConfirmedBookings: () => Booking[];
  refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookings: Booking[] = [
  {
    id: "1",
    user: {
      name: "Sarah Ahmed",
      email: "sarah@email.com",
      phone: "+880 1700-123456",
    },
    tourId: 1,
    tourName: "Sundarbans Adventure",
    from: "Dhaka",
    to: "Khulna",
    date: "2024-01-25",
    persons: 2,
    selectedSeats: ["A1", "A2"],
    notes:
      "We have dietary restrictions - vegetarian meals only. Also, my wife has mild claustrophobia, so please avoid confined spaces during the boat tour.",
    amount: 30000,
    status: "confirmed",
    transactionId: "BKash123456789",
    bookingDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    user: {
      name: "Rahul Khan",
      email: "rahul@email.com",
      phone: "+880 1700-234567",
    },
    tourId: 2,
    tourName: "Cox's Bazar Getaway",
    from: "Chittagong",
    to: "Cox's Bazar",
    date: "2024-01-30",
    persons: 1,
    selectedSeats: ["B3"],
    notes:
      "First time visiting Cox's Bazar. Would appreciate recommendations for local seafood restaurants. I'm particularly interested in photography spots for sunrise.",
    amount: 8000,
    status: "pending",
    transactionId: "BKash987654321",
    bookingDate: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    user: {
      name: "Maya Begum",
      email: "maya@email.com",
      phone: "+880 1700-345678",
    },
    tourId: 3,
    tourName: "Srimangal Tea Tour",
    from: "Sylhet",
    to: "Srimangal",
    date: "2024-02-05",
    persons: 3,
    selectedSeats: ["C1", "C2", "C3"],
    notes:
      "Traveling with elderly parents (65+ years). Please ensure comfortable seating and slower pace during walking tours. Mother is diabetic, please have glucose available.",
    amount: 19500,
    status: "confirmed",
    transactionId: "BKash456789123",
    bookingDate: "2024-01-13T09:20:00Z",
  },
  {
    id: "4",
    user: {
      name: "David Smith",
      email: "david@email.com",
      phone: "+880 1700-456789",
    },
    tourId: 4,
    tourName: "Historical Dhaka",
    from: "Gazipur",
    to: "Dhaka",
    date: "2024-01-28",
    persons: 1,
    selectedSeats: ["D1"],
    notes:
      "International tourist, very interested in Mughal architecture and local history. Please arrange English-speaking guide. Also interested in traditional craft shopping.",
    amount: 3500,
    status: "confirmed",
    transactionId: "BKash789123456",
    bookingDate: "2024-01-12T14:15:00Z",
  },
  {
    id: "5",
    user: {
      name: "Fatima Rahman",
      email: "fatima@email.com",
      phone: "+880 1700-567890",
    },
    tourId: 1,
    tourName: "Sundarbans Adventure",
    from: "Dhaka",
    to: "Khulna",
    date: "2024-02-10",
    persons: 4,
    selectedSeats: ["E1", "E2", "E3", "E4"],
    notes:
      "Family trip with two children (ages 8 and 12). Please ensure life jackets for kids. Children are excited about wildlife - hope to see Royal Bengal Tigers!",
    amount: 60000,
    status: "pending",
    transactionId: "BKash345678912",
    bookingDate: "2024-01-16T11:00:00Z",
  },
];

const BOOKINGS_STORAGE_KEY = "echoForgeBookings";

const loadBookingsFromStorage = (): Booking[] => {
  try {
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.error("Error loading bookings from storage", e); }
  return initialBookings;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings from Firebase Realtime Database
  useEffect(() => {
    const loadBookings = async () => {
      console.log('BookingContext: Starting to load bookings...');
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('BookingContext: Timeout reached, using localStorage fallback');
        const localBookings = loadBookingsFromStorage();
        setBookings(localBookings);
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const firebaseBookings = await bookingService.getAllBookings();
        clearTimeout(timeoutId);
        console.log('BookingContext: Firebase bookings loaded:', firebaseBookings.length);
        if (firebaseBookings.length > 0) {
          setBookings(firebaseBookings);
        } else {
          // Fallback to localStorage if no Firebase data
          console.log('BookingContext: No Firebase data, using localStorage fallback');
          const localBookings = loadBookingsFromStorage();
          setBookings(localBookings);
          // Save to Firebase for future use
          localBookings.forEach(booking => {
            bookingService.addBooking(booking);
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('BookingContext: Error loading bookings:', error);
        // Fallback to localStorage
        const localBookings = loadBookingsFromStorage();
        setBookings(localBookings);
      } finally {
        console.log('BookingContext: Loading completed, setting loading to false');
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  // Listen to Firebase Realtime Database changes
  useEffect(() => {
    console.log('BookingContext: Setting up Firebase listener...');
    const unsubscribe = bookingService.onBookingsChange((firebaseBookings) => {
      console.log('BookingContext: Firebase listener triggered', {
        firebaseBookingsCount: firebaseBookings.length,
        sampleBookings: firebaseBookings.slice(0, 3).map(b => ({ id: b.id, status: b.status, userEmail: b.user?.email }))
      });
      
      // Always update state when Firebase data changes for real-time sync
      console.log('BookingContext: Updating state with Firebase data');
      setBookings(firebaseBookings);
        
        // Also save to localStorage as backup (compressed version)
        try {
          // Create compressed version with only essential fields
          const compressedBookings = firebaseBookings.map(booking => ({
            id: booking.id,
            user: {
              name: booking.user?.name,
              email: booking.user?.email,
              phone: booking.user?.phone
            },
            tourId: booking.tourId,
            tourName: booking.tourName,
            status: booking.status,
            bookingDate: booking.bookingDate,
            amount: booking.amount,
            // Skip large fields like selectedSeats, customerInfo
          }));
          
          const bookingsData = JSON.stringify(compressedBookings);
          if (bookingsData.length > 2 * 1024 * 1024) { // Reduced to 2MB limit
            console.warn("Bookings data too large for localStorage, skipping save");
          } else {
            localStorage.setItem(BOOKINGS_STORAGE_KEY, bookingsData);
            console.log(`Saved ${firebaseBookings.length} bookings to localStorage (${Math.round(bookingsData.length / 1024)}KB)`);
          }
        } catch (e) { 
          console.error("Error saving bookings to storage", e);
          if (e instanceof Error && e.name === 'QuotaExceededError') {
            try {
              localStorage.removeItem(BOOKINGS_STORAGE_KEY);
              console.log("Cleared old bookings data due to quota exceeded");
              
              // Try saving minimal version
              const minimalBookings = firebaseBookings.slice(0, 20).map(booking => ({
                id: booking.id,
                tourName: booking.tourName,
                status: booking.status,
                amount: booking.amount
              }));
              localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(minimalBookings));
              console.log("Saved minimal bookings data");
            } catch (clearError) {
              console.error("Error clearing localStorage:", clearError);
            }
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const addBooking = async (newBooking: Omit<Booking, "id" | "bookingDate">) => {
    try {
      const bookingData = {
        ...newBooking,
        bookingDate: new Date().toISOString(),
      };
      
      const addedBooking = await bookingService.addBooking(bookingData);
      if (addedBooking) {
        // Firebase listener will update the state automatically
        console.log("Booking added successfully");
        
        // Send email notification to admin
        try {
          await emailService.sendBookingNotification(addedBooking);
          console.log("Booking notification email sent to admin");
        } catch (emailError) {
          console.error("Error sending booking notification email:", emailError);
          // Don't fail the booking if email fails
        }

        // Send confirmation email to user
        try {
          await emailService.sendUserBookingConfirmation(addedBooking);
          console.log("Booking confirmation email sent to user");
        } catch (emailError) {
          console.error("Error sending user booking confirmation email:", emailError);
          // Don't fail the booking if email fails
        }
        
        return addedBooking;
      }
      return null;
    } catch (error) {
      console.error('Error adding booking:', error);
      return null;
    }
  };

  const updateBooking = async (id: string, updatedBooking: Partial<Booking>) => {
    const previousBooking = bookings.find(b => b.id === id);
    const previousStatus = previousBooking?.status;

    try {
      console.log('BookingContext: Updating booking in Firebase:', { id, updatedBooking });
      
      // Update in Firebase - the listener will handle state updates
      const success = await bookingService.updateBooking(id, updatedBooking);
      if (!success) {
        console.error('Failed to update booking in Firebase');
        return;
      }

      console.log('BookingContext: Booking updated in Firebase successfully');

      // Send user email notification if status changed
      if (updatedBooking.status && previousStatus && updatedBooking.status !== previousStatus) {
        const updatedBookingObj = bookings.find(b => b.id === id);
        if (updatedBookingObj) {
          try {
            await emailService.sendUserBookingStatusUpdate(updatedBookingObj, previousStatus, updatedBooking.status);
            console.log(`Booking status update email sent to user: ${previousStatus} → ${updatedBooking.status}`);
          } catch (emailError) {
            console.error("Error sending user booking status update email:", emailError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      console.log('BookingContext: Deleting booking from Firebase:', id);
      
      // Delete from Firebase - the listener will handle state updates
      const success = await bookingService.deleteBooking(id);
      if (success) {
        console.log("Booking deleted successfully from Firebase");
      } else {
        console.error("Failed to delete booking from Firebase");
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const getBookingById = (id: string) => {
    return bookings.find((booking) => booking.id === id);
  };

  const getRecentBookings = (limit: number = 5) => {
    return bookings
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      )
      .slice(0, limit);
  };

  const getPendingBookings = () => {
    return bookings.filter((booking) => booking.status === "pending");
  };

  const getConfirmedBookings = () => {
    return bookings.filter((booking) => booking.status === "confirmed");
  };

  const refreshBookings = async () => {
    console.log('BookingContext: Force refreshing bookings...');
    setLoading(true);
    try {
      const firebaseBookings = await bookingService.getAllBookings();
      console.log('BookingContext: Refreshed bookings from Firebase:', firebaseBookings.length);
      setBookings(firebaseBookings);
    } catch (error) {
      console.error('BookingContext: Error refreshing bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        addBooking,
        updateBooking,
        deleteBooking,
        getBookingById,
        getRecentBookings,
        getPendingBookings,
        getConfirmedBookings,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
};
