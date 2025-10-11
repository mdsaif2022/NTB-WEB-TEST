import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { useTours } from "@/contexts/TourContext";
import { Helmet } from 'react-helmet-async';

export default function Tours() {
  const { tours: allTours, getActiveTours } = useTours();
  const tours = getActiveTours();


  return (
    <>
      <Helmet>
        <title>Bangladesh Tours - Book Your Next Adventure</title>
        <meta name="description" content="Browse and book the best tours in Bangladesh. Find your next adventure in Sundarbans, Cox's Bazar, Srimangal, and more!" />
        <meta property="og:title" content="Bangladesh Tours - Book Your Next Adventure" />
        <meta property="og:description" content="Browse and book the best tours in Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/tours" />
        <meta property="og:image" content="https://yourdomain.com/og-image-tours.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bangladesh Tours - Book Your Next Adventure" />
        <meta name="twitter:description" content="Browse and book the best tours in Bangladesh." />
        <meta name="twitter:image" content="https://yourdomain.com/og-image-tours.jpg" />
      </Helmet>
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Discover Bangladesh Tours
          </h1>
          <p className="text-xl text-emerald-100 mb-8">
            Choose from our curated selection of authentic Bangladesh
            experiences
          </p>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tour Stats */}
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Showing {tours.length} active tour{tours.length !== 1 ? "s" : ""}
            </p>
          </div>

          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Card
                  key={tour.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-6xl">
                    {tour.image}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-emerald-900">
                        {tour.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                        <span className="text-sm font-semibold">
                          {tour.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-emerald-600 mb-3 space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          Max {tour.maxParticipants}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {tour.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-emerald-700">
                        ৳{tour.price.toLocaleString()}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700"
                        asChild
                      >
                        <Link to={`/booking?tour=${tour.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                No Active Tours Available
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We're currently updating our tour offerings. Please check back
                later or contact us for custom tour arrangements.
              </p>
            </div>
          )}

          {/* Booking Features Info */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">
              Easy Booking Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Select Route
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose your departure and destination from our predefined
                  locations
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Choose Seats
                </h3>
                <p className="text-gray-600 text-sm">
                  Select your preferred seats from our visual 40-seat layout
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-emerald-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    ৳
                  </div>
                </div>
                <h3 className="font-semibold text-emerald-900 mb-2">
                  Pay with bKash
                </h3>
                <p className="text-gray-600 text-sm">
                  Secure payment via bKash with instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </>
  );
}
