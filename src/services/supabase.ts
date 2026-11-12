import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { StorageService, type SupabaseSettings } from './storage';

let supabaseInstance: SupabaseClient | null = null;

export const SUPABASE_SCHEMA_SQL = `-- CareTrack — Quarantine & Treatment Management System
-- Supabase PostgreSQL Schema Definition

-- 1. Patients Table
create table if not exists patients (
  id text primary key,
  full_name text not null,
  age integer not null,
  gender text not null,
  national_id text not null,
  contact_phone text,
  emergency_contact text,
  admission_date date not null,
  room_number integer not null check (room_number between 1 and 74),
  zone text not null,
  status text not null,
  outcome text,
  discharge_date date,
  discharge_approved_date timestamptz,
  discharge_approved_by_doctor text,
  discharge_doctor_notes text,
  deceased_date timestamptz,
  deceased_notes text,
  symptoms text[],
  medical_history text,
  created_at timestamptz default now()
);

-- 2. Daily Temperature Records Table
create table if not exists temperature_records (
  id text primary key,
  patient_id text references patients(id) on delete cascade,
  patient_name text not null,
  room_number integer not null,
  date date not null,
  temperature numeric(4,1) not null,
  is_fever boolean not null,
  recorded_at timestamptz not null,
  recorded_by text not null,
  is_corrected boolean default false,
  correction_reason text,
  previous_temperature numeric(4,1),
  corrected_at timestamptz,
  corrected_by text,
  constraint unique_patient_date unique (patient_id, date)
);

-- 3. Daily Doctor Visits Table
create table if not exists doctor_visits (
  id text primary key,
  patient_id text references patients(id) on delete cascade,
  patient_name text not null,
  room_number integer not null,
  date date not null,
  visited_at timestamptz not null,
  doctor_name text not null,
  clinical_notes text not null,
  treatment_given text not null,
  condition_summary text not null,
  vitals jsonb,
  constraint unique_patient_doctor_visit_date unique (patient_id, date)
);

-- 4. Audit Trail Table
create table if not exists audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  action text not null,
  actor_name text not null,
  actor_role text not null,
  patient_id text,
  patient_name text,
  details text not null
);

-- 5. System Configuration Table
create table if not exists system_config (
  id text primary key default 'default_config',
  fever_threshold numeric(3,1) default 38.0,
  facility_max_capacity integer default 74,
  facility_name text default 'CareTrack Central Quarantine Facility',
  quarantine_required_fever_free_days integer default 3,
  current_simulation_date date default current_date
);

-- Optional: Enable Row Level Security (RLS)
alter table patients enable row level security;
alter table temperature_records enable row level security;
alter table doctor_visits enable row level security;
alter table audit_logs enable row level security;
alter table system_config enable row level security;

-- Policies for public demo access (or restrict with authenticated user)
create policy "Allow all actions for authenticated or demo users" on patients for all using (true);
create policy "Allow all actions for authenticated or demo users" on temperature_records for all using (true);
create policy "Allow all actions for authenticated or demo users" on doctor_visits for all using (true);
create policy "Allow all actions for authenticated or demo users" on audit_logs for all using (true);
create policy "Allow all actions for authenticated or demo users" on system_config for all using (true);
`;

export const SupabaseService = {
  getClient(): SupabaseClient | null {
    if (supabaseInstance) return supabaseInstance;

    const settings = StorageService.getSupabaseSettings();
    if (settings.url && settings.anonKey) {
      try {
        supabaseInstance = createClient(settings.url, settings.anonKey);
        return supabaseInstance;
      } catch (e) {
        console.error('Error creating Supabase client:', e);
      }
    }
    return null;
  },

  resetClient(): void {
    supabaseInstance = null;
  },

  async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    if (!url || !key) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }
    try {
      const client = createClient(url, key);
      const { error } = await client.from('system_config').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Even if table doesn't exist yet, reaching Supabase means URL/Key are valid
        if (error.message.includes('relation "system_config" does not exist') || error.code === '42P01') {
          return {
            success: true,
            message: 'Connected to Supabase! (Database tables need creation using schema SQL).',
          };
        }
        return { success: false, message: `Connection error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected and verified with Supabase!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Failed to connect: ${msg}` };
    }
  },

  isConfigured(): boolean {
    const settings = StorageService.getSupabaseSettings();
    return Boolean(settings.url && settings.anonKey);
  },

  getSettings(): SupabaseSettings {
    return StorageService.getSupabaseSettings();
  },

  saveSettings(settings: SupabaseSettings): void {
    StorageService.saveSupabaseSettings(settings);
    this.resetClient();
  },
};
