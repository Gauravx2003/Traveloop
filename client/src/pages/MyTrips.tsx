import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Filter, ArrowUpDown, Calendar, MapPin, Loader2, Navigation } from 'lucide-react';

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  status: string;
  stops: any[];
}

const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'completed'>('ongoing');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await api.get('/trips/list');
        setTrips(response.data);
      } catch (err) {
        setError('Failed to load your trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Categorize trips based on dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTrips = trips.filter(trip => trip.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const ongoingTrips = sortedTrips.filter(trip => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return start <= today && end >= today;
  });

  const upcomingTrips = sortedTrips.filter(trip => {
    const start = new Date(trip.startDate);
    return start > today;
  });

  const completedTrips = sortedTrips.filter(trip => {
    const end = new Date(trip.endDate);
    return end < today;
  });

  const getActiveTrips = () => {
    if (activeTab === 'ongoing') return ongoingTrips;
    if (activeTab === 'upcoming') return upcomingTrips;
    return completedTrips;
  };

  const activeTripsList = getActiveTrips();

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-medium animate-pulse">Loading your journeys...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Navigation className="w-8 h-8 text-indigo-500" />
            My Trips
          </h1>
          <p className="text-gray-500 mt-1">Manage and organize all your travel itineraries.</p>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:flex-none">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all outline-none shadow-sm cursor-pointer appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {(['ongoing', 'upcoming', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} 
            <span className="ml-2 py-0.5 px-2 bg-gray-100 rounded-full text-xs text-gray-600">
              {tab === 'ongoing' ? ongoingTrips.length : tab === 'upcoming' ? upcomingTrips.length : completedTrips.length}
            </span>
          </button>
        ))}
      </div>

      {/* Trip List */}
      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>
      ) : activeTripsList.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500 border border-dashed border-gray-300">
          <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-1">No {activeTab} trips found.</p>
          <p>Time to start planning your next great adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeTripsList.map(trip => (
            <div 
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
              className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group bg-white border border-transparent hover:border-indigo-100"
            >
              <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                {trip.coverPhoto ? (
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50">
                     <MapPin className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 w-full flex flex-col justify-center">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{trip.name}</h3>
                
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    <span>{trip.stops?.length || 0} destinations</span>
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                  Click to manage itinerary, add stops, and plan activities for this trip.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
