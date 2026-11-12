import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  color?: 'teal' | 'amber' | 'rose' | 'emerald' | 'indigo' | 'purple' | 'slate';
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'teal',
  badge,
  onClick,
}) => {
  const colorSchemes = {
    teal: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-teal-300',
      iconBg: 'bg-teal-50 text-teal-600',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    indigo: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    purple: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const scheme = colorSchemes[color];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl border shadow-xs transition-all duration-200 ${scheme.bg} ${scheme.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
            {badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${scheme.badge}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 text-xs font-medium flex items-center gap-1 ${
                trend.isNeutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${scheme.iconBg}`}>{icon}</div>
      </div>
    </div>
  );
};
