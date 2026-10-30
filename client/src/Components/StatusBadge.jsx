import React from 'react';
import { 
  Clock, 
  Search, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ShieldAlert
} from 'lucide-react';

const statusConfig = {
  'Pending': {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock
  },
  'Under Review': {
    label: 'Under Review',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: Search
  },
  'Assigned': {
    label: 'Assigned',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    icon: UserCheck
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: AlertTriangle
  },
  'Resolved': {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    icon: CheckCircle2
  },
  'Rejected': {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle
  }
};

export const StatusBadge = ({ status, size = 'sm', showIcon = true, className = '' }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock
  };

  const Icon = config.icon;

  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : size === 'md'
    ? 'text-xs px-3 py-1 gap-1.5'
    : 'text-xs px-2.5 py-0.5 gap-1.5';

  const iconSizes = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      title={`Status: ${config.label}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'sm', className = '' }) => {
  const config = {
    'High': {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      label: 'High Priority'
    },
    'Medium': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Medium Priority'
    },
    'Low': {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      label: 'Low Priority'
    }
  }[priority] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: priority || 'Normal'
  };

  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
