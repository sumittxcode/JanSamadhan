import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Eye,
  Download,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  Users,
  Layers,
  ArrowUpRight,
  BarChart3,
  Building2,
  RefreshCw,
  Flame,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';
import ComplaintTrendChart from '../Components/Analytics/ComplaintTrendChart';
import DepartmentChart from '../Components/Analytics/DepartmentChart';
import OfficerWorkloadChart from '../Components/Analytics/OfficerWorkloadChart';

const AdminDashboard = () => {
  const toast = useToast();
  const [metrics, setMetrics] = useState({
    total: 0,
    totalComplaints: 0,
    totalCitizens: 0,
    totalOfficers: 0,
    totalDepartments: 0,
    pending: 0,
    pendingComplaints: 0,
    underReviewComplaints: 0,
    assigned: 0,
    assignedComplaints: 0,
    inProgress: 0,
    inProgressComplaints: 0,
    resolved: 0,
    resolvedComplaints: 0,
    rejected: 0,
    rejectedComplaints: 0,
    highPriorityComplaints: 0,
    mediumPriorityComplaints: 0,
    lowPriorityComplaints: 0,
    resolutionPercentage: 0,
    resolvedVsUnresolved: { resolved: 0, unresolved: 0 },
    statusDistribution: [],
    priorityDistribution: [],
    categoryStats: [],
    monthlyStats: [],
    departmentStats: [],
    officerWorkload: []
  });
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals for Assign & Reject
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignPriority, setAssignPriority] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const departmentsList = [
    'Road/Pothole',
    'Garbage Collection',
    'Water Leakage',
    'Streetlight Problem',
    'Electricity Issue',
    'Drainage Problem',
    'Other'
  ];

  const initAdminData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch Dashboard Metrics
      const metricRes = await axios.get('/api/admin/dashboard');
      if (metricRes.data.success) {
        setMetrics(metricRes.data.metrics);
      }

      // Fetch All Complaints
      const complaintsRes = await axios.get('/api/admin/complaints', {
        params: {
          search,
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter
        }
      });
      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.complaints);
      }

      // Fetch all officers for assignment
      const officersRes = await axios.get('/api/admin/users?role=Department+Officer');
      if (officersRes.data.success) {
        setOfficers(officersRes.data.users);
      }

      if (isManualRefresh) {
        if (toast?.success) toast.success('Admin dashboard refreshed');
      }
    } catch (err) {
      console.error('Failed to load Admin Dashboard data:', err);
      if (toast?.error) toast.error('Failed to retrieve telemetry data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initAdminData();
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  // Compute officer active complaint workloads for smart assignment
  const officerWorkload = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      if (c.assignedOfficer && ['Assigned', 'In Progress'].includes(c.status)) {
        const oId = typeof c.assignedOfficer === 'object' ? c.assignedOfficer._id : c.assignedOfficer;
        counts[oId] = (counts[oId] || 0) + 1;
      }
    });
    return counts;
  }, [complaints]);

  // Open Assign Modal
  const handleOpenAssignModal = (c) => {
    setSelectedComplaint(c);
    const targetDept = c.department && c.department !== 'Unassigned' ? c.department : (c.category || '');
    setAssignDept(targetDept);
    setAssignOfficer(c.assignedOfficer?._id || '');
    setAssignPriority(c.priority || 'Medium');
    setAssignModalOpen(true);
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignDept) {
      if (toast?.warning) toast.warning('Please select a responsible department.');
      return;
    }

    setAssignLoading(true);
    try {
      const res = await axios.put(`/api/admin/complaints/${selectedComplaint._id}/assign`, {
        department: assignDept,
        assignedOfficer: assignOfficer || null,
        priority: assignPriority
      });
      if (res.data.success) {
        if (toast?.success) toast.success(`Complaint ${selectedComplaint.complaintId} assigned successfully!`);
        setAssignModalOpen(false);
        initAdminData();
      }
    } catch (err) {
      if (toast?.error) toast.error(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (c) => {
    setSelectedComplaint(c);
    setRejectRemarks('');
    setRejectModalOpen(true);
  };

  // Submit Rejection
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      if (toast?.warning) toast.warning('Please provide a reason for rejecting this grievance.');
      return;
    }
    setRejectLoading(true);
    try {
      const res = await axios.put(`/api/admin/complaints/${selectedComplaint._id}/reject`, {
        remarks: rejectRemarks
      });
      if (res.data.success) {
        if (toast?.info) toast.info(`Complaint ${selectedComplaint.complaintId} marked as rejected.`);
        setRejectModalOpen(false);
        initAdminData();
      }
    } catch (err) {
      if (toast?.error) toast.error(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setRejectLoading(false);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (toast?.info) toast.info('Downloading grievance analytics export...');
    window.open('/api/admin/export-csv', '_blank');
  };

  // Filter officers based on selected department
  const filteredOfficers = useMemo(() => {
    return officers.filter(o => !assignDept || o.department === assignDept);
  }, [officers, assignDept]);

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
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

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending Review', value: 'Pending' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Central Administration
            </span>
            <span className="text-xs text-slate-400">| System Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Grievance Redressal Control Room
          </h1>
          <p className="text-sm text-slate-500">
            Monitor civic telemetry, route grievances to department officers, and manage resolution SLAs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => initAdminData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-60"
            title="Refresh master data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center space-x-2 transition-all hover:shadow"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* High-Level Control Room Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <AnalyticsCard
          title="Citizens Registered"
          value={metrics.totalCitizens || 0}
          subtitle="Active public accounts"
          icon={Users}
          color="blue"
        />
        <AnalyticsCard
          title="Department Officers"
          value={metrics.totalOfficers || officers.length}
          subtitle="Redressal officers"
          icon={UserCheck}
          color="purple"
        />
        <AnalyticsCard
          title="Active Departments"
          value={metrics.totalDepartments || departmentsList.length}
          subtitle="Civic operational wings"
          icon={Building2}
          color="slate"
        />
        <AnalyticsCard
          title="Total Complaints"
          value={metrics.totalComplaints || metrics.total || complaints.length}
          subtitle="Master catalogue"
          icon={ClipboardList}
          color="slate"
        />
        <AnalyticsCard
          title="Pending Complaints"
          value={metrics.pendingComplaints || metrics.pending}
          subtitle="Awaiting triage"
          icon={Clock}
          color="amber"
        />
        <AnalyticsCard
          title="Under Review"
          value={metrics.underReviewComplaints || 0}
          subtitle="Department review"
          icon={Clock}
          color="purple"
        />
        <AnalyticsCard
          title="Assigned to Officer"
          value={metrics.assignedComplaints || metrics.assigned}
          subtitle="Officer allocated"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="In Progress"
          value={metrics.inProgressComplaints || metrics.inProgress}
          subtitle="Active on-ground work"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="Resolved Cases"
          value={metrics.resolvedComplaints || metrics.resolved}
          subtitle={`${metrics.resolutionPercentage}% global SLA`}
          icon={CheckCircle2}
          color="emerald"
        />
        <AnalyticsCard
          title="High Priority"
          value={metrics.highPriorityComplaints || 0}
          subtitle="Urgent public hazards"
          icon={Flame}
          color="red"
        />
      </div>

      {/* Admin Visual Analytics & Reports Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">System-Wide Analytics &amp; Reports</h2>
              <p className="text-xs text-slate-500">Real-time MongoDB aggregated data visualizations and telemetry across all municipal domains.</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">National Redressal Rate:</span>
            <span className="px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {metrics.resolutionPercentage}% Resolved
            </span>
          </div>
        </div>

        {/* Row 1: Status Distribution & Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDonutChart
            data={metrics.statusDistribution}
            title="System-Wide Grievance Status"
            subtitle="Full distribution of registered civic issues across lifecycle stages"
          />
          <PriorityBarChart
            data={metrics.priorityDistribution}
            title="Complaint Priority Distribution"
            subtitle="Severity and urgency rating assigned across all grievances"
          />
        </div>

        {/* Row 2: Inflow Trend & Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplaintTrendChart
            data={metrics.monthlyStats}
            title="Monthly Grievance Inflow Trends"
            subtitle="Complaint submission cadence over chronological months"
          />
          <DepartmentChart
            data={metrics.departmentStats}
            title="Complaints by Department &amp; SLA Performance"
            subtitle="Total workload versus resolved grievances by department"
          />
        </div>

        {/* Row 3: Officer Workload */}
        <div>
          <OfficerWorkloadChart
            data={metrics.officerWorkload}
            title="Department Officer Assignment &amp; Workload Distribution"
            subtitle="Tracking individual officer ticket load, active tasks, and resolution performance"
          />
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 select-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            placeholder="Search grievances by ID, title, citizen, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          >
            <option value="">All Categories</option>
            {departmentsList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {(search || statusFilter || categoryFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Complaints */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-600 text-sm font-medium">Retrieving grievance master catalog...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Complaints Match Filter</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            Try adjusting your search criteria, category or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded tracking-wider">
                    {c.complaintId}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                  <Link to={`/complaint/${c._id}`}>{c.title}</Link>
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${getPriorityBadge(c.priority)}`}>
                    {c.priority} Priority
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                
                {/* Meta details */}
                <div className="text-xs space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 text-slate-600">
                  <p className="truncate">
                    <span className="font-semibold text-slate-800">Location:</span> {c.location}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-800">Citizen:</span> {c.citizenId?.fullName || 'Anonymous'}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-800">Department:</span>{' '}
                    <span className="font-medium text-slate-900">{c.department || 'Unassigned'}</span>
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-800">Assigned Officer:</span>{' '}
                    {c.assignedOfficer ? (
                      <span className="text-blue-700 font-semibold">{c.assignedOfficer.fullName}</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Unassigned</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/complaint/${c._id}`}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    title="View Grievance Tracker"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  {c.status !== 'Resolved' && c.status !== 'Rejected' && (
                    <>
                      <button
                        onClick={() => handleOpenAssignModal(c)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                      >
                        <span>Assign</span>
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(c)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specific Officer Assignment Modal */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                  <span>Assign Resolution Officer</span>
                </h3>
                <span className="text-xs text-slate-400">Grievance Ref: {selectedComplaint.complaintId}</span>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
              {/* Complaint Summary Context */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                <p><span className="font-semibold text-slate-700">Complaint:</span> {selectedComplaint.title}</p>
                <p><span className="font-semibold text-slate-700">Location:</span> {selectedComplaint.location}</p>
                <p><span className="font-semibold text-slate-700">Reported Category:</span> {selectedComplaint.category}</p>
                <p><span className="font-semibold text-slate-700">Citizen:</span> {selectedComplaint.citizenId?.fullName} ({selectedComplaint.citizenId?.email || 'N/A'})</p>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Target Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => {
                    setAssignDept(e.target.value);
                    setAssignOfficer('');
                  }}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {departmentsList.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Specific Officer Selection with Workload Indication */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    2. Designated Officer {assignDept ? `(${assignDept})` : ''}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {filteredOfficers.length} Available
                  </span>
                </div>

                <select
                  value={assignOfficer}
                  onChange={(e) => setAssignOfficer(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="">-- Auto-route to Department Pool (Unassigned Officer) --</option>
                  {filteredOfficers.map((o) => {
                    const activeCount = officerWorkload[o._id] || 0;
                    return (
                      <option key={o._id} value={o._id}>
                        {o.fullName} • {o.email} ({o.department || 'General'}) — [{activeCount} active tasks]
                      </option>
                    );
                  })}
                </select>
                {assignDept && filteredOfficers.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No dedicated officer registered in '{assignDept}'. You can assign department directly or select a general officer.
                  </p>
                )}
              </div>

              {/* Priority Override */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Grievance Priority Level
                </label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="Low">Low Priority (Standard SLA)</option>
                  <option value="Medium">Medium Priority (Expedited)</option>
                  <option value="High">High Priority (Urgent Public Safety)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {assignLoading ? 'Dispatching...' : 'Dispatch Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  <span>Reject Grievance</span>
                </h3>
                <span className="text-xs text-slate-400">Ref: {selectedComplaint.complaintId}</span>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rejection Reason & Remarks <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 transition-all font-sans"
                  placeholder="Explain why this grievance is rejected (e.g. duplicate submission, non-jurisdictional, false report)..."
                ></textarea>
                <p className="text-[11px] text-slate-500 mt-1">
                  This note will be recorded in the official audit trail and citizen tracker.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60"
                >
                  {rejectLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
