import React from 'react';

const priorityConfig = {
  High: {
    color: '#ef4444',
    bg: 'bg-red-500',
    lightBg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  Medium: {
    color: '#f59e0b',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  Low: {
    color: '#64748b',
    bg: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200'
  }
};

const PriorityBarChart = ({
  data = [],
  title = 'Grievance Priority Breakdown',
  subtitle
}) => {
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {total} Cases
          </span>
        </div>

        {total === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No priority data recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              const cfg = priorityConfig[item.priority] || priorityConfig.Low;
              const count = item.count || 0;
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={item.priority} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${cfg.bg}`}></span>
                      <span>{item.priority} Priority</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{count}</span>
                      <span className="text-slate-400 text-[11px]">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Visual Progress Track */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.bg}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
        <span>Emergency triage SLA</span>
        <span className="font-medium text-slate-700">High: &lt;24h, Med: &lt;48h, Low: &lt;7d</span>
      </div>
    </div>
  );
};

export default PriorityBarChart;
