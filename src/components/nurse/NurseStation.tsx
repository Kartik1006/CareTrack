import React, { useState, useMemo } from 'react';
import {
  Thermometer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  History,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { TemperatureModal } from './TemperatureModal';
import { TemperatureSparkline } from '../common/TemperatureSparkline';
import type { Patient } from '../../types';

interface NurseStationProps {
  onSelectPatient: (patientId: string) => void;
}

export const NurseStation: React.FC<NurseStationProps> = ({ onSelectPatient }) => {
  const {
    admittedPatients,
    getPatientTemperatures,
    hasTemperatureToday,
    getTodayTemperatureRecord,
    todayTemperatureStats,
    config,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'fever'>('all');
  const [zoneFilter, setZoneFilter] = useState<'all' | 'Wing A' | 'Wing B' | 'Wing C'>('all');

  // Modal State
  const [modalPatient, setModalPatient] = useState<Patient | null>(null);
  const [modalMode, setModalMode] = useState<'new' | 'correct'>('new');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return admittedPatients.filter((patient) => {
      // Search
      const searchMatch =
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.roomNumber.toString().includes(searchTerm);

      if (!searchMatch) return false;

      // Zone filter
      if (zoneFilter !== 'all' && patient.zone !== zoneFilter) return false;

      // Status filter
      const hasToday = hasTemperatureToday(patient.id);
      const todayRecord = getTodayTemperatureRecord(patient.id);
      const isFever = todayRecord && todayRecord.temperature >= config.feverThreshold;

      if (statusFilter === 'pending') return !hasToday;
      if (statusFilter === 'completed') return hasToday;
      if (statusFilter === 'fever') return Boolean(isFever);

      return true;
    });
  }, [
    admittedPatients,
    searchTerm,
    statusFilter,
    zoneFilter,
    hasTemperatureToday,
    getTodayTemperatureRecord,
    config.feverThreshold,
  ]);

  const handleOpenRecord = (patient: Patient) => {
    setModalPatient(patient);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleOpenCorrection = (patient: Patient) => {
    setModalPatient(patient);
    setModalMode('correct');
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Thermometer className="w-7 h-7 text-teal-600" />
            Temperature rounds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time daily temperature monitoring and fever detection for {admittedPatients.length} admitted patients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
            Fever Baseline: <strong className="font-semibold text-slate-900">≥ {config.feverThreshold}°C</strong>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Daily Quota"
          value={`${todayTemperatureStats.completed} / ${todayTemperatureStats.totalRequired}`}
          subtitle={`${todayTemperatureStats.completionRate}% completed today`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
          trend={{
            value: `${todayTemperatureStats.pending} pending readings remaining`,
            isPositive: todayTemperatureStats.pending === 0,
            isNeutral: todayTemperatureStats.pending > 0,
          }}
        />
        <StatCard
          title="Pending Readings"
          value={todayTemperatureStats.pending}
          subtitle="Patients awaiting morning temp"
          icon={<Clock className="w-5 h-5" />}
          color={todayTemperatureStats.pending > 0 ? 'amber' : 'emerald'}
          badge={todayTemperatureStats.pending > 0 ? 'Action Needed' : 'Completed'}
          onClick={() => setStatusFilter(todayTemperatureStats.pending > 0 ? 'pending' : 'all')}
        />
        <StatCard
          title="Fever Cases Today"
          value={todayTemperatureStats.feverCount}
          subtitle={`Patients with temp ≥ ${config.feverThreshold}°C`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={todayTemperatureStats.feverCount > 0 ? 'rose' : 'emerald'}
          badge={todayTemperatureStats.feverCount > 0 ? 'Alert' : 'None'}
          onClick={() => setStatusFilter('fever')}
        />
        <StatCard
          title="Total Admitted"
          value={admittedPatients.length}
          subtitle={`Occupancy: ${((admittedPatients.length / config.facilityMaxCapacity) * 100).toFixed(0)}% of 74 Beds`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
          onClick={() => setStatusFilter('all')}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, room # or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({admittedPatients.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({todayTemperatureStats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({todayTemperatureStats.completed})
            </button>
            <button
              onClick={() => setStatusFilter('fever')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === 'fever'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:text-rose-700'
              }`}
            >
              Fever ({todayTemperatureStats.feverCount})
            </button>
          </div>

          {/* Wing Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Wings</option>
              <option value="Wing A">Wing A (1-25)</option>
              <option value="Wing B">Wing B (26-50)</option>
              <option value="Wing C">Wing C (51-74)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Temperature Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Room & Bed
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Patient Info
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Today's Reading
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Recent Trend (7 Days)
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
                    <Thermometer className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No patients found matching this filter.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your search or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const hasToday = hasTemperatureToday(patient.id);
                  const todayRecord = getTodayTemperatureRecord(patient.id);
                  const isFever = todayRecord && todayRecord.temperature >= config.feverThreshold;
                  const history = getPatientTemperatures(patient.id);

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFever ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Room & Bed */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center border border-teal-200/80 text-sm">
                            {patient.roomNumber}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              Room {patient.roomNumber}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">{patient.zone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>
                          <button
                            onClick={() => onSelectPatient(patient.id)}
                            className="font-semibold text-slate-900 hover:text-teal-600 transition-colors text-left"
                          >
                            {patient.fullName}
                          </button>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-0.5">
                            <span>{patient.id}</span>
                            <span>•</span>
                            <span>
                              {patient.age}y, {patient.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Today's Reading */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasToday && todayRecord ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-lg font-mono font-bold px-2.5 py-1 rounded-lg border ${
                                isFever
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {todayRecord.temperature.toFixed(1)}°C
                            </span>
                            {todayRecord.isCorrected && (
                              <span
                                className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold"
                                title={`Corrected: was ${todayRecord.previousTemperature}°C (${todayRecord.correctionReason})`}
                              >
                                Corrected
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic font-medium">Not recorded yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {hasToday ? (
                          isFever ? (
                            <Badge variant="danger" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                              Fever Flagged (≥{config.feverThreshold}°C)
                            </Badge>
                          ) : (
                            <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                              Completed (Normal)
                            </Badge>
                          )
                        ) : (
                          <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5" />}>
                            Pending Today
                          </Badge>
                        )}
                      </td>

                      {/* Sparkline Trend */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <TemperatureSparkline
                          records={history}
                          feverThreshold={config.feverThreshold}
                          width={140}
                          height={36}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!hasToday ? (
                            <button
                              onClick={() => handleOpenRecord(patient)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <Thermometer className="w-3.5 h-3.5" />
                              Record
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenCorrection(patient)}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 transition-colors flex items-center gap-1"
                              title="Authorized correction for today's temperature"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Correct</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectPatient(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Patient Dossier"
                          >
                            <History className="w-4 h-4" />
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

      {/* Temperature Modal (New or Correction) */}
      <TemperatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={modalPatient}
        mode={modalMode}
      />
    </div>
  );
};

