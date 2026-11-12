import React, { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';

interface DischargeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const DischargeApprovalModal: React.FC<DischargeApprovalModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { approveDischarge, getPatientEligibility, config } = useApp();

  const [doctorNotes, setDoctorNotes] = useState(
    'Patient has completed required 3 consecutive fever-free days. Clinical status is fully recovered with no residual respiratory symptoms. Cleared for administrative discharge.'
  );
  const [errorMsg, setErrorMsg] = useState('');

  if (!patient) return null;

  const eligibility = getPatientEligibility(patient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorNotes.trim()) {
      setErrorMsg('Clinical discharge signoff notes are required.');
      return;
    }

    const result = approveDischarge(patient.id, doctorNotes);
    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Medical Discharge Approval — Room ${patient.roomNumber}`}
      subtitle={`Patient: ${patient.fullName} (${patient.id}) • Wing: ${patient.zone}`}
      icon={<Award className="w-5 h-5 text-emerald-600" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Eligibility Verification Card */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Discharge Criteria Met
            </span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
              {eligibility.consecutiveFeverFreeDays} / {config.quarantineRequiredFeverFreeDays} Days Afebrile
            </span>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">
            Patient has maintained body temperatures consistently below the quarantine threshold
            (<strong>{config.feverThreshold}°C</strong>) across consecutive complete observation days.
          </p>

          {/* Mini cards for recent readings */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {eligibility.recentReadings.slice(0, 3).map((r, i) => (
              <div
                key={i}
                className="bg-white p-2 rounded-lg border border-emerald-200 text-center text-xs"
              >
                <span className="text-[10px] text-slate-500 block">{r.date.slice(5)}</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {r.temperature.toFixed(1)}°C
                </span>
                <span className="text-[9px] text-emerald-600 block font-medium">Afebrile ✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow clarification note */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p>
            Upon your sign-off, this patient will move to the{' '}
            <strong className="text-slate-800">Administrator Discharge Queue</strong>. The administrator
            will finalize paperwork and automatically release Room {patient.roomNumber} for new quarantine admissions.
          </p>
        </div>

        {/* Doctor Assessment / Discharge Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Physician Discharge Assessment & Instructions <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={doctorNotes}
            onChange={(e) => {
              setDoctorNotes(e.target.value);
              setErrorMsg('');
            }}
            required
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
          />
        </div>

        {errorMsg && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {errorMsg}
          </p>
        )}

        {/* Action buttons */}
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
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
          >
            <span>Approve & Dispatch to Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </Modal>
  );
};

