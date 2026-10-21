import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, CheckCircle2, HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Platform Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="h-8 w-8 bg-blue-800 rounded-lg flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">JanSamadhan</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              A transparent, centralized citizen grievance management and redressal system.
              Enabling citizens to report civic infrastructure and service problems directly to responsible
              municipal officers with end-to-end SLA tracking and proof of resolution.
            </p>
            <div className="pt-1 flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Grievance Redressal Service</span>
              </span>
            </div>
          </div>

          {/* Quick Access Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Portal Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/login?redirect=submit-complaint" className="hover:text-white transition-colors">
                  File a Civic Grievance
                </Link>
              </li>
              <li>
                <Link to="/login?redirect=dashboard" className="hover:text-white transition-colors">
                  Track Complaint Progress
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Citizen Account Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Officer &amp; Citizen Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Administrative Oversight & Guidelines */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Administration &amp; SLA</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin-login" className="inline-flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors font-medium">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Admin Control Room</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400 leading-relaxed">
                Standard Redressal Timelines:
                <br />
                • Emergency / Hazard: &lt; 24 Hours
                <br />
                • Standard Maintenance: 48 Hours
                <br />
                • Civic Infrastructure: &lt; 7 Days
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Attribution */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} JanSamadhan — Citizen Grievance Redressal System. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>SLA-Bound Redressal</span>
            <span>•</span>
            <span>Citizen-First Transparency</span>
            <span>•</span>
            <Link to="/admin-login" className="hover:text-slate-300 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
