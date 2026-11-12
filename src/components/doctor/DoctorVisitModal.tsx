import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import type { Patient, DoctorVisit } from '../../types';

interface DoctorVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const DoctorVisitModal: React.FC<DoctorVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const {
    recordDoctorVisit,
    hasTemperatureToday,
    getTodayTemperatureRecord,
    hasDoctorVisitToday,
    getTodayDoctorVisit,
  } = useApp();

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [conditionSummary, setConditionSummary] =
    useState<DoctorVisit['conditionSummary']>('Stable');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [bp, setBp] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!patient) return null;

  const tempLoggedToday = hasTemperatureToday(patient.id);
  const todayTemp = getTodayTemperatureRecord(patient.id);
  const alreadyVisitedToday = hasDoctorVisitToday(patient.id);
  const existingVisit = getTodayDoctorVisit(patient.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes.trim()) {
      setErrorMsg('Clinical examination notes are required.');
      return;
    }

    const result = recordDoctorVisit({
      patientId: patient.id,
      clinicalNotes,
      treatmentGiven: treatmentGiven.trim() || 'Continued standard quarantine protocol',
      conditionSummary,
      vitals: {
        pulse: pulse ? parseInt(pulse) : undefined,
        spo2: spo2 ? parseInt(spo2) : undefined,
        bp: bp.trim() || undefined,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
      },
    });

    if (result.success) {
      onClose();
      setClinicalNotes('');
      setTreatmentGiven('');
      setErrorMsg('');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Round & Examination — Room ${patient.roomNumber}`}
      subtitle={`Patient: ${patient.fullName} (${patient.id}) • Wing: ${patient.zone}`}
      icon={<Stethoscope className="w-5 h-5 text-indigo-600" />}
      maxWidth="lg"
    >
      {/* Rule Check 1: Must have temperature logged first */}
      {!tempLoggedToday ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Awaiting Daily Temperature Measurement
              </h4>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                Hospital Clinical Protocol requires nursing staff to record the patient’s morning
                body temperature prior to physician round completion.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Close & Wait for Nurse
            </button>
          </div>
        </div>
      ) : alreadyVisitedToday ? (
        /* Rule Check 2: Prevent duplicate visits for the day */
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Daily Doctor Visit Already Completed
              </h4>
              <p className="mt-1 text-xs text-slate-600">
                A daily clinical visit was already logged today by{' '}
                <strong>{existingVisit?.doctorName}</strong>.
              </p>
              {existingVisit && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800">
                    Condition: <span className="text-teal-600">{existingVisit.conditionSummary}</span>
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">Notes:</span>{' '}
                    {existingVisit.clinicalNotes}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-500">Treatment:</span>{' '}
                    {existingVisit.treatmentGiven}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Visit Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Temperature reminder chip */}
          <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="font-semibold text-teal-900">Today's Temperature Recorded:</span>
              <strong className="text-teal-700 text-sm font-mono font-bold">
                {todayTemp?.temperature}°C
              </strong>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                todayTemp?.isFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {todayTemp?.isFever ? 'Fever Detected' : 'Afebrile'}
            </span>
          </div>

          {/* Condition Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Clinical Condition
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Improving', 'Stable', 'Guarded', 'Critical'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setConditionSummary(status)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    conditionSummary === status
                      ? status === 'Critical'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : status === 'Guarded'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : status === 'Improving'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Vitals */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Vital Signs (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Pulse (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g. 74"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">BP (mmHg)</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Resp Rate (/min)</label>
                <input
                  type="number"
                  placeholder="e.g. 16"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Clinical Examination Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Progress & Examination Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => {
                setClinicalNotes(e.target.value);
                setErrorMsg('');
              }}
              required
              placeholder="Document patient symptoms, chest auscultation, systemic findings, and response to therapy..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
            />
          </div>

          {/* Treatment Given */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Medication & Treatment Administered
            </label>
            <input
              type="text"
              value={treatmentGiven}
              onChange={(e) => setTreatmentGiven(e.target.value)}
              placeholder="e.g. Oral Paracetamol 500mg TDS, Vitamin C, Hydration therapy"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
            >
              Save Daily Visit
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
