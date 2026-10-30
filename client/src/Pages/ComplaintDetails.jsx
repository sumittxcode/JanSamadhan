import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Check,
  XCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../Components/StatusBadge';

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
    return { path: '/dashboard', label: 'Return to My Complaints' };
  };

  const navInfo = getDashboardDestination();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="text-slate-600 text-xs font-medium">Retrieving grievance record...</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-rose-50 p-8 rounded-xl border border-rose-200 space-y-4">
          <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-rose-900">Unable to Load Record</h2>
          <p className="text-xs text-rose-700">{error || 'Grievance not found or inaccessible.'}</p>
          <Link
            to={navInfo.path}
            className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{navInfo.label}</span>
          </Link>
        </div>
      </div>
    );
  }

  // 5 Pipeline Stages
  const steps = [
    { key: 'Pending', label: 'Pending Review' },
    { key: 'Under Review', label: 'Under Review' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' }
  ];

  const getStepIndex = (status) => {
    if (status === 'Rejected') return -1;
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIdx = getStepIndex(complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Dynamic Back Link */}
      <Link
        to={navInfo.path}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{navInfo.label}</span>
      </Link>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Header Strip */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs text-blue-900 bg-white px-2.5 py-1 rounded border border-slate-200 tracking-wide">
                Ref: {complaint.complaintId}
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Filed {new Date(complaint.createdAt).toLocaleDateString()}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <StatusBadge status={complaint.status} size="sm" />
              <PriorityBadge priority={complaint.priority} size="sm" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                Category: {complaint.category}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                Department: {complaint.department || complaint.category}
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Progression */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Resolution Progress Timeline
            </h2>
            <span className="text-[11px] text-slate-400">
              {complaint.status === 'Rejected' ? 'Workflow Closed' : `Stage ${currentStepIdx + 1} of ${steps.length}`}
            </span>
          </div>

          {complaint.status === 'Rejected' ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-rose-800">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Grievance Rejected</span>
                <p className="mt-1 leading-relaxed">
                  Reason: "{complaint.remarks || 'Does not meet municipal jurisdiction criteria.'}"
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pt-2">
              {/* Connector line for desktop */}
              <div className="hidden sm:block absolute top-6 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {steps.map((st, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  return (
                    <div key={st.key} className="flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0 space-y-0 sm:space-y-2">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : isActive
                          ? 'bg-blue-900 border-blue-900 text-white ring-4 ring-blue-100'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${
                          isActive ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {st.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-blue-700 font-medium block">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content Body: Grievance Details & Evidence */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Description & Location */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Citizen Grievance Description
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>Reported Location / Landmark:</span>
                </span>
                <p className="text-slate-700 pl-5">{complaint.location}</p>
              </div>

              {/* Citizen Contact (For Staff Only) */}
              {(user?.role === 'Administrator' || user?.role === 'Department Officer') && complaint.citizenId && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>Citizen Contact Information:</span>
                  </span>
                  <div className="pl-5 space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Name:</span> {complaint.citizenId.fullName}</p>
                    {complaint.citizenId.phone && (
                      <p className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{complaint.citizenId.phone}</span>
                      </p>
                    )}
                    {complaint.citizenId.email && (
                      <p className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{complaint.citizenId.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Photographic Proof */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Citizen Photographic Evidence
              </h3>
              {complaint.image ? (
                <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block max-w-full">
                  <img
                    src={complaint.image}
                    alt="Citizen report photographic proof"
                    className="rounded max-h-64 object-contain"
                  />
                  <span className="block text-[11px] text-slate-500 mt-1.5 text-center">
                    Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2 bg-slate-50/50">
                  <Clock className="h-7 w-7 text-slate-300" />
                  <span>No photographic evidence attached with this complaint.</span>
                </div>
              )}
            </div>
          </div>

          {/* Department Assignment & Resolution Section */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Assignment Card */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Assigned Authority
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {complaint.department || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Designated Officer:</span>
                  <span className="font-bold text-slate-900">
                    {complaint.assignedOfficer?.fullName || (
                      <span className="text-amber-700 italic font-normal">Department Pool</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Status Card */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Resolution &amp; Officer Remarks
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                {complaint.status === 'Resolved' ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Redressal Completed</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {complaint.remarks || 'Remediation completed following on-site inspection.'}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 leading-relaxed italic">
                    Resolution remarks and completion proof photograph will be posted by the department officer upon concluding work.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Resolution Proof Photograph */}
          {complaint.status === 'Resolved' && complaint.resolutionImage && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Officer Completion Proof Photograph
              </h3>
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block max-w-md">
                <img
                  src={complaint.resolutionImage}
                  alt="Officer resolution proof"
                  className="rounded max-h-64 object-contain"
                />
                <span className="block text-[11px] text-slate-500 mt-1.5 text-center">
                  Verified resolution submitted by department officer
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
