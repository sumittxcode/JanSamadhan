import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Clock, Landmark, Activity, User } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/activity-logs');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (act) => {
    if (act.includes('CREATED')) return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    if (act.includes('DELETED') || act.includes('REJECTED')) return 'bg-red-50 text-red-800 border-red-100';
    if (act.includes('ASSIGNED')) return 'bg-blue-50 text-blue-800 border-blue-100';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Activity Log Tracker</h1>
        <p className="text-sm text-slate-500 font-sans">Audit logs showing status changes, assignments, and portal administrative actions.</p>
      </div>

      {/* Logs Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <span className="text-slate-550 text-sm font-medium font-sans">Compiling log database...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/60 rounded-xl space-y-3">
          <Activity className="h-12 w-12 text-slate-350 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 font-sans">No Logs Recorded</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto font-sans">
            Administrative actions will generate system logs in real-time.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flow-root">
            <ul className="-mb-8">
              {logs.map((log, idx) => (
                <li key={log._id}>
                  <div className="relative pb-8 font-sans">
                    {/* Vertical Connector Line */}
                    {idx !== logs.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
                    )}
                    
                    <div className="relative flex space-x-3.5">
                      {/* Icon */}
                      <div>
                        <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 ring-8 ring-white select-none">
                          <Activity className="h-4.5 w-4.5" />
                        </span>
                      </div>
                      
                      {/* Details Box */}
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div className="text-xs text-slate-650">
                          <p className="font-semibold text-slate-855 select-text">{log.details}</p>
                          <div className="flex items-center space-x-2.5 mt-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold select-all">
                              <User className="h-3 w-3" />
                              <span>By {log.performedBy?.fullName} ({log.performedBy?.role})</span>
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-semibold pt-0.5">
                          <time className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-slate-350" />
                            <span>
                              {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </time>
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
