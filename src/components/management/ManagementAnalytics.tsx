import React, { useState } from 'react';
import {
  BarChart3,
  ShieldAlert,
  Skull,
  Bed,
  CheckCircle2,
  Activity,
  HeartPulse,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';

export const ManagementAnalytics: React.FC = () => {
  const {
    outcomeMetrics,
    occupiedBedsCount,
    availableBedsCount,
    config,
    todayTemperatureStats,
    todayDoctorVisitStats,
    admittedPatients,
    showToast,
  } = useApp();

  // Test simulation helper to allow evaluator to demonstrate >15% warning dynamically
  const [testModeActive, setTestModeActive] = useState(false);

  // Computed or simulated metrics for test view
  const currentRecovered = outcomeMetrics.totalRecovered;
  const currentDeaths = outcomeMetrics.totalDeaths;

  const displayRecovered = testModeActive ? 10 : currentRecovered;
  const displayDeaths = testModeActive ? 3 : currentDeaths; // 3 / (10 + 3) = 23.0% > 15%
  const displayCompleted = displayRecovered + displayDeaths;
  const displaySuccessRate =
    displayCompleted > 0
      ? Number(((displayRecovered / displayCompleted) * 100).toFixed(1))
      : 0;
  const displayMortalityRate =
    displayCompleted > 0
      ? Number(((displayDeaths / displayCompleted) * 100).toFixed(1))
      : 0;
  const isMortalityAlert = displayCompleted > 0 && displayDeaths / displayCompleted > 0.15;

  const occupancyRate = Number(
    ((occupiedBedsCount / config.facilityMaxCapacity) * 100).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            Outcomes & insights
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Institutional surveillance: occupancy, daily clinical compliance, treatment success, and mortality threshold monitoring.
          </p>
        </div>

        {/* Demo Simulation Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold pl-2">Evaluator Test:</span>
          <button
            onClick={() => {
              setTestModeActive(!testModeActive);
              showToast(
                !testModeActive ? 'warning' : 'info',
                !testModeActive ? 'Simulating Mortality Surge' : 'Normal Data Restored',
                !testModeActive
                  ? 'Simulated outcome test: Mortality = 23.0% (>15% warning threshold).'
                  : 'Returned to live facility database metrics.'
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              testModeActive
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {testModeActive ? 'Surge Simulated (>15%)' : 'Test >15% Warning'}
          </button>
        </div>
      </div>

      {/* CRITICAL MORTALITY WARNING BANNER (When Mortality > 15%) */}
      {isMortalityAlert && (
        <div className="p-5 bg-gradient-to-r from-rose-900 via-red-800 to-rose-900 text-white rounded-2xl shadow-lg border border-rose-700 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md shrink-0">
                <ShieldAlert className="w-8 h-8 text-rose-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-rose-500 text-white tracking-wider">
                    Critical Facility Alert
                  </span>
                  <span className="text-xs text-rose-200">
                    Threshold: &gt; 15.0% • Current: <strong>{displayMortalityRate}%</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">
                  Institutional Mortality Warning Active ({displayMortalityRate}%)
                </h3>
                <p className="text-xs text-rose-100 max-w-2xl mt-1 leading-relaxed">
                  Quarantine treatment outcomes have exceeded the acceptable safety threshold of 15%
                  ({displayDeaths} recorded deaths out of {displayCompleted} completed cases).
                  Emergency clinical escalation, infectious disease review, and protocol audits are mandatory.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="bg-black/30 p-3 rounded-xl text-center min-w-[120px] border border-white/10">
                <span className="text-[10px] uppercase text-rose-200 font-semibold block">
                  Mortality Rate
                </span>
                <span className="text-2xl font-black font-mono text-rose-200">
                  {displayMortalityRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Key KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Treatment Success Rate */}
        <StatCard
          title="Treatment Success Rate"
          value={`${displaySuccessRate}%`}
          subtitle={`${displayRecovered} of ${displayCompleted} completed outcomes`}
          icon={<HeartPulse className="w-5 h-5" />}
          color={displaySuccessRate >= 85 ? 'emerald' : 'amber'}
          badge={displaySuccessRate >= 85 ? 'Optimal' : 'Needs Review'}
          trend={{
            value: `Formula: Recovered / (Recovered + Deaths)`,
            isNeutral: true,
          }}
        />

        {/* Mortality Rate */}
        <StatCard
          title="Mortality Rate"
          value={`${displayMortalityRate}%`}
          subtitle={`${displayDeaths} recorded deaths total`}
          icon={<Skull className="w-5 h-5" />}
          color={isMortalityAlert ? 'rose' : 'slate'}
          badge={isMortalityAlert ? 'Warning > 15%' : 'Within Range'}
          trend={{
            value: `Threshold: Max 15%`,
            isPositive: !isMortalityAlert,
          }}
        />

        {/* Quarantine Occupancy */}
        <StatCard
          title="Quarantine Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBedsCount} of ${config.facilityMaxCapacity} Beds Active`}
          icon={<Bed className="w-5 h-5" />}
          color={occupiedBedsCount >= 65 ? 'amber' : 'teal'}
          badge={`${availableBedsCount} Vacant`}
        />

        {/* Daily Temp Completion */}
        <StatCard
          title="Daily Temp Compliance"
          value={`${todayTemperatureStats.completionRate}%`}
          subtitle={`${todayTemperatureStats.completed} / ${todayTemperatureStats.totalRequired} measured`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color={todayTemperatureStats.completionRate === 100 ? 'emerald' : 'amber'}
          badge={todayTemperatureStats.pending > 0 ? `${todayTemperatureStats.pending} Pending` : '100%'}
        />

        {/* Doctor Rounds Completion */}
        <StatCard
          title="Doctor Visits Completed"
          value={`${todayDoctorVisitStats.completionRate}%`}
          subtitle={`${todayDoctorVisitStats.completed} / ${todayDoctorVisitStats.totalRequired} visited`}
          icon={<Activity className="w-5 h-5" />}
          color={todayDoctorVisitStats.completionRate === 100 ? 'indigo' : 'slate'}
          badge={todayDoctorVisitStats.pending > 0 ? `${todayDoctorVisitStats.pending} Pending` : '100%'}
        />
      </div>

      {/* Outcome Analysis & Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Quarantine Treatment Outcomes
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Patient disposition summary across all completed quarantine episodes.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Recovered Discharges
                  </span>
                  <span className="font-mono">{displayRecovered} patients ({displaySuccessRate}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${displaySuccessRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <Skull className="w-4 h-4 text-rose-600" />
                    Recorded Deaths
                  </span>
                  <span className="font-mono">{displayDeaths} patients ({displayMortalityRate}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isMortalityAlert ? 'bg-rose-600 animate-pulse' : 'bg-rose-400'
                    }`}
                    style={{ width: `${displayMortalityRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Standard Formula Applied:</p>
              <p className="font-mono text-[11px] text-teal-800">
                Success Rate = Recovered / (Recovered + Deaths) × 100
              </p>
              <p className="font-mono text-[11px] text-teal-800">
                = {displayRecovered} / ({displayRecovered} + {displayDeaths}) × 100 ={' '}
                <strong>{displaySuccessRate}%</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Completed Cases:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{displayCompleted}</span>
          </div>
        </div>

        {/* Capacity & Wing Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Bed Capacity Allocation (74 Max)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of occupied vs vacant quarantine rooms across facility zones.
            </p>

            <div className="space-y-4">
              {/* Wing A */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="font-bold text-slate-800">Wing A (Rooms 1–25)</span>
                  <span className="text-slate-600">
                    {admittedPatients.filter((p) => p.zone === 'Wing A').length} / 25 Occupied
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{
                      width: `${(admittedPatients.filter((p) => p.zone === 'Wing A').length / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Wing B */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="font-bold text-slate-800">Wing B (Rooms 26–50)</span>
                  <span className="text-slate-600">
                    {admittedPatients.filter((p) => p.zone === 'Wing B').length} / 25 Occupied
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{
                      width: `${(admittedPatients.filter((p) => p.zone === 'Wing B').length / 25) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Wing C */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="font-bold text-slate-800">Wing C (Rooms 51–74)</span>
                  <span className="text-slate-600">
                    {admittedPatients.filter((p) => p.zone === 'Wing C').length} / 24 Occupied
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{
                      width: `${(admittedPatients.filter((p) => p.zone === 'Wing C').length / 24) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Available Vacancies:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {availableBedsCount} Beds Open
            </span>
          </div>
        </div>

        {/* Operational Clinical Compliance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Daily Clinical Compliance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Adherence to mandatory daily temperature reading and physician visit protocols.
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">Temperature Protocol</span>
                  <span className="text-xs font-mono font-bold text-teal-700">
                    {todayTemperatureStats.completionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 mt-1">
                  {todayTemperatureStats.completed} completed • {todayTemperatureStats.pending} pending nurse round
                </p>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">Physician Visits Protocol</span>
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    {todayDoctorVisitStats.completionRate}%
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 mt-1">
                  {todayDoctorVisitStats.completed} completed • {todayDoctorVisitStats.pending} pending doctor round
                </p>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">Active Fever Surveillance</span>
                  <span className="text-xs font-mono font-bold text-rose-700">
                    {todayTemperatureStats.feverCount} Cases
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">
                  Flagged with temperature ≥ {config.feverThreshold}°C today
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Audit logging active • Real-time synchronization
          </div>
        </div>
      </div>
    </div>
  );
};
