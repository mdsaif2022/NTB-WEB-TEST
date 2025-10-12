import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTours } from "@/contexts/TourContext";

export default function FeaturedDestinations() {
  const { tours: allTours, getActiveTours } = useTours();
  const destinations = getActiveTours().slice(0, 4); // Show first 4 active tours

  // Debug information
  useEffect(() => {
    console.log("FeaturedDestinations updated:", {
      totalTours: allTours.length,
      activeTours: getActiveTours().length,
      featuredCount: destinations.length,
    });
  }, [allTours, destinations.length]);

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-emerald-900 mb-4">
            Featured Destinations
          </h2>
          <p className="text-xl text-emerald-700 max-w-3xl mx-auto">
            Discover Bangladesh's most breathtaking locations, from pristine
            beaches to ancient forests and historical landmarks
          </p>
        </div>

        {/* Destinations Grid */}
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
              >
                <div className="relative overflow-hidden">
                  {/* Image placeholder with emoji */}
                  <div className="h-64 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                    {destination.images && destination.images.length > 0 ? (
                      <img
                        src={destination.images[0]}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : destination.image && (destination.image.startsWith('http') || destination.image.startsWith('data:')) ? (
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-8xl">{destination.image || "📍"}</span>
                    )}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    ৳{destination.price.toLocaleString()}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="font-semibold text-sm">
                      {destination.rating}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                      {destination.name}
                    </h3>
                  </div>

                  <div className="flex items-center text-emerald-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {destination.location}
                    </span>
                    <Clock className="w-4 h-4 ml-4 mr-1" />
                    <span className="text-sm font-medium">
                      {destination.duration}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.highlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-semibold"
                    asChild
                  >
                    <Link to={`/booking?tour=${destination.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Featured Destinations Available
            </h3>
            <p className="text-gray-500 mb-4">
              We're currently updating our destinations. Check back soon!
            </p>
            <p className="text-sm text-gray-400">
              Active tours: {getActiveTours().length} | Total: {allTours.length}
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-emerald-50/90 backdrop-blur-sm border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-4 font-semibold transition-all duration-300"
            asChild
          >
            <Link to="/tours">View All Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
