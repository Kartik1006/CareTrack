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
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      autoSync: false,
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
