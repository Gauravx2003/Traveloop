import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { MapPin, Calendar, Plus, Loader2, ArrowLeft, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

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
  stops: Stop[];
}

const ItineraryBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for Add Stop Form
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStop, setNewStop] = useState({ cityName: '', arrivalDate: '', departureDate: '' });
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);

  // State for Add Activity Form
  const [addingActivityToStop, setAddingActivityToStop] = useState<number | null>(null);
  const [newActivity, setNewActivity] = useState({ title: '', cost: '', category: 'sightseeing', startTime: '' });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const fetchTripData = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (err) {
      setError('Failed to load itinerary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStop(true);
    try {
      await api.post('/trips/stops', {
        tripId: Number(id),
        ...newStop,
        order: trip?.stops?.length || 0
      });
      setIsAddingStop(false);
      setNewStop({ cityName: '', arrivalDate: '', departureDate: '' });
      await fetchTripData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add stop');
    } finally {
      setIsSubmittingStop(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent, stopId: number) => {
    e.preventDefault();
    setIsSubmittingActivity(true);
    try {
      await api.post('/trips/activities', {
        stopId,
        ...newActivity,
        cost: Number(newActivity.cost) || 0
      });
      setAddingActivityToStop(null);
      setNewActivity({ title: '', cost: '', category: 'sightseeing', startTime: '' });
      await fetchTripData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add activity');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const calculateStopBudget = (activities: Activity[]) => {
    return activities.reduce((sum, act) => sum + Number(act.cost), 0);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error || 'Trip not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link to="/my-trips" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Trips
      </Link>

      {/* Trip Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{trip.name} Itinerary</h1>
        <div className="flex items-center gap-2 mt-3 text-gray-600 font-medium">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <span>
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Sections (Stops) */}
      <div className="space-y-6">
        {trip.stops?.map((stop, index) => (
          <div key={stop.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group hover:border-indigo-200 transition-colors">
            {/* Section Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  {stop.cityName}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {new Date(stop.arrivalDate).toLocaleDateString(undefined, {month: 'short', day:'numeric'})} to {new Date(stop.departureDate).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}
                </div>
                <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-sm font-bold text-green-700 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {calculateStopBudget(stop.activities).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div className="p-5">
              {stop.activities?.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {stop.activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-indigo-50/30 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{act.title}</p>
                        {act.startTime && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {new Date(act.startTime).toLocaleString(undefined, {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                          </p>
                        )}
                      </div>
                      <div className="font-medium text-gray-700">
                        ${Number(act.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4 italic">No activities planned for this section yet.</p>
              )}

              {/* Add Activity Form/Button */}
              {addingActivityToStop === stop.id ? (
                <form onSubmit={(e) => handleAddActivity(e, stop.id)} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Activity Title</label>
                      <input required type="text" value={newActivity.title} onChange={e => setNewActivity({...newActivity, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Eiffel Tower Visit" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Cost ($)</label>
                      <input required type="number" min="0" step="0.01" value={newActivity.cost} onChange={e => setNewActivity({...newActivity, cost: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 25.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time (Optional)</label>
                      <input type="datetime-local" value={newActivity.startTime} onChange={e => setNewActivity({...newActivity, startTime: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setAddingActivityToStop(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmittingActivity} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center">
                      {isSubmittingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Activity'}
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setAddingActivityToStop(stop.id)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Activity
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Section (Stop) */}
      {isAddingStop ? (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" /> Add New Destination Section
          </h3>
          <form onSubmit={handleAddStop} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City / Destination Name</label>
              <input required type="text" value={newStop.cityName} onChange={e => setNewStop({...newStop, cityName: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Paris" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival Date</label>
                <input required type="date" value={newStop.arrivalDate} onChange={e => setNewStop({...newStop, arrivalDate: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Departure Date</label>
                <input required type="date" value={newStop.departureDate} onChange={e => setNewStop({...newStop, departureDate: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setIsAddingStop(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmittingStop} className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center">
                {isSubmittingStop ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Section'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsAddingStop(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
        >
          <Plus className="w-5 h-5" /> Add another Section
        </button>
      )}

    </div>
  );
};

export default ItineraryBuilder;
