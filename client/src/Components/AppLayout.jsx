import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import RoleSidebar from './RoleSidebar';
import {
  Menu,
  X,
  ChevronRight,
  Shield,
  Bell,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const { user, logout, notifications, markNotificationRead } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowNotifications(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  if (!user) {
    return <>{children || <Outlet />}</>;
  }

  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 0;

  const handleNotificationClick = async (id) => {
    if (markNotificationRead) {
      await markNotificationRead(id);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    setShowNotifications(false);
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user.role === 'Administrator') return '/admin';
    if (user.role === 'Department Officer') return '/officer';
    return '/dashboard';
  };

  // Generate breadcrumbs from location
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [];

    if (user.role === 'Citizen') {
      crumbs.push({ label: 'Citizen Portal', path: '/dashboard' });
    } else if (user.role === 'Department Officer') {
      crumbs.push({ label: 'Officer Desk', path: '/officer' });
    } else if (user.role === 'Administrator') {
      crumbs.push({ label: 'Admin Command', path: '/admin' });
    }

    if (parts.length > 0) {
      const current = parts[parts.length - 1];
      const pageNames = {
        'dashboard': 'My Complaints',
        'submit-complaint': 'Register Grievance',
        'edit-complaint': 'Edit Grievance',
        'complaint': 'Grievance Details',
        'officer': 'Resolution Desk',
        'admin': 'Control Room',
        'users': 'User Directory',
        'categories': 'Categories',
        'logs': 'Audit Logs',
        'profile': 'Account Profile'
      };
      const label = pageNames[current] || current.charAt(0).toUpperCase() + current.slice(1);
      if (label !== crumbs[0]?.label) {
        crumbs.push({ label, path: location.pathname });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* =========================================================================
          Authenticated Top Header (Enterprise Government Application Shell)
          Contains ONLY official branding, notifications, and user identity.
          Zero public marketing links.
         ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center space-x-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Official Portal Brand */}
            <Link to={getDashboardPath()} className="flex items-center space-x-3 group">
              <div className="h-9 w-9 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-blue-800 transition-colors shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  JanSamadhan
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Grievance Redressal Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Notifications & User Profile Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
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

              {/* Notification Popover */}
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
                    {!notifications || notifications.length === 0 ? (
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
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !notif.read ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-slate-800 leading-snug ${!notif.read ? 'font-semibold' : ''}`}>
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2.5 p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200"
                aria-label="User account menu"
              >
                <div className="h-8 w-8 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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
                      <span>Account Settings &amp; Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          Authenticated Workspace: Sidebar + Breadcrumbs + Main Content
         ========================================================================= */}
      <div className="flex-1 flex min-w-0">
        {/* Role-Specific Navigation Sidebar */}
        <RoleSidebar
          user={user}
          logout={logout}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Sub-header: Breadcrumb Trail & Role Badge */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between sticky top-16 z-10 backdrop-blur-xs bg-white/95">
            <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-0.5">
              <Link
                to="/"
                className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider text-[10px] transition-colors"
              >
                Home
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path + idx}>
                  <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-800 font-bold truncate max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-blue-700 truncate max-w-[150px]">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <div className="hidden sm:flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Workspace:</span>
              <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                {user.role}
              </span>
            </div>
          </div>

          {/* Main Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children || <Outlet />}
          </main>

          {/* Clean Authenticated Footer */}
          <footer className="border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 bg-white/40">
            <span>
              © {new Date().getFullYear()} JanSamadhan — Centralized Grievance Redressal System. All rights reserved.
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span>Transparent Redressal</span>
              <span>•</span>
              <span>Verified Audit Trail</span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default AppLayout;
