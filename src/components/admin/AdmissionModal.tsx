import React, { useState, useEffect } from 'react';
import { UserPlus, ShieldAlert, Bed } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { getZoneForRoom } from '../../constants/mockData';
import type { Patient } from '../../types';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoom?: number | null;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  preselectedRoom,
}) => {
  const { admitPatient, bedsMatrix, isCapacityFull, config } = useApp();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('Male');
  const [nationalId, setNationalId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [roomNumber, setRoomNumber] = useState<number>(1);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find available rooms
  const availableBeds = bedsMatrix.filter((b) => !b.isOccupied);

  useEffect(() => {
    if (preselectedRoom) {
      setRoomNumber(preselectedRoom);
    } else if (availableBeds.length > 0) {
      setRoomNumber(availableBeds[0].roomNumber);
    }
  }, [preselectedRoom, availableBeds.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !age || !nationalId.trim()) {
      setErrorMsg('Full Name, Age, and National ID are mandatory fields.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }

    const symptomsList = symptomsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const result = admitPatient({
      fullName: fullName.trim(),
      age: ageNum,
      gender,
      nationalId: nationalId.trim(),
      contactPhone: contactPhone.trim() || 'N/A',
      emergencyContact: emergencyContact.trim() || 'Facility Care Protocol',
      roomNumber,
      symptoms: symptomsList.length > 0 ? symptomsList : ['Quarantine Observation'],
      medicalHistory: medicalHistory.trim() || 'None recorded on intake.',
    });

    if (result.success) {
      onClose();
      // Reset form
      setFullName('');
      setAge('');
      setNationalId('');
      setContactPhone('');
      setEmergencyContact('');
      setSymptomsInput('');
      setMedicalHistory('');
      setErrorMsg('');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quarantine Intake & Bed Assignment"
      subtitle={`Quarantine Facility • Capacity Limit: ${config.facilityMaxCapacity} Beds`}
      icon={<UserPlus className="w-5 h-5 text-teal-600" />}
      maxWidth="lg"
    >
      {isCapacityFull ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Facility at Maximum Quarantine Capacity ({config.facilityMaxCapacity} / {config.facilityMaxCapacity})
              </h4>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                All 74 isolation rooms are currently occupied. Institutional protocol prevents any further intake
                until a patient is medically discharged by administration or transferred to another hospital.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-rose-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Selection Banner */}
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600" />
              <span className="font-semibold text-teal-900">Assigned Isolation Bed:</span>
              <span className="font-bold text-teal-700 font-mono text-sm">
                Room {roomNumber} ({getZoneForRoom(roomNumber)})
              </span>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md font-medium">
              {availableBeds.length} of {config.facilityMaxCapacity} Beds Available
            </span>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rachel Sterling"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  placeholder="38"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                National ID / Health ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ID-9821034"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Bed / Room # (1 - {config.facilityMaxCapacity})
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(parseInt(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-teal-800"
              >
                {availableBeds.map((bed) => (
                  <option key={bed.roomNumber} value={bed.roomNumber}>
                    Room {bed.roomNumber} — {bed.zone} (Vacant)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                placeholder="Name & Relationship (Phone)"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Symptoms on Intake (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Mild fever, dry cough, loss of smell"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Medical History / Pre-existing Conditions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Asthma, diabetes, hypertension, allergies..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
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
              className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Complete Admission & Assign Bed
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
