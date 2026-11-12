import type {
  Patient,
  TemperatureRecord,
  DoctorVisit,
  AuditLog,
  SystemConfig,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_TEMPERATURE_RECORDS,
  INITIAL_DOCTOR_VISITS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONFIG,
} from '../constants/mockData';

const KEYS = {
  PATIENTS: 'caretrack_patients_v1',
  TEMPERATURES: 'caretrack_temperatures_v1',
  DOCTOR_VISITS: 'caretrack_doctor_visits_v1',
  AUDIT_LOGS: 'caretrack_audit_logs_v1',
  CONFIG: 'caretrack_config_v1',
  SUPABASE_SETTINGS: 'caretrack_supabase_settings_v1',
};

export interface SupabaseSettings {
  url: string;
  anonKey: string;
  autoSync: boolean;
  isConnected?: boolean;
}

export const StorageService = {
  getPatients(): Patient[] {
    const raw = localStorage.getItem(KEYS.PATIENTS);
    if (!raw) {
      this.savePatients(INITIAL_PATIENTS);
      return INITIAL_PATIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  },

  getTemperatures(): TemperatureRecord[] {
    const raw = localStorage.getItem(KEYS.TEMPERATURES);
    if (!raw) {
      this.saveTemperatures(INITIAL_TEMPERATURE_RECORDS);
      return INITIAL_TEMPERATURE_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TEMPERATURE_RECORDS;
    }
  },

  saveTemperatures(records: TemperatureRecord[]): void {
    localStorage.setItem(KEYS.TEMPERATURES, JSON.stringify(records));
  },

  getDoctorVisits(): DoctorVisit[] {
    const raw = localStorage.getItem(KEYS.DOCTOR_VISITS);
    if (!raw) {
      this.saveDoctorVisits(INITIAL_DOCTOR_VISITS);
      return INITIAL_DOCTOR_VISITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DOCTOR_VISITS;
    }
  },

  saveDoctorVisits(visits: DoctorVisit[]): void {
    localStorage.setItem(KEYS.DOCTOR_VISITS, JSON.stringify(visits));
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
    if (!raw) {
      this.saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  saveAuditLogs(logs: AuditLog[]): void {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  getConfig(): SystemConfig {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (!raw) {
      this.saveConfig(INITIAL_CONFIG);
      return INITIAL_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONFIG;
    }
  },

  saveConfig(config: SystemConfig): void {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getSupabaseSettings(): SupabaseSettings {
    const raw = localStorage.getItem(KEYS.SUPABASE_SETTINGS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return {
          url: parsed.url || import.meta.env.VITE_SUPABASE_URL || '',
          anonKey: parsed.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
          isConnected: parsed.isConnected,
        };
      } catch {
        // fallback
      }
    }
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      autoSync: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    };
  },

  saveSupabaseSettings(settings: SupabaseSettings): void {
    localStorage.setItem(KEYS.SUPABASE_SETTINGS, JSON.stringify(settings));
  },

  resetToDemo(): void {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(KEYS.TEMPERATURES, JSON.stringify(INITIAL_TEMPERATURE_RECORDS));
    localStorage.setItem(KEYS.DOCTOR_VISITS, JSON.stringify(INITIAL_DOCTOR_VISITS));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
  },

  exportFullBackup(): string {
    const dump = {
      exportedAt: new Date().toISOString(),
      patients: this.getPatients(),
      temperatures: this.getTemperatures(),
      doctorVisits: this.getDoctorVisits(),
      auditLogs: this.getAuditLogs(),
      config: this.getConfig(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !['patients', 'temperatures', 'doctorVisits', 'auditLogs'].every(k => Array.isArray(data[k]))) return false;
      const c = data.config;
      if (!c || c.facilityMaxCapacity !== 74 || c.quarantineRequiredFeverFreeDays !== 3 ||
          !Number.isFinite(c.feverThreshold) || c.feverThreshold < 36 || c.feverThreshold > 40 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(c.currentSimulationDate) || typeof c.facilityName !== 'string') return false;
      const unique = (values: string[]) => new Set(values).size === values.length;
      const validDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));
      if (!unique(data.patients.map((p: Patient) => p.id)) || data.patients.some((p: Patient) =>
        !p || !['id','fullName','nationalId','contactPhone','emergencyContact'].every(k => typeof (p as unknown as Record<string,unknown>)[k] === 'string') ||
        !Number.isInteger(p.age) || p.age < 0 || p.age > 120 || !Number.isInteger(p.roomNumber) || p.roomNumber < 1 || p.roomNumber > 74 ||
        !['Male','Female','Other'].includes(p.gender) || !['Wing A','Wing B','Wing C'].includes(p.zone) ||
        !['admitted','discharge_pending_admin','discharged','deceased'].includes(p.status) ||
        !validDate(p.admissionDate) || !Array.isArray(p.symptoms) || p.symptoms.some(x => typeof x !== 'string'))) return false;
      const active = data.patients.filter((p: Patient) => ['admitted','discharge_pending_admin'].includes(p.status));
      if (active.length > 74 || !unique(active.map((p: Patient) => String(p.roomNumber)))) return false;
      const ids = new Set(data.patients.map((p: Patient) => p.id));
      for (const list of [data.temperatures, data.doctorVisits]) {
        if (!unique(list.map((r: TemperatureRecord) => r.id)) || !unique(list.map((r: TemperatureRecord) => `${r.patientId}:${r.date}`)) ||
          list.some((r: TemperatureRecord) => !r || !ids.has(r.patientId) || !validDate(r.date) || typeof r.patientName !== 'string')) return false;
      }
      if (data.temperatures.some((t: TemperatureRecord) => !Number.isFinite(t.temperature) || t.temperature < 32 || t.temperature > 43 || typeof t.recordedAt !== 'string' || typeof t.recordedBy !== 'string')) return false;
      if (data.doctorVisits.some((v: DoctorVisit) => typeof v.visitedAt !== 'string' || typeof v.clinicalNotes !== 'string' || typeof v.treatmentGiven !== 'string' || typeof v.doctorName !== 'string' ||
        !data.temperatures.some((t: TemperatureRecord) => t.patientId === v.patientId && t.date === v.date))) return false;
      if (data.auditLogs.some((a: AuditLog) => !a || !['id','timestamp','action','actorName','actorRole','details'].every(k => typeof (a as unknown as Record<string,unknown>)[k] === 'string'))) return false;
      if (data.patients && Array.isArray(data.patients)) {
        this.savePatients(data.patients);
      }
      if (data.temperatures && Array.isArray(data.temperatures)) {
        this.saveTemperatures(data.temperatures);
      }
      if (data.doctorVisits && Array.isArray(data.doctorVisits)) {
        this.saveDoctorVisits(data.doctorVisits);
      }
      if (data.auditLogs && Array.isArray(data.auditLogs)) {
        this.saveAuditLogs(data.auditLogs);
      }
      if (data.config && typeof data.config === 'object') {
        this.saveConfig(data.config);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },
};
