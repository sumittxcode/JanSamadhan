import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Clock, Activity, User, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get('/api/admin/activity-logs');
      if (res.data.success) {
        setLogs(res.data.logs);
        if (isManual && toast?.success) toast.success('Activity logs updated.');
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      toast.error('Failed to load system activity logs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (act) => {
    if (act.includes('CREATED')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (act.includes('DELETED') || act.includes('REJECTED')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (act.includes('ASSIGNED')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (act.includes('OFFICER') || act.includes('STATUS')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (act.includes('ROLE')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const actionTypes = [
    { label: 'All Actions', value: '' },
    { label: 'Created', value: 'CREATED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Officer Updates', value: 'OFFICER' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Role Changes', value: 'ROLE' }
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchAction = !actionFilter || l.action.includes(actionFilter);
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (l.details && l.details.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.performedBy?.fullName && l.performedBy.fullName.toLowerCase().includes(q));
      return matchAction && matchSearch;
    });
  }, [logs, actionFilter, search]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Immutable system logs capturing complaint filing, departmental assignments, status transitions, and administrative operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-60 cursor-pointer"
          title="Refresh audit logs"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-900' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Action Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 select-none">
        {actionTypes.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActionFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              actionFilter === tab.value
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search audit trail by keyword, ID, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-900 transition-all font-sans"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredLogs.length} of {logs.length} logged events
        </div>
      </div>

      {/* Logs Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-3"></div>
          <span className="text-slate-600 text-xs font-medium">Compiling audit database...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <Activity className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Logs Recorded</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
            Administrative actions, grievance dispatches, and status updates will be logged here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-5 sm:p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredLogs.map((log, idx) => (
                <li key={log._id}>
                  <div className="relative pb-8 font-sans">
                    {/* Vertical Connector Line */}
                    {idx !== filteredLogs.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                    )}
                    
                    <div className="relative flex space-x-3.5">
                      {/* Icon */}
                      <div>
                        <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ring-8 ring-white select-none">
                          <Activity className="h-4 w-4" />
                        </span>
                      </div>
                      
                      {/* Details Box */}
                      <div className="flex-1 min-w-0 pt-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="text-xs text-slate-700">
                          <p className="font-semibold text-slate-900 leading-snug">{log.details}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="flex items-center space-x-1 text-[11px] text-slate-500">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>By {log.performedBy?.fullName || 'System'} ({log.performedBy?.role || 'Service'})</span>
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
