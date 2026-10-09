import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Eye,
  ShieldAlert,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Citizen-specific Analytics from MongoDB aggregation
  const [analytics, setAnalytics] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    resolutionRate: 0,
    statusCounts: [],
    priorityCounts: []
  });

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/complaints/my');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      if (toast?.error) toast.error('Failed to retrieve your complaints');
    } flexInally: {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics/citizen');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching citizen analytics:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchAnalytics();
  }, []);

  // Client-side filtering for fast responsive UI
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.complaintId.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [complaints, statusFilter, categoryFilter, search]);

  const total = analytics.total || complaints.length;
  const pendingCount = analytics.pending || complaints.filter(c => c.status === 'Pending').length;
  const underReviewCount = analytics.underReview || complaints.filter(c => c.status === 'Under Review').length;
  const assignedCount = analytics.assigned || complaints.filter(c => c.status === 'Assigned').length;
  const inProgressCount = analytics.inProgress || complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = analytics.resolved || complaints.filter(c => c.status === 'Resolved').length;
  const rejectedCount = analytics.rejected || complaints.filter(c => c.status === 'Rejected').length;
  const resolutionRate = analytics.resolutionRate || (total > 0 ? Math.round((resolvedCount / total) * 100) : 0);

  const statusChartData = analytics.statusCounts && analytics.statusCounts.length > 0
    ? analytics.statusCounts
    : [
        { name: 'Resolved', count: resolvedCount, color: '#10b981' },
        { name: 'In Progress', count: inProgressCount, color: '#3b82f6' },
        { name: 'Assigned', count: assignedCount, color: '#6366f1' },
        { name: 'Under Review', count: underReviewCount, color: '#a855f7' },
        { name: 'Pending', count: pendingCount, color: '#f59e0b' },
        { name: 'Rejected', count: rejectedCount, color: '#ef4444' }
      ];

  const priorityChartData = analytics.priorityCounts && analytics.priorityCounts.length > 0
    ? analytics.priorityCounts
    : [
        { priority: 'High', count: complaints.filter(c => c.priority === 'High').length },
        { priority: 'Medium', count: complaints.filter(c => c.priority === 'Medium').length },
        { priority: 'Low', count: complaints.filter(c => c.priority === 'Low').length }
      ];

  const handleDelete = async (id, complaintIdStr) => {
    if (window.confirm(`Are you sure you want to delete grievance ${complaintIdStr}?`)) {
      try {
        const res = await axios.delete(`/api/complaints/${id}`);
        if (res.data.success) {
          if (toast?.info) toast.info(`Grievance ${complaintIdStr} deleted.`);
          fetchComplaints();
          fetchAnalytics();
        }
      } catch (err) {
        if (toast?.error) toast.error(err.response?.data?.message || 'Failed to delete complaint');
      }
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
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-400">| Grievance Tracking Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Citizen Grievance Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.fullName}</span>. Track the status and SLA resolution progress of your filed issues.
          </p>
        </div>

        <Link
          to="/submit-complaint"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Grievance</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
        <AnalyticsCard
          title="Total Filed"
          value={total}
          subtitle="All grievances"
          icon={ClipboardList}
          color="slate"
        />
        <AnalyticsCard
          title="Pending"
          value={pendingCount}
          subtitle="Awaiting triage"
          icon={Clock}
          color="amber"
        />
        <AnalyticsCard
          title="Under Review"
          value={underReviewCount}
          subtitle="Department review"
          icon={Clock}
          color="purple"
        />
        <AnalyticsCard
          title="Active Work"
          value={assignedCount + inProgressCount}
          subtitle={`${inProgressCount} in progress`}
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="Resolved"
          value={resolvedCount}
          subtitle={`${resolutionRate}% resolution`}
          icon={CheckCircle2}
          color="emerald"
        />
        <AnalyticsCard
          title="Rejected"
          value={rejectedCount}
          subtitle="Disallowed/closed"
          icon={ShieldAlert}
          color="red"
        />
      </div>

      {/* Role-Specific Analytics Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Complaint Statistics</h2>
              <p className="text-xs text-slate-500">Visual distribution of your submitted grievances and SLA progress.</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Personal Resolution Rate:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {resolutionRate}% Resolved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDonutChart
            data={statusChartData}
            title="My Complaint Status Distribution"
            subtitle="Breakdown across all progress stages"
          />
          <PriorityBarChart
            data={priorityChartData}
            title="Priority Distribution"
            subtitle="Assigned priority levels of your grievances"
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
            placeholder="Search by ID, subject, or location..."
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          >
            <option value="">All Categories</option>
            <option value="Road/Pothole">Road/Pothole</option>
            <option value="Garbage Collection">Garbage Collection</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Streetlight Problem">Streetlight Problem</option>
            <option value="Electricity Issue">Electricity Issue</option>
            <option value="Drainage Problem">Drainage Problem</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-600 text-sm font-medium">Retrieving your grievances...</span>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl space-y-4">
          <ClipboardList className="h-14 w-14 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Complaints Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {complaints.length === 0
              ? "You haven't filed any grievances yet. Report civic issues directly to municipal departments."
              : 'No complaints match the selected search or filter criteria.'}
          </p>
          <Link
            to="/submit-complaint"
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>File a Complaint now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header Banner */}
              <div className="p-5 border-b border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded tracking-wider">
                    {c.complaintId}
                  </span>
                  <span className="font-medium text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                  <Link to={`/complaint/${c._id}`}>{c.title}</Link>
                </h3>
                <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                  {c.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 truncate">
                  <span className="font-semibold text-slate-700">Location:</span> {c.location}
                </div>

                {/* Badges */}
                <div className="flex items-center space-x-2 pt-1">
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(c.priority)}`}>
                    {c.priority} Priority
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                <Link
                  to={`/complaint/${c._id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Tracker</span>
                </Link>

                {c.status === 'Pending' ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-complaint/${c._id}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      title="Edit Complaint"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(c._id, c.complaintId)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      title="Delete Complaint"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium italic">
                    Assigned / In Progress
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
