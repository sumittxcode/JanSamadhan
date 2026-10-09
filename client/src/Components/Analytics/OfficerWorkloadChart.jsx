import React from 'react';

const OfficerWorkloadChart = ({
  data = [],
  title = 'Officer Assignment & Resolution Workload',
  subtitle
}) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {data.length} Officers Active
          </span>
        </div>

        {data.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No complaints currently assigned to individual officers.
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {data.map((officer, i) => {
              const total = officer.totalAssigned || 0;
              const active = officer.active || 0;
              const resolved = officer.resolved || 0;

              return (
                <div
                  key={i}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 text-xs block truncate">
                      {officer.name || 'Officer'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Dept: {officer.department || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold">
                      {active} Active
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                      {resolved} Resolved
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                      {total} Total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
        <span>Workload Balancing Matrix</span>
        <span className="font-medium text-slate-600">Administrative Oversight</span>
      </div>
    </div>
  );
};

export default OfficerWorkloadChart;
