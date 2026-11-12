import React from 'react';
import {
  Activity,
  Stethoscope,
  ShieldCheck,
  BarChart3,
  Thermometer,
  RotateCcw,
  Settings,
  Calendar,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenResetConfirm: () => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenResetConfirm,
  onToggleMobileMenu,
}) => {
  const {
    userRole,
    setUserRole,
    currentStaffName,
    config,
    occupiedBedsCount,
    isCapacityFull,
  } = useApp();

  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'nurse',
      label: 'Nurse',
      icon: <Thermometer className="w-4 h-4" />,
      color: 'hover:text-teal-600',
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: <Stethoscope className="w-4 h-4" />,
      color: 'hover:text-indigo-600',
    },
    {
      id: 'admin',
      label: 'Administrator',
      icon: <ShieldCheck className="w-4 h-4" />,
      color: 'hover:text-amber-600',
    },
    {
      id: 'management',
      label: 'Management',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'hover:text-emerald-600',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">CareTrack</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200/60">
                    Quarantine System
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Capacity: {config.facilityMaxCapacity} Patients • Fever Baseline: {config.feverThreshold}°C
                </p>
              </div>
            </div>
          </div>

          {/* Role Switcher in center */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            {roles.map((r) => {
              const isActive = userRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setUserRole(r.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : `text-slate-600 ${r.color} hover:bg-white/50`
                  }`}
                >
                  <span className={isActive ? 'text-teal-600' : 'text-slate-400'}>{r.icon}</span>
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Right quick stats & tools */}
          <div className="flex items-center gap-3">
            {/* Occupancy pill */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                isCapacityFull
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : occupiedBedsCount >= 65
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title="Quarantine Facility Capacity"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isCapacityFull ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span>
                {occupiedBedsCount} / {config.facilityMaxCapacity} Beds Occupied
              </span>
            </div>

            {/* Simulated Date */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{config.currentSimulationDate}</span>
            </div>

            {/* Quick Demo Reset */}
            <button
              onClick={onOpenResetConfirm}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset to canonical demo data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Settings & DB */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
              title="Settings & Supabase Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentStaffName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{currentStaffName}</p>
                <p className="text-[10px] text-teal-600 font-medium capitalize">
                  {userRole === 'admin' ? 'Administrator' : userRole} Mode
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
