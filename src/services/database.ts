import type {
  Patient,
  TemperatureRecord,
  DoctorVisit,
  AuditLog,
  SystemConfig,
} from '../types';
import { SupabaseService } from './supabase';

// Convert DB row (snake_case) to UI Patient (camelCase)
export function rowToPatient(row: any): Patient {
  return {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    gender: row.gender,
    nationalId: row.national_id,
    contactPhone: row.contact_phone || '',
    emergencyContact: row.emergency_contact || '',
    admissionDate: row.admission_date,
    roomNumber: row.room_number,
    zone: row.zone,
    status: row.status,
    outcome: row.outcome || null,
    dischargeDate: row.discharge_date || undefined,
    dischargeApprovedDate: row.discharge_approved_date || undefined,
    dischargeApprovedByDoctor: row.discharge_approved_by_doctor || undefined,
    dischargeDoctorNotes: row.discharge_doctor_notes || undefined,
    deceasedDate: row.deceased_date || undefined,
    deceasedNotes: row.deceased_notes || undefined,
    symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
    medicalHistory: row.medical_history || '',
  };
}

// Convert UI Patient to DB row
export function patientToRow(p: Patient): any {
  return {
    id: p.id,
    full_name: p.fullName,
    age: p.age,
    gender: p.gender,
    national_id: p.nationalId,
    contact_phone: p.contactPhone,
    emergency_contact: p.emergencyContact,
    admission_date: p.admissionDate,
    room_number: p.roomNumber,
    zone: p.zone,
    status: p.status,
    outcome: p.outcome || null,
    discharge_date: p.dischargeDate || null,
    discharge_approved_date: p.dischargeApprovedDate || null,
    discharge_approved_by_doctor: p.dischargeApprovedByDoctor || null,
    discharge_doctor_notes: p.dischargeDoctorNotes || null,
    deceased_date: p.deceasedDate || null,
    deceased_notes: p.deceasedNotes || null,
    symptoms: p.symptoms || [],
    medical_history: p.medicalHistory || null,
  };
}

// Temperature conversions
export function rowToTemperature(row: any): TemperatureRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    roomNumber: row.room_number,
    date: row.date,
    temperature: typeof row.temperature === 'string' ? parseFloat(row.temperature) : row.temperature,
    isFever: Boolean(row.is_fever),
    recordedAt: row.recorded_at,
    recordedBy: row.recorded_by,
    isCorrected: Boolean(row.is_corrected),
    correctionReason: row.correction_reason || undefined,
    previousTemperature: row.previous_temperature ? (typeof row.previous_temperature === 'string' ? parseFloat(row.previous_temperature) : row.previous_temperature) : undefined,
    correctedAt: row.corrected_at || undefined,
    correctedBy: row.corrected_by || undefined,
  };
}

export function temperatureToRow(t: TemperatureRecord): any {
  return {
    id: t.id,
    patient_id: t.patientId,
    patient_name: t.patientName,
    room_number: t.roomNumber,
    date: t.date,
    temperature: t.temperature,
    is_fever: t.isFever,
    recorded_at: t.recordedAt,
    recorded_by: t.recordedBy,
    is_corrected: Boolean(t.isCorrected),
    correction_reason: t.correctionReason || null,
    previous_temperature: t.previousTemperature || null,
    corrected_at: t.correctedAt || null,
    corrected_by: t.correctedBy || null,
  };
}

// Doctor visit conversions
export function rowToVisit(row: any): DoctorVisit {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    roomNumber: row.room_number,
    date: row.date,
    visitedAt: row.visited_at,
    doctorName: row.doctor_name,
    clinicalNotes: row.clinical_notes,
    treatmentGiven: row.treatment_given,
    conditionSummary: row.condition_summary,
    vitals: row.vitals || undefined,
  };
}

export function visitToRow(v: DoctorVisit): any {
  return {
    id: v.id,
    patient_id: v.patientId,
    patient_name: v.patientName,
    room_number: v.roomNumber,
    date: v.date,
    visited_at: v.visitedAt,
    doctor_name: v.doctorName,
    clinical_notes: v.clinicalNotes,
    treatment_given: v.treatmentGiven,
    condition_summary: v.conditionSummary,
    vitals: v.vitals || null,
  };
}

// Audit log conversions
export function rowToAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    patientId: row.patient_id || undefined,
    patientName: row.patient_name || undefined,
    details: row.details,
  };
}

export function auditLogToRow(a: AuditLog): any {
  return {
    id: a.id,
    timestamp: a.timestamp,
    action: a.action,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    patient_id: a.patientId || null,
    patient_name: a.patientName || null,
    details: a.details,
  };
}

// Database Sync Service
export const DatabaseSyncService = {
  // Fetch everything from Supabase
  async fetchAll(): Promise<{
    patients: Patient[];
    temperatures: TemperatureRecord[];
    doctorVisits: DoctorVisit[];
    auditLogs: AuditLog[];
    config?: SystemConfig;
  } | null> {
    const client = SupabaseService.getClient();
    if (!client) return null;

    try {
      const [pRes, tRes, vRes, aRes, cRes] = await Promise.all([
        client.from('patients').select('*'),
        client.from('temperature_records').select('*'),
        client.from('doctor_visits').select('*'),
        client.from('audit_logs').select('*').order('timestamp', { ascending: false }),
        client.from('system_config').select('*').limit(1),
      ]);

      if (pRes.error || !pRes.data || pRes.data.length === 0) {
        return null;
      }

      const patients = pRes.data.map(rowToPatient);
      const temperatures = (tRes.data || []).map(rowToTemperature);
      const doctorVisits = (vRes.data || []).map(rowToVisit);
      const auditLogs = (aRes.data || []).map(rowToAuditLog);

      let config: SystemConfig | undefined;
      if (cRes.data && cRes.data.length > 0) {
        const c = cRes.data[0];
        config = {
          feverThreshold: typeof c.fever_threshold === 'string' ? parseFloat(c.fever_threshold) : c.fever_threshold,
          facilityMaxCapacity: c.facility_max_capacity,
          facilityName: c.facility_name,
          quarantineRequiredFeverFreeDays: c.quarantine_required_fever_free_days,
          currentSimulationDate: c.current_simulation_date,
        };
      }

      return { patients, temperatures, doctorVisits, auditLogs, config };
    } catch (err) {
      console.warn('Supabase fetchAll failed, continuing with local storage:', err);
      return null;
    }
  },

  // Save new patient to Supabase
  async savePatient(patient: Patient): Promise<void> {
    const client = SupabaseService.getClient();
    if (!client) return;
    try {
      const row = patientToRow(patient);
      await client.from('patients').upsert(row);
    } catch (err) {
      console.error('Error saving patient to Supabase:', err);
    }
  },

  // Save temperature record
  async saveTemperature(record: TemperatureRecord): Promise<void> {
    const client = SupabaseService.getClient();
    if (!client) return;
    try {
      const row = temperatureToRow(record);
      await client.from('temperature_records').upsert(row);
    } catch (err) {
      console.error('Error saving temperature to Supabase:', err);
    }
  },

  // Save doctor visit
  async saveDoctorVisit(visit: DoctorVisit): Promise<void> {
    const client = SupabaseService.getClient();
    if (!client) return;
    try {
      const row = visitToRow(visit);
      await client.from('doctor_visits').upsert(row);
    } catch (err) {
      console.error('Error saving doctor visit to Supabase:', err);
    }
  },

  // Save audit log
  async saveAuditLog(log: AuditLog): Promise<void> {
    const client = SupabaseService.getClient();
    if (!client) return;
    try {
      const row = auditLogToRow(log);
      await client.from('audit_logs').insert(row);
    } catch (err) {
      console.error('Error saving audit log to Supabase:', err);
    }
  },

  // Save configuration update
  async saveConfig(cfg: SystemConfig): Promise<void> {
    const client = SupabaseService.getClient();
    if (!client) return;
    try {
      await client.from('system_config').upsert({
        id: 'default_config',
        fever_threshold: cfg.feverThreshold,
        facility_max_capacity: cfg.facilityMaxCapacity,
        facility_name: cfg.facilityName,
        quarantine_required_fever_free_days: cfg.quarantineRequiredFeverFreeDays,
        current_simulation_date: cfg.currentSimulationDate,
      });
    } catch (err) {
      console.error('Error saving config to Supabase:', err);
    }
  },
};
