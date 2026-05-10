import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Image as ImageIcon, Map, AlignLeft, Loader2, ArrowRight } from 'lucide-react';

const CreateTrip: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    description: '',
    coverPhoto: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [recommendedCities, setRecommendedCities] = useState<any[]>([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialCity = queryParams.get('city');
    if (initialCity) {
      setFormData(prev => ({ ...prev, name: `Trip to ${initialCity}` }));
    }
  }, [location]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const { data } = await api.get('/trips/search/cities');
        setRecommendedCities(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      }
    };
    fetchRecommended();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (imageFile) {
        formDataToSend.append('coverPhoto', imageFile);
      }

      await api.post('/trips/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/'); // Back to dashboard on success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan a New Trip</h1>
        <p className="text-gray-500 mt-2">Start your next adventure by giving it a name and selecting the dates.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-50 blur-3xl opacity-60 pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Trip Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Map className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 outline-none shadow-sm"
                placeholder="e.g. Summer in Europe"
              />
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 outline-none shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 outline-none shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Budget ($)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-gray-400 font-medium">$</span>
              </div>
              <input
                type="number"
                name="totalBudget"
                min="0"
                step="0.01"
                value={formData.totalBudget}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 outline-none shadow-sm"
                placeholder="e.g. 2500.00"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 pointer-events-none">
                <AlignLeft className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full pl-11 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 outline-none shadow-sm resize-none"
                placeholder="What are the main goals of this trip?"
              />
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Photo (Optional)</label>
            <div className="relative border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl overflow-hidden group hover:bg-gray-100 transition-colors min-h-[120px] flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {previewUrl ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload cover photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-medium py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 min-w-35"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Save Trip</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recommended Cities Section */}
      <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Destinations</h2>
            <p className="text-gray-500 text-sm mt-1">Need inspiration? Check out these popular choices.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCities.map((city) => (
            <div key={city.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
              {/* City Image */}
              <div className="relative h-48 overflow-hidden">
                {city.image ? (
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                    <Map className="w-12 h-12 text-indigo-200" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">
                  {city.popularity}% Popular
                </div>
              </div>

              {/* City Details */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{city.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{city.country}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm font-bold ${i < city.costIndex ? 'text-green-600' : 'text-gray-200'}`}>$</span>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                  Explore the wonders of {city.name}. A top-rated destination in {city.region} perfect for your next getaway.
                </p>

                <div className="mt-auto pt-4">
                  <button 
                    onClick={() => setFormData({ ...formData, name: `Trip to ${city.name}` })}
                    className="w-full py-2 bg-gray-50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg transition-colors border border-gray-100 group-hover:border-indigo-100"
                  >
                    Select for Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
