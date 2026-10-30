import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Platform Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="h-8 w-8 bg-[#1F3A5F] rounded-lg flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight">JanSamadhan</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs max-w-md">
              A centralized citizen grievance management and redressal system. Citizens can
              report civic infrastructure and service issues directly to responsible
              department officers, with end-to-end status tracking.
            </p>
            <div className="pt-1 flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Grievance Redressal Service</span>
              </span>
            </div>
          </div>

          {/* Quick Access Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Portal Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors footer-hover-lift">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login?redirect=submit-complaint" className="hover:text-white transition-colors footer-hover-lift">
                  File a Grievance
                </Link>
              </li>
              <li>
                <Link to="/login?redirect=dashboard" className="hover:text-white transition-colors footer-hover-lift">
                  Track Complaint Status
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors footer-hover-lift">
                  Register Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors footer-hover-lift">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Redressal Process */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">How It Works</h4>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <li>Submit a grievance with issue details and location.</li>
              <li>Complaint is reviewed and assigned to the responsible department.</li>
              <li>Track progress until the officer resolves and closes the issue.</li>
            </ul>
          </div>

        </div>

        {/* Bottom Attribution */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} JanSamadhan — Citizen Grievance Redressal System. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Transparent Redressal</span>
            <span>•</span>
            <span>Citizen-First Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
