import React, { useState } from 'react';

const ComplaintTrendChart = ({
  data = [],
  title = 'Monthly Grievance Inflow Trend',
  subtitle
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Default fallback if fewer than 2 data points
  let chartData = [...data];
  if (chartData.length === 0) {
    chartData = [{ month: 'Current', count: 0 }];
  }

  const counts = chartData.map(d => d.count || 0);
  const maxCount = Math.max(5, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);

  // SVG coordinates calculation
  const width = 500;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = chartData.map((d, i) => {
    const x = chartData.length === 1
      ? width / 2
      : paddingX + (i / (chartData.length - 1)) * chartWidth;
    const y = height - paddingY - (d.count / maxCount) * chartHeight;
    return { x, y, ...d };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = points.length > 0
    ? `${points[0].x},${height - paddingY} ${pointsString} ${points[points.length - 1].x},${height - paddingY}`
    : '';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {total} Total Submissions
          </span>
        </div>

        <div className="relative mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const yVal = height - paddingY - ratio * chartHeight;
              const labelCount = Math.round(ratio * maxCount);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={yVal + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {labelCount}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {points.length > 1 && (
              <polygon points={areaPoints} fill="url(#trendGradient)" />
            )}

            {/* Polyline */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.month === p.month ? 6 : 4}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="3"
                  className="transition-all duration-200"
                />
                {/* Month label on bottom */}
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-medium"
                >
                  {p.month}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg transform -translate-x-1/2 -translate-y-full -top-1"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`
              }}
            >
              <div className="font-bold">{hoveredPoint.month}</div>
              <div className="text-blue-300">{hoveredPoint.count} Grievances</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
        <span>Chronological cadence</span>
        <span className="font-semibold text-slate-600">Dynamic telemetry aggregate</span>
      </div>
    </div>
  );
};

export default ComplaintTrendChart;
