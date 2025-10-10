import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-emerald-900/30 via-emerald-800/40 to-orange-900/30" />
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="sundarbans" patternUnits="userSpaceOnUse" width="40" height="40"><rect fill="%23065f46" width="40" height="40"/><path fill="%23047857" d="M20 10c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z"/></pattern></defs><rect fill="url(%23sundarbans)" width="1200" height="800"/><g opacity="0.1"><path fill="%23f97316" d="M0 400c200-100 400-50 600 0s400 50 600-50v450H0V400z"/></g></svg>')`,
          }}
        />
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-orange-300/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-emerald-300/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Animated Main Headline */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight">
            <span className={`inline-block transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              Discover the
            </span>
            <span className={`block bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
              Beauty of Bangladesh
            </span>
          </h1>
        </div>

        {/* Animated Description */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-lg sm:text-xl md:text-2xl text-emerald-50 mb-8 max-w-4xl mx-auto leading-relaxed px-4 font-light">
            From the mystical Sundarbans to the pristine beaches of Cox's Bazar,
            experience the rich culture, heritage, and natural wonders of
            Bangladesh
          </p>
        </div>

        {/* Animated Buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button
            size="lg"
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to="/tours" className="flex items-center">
              <Calendar className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              Book Your Adventure
            </Link>
          </Button>

          <Button
            size="lg"
            className="group bg-white/15 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white hover:text-emerald-700 px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link to="/tours" className="flex items-center">
              <MapPin className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Explore Destinations
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats with Animations */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl">
            <div className="text-4xl font-bold text-orange-300 mb-3 group-hover:text-orange-200 transition-colors duration-300">50+</div>
            <div className="text-emerald-50 font-medium text-lg">Destinations</div>
          </div>
          <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl">
            <div className="text-4xl font-bold text-orange-300 mb-3 group-hover:text-orange-200 transition-colors duration-300">10K+</div>
            <div className="text-emerald-50 font-medium text-lg">Happy Travelers</div>
          </div>
          <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl">
            <div className="flex items-center justify-center text-4xl font-bold text-orange-300 mb-3 group-hover:text-orange-200 transition-colors duration-300">
              <Star className="w-8 h-8 fill-current mr-1" />
              5
            </div>
            <div className="text-emerald-50 font-medium text-lg">Customer Rating</div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="group cursor-pointer">
          <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center group-hover:border-white/80 transition-colors duration-300">
            <div className="w-1 h-4 bg-white/80 rounded-full mt-3 animate-bounce group-hover:bg-white transition-colors duration-300" />
          </div>
          <p className="text-white/60 text-sm mt-2 group-hover:text-white/80 transition-colors duration-300">Scroll Down</p>
        </div>
      </div>
    </section>
  );
}
