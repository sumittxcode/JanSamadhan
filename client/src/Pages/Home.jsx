import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FilePlus2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  Eye,
  ShieldCheck,
  Camera,
  FileText,
  MapPin,
  LogIn
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
      desc: 'Fill out the standardized grievance form with problem details, precise landmark location, category, and photographic evidence.',
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
      desc: 'Monitor real-time progress through standard audit milestones until the officer completes on-site remediation and uploads proof.',
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
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* =========================================================================
          HERO SECTION — Modern Indian Civic Service Aesthetic
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50/40 to-white border-b border-slate-200/80 pt-12 sm:pt-16 pb-16 lg:pb-20">
        
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Description, 3 Action Buttons, Trust Indicators */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Civic Pill Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-xs text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold select-none border border-slate-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tracking-wide">Civic Grievance Management System</span>
              </div>

              {/* Three-Line Headline with Visual Hierarchy & Subtle Green Underline Accent */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                <span className="block">Your Community.</span>
                <span className="block">Your Voice.</span>
                <span className="block text-blue-600 relative inline-block mt-0.5">
                  Better Civic Services.
                  {/* Subtle green underline accent */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-2 text-emerald-500 overflow-visible"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,5 Q50,0 100,5"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                JanSamadhan connects citizens directly with municipal authorities. Report civic and infrastructure issues in your neighborhood, track resolution progress, and receive verified updates from the responsible department.
              </p>

              {/* Three Clearly Styled Action Buttons */}
              <div className="flex flex-wrap gap-3.5 pt-2">
                
                {/* 1. File a Complaint — Green filled button with file-plus icon */}
                <Link
                  to={getDestination('submit')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-2 active:scale-98"
                >
                  <FilePlus2 className="h-4.5 w-4.5" />
                  <span>File a Complaint</span>
                </Link>

                {/* 2. Track a Complaint — White button with subtle border and eye icon */}
                <Link
                  to={getDestination('track')}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center space-x-2 active:scale-98"
                >
                  <Eye className="h-4.5 w-4.5 text-slate-500" />
                  <span>Track a Complaint</span>
                </Link>

                {/* 3. Citizen & Staff Login — Navy button with login icon */}
                {!user ? (
                  <Link
                    to="/login"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-2 active:scale-98"
                  >
                    <LogIn className="h-4.5 w-4.5" />
                    <span>Citizen &amp; Staff Login</span>
                  </Link>
                ) : (
                  <Link
                    to={getDestination('submit')}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-2 active:scale-98"
                  >
                    <ArrowRight className="h-4.5 w-4.5" />
                    <span>Go to Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Three Compact Trust Indicators with Icons */}
              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-slate-600 font-medium">
                <span className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Transparent Process</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Real-Time Tracking</span>
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified Resolution</span>
                </span>
              </div>

            </div>

            {/* Right Column: Citizen Photograph with Floating Information Card */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              
              {/* Outer decorative card container */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100 group">
                <img
                  src="/assets/images/citizen_photographing_pothole.jpg"
                  alt="An Indian citizen using a smartphone to document a road pothole for municipal repair"
                  className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="eager"
                  onError={(e) => {
                    // Graceful fallback to secondary local asset if needed
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/images/citizen_reporting_hero.jpg";
                  }}
                />

                {/* Floating Information Card Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3.5 shadow-lg flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      Report Issues in Your Area
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5 truncate sm:whitespace-normal">
                      Click a photo, describe the issue, and let us take care of the rest.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          FEATURE CARDS BELOW THE HERO — 3 Balanced Horizontally Aligned Cards
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 — Easy Complaint Filing */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Easy Complaint Filing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Report civic issues with location, description and photos in just a few clicks.
              </p>
            </div>
          </div>

          {/* Card 2 — Real-Time Tracking */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start space-x-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Real-Time Tracking
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Track the progress of your complaint with live updates and status changes.
              </p>
            </div>
          </div>

          {/* Card 3 — Verified Resolution */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start space-x-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Verified Resolution
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get notified when your issue is resolved with department verification.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          HOW IT WORKS SECTION — 3-Step Civic Resolution Workflow
         ========================================================================= */}
      <section id="how-it-works" className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Resolution Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How JanSamadhan Redresses Civic Issues
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A transparent three-step administrative workflow connecting citizens, zonal officers, and municipal supervisors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      Step {s.step}
                    </span>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-semibold text-blue-900 flex items-center space-x-1">
                  <span>Standard Process Milestone</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          GRIEVANCE CATEGORIES SECTION — Live/Fallback Civic Categories
         ========================================================================= */}
      <section id="categories" className="py-14 sm:py-18 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Municipal Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reportable Civic Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Select the appropriate department for your issue to ensure rapid dispatch to on-duty field teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, idx) => (
              <div
                key={cat._id || idx}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-xs hover:shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2.5 text-slate-900 font-bold text-sm">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
                      <Building2 className="h-4 w-4 shrink-0" />
                    </div>
                    <span>{cat.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5 min-h-[36px]">
                    {cat.description || 'Public service grievance lodging category.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60">
                  <Link
                    to={getDestination('submit')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-1.5"
                  >
                    <span>Report this issue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================================
          TRANSPARENCY & SLA TRACKING SECTION — 5-Stage Resolution Pipeline
         ========================================================================= */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Transparency &amp; Accountability
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            5-Stage Resolution Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every grievance progresses through strict audit milestones with timestamped status updates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between"
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


      {/* =========================================================================
          CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="bg-slate-900 text-white py-14 border-t border-slate-800">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Lodge Complaint
            </Link>
            <Link
              to={getDestination('track')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
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
