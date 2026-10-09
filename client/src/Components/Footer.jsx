import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Phone, Mail, Shield, CheckCircle, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Vision */}
          <div>
            <div className="flex items-center space-x-2 text-white mb-3">
              <Shield className="h-6 w-6 text-emerald-500 transition-transform duration-200 hover:scale-110" />
              <span className="text-lg font-bold tracking-tight">
                JanSamadhan
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              JanSamadhan is a Digital Citizen Grievance Redressal platform that bridges the gap between citizens and authorities. Report local civic issues transparently and track resolutions in real-time.
            </p>
          </div>

          {/* Quick Contact & Info */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Contact Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="footer-hover-lift flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                <span>Toll-Free National Helpline: 1800-111-2233</span>
              </li>
              <li className="footer-hover-lift flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span>support-jansamadhan@gov.in</span>
              </li>
              <li className="footer-hover-lift flex items-center space-x-2">
                <Landmark className="h-3.5 w-3.5 text-blue-400" />
                <span>Department of Administrative Reforms &amp; Public Grievances</span>
              </li>
            </ul>
          </div>

          {/* Policy Disclosures */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform Policy</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#privacy" className="footer-hover-lift inline-flex items-center gap-1 hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="footer-hover-lift inline-flex items-center gap-1 hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#disclaimer" className="footer-hover-lift inline-flex items-center gap-1 hover:text-white transition-colors">Website Disclaimer &amp; Guidelines</a>
              </li>
              <li>
                <Link to="/admin-login" className="footer-hover-lift inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors">
                  <Lock className="h-3 w-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
              <li className="text-[11px] text-slate-500 mt-2">
                Designed under the guidelines of national grievance tracking systems.
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} JanSamadhan Portal. All Rights Reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-slate-500">
            <span>Powered by Digital India</span>
            <span>•</span>
            <span>NIC Certified Secure</span>
            <span>•</span>
            <Link to="/admin-login" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
