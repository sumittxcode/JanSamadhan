import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import RoleSidebar from './RoleSidebar';
import { Menu, X, ChevronRight, Home as HomeIcon } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // If unauthenticated or no user, render children cleanly
  if (!user) {
    return <>{children}</>;
  }

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
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Role Sidebar */}
      <RoleSidebar
        user={user}
        logout={logout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub-header / Breadcrumbs & Mobile Sidebar Toggle */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-16 z-10 backdrop-blur-xs bg-white/95">
          <div className="flex items-center space-x-2">
            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb Trail */}
            <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-0.5">
              <Link to="/" className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider text-[10px] transition-colors">Home</Link>
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
          </div>

          {/* Role Indicator Pill */}
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Logged in as:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              {user.role}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
