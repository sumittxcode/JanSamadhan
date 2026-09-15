import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  User,
  Landmark,
  FileText,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve complaint details');
      toast.error('Grievance record not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const getDashboardDestination = () => {
    if (user?.role === 'Administrator') {
      return { path: '/admin', label: 'Return to Admin Control Room' };
    }
    if (user?.role === 'Department Officer') {
      return { path: '/officer', label: 'Return to Officer Desk' };
    }
    return { path: '/dashboard', label: 'Return to Citizen Dashboard' };
  };

  const navInfo = getDashboardDestination();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="text-slate-500 text-sm font-medium">Retrieving grievance record...</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-rose-50 p-8 rounded-2xl border border-rose-200 space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-rose-800">Error Loading Details</h3>
          <p className="text-sm text-rose-700">{error || 'Grievance not found.'}</p>
          <Link
            to={navInfo.path}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{navInfo.label}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Define steps for standard timeline
  const steps = ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

  const getStepIndex = (status) => {
    if (status === 'Rejected') return -1;
    return steps.indexOf(status);
  };

  const currentStepIdx = getStepIndex(complaint.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dynamic Role-Aware Back Link */}
      <Link
        to={navInfo.path}
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>{navInfo.label}</span>
      </Link>

      {/* Main Details Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-8 p-6 sm:p-8">
        
        {/* Title and Meta Information */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 font-mono uppercase px-2.5 py-0.5 rounded tracking-wider">
                Ref: {complaint.complaintId}
              </span>
              <span className="text-xs text-slate-400">
                Filed on {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {complaint.category}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                Dept: {complaint.department}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                complaint.status === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : complaint.status === 'Rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : complaint.status === 'In Progress'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {complaint.status}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                complaint.priority === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : complaint.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* Interactive Status Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resolution Pipeline Status
            </h3>
            <span className="text-xs text-slate-400">Step {currentStepIdx >= 0 ? currentStepIdx + 1 : '—'} of {steps.length}</span>
          </div>
          
          {complaint.status === 'Rejected' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-800">Grievance Rejected</h4>
                <p className="text-xs text-rose-700 leading-relaxed mt-1">
                  This complaint has been reviewed and closed by municipal administration. Reason: "{complaint.remarks || 'Does not qualify for redressal under civic bylaws.'}"
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pt-2">
              <div className="absolute top-7 left-4 right-4 hidden md:block h-0.5 bg-slate-200 z-0"></div>
              
              <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  
                  return (
                    <div key={idx} className="flex md:flex-col items-center flex-row text-left md:text-center space-x-4 md:space-x-0 md:space-y-2 flex-1">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCompleted ? 'timeline-step-completed' :
                        isActive ? 'timeline-step-active' :
                        'timeline-step-pending'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span className={`block text-xs font-bold ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {step}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                            Active State
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Description & Citizen Uploaded Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Citizen Grievance Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {complaint.description}
            </p>
            
            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Reported Landmark / Location:</span>
                  <span className="mt-0.5 block">{complaint.location}</span>
                </div>
              </div>

              {/* Show Citizen Identity if Officer or Administrator */}
              {(user?.role === 'Administrator' || user?.role === 'Department Officer') && complaint.citizenId && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Complainant Information:</span>
                  <p className="text-slate-700 font-medium">{complaint.citizenId.fullName || 'Citizen User'}</p>
                  {complaint.citizenId.phone && (
                    <p className="flex items-center space-x-1.5 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{complaint.citizenId.phone}</span>
                    </p>
                  )}
                  {complaint.citizenId.email && (
                    <p className="flex items-center space-x-1.5 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{complaint.citizenId.email}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Citizen Supporting Photograph</h3>
            {complaint.image ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm p-1.5 bg-white flex items-center justify-center max-h-72">
                <img
                  src={complaint.image}
                  alt="Citizen report proof"
                  className="rounded-lg max-h-64 max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 bg-slate-50/50 min-h-[160px]">
                <Clock className="h-8 w-8 text-slate-300" />
                <span>No photographic evidence attached with this complaint.</span>
              </div>
            )}
          </div>
        </div>

        {/* Officer Assignment & Resolution Section */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignment Card */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Redressal Authority</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs">
                  <Landmark className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">Target Department:</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">{complaint.department}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-start space-x-2.5 text-xs">
                  <User className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Designated Officer:</span>
                    {complaint.assignedOfficer ? (
                      <div className="mt-0.5">
                        <span className="text-slate-900 font-bold">{complaint.assignedOfficer.fullName}</span>
                        <span className="text-slate-500 block text-[11px]">{complaint.assignedOfficer.department} Dept</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 italic block mt-0.5">
                        In Department Pool (Pending specific officer dispatch)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Card */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resolution Status</h3>
              {complaint.status === 'Resolved' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Redressal Completed</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block">Officer Remarks:</span>
                    <p className="text-xs text-slate-800 mt-1 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200">
                      {complaint.remarks || 'Grievance resolved following on-site inspection.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center text-slate-500 text-xs py-6">
                  <Clock className="h-6 w-6 text-slate-400 mb-1.5" />
                  <span>Resolution remarks and proof photograph will be posted once work completes.</span>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Proof Image */}
          {complaint.status === 'Resolved' && complaint.resolutionImage && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Officer Resolution Proof Photograph
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden p-1.5 bg-white inline-block max-w-md shadow-sm">
                <img
                  src={complaint.resolutionImage}
                  alt="Resolution proof"
                  className="rounded-lg max-h-64 object-contain"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
