import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useTimeGreeting, getUserDisplayName } from '../utils/greeting';
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
  X,
  UserCheck,
  Users,
  BarChart3,
  Building2,
  RefreshCw,
  Flame
} from 'lucide-react';
import { useToast } from '../Context/ToastContext';
import AnalyticsCard from '../Components/Analytics/AnalyticsCard';
import StatusDonutChart from '../Components/Analytics/StatusDonutChart';
import PriorityBarChart from '../Components/Analytics/PriorityBarChart';
import ComplaintTrendChart from '../Components/Analytics/ComplaintTrendChart';
import DepartmentChart from '../Components/Analytics/DepartmentChart';
import OfficerWorkloadChart from '../Components/Analytics/OfficerWorkloadChart';
import { StatusBadge, PriorityBadge } from '../Components/StatusBadge';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const greeting = useTimeGreeting();
  const displayName = getUserDisplayName(user, 'Administrator');
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

      // Fetch Complaints
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

      // Fetch Officers
      const officersRes = await axios.get('/api/admin/users?role=Department+Officer');
      if (officersRes.data.success) {
        setOfficers(officersRes.data.users);
      }

      if (isManualRefresh && toast?.success) {
        toast.success('Admin command center refreshed');
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
      if (toast?.warning) toast.warning('Please select a target department.');
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
    if (toast?.info) toast.info('Downloading grievance export CSV...');
    window.open('/api/admin/export-csv', '_blank');
  };

  // Filter officers based on selected department
  const filteredOfficers = useMemo(() => {
    return officers.filter(o => !assignDept || o.department === assignDept);
  }, [officers, assignDept]);

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending Review', value: 'Pending' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {displayName}!
          </h1>
          <h2 className="text-sm sm:text-base font-semibold text-slate-700 mt-1">
            Admin Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System-wide operational oversight, grievance routing, officer allocations, and SLA monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => initAdminData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-60 cursor-pointer"
            title="Refresh control room data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-900' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <AnalyticsCard
          title="Citizens"
          value={metrics.totalCitizens || 0}
          subtitle="Registered users"
          icon={Users}
          color="blue"
        />
        <AnalyticsCard
          title="Officers"
          value={metrics.totalOfficers || officers.length}
          subtitle="Field personnel"
          icon={UserCheck}
          color="purple"
        />
        <AnalyticsCard
          title="Departments"
          value={metrics.totalDepartments || departmentsList.length}
          subtitle="Active operational wings"
          icon={Building2}
          color="slate"
        />
        <AnalyticsCard
          title="Total Filed"
          value={metrics.totalComplaints || metrics.total || complaints.length}
          subtitle="All grievances"
          icon={ClipboardList}
          color="slate"
        />
        <AnalyticsCard
          title="Pending Triage"
          value={metrics.pendingComplaints || metrics.pending}
          subtitle="Awaiting allocation"
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
          title="Assigned"
          value={metrics.assignedComplaints || metrics.assigned}
          subtitle="Dispatched to officer"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="In Progress"
          value={metrics.inProgressComplaints || metrics.inProgress}
          subtitle="Active on ground"
          icon={AlertTriangle}
          color="blue"
        />
        <AnalyticsCard
          title="Resolved"
          value={metrics.resolvedComplaints || metrics.resolved}
          subtitle={`${metrics.resolutionPercentage}% resolution rate`}
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

      {/* Visual Analytics & Reports Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">System Telemetry &amp; Analytics</h2>
              <p className="text-[11px] text-slate-500">Aggregated real-time metrics across all municipal grievance categories.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-medium text-slate-600">Global Resolution Rate:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {metrics.resolutionPercentage}% Resolved
            </span>
          </div>
        </div>

        {/* Row 1: Status Donut & Priority Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ComplaintTrendChart
            data={metrics.monthlyStats}
            title="Monthly Grievance Inflow Trends"
            subtitle="Submission cadence across chronological months"
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
            title="Officer Workload &amp; Assignment Matrix"
            subtitle="Tracking individual officer ticket load, active tasks, and resolution performance"
          />
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 select-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, title, citizen, or location..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 focus:outline-none focus:bg-white focus:border-blue-900 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {departmentsList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
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

          {(search || statusFilter || categoryFilter || priorityFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-blue-900 hover:text-blue-950 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-3"></div>
          <span className="text-slate-600 text-xs font-medium">Retrieving master catalog...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Complaints Match Filter</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
            Try adjusting your search criteria, category, or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {complaints.map((c) => (
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
                  <span className="text-slate-400 font-medium text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString()}
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

                <div className="text-[11px] space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600">
                  <p className="truncate">
                    <span className="font-semibold text-slate-900">Location:</span> {c.location}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-900">Citizen:</span> {c.citizenId?.fullName || 'Citizen User'}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-900">Department:</span> {c.department || 'Unassigned'}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-slate-900">Assigned Officer:</span>{' '}
                    {c.assignedOfficer ? (
                      <span className="text-blue-900 font-semibold">{c.assignedOfficer.fullName}</span>
                    ) : (
                      <span className="text-amber-700 font-medium italic">Unassigned</span>
                    )}
                  </p>
                </div>

                <div>
                  <StatusBadge status={c.status} size="xs" />
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex justify-between items-center text-xs gap-2">
                <Link
                  to={`/complaint/${c._id}`}
                  className="p-1.5 text-slate-600 hover:text-blue-900 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-colors inline-flex items-center space-x-1"
                  title="View Grievance Record"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">View</span>
                </Link>

                {c.status !== 'Resolved' && c.status !== 'Rejected' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(c)}
                      className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(c)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-blue-300" />
                  <span>Assign Redressal Officer</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Ref: {selectedComplaint.complaintId}</span>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                <p><span className="font-semibold text-slate-900">Title:</span> {selectedComplaint.title}</p>
                <p><span className="font-semibold text-slate-900">Location:</span> {selectedComplaint.location}</p>
                <p><span className="font-semibold text-slate-900">Category:</span> {selectedComplaint.category}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Target Department <span className="text-rose-600">*</span>
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => {
                    setAssignDept(e.target.value);
                    setAssignOfficer('');
                  }}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {departmentsList.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Designated Officer {assignDept ? `(${assignDept})` : ''}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {filteredOfficers.length} Available
                  </span>
                </div>

                <select
                  value={assignOfficer}
                  onChange={(e) => setAssignOfficer(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
                >
                  <option value="">-- Department Pool (Unassigned to Specific Officer) --</option>
                  {filteredOfficers.map((o) => {
                    const activeCount = officerWorkload[o._id] || 0;
                    return (
                      <option key={o._id} value={o._id}>
                        {o.fullName} • ({o.department || 'General'}) — [{activeCount} active tasks]
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Priority Override
                </label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans cursor-pointer"
                >
                  <option value="Low">Low Priority (Standard SLA)</option>
                  <option value="Medium">Medium Priority (Standard SLA)</option>
                  <option value="High">High Priority (Urgent Safety Risk)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Reject Grievance</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Ref: {selectedComplaint.complaintId}</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rejection Reason &amp; Remarks <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="px-3.5 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-600 transition-all font-sans leading-relaxed"
                  placeholder="Explain why this grievance cannot be accepted (e.g. outside municipal boundary, duplicate submission, insufficient landmark info)..."
                ></textarea>
                <p className="text-[11px] text-slate-500 mt-1">
                  This explanation will be recorded in the audit trail and displayed on the citizen tracker.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
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
