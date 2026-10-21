import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Lock, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

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
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone number, and address are mandatory.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('New password must contain at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const updatedData = { fullName: fullName.trim(), phone: phone.trim(), address: address.trim() };
    if (password) updatedData.password = password;

    const result = await updateProfile(updatedData);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError(result.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1">
            <User className="h-3.5 w-3.5" />
            <span>Identity &amp; Credentials</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and update your portal contact details and security credentials.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-6 bg-rose-50 border border-rose-200 p-3.5 rounded-lg flex items-start space-x-2.5 text-xs text-rose-800">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mx-6 mt-6 bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg flex items-start space-x-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">Profile credentials updated successfully!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Identity Badge */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Registered Email</span>
                <span className="text-slate-600 font-mono text-[11px] flex items-center space-x-1.5 mt-0.5 select-all">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{user?.email}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
                  {user?.role} Role
                </span>
                {user?.department && (
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-semibold">
                    {user.department}
                  </span>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Address <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                ></textarea>
              </div>
            </div>

            {/* Password Section */}
            <div className="md:col-span-2 border-t border-slate-100 pt-4">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Change Password (Optional)</span>
              </h2>
              <p className="text-[11px] text-slate-400">Leave these fields blank if you do not wish to change your password.</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
