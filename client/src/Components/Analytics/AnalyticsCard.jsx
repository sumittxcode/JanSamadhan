import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-800'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-100',
    badge: 'bg-purple-100 text-purple-800'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-800'
  },
  red: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-100',
    badge: 'bg-rose-100 text-rose-800'
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700'
  }
};

const AnalyticsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'slate',
  trend,
  className = ''
}) => {
  const scheme = colorStyles[color] || colorStyles.slate;

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block mt-1">
            {value}
          </span>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.bg} ${scheme.text} shrink-0`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
          {subtitle && <span className="truncate text-[11px]">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${scheme.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
