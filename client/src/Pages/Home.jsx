import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Shield,
  FilePlus2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Eye,
  ShieldCheck
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);

  const fallbackCategories = [
    { name: 'Road/Pothole', description: 'Damaged roads, potholes, pavement erosion, and highway safety hazards.' },
    { name: 'Garbage Collection', description: 'Overflowing public bins, delayed waste disposal, and illegal street dumping.' },
    { name: 'Water Leakage', description: 'Broken supply pipelines, contaminated tap water, or low pressure.' },
    { name: 'Streetlight Problem', description: 'Non-functional streetlights, dark public corridors, and damaged poles.' },
    { name: 'Electricity Issue', description: 'Transformer faults, low voltage, hanging electrical cables, and power supply cuts.' },
    { name: 'Drainage Problem', description: 'Blocked storm drains, overflowing sewers, and stagnant rainwater.' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.warn('Using fallback complaint categories:', err);
        setCategories(fallbackCategories);
      }
    };
    fetchCategories();
  }, []);

  const getDestination = (target) => {
    if (user) {
      if (user.role === 'Citizen') {
        return target === 'submit' ? '/submit-complaint' : '/dashboard';
      } else if (user.role === 'Department Officer') {
        return '/officer';
      } else {
        return '/admin';
      }
    }
    return target === 'submit' ? '/login?redirect=submit-complaint' : '/login?redirect=dashboard';
  };

  const steps = [
    {
      step: '01',
      title: 'Submit Grievance',
      desc: 'Fill out the standardized grievance form with problem details, precise landmark location, category, and optional photographic proof.',
      icon: FilePlus2
    },
    {
      step: '02',
      title: 'Departmental Review & Allocation',
      desc: 'The complaint is triaged and assigned directly to the relevant municipal department and designated zonal field officer.',
      icon: Building2
    },
    {
      step: '03',
      title: 'Track Resolution & Inspect Proof',
      desc: 'Monitor real-time progress through standard SLA milestones until the officer completes on-site work and uploads completion proof.',
      icon: CheckCircle2
    }
  ];

  const milestones = [
    { label: 'Pending Review', desc: 'Registered in the centralized queue awaiting administrative triage.' },
    { label: 'Under Review', desc: 'Assessed by municipal authorities for jurisdiction and urgency rating.' },
    { label: 'Assigned', desc: 'Dispatched to the designated zonal department officer for inspection.' },
    { label: 'In Progress', desc: 'On-site remediation, civil repairs, or municipal maintenance underway.' },
    { label: 'Resolved', desc: 'Remediation completed with officer remarks and photographic evidence posted.' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Civic Pill */}
              <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold select-none border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Civic Grievance Management System</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 tracking-tight leading-[1.2]">
                Your Community. Your Voice. Better Civic Services.
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                JanSamadhan connects citizens directly with municipal authorities. Report civic and infrastructure issues in your neighborhood, track resolution milestones in real time, and receive verified updates from department officers.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3.5 pt-1 items-center">
                <Link
                  to={getDestination('submit')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center space-x-2"
                >
                  <FilePlus2 className="h-4.5 w-4.5" />
                  <span>File a Complaint</span>
                </Link>

                <Link
                  to={getDestination('track')}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2"
                >
                  <Eye className="h-4.5 w-4.5 text-slate-500" />
                  <span>Track a Complaint</span>
                </Link>

                {user ? (
                  <Link
                    to={user.role === 'Citizen' ? '/dashboard' : user.role === 'Department Officer' ? '/officer' : '/admin'}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2"
                  >
                    <span>Dashboard Desk</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center space-x-2"
                  >
                    <span>Citizen &amp; Staff Login</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Transparent Redressal Milestones</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Field Verification with Photographic Proof</span>
                </span>
              </div>
            </div>

            {/* Hero Right Visual: Authentic Citizen Photograph */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
                <img
                  src="/assets/images/citizen_reporting_hero.jpg"
                  alt="An Indian citizen reporting a local civic issue using JanSamadhan in her neighborhood"
                  className="w-full h-auto aspect-[4/3] object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/images/citizen_grievance_hero.png";
                  }}
                />
                
                {/* Restrained overlay caption card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-sm flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Empowering Civic Action
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Report infrastructure issues directly to your municipal ward
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Resolution Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How JanSamadhan Redresses Civic Issues
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            A three-step administrative workflow connecting citizens, zonal officers, and municipal supervisors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Step {s.step}
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-900">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-blue-900 flex items-center space-x-1">
                  <span>Standard Process Milestone</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grievance Categories Section */}
      <section id="categories" className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Municipal Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reportable Civic Categories
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Select the appropriate department for your issue to ensure rapid dispatch to on-duty field teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, idx) => (
              <div
                key={cat._id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                    <Building2 className="h-4 w-4 text-blue-900 shrink-0" />
                    <span>{cat.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 min-h-[36px]">
                    {cat.description || 'Public service grievance lodging category.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60">
                  <Link
                    to={getDestination('submit')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center space-x-1"
                  >
                    <span>Report this issue</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency & SLA Tracking Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Transparency &amp; Accountability
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            5-Stage Resolution Pipeline
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every grievance progresses through strict audit milestones with timestamped status updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Stage {idx + 1}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.label}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Ready to Report an Issue in Your Neighborhood?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Submit your grievance online with exact locations and photos to trigger swift municipal review.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to={getDestination('submit')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Lodge Complaint
            </Link>
            <Link
              to={getDestination('track')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Check Existing Complaint
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
