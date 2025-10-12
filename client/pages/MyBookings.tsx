import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useBookings } from "@/contexts/BookingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";
import { bookingService } from "@/lib/firebaseServices";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
];

// Helper to map booking status to badge variant
function getBadgeVariant(status: string) {
  switch (status) {
    case "confirmed": return "default";
    case "pending": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
}

export default function MyBookings() {
  const { userProfile, currentUser } = useUser();
  const { bookings, updateBooking, loading } = useBookings();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debug logging
  useEffect(() => {
    console.log('MyBookings: Debug info', {
      userProfile: userProfile?.user?.email,
      currentUser: currentUser?.email,
      totalBookings: bookings.length,
      bookings: bookings.map(b => ({ id: b.id, userEmail: b.user?.email, status: b.status }))
    });
  }, [userProfile, currentUser, bookings]);

  // Filter bookings for the current user - try both userProfile and currentUser emails
  const userBookings = bookings.filter((booking) => {
    const bookingEmail = booking.user?.email;
    const profileEmail = userProfile?.user?.email;
    const authEmail = currentUser?.email;
    
    return bookingEmail && (bookingEmail === profileEmail || bookingEmail === authEmail);
  });

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await updateBooking(bookingId, { status: "cancelled" });
      console.log("Booking cancelled successfully:", bookingId);
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  // Test function to add a sample booking for debugging
  const addTestBooking = async () => {
    if (!currentUser?.email) {
      alert("Please log in first to test booking functionality");
      return;
    }
    
    try {
      const testBooking = {
        user: {
          name: currentUser.displayName || "Test User",
          email: currentUser.email,
          phone: "+880 1700-000000"
        },
        tourId: 1,
        tourName: "Test Tour",
        from: "Dhaka",
        to: "Chittagong",
        date: new Date().toISOString().split('T')[0],
        persons: 1,
        selectedSeats: ["A1"],
        notes: "Test booking for real-time updates",
        amount: 5000,
        status: "pending",
        transactionId: "TEST-" + Date.now(),
        bookingDate: new Date().toISOString()
      };
      
      const result = await bookingService.addBooking(testBooking);
      if (result) {
        console.log("Test booking added:", result);
        alert("Test booking added! Check if it appears in real-time.");
      }
    } catch (error) {
      console.error("Error adding test booking:", error);
      alert("Error adding test booking: " + error.message);
    }
  };

  const filteredBookings = userBookings.filter((b) =>
    statusFilter === "all" ? true : b.status === statusFilter
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Helmet>
        <title>My Bookings | Explore Bangladesh</title>
        <meta name="description" content="View and manage your tour bookings, seat details, and status." />
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.value)}
                className={statusFilter === filter.value ? "font-bold" : ""}
              >
                {filter.label}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={addTestBooking}
              className="ml-auto text-xs"
            >
              Add Test Booking
            </Button>
          </div>
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <strong>Debug Info:</strong><br/>
            User Profile Email: {userProfile?.user?.email || 'Not loaded'}<br/>
            Current User Email: {currentUser?.email || 'Not authenticated'}<br/>
            Total Bookings: {bookings.length}<br/>
            User Bookings: {userBookings.length}<br/>
            Filtered Bookings: {filteredBookings.length}
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings found.
              {userBookings.length > 0 && (
                <div className="mt-2 text-sm">
                  Found {userBookings.length} bookings for your account, but none match the "{statusFilter}" filter.
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Tour</th>
                    <th className="text-left p-2">Route</th>
                    <th className="text-left p-2">Seats</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="p-2">{booking.date}</td>
                      <td className="p-2">{booking.tourName}</td>
                      <td className="p-2">{booking.from} → {booking.to}</td>
                      <td className="p-2">{(booking.selectedSeats || []).join(", ")}</td>
                      <td className="p-2">
                        <Badge variant={getBadgeVariant(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {booking.status === "pending" && (
                          <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}>
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Link to="/tours" className="text-emerald-600 hover:underline">
          ← Back to Tours
        </Link>
      </div>
    </div>
  );
} 