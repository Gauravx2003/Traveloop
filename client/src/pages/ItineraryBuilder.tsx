import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import {
  MapPin,
  Calendar,
  Plus,
  Loader2,
  ArrowLeft,
  DollarSign,
  Search,
  List,
  Clock,
  Globe,
  CheckSquare,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface Activity {
  id: number;
  title: string;
  cost: string;
  category: string;
  startTime: string;
  stopId?: number; // Used in timeline
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
  isPublic: boolean;
  shareSlug: string;
  stops: Stop[];
}

interface GlobalCity {
  id: number;
  name: string;
  country: string;
  costIndex: number;
  popularity: number;
}

const ItineraryBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "timeline">("grouped");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [suggestedActivities, setSuggestedActivities] = useState<any[]>([]);
  const [isSearchingActivities, setIsSearchingActivities] = useState(false);

  // Global Activity Search State
  const [globalActivitySearchResults, setGlobalActivitySearchResults] =
    useState<any[]>([]);
  const [isSearchingGlobalActivities, setIsSearchingGlobalActivities] =
    useState(false);
  const activitySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for Add Stop Form
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStop, setNewStop] = useState({
    cityName: "",
    arrivalDate: "",
    departureDate: "",
  });
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);

  // Edit Trip State
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editTripData, setEditTripData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const startEditingTrip = () => {
    if (trip) {
      setEditTripData({
        name: trip.name,
        startDate: new Date(trip.startDate).toISOString().split("T")[0],
        endDate: new Date(trip.endDate).toISOString().split("T")[0],
      });
      setIsEditingTrip(true);
    }
  };

  const handleUpdateTrip = async () => {
    try {
      const { data } = await api.put(`/trips/${id}`, editTripData);
      setTrip((prev) => (prev ? { ...prev, ...data } : null));
      setIsEditingTrip(false);
    } catch (err) {
      console.error("Failed to update trip", err);
      alert("Failed to update trip");
    }
  };

  // State for Add Activity Form
  const [addingActivityToStop, setAddingActivityToStop] = useState<
    number | null
  >(null);
  const [newActivity, setNewActivity] = useState({
    title: "",
    cost: "",
    category: "sightseeing",
    startTime: "",
  });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const searchGlobalActivities = async (query: string) => {
    if (query.length < 2) {
      setGlobalActivitySearchResults([]);
      return;
    }

    setIsSearchingGlobalActivities(true);
    try {
      const { data } = await api.get(`/trips/search/activities?query=${query}`);
      setGlobalActivitySearchResults(data);
    } catch (err) {
      console.error("Failed to search global activities", err);
    } finally {
      setIsSearchingGlobalActivities(false);
    }
  };

  const fetchTripData = async () => {
    try {
      const response = await api.get(`/trips/itinerary/${id}`);
      setTrip(response.data);
    } catch (err) {
      setError("Failed to load itinerary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [id]);

  // Handle City Search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/trips/search/cities?query=${searchQuery}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const selectCity = (city: GlobalCity) => {
    setNewStop({ ...newStop, cityName: `${city.name}, ${city.country}` });
    setSearchQuery("");
    setSearchResults([]);
  };

  const fetchSuggestedActivities = async (cityName: string) => {
    setIsSearchingActivities(true);
    try {
      const cityOnly = cityName.split(",")[0].trim();
      const res = await api.get(`/trips/search/activities?city=${cityOnly}`);
      setSuggestedActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setIsSearchingActivities(false);
    }
  };

  useEffect(() => {
    if (addingActivityToStop !== null) {
      const stop = trip?.stops.find((s) => s.id === addingActivityToStop);
      if (stop) {
        fetchSuggestedActivities(stop.cityName);
      }
    } else {
      setSuggestedActivities([]);
    }
  }, [addingActivityToStop, trip]);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingStop(true);
    try {
      await api.post("/trips/stops", {
        tripId: Number(id),
        ...newStop,
        order: trip?.stops?.length || 0,
      });
      setIsAddingStop(false);
      setNewStop({ cityName: "", arrivalDate: "", departureDate: "" });
      await fetchTripData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add stop");
    } finally {
      setIsSubmittingStop(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent, stopId: number) => {
    e.preventDefault();
    setIsSubmittingActivity(true);
    try {
      await api.post("/trips/activities", {
        stopId,
        ...newActivity,
        cost: Number(newActivity.cost) || 0,
      });
      setAddingActivityToStop(null);
      setNewActivity({
        title: "",
        cost: "",
        category: "sightseeing",
        startTime: "",
      });
      await fetchTripData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add activity");
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const calculateStopBudget = (activities: Activity[]) => {
    return activities.reduce((sum, act) => sum + Number(act.cost), 0);
  };

  const handleShareToggle = async () => {
    if (!trip) return;
    try {
      const res = await api.patch(`/trips/${trip.id}/share`, {
        isPublic: !trip.isPublic,
      });
      setTrip({ ...trip, isPublic: res.data.isPublic });
    } catch (err) {
      alert("Failed to update visibility");
    }
  };

  const copyShareLink = () => {
    if (!trip || !trip.shareSlug) return;
    const url = `${window.location.origin}/share/${trip.shareSlug}`;
    navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  };

  const renderTimelineView = () => {
    if (!trip || !trip.stops) return null;

    // Flatten and sort activities across all stops
    let allActivities: Activity[] = [];
    trip.stops.forEach((stop) => {
      stop.activities.forEach((act) => {
        allActivities.push({ ...act, stopId: stop.id });
      });
    });

    allActivities.sort(
      (a, b) =>
        new Date(a.startTime || 0).getTime() -
        new Date(b.startTime || 0).getTime(),
    );

    if (allActivities.length === 0) {
      return (
        <div className="bg-white/50 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
          <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p>No activities added yet to build a timeline.</p>
        </div>
      );
    }

    let lastDateStr = "";

    return (
      <div className="relative border-l-2 border-indigo-200 ml-4 space-y-8 pb-8">
        {allActivities.map((act, index) => {
          const actDateStr = act.startTime
            ? new Date(act.startTime).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "numeric",
                year: "2-digit",
              })
            : "Unscheduled";
          const showDateHeader = actDateStr !== lastDateStr;
          lastDateStr = actDateStr;

          return (
            <div key={act.id} className="relative pl-6">
              {showDateHeader && (
                <div className="absolute -left-2.75 bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-4 border-gray-50 mt-1"></div>
              )}
              {!showDateHeader && (
                <div className="absolute -left-1.75 bg-indigo-300 w-3 h-3 rounded-full border-2 border-white mt-1.5"></div>
              )}

              {showDateHeader && (
                <h3 className="font-bold text-gray-800 mb-3">{actDateStr}</h3>
              )}

              <div className="glass-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:-translate-y-1 transition-transform cursor-default">
                <div>
                  <h4 className="font-bold text-gray-900">{act.title}</h4>
                  <div className="flex gap-3 text-xs text-gray-500 mt-2 font-medium">
                    {act.startTime && (
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(act.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md capitalize">
                      {act.category}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  ₹
                  {Number(act.cost).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl">
        {error || "Trip not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link
        to="/my-trips"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Trips
      </Link>

      {/* Trip Header & Toggles */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {isEditingTrip ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editTripData.name}
                  onChange={(e) =>
                    setEditTripData({ ...editTripData, name: e.target.value })
                  }
                  className="text-3xl font-bold text-gray-900 tracking-tight border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                  autoFocus
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                {trip.name} Itinerary
                <button
                  onClick={startEditingTrip}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                  title="Edit trip details"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </h1>
            )}

            {isEditingTrip ? (
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <input
                    type="date"
                    value={editTripData.startDate}
                    onChange={(e) =>
                      setEditTripData({
                        ...editTripData,
                        startDate: e.target.value,
                      })
                    }
                    className="text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={editTripData.endDate}
                    onChange={(e) =>
                      setEditTripData({
                        ...editTripData,
                        endDate: e.target.value,
                      })
                    }
                    className="text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded"
                  />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={handleUpdateTrip}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
                    title="Save changes"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingTrip(false)}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-3 text-gray-600 font-medium">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>
                  {new Date(trip.startDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "numeric",
                    year: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(trip.endDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "numeric",
                    year: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === "grouped" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="w-4 h-4" /> Grouped
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === "timeline" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Clock className="w-4 h-4" /> Timeline
            </button>
            <Link
              to={`/trips/${id}/budget`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-indigo-600 hover:bg-white"
            >
              <span>₹</span> Budget
            </Link>
            <Link
              to={`/trips/${id}/packing`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-indigo-600 hover:bg-white"
            >
              <CheckSquare className="w-4 h-4" /> Checklist
            </Link>
            <Link
              to={`/trips/${id}/notes`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-indigo-600 hover:bg-white"
            >
              <FileText className="w-4 h-4" /> Notes
            </Link>
          </div>
        </div>

        {/* Share Trip Section */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-500" /> Share with friends
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Make this trip public so others can view and copy it.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleShareToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trip.isPublic ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trip.isPublic ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {trip.isPublic ? "Public" : "Private"}
            </span>

            {trip.isPublic && (
              <button
                onClick={copyShareLink}
                className="ml-auto sm:ml-4 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === "timeline" ? (
        renderTimelineView()
      ) : (
        /* Sections (Stops) Grouped View */
        <div className="space-y-6">
          {trip.stops?.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden group hover:border-indigo-200 transition-colors"
            >
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
                    {new Date(stop.arrivalDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    to{" "}
                    {new Date(stop.departureDate).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </div>
                  <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg text-sm font-bold text-green-700 flex items-center gap-1">
                    ₹{" "}
                    {calculateStopBudget(stop.activities).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 },
                    )}
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="p-5">
                {stop.activities?.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {stop.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-indigo-50/30 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {act.title}
                          </p>
                          {act.startTime && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                              <Calendar className="w-3 h-3 text-indigo-400" />{" "}
                              {new Date(act.startTime).toLocaleString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          )}
                        </div>
                        <div className="font-bold text-gray-700 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                          ₹
                          {Number(act.cost).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4 italic">
                    No activities planned for this section yet.
                  </p>
                )}

                {/* Add Activity Form/Button */}
                {addingActivityToStop === stop.id ? (
                  <div className="space-y-4">
                    {/* Suggested Activities */}
                    {isSearchingActivities ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      </div>
                    ) : suggestedActivities.length > 0 ? (
                      <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" /> Popular
                          Activities in {stop.cityName.split(",")[0]}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {suggestedActivities.map((act) => (
                            <div
                              key={act.id}
                              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-indigo-300 transition-colors"
                            >
                              <div>
                                <h5 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                  {act.title}
                                </h5>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {act.description}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                    {act.type || "sightseeing"}
                                  </span>
                                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                    ₹{Number(act.cost).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewActivity({
                                    title: act.title,
                                    cost: act.cost.toString(),
                                    category: act.type || "sightseeing",
                                    startTime: "",
                                  });
                                }}
                                className="mt-3 w-full py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-md transition-colors"
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-center mt-3 border-t border-indigo-100/50 pt-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Or create custom activity below
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <form
                      onSubmit={(e) => handleAddActivity(e, stop.id)}
                      className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Activity Title
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Visit Eiffel Tower"
                            value={newActivity.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewActivity({
                                ...newActivity,
                                title: val,
                              });

                              if (activitySearchTimeoutRef.current) {
                                clearTimeout(activitySearchTimeoutRef.current);
                              }
                              activitySearchTimeoutRef.current = setTimeout(
                                () => {
                                  searchGlobalActivities(val);
                                },
                                500,
                              );
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />

                          {/* Global Activity Suggestions Dropdown */}
                          {globalActivitySearchResults.length > 0 && (
                            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {globalActivitySearchResults.map((ga) => (
                                <button
                                  key={ga.id}
                                  type="button"
                                  onClick={() => {
                                    setNewActivity({
                                      ...newActivity,
                                      title: ga.title,
                                      category:
                                        ga.type?.toLowerCase() || "sightseeing",
                                      cost: ga.cost || "0",
                                    });
                                    setGlobalActivitySearchResults([]);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {ga.title}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                                      {ga.type}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-indigo-600">
                                      ₹{ga.cost}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {ga.cityName}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Type
                          </label>
                          <select
                            value={newActivity.category}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                category: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="sightseeing">Sightseeing</option>
                            <option value="transport">Transport</option>
                            <option value="stay">Stay</option>
                            <option value="meals">Meals</option>
                            <option value="food">Food & Drinks</option>
                            <option value="adventure">Adventure</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Cost (₹)
                          </label>
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={newActivity.cost}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                cost: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="e.g. 25.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Start Time (Optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={newActivity.startTime}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setAddingActivityToStop(null)}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingActivity}
                          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                        >
                          {isSubmittingActivity ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Save Activity"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingActivityToStop(stop.id)}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Section (Stop) with Search */}
      {viewMode === "grouped" &&
        (isAddingStop ? (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" /> Add New Destination
              Section
            </h3>

            <div className="mb-4 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Search City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery || newStop.cityName}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setNewStop({ ...newStop, cityName: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Search globally... (e.g. Tokyo)"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-indigo-500" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => selectCity(city)}
                      className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {city.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {city.country}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full block mb-1">
                          {"⭐".repeat(city.costIndex || 2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Pop: {city.popularity || 50}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Arrival Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newStop.arrivalDate}
                    onChange={(e) =>
                      setNewStop({ ...newStop, arrivalDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    required
                    type="date"
                    value={newStop.departureDate}
                    onChange={(e) =>
                      setNewStop({ ...newStop, departureDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingStop(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStop || !newStop.cityName}
                  className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center disabled:opacity-50"
                >
                  {isSubmittingStop ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    "Add to Trip"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingStop(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
          >
            <Search className="w-5 h-5" /> Search & Add Destination
          </button>
        ))}
    </div>
  );
};

export default ItineraryBuilder;
