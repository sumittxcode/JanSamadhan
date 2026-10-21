import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
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
  Flame,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';
import { StatusBadge, PriorityBadge } from '../Components/StatusBadge';

const OfficerDashboard = () => {
  const { user } = useContext(AuthContext);
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
  const [refreshing, setRefreshing] = useState(false);

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

  const initDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

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

      if (isManual && toast?.success) {
        toast.success('Officer desk updated.');
      }
    } catch (err) {
      console.error('Failed to load Officer dashboard:', err);
      if (toast?.error) toast.error('Failed to retrieve assigned tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      setActionError('Resolution remarks are mandatory to mark this grievance as Resolved.');
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
        if (toast?.success) toast.success(`Task ${selectedComplaint.complaintId} updated to ${actionStatus}`);
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

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Officer Resolution Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Department:{' '}
            <span className="font-bold text-slate-900">{user?.department || 'Municipal Services'}</span>
            {' • '}Inspect reported civic issues, perform field remediation, and upload resolution proof.
          </p>
        </div>

        <button
          type="button"
          onClick={() => initDashboard(true)}
          disabled={refreshing}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          title="Refresh assigned tickets"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-900' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <AnalyticsCard
          title="Total Tickets"
          value={metrics.total}
          subtitle="Assigned queue"
          icon={ClipboardList}
          color="slate"
        />
        <AnalyticsCard
          title="Pending Tasks"
          value={metrics.pending}
          subtitle="Awaiting triage"
          icon={Clock}
          color="amber"
        />
        <AnalyticsCard
          title="In Progress"
          value={metrics.inProgress || metrics.active}
          subtitle="Active on ground"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="Resolved"
          value={metrics.resolved}
          subtitle={`${metrics.resolutionPercentage}% resolution`}
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
          title="Turnaround"
          value={metrics.avgResolutionDays > 0 ? `${metrics.avgResolutionDays}d` : 'N/A'}
          subtitle={metrics.avgResolutionDays > 0 ? 'Avg days to resolve' : 'Pending data'}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Officer Analytics Charts */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Workload &amp; Performance Telemetry</h2>
              <p className="text-[11px] text-slate-500">Live analytics for grievances assigned to your department queue.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-medium text-slate-600">Redressal Efficiency:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {metrics.resolutionPercentage}% Resolved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <StatusDonutChart
            data={metrics.statusDistribution}
            title="Task Status Distribution"
            subtitle="Breakdown of assigned tickets across lifecycle stages"
          />
          <PriorityBarChart
            data={metrics.priorityDistribution}
            title="Assigned Priority Breakdown"
            subtitle="Urgency rating of tickets in your queue"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search tasks by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-900 transition-all cursor-pointer"
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
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-900 transition-all cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {(search || statusFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-blue-900 hover:text-blue-950 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-3"></div>
          <span className="text-slate-600 text-xs font-medium">Retrieving assigned tasks...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Assigned Tasks</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
            There are currently no tasks in your queue matching the active filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-colors flex flex-col lg:flex-row justify-between lg:items-center gap-5"
            >
              {/* Task Overview */}
              <div className="space-y-2.5 max-w-2xl flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 tracking-wide">
                    {c.complaintId}
                  </span>
                  <StatusBadge status={c.status} size="xs" />
                  <PriorityBadge priority={c.priority} size="xs" />
                  <span className="text-[11px] text-slate-400">
                    Updated: {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-blue-900 transition-colors">
                    <Link to={`/complaint/${c._id}`}>{c.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.location}</span>
                </div>
              </div>

              {/* Citizen Information */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1 sm:min-w-[220px]">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                  Citizen Contact
                </span>
                <p className="truncate font-medium text-slate-900">{c.citizenId?.fullName || 'Citizen User'}</p>
                <p className="truncate text-slate-600">{c.citizenId?.phone || 'No phone recorded'}</p>
                <p className="truncate text-slate-500 text-[11px]">{c.citizenId?.email || 'N/A'}</p>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-row lg:flex-col items-stretch justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenActionModal(c)}
                  className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Update Task</span>
                </button>
                <Link
                  to={`/complaint/${c._id}`}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Update Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-sm">Update Task Resolution</h3>
                <span className="text-[11px] text-slate-400 font-mono">ID: {selectedComplaint.complaintId}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleActionSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {actionError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start space-x-2 text-xs text-rose-800">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Validation Notice</span>
                    <span>{actionError}</span>
                  </div>
                </div>
              )}

              {/* Context Summary */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 text-xs text-slate-700">
                <p><span className="font-semibold text-slate-900">Title:</span> {selectedComplaint.title}</p>
                <p><span className="font-semibold text-slate-900">Location:</span> {selectedComplaint.location}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Updated Progress Status <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress (Field Remediation)</option>
                    <option value="Resolved">Resolved (Work Completed)</option>
                  </select>
                </div>

                {/* Proof Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Completion Proof Photograph
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
                      className="flex items-center space-x-2 px-3 py-2 w-full bg-slate-50 border border-slate-300 border-dashed rounded-lg text-xs cursor-pointer hover:bg-slate-100 transition-colors text-slate-600 truncate"
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
                  Resolution / Progress Remarks {actionStatus === 'Resolved' && <span className="text-rose-600">*</span>}
                </label>
                <textarea
                  rows="3"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans leading-relaxed"
                  placeholder={
                    actionStatus === 'Resolved'
                      ? 'Mandatory: Detail the corrective actions and remediation steps completed on-site...'
                      : 'Provide updates regarding field inspection or required equipment...'
                  }
                ></textarea>
              </div>

              {/* Resolution Image Preview */}
              {actionImagePreview && (
                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Resolution Proof Preview
                  </span>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 inline-block relative">
                    <img
                      src={actionImagePreview}
                      alt="Resolution Proof"
                      className="h-24 w-auto rounded object-contain"
                    />
                    {actionImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionImage(null);
                          setActionImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 text-xs shadow-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {actionLoading ? 'Saving Changes...' : 'Save Resolution Updates'}
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
