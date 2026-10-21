import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  FolderTree,
  Activity,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const RoleSidebar = ({
  user,
  logout,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const location = useLocation();

  if (!user) return null;

  // Navigation definition per role
  const getNavItems = () => {
    switch (user.role) {
      case 'Citizen':
        return [
          {
            label: 'My Complaints',
            path: '/dashboard',
            icon: LayoutDashboard,
            badge: null
          },
          {
            label: 'File a Complaint',
            path: '/submit-complaint',
            icon: FilePlus2,
            badge: null
          },
          {
            label: 'My Profile',
            path: '/profile',
            icon: User,
            badge: null
          }
        ];

      case 'Department Officer':
        return [
          {
            label: 'Resolution Desk',
            path: '/officer',
            icon: LayoutDashboard,
            badge: user.department || null
          },
          {
            label: 'My Profile',
            path: '/profile',
            icon: User,
            badge: null
          }
        ];

      case 'Administrator':
        return [
          {
            label: 'Control Room',
            path: '/admin',
            icon: LayoutDashboard,
            badge: null
          },
          {
            label: 'Users & Roles',
            path: '/admin/users',
            icon: Users,
            badge: null
          },
          {
            label: 'Categories',
            path: '/admin/categories',
            icon: FolderTree,
            badge: null
          },
          {
            label: 'Audit Logs',
            path: '/admin/logs',
            icon: Activity,
            badge: null
          },
          {
            label: 'Admin Profile',
            path: '/profile',
            icon: User,
            badge: null
          }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLinkClick = () => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const roleLabel = {
    'Citizen': 'Citizen Account',
    'Department Officer': 'Department Officer',
    'Administrator': 'System Administrator'
  }[user.role] || user.role;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ease-in-out
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start lg:z-20
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}
        `}
      >
        {/* User Identity Banner in Sidebar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                  {roleLabel}
                </p>
                {user.department && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-full">
                    {user.department}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                title={isCollapsed ? item.label : undefined}
                className={`group flex items-center px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className="ml-2 text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 truncate max-w-[80px]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions / Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-1">
          {/* Quick SLA / Help Guide info */}
          {!isCollapsed && (
            <div className="px-3 py-2 mb-2 rounded-lg bg-blue-50/60 border border-blue-100/60 text-[11px] text-blue-950">
              <span className="font-bold block">Grievance Portal SLA</span>
              <span className="text-[10px] text-slate-600">Standard resolution turnaround: 48h–7d</span>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-xs font-medium transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>

          {/* Logout Action */}
          <button
            type="button"
            onClick={() => {
              if (setMobileOpen) setMobileOpen(false);
              logout();
            }}
            className={`w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors ${
              isCollapsed ? 'lg:justify-center' : 'space-x-3'
            }`}
            title="Sign out of system"
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-600" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default RoleSidebar;
