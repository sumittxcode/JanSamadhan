import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Menu, X, Landmark, FileText, CheckCircle, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, notifications, markNotificationRead } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (id) => {
    await markNotificationRead(id);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Banner (Gov-Tech Portal Style) */}
      <div className="gov-header-bg text-white text-xs px-4 py-1.5 flex justify-between items-center select-none font-medium">
        <div className="flex items-center space-x-2">
          <Landmark className="h-3.5 w-3.5 text-blue-200" />
          <span>Government of India Grievance Portal</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-blue-100">
          <span>Digital India Initiative</span>
          <span>|</span>
          <span>English</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight transition-colors duration-200 group-hover:text-emerald-700">
                  JanSamadhan
                </span>
                <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider -mt-0.5">
                  Citizen Redressal System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {user.role === 'Citizen' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/submit-complaint"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      File Complaint
                    </Link>
                  </>
                )}
                {user.role === 'Department Officer' && (
                  <Link
                    to="/officer"
                    className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Officer Desk
                  </Link>
                )}
                {user.role === 'Administrator' && (
                  <>
                    <Link
                      to="/admin"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Users
                    </Link>
                    <Link
                      to="/admin/categories"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Categories
                    </Link>
                    <Link
                      to="/admin/logs"
                      className="nav-link-underline text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Logs
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn-press p-1.5 text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold ring-2 ring-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif._id)}
                              className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !notif.read ? 'bg-blue-50/40 font-medium' : ''
                              }`}
                            >
                              <p className="text-xs text-slate-700 leading-snug">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200 group"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm transition-all duration-200 group-hover:bg-blue-200 group-hover:ring-2 group-hover:ring-blue-300">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-800 block -mb-0.5 max-w-[120px] truncate transition-colors group-hover:text-blue-700">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="btn-press p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors hidden md:block"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-blue-600 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-press bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              {/* Profile Details */}
              <div className="px-3 py-2.5 border-b border-slate-100 flex items-center space-x-3 mb-2">
                <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{user.fullName}</h4>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Navigation Links */}
              {user.role === 'Citizen' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submit-complaint"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    File Complaint
                  </Link>
                </>
              )}
              {user.role === 'Department Officer' && (
                <Link
                  to="/officer"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  Officer Desk
                </Link>
              )}
              {user.role === 'Administrator' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/categories"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    Categories
                  </Link>
                  <Link
                    to="/admin/logs"
                    onClick={() => setShowMobileMenu(false)}
                    className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    Logs
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                onClick={() => setShowMobileMenu(false)}
                className="block text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold border-t border-slate-100 pt-2"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block text-center text-slate-700 hover:text-blue-600 border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
