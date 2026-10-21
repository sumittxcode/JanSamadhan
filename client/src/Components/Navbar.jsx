import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Lock,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications, markNotificationRead } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleNotificationClick = async (id) => {
    await markNotificationRead(id);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'Administrator') return '/admin';
    if (user.role === 'Department Officer') return '/officer';
    return '/dashboard';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Utility Bar (Official Portal Look) */}
      <div className="bg-slate-900 text-white text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex justify-between items-center select-none font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="tracking-wide">JanSamadhan — Centralized Grievance Redressal System</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-slate-300 text-[11px]">
          <span>Citizen Redressal Service</span>
          <span>•</span>
          <span>SLA Monitored</span>
          {!user && (
            <>
              <span>•</span>
              <Link to="/admin-login" className="text-slate-300 hover:text-white flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Admin Login</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-blue-800 transition-colors">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                  JanSamadhan
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                  Citizen Grievance Redressal Portal
                </span>
              </div>
            </Link>

            {/* Public Center Links (Only for guests) */}
            {!user && (
              <nav className="hidden md:flex items-center space-x-1 ml-8 text-xs font-semibold text-slate-700">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-md hover:text-blue-900 hover:bg-slate-50 transition-colors ${
                    location.pathname === '/' ? 'text-blue-900 bg-slate-100 font-bold' : ''
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#how-it-works"
                  className="px-3 py-1.5 rounded-md hover:text-blue-900 hover:bg-slate-50 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="/#categories"
                  className="px-3 py-1.5 rounded-md hover:text-blue-900 hover:bg-slate-50 transition-colors"
                >
                  Grievance Categories
                </a>
                <Link
                  to="/login?redirect=submit-complaint"
                  className="px-3 py-1.5 rounded-md hover:text-blue-900 hover:bg-slate-50 transition-colors"
                >
                  File a Complaint
                </Link>
                <Link
                  to="/login?redirect=dashboard"
                  className="px-3 py-1.5 rounded-md hover:text-blue-900 hover:bg-slate-50 transition-colors"
                >
                  Track Status
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserDropdown(false);
                    }}
                    className="p-2 text-slate-600 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                          System Notifications
                        </span>
                        {unreadCount > 0 ? (
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {unreadCount} Unread
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">All caught up</span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-slate-400 text-xs">
                            No notifications received yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif._id)}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors text-xs flex items-start space-x-2.5 ${
                                !notif.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-slate-800 leading-snug ${!notif.read ? 'font-semibold' : ''}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Pill & Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="h-8 w-8 bg-blue-900 text-white rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs font-bold text-slate-900 block leading-tight max-w-[130px] truncate">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-100">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <span>Dashboard Workspace</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <span>Account Settings & Profile</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Public Auth Buttons */
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-blue-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                  Register Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu for Guests or Fallback */}
      {showMobileMenu && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {user ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Dashboard Workspace
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 flex items-center space-x-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs font-semibold">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                to="/login?redirect=submit-complaint"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                File a Complaint
              </Link>
              <Link
                to="/login?redirect=dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Track Status
              </Link>
              <Link
                to="/admin-login"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center space-x-1"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Login</span>
              </Link>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-center px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  Register Account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
