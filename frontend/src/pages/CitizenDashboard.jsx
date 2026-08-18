import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, Plus, Search, Filter, Trash2, Edit3, Eye } from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/complaints/my', {
        params: {
          search,
          status: statusFilter,
          category: categoryFilter
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, statusFilter, categoryFilter]);

  // Dynamic Metrics calculation
  const total = complaints.length;
  const pending = complaints.filter(c => ['Pending', 'Under Review'].includes(c.status)).length;
  const active = complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const handleDelete = async (id, complaintIdStr) => {
    if (window.confirm(`Are you sure you want to delete complaint ${complaintIdStr}?`)) {
      try {
        const res = await axios.delete(`/api/complaints/${id}`);
        if (res.data.success) {
          alert('Complaint deleted successfully.');
          fetchComplaints();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete complaint');
      }
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-250';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Under Review': return 'bg-purple-50 text-purple-700 border-purple-250';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Citizen Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.fullName}. Review your reported issues and monitor resolutions.</p>
        </div>
        <Link
          to="/submit-complaint"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Grievance</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">{total}</span>
            <span className="text-xs text-slate-550 font-medium uppercase tracking-wider">Total Complaints</span>
          </div>
        </div>

        {/* Metric Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">{pending}</span>
            <span className="text-xs text-slate-550 font-medium uppercase tracking-wider">Pending/Review</span>
          </div>
        </div>

        {/* Metric Active */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">{active}</span>
            <span className="text-xs text-slate-550 font-medium uppercase tracking-wider">Active Tasks</span>
          </div>
        </div>

        {/* Metric Resolved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 block">{resolved}</span>
            <span className="text-xs text-slate-550 font-medium uppercase tracking-wider">Resolved Grievances</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, title, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-350 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-550 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
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
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
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
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-500 text-sm">Retrieving your grievances...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200/60 rounded-xl space-y-4">
          <ClipboardList className="h-14 w-14 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Complaints Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            It looks like you don't have any complaints registered matching the current filters.
          </p>
          <Link
            to="/submit-complaint"
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>File a Complaint now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header Banner */}
              <div className="p-5 border-b border-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">
                    {c.complaintId}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {c.title}
                </h3>
                <span className="inline-block text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  {c.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 space-y-4">
                <p className="text-sm text-slate-550 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Badges */}
                <div className="flex items-center space-x-3 pt-2">
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(c.priority)}`}>
                    {c.priority} Priority
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-4 bg-slate-50/75 border-t border-slate-100 flex justify-between items-center">
                <Link
                  to={`/complaint/${c._id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Tracker</span>
                </Link>

                {c.status === 'Pending' ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-complaint/${c._id}`}
                      className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      title="Edit Complaint"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(c._id, c.complaintId)}
                      className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      title="Delete Complaint"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    Locked (In progress)
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
