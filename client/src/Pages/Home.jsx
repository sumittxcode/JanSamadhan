import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ShieldCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Activity,
  Landmark,
  Globe
} from "lucide-react";

const Home = () => {
  const { user } = useContext(AuthContext);

  // Stats data
  const stats = [
    { label: 'Active Complaints', value: '1,248', icon: Activity, color: 'text-amber-600 bg-amber-50' },
    { label: 'Grievances Resolved', value: '18,490', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Average Resolution Time', value: '4.2 Days', icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Registered Citizens', value: '45,892', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' }
  ];

  // Citizen grievance steps
  const steps = [
    {
      title: 'File Complaint',
      desc: 'Submit your grievance with details, location, priority, and an optional supporting image.',
      icon: ClipboardList
    },
    {
      title: 'Officer Assigned',
      desc: 'The admin allocates your issue to the designated zone and relevant officer in real-time.',
      icon: ShieldCheck
    },
    {
      title: 'Track Resolution',
      desc: 'Monitor the status updates with proof of work and resolution remarks posted by the officer.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold select-none">
                <Globe className="h-3.5 w-3.5" />
                <span>Centralized Grievance Redressal Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                JanSamadhan
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
                Report civic issues, track complaints, and connect with authorities easily. "Your Voice. Your Complaint. Your Solution."
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                {user ? (
                  <>
                    <Link
                      to={user.role === 'Citizen' ? '/submit-complaint' : user.role === 'Department Officer' ? '/officer' : '/admin'}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login?redirect=submit-complaint"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Register Complaint
                    </Link>
                    <Link
                      to="/login?redirect=dashboard"
                      className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-lg text-sm font-semibold transition-all"
                    >
                      Track Complaint
                    </Link>
                    <Link
                      to="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-2xl blur-xl opacity-70"></div>
              <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden aspect-video lg:aspect-square flex items-center justify-center">
                <img
                  src="/assets/images/citizen_grievance_hero.png"
                  alt="Citizen using app to report issue"
                  className="rounded-xl w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to stylized SVG card if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center space-y-4 p-8 text-center bg-gradient-to-br from-blue-50 to-emerald-50 h-full w-full">
                  <ShieldCheck className="h-16 w-16 text-blue-600 animate-pulse" />
                  <h3 className="text-lg font-bold text-slate-800">Digital Grievance Platform</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Connecting citizens and municipalities for a smarter community.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900 block">{stat.value}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/50">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How the Platform Works</h2>
          <p className="text-slate-600">We facilitate an open channel of communication between municipal offices and local citizens.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center relative group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                  {idx + 1}
                </div>
                <div className="inline-flex p-4 bg-slate-50 text-blue-600 rounded-2xl mb-6 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Landmark className="h-12 w-12 text-blue-400 mx-auto" />
            <h2 className="text-3xl font-extrabold tracking-tight">Redressal Mandate & SLA Guidelines</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Every complaint registered under the JanSamadhan portal is bound by a Service Level Agreement (SLA). Designated zone officers are required to investigate complaints within 48 hours of assignment and submit visual resolution proof upon completion.
            </p>
            <div className="inline-flex space-x-6 pt-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>Transparent Progress Tracking</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>Officer Accountability</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
