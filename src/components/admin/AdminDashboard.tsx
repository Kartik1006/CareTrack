import React, { useState } from 'react';
import {
  Building2,
  UserPlus,
  Award,
  Bed,
  CheckCircle2,
  Search,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { BedMatrixView } from './BedMatrixView';
import { AdmissionModal } from './AdmissionModal';
import { FinalizeDischargeModal } from './FinalizeDischargeModal';
import type { Patient } from '../../types';

interface AdminDashboardProps {
  onSelectPatient: (patientId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectPatient }) => {
  const {
    admittedPatients,
    pendingAdminDischarges,
    occupiedBedsCount,
    availableBedsCount,
    isCapacityFull,
    config,
    getTodayTemperatureRecord,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'matrix' | 'patients'>('queue');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [admissionPreselectedRoom, setAdmissionPreselectedRoom] = useState<number | null>(null);

  const [finalizePatient, setFinalizePatient] = useState<Patient | null>(null);
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

  const occupancyRate = Number(((occupiedBedsCount / config.facilityMaxCapacity) * 100).toFixed(1));

  const handleOpenFinalize = (patient: Patient) => {
    setFinalizePatient(patient);
    setIsFinalizeOpen(true);
  };

  const handleAdmitToSpecificRoom = (room: number) => {
    setAdmissionPreselectedRoom(room);
    setIsAdmissionOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-teal-600" />
            Admissions & beds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage 74-bed capacity allocation, patient intake admissions, and finalize doctor-approved discharges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAdmissionPreselectedRoom(null);
              setIsAdmissionOpen(true);
            }}
            disabled={isCapacityFull}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
              isCapacityFull
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Patient</span>
          </button>
        </div>
      </div>

      {/* Capacity KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Facility Occupancy"
          value={`${occupiedBedsCount} / ${config.facilityMaxCapacity}`}
          subtitle={`${occupancyRate}% of total quarantine capacity`}
          icon={<Bed className="w-5 h-5" />}
          color={isCapacityFull ? 'rose' : occupiedBedsCount >= 65 ? 'amber' : 'teal'}
          badge={isCapacityFull ? 'Capacity Full' : `${availableBedsCount} Beds Open`}
        />
        <StatCard
          title="Available Beds"
          value={availableBedsCount}
          subtitle="Ready for immediate admission"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          badge="Vacant"
          onClick={() => setActiveTab('matrix')}
        />
        <StatCard
          title="Discharge Queue"
          value={pendingAdminDischarges.length}
          subtitle="Doctor cleared, waiting for admin"
          icon={<Award className="w-5 h-5" />}
          color={pendingAdminDischarges.length > 0 ? 'purple' : 'slate'}
          badge={pendingAdminDischarges.length > 0 ? 'Action Required' : 'Empty'}
          onClick={() => setActiveTab('queue')}
        />
        <StatCard
          title="Active Quarantine Wing"
          value="Wing A, B, C"
          subtitle="25 beds / 25 beds / 24 beds"
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
          onClick={() => setActiveTab('matrix')}
        />
      </div>

      {/* Capacity Warning Banner if Full */}
      {isCapacityFull && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between text-rose-900 text-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-rose-600 text-white rounded-xl font-bold text-xs">
              CAPACITY 74/74
            </span>
            <div>
              <p className="font-bold">Quarantine Facility Full</p>
              <p className="text-xs text-rose-700">
                New admissions are restricted until a patient in the discharge queue is finalized or transferred.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('queue')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            Review Discharge Queue
          </button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Doctor-Approved Discharge Queue</span>
            {pendingAdminDischarges.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-[11px] px-2 py-0.5 rounded-full font-bold">
                {pendingAdminDischarges.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>74-Bed Facility Matrix</span>
            <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">
              {availableBedsCount} open
            </span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'patients'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Admitted Patient Directory ({admittedPatients.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: DISCHARGE QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pending Final Administrator Sign-off ({pendingAdminDischarges.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These patients have been cleared by physicians (3 consecutive fever-free days verified).
                Finalizing will release their room back into the active capacity.
              </p>
            </div>
          </div>

          {pendingAdminDischarges.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Discharge Queue is Clear</p>
              <p className="text-xs text-slate-400 mt-1">
                When doctors approve patients for discharge, they will appear here for administrative room release.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAdminDischarges.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Room {patient.roomNumber} ({patient.zone})
                      </span>
                      <Badge variant="purple" icon={<Sparkles className="w-3 h-3" />}>
                        Doctor Approved
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{patient.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {patient.id} • {patient.age}y, {patient.gender}
                    </p>

                    <div className="mt-3 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                      <p className="font-semibold">
                        Approved by: {patient.dischargeApprovedByDoctor}
                      </p>
                      <p className="text-[11px] text-purple-700 italic">
                        "{patient.dischargeDoctorNotes}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenFinalize(patient)}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Finalize & Release Bed
                    </button>
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="View Dossier"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BED MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <BedMatrixView
          onSelectPatient={onSelectPatient}
          onAdmitToRoom={handleAdmitToSpecificRoom}
        />
      )}

      {/* TAB 3: ADMITTED PATIENTS DIRECTORY */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search admitted patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {admittedPatients.length} admitted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">National ID</th>
                  <th className="px-5 py-3">Admission Date</th>
                  <th className="px-5 py-3">Today's Temp</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admittedPatients
                  .filter(
                    (p) =>
                      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.roomNumber.toString().includes(searchTerm)
                  )
                  .map((patient) => {
                    const todayTemp = getTodayTemperatureRecord(patient.id);
                    return (
                      <tr key={patient.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-bold text-teal-700">
                          Room {patient.roomNumber} ({patient.zone})
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {patient.fullName}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {patient.id} • {patient.age}y {patient.gender}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-600">{patient.nationalId}</td>
                        <td className="px-5 py-3 text-slate-600">{patient.admissionDate}</td>
                        <td className="px-5 py-3 font-mono font-bold">
                          {todayTemp ? `${todayTemp.temperature}°C` : 'Pending'}
                        </td>
                        <td className="px-5 py-3">
                          {patient.status === 'discharge_pending_admin' ? (
                            <Badge variant="purple">In Discharge Queue</Badge>
                          ) : (
                            <Badge variant="info">Admitted</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => onSelectPatient(patient.id)}
                            className="text-teal-600 hover:text-teal-800 font-semibold"
                          >
                            View Dossier →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        preselectedRoom={admissionPreselectedRoom}
      />

      {/* Finalize Discharge Modal */}
      <FinalizeDischargeModal
        isOpen={isFinalizeOpen}
        onClose={() => setIsFinalizeOpen(false)}
        patient={finalizePatient}
      />
    </div>
  );
};
