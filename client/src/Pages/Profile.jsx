import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const { fullName, phone, address, password, confirmPassword } = formData;
    if (!fullName || !phone || !address) {
      setError('Name, phone, and address are required.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const updatedData = { fullName, phone, address };
    if (password) updatedData.password = password;

    const result = await updateProfile(updatedData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 5000); // Clear alert after 5s
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-md overflow-hidden">
        {/* Banner Header */}
        <div className="bg-slate-900 text-white px-6 py-5 select-none">
          <h2 className="text-lg font-bold">Profile Management</h2>
          <p className="text-xs text-slate-400">View and update your official portal credentials.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-750 font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mx-6 mt-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-start space-x-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Account Role Badge info */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex justify-between items-center text-sm">
              <div>
                <span className="font-semibold text-slate-700 block">Registered Email</span>
                <span className="text-slate-500 text-xs flex items-center space-x-1.5 mt-1 select-all">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                {user?.role} Role
              </span>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3 pointer-events-none text-slate-400">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-11 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                ></textarea>
              </div>
            </div>

            {/* Password Section info header */}
            <div className="md:col-span-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Change Password (Optional)</span>
              </h4>
              <p className="text-[11px] text-slate-400">Leave fields empty to retain current password.</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors disabled:opacity-50 font-sans"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
