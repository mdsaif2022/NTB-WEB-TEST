import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  CreditCard,
  Check,
  Upload,
  Clock,
  X,
} from "lucide-react";
import { useTours } from "@/contexts/TourContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useBookings } from "@/contexts/BookingContext";
import { useUser } from "@/contexts/UserContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Helmet } from 'react-helmet-async';
import { BusSeatMap } from "../../shared/api";
import { toast } from "@/components/ui/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn, Mail } from "lucide-react";
import EmailVerificationRequired from "@/components/EmailVerificationRequired";

const locations = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Gazipur",
];

// Generate 40-seat layout (A1-I4 + J,K,L,M at back)
const generateSeats = () => {
  const seats = [];
  // Rows A-I with 4 seats each (A1-A4, B1-B4, etc.)
  for (let row of ["A", "B", "C", "D", "E", "F", "G", "H", "I"]) {
    for (let num = 1; num <= 4; num++) {
      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        isAvailable: Math.random() > 0.3, // Random availability for demo
      });
    }
  }

  // Back row seats J, K, L, M
  for (let seat of ["J", "K", "L", "M"]) {
    seats.push({
      id: seat,
      row: seat,
      number: 1,
      isAvailable: Math.random() > 0.3,
    });
  }

  return seats;
};

// Add fetch and sync logic for backend seat map
const API_BASE = "/api/buses";

// Helper: IDs of the last 8 seats in bus 1
const LAST_8_SEATS = ["I1", "I2", "I3", "I4", "J", "K", "L", "M"];

const getSeatSelectionStorageKey = (tourId: string | number) => `echoForgeSeatSelection_${tourId}`;

export default function Booking() {
  const [searchParams] = useSearchParams();
  const { getTourById, tours, loading: toursLoading } = useTours();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { currentUser, userData, loading: authLoading } = useFirebaseAuth();
  const tourId = searchParams.get("tour");
  const selectedTour = tourId ? getTourById(tourId) : tours[0];

  // Debug logging
  useEffect(() => {
    console.log('Booking: Debug info', {
      tourId,
      totalTours: tours.length,
      selectedTour: selectedTour ? { id: selectedTour.id, name: selectedTour.name } : null,
      tours: tours.map(t => ({ id: t.id, name: t.name }))
    });
  }, [tourId, tours, selectedTour]);

  // Show loading while checking authentication or loading tours
  if (authLoading || toursLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">
          {authLoading ? "Loading authentication..." : "Loading tours..."}
        </p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Login Required</CardTitle>
              <CardDescription className="text-gray-600">
                You need to be logged in to book tours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please sign in to your account to continue with the booking process.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Link to="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </div>
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <span>Create Account</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user email is verified
  if (!currentUser.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Email Verification Required</CardTitle>
              <CardDescription className="text-gray-600">
                Please verify your email before booking tours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please verify your email or phone before booking. Check your email for the verification link.
                </AlertDescription>
              </Alert>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Email to verify:</p>
                    <p className="text-sm text-emerald-700 font-mono">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Link to="/auth/verify-email">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Verify Email</span>
                    </div>
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3">
                    <div className="flex items-center space-x-2">
                      <span>Back to Login</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedTour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Tour Not Found</h2>
        <p className="text-gray-600 mb-4">The selected tour does not exist. Please go back and select a valid tour.</p>
        <div className="text-sm text-gray-500 mb-4">
          <p>Debug Info:</p>
          <p>Tour ID: {tourId}</p>
          <p>Total Tours: {tours.length}</p>
          <p>Tours Loading: {toursLoading ? 'Yes' : 'No'}</p>
        </div>
        <Link to="/tours" className="mt-4 text-blue-600 underline">Back to Tours</Link>
      </div>
    );
  }
  const seatSelectionStorageKey = getSeatSelectionStorageKey(selectedTour.id);

  const [step, setStep] = useState(1);
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState<{
    from: string;
    to: string;
    persons: number;
    date: string;
    selectedSeatsByBus: string[][];
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    notes: string;
    transactionId: string;
    paymentProof: File | null;
  }>({
    from: "",
    to: selectedTour.destination, // Set fixed destination based on selected tour
    persons: 1,
    date: "",
    // Each bus has its own selectedSeats array
    selectedSeatsByBus: [[], []],
    customerInfo: {
      name: "",
      email: "",
      phone: "",
    },
    notes: "",
    transactionId: "",
    paymentProof: null,
  });

  // Add state for selected bus (0-based index)
  const [selectedBus, setSelectedBus] = useState(0); // 0 = Bus 1
  // For now, keep a single seats array (per-bus seat state comes next)
  const [seats] = useState(generateSeats());
  const summaryRef = useRef<HTMLDivElement>(null);
  const { addBooking, bookings } = useBookings();
  const { userProfile, setUserProfile } = useUser();
  const { addNotification } = useNotifications();

  // Backend seat map state (per tour)
  const [backendSeatMap, setBackendSeatMap] = useState<BusSeatMap>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Booking status state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'approved' | 'expired' | 'rejected' | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timer, setTimer] = useState<string>("");

  // Payment method settings
  const [paymentSettings, setPaymentSettings] = useState({ manualPayment: true, bkashPayment: false });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'manual' | 'bkash'>("manual");

  // Add modal state
  const [showNonThursdayPopup, setShowNonThursdayPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // Populate customer info from authenticated user
  useEffect(() => {
    if (currentUser && userData) {
      setBookingData(prev => ({
        ...prev,
        customerInfo: {
          name: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : currentUser.displayName || "",
          email: currentUser.email || "",
          phone: userData.phone || "",
        }
      }));
    }
  }, [currentUser, userData]);

  useEffect(() => {
    // Initialize payment settings from Firebase settings
    if (settings) {
      setPaymentSettings({
        manualPayment: settings?.enableManualPayment !== false, // Default to true
        bkashPayment: settings?.enableBkashPayment !== false, // Default to true
      });
      // Default to bKash if only bKash is enabled
      if (settings?.enableBkashPayment && !settings?.enableManualPayment) {
        setSelectedPaymentMethod("bkash");
      } else {
        setSelectedPaymentMethod("manual");
      }
    }
  }, [settings]);

  // Helper to format time left
  function getTimeLeft(expires: string) {
    const ms = new Date(expires).getTime() - Date.now();
    if (ms <= 0) return "Expired";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  // Helper: Check if user can access next bus (must be inside Booking to access backendSeatMaps)
  function canAccessNextBus() {
    const bus1Seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const availableSeats = bus1Seats.filter((s) => s.isAvailable).map((s) => s.id);
    // All 40 booked (no available seats)
    if (availableSeats.length === 0) return true;
    // Only last 8 seats remain, and all are in LAST_8_SEATS
    if (
      availableSeats.length === 8 &&
      LAST_8_SEATS.every((id) => availableSeats.includes(id))
    ) {
      return true;
    }
    return false;
  }

  // Initialize seat map for selected bus
  const fetchTourSeats = async () => {
    setLoadingSeats(true);
    try {
      // Use default seat map since we don't have backend API
      const defaultSeatMap = {
        rows: 10,
        seatsPerRow: 4,
        bookedSeats: [], // No pre-booked seats
      };
      setBackendSeatMap(defaultSeatMap);
    } finally {
      setLoadingSeats(false);
    }
  };

  // On mount or tour change, fetch seat map
  useEffect(() => {
    fetchTourSeats();
    // eslint-disable-next-line
  }, [selectedTour.id]);

  // Poll for seat map updates every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTourSeats();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTour.id]);

  // Generate or load a user/session ID for seat reservation
  // Use Firebase user ID if available, otherwise generate a temporary one
  const userId = currentUser?.uid || (() => {
    let id = localStorage.getItem('echoForgeUserId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('echoForgeUserId', id);
    }
    return id;
  })();

  // Load seat selection from localStorage on mount (per tour)
  useEffect(() => {
    const saved = localStorage.getItem(seatSelectionStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.selectedSeats)) {
          setBookingData(prev => ({ ...prev, selectedSeatsByBus: [parsed.selectedSeats] }));
        }
      } catch (e) { /* ignore */ }
    }
  }, [seatSelectionStorageKey]);

  // Save seat selection to localStorage whenever it changes (per tour)
  useEffect(() => {
    localStorage.setItem(seatSelectionStorageKey, JSON.stringify({ selectedSeats: bookingData.selectedSeatsByBus[0] }));
  }, [bookingData.selectedSeatsByBus, seatSelectionStorageKey]);

  // Listen for storage events to sync seat selection across tabs (per tour)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === seatSelectionStorageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed.selectedSeats)) {
            setBookingData(prev => ({ ...prev, selectedSeatsByBus: [parsed.selectedSeats] }));
          }
        } catch (e) { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [seatSelectionStorageKey]);

  // When user selects/deselects seats, POST to backend with userId and tourId
  const handleSeatSelect = (seatId: string) => {
    setBookingData((prev) => {
      const selectedSeats = prev.selectedSeatsByBus[0] || [];
      const newSelectedSeats = selectedSeats.includes(seatId)
        ? selectedSeats.filter((id) => id !== seatId)
        : selectedSeats.length < prev.persons
          ? [...selectedSeats, seatId]
          : selectedSeats;
      // POST to backend for this tour with userId
      // Seat selection is handled locally since we don't have backend API
      console.log("Seat selection updated locally:", newSelectedSeats);
      return {
        ...prev,
        selectedSeatsByBus: [newSelectedSeats],
      };
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only image files (JPG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setBookingData((prev) => ({
        ...prev,
        paymentProof: file,
      }));
    }
  };

  // After booking, store bookingId, status, expiresAt
  const handleConfirmBooking = async () => {
    // Validate required fields
    if (!bookingData.transactionId && !bookingData.paymentProof) {
      alert("Please provide either transaction ID or payment screenshot");
      return;
    }

    setIsConfirming(true);

    try {
      // Simulate API call for booking confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const bookingObj = {
        user: {
          name: bookingData.customerInfo.name,
          email: bookingData.customerInfo.email,
          phone: bookingData.customerInfo.phone,
        },
        tourId: selectedTour.id,
        tourName: selectedTour.name,
        from: bookingData.from,
        to: bookingData.to,
        date: bookingData.date,
        persons: bookingData.persons,
        selectedSeats: bookingData.selectedSeatsByBus[0], // Use selectedSeatsByBus
        notes: bookingData.notes,
        amount: selectedTour.price * bookingData.persons,
        status: 'pending' as 'pending',
        transactionId: bookingData.transactionId || '',
        // Only include paymentProof if it exists, otherwise omit the field entirely
        ...(bookingData.paymentProof && { paymentProof: bookingData.paymentProof.name }),
      };
      
      // Add booking and get the generated ID
      addBooking(bookingObj);
      
      // Get the latest booking (which should be the one we just added)
      const latestBooking = bookings[0]; // Since addBooking adds to the beginning
      
      // Update user profile tour history with the correct booking ID
      if (userProfile && setUserProfile && latestBooking) {
        const updatedPendingTours = [...(userProfile.pendingTours || []), String(latestBooking.id)];
        setUserProfile({ ...userProfile, pendingTours: updatedPendingTours });
      }
      
      setBookingId(String(latestBooking?.id || Date.now()));
      setBookingStatus('pending');
      // For demo, set expiresAt to 30 min from now
      setExpiresAt(new Date(Date.now() + 30 * 60 * 1000).toISOString());
      setBookingConfirmed(true);
      setStep(5); // Move to confirmation step

      // Simulate SMS confirmation
      alert(
        `🎉 Booking Confirmed!\n\nBooking ID: BD${latestBooking?.id || Date.now()}\n\nYou will receive a confirmation SMS shortly at ${bookingData.customerInfo.phone}`,
      );
    } catch (error) {
      alert("Booking failed. Please try again.");
      console.error("Booking error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Poll booking status if bookingId exists and step === 5
  useEffect(() => {
    if (!bookingId || step !== 5) return;
    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      // Simulate booking status since we don't have backend API
      setBookingStatus("pending");
      setExpiresAt(new Date(Date.now() + 15 * 60 * 1000).toISOString()); // 15 minutes from now
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [bookingId, step]);

  // Update timer every second
  useEffect(() => {
    if (!expiresAt || bookingStatus !== 'pending') return;
    const update = () => setTimer(getTimeLeft(expiresAt));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, bookingStatus]);

  // Show toast and notification on booking status change
  useEffect(() => {
    if (!bookingStatus || !bookingId) return;
    if (["approved", "rejected", "expired"].includes(bookingStatus)) {
      let title = "";
      let message = "";
      if (bookingStatus === "approved") {
        title = "Booking Approved";
        message = "Your booking has been approved! You will receive an SMS confirmation.";
      } else if (bookingStatus === "rejected") {
        title = "Booking Rejected";
        message = "Sorry, your booking was rejected by the admin.";
      } else if (bookingStatus === "expired") {
        title = "Booking Expired";
        message = "Your booking was not approved in time and has expired.";
      }
      toast({ title, description: message });
      addNotification({
        type: "tour_update",
        title,
        message,
        sender: { id: 1, name: "System", role: "system" },
        priority: "high",
        actionUrl: "/my-bookings",
        metadata: { bookingId: bookingId ? parseInt(bookingId) : 0 },
      });
    }
  }, [bookingStatus, bookingId, addNotification]);

  const totalAmount = selectedTour.price * bookingData.persons;

  const handleDownloadImage = async () => {
    if (summaryRef.current) {
      const dataUrl = await toPng(summaryRef.current);
      const link = document.createElement("a");
      link.download = "booking-summary.png";
      link.href = dataUrl;
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("booking-summary.pdf");
    }
  };

  // Ensure renderSeatMap is defined as a function inside Booking and all variables are in scope
  // Move the renderSeatMap function definition and its return value inside the Booking component, and ensure all variables (isDisabled, busIdx, etc.) are defined in the map callbacks.
  // Remove any duplicate or misplaced code fragments outside the Booking component.
  const renderSeatMap = () => {
    const selectedSeats = bookingData.selectedSeatsByBus[0];
    const seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const bus1Locked = !canAccessNextBus();
    // Check if only last 8 seats remain
    const bus1Seats = backendSeatMap.length > 0 ? backendSeatMap : generateSeats();
    const availableSeats = bus1Seats.filter((s) => s.isAvailable).map((s) => s.id);
    const onlyLast8Remain = availableSeats.length === 8 && LAST_8_SEATS.every((id) => availableSeats.includes(id));
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-emerald-900 mb-4 sm:mb-6 text-center">
          Select Your Seats ({selectedSeats.length}/{bookingData.persons})
        </h3>
        {/* Inline message for bus lock */}
        {bus1Locked && (
          <div className="mb-3 text-center text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <span style={{fontSize: '1.2em'}} className="animate-bounce">🔒</span>
            <span>
              You can only select seats on the next bus when all seats of the first bus are booked, or only the last 8 seats (<b>I1–I4, J, K, L, M</b>) remain.
            </span>
          </div>
        )}
        {/* Bus Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6 gap-1 sm:gap-2 overflow-x-auto scrollbar-thin">
          {[0, 1, 2, 3, 4].map((busIdx) => {
            const isDisabled = busIdx > 0 && bus1Locked;
            return (
              <button
                key={busIdx}
                onClick={() => !isDisabled && setSelectedBus(Number(busIdx))}
                className={`px-3 sm:px-4 py-2 rounded-t-lg font-medium border-b-2 transition-all duration-200 ease-in-out whitespace-nowrap transform hover:scale-105
                ${selectedBus === busIdx
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-900 shadow-md'
                  : isDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60 hover:scale-100'
                    : 'bg-gray-100 border-transparent text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm'}
              `}
              style={{ minWidth: 80, position: 'relative' }}
              disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
              aria-label={isDisabled ? `Bus ${busIdx + 1} (locked)` : `Bus ${busIdx + 1}`}
              title={isDisabled ? 'You can only select seats on the next bus when all seats of the first bus are booked, or only the last 8 seats (I1–I4, J, K, L, M) remain.' : ''}
            >
              {`Bus ${busIdx + 1}`}
              {isDisabled && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    fontSize: 18,
                    color: '#e67c00',
                    fontWeight: 'bold',
                  }}
                  className="animate-pulse"
                >
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Driver area */}
      <div className="flex justify-center mb-2 sm:mb-4">
        <div className="w-16 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-xs font-medium">
          Driver
        </div>
      </div>
      {/* Main seating area (A-I rows) */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          {seats.slice(0, 36).map((seat) => {
            const isBooked = !!seat.bookedBy;
            const isReserved = !!seat.reservedBy && seat.reservedBy !== userId;
            const isReservedByMe = !!seat.reservedBy && seat.reservedBy === userId;
            const isSelected = selectedSeats.includes(seat.id);
            let seatClass = '';
            if (isBooked) {
              seatClass = 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed hover:scale-100';
            } else if (isReservedByMe) {
              seatClass = 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse shadow-lg';
            } else if (isReserved) {
              seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed animate-pulse shadow-lg';
            } else if (isSelected) {
              seatClass = 'bg-emerald-500 border-emerald-600 text-white shadow-md';
            } else if (onlyLast8Remain && LAST_8_SEATS.includes(seat.id)) {
              seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 animate-pulse shadow-lg';
            } else {
              seatClass = 'bg-gray-100 border-gray-300 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm';
            }
            return (
              <button
                key={seat.id}
                onClick={() => !isBooked && !isReserved && handleSeatSelect(seat.id)}
                disabled={isBooked || isReserved}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 text-xs font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${seatClass}`}
                style={{ minWidth: 44, minHeight: 44 }}
                tabIndex={!isBooked && !isReserved ? 0 : -1}
                aria-label={`Seat ${seat.id} ${isBooked ? 'booked' : isReserved ? 'reserved' : isSelected ? 'selected' : 'available'}`}
              >
                {seat.id}
              </button>
            );
          })}
        </div>
      </div>
      {/* Back row seats */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
        {seats.slice(36).map((seat) => {
          const isBooked = !!seat.bookedBy;
          const isReserved = !!seat.reservedBy && seat.reservedBy !== userId;
          const isReservedByMe = !!seat.reservedBy && seat.reservedBy === userId;
          const isSelected = selectedSeats.includes(seat.id);
          let seatClass = '';
          if (isBooked) {
            seatClass = 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed hover:scale-100';
          } else if (isReservedByMe) {
            seatClass = 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse shadow-lg';
          } else if (isReserved) {
            seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 cursor-not-allowed animate-pulse shadow-lg';
          } else if (isSelected) {
            seatClass = 'bg-emerald-500 border-emerald-600 text-white shadow-md';
          } else if (onlyLast8Remain && LAST_8_SEATS.includes(seat.id)) {
            seatClass = 'bg-yellow-100 border-yellow-400 text-yellow-700 animate-pulse shadow-lg';
          } else {
            seatClass = 'bg-gray-100 border-gray-300 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm';
          }
          return (
            <button
              key={seat.id}
              onClick={() => !isBooked && !isReserved && handleSeatSelect(seat.id)}
              disabled={isBooked || isReserved}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 text-xs font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${seatClass}`}
              style={{ minWidth: 44, minHeight: 44 }}
              tabIndex={!isBooked && !isReserved ? 0 : -1}
              aria-label={`Seat ${seat.id} ${isBooked ? 'booked' : isReserved ? 'reserved' : isSelected ? 'selected' : 'available'}`}
            >
              {seat.id}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-emerald-500 border-2 border-emerald-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded animate-pulse"></div>
          <span>Reserved (by others)</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded animate-pulse"></div>
          <span>Reserved (by you)</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

  // Add a mock handler for /mock-bkash-payment route (for demo)
  // In a real app, this would be a separate page/component
  if (window.location.pathname.startsWith("/mock-bkash-payment")) {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");
    const amount = urlParams.get("amount");
    // Simulate payment success/failure
    setTimeout(async () => {
      // For demo, simulate payment success
      console.log("Payment callback simulated for booking:", bookingId);
      window.location.href = "/booking?payment=success";
    }, 2000);
  }

  return (
    <EmailVerificationRequired feature="booking">
      <Helmet>
        <title>Book a Tour | Explore Bangladesh</title>
        <meta name="description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta property="og:title" content="Book a Tour | Explore Bangladesh" />
        <meta property="og:description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/booking" />
        <meta property="og:image" content="https://yourdomain.com/og-booking.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book a Tour | Explore Bangladesh" />
        <meta name="twitter:description" content="Book your next adventure in Bangladesh. Choose your destination, select your seats, and confirm your booking easily!" />
        <meta name="twitter:image" content="https://yourdomain.com/og-booking.jpg" />
      </Helmet>
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tours">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tours
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  Book Your Tour
                </h1>
                <p className="text-emerald-600">{selectedTour.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {selectedTour.duration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  step >= stepNumber
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              {stepNumber < 5 && (
                <div
                  className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-emerald-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from">From</Label>
                      <Select
                        value={bookingData.from}
                        onValueChange={(value) =>
                          setBookingData((prev) => ({ ...prev, from: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="to">To (Fixed Destination)</Label>
                      <div className="relative">
                        <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-700">
                              {selectedTour.destination}
                            </span>
                            <span className="text-xs text-gray-500">
                              (Tour Destination)
                            </span>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15l-3-3h6l-3 3z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Destination is automatically set based on your selected
                        tour: {selectedTour.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="persons">Number of Persons</Label>
                      <Input
                        id="persons"
                        type="number"
                        min={1}
                        max={500}
                        value={String(bookingData.persons)}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (isNaN(value) || value < 1) value = 1;
                          if (value > 500) value = 500;
                          setBookingData((prev) => ({
                            ...prev,
                            persons: value,
                            // Reset selected seats when persons change
                            selectedSeatsByBus: prev.selectedSeatsByBus.map(() => []),
                          }));
                        }}
                        placeholder="Enter number of persons (max 500)"
                        className=""
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Travel Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => {
                          const dateStr = e.target.value;
                          setBookingData((prev) => ({ ...prev, date: dateStr }));
                          setSelectedDate(dateStr);
                          if (dateStr) {
                            const day = new Date(dateStr).getDay();
                            // 4 = Thursday
                            if (day !== 4) {
                              setShowNonThursdayPopup(true);
                            }
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">
                      Notes for Tour Host / Admin (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Share any special requests, dietary preferences, accessibility needs, or suggestions for the tour host..."
                      rows={4}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This information will be shared with your tour guide and
                      our admin team to help customize your experience.
                    </p>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!bookingData.from || !bookingData.date}
                  >
                    {selectedTour.enableSeatSelection 
                      ? "Continue to Seat Selection" 
                      : "Continue to Booking Summary"
                    }
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && selectedTour.enableSeatSelection && (
              <div className="space-y-6">
                {/* Enhanced Booking Summary Card */}
                <Card className="overflow-hidden shadow-lg bg-white">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    {/* Website Branding Header */}
                    <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">{settings?.siteName || "Loading..."}</h2>
                          <p className="text-emerald-200 text-xs">{settings?.siteDescription || "Loading..."}</p>
                        </div>
                      </div>
                      <Separator className="bg-emerald-300/30" />
                    </div>

                    <div className="p-6 bg-white">
                      {/* Tour Details */}
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                          {selectedTour.image}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedTour.name}</h3>
                          <p className="text-emerald-600 font-medium">{selectedTour.location}</p>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{selectedTour.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>Max {selectedTour.maxParticipants}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                          <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Route Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Route:</span>
                              <span className="font-medium text-emerald-800">{bookingData.from} → {selectedTour.destination}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-emerald-800">{bookingData.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Persons:</span>
                              <span className="font-medium text-emerald-800">{bookingData.persons}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-3">Pricing Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price per person:</span>
                              <span className="font-medium text-orange-800">৳{selectedTour.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Persons:</span>
                              <span className="font-medium text-orange-800">× {bookingData.persons}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                              <span className="text-orange-900">Total Amount:</span>
                              <span className="text-orange-800">৳{totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Notes */}
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Special Notes</h4>
                        <Textarea
                          value={bookingData.notes}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Add any special requests or notes..."
                          rows={3}
                          className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seat Selection */}
                <Card className="bg-white">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center text-gray-900">
                      <Users className="w-5 h-5 mr-2" />
                      Select Your Seats
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Choose {bookingData.persons} seat{bookingData.persons > 1 ? 's' : ''} for your journey
                    </p>
                  </CardHeader>
                  <CardContent className="bg-white">
                    {renderSeatMap()}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Details
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
                    disabled={bookingData.selectedSeatsByBus[0].length !== bookingData.persons}
                  >
                    Continue to Customer Info
                    <Users className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && !selectedTour.enableSeatSelection && (
              <Card className="overflow-hidden shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {/* Website Branding Header */}
                  <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{settings?.siteName || "Loading..."}</h2>
                        <p className="text-emerald-200 text-xs">{settings?.siteDescription || "Loading..."}</p>
                      </div>
                    </div>
                    <Separator className="bg-emerald-300/30" />
                  </div>

                  <div className="p-6 bg-white">
                    {/* Tour Details */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center overflow-hidden">
                        {selectedTour.image && selectedTour.image.startsWith('data:') ? (
                          <img 
                            src={selectedTour.image} 
                            alt={selectedTour.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : selectedTour.image ? (
                          <img 
                            src={selectedTour.image} 
                            alt={selectedTour.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <MapPin className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedTour.name}</h3>
                        <p className="text-emerald-600 font-medium">{selectedTour.location}</p>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{selectedTour.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            <span>Max {selectedTour.maxParticipants}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Information */}
                    <div className="space-y-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Route Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-medium text-emerald-800">{bookingData.from} → {selectedTour.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium text-emerald-800">{bookingData.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Persons:</span>
                            <span className="font-medium text-emerald-800">{bookingData.persons}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-3">Pricing Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per person:</span>
                            <span className="font-medium text-orange-800">৳{selectedTour.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Persons:</span>
                            <span className="font-medium text-orange-800">× {bookingData.persons}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg">
                            <span className="text-orange-900">Total Amount:</span>
                            <span className="text-orange-800">৳{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Notes */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Special Notes</h4>
                        <Textarea
                          value={bookingData.notes}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                          placeholder="Add any special requests or notes..."
                          rows={3}
                          className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="bg-gray-50 p-6 border-t">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Details
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
                      >
                        Continue to Customer Info
                        <Users className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      value={bookingData.customerInfo.name || currentUser?.displayName || userData?.name || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            name: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      value={bookingData.customerInfo.email || currentUser?.email || userData?.email || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            email: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      value={bookingData.customerInfo.phone || userData?.phone || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customerInfo: {
                            ...prev.customerInfo,
                            phone: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={
                        !(bookingData.customerInfo.name || currentUser?.displayName || userData?.name) ||
                        !(bookingData.customerInfo.email || currentUser?.email || userData?.email) ||
                        !(bookingData.customerInfo.phone || userData?.phone)
                      }
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Payment method selection if both enabled */}
                  {paymentSettings.manualPayment && paymentSettings.bkashPayment && (
                    <div className="mb-6 flex gap-4">
                      <Button
                        variant={selectedPaymentMethod === "manual" ? "default" : "outline"}
                        onClick={() => setSelectedPaymentMethod("manual")}
                      >
                        Manual Payment
                      </Button>
                      <Button
                        variant={selectedPaymentMethod === "bkash" ? "default" : "outline"}
                        onClick={() => setSelectedPaymentMethod("bkash")}
                      >
                        bKash Payment
                      </Button>
                    </div>
                  )}
                  {/* Manual Payment Instructions */}
                  {paymentSettings.manualPayment && selectedPaymentMethod === "manual" && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-4">Manual Payment Instructions:</h3>
                      <div className="space-y-2 text-sm text-blue-800">
                      <div className="mb-3">
                          <strong>Amount to Pay: ৳{totalAmount.toLocaleString()}</strong>
                      </div>
                      <div className="mb-3">
                          <strong>Instructions: </strong>
                          <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                            Please pay at the counter or contact admin for payment.
                        </span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">
                          {settings?.paymentInstructions || "Contact the admin for manual payment details."}
                      </div>
                    </div>
                  </div>
                  )}
                  {/* bKash Payment Instructions */}
                  {paymentSettings.bkashPayment && selectedPaymentMethod === "bkash" && (
                    <div className="bg-pink-50 p-6 rounded-lg border border-pink-200 mb-6">
                      <h3 className="font-semibold text-pink-900 mb-4">bKash Payment Instructions:</h3>
                      <div className="space-y-2 text-sm text-pink-800">
                        <div className="mb-3">
                          <strong>Amount to Pay: ৳{totalAmount.toLocaleString()}</strong>
                        </div>
                        <div className="mb-3">
                          <strong>bKash Number: </strong>
                          <span className="font-mono bg-pink-100 px-2 py-1 rounded">{settings?.bkashNumber || "Loading..."}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">{settings?.paymentInstructions || "Loading..."}</div>
                      </div>
                    </div>
                  )}
                  {/* Payment input fields (shown for both methods) */}
                  {((paymentSettings.manualPayment && selectedPaymentMethod === "manual") || (paymentSettings.bkashPayment && selectedPaymentMethod === "bkash")) && (
                    <>
                  <div>
                    <Label htmlFor="transaction">Transaction ID</Label>
                    <Input
                      value={bookingData.transactionId}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          transactionId: e.target.value,
                        }))
                      }
                          placeholder={selectedPaymentMethod === "bkash" ? "Enter bKash transaction ID" : "Enter transaction/reference ID (if any)"}
                    />
                  </div>
                  <div>
                        <Label htmlFor="payment-proof">Payment Screenshot (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      {bookingData.paymentProof ? (
                        <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✓ {bookingData.paymentProof.name}</p>
                        </div>
                      ) : (
                            <label htmlFor="payment-proof" className="cursor-pointer text-blue-600 underline">Upload Screenshot</label>
                      )}
                    </div>
                  </div>
                  {/* Add Confirm Booking button here */}
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-6"
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                  >
                    {isConfirming ? "Confirming..." : "Confirm Booking"}
                  </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 5 && bookingConfirmed && (
              <Card className="overflow-hidden">
                <CardContent className="p-8 text-center">
                    {bookingStatus === 'pending' && (
                      <>
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Clock className="w-10 h-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-900 mb-4">
                          Booking Pending Admin Approval
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Your booking is pending admin approval. Please wait.
                        </p>
                        <div className="text-lg font-mono text-yellow-800 mb-6">
                          Time left: {timer}
                        </div>
                      </>
                    )}
                    {bookingStatus === 'approved' && (
                      <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                          🎉 Booking Approved!
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Thank you for booking with {settings?.siteName || "us"}! Your booking has been approved and you will receive an SMS confirmation shortly.
                        </p>
                      </>
                    )}
                    {(bookingStatus === 'expired' || bookingStatus === 'rejected') && (
                      <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <X className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-900 mb-4">
                          Booking {bookingStatus === 'expired' ? 'Expired' : 'Rejected'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                          {bookingStatus === 'expired'
                            ? 'Sorry, your booking was not approved in time and has expired. Please try again.'
                            : 'Sorry, your booking was rejected by the admin. Please contact support or try again.'}
                        </p>
                      </>
                    )}

                    {/* Enhanced Booking Details */}
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 mb-6 border border-emerald-200">
                      <div className="mb-6">
                        <div className="text-left">
                          <h3 className="text-2xl font-bold text-emerald-900">{selectedTour.name}</h3>
                          <p className="text-emerald-600 font-medium">{selectedTour.location}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{selectedTour.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>Max {selectedTour.maxParticipants} people</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-emerald-200">
                            <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Booking Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-mono font-medium text-emerald-800">{bookingId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Route:</span>
                                <span className="font-medium text-emerald-800">
                                  {bookingData.from} → {bookingData.to}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium text-emerald-800">{bookingData.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Persons:</span>
                                <span className="font-medium text-emerald-800">{bookingData.persons}</span>
                              </div>
                            </div>
                          </div>

                          {selectedTour.enableSeatSelection && bookingData.selectedSeatsByBus[0].length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Selected Seats
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {bookingData.selectedSeatsByBus[0].map((seat, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    {seat}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-orange-200">
                            <h4 className="font-semibold text-orange-900 mb-3">Pricing Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Price per person:</span>
                                <span className="font-medium text-orange-800">৳{selectedTour.price.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Persons:</span>
                                <span className="font-medium text-orange-800">× {bookingData.persons}</span>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-orange-900">Total Amount:</span>
                                <span className="text-orange-800">৳{totalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {bookingData.notes && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-3">Special Notes</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                                {bookingData.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tour Highlights */}
                      {selectedTour.highlights && selectedTour.highlights.length > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                          <h4 className="font-semibold text-emerald-900 mb-3">Tour Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTour.highlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="bg-white text-emerald-700 border-emerald-300">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
                        asChild
                      >
                        <Link to="/">Return to Home</Link>
                      </Button>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                        <Link to="/tours">Book Another Tour</Link>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-6">
                      You will receive SMS confirmation at {bookingData.customerInfo.phone}
                    </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div ref={summaryRef}>
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{selectedTour.image}</div>
                  <div>
                    <h3 className="font-semibold">{selectedTour.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedTour.location}
                    </p>
                  </div>
                </div>

                <Separator />

                {bookingData.from && bookingData.to && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Route:</span>
                      <span>
                        {bookingData.from} → {bookingData.to}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span>{bookingData.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Persons:</span>
                      <span>{bookingData.persons}</span>
                    </div>
                  </div>
                )}

                  {bookingData.selectedSeatsByBus[0].length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Selected Seats:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {bookingData.selectedSeatsByBus[0].map((seat) => (
                        <Badge key={seat} variant="outline">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bookingData.notes && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Special Notes:
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                      {bookingData.notes}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per person:</span>
                    <span>৳{selectedTour.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Persons:</span>
                    <span>× {bookingData.persons}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>৳{totalAmount.toLocaleString()}</span>
                  </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleDownloadImage} variant="outline" className="w-full">
                    Download as Image
                  </Button>
                  {/* Removed PDF download button */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      {showNonThursdayPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '90vw',
            width: '400px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowNonThursdayPopup(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#888',
              }}
              aria-label="Close"
            >
              ×
            </button>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem', color: '#b91c1c' }}>
              প্রতি মাসের প্রতি সপ্তাহের বৃহস্পতিবার বাদে <br/>
              ট্যুর প্যাকেজ বুকিং করতে হলে আপনাকে <br/>
              কাস্টম বুকিংয়ের জন্য এডমিনের সাথে বিস্তারিত আলোচনা করতে হবে।
            </div>
            <div style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
              📞 <b>এডমিন মোবাইল নম্বর :</b> +৮৮০১৭০০০-০০০৯৯
            </div>
            <div style={{ fontSize: '1rem' }}>
              📧 <b>এডমিন ইমেইল:</b> admin@admin.com
            </div>
          </div>
        </div>
      )}
    </EmailVerificationRequired>
  );
}
