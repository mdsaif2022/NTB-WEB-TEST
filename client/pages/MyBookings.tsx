import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useBookings } from "@/contexts/BookingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from 'react-helmet-async';
import { Link } from "react-router-dom";

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
  const { userProfile } = useUser();
  const { bookings, updateBooking, loading } = useBookings();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter bookings for the current user
  const userBookings = bookings.filter((booking) => 
    userProfile && booking.user.email === userProfile.email
  );

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await updateBooking(bookingId, { status: "cancelled" });
      console.log("Booking cancelled successfully:", bookingId);
    } catch (error) {
      console.error("Error cancelling booking:", error);
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
          <div className="mb-4 flex gap-2">
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
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found.</div>
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