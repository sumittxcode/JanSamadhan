import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, User, Landmark, HelpCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-800">Error Loading Details</h3>
          <p className="text-sm text-red-700">{error || 'Grievance not found.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Dashboard */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-700 font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Details Panel */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-md overflow-hidden space-y-8 p-6 sm:p-8">
        
        {/* Title and Meta Information */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 space-y-4 sm:space-y-0">
          <div>
            <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1">
              Grievance ID: {complaint.complaintId}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {complaint.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
              <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded">
                {complaint.category}
              </span>
              <span className="text-xs text-slate-500">
                Filed on {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              complaint.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {complaint.status}
            </span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full">
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* 2. Interactive Status Timeline */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">Complaint Redressal Timeline</h3>
          
          {complaint.status === 'Rejected' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-red-655 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-red-800">Grievance Rejected</h4>
                <p className="text-xs text-red-700 leading-relaxed mt-1">
                  This complaint has been reviewed and rejected by the administration. Reason: "{complaint.remarks || 'Does not comply with community guidelines.'}"
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Horizontal line for desktop, vertical line for mobile */}
              <div className="absolute top-4 left-4 right-4 hidden md:block h-0.5 bg-slate-200 z-0"></div>
              
              <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  
                  return (
                    <div key={idx} className="flex md:flex-col items-center flex-row text-left md:text-center space-x-4 md:space-x-0 md:space-y-2.5 flex-1">
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
                          <span className="text-[10px] text-slate-500 font-medium italic block mt-0.5">
                            Current Stage
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

        {/* 3. Description & Citizen Uploaded Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Grievance Description</h3>
            <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/50">
              {complaint.description}
            </p>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Landmark className="h-4 w-4 text-slate-450" />
                <span className="font-semibold text-slate-700">Category:</span>
                <span>{complaint.category}</span>
              </div>
              <div className="flex items-start space-x-2">
                <Landmark className="h-4 w-4 text-slate-450 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700">Location:</span>
                  <p className="mt-0.5">{complaint.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Citizen Supporting Photograph</h3>
            {complaint.image ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm p-1.5 bg-white aspect-video md:aspect-square flex items-center justify-center">
                <img
                  src={complaint.image}
                  alt="Citizen report proof"
                  className="rounded-lg max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 bg-slate-50/50">
                <Clock className="h-8 w-8 text-slate-300" />
                <span>No supporting photograph was uploaded with this complaint.</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Officer Assignment & Resolution Proof */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Assignment Box */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Authority Details</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Landmark className="h-4 w-4 text-slate-450" />
                  <span className="font-semibold text-slate-750">Assigned Department:</span>
                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">{complaint.department}</span>
                </div>

                <div className="flex items-start space-x-2.5 text-sm pt-2 border-t border-slate-200/50">
                  <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                  {complaint.assignedOfficer ? (
                    <div>
                      <span className="font-semibold text-slate-750 block">Assigned Resolution Officer:</span>
                      <span className="text-slate-800 block text-xs font-medium mt-0.5">{complaint.assignedOfficer.fullName}</span>
                      <span className="text-slate-500 block text-xs">{complaint.assignedOfficer.department} Dept</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-slate-750 block">Assigned Resolution Officer:</span>
                      <span className="text-slate-500 italic block text-xs mt-0.5">Under administrative review. Officer will be assigned shortly.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resolution Box */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resolution Status</h3>
              {complaint.status === 'Resolved' ? (
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 text-sm font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Complaint Resolved</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Resolution Remarks:</span>
                    <p className="text-xs text-slate-650 leading-relaxed mt-1 whitespace-pre-wrap bg-white p-2.5 rounded border border-slate-200/40">
                      {complaint.remarks || 'No remarks provided.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-center items-center text-center text-slate-500 text-xs py-8">
                  <Clock className="h-7 w-7 text-slate-350 mb-2 animate-pulse" />
                  <span>Resolution details will appear here once the assigned officer inspects the issue.</span>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Proof Image */}
          {complaint.status === 'Resolved' && complaint.resolutionImage && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Officer Resolution Proof Image</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden p-1 bg-white inline-block max-w-lg shadow-sm">
                <img
                  src={complaint.resolutionImage}
                  alt="Officer resolution proof"
                  className="rounded-lg max-h-72 object-contain"
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
