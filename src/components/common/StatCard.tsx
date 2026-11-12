import type { ReactNode } from 'react';
interface StatCardProps { title: string; value: string | number; subtitle?: string; icon: ReactNode; trend?: {value: string; isPositive?: boolean; isNeutral?: boolean}; color?: 'teal' | 'amber' | 'rose' | 'emerald' | 'indigo' | 'purple' | 'slate'; badge?: string; onClick?: () => void; }
export function StatCard({title,value,subtitle,icon,trend,color='teal',badge,onClick}: StatCardProps) {
  const contents = <><div className="stat-heading"><span>{title}</span><span className={`stat-icon tone-${color}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-bottom">{badge && <span className={`stat-badge tone-${color}`}>{badge}</span>}{subtitle && <p>{subtitle}</p>}</div>{trend && <p className="stat-trend">{trend.value}</p>}</>;
  return onClick ? <button onClick={onClick} className="stat-card stat-clickable" aria-label={`${title}: ${value}. Open details`}>{contents}</button> : <div className="stat-card">{contents}</div>;
}
