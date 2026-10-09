import React, { useState } from 'react';

const defaultColors = [
  '#10b981', // Resolved (green)
  '#3b82f6', // In Progress (blue)
  '#6366f1', // Assigned (indigo)
  '#a855f7', // Under Review (purple)
  '#f59e0b', // Pending (amber)
  '#ef4444'  // Rejected (red)
];

const StatusDonutChart = ({
  data = [],
  title = 'Complaint Status Distribution',
  subtitle
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Filter items with positive count
  const validItems = data.filter(item => item && item.count > 0);
  const total = validItems.reduce((acc, item) => acc + item.count, 0);

  // SVG circle dimensions
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedPercent = 0;
  const segments = validItems.map((item, idx) => {
    const percent = total > 0 ? (item.count / total) : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      color: item.color || defaultColors[idx % defaultColors.length]
    };
  });

  const activeItem = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {total} Total
          </span>
        </div>

        {total === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No grievance records available to plot.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />
                {segments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                ))}
              </svg>

              {/* Center Metrics Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                {activeItem ? (
                  <>
                    <span className="text-xl font-extrabold text-slate-900 leading-tight">
                      {activeItem.count}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-[90px]">
                      {activeItem.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {activeItem.percent}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      {total}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Grievances
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2 max-h-48 overflow-y-auto pr-1">
              {segments.map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                    hoveredIdx === idx ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-slate-700 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-semibold text-slate-900">{item.count}</span>
                    <span className="text-slate-400 text-[10px]">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDonutChart;
