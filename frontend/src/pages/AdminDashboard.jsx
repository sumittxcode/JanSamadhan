import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Eye, UserPlus, Download, Search, Filter, Check, X, ShieldClose } from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    total: 0, pending: 0, assigned: 0, inProgress: 0, resolved: 0, rejected: 0,
    resolutionPercentage: 0, categoryStats: [], departmentStats: []
  });
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const initAdminData = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error('Failed to load Admin Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAdminData();
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  // Open Assign Modal
  const handleOpenAssignModal = (c) => {
    setSelectedComplaint(c);
    setAssignDept(c.department === 'Unassigned' ? '' : c.department);
    setAssignOfficer(c.assignedOfficer?._id || '');
    setAssignPriority(c.priority);
    setAssignModalOpen(true);
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      const res = await axios.put(`/api/admin/complaints/${selectedComplaint._id}/assign`, {
        department: assignDept,
        assignedOfficer: assignOfficer || null,
        priority: assignPriority
      });
      if (res.data.success) {
        alert('Complaint assigned successfully.');
        setAssignModalOpen(false);
        initAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed.');
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
    if (!rejectRemarks) {
      alert('Please specify rejection remarks.');
      return;
    }
    setRejectLoading(true);
    try {
      const res = await axios.put(`/api/admin/complaints/${selectedComplaint._id}/reject`, {
        remarks: rejectRemarks
      });
      if (res.data.success) {
        alert('Complaint rejected.');
        setRejectModalOpen(false);
        initAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setRejectLoading(false);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    // Downloads CSV directly using proxy endpoint
    window.open('/api/admin/export-csv', '_blank');
  };

  // Filter officers based on selected department
  const filteredOfficers = officers.filter(o => !assignDept || o.department === assignDept);

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-650 border-slate-205';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Under Review': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title / Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Control Room</h1>
          <p className="text-sm text-slate-500">Monitor portal metrics, assign grievances, and configure system workflows.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Complaint Data</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
            <ClipboardList className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block leading-tight">{metrics.total}</span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block leading-tight">{metrics.pending}</span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Unassigned</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <AlertTriangle className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block leading-tight">{metrics.inProgress + metrics.assigned}</span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Active</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block leading-tight">{metrics.resolved}</span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Resolved</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-red-50 text-red-655 rounded-lg">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block leading-tight">{metrics.rejected}</span>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Rejected</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2">Complaints by Category</h3>
          <div className="space-y-3.5 max-h-60 overflow-y-auto">
            {metrics.categoryStats.length === 0 ? (
              <span className="text-xs text-slate-400 block text-center py-8">No categories seeded.</span>
            ) : (
              metrics.categoryStats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{stat.name}</span>
                  <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">{stat.value} complaints</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department SLA & Performance Metrics */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden p-5 lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-2 flex justify-between">
            <span>Department SLA Performance</span>
            <span className="text-blue-600 font-bold font-sans">Global Resolution: {metrics.resolutionPercentage}%</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {metrics.departmentStats.length === 0 ? (
              <span className="text-xs text-slate-400 block text-center py-8 sm:col-span-2">No department telemetry.</span>
            ) : (
              metrics.departmentStats.map((dept, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block truncate max-w-[150px]">{dept.department || 'Unassigned'}</span>
                    <span className="text-slate-400 block text-[10px] mt-0.5">{dept.resolved}/{dept.total} resolved</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dept.rate >= 75 ? 'bg-emerald-50 text-emerald-700' :
                    dept.rate >= 40 ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-650'
                  }`}>
                    {dept.rate}% resolution
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search all grievances by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Categories</option>
            {departmentsList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Grid of Complaints */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-550 text-sm font-medium">Retrieving master catalog...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-xl space-y-3">
          <ClipboardList className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Complaints Registered</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            No civic grievances registered under the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-slate-400 tracking-wider">{c.complaintId}</span>
                  <span className="text-slate-455">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${getPriorityColor(c.priority)}`}>
                    {c.priority} Priority
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>
                
                {/* Meta details */}
                <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200/40 text-slate-650">
                  <p><span className="font-semibold text-slate-800">Location:</span> {c.location}</p>
                  <p><span className="font-semibold text-slate-800">Citizen:</span> {c.citizenId?.fullName}</p>
                  <p><span className="font-semibold text-slate-800">Dept:</span> {c.department}</p>
                  <p><span className="font-semibold text-slate-800">Officer:</span> {c.assignedOfficer ? c.assignedOfficer.fullName : 'Unassigned'}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-4 bg-slate-50/75 border-t border-slate-100 flex justify-between items-center flex-wrap gap-2.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/complaint/${c._id}`}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    title="View Tracker"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </Link>

                  {c.status !== 'Resolved' && c.status !== 'Rejected' && (
                    <>
                      <button
                        onClick={() => handleOpenAssignModal(c)}
                        className="bg-blue-650 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition-colors"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(c)}
                        className="bg-red-50 hover:bg-red-100 text-red-655 text-xs font-semibold px-2.5 py-1.5 rounded border border-red-200 transition-colors"
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

      {/* Assignment Modal */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-base">Assign Resolution Path</h3>
                <span className="text-xs text-slate-400">ID: {selectedComplaint.complaintId}</span>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Department
                </label>
                <select
                  value={assignDept}
                  onChange={(e) => {
                    setAssignDept(e.target.value);
                    setAssignOfficer(''); // Reset officer when dept changes
                  }}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="">-- Choose Department --</option>
                  {departmentsList.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Officer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Officer {assignDept ? `(${assignDept})` : ''}
                </label>
                <select
                  value={assignOfficer}
                  onChange={(e) => setAssignOfficer(e.target.value)}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="">-- Choose Officer --</option>
                  {filteredOfficers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.fullName} ({o.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grievance Priority
                </label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value)}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
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
                  className="px-5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {assignLoading ? 'Saving...' : 'Confirm Assignment'}
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
                <h3 className="font-bold text-base">Reject Grievance</h3>
                <span className="text-xs text-slate-400">ID: {selectedComplaint.complaintId}</span>
              </div>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rejection Remarks / Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  placeholder="Specify why this civic complaint is being rejected."
                ></textarea>
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
                  className="px-5 py-2 bg-red-600 hover:bg-red-750 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
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
