import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, User as UserIcon, Mail, Phone, MapPin, Globe, AlignLeft, Loader2, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', formData);
      login(data.token, { id: data.id, firstName: data.firstName, lastName: data.lastName, email: data.email });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 rounded-full bg-indigo-100 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-cyan-100 blur-3xl opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Photo Circle Placeholder */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1 shadow-lg mb-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-transparent">
              <Camera className="w-8 h-8 text-indigo-300" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm mb-8">Join Traveloop and start planning</p>

          <form onSubmit={handleSubmit} className="w-full">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100 mb-6">
                {error}
              </div>
            )}

            <div className="bg-white/40 border border-white/60 p-6 rounded-2xl shadow-sm mb-6 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="First Name" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="Last Name" />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="Email Address" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="Phone Number" />
                </div>
              </div>

               {/* Password */}
               <div className="relative">
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="Password (min 6 chars)" />
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="City" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none" placeholder="Country" />
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 pointer-events-none">
                  <AlignLeft className="h-4 w-4 text-gray-400" />
                </div>
                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none resize-none" placeholder="Additional Information ...." />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Register Users</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
