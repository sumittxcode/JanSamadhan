import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-800'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-100',
    badge: 'bg-purple-100 text-purple-800'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-800'
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100',
    badge: 'bg-red-100 text-red-800'
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200/80',
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
    <div className={`bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
            {value}
          </span>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} shadow-inner shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scheme.badge}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
