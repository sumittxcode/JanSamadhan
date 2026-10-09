import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Eye,
  Edit,
  Search,
  Filter,
  X,
  Upload,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  AlertTriangle,
  BarChart3,
  Flame
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';

const OfficerDashboard = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    active: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    resolutionPercentage: 0,
    avgResolutionDays: 0,
    statusDistribution: [],
    priorityDistribution: []
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal State for Actioning Complaint
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionImage, setActionImage] = useState(null);
  const [actionImagePreview, setActionImagePreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const initDashboard = async () => {
    try {
      setLoading(true);
      // Fetch Metrics
      const metricRes = await axios.get('/api/officer/dashboard');
      if (metricRes.data.success) {
        setMetrics(metricRes.data.metrics);
      }

      // Fetch Assigned Tickets
      const ticketRes = await axios.get('/api/officer/complaints', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter
        }
      });
      if (ticketRes.data.success) {
        setComplaints(ticketRes.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load Officer dashboard:', err);
      if (toast?.error) toast.error('Failed to retrieve assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDashboard();
  }, [search, statusFilter, priorityFilter]);

  const handleOpenActionModal = (c) => {
    setSelectedComplaint(c);
    setActionStatus(c.status);
    setActionRemarks(c.remarks || '');
    setActionImage(null);
    setActionImagePreview(c.resolutionImage || null);
    setActionError('');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setActionError('Resolution image must be less than 5MB.');
        return;
      }
      setActionImage(file);
      setActionError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setActionImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setActionError('');

    if (actionStatus === 'Resolved' && !actionRemarks.trim()) {
      setActionError('Resolution remarks are required to close and resolve a complaint.');
      return;
    }

    setActionLoading(true);

    const formData = new FormData();
    formData.append('status', actionStatus);
    formData.append('remarks', actionRemarks.trim());
    if (actionImage) {
      formData.append('resolutionImage', actionImage);
    }

    try {
      const res = await axios.put(`/api/officer/complaints/${selectedComplaint._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        if (toast?.success) toast.success(`Complaint ${selectedComplaint.complaintId} status updated to ${actionStatus}`);
        setModalOpen(false);
        initDashboard();
      }
    } catch (err) {
      console.error('Action Submit Error:', err);
      setActionError(err.response?.data?.message || 'Failed to update task.');
      if (toast?.error) toast.error('Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Field Redressal
            </span>
            <span className="text-xs text-slate-400">| Department Resolution Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Officer Resolution Desk
          </h1>
          <p className="text-sm text-slate-500">
            View grievances assigned to your department, conduct inspections, update progress, and post completion proof.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <AnalyticsCard
          title="Total Tickets"
          value={metrics.total}
          subtitle="Department jurisdiction"
          icon={ClipboardList}
          color="slate"
        />
        <AnalyticsCard
          title="Pending Tasks"
          value={metrics.pending}
          subtitle="Awaiting resolution"
          icon={Clock}
          color="amber"
        />
        <AnalyticsCard
          title="In Progress"
          value={metrics.inProgress || metrics.active}
          subtitle="Under active investigation"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="Resolved"
          value={metrics.resolved}
          subtitle={`${metrics.resolutionPercentage}% resolution rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <AnalyticsCard
          title="High Priority"
          value={metrics.highPriority}
          subtitle="Urgent SLA tasks"
          icon={Flame}
          color="red"
        />
        <AnalyticsCard
          title="Avg Turnaround"
          value={metrics.avgResolutionDays > 0 ? `${metrics.avgResolutionDays}d` : 'N/A'}
          subtitle={metrics.avgResolutionDays > 0 ? 'Days to resolution' : 'Pending resolved data'}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Role-Specific Officer Analytics Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Officer Workload &amp; SLA Analytics</h2>
              <p className="text-xs text-slate-500">Live operational telemetry for complaints assigned to you or your department.</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Redressal Efficiency:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {metrics.resolutionPercentage}% Resolved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDonutChart
            data={metrics.statusDistribution}
            title="Task Status Distribution"
            subtitle="Breakdown of assigned tickets across progress stages"
          />
          <PriorityBarChart
            data={metrics.priorityDistribution}
            title="Assigned Priority Breakdown"
            subtitle="Urgency classification of tickets in your queue"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search tasks by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-600 text-sm font-medium">Retrieving assigned tasks...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl space-y-3">
          <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Assigned Tasks</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You currently have no pending tasks in your department queue matching these filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all flex flex-col lg:flex-row justify-between lg:items-center gap-6"
            >
              {/* Left Details */}
              <div className="space-y-3 max-w-2xl flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono tracking-wider">
                    {c.complaintId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(c.priority)}`}>
                    {c.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400">
                    Updated: {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                    <Link to={`/complaint/${c._id}`}>{c.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed line-clamp-2">{c.description}</p>
                </div>
                
                {/* Location info */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">Location:</span>
                    <span>{c.location}</span>
                  </span>
                </div>
              </div>

              {/* Citizen Information Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 min-w-[230px]">
                <span className="font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5 select-none">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Citizen Details</span>
                </span>
                <p className="truncate">
                  <span className="font-semibold text-slate-800">Name:</span> {c.citizenId?.fullName || 'Citizen User'}
                </p>
                <p className="truncate">
                  <span className="font-semibold text-slate-800">Phone:</span> {c.citizenId?.phone || 'N/A'}
                </p>
                <p className="truncate">
                  <span className="font-semibold text-slate-800">Email:</span> {c.citizenId?.email || 'N/A'}
                </p>
              </div>

              {/* Right Action Buttons */}
              <div className="flex sm:flex-row lg:flex-col items-stretch justify-center gap-2">
                <button
                  onClick={() => handleOpenActionModal(c)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Edit className="h-4 w-4" />
                  <span>Update Task</span>
                </button>
                <Link
                  to={`/complaint/${c._id}`}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Update Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-base">Update Complaint Resolution</h3>
                <span className="text-xs text-slate-400">ID: {selectedComplaint.complaintId}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleActionSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {actionError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-medium">{actionError}</p>
                </div>
              )}

              {/* Current Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <p><span className="font-semibold text-slate-800">Issue Title:</span> {selectedComplaint.title}</p>
                <p><span className="font-semibold text-slate-800">Description:</span> {selectedComplaint.description}</p>
                <p><span className="font-semibold text-slate-800">Location:</span> {selectedComplaint.location}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Updated Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress (Work Initiated)</option>
                    <option value="Resolved">Resolved (Work Completed)</option>
                  </select>
                </div>

                {/* Resolution Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Resolution Proof Photograph
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="modal-image"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="modal-image"
                      className="flex items-center space-x-2 px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 border-dashed rounded-lg text-xs cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all text-slate-600 truncate"
                    >
                      <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{actionImage ? actionImage.name : 'Attach resolution photo'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Remarks Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution / Progress Remarks {actionStatus === 'Resolved' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows="3"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder={
                    actionStatus === 'Resolved'
                      ? 'Specify the actions taken on-site to resolve this grievance...'
                      : 'Add updates or remarks regarding current status...'
                  }
                ></textarea>
              </div>

              {/* Image Preview */}
              {actionImagePreview && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Selected Photographic Proof
                  </label>
                  <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden p-1 bg-white shadow-sm">
                    <img
                      src={actionImagePreview}
                      alt="Resolution Proof"
                      className="max-h-48 max-w-full rounded object-contain"
                    />
                    {actionImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionImage(null);
                          setActionImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 text-xs shadow transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {actionLoading ? 'Saving...' : 'Save Resolution Updates'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerDashboard;
