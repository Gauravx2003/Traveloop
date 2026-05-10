import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, MapPin, Calendar, Clock, DollarSign, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Activity {
  id: number;
  title: string;
  cost: string;
  category: string;
  startTime: string;
}

interface Stop {
  id: number;
  cityName: string;
  arrivalDate: string;
  departureDate: string;
  activities: Activity[];
}

interface Trip {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string;
  description: string;
  stops: Stop[];
}

const SharedItinerary: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await api.get(`/trips/share/${slug}`);
        setTrip(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load public itinerary.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [slug]);

  const handleCopyTrip = async () => {
    if (!user) {
      // Redirect unauthorized users to login, pass a return url or state if needed
      navigate('/login', { state: { returnTo: `/share/${slug}` } });
      return;
    }

    setIsCopying(true);
    try {
      const response = await api.post(`/trips/share/${slug}/copy`);
      setCopySuccess(true);
      setTimeout(() => {
        navigate(`/trips/${response.data.id}/itinerary`);
      }, 1500);
    } catch (err) {
      alert('Failed to copy trip. Please try again.');
      setIsCopying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || 'This itinerary is private or does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Cover Photo Header */}
      <div className="h-64 sm:h-80 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
        {trip.coverPhoto ? (
          <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-cyan-400"></div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-20 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90 font-medium">
            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Copy Action Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Love this itinerary?</h2>
            <p className="text-sm text-gray-500">Duplicate this trip to your own dashboard to start planning your version!</p>
          </div>
          <button
            onClick={handleCopyTrip}
            disabled={isCopying || copySuccess}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md hover:shadow-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {copySuccess ? (
              <><CheckCircle2 className="w-5 h-5" /> Copied!</>
            ) : isCopying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Copying...</>
            ) : (
              <><Copy className="w-5 h-5" /> Copy Trip</>
            )}
          </button>
        </div>

        {trip.description && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">About this trip</h3>
            <p className="text-gray-700 leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Read-Only Itinerary Viewer */}
        <div className="space-y-6">
          {trip.stops?.length > 0 ? (
            trip.stops.map((stop, index) => (
              <div key={stop.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {stop.cityName}
                  </h2>
                  <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} to {new Date(stop.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-5">
                  {stop.activities?.length > 0 ? (
                    <div className="space-y-3">
                      {stop.activities.map(act => (
                        <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-3">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{act.title}</p>
                            <div className="flex flex-wrap gap-2 text-xs font-medium mt-2">
                              {act.startTime && (
                                <span className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md">
                                  <Clock className="w-3 h-3 text-indigo-400" />
                                  {new Date(act.startTime).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md capitalize">
                                {act.category || 'Sightseeing'}
                              </span>
                            </div>
                          </div>
                          <div className="font-bold text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm self-start sm:self-center">
                            ${Number(act.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No specific activities planned.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-10 bg-white rounded-3xl border border-gray-200">No destinations have been added to this trip.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;
