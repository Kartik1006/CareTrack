import React from 'react';
import {
  Activity,
  Thermometer,
  Stethoscope,
  Building2,
  Award,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Bed,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import type { NavTabId } from '../layout/Sidebar';

interface FacilityOverviewProps {
  onNavigateTab: (tab: NavTabId) => void;
  onSelectPatient: (patientId: string) => void;
}

export const FacilityOverview: React.FC<FacilityOverviewProps> = ({
  onNavigateTab,
}) => {
  const {
    config,
    occupiedBedsCount,
    availableBedsCount,
    isCapacityFull,
    todayTemperatureStats,
    todayDoctorVisitStats,
    outcomeMetrics,
    pendingAdminDischarges,
    admittedPatients,
    getPatientEligibility,
    auditLogs,
    setUserRole,
  } = useApp();

  const occupancyRate = Number(((occupiedBedsCount / config.facilityMaxCapacity) * 100).toFixed(1));

  // Eligible for discharge
  const eligiblePatients = admittedPatients.filter(
    (p) => getPatientEligibility(p).isEligible && p.status === 'admitted'
  );

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Active Quarantine & Treatment Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            CareTrack Central Command
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Integrated clinical monitoring system for {config.facilityMaxCapacity}-bed quarantine isolation facility.
            Digitizing daily nurse temperature logs, physician rounds, 3-day fever-free discharge clearances, and bed turnover.
          </p>

          {/* Quick Role Jump Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setUserRole('nurse');
                onNavigateTab('nurse');
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Thermometer className="w-4 h-4" />
              <span>Nurse Station ({todayTemperatureStats.pending} Pending)</span>
            </button>
            <button
              onClick={() => {
                setUserRole('doctor');
                onNavigateTab('doctor');
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Rounds ({eligiblePatients.length} Eligible)</span>
            </button>
            <button
              onClick={() => {
                setUserRole('admin');
                onNavigateTab('admin');
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-white shadow-md transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Admin Bed Matrix ({availableBedsCount} Open)</span>
            </button>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Activity className="w-96 h-96 text-teal-400" />
        </div>
      </div>

      {/* Critical Mortality Warning Banner if >15% */}
      {outcomeMetrics.isMortalityWarning && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between text-rose-900 text-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-600 text-white rounded-xl font-bold text-xs">
              MORTALITY ALERT {outcomeMetrics.mortalityRate}%
            </span>
            <div>
              <p className="font-bold">Institutional Mortality Warning Active</p>
              <p className="text-xs text-rose-700">
                Facility completed outcomes mortality ({outcomeMetrics.mortalityRate}%) exceeds the 15% clinical alert threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUserRole('management');
              onNavigateTab('management');
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            Open Management Audit
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy */}
        <StatCard
          title="Bed Capacity"
          value={`${occupiedBedsCount} / ${config.facilityMaxCapacity}`}
          subtitle={`${occupancyRate}% Quarantine Occupancy`}
          icon={<Bed className="w-5 h-5" />}
          color={isCapacityFull ? 'rose' : occupiedBedsCount >= 65 ? 'amber' : 'teal'}
          badge={`${availableBedsCount} Vacant`}
          onClick={() => {
            setUserRole('admin');
            onNavigateTab('admin');
          }}
        />

        {/* Daily Temperature Status */}
        <StatCard
          title="Daily Temp Rounds"
          value={`${todayTemperatureStats.completed} / ${todayTemperatureStats.totalRequired}`}
          subtitle={`${todayTemperatureStats.completionRate}% completed today`}
          icon={<Thermometer className="w-5 h-5" />}
          color={todayTemperatureStats.pending > 0 ? 'amber' : 'emerald'}
          badge={todayTemperatureStats.pending > 0 ? `${todayTemperatureStats.pending} Left` : '100%'}
          onClick={() => {
            setUserRole('nurse');
            onNavigateTab('nurse');
          }}
        />

        {/* Doctor Clinical Visits */}
        <StatCard
          title="Doctor Rounds"
          value={`${todayDoctorVisitStats.completed} / ${todayDoctorVisitStats.totalRequired}`}
          subtitle={`${todayDoctorVisitStats.completionRate}% rounds conducted`}
          icon={<Stethoscope className="w-5 h-5" />}
          color="indigo"
          badge={todayDoctorVisitStats.pending > 0 ? `${todayDoctorVisitStats.pending} Left` : '100%'}
          onClick={() => {
            setUserRole('doctor');
            onNavigateTab('doctor');
          }}
        />

        {/* Treatment Success Rate */}
        <StatCard
          title="Treatment Success Rate"
          value={`${outcomeMetrics.treatmentSuccessRate}%`}
          subtitle={`${outcomeMetrics.totalRecovered} Recoveries • ${outcomeMetrics.totalDeaths} Deaths`}
          icon={<HeartPulse className="w-5 h-5" />}
          color="emerald"
          badge="Outcome KPI"
          onClick={() => {
            setUserRole('management');
            onNavigateTab('management');
          }}
        />
      </div>

      {/* Action Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Actions / Clearances */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Actionable Quarantine Clearances
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {eligiblePatients.length + pendingAdminDischarges.length} in pipeline
            </span>
          </div>

          {/* Doctor approval ready */}
          {eligiblePatients.length > 0 && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {eligiblePatients.length} Patients Ready for Doctor Sign-off
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                  3 Days Afebrile ✓
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Patients have satisfied the afebrile criteria (&lt; {config.feverThreshold}°C). Attending physician can approve discharge.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    setUserRole('doctor');
                    onNavigateTab('doctor');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  Go to Doctor Rounds →
                </button>
              </div>
            </div>
          )}

          {/* Admin discharge queue */}
          {pendingAdminDischarges.length > 0 && (
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {pendingAdminDischarges.length} Patients in Administrator Bed Release Queue
                </span>
                <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-[11px]">
                  Doctor Approved
                </span>
              </div>
              <p className="text-[11px] text-purple-800">
                Physicians have cleared these patients. Finalizing discharge will free rooms back to capacity.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    setUserRole('admin');
                    onNavigateTab('admin');
                  }}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  Open Admin Discharge Queue →
                </button>
              </div>
            </div>
          )}

          {/* Active fever alerts */}
          {todayTemperatureStats.feverCount > 0 && (
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {todayTemperatureStats.feverCount} Active Fever Cases Detected Today
                </span>
                <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[11px]">
                  ≥ {config.feverThreshold}°C
                </span>
              </div>
              <p className="text-[11px] text-rose-800">
                Patients require antipyretic evaluation, vital monitoring, and streak reset.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    setUserRole('nurse');
                    onNavigateTab('nurse');
                  }}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                >
                  Review Fever Patients →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Institutional Audit Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Live Audit Activity Feed
              </h3>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
              >
                View Full Log ({auditLogs.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 pt-0.5">
                      {timeStr}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium leading-tight">
                        <strong className="font-semibold text-slate-900">{log.actorName}</strong>: {log.details}
                      </p>
                      {log.patientName && (
                        <span className="text-[10px] text-teal-700 block mt-0.5">
                          Patient: {log.patientName} ({log.patientId})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Facility Status: Normal Quarantine Condition</span>
            <span className="font-mono text-emerald-600 font-bold">Online ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
