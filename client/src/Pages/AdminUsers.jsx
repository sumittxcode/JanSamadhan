import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Filter, Search, Edit2, X, AlertCircle } from 'lucide-react';

const AdminUsers = () => {
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
      setModalError('Please assign a department for Department Officer role.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${selectedUser._id}/role`, {
        role: editRole,
        department: editRole === 'Department Officer' ? editDept : null
      });

      if (res.data.success) {
        alert('User role updated successfully.');
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">User Management</h1>
        <p className="text-sm text-slate-500 font-sans">Manage all registered accounts, change user roles, and assign departments.</p>
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
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-350 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-550 uppercase tracking-wider select-none">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
          >
            <option value="">All Roles</option>
            <option value="Citizen">Citizen</option>
            <option value="Department Officer">Department Officer</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-550 text-sm font-medium font-sans">Fetching directory lists...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-xl space-y-3">
          <User className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-sans">No Users Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto font-sans">
            No registered accounts found matching the current search parameters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <thead className="bg-slate-50/75 select-none font-bold">
                <tr>
                  <th scope="col" className="px-6 py-4">Name & Email</th>
                  <th scope="col" className="px-6 py-4">Contact</th>
                  <th scope="col" className="px-6 py-4">Residential Address</th>
                  <th scope="col" className="px-6 py-4">Role Badge</th>
                  <th scope="col" className="px-6 py-4">Department</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700 tracking-normal capitalize font-sans">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">{u.fullName}</span>
                        <span className="text-[10px] text-slate-400 lowercase mt-0.5 select-all">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 font-semibold select-all">
                      {u.phone}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate normal-case">
                      {u.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        u.role === 'Administrator' ? 'bg-red-50 text-red-700 border border-red-100' :
                        u.role === 'Department Officer' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-100 text-slate-650'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.department ? (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold font-sans">
                          {u.department}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="text-slate-500 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                        title="Edit User Role"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
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
                <h3 className="font-bold text-base">Modify User Role</h3>
                <span className="text-xs text-slate-400">{selectedUser.fullName}</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {modalError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-750 font-medium">{modalError}</p>
                </div>
              )}

              {/* Role dropdown */}
              <div>
                <label htmlFor="modal-role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designated Role
                </label>
                <select
                  id="modal-role"
                  value={editRole}
                  onChange={(e) => {
                    setEditRole(e.target.value);
                    if (e.target.value !== 'Department Officer') {
                      setEditDept('');
                    }
                  }}
                  className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Department Officer">Department Officer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              {/* Department dropdown (conditional) */}
              {editRole === 'Department Officer' && (
                <div>
                  <label htmlFor="modal-dept" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Redressal Department
                  </label>
                  <select
                    id="modal-dept"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="px-4 py-2.5 w-full bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-sans"
                  >
                    <option value="">-- Choose Department --</option>
                    {departmentsList.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
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
                  className="px-5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {modalLoading ? 'Saving...' : 'Save Configuration'}
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
