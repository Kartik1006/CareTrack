export type UserRole = 'nurse' | 'doctor' | 'admin' | 'management';

export type PatientStatus = 
  | 'admitted'
  | 'discharge_pending_admin'
  | 'discharged'
  | 'deceased';

export type TreatmentOutcome = 'recovered' | 'deceased' | null;

export type Gender = 'Male' | 'Female' | 'Other';

export interface TemperatureRecord {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: number;
  date: string; // YYYY-MM-DD
  temperature: number; // in °C
  isFever: boolean; // >= feverThreshold
  recordedAt: string; // ISO string
  recordedBy: string; // Staff name
  isCorrected?: boolean;
  correctionReason?: string;
  previousTemperature?: number;
  correctedAt?: string;
  correctedBy?: string;
}

export interface DoctorVisit {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: number;
  date: string; // YYYY-MM-DD
  visitedAt: string; // ISO string
  doctorName: string;
  clinicalNotes: string;
  treatmentGiven: string;
  conditionSummary: 'Improving' | 'Stable' | 'Guarded' | 'Critical';
  vitals?: {
    pulse?: number;
    spo2?: number; // %
    bp?: string; // e.g. 120/80
    respiratoryRate?: number;
  };
}

export interface Patient {
  id: string; // e.g. "CT-042"
  fullName: string;
  age: number;
  gender: Gender;
  nationalId: string;
  contactPhone: string;
  emergencyContact: string;
  admissionDate: string; // YYYY-MM-DD
  roomNumber: number; // 1 to 74
  zone: 'Wing A' | 'Wing B' | 'Wing C';
  status: PatientStatus;
  outcome?: TreatmentOutcome;
  dischargeDate?: string;
  dischargeApprovedDate?: string;
  dischargeApprovedByDoctor?: string;
  dischargeDoctorNotes?: string;
  deceasedDate?: string;
  deceasedNotes?: string;
  symptoms: string[];
  medicalHistory?: string;
}

export interface BedInfo {
  roomNumber: number; // 1 to 74
  zone: 'Wing A' | 'Wing B' | 'Wing C';
  patientId?: string;
  patientName?: string;
  isOccupied: boolean;
  status: 'available' | 'occupied' | 'discharge_ready';
}

export type AuditActionType =
  | 'PATIENT_ADMITTED'
  | 'TEMPERATURE_RECORDED'
  | 'TEMPERATURE_CORRECTED'
  | 'DOCTOR_VISIT_RECORDED'
  | 'DISCHARGE_APPROVED_DOCTOR'
  | 'DISCHARGE_FINALIZED_ADMIN'
  | 'PATIENT_DECEASED'
  | 'CONFIG_UPDATED'
  | 'DEMO_DATA_RESET';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  action: AuditActionType;
  actorName: string;
  actorRole: UserRole;
  patientId?: string;
  patientName?: string;
  details: string;
}

export interface SystemConfig {
  feverThreshold: number; // default 38.0
  facilityMaxCapacity: number; // strictly 74
  facilityName: string;
  quarantineRequiredFeverFreeDays: number; // strictly 3
  currentSimulationDate: string; // YYYY-MM-DD (simulated date)
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

