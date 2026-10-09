import React from 'react';

const DepartmentChart = ({
  data = [],
  title = 'Department Grievance & SLA Performance',
  subtitle
}) => {
  const maxComplaints = Math.max(1, ...data.map(d => d.total || 0));

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {data.length} Departments
          </span>
        </div>

        {data.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No department data available.
          </div>
        ) : (
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {data.map((dept, i) => {
              const total = dept.total || 0;
              const resolved = dept.resolved || 0;
              const rate = dept.rate !== undefined ? dept.rate : (total > 0 ? Math.round((resolved / total) * 100) : 0);
              const barWidth = Math.round((total / maxComplaints) * 100);

              const badgeColor =
                rate >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                rate >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-700 border-slate-200';

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {dept.department || 'Unassigned'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 text-[11px]">
                        {resolved}/{total} resolved
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {rate}%
                      </span>
                    </div>
                  </div>

                  {/* Relative Volume Bar */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
        <span>Department Performance Metric</span>
        <span className="font-medium text-slate-600">Real-time Redressal SLA</span>
      </div>
    </div>
  );
};

export default DepartmentChart;
