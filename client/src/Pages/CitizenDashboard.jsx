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
  MapPin,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';
import { StatusBadge, PriorityBadge } from '../Components/StatusBadge';
import { useTimeGreeting, getUserDisplayName } from '../utils/greeting';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const fetchComplaints = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get('/api/complaints/my');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      if (toast?.error) toast.error('Failed to retrieve your complaints');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    fetchComplaints(true);
    fetchAnalytics();
  };

  // Client-side filtering for fast responsive UI
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(q));
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

  const greeting = useTimeGreeting();
  const displayName = getUserDisplayName(user, 'Citizen');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {displayName}!
          </h1>
          <h2 className="text-sm sm:text-base font-semibold text-slate-700 mt-1">
            My Complaints
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is the latest overview of your civic complaints.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-60 cursor-pointer"
            title="Refresh complaints"
            aria-label="Refresh complaints"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-900' : ''}`} />
          </button>

          <Link
            to="/submit-complaint"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>File a Complaint</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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

      {/* Visual Analytics Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complaint Analytics</h2>
              <p className="text-[11px] text-slate-500">Distribution across lifecycle stages and urgency levels.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-medium text-slate-600">Personal Resolution Rate:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {resolutionRate}% Resolved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, title, or location..."
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
            <option value="Pending">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-900 transition-all cursor-pointer"
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

          {(search || statusFilter || categoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
              }}
              className="text-xs text-blue-900 hover:text-blue-950 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Complaints List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-3"></div>
          <span className="text-slate-600 text-xs font-medium">Retrieving your grievances...</span>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Complaints Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
            {complaints.length === 0
              ? "You haven't filed any grievances yet. Report local civic issues directly to municipal departments."
              : 'No complaints match the selected filter criteria. Try resetting your search or filters.'}
          </p>
          {complaints.length === 0 && (
            <Link
              to="/submit-complaint"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>File a Complaint</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden hover:border-slate-300 transition-colors"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 tracking-wide text-[11px]">
                    {c.complaintId}
                  </span>
                  <span className="text-slate-400 font-medium text-[11px] flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-900 transition-colors">
                  <Link to={`/complaint/${c._id}`}>{c.title}</Link>
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {c.category}
                  </span>
                  <PriorityBadge priority={c.priority} size="xs" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 space-y-3">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="truncate">{c.location}</span>
                </div>

                <div>
                  <StatusBadge status={c.status} size="xs" />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex justify-between items-center text-xs">
                <Link
                  to={`/complaint/${c._id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-blue-900 hover:text-blue-950 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Tracker</span>
                </Link>

                {c.status === 'Pending' ? (
                  <div className="flex items-center space-x-1.5">
                    <Link
                      to={`/edit-complaint/${c._id}`}
                      className="p-1.5 text-slate-600 hover:text-blue-900 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      title="Edit Complaint"
                      aria-label="Edit Complaint"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(c._id, c.complaintId)}
                      className="p-1.5 text-slate-600 hover:text-rose-700 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                      title="Delete Complaint"
                      aria-label="Delete Complaint"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    Assigned to Officer
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
