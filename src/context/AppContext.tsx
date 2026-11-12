import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type {
  Patient,
  TemperatureRecord,
  DoctorVisit,
  AuditLog,
  SystemConfig,
  UserRole,
  ToastMessage,
  BedInfo,
} from '../types';
import { StorageService } from '../services/storage';
import { getZoneForRoom } from '../constants/mockData';
import {
  evaluateDischargeEligibility,
  calculateOutcomeMetrics,
  type DischargeEligibilityResult,
} from '../utils/clinicalCalculations';

interface AppContextType {
  // State
  patients: Patient[];
  temperatures: TemperatureRecord[];
  doctorVisits: DoctorVisit[];
  auditLogs: AuditLog[];
  config: SystemConfig;
  userRole: UserRole;
  currentStaffName: string;
  toasts: ToastMessage[];
  selectedPatientId: string | null;

  // Derived state
  admittedPatients: Patient[];
  pendingAdminDischarges: Patient[];
  dischargedPatients: Patient[];
  deceasedPatients: Patient[];
  occupiedBedsCount: number;
  availableBedsCount: number;
  isCapacityFull: boolean;
  bedsMatrix: BedInfo[];
  todayTemperatureStats: {
    totalRequired: number;
    completed: number;
    pending: number;
    feverCount: number;
    completionRate: number;
  };
  todayDoctorVisitStats: {
    totalRequired: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  outcomeMetrics: {
    totalRecovered: number;
    totalDeaths: number;
    totalCompletedOutcomes: number;
    treatmentSuccessRate: number;
    mortalityRate: number;
    isMortalityWarning: boolean;
  };

  // Actions
  setUserRole: (role: UserRole) => void;
  setSelectedPatientId: (id: string | null) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  admitPatient: (data: {
    fullName: string;
    age: number;
    gender: Patient['gender'];
    nationalId: string;
    contactPhone: string;
    emergencyContact: string;
    roomNumber: number;
    symptoms: string[];
    medicalHistory?: string;
  }) => { success: boolean; message: string; patientId?: string };

  recordTemperature: (
    patientId: string,
    temperature: number,
    isCorrection?: boolean,
    correctionReason?: string
  ) => { success: boolean; message: string };

  recordDoctorVisit: (data: {
    patientId: string;
    clinicalNotes: string;
    treatmentGiven: string;
    conditionSummary: DoctorVisit['conditionSummary'];
    vitals?: DoctorVisit['vitals'];
  }) => { success: boolean; message: string };

  approveDischarge: (patientId: string, doctorNotes: string) => { success: boolean; message: string };

  finalizeDischarge: (patientId: string) => { success: boolean; message: string };

  recordPatientDeceased: (patientId: string, deceasedNotes: string) => { success: boolean; message: string };

  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  resetToDemo: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;

  // Query helpers
  getPatientById: (id: string) => Patient | undefined;
  getPatientTemperatures: (id: string) => TemperatureRecord[];
  getPatientDoctorVisits: (id: string) => DoctorVisit[];
  getPatientEligibility: (patient: Patient) => DischargeEligibilityResult;
  hasTemperatureToday: (patientId: string) => boolean;
  getTodayTemperatureRecord: (patientId: string) => TemperatureRecord | undefined;
  hasDoctorVisitToday: (patientId: string) => boolean;
  getTodayDoctorVisit: (patientId: string) => DoctorVisit | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STAFF_NAMES: Record<UserRole, string> = {
  nurse: 'Nurse Jessica Hayes, RN',
  doctor: 'Dr. Sarah Lin, MD',
  admin: 'Admin Marcus Vance',
  management: 'Dr. Catherine Howard, Facility Director',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => StorageService.getPatients());
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>(() => StorageService.getTemperatures());
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>(() => StorageService.getDoctorVisits());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [config, setConfig] = useState<SystemConfig>(() => StorageService.getConfig());
  const [userRole, setUserRole] = useState<UserRole>('nurse');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    StorageService.savePatients(patients);
  }, [patients]);

  useEffect(() => {
    StorageService.saveTemperatures(temperatures);
  }, [temperatures]);

  useEffect(() => {
    StorageService.saveDoctorVisits(doctorVisits);
  }, [doctorVisits]);

  useEffect(() => {
    StorageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    StorageService.saveConfig(config);
  }, [config]);

  // Toast Helpers
  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to append audit log
  const logAudit = (
    action: AuditLog['action'],
    details: string,
    patientId?: string,
    patientName?: string
  ) => {
    const newLog: AuditLog = {
      id: 'AUD-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      timestamp: new Date().toISOString(),
      action,
      actorName: STAFF_NAMES[userRole],
      actorRole: userRole,
      patientId,
      patientName,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Current Staff Name
  const currentStaffName = STAFF_NAMES[userRole];

  // Derived state
  const admittedPatients = useMemo(
    () => patients.filter((p) => p.status === 'admitted' || p.status === 'discharge_pending_admin'),
    [patients]
  );

  const pendingAdminDischarges = useMemo(
    () => patients.filter((p) => p.status === 'discharge_pending_admin'),
    [patients]
  );

  const dischargedPatients = useMemo(
    () => patients.filter((p) => p.status === 'discharged'),
    [patients]
  );

  const deceasedPatients = useMemo(
    () => patients.filter((p) => p.status === 'deceased'),
    [patients]
  );

  const occupiedBedsCount = admittedPatients.length;
  const availableBedsCount = Math.max(0, config.facilityMaxCapacity - occupiedBedsCount);
  const isCapacityFull = occupiedBedsCount >= config.facilityMaxCapacity;

  // Beds Matrix (1 to 74)
  const bedsMatrix = useMemo<BedInfo[]>(() => {
    const matrix: BedInfo[] = [];
    const occupiedMap = new Map<number, Patient>();
    for (const p of admittedPatients) {
      occupiedMap.set(p.roomNumber, p);
    }

    for (let room = 1; room <= config.facilityMaxCapacity; room++) {
      const occupant = occupiedMap.get(room);
      const isOccupied = Boolean(occupant);
      let status: BedInfo['status'] = 'available';
      if (occupant) {
        status = occupant.status === 'discharge_pending_admin' ? 'discharge_ready' : 'occupied';
      }
      matrix.push({
        roomNumber: room,
        zone: getZoneForRoom(room),
        patientId: occupant?.id,
        patientName: occupant?.fullName,
        isOccupied,
        status,
      });
    }
    return matrix;
  }, [admittedPatients, config.facilityMaxCapacity]);

  // Today Temperature Stats
  const todayTemperatureStats = useMemo(() => {
    const totalRequired = admittedPatients.length;
    let completed = 0;
    let feverCount = 0;

    for (const p of admittedPatients) {
      const reading = temperatures.find(
        (t) => t.patientId === p.id && t.date === config.currentSimulationDate
      );
      if (reading) {
        completed++;
        if (reading.temperature >= config.feverThreshold) {
          feverCount++;
        }
      }
    }

    const pending = totalRequired - completed;
    const completionRate = totalRequired > 0 ? Number(((completed / totalRequired) * 100).toFixed(1)) : 100;

    return { totalRequired, completed, pending, feverCount, completionRate };
  }, [admittedPatients, temperatures, config.currentSimulationDate, config.feverThreshold]);

  // Today Doctor Visit Stats
  const todayDoctorVisitStats = useMemo(() => {
    const totalRequired = admittedPatients.length;
    let completed = 0;

    for (const p of admittedPatients) {
      const visit = doctorVisits.find(
        (v) => v.patientId === p.id && v.date === config.currentSimulationDate
      );
      if (visit) {
        completed++;
      }
    }

    const pending = totalRequired - completed;
    const completionRate = totalRequired > 0 ? Number(((completed / totalRequired) * 100).toFixed(1)) : 100;

    return { totalRequired, completed, pending, completionRate };
  }, [admittedPatients, doctorVisits, config.currentSimulationDate]);

  // Outcome Metrics
  const outcomeMetrics = useMemo(() => {
    return calculateOutcomeMetrics(patients);
  }, [patients]);

  // Query helpers
  const getPatientById = (id: string): Patient | undefined => {
    return patients.find((p) => p.id === id);
  };

  const getPatientTemperatures = (id: string): TemperatureRecord[] => {
    return temperatures
      .filter((t) => t.patientId === id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.recordedAt.localeCompare(a.recordedAt));
  };

  const getPatientDoctorVisits = (id: string): DoctorVisit[] => {
    return doctorVisits
      .filter((v) => v.patientId === id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.visitedAt.localeCompare(a.visitedAt));
  };

  const getPatientEligibility = (patient: Patient): DischargeEligibilityResult => {
    return evaluateDischargeEligibility(
      patient,
      temperatures,
      config.feverThreshold,
      config.quarantineRequiredFeverFreeDays,
      config.currentSimulationDate, doctorVisits
    );
  };

  const hasTemperatureToday = (patientId: string): boolean => {
    return temperatures.some(
      (t) => t.patientId === patientId && t.date === config.currentSimulationDate
    );
  };

  const getTodayTemperatureRecord = (patientId: string): TemperatureRecord | undefined => {
    return temperatures.find(
      (t) => t.patientId === patientId && t.date === config.currentSimulationDate
    );
  };

  const hasDoctorVisitToday = (patientId: string): boolean => {
    return doctorVisits.some(
      (v) => v.patientId === patientId && v.date === config.currentSimulationDate
    );
  };

  const getTodayDoctorVisit = (patientId: string): DoctorVisit | undefined => {
    return doctorVisits.find(
      (v) => v.patientId === patientId && v.date === config.currentSimulationDate
    );
  };

  const reject = (message: string) => {
    showToast('error', 'Action blocked', message);
    return { success: false, message };
  };
  const active = (p: Patient) => p.status === 'admitted' || p.status === 'discharge_pending_admin';

  // BUSINESS ACTIONS

  // 1. Admit Patient (Admin)
  const admitPatient = (data: {
    fullName: string;
    age: number;
    gender: Patient['gender'];
    nationalId: string;
    contactPhone: string;
    emergencyContact: string;
    roomNumber: number;
    symptoms: string[];
    medicalHistory?: string;
  }) => {
    if (userRole !== 'admin') return reject('Only administrators can admit patients.');
    if (!data.fullName.trim() || !data.nationalId.trim() || !data.contactPhone.trim() || !data.emergencyContact.trim() ||
      !Number.isInteger(data.age) || data.age < 0 || data.age > 120 || !Number.isInteger(data.roomNumber)) return reject('Complete all required fields with valid values.');
    if (admittedPatients.some(p => p.nationalId.toLowerCase() === data.nationalId.trim().toLowerCase())) return reject('This patient is already admitted.');
    if (isCapacityFull) {
      showToast('error', 'Admission Blocked', `Facility is at maximum capacity (${config.facilityMaxCapacity}/${config.facilityMaxCapacity} beds). Discharge or transfer a patient to release a room.`);
      return { success: false, message: 'Facility capacity reached (74/74).' };
    }

    if (data.roomNumber < 1 || data.roomNumber > config.facilityMaxCapacity) {
      showToast('error', 'Invalid Room', `Room must be between 1 and ${config.facilityMaxCapacity}.`);
      return { success: false, message: `Room must be between 1 and ${config.facilityMaxCapacity}.` };
    }

    // Check if room is already occupied
    const isOccupied = admittedPatients.some((p) => p.roomNumber === data.roomNumber);
    if (isOccupied) {
      showToast('error', 'Room Occupied', `Room ${data.roomNumber} is already occupied by an admitted patient.`);
      return { success: false, message: `Room ${data.roomNumber} is already occupied.` };
    }

    const patientId = 'CT-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const newPatient: Patient = {
      id: patientId,
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      nationalId: data.nationalId,
      contactPhone: data.contactPhone,
      emergencyContact: data.emergencyContact,
      admissionDate: config.currentSimulationDate,
      roomNumber: data.roomNumber,
      zone: getZoneForRoom(data.roomNumber),
      status: 'admitted',
      symptoms: data.symptoms,
      medicalHistory: data.medicalHistory,
    };

    setPatients((prev) => [newPatient, ...prev]);

    logAudit(
      'PATIENT_ADMITTED',
      `Admitted patient ${data.fullName} (Age ${data.age}) to Room ${data.roomNumber} (${getZoneForRoom(data.roomNumber)}).`,
      patientId,
      data.fullName
    );

    showToast('success', 'Patient Admitted', `${data.fullName} successfully admitted to Room ${data.roomNumber}.`);
    return { success: true, message: 'Patient admitted successfully.', patientId };
  };

  // 2. Record Temperature (Nurse)
  const recordTemperature = (
    patientId: string,
    temp: number,
    isCorrection = false,
    correctionReason?: string
  ) => {
    if (userRole !== 'nurse') return reject('Only nurses can record or correct temperatures.');
    if (!Number.isFinite(temp) || temp < 32 || temp > 43) return reject('Temperature must be between 32 and 43°C.');
    if (isCorrection && !correctionReason?.trim()) return reject('A correction reason is required.');
    const patient = getPatientById(patientId);
    if (patient && !active(patient)) return reject('Patient is no longer admitted.');
    if (!patient) {
      showToast('error', 'Patient Not Found', 'The requested patient could not be located.');
      return { success: false, message: 'Patient not found.' };
    }

    if (temp < 32.0 || temp > 43.0) {
      showToast('warning', 'Unusual Reading', 'Please verify temperature. Standard physiological range is 32.0°C - 43.0°C.');
    }

    const isFever = temp >= config.feverThreshold;
    const existing = getTodayTemperatureRecord(patientId);

    if (existing && !isCorrection) {
      showToast(
        'error',
        'Duplicate Reading Blocked',
        `A temperature of ${existing.temperature}°C was already recorded for ${patient.fullName} today. Use "Authorized Correction" if modifying.`
      );
      return {
        success: false,
        message: `Temperature already recorded today (${existing.temperature}°C). Authorized correction required to modify.`,
      };
    }

    if (existing && isCorrection) {
      // Authorized correction
      const previousTemp = existing.temperature;
      const updatedRecord: TemperatureRecord = {
        ...existing,
        temperature: Number(temp.toFixed(1)),
        isFever,
        isCorrected: true,
        correctionReason: correctionReason || 'Staff correction',
        previousTemperature: previousTemp,
        correctedAt: new Date().toISOString(),
        correctedBy: currentStaffName,
      };

      setTemperatures((prev) => prev.map((t) => (t.id === existing.id ? updatedRecord : t)));

      logAudit(
        'TEMPERATURE_CORRECTED',
        `Authorized temperature correction: ${previousTemp}°C -> ${temp.toFixed(1)}°C. Reason: ${correctionReason || 'Not specified'}. Recorded by: ${currentStaffName}.`,
        patient.id,
        patient.fullName
      );

      showToast(
        'info',
        'Temperature Corrected',
        `Updated reading to ${temp.toFixed(1)}°C for ${patient.fullName}. Audit trail updated.`
      );
      return { success: true, message: 'Temperature corrected successfully.' };
    }

    // New reading
    const newRecord: TemperatureRecord = {
      id: 'TR-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      patientId: patient.id,
      patientName: patient.fullName,
      roomNumber: patient.roomNumber,
      date: config.currentSimulationDate,
      temperature: Number(temp.toFixed(1)),
      isFever,
      recordedAt: new Date().toISOString(),
      recordedBy: currentStaffName,
    };

    setTemperatures((prev) => [newRecord, ...prev]);

    logAudit(
      'TEMPERATURE_RECORDED',
      `Recorded morning temperature: ${temp.toFixed(1)}°C (${isFever ? 'FEVER DETECTED - Alert Triggered' : 'Normal / Afebrile'}).`,
      patient.id,
      patient.fullName
    );

    if (isFever) {
      showToast('warning', 'Fever Flagged', `${patient.fullName} has recorded ${temp.toFixed(1)}°C (>= ${config.feverThreshold}°C). Notified medical team.`);
    } else {
      showToast('success', 'Reading Recorded', `Recorded ${temp.toFixed(1)}°C for ${patient.fullName}.`);
    }

    return { success: true, message: 'Temperature recorded successfully.' };
  };

  // 3. Record Doctor Visit (Doctor)
  const recordDoctorVisit = (data: {
    patientId: string;
    clinicalNotes: string;
    treatmentGiven: string;
    conditionSummary: DoctorVisit['conditionSummary'];
    vitals?: DoctorVisit['vitals'];
  }) => {
    if (userRole !== 'doctor') return reject('Only doctors can record visits.');
    if (!data.clinicalNotes.trim() || !data.treatmentGiven.trim()) return reject('Clinical notes and treatment are required.');
    const patient = getPatientById(data.patientId);
    if (patient && !active(patient)) return reject('Patient is no longer admitted.');
    if (!patient) {
      showToast('error', 'Patient Not Found', 'Patient does not exist.');
      return { success: false, message: 'Patient not found.' };
    }

    // CRITICAL RULE 1: Doctor visit only after today's temperature is recorded!
    if (!hasTemperatureToday(patient.id)) {
      showToast(
        'error',
        'Protocol Violation',
        `Cannot complete doctor visit for ${patient.fullName}: Today's temperature reading is still pending from nursing staff.`
      );
      return {
        success: false,
        message: "Cannot conduct visit before today's temperature has been logged.",
      };
    }

    // CRITICAL RULE 2: Prevent completed visits from being recorded twice!
    if (hasDoctorVisitToday(patient.id)) {
      showToast(
        'error',
        'Duplicate Visit Blocked',
        `A daily doctor round has already been completed for ${patient.fullName} today (${config.currentSimulationDate}).`
      );
      return {
        success: false,
        message: 'Doctor visit already completed for today.',
      };
    }

    const newVisit: DoctorVisit = {
      id: 'DV-' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      patientId: patient.id,
      patientName: patient.fullName,
      roomNumber: patient.roomNumber,
      date: config.currentSimulationDate,
      visitedAt: new Date().toISOString(),
      doctorName: currentStaffName,
      clinicalNotes: data.clinicalNotes,
      treatmentGiven: data.treatmentGiven,
      conditionSummary: data.conditionSummary,
      vitals: data.vitals,
    };

    setDoctorVisits((prev) => [newVisit, ...prev]);

    logAudit(
      'DOCTOR_VISIT_RECORDED',
      `Completed clinical round. Condition: ${data.conditionSummary}. Notes: ${data.clinicalNotes.substring(0, 80)}...`,
      patient.id,
      patient.fullName
    );

    showToast('success', 'Doctor Visit Logged', `Clinical round logged for ${patient.fullName}.`);
    return { success: true, message: 'Doctor visit logged successfully.' };
  };

  // 4. Doctor Approves Discharge (Doctor)
  const approveDischarge = (patientId: string, doctorNotes: string) => {
    if (userRole !== 'doctor') return reject('Only doctors can approve discharge.');
    if (!doctorNotes.trim()) return reject('Discharge notes are required.');
    if (!hasTemperatureToday(patientId) || !hasDoctorVisitToday(patientId)) return reject("Complete today's temperature and doctor visit first.");
    const patient = getPatientById(patientId);
    if (!patient) return { success: false, message: 'Patient not found.' };

    const eligibility = getPatientEligibility(patient);
    if (!eligibility.isEligible) return reject(eligibility.reason);


    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'discharge_pending_admin',
              dischargeApprovedDate: new Date().toISOString(),
              dischargeApprovedByDoctor: currentStaffName,
              dischargeDoctorNotes: doctorNotes,
            }
          : p
      )
    );

    logAudit(
      'DISCHARGE_APPROVED_DOCTOR',
      `Doctor approved discharge. Assessment: ${doctorNotes}. Dispatched to Administrator Queue for final bed release.`,
      patient.id,
      patient.fullName
    );

    showToast(
      'info',
      'Discharge Approved',
      `${patient.fullName} approved for discharge. In-app notification sent to Administration queue.`
    );
    return { success: true, message: 'Discharge approved and sent to Administration queue.' };
  };

  // 5. Finalize Discharge & Release Room (Administrator)
  const finalizeDischarge = (patientId: string) => {
    if (userRole !== 'admin') return reject('Only administrators can finalize discharge.');
    const patient = getPatientById(patientId);
    if (!patient) return { success: false, message: 'Patient not found.' };

    if (patient.status !== 'discharge_pending_admin') {
      showToast('error', 'Pending Doctor Clearance', 'Only patients with prior Doctor approval can be finalized for discharge.');
      return { success: false, message: 'Requires doctor approval first.' };
    }

    const review = evaluateDischargeEligibility({...patient, status: 'admitted'}, temperatures, config.feverThreshold, 3, config.currentSimulationDate, doctorVisits);
    if (!review.isEligible || !hasTemperatureToday(patientId) || !hasDoctorVisitToday(patientId)) return reject('Clinical criteria changed or daily care is pending. Doctor review required.');
    if (!active(patient)) return reject('Patient already has a completed outcome.');
    const releasedRoom = patient.roomNumber;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'discharged',
              outcome: 'recovered',
              dischargeDate: config.currentSimulationDate,
            }
          : p
      )
    );

    logAudit(
      'DISCHARGE_FINALIZED_ADMIN',
      `Administrator finalized discharge for ${patient.fullName}. Room ${releasedRoom} (${getZoneForRoom(releasedRoom)}) is now vacant for next admission. Outcome: Recovered.`,
      patient.id,
      patient.fullName
    );

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // non-blocking
    }

    showToast(
      'success',
      'Discharge Completed & Room Released',
      `${patient.fullName} discharged (Recovered). Room ${releasedRoom} is now immediately available for new admissions!`
    );

    return { success: true, message: `Discharge complete. Room ${releasedRoom} released.` };
  };

  // 6. Record Mortality (Doctor / Admin)
  const recordPatientDeceased = (patientId: string, deceasedNotes: string) => {
    if (userRole !== 'doctor') return reject('Only doctors can record a death.');
    if (!deceasedNotes.trim()) return reject('Clinical outcome notes are required.');
    const patient = getPatientById(patientId);
    if (!patient) return { success: false, message: 'Patient not found.' };

    if (!active(patient)) return reject('Patient already has a completed outcome.');
    const releasedRoom = patient.roomNumber;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'deceased',
              outcome: 'deceased',
              dischargeDate: config.currentSimulationDate,
              deceasedDate: new Date().toISOString(),
              deceasedNotes,
            }
          : p
      )
    );

    logAudit(
      'PATIENT_DECEASED',
      `Patient recorded as deceased. Clinical notes: ${deceasedNotes}. Room ${releasedRoom} released. Outcome: Deceased.`,
      patient.id,
      patient.fullName
    );

    showToast(
      'warning',
      'Outcome Recorded: Deceased',
      `Deceased outcome recorded for ${patient.fullName}. Room ${releasedRoom} released. Facility mortality surveillance metrics updated.`
    );

    return { success: true, message: 'Outcome recorded.' };
  };

  // Config Update
  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    if (userRole !== 'admin') { reject('Only administrators can change facility settings.'); return; }
    const updated = {...config, ...newConfig, facilityMaxCapacity: 74, quarantineRequiredFeverFreeDays: 3};
    if (!Number.isFinite(updated.feverThreshold) || updated.feverThreshold < 36 || updated.feverThreshold > 40 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(updated.currentSimulationDate) || !Number.isFinite(Date.parse(updated.currentSimulationDate))) {
      reject('Enter a valid date and threshold between 36 and 40°C.'); return;
    }
    setConfig(updated);
    logAudit('CONFIG_UPDATED', `Threshold: ${updated.feverThreshold}°C; demo date: ${updated.currentSimulationDate}.`);
    showToast('info', 'Configuration Updated', 'System parameters updated.');
  };

  // Reset to Demo
  const resetToDemo = () => {
    if (userRole !== 'admin') { reject('Only administrators can reset facility data.'); return; }
    StorageService.resetToDemo();
    setPatients(StorageService.getPatients());
    setTemperatures(StorageService.getTemperatures());
    setDoctorVisits(StorageService.getDoctorVisits());
    setAuditLogs(StorageService.getAuditLogs());
    setConfig(StorageService.getConfig());

    showToast('info', 'Demo Data Reset', 'Facility database restored to default canonical simulation state.');
  };

  // Export Data
  const exportData = () => {
    return StorageService.exportFullBackup();
  };

  // Import Data
  const importData = (jsonString: string) => {
    if (userRole !== 'admin') { reject('Only administrators can restore backups.'); return false; }
    const ok = StorageService.importBackup(jsonString);
    if (ok) {
      setPatients(StorageService.getPatients());
      setTemperatures(StorageService.getTemperatures());
      setDoctorVisits(StorageService.getDoctorVisits());
      setAuditLogs(StorageService.getAuditLogs());
      setConfig(StorageService.getConfig());
      showToast('success', 'Data Restored', 'Facility backup loaded successfully.');
      return true;
    }
    showToast('error', 'Import Failed', 'Invalid JSON backup format.');
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        temperatures,
        doctorVisits,
        auditLogs,
        config,
        userRole,
        currentStaffName,
        toasts,
        selectedPatientId,
        admittedPatients,
        pendingAdminDischarges,
        dischargedPatients,
        deceasedPatients,
        occupiedBedsCount,
        availableBedsCount,
        isCapacityFull,
        bedsMatrix,
        todayTemperatureStats,
        todayDoctorVisitStats,
        outcomeMetrics,
        setUserRole,
        setSelectedPatientId,
        showToast,
        removeToast,
        admitPatient,
        recordTemperature,
        recordDoctorVisit,
        approveDischarge,
        finalizeDischarge,
        recordPatientDeceased,
        updateConfig,
        resetToDemo,
        exportData,
        importData,
        getPatientById,
        getPatientTemperatures,
        getPatientDoctorVisits,
        getPatientEligibility,
        hasTemperatureToday,
        getTodayTemperatureRecord,
        hasDoctorVisitToday,
        getTodayDoctorVisit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
