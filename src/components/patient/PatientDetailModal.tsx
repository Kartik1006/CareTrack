import React, { useState } from 'react';
import {
  User,
  Thermometer,
  Stethoscope,
  Award,
  CheckCircle2,
  Clock,
  Skull,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { TemperatureSparkline } from '../common/TemperatureSparkline';
import { useApp } from '../../context/AppContext';
import { TemperatureModal } from '../nurse/TemperatureModal';
import { DoctorVisitModal } from '../doctor/DoctorVisitModal';
import { DischargeApprovalModal } from '../doctor/DischargeApprovalModal';
import { FinalizeDischargeModal } from '../admin/FinalizeDischargeModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PatientDetailModalProps {
  patientId: string | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patientId,
  onClose,
}) => {
  const {
    getPatientById,
    getPatientTemperatures,
    getPatientDoctorVisits,
    getPatientEligibility,
    hasTemperatureToday,
    getTodayTemperatureRecord,
    hasDoctorVisitToday,
    getTodayDoctorVisit,
    config,
    userRole,
    recordPatientDeceased,
  } = useApp();

  // Child Modals
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [tempModalMode, setTempModalMode] = useState<'new' | 'correct'>('new');
  const [isDoctorVisitOpen, setIsDoctorVisitOpen] = useState(false);
  const [isDischargeApprovalOpen, setIsDischargeApprovalOpen] = useState(false);
  const [isFinalizeDischargeOpen, setIsFinalizeDischargeOpen] = useState(false);
  const [isDeceasedConfirmOpen, setIsDeceasedConfirmOpen] = useState(false);
  const deceasedReason = 'Deceased following acute clinical deterioration in quarantine.';

  if (!patientId) return null;
  const patient = getPatientById(patientId);
  if (!patient) return null;

  const temperatures = getPatientTemperatures(patient.id);
  const doctorVisits = getPatientDoctorVisits(patient.id);
  const eligibility = getPatientEligibility(patient);
  const hasTempToday = hasTemperatureToday(patient.id);
  const todayTemp = getTodayTemperatureRecord(patient.id);
  const hasVisitToday = hasDoctorVisitToday(patient.id);
  const todayVisit = getTodayDoctorVisit(patient.id);

  const handleConfirmDeceased = () => {
    recordPatientDeceased(
      patient.id,
      deceasedReason || 'Deceased following acute clinical deterioration in quarantine.'
    );
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={Boolean(patientId)}
        onClose={onClose}
        title={`${patient.fullName} — Patient Clinical Dossier`}
        subtitle={`ID: ${patient.id} • Room ${patient.roomNumber} (${patient.zone}) • Admitted: ${patient.admissionDate}`}
        maxWidth="4xl"
        icon={<User className="w-5 h-5 text-teal-600" />}
      >
        <div className="space-y-6">
          {/* Top Quick Status & Demographics Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Quarantine Bed
                </span>
                <span className="text-base font-bold text-teal-800 font-mono">
                  Room #{patient.roomNumber} ({patient.zone})
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Demographics
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {patient.age} yrs • {patient.gender} • {patient.nationalId}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                  Contact
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {patient.contactPhone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {patient.status === 'discharged' ? (
                <Badge variant="success" size="md">Discharged (Recovered)</Badge>
              ) : patient.status === 'deceased' ? (
                <Badge variant="danger" size="md">Deceased</Badge>
              ) : patient.status === 'discharge_pending_admin' ? (
                <Badge variant="purple" size="md">Approved • In Admin Queue</Badge>
              ) : eligibility.isEligible ? (
                <Badge variant="success" size="md">Eligible for Discharge (3 Days Afebrile)</Badge>
              ) : (
                <Badge variant="info" size="md">Under Active Care</Badge>
              )}
            </div>
          </div>

          {/* Today's Status Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Today's Temperature */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Today's Temperature
              </span>
              {hasTempToday && todayTemp ? (
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xl font-bold font-mono px-2 py-0.5 rounded-lg border ${
                      todayTemp.isFever
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {todayTemp.temperature.toFixed(1)}°C
                  </span>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${
                      todayTemp.isFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {todayTemp.isFever ? 'Fever' : 'Afebrile'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Nurse Round
                  </span>
                  {userRole === 'nurse' && (
                    <button
                      onClick={() => {
                        setTempModalMode('new');
                        setIsTempModalOpen(true);
                      }}
                      className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-600 text-white"
                    >
                      Record Now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Today's Doctor Visit */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Today's Doctor Visit
              </span>
              {hasVisitToday && todayVisit ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      Condition: {todayVisit.conditionSummary}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 truncate">
                    {todayVisit.clinicalNotes}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-medium">Pending physician round</span>
                  {userRole === 'doctor' && hasTempToday && (
                    <button
                      onClick={() => setIsDoctorVisitOpen(true)}
                      className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-600 text-white"
                    >
                      Conduct Visit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Discharge Streak */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Discharge Afebrile Streak
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-emerald-700">
                  {eligibility.consecutiveFeverFreeDays} / {config.quarantineRequiredFeverFreeDays} Days
                </span>
                {eligibility.isEligible ? (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
                    Eligible ✓
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    {config.quarantineRequiredFeverFreeDays - eligibility.consecutiveFeverFreeDays} days remaining
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Assumption & Discharge Explanation */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
            <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Quarantine Protocol & Clinical Assumption:</p>
              <p className="text-xs text-indigo-900 mt-0.5 leading-relaxed">
                Eligibility for quarantine discharge requires <strong>3 consecutive complete calendar days</strong> with body temperature strictly below <strong>{config.feverThreshold}°C</strong> without antipyretic suppression.
                Any single fever spike resets the counter to 0. Clearance must be approved by the Attending Physician and finalized by Administration.
              </p>
            </div>
          </div>

          {/* Temperature History Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-teal-600" />
                Temperature Observation Log ({temperatures.length} readings)
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">7-Day Trajectory:</span>
                <TemperatureSparkline
                  records={temperatures}
                  feverThreshold={config.feverThreshold}
                  width={160}
                  height={32}
                  showLabels
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="text-left text-slate-400 font-medium">
                    <th className="py-2">Date & Time</th>
                    <th className="py-2">Reading</th>
                    <th className="py-2">Classification</th>
                    <th className="py-2">Recorded By</th>
                    <th className="py-2">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {temperatures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                        No temperature entries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    temperatures.map((t) => {
                      const isFever = t.temperature >= config.feverThreshold;
                      return (
                        <tr key={t.id} className={isFever ? 'bg-rose-50/50' : ''}>
                          <td className="py-2 font-mono text-slate-700">
                            {t.date} • {t.recordedAt.slice(11, 16)}
                          </td>
                          <td className="py-2 font-mono font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                isFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {t.temperature.toFixed(1)}°C
                            </span>
                          </td>
                          <td className="py-2">
                            {isFever ? (
                              <span className="text-rose-600 font-bold">Fever (≥{config.feverThreshold}°C)</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Afebrile</span>
                            )}
                          </td>
                          <td className="py-2 text-slate-600">{t.recordedBy}</td>
                          <td className="py-2 text-slate-500">
                            {t.isCorrected ? (
                              <span className="text-amber-700 font-medium">
                                Corrected (was {t.previousTemperature}°C): {t.correctionReason}
                              </span>
                            ) : (
                              'Standard round'
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Visits Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              Physician Examination & Round History ({doctorVisits.length} visits)
            </h4>

            {doctorVisits.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No doctor rounds conducted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {doctorVisits.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {v.doctorName} • {v.date}
                      </span>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Condition: {v.conditionSummary}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <strong className="text-slate-500">Clinical Notes:</strong> {v.clinicalNotes}
                    </p>
                    <p className="text-slate-700">
                      <strong className="text-slate-500">Medication & Treatment:</strong> {v.treatmentGiven}
                    </p>
                    {v.vitals && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                        {v.vitals.pulse && <span>Pulse: {v.vitals.pulse} bpm</span>}
                        {v.vitals.spo2 && <span>SpO2: {v.vitals.spo2}%</span>}
                        {v.vitals.bp && <span>BP: {v.vitals.bp}</span>}
                        {v.vitals.respiratoryRate && <span>Resp: {v.vitals.respiratoryRate}/min</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role-Specific Action Bar at bottom */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Active mode: <strong className="text-slate-900 capitalize">{userRole}</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nurse Action */}
              {userRole === 'nurse' && patient.status === 'admitted' && (
                <>
                  {!hasTempToday ? (
                    <button
                      onClick={() => {
                        setTempModalMode('new');
                        setIsTempModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <Thermometer className="w-3.5 h-3.5" />
                      Record Daily Temperature
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setTempModalMode('correct');
                        setIsTempModalOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center gap-1.5"
                    >
                      <Thermometer className="w-3.5 h-3.5" />
                      Authorized Temperature Correction
                    </button>
                  )}
                </>
              )}

              {/* Doctor Action */}
              {userRole === 'doctor' && patient.status === 'admitted' && (
                <>
                  {!hasVisitToday && (
                    <button
                      onClick={() => setIsDoctorVisitOpen(true)}
                      disabled={!hasTempToday}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                        hasTempToday
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title={!hasTempToday ? "Awaiting nurse temperature reading" : "Conduct visit"}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      Conduct Daily Visit
                    </button>
                  )}

                  {eligibility.isEligible && (
                    <button
                      onClick={() => setIsDischargeApprovalOpen(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Approve Discharge Clearance
                    </button>
                  )}

                  <button
                    onClick={() => setIsDeceasedConfirmOpen(true)}
                    className="px-3 py-2 text-xs font-medium rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                    title="Record terminal event / mortality"
                  >
                    <Skull className="w-3.5 h-3.5" />
                    Record Deceased
                  </button>
                </>
              )}

              {/* Administrator Action */}
              {userRole === 'admin' && patient.status === 'discharge_pending_admin' && (
                <button
                  onClick={() => setIsFinalizeDischargeOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Finalize Discharge & Release Bed #{patient.roomNumber}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Nested Modals */}
      <TemperatureModal
        isOpen={isTempModalOpen}
        onClose={() => setIsTempModalOpen(false)}
        patient={patient}
        mode={tempModalMode}
      />

      <DoctorVisitModal
        isOpen={isDoctorVisitOpen}
        onClose={() => setIsDoctorVisitOpen(false)}
        patient={patient}
      />

      <DischargeApprovalModal
        isOpen={isDischargeApprovalOpen}
        onClose={() => setIsDischargeApprovalOpen(false)}
        patient={patient}
      />

      <FinalizeDischargeModal
        isOpen={isFinalizeDischargeOpen}
        onClose={() => {
          setIsFinalizeDischargeOpen(false);
          onClose();
        }}
        patient={patient}
      />

      {/* Deceased Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeceasedConfirmOpen}
        onClose={() => setIsDeceasedConfirmOpen(false)}
        onConfirm={handleConfirmDeceased}
        title={`Record Patient Deceased — ${patient.fullName}`}
        message={`Are you sure you want to record a deceased outcome for ${patient.fullName} (Room ${patient.roomNumber})? This will permanently close the admission, release the bed back to available capacity, and update the facility mortality rate metrics.`}
        confirmLabel="Record Mortality & Release Bed"
        variant="danger"
      />
    </>
  );
};
