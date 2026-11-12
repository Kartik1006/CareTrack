import React from 'react';
import {
  LayoutDashboard,
  Thermometer,
  Stethoscope,
  Building2,
  LineChart,
  History,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavTabId =
  | 'overview'
  | 'nurse'
  | 'doctor'
  | 'admin'
  | 'management'
  | 'audit';

interface SidebarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const {
    todayTemperatureStats,
    pendingAdminDischarges,
    admittedPatients,
    getPatientEligibility,
    outcomeMetrics,
    userRole,
    setUserRole,
  } = useApp();

  // Count doctor-eligible patients
  const eligibleCount = admittedPatients.filter(
    (p) => getPatientEligibility(p).isEligible && p.status === 'admitted'
  ).length;

  const navItems: {
    id: NavTabId;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    recommendedRole?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Facility Overview',
      description: 'Unified command center',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'nurse',
      label: 'Nurse Station',
      description: 'Daily temperature logging',
      icon: <Thermometer className="w-5 h-5" />,
      badge:
        todayTemperatureStats.pending > 0
          ? `${todayTemperatureStats.pending} Pending`
          : 'All Done',
      badgeColor:
        todayTemperatureStats.pending > 0
          ? 'bg-amber-100 text-amber-800'
          : 'bg-emerald-100 text-emerald-800',
      recommendedRole: 'nurse',
    },
    {
      id: 'doctor',
      label: 'Doctor Rounds',
      description: 'Daily visits & discharge clearances',
      icon: <Stethoscope className="w-5 h-5" />,
      badge: eligibleCount > 0 ? `${eligibleCount} Eligible` : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800',
      recommendedRole: 'doctor',
    },
    {
      id: 'admin',
      label: 'Administration',
      description: '74-Bed matrix & admissions',
      icon: <Building2 className="w-5 h-5" />,
      badge:
        pendingAdminDischarges.length > 0
          ? `${pendingAdminDischarges.length} in Queue`
          : undefined,
      badgeColor: 'bg-teal-100 text-teal-800',
      recommendedRole: 'admin',
    },
    {
      id: 'management',
      label: 'Management KPIs',
      description: 'Treatment outcomes & safety alerts',
      icon: <LineChart className="w-5 h-5" />,
      badge: outcomeMetrics.isMortalityWarning ? 'ALERT >15%' : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold animate-pulse',
      recommendedRole: 'management',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      description: 'System-wide compliance log',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-0 lg:block'
        } ${!isMobileOpen ? '-translate-x-full lg:translate-x-0' : ''}`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Mobile Role Switcher */}
          <div className="px-4 mb-4 md:hidden">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Active Role
            </label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {(['nurse', 'doctor', 'admin', 'management'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`text-xs py-1.5 px-2 rounded-lg font-medium capitalize text-center ${
                    userRole === r
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workflows & Modules
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const isRoleMatch = userRole === item.recommendedRole;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group text-left ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`transition-colors ${
                          isActive
                            ? 'text-white'
                            : isRoleMatch
                            ? 'text-teal-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="truncate">
                        <span className="block truncate">{item.label}</span>
                        <span
                          className={`block text-[11px] truncate ${
                            isActive ? 'text-teal-100' : 'text-slate-400'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Clinical Protocol Quick Card in Sidebar */}
          <div className="mt-6 mx-3 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Discharge Protocol</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              3 consecutive complete fever-free days (&lt; 38.0°C) required before Doctor clearance. Final bed release by Administrator.
            </p>
          </div>

          {outcomeMetrics.isMortalityWarning && (
            <div className="mt-3 mx-3 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Mortality Alert</span>
              </div>
              <p className="text-rose-200/90 text-[11px]">
                Facility mortality is currently {outcomeMetrics.mortalityRate}% (&gt; 15% threshold). Management review required.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-200">CareTrack OS</p>
            <p className="text-[10px] text-slate-400">v2.4.0 • Quarantine Ops</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Online & Reactive" />
        </div>
      </aside>
    </>
  );
};
