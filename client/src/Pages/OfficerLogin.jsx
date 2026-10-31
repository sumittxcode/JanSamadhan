import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const OfficerLogin = () => {
  const { login, logout, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in as Department Officer, redirect directly to /officer
  useEffect(() => {
    if (user && user.role === 'Department Officer') {
      navigate('/officer', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide officer email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.message || 'Invalid officer credentials.');
        setLoading(false);
        return;
      }

      // Enforce role separation: Only Department Officers are permitted through Staff Login
      if (result.user.role !== 'Department Officer') {
        logout();
        setError('Access Denied: This portal is exclusively for Department Officers. Citizens please use Citizen Login, and Administrators please use Admin Login.');
        setLoading(false);
        return;
      }

      navigate('/officer', { replace: true });
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-9 rounded-xl border border-slate-200 shadow-sm">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-[#1F3A5F] text-white rounded-lg flex items-center justify-center shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Department Officer Sign In
          </h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Staff &amp; Departmental Redressal Access
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800 block mb-0.5">Official Use Only</span>
          This workspace is reserved for authorized municipal department officers and field resolution personnel.
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg flex items-start space-x-2.5 text-xs text-rose-800">
            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="officer-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Department Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="officer-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1F3A5F] transition-all font-sans"
                placeholder="officer@jansamadhan.gov.in"
              />
            </div>
          </div>

          <div>
            <label htmlFor="officer-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Officer Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="officer-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1F3A5F] transition-all font-sans"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-[#1F3A5F] hover:bg-[#172d49] text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Officer Console</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-3 text-center border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs font-medium text-slate-500 hover:text-blue-900 transition-colors"
          >
            ← Return to Citizen Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfficerLogin;
