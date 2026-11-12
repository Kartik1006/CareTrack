import React from 'react';
import { Award, CheckCircle2, Bed, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';

interface FinalizeDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const FinalizeDischargeModal: React.FC<FinalizeDischargeModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { finalizeDischarge } = useApp();

  if (!patient) return null;

  const handleConfirm = () => {
    const res = finalizeDischarge(patient.id);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Finalize Discharge — Room ${patient.roomNumber}`}
      subtitle={`Patient: ${patient.fullName} (${patient.id}) • Wing: ${patient.zone}`}
      icon={<Award className="w-5 h-5 text-emerald-600" />}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Doctor Clearance Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Physician Sign-off Verified</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Approved by <strong>{patient.dischargeApprovedByDoctor || 'Attending Physician'}</strong> on{' '}
            {patient.dischargeApprovedDate ? new Date(patient.dischargeApprovedDate).toLocaleDateString() : 'Today'}.
          </p>
          {patient.dischargeDoctorNotes && (
            <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700 italic">
              "{patient.dischargeDoctorNotes}"
            </div>
          )}
        </div>

        {/* Room Release Alert */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Room {patient.roomNumber} Will Be Released</p>
              <p className="text-slate-500 text-[11px]">
                Upon confirmation, this bed returns to the available quarantine pool.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
            Ready to release
          </span>
        </div>

        {/* Confirmation Note */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Finalizing discharge will record the patient outcome as{' '}
          <strong className="text-emerald-700">Recovered</strong>, increment the facility treatment success
          metrics, and close the clinical case record.
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Discharge & Vacate Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

