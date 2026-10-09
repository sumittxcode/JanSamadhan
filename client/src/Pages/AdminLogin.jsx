import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Landmark, KeyRound } from 'lucide-react';

const AdminLogin = () => {
  const { login, logout, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in as Administrator, redirect directly to /admin
  useEffect(() => {
    if (user) {
      if (user.role === 'Administrator') {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !password) {
      setError('Please provide both administrative email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.message || 'Invalid administrator credentials.');
        setLoading(false);
        return;
      }

      // Check if logged in user has Administrator role
      if (result.user.role !== 'Administrator') {
        // Immediately revoke non-admin token to prevent session leak
        logout();
        setError('Access Denied: Your account does not have Administrator privileges. Please access the Citizen or Department Officer portal.');
        setLoading(false);
        return;
      }

      // Successful Administrator login
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/5">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Top Government Portal Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600"></div>

        {/* Branding Header */}
        <div className="text-center pt-2">
          <div className="mx-auto h-14 w-14 bg-slate-900 text-blue-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-100">
            <Shield className="h-7 w-7 text-blue-400" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Administrator Control Access</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            JanSamadhan National Redressal Headquarters
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-[11px] text-amber-800 flex items-start space-x-2">
          <Landmark className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Authorized administrative personnel only. All access attempts, IP addresses, and operational sessions are strictly audited and logged.
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Address */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  placeholder="administrator@gov.in"
                />
              </div>
            </div>

            {/* Password with Show/Hide */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="h-4.5 w-4.5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Return to Public Portal */}
        <div className="pt-2 text-center border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs font-medium text-slate-500 hover:text-blue-600 inline-flex items-center space-x-1 transition-colors"
          >
            <span>← Return to Citizen &amp; Department Officer Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
