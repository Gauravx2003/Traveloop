import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import {
  Plus,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  Loader2,
  Sparkles,
  Map,
} from "lucide-react";

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  stops: any[];
}

interface DashboardData {
  welcomeMessage: string;
  recentTrips: Trip[];
  budgetHighlights: number;
}

const recommendedDestinations = [
  {
    name: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Santorini, Greece",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Banff, Canada",
    image:
      "https://images.unsplash.com/photo-1603812859187-5735f4f780da?q=80&w=1000&auto=format&fit=crop",
  },
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/trips/dashboard");
        console.log("RESPONSE: ", response.data);
        setData(response.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {data?.welcomeMessage}
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Total Budget Spent:{" "}
            <span className="font-semibold text-gray-700">
              ₹
              {Number(data?.budgetHighlights).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
        <Link
          to="/create-trip"
          className="bg-linear-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Plan New Trip</span>
        </Link>
      </section>

      {/* Main Content */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-500" />
            Your Recent Trips
          </h2>
        </div>

        {data?.recentTrips && data.recentTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recentTrips.map((trip) => (
              <div
                key={trip.id}
                className="group glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="h-48 overflow-hidden relative bg-gray-200">
                  {trip.coverPhoto ? (
                    <img
                      src={trip.coverPhoto}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-100 to-cyan-50 text-indigo-300">
                      <Map className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    {trip.stops?.length || 0} stops
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {trip.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}{" "}
                        -{" "}
                        {new Date(trip.endDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/trips/${trip.id}/itinerary`}
                    className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700"
                  >
                    View Itinerary{" "}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-dashed border-gray-300 bg-white/50 relative overflow-hidden">
            {/* Decorative subtle background blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-cyan-100 blur-3xl opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                <Map className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No trips planned yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                It's a big world out there. Start planning your next adventure
                today and build your personalized itinerary.
              </p>

              <div className="w-full max-w-3xl">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-left">
                  Recommended to inspire you
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedDestinations.map((dest, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden h-32 group cursor-pointer shadow-sm"
                    >
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 text-white font-medium flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {dest.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
