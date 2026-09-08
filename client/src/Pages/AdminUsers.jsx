import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Filter, Search, Edit2, X, AlertCircle, Building, Check, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const departmentsList = [
    'Road/Pothole',
    'Garbage Collection',
    'Water Leakage',
    'Streetlight Problem',
    'Electricity Issue',
    'Drainage Problem',
    'Other'
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', {
        params: {
          search,
          role: roleFilter
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setEditDept(u.department || '');
    setModalError('');
    setModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (editRole === 'Department Officer' && !editDept) {
      setModalError('Please assign a department for the Department Officer role.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}/role`, {
        role: editRole,
        department: editRole === 'Department Officer' ? editDept : null
      });

      if (res.data.success) {
        toast.success(`Role updated for ${selectedUser.fullName}`);
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update user role.');
      toast.error('Could not update role.');
    } finally {
      setModalLoading(false);
    }
  };

  // Quick role counts
  const roleCounts = useMemo(() => {
    const counts = { total: users.length, Citizen: 0, 'Department Officer': 0, Administrator: 0 };
    users.forEach((u) => {
      if (counts[u.role] !== undefined) counts[u.role]++;
    });
    return counts;
  }, [users]);

  const rolePills = [
    { label: 'All Accounts', value: '', count: users.length },
    { label: 'Citizens', value: 'Citizen', count: roleCounts['Citizen'] },
    { label: 'Department Officers', value: 'Department Officer', count: roleCounts['Department Officer'] },
    { label: 'Administrators', value: 'Administrator', count: roleCounts['Administrator'] }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
            RBAC Directory
          </span>
          <span className="text-xs text-slate-400">| User & Officer Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Identity & Access Management
        </h1>
        <p className="text-sm text-slate-500">
          Manage system users, assign officers to municipal departments, and adjust platform security roles.
        </p>
      </div>

      {/* Role Pill Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 select-none">
        {rolePills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setRoleFilter(pill.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
              roleFilter === pill.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{pill.label}</span>
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
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Clear Search helper */}
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-600 text-sm font-medium">Fetching directory records...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-3">
          <User className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Users Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            No registered accounts found matching the current search query.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <thead className="bg-slate-50/75 select-none font-bold">
                <tr>
                  <th scope="col" className="px-6 py-4">Account</th>
                  <th scope="col" className="px-6 py-4">Phone</th>
                  <th scope="col" className="px-6 py-4">Address</th>
                  <th scope="col" className="px-6 py-4">Role Badge</th>
                  <th scope="col" className="px-6 py-4">Assigned Department</th>
                  <th scope="col" className="px-6 py-4 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700 tracking-normal capitalize font-sans">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">{u.fullName}</span>
                        <span className="text-[11px] text-slate-400 lowercase mt-0.5 select-all">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 font-medium select-all">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate normal-case text-slate-600">
                      {u.address || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        u.role === 'Administrator'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : u.role === 'Department Officer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.department ? (
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold font-sans">
                          {u.department}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="text-slate-600 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center space-x-1"
                        title="Configure Role & Department"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="text-[11px] font-semibold hidden sm:inline">Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center select-none">
              <div>
                <h3 className="font-bold text-base">Configure User Privileges</h3>
                <span className="text-xs text-slate-400">{selectedUser.fullName} ({selectedUser.email})</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-medium">{modalError}</p>
                </div>
              )}

              {/* Role dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Platform Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => {
                    setEditRole(e.target.value);
                    if (e.target.value !== 'Department Officer') {
                      setEditDept('');
                    }
                  }}
                  className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="Citizen">Citizen (Public Access)</option>
                  <option value="Department Officer">Department Officer (Resolution Desk)</option>
                  <option value="Administrator">Administrator (Control Room Access)</option>
                </select>
              </div>

              {/* Department dropdown (only active for Department Officer) */}
              {editRole === 'Department Officer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Redressal Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="px-3.5 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                    required
                  >
                    <option value="">-- Choose Municipal Department --</option>
                    {departmentsList.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    The officer will only have resolution authority over complaints under this department.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-60"
                >
                  {modalLoading ? 'Saving...' : 'Save Privileges'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
