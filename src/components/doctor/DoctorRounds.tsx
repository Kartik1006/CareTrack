import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Lock,
  Info,
  Activity,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { DoctorVisitModal } from './DoctorVisitModal';
import { DischargeApprovalModal } from './DischargeApprovalModal';
import { TemperatureSparkline } from '../common/TemperatureSparkline';
import type { Patient } from '../../types';

interface DoctorRoundsProps {
  onSelectPatient: (patientId: string) => void;
}

export const DoctorRounds: React.FC<DoctorRoundsProps> = ({ onSelectPatient }) => {
  const {
    admittedPatients,
    hasTemperatureToday,
    getTodayTemperatureRecord,
    hasDoctorVisitToday,
    getTodayDoctorVisit,
    getPatientEligibility,
    getPatientTemperatures,
    todayDoctorVisitStats,
    todayTemperatureStats,
    config,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'ready' | 'pending_temp' | 'visited' | 'eligible'>('all');

  // Modals
  const [visitPatient, setVisitPatient] = useState<Patient | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);

  // Eligible patients who haven't yet been approved
  const eligiblePatients = useMemo(() => {
    return admittedPatients.filter((p) => {
      if (p.status !== 'admitted') return false;
      const el = getPatientEligibility(p);
      return el.isEligible;
    });
  }, [admittedPatients, getPatientEligibility]);

  // Filtered patients for the main table
  const filteredPatients = useMemo(() => {
    return admittedPatients.filter((p) => {
      // Search
      const searchMatch =
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.roomNumber.toString().includes(searchTerm);

      if (!searchMatch) return false;

      const tempLogged = hasTemperatureToday(p.id);
      const visited = hasDoctorVisitToday(p.id);
      const eligibility = getPatientEligibility(p);

      if (filterMode === 'ready') return tempLogged && !visited;
      if (filterMode === 'pending_temp') return !tempLogged;
      if (filterMode === 'visited') return visited;
      if (filterMode === 'eligible') return eligibility.isEligible && p.status === 'admitted';

      return true;
    });
  }, [
    admittedPatients,
    searchTerm,
    filterMode,
    hasTemperatureToday,
    hasDoctorVisitToday,
    getPatientEligibility,
  ]);

  const handleOpenVisit = (patient: Patient) => {
    setVisitPatient(patient);
    setIsVisitModalOpen(true);
  };

  const handleOpenDischarge = (patient: Patient) => {
    setDischargePatient(patient);
    setIsDischargeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-indigo-600" />
            Doctor Clinical Rounds & Discharge Clearance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conduct daily physician evaluations, review afebrile streaks, and clear eligible patients for discharge.
          </p>
        </div>

        {/* Clinical Assumption Box */}
        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-200/80 px-3.5 py-2 rounded-xl text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Discharge Criteria: <strong>3 Consecutive Days</strong> without fever (&lt; {config.feverThreshold}°C).
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Rounds Progress"
          value={`${todayDoctorVisitStats.completed} / ${todayDoctorVisitStats.totalRequired}`}
          subtitle={`${todayDoctorVisitStats.completionRate}% rounds completed`}
          icon={<Stethoscope className="w-5 h-5" />}
          color="indigo"
          trend={{
            value: `${todayDoctorVisitStats.pending} patients pending visit`,
            isPositive: todayDoctorVisitStats.pending === 0,
            isNeutral: true,
          }}
        />
        <StatCard
          title="Ready For Visit"
          value={
            admittedPatients.filter(
              (p) => hasTemperatureToday(p.id) && !hasDoctorVisitToday(p.id)
            ).length
          }
          subtitle="Temp logged, awaiting doctor"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
          badge="Ready Now"
          onClick={() => setFilterMode('ready')}
        />
        <StatCard
          title="Waiting For Nurse"
          value={todayTemperatureStats.pending}
          subtitle="Doctor visit locked until temp logged"
          icon={<Lock className="w-5 h-5" />}
          color="amber"
          badge="Precondition"
          onClick={() => setFilterMode('pending_temp')}
        />
        <StatCard
          title="Discharge Eligible"
          value={eligiblePatients.length}
          subtitle="3+ consecutive fever-free days"
          icon={<Award className="w-5 h-5" />}
          color="emerald"
          badge={eligiblePatients.length > 0 ? 'Actionable' : 'None'}
          onClick={() => setFilterMode('eligible')}
        />
      </div>

      {/* ELIGIBLE FOR DISCHARGE SPOTLIGHT QUEUE */}
      {eligiblePatients.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Patients Automatically Identified Eligible for Discharge ({eligiblePatients.length})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Algorithm verified: 3 consecutive complete calendar days with temperature strictly &lt; {config.feverThreshold}°C.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {eligiblePatients.map((patient) => {
              const el = getPatientEligibility(patient);
              const history = getPatientTemperatures(patient.id);

              return (
                <div
                  key={patient.id}
                  className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Room {patient.roomNumber} • {patient.zone}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {patient.id}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{patient.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {patient.age}y, {patient.gender} • Admitted {patient.admissionDate}
                    </p>

                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 font-medium">Afebrile Streak:</span>
                      <strong className="text-emerald-700 font-mono text-xs font-bold">
                        {el.consecutiveFeverFreeDays} Consecutive Days ✓
                      </strong>
                    </div>

                    <div className="mt-2 text-center">
                      <TemperatureSparkline records={history} feverThreshold={config.feverThreshold} width={180} height={32} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDischarge(patient)}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Approve Discharge
                    </button>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="View Medical Dossier"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Table Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, room # or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({admittedPatients.length})
          </button>
          <button
            onClick={() => setFilterMode('ready')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filterMode === 'ready' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ready for Visit
          </button>
          <button
            onClick={() => setFilterMode('pending_temp')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filterMode === 'pending_temp' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waiting for Temp
          </button>
          <button
            onClick={() => setFilterMode('visited')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filterMode === 'visited' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visit Done ({todayDoctorVisitStats.completed})
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Room & Bed
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Patient
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Today's Temp
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Doctor Visit Status
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Discharge Criteria
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Stethoscope className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No patients matching current filter.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const hasTemp = hasTemperatureToday(patient.id);
                  const todayTemp = getTodayTemperatureRecord(patient.id);
                  const isFever = todayTemp && todayTemp.temperature >= config.feverThreshold;
                  const hasVisit = hasDoctorVisitToday(patient.id);
                  const todayVisit = getTodayDoctorVisit(patient.id);
                  const eligibility = getPatientEligibility(patient);

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        eligibility.isEligible && patient.status === 'admitted' ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Room */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-200 text-sm">
                            {patient.roomNumber}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Room {patient.roomNumber}
                            </span>
                            <span className="text-[11px] text-slate-500">{patient.zone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left"
                        >
                          {patient.fullName}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{patient.id}</span>
                          <span>•</span>
                          <span>
                            {patient.age}y, {patient.gender}
                          </span>
                        </div>
                      </td>

                      {/* Today's Temp */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasTemp && todayTemp ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md border ${
                                isFever
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {todayTemp.temperature.toFixed(1)}°C
                            </span>
                            {isFever && (
                              <span className="text-[10px] text-rose-600 font-bold uppercase">
                                Fever
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting Nurse
                          </span>
                        )}
                      </td>

                      {/* Doctor Visit Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasVisit ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                              Completed
                            </Badge>
                            <span className="text-[11px] text-slate-500 font-medium">
                              ({todayVisit?.conditionSummary})
                            </span>
                          </div>
                        ) : hasTemp ? (
                          <Badge variant="info" icon={<Activity className="w-3.5 h-3.5" />}>
                            Ready for Visit
                          </Badge>
                        ) : (
                          <Badge variant="neutral" icon={<Lock className="w-3.5 h-3.5 text-slate-400" />}>
                            Locked (Temp pending)
                          </Badge>
                        )}
                      </td>

                      {/* Discharge Eligibility Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {patient.status === 'discharge_pending_admin' ? (
                          <Badge variant="purple" icon={<Award className="w-3.5 h-3.5" />}>
                            Approved • In Admin Queue
                          </Badge>
                        ) : eligibility.isEligible ? (
                          <Badge variant="success" icon={<Award className="w-3.5 h-3.5" />}>
                            Eligible (3/3 Days)
                          </Badge>
                        ) : eligibility.hasFeverToday ? (
                          <Badge variant="danger" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                            Fever Spike (Reset)
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {eligibility.consecutiveFeverFreeDays} of 3 Days Afebrile
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {eligibility.isEligible && patient.status === 'admitted' && (
                            <button
                              onClick={() => handleOpenDischarge(patient)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              Approve Discharge
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenVisit(patient)}
                            disabled={!hasTemp}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                              hasVisit
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : hasTemp
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            }`}
                            title={
                              !hasTemp
                                ? "Today's temperature reading must be completed first"
                                : hasVisit
                                ? 'Review visit details'
                                : 'Conduct daily visit'
                            }
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            {hasVisit ? 'View Visit' : 'Conduct Round'}
                          </button>

                          <button
                            onClick={() => onSelectPatient(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Full Patient Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Visit Modal */}
      <DoctorVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        patient={visitPatient}
      />

      {/* Discharge Approval Modal */}
      <DischargeApprovalModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        patient={dischargePatient}
      />
    </div>
  );
};
