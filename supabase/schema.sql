-- ==============================================================================
-- CareTrack — Quarantine & Treatment Management System
-- Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- 1. Patients Table
create table if not exists patients (
  id text primary key,
  full_name text not null,
  age integer not null check (age > 0 and age < 130),
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  national_id text not null,
  contact_phone text,
  emergency_contact text,
  admission_date date not null default current_date,
  room_number integer not null check (room_number between 1 and 74),
  zone text not null,
  status text not null check (status in ('admitted', 'discharge_pending_admin', 'discharged', 'deceased')),
  outcome text check (outcome in ('recovered', 'deceased') or outcome is null),
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

-- Index for room and status
create index if not exists idx_patients_status on patients(status);
create index if not exists idx_patients_room on patients(room_number);

-- 2. Daily Temperature Records Table
-- Business Rule: Maximum one reading per patient per calendar day (unique constraint)
create table if not exists temperature_records (
  id text primary key,
  patient_id text references patients(id) on delete cascade,
  patient_name text not null,
  room_number integer not null,
  date date not null default current_date,
  temperature numeric(4,1) not null check (temperature between 30.0 and 45.0),
  is_fever boolean not null,
  recorded_at timestamptz not null default now(),
  recorded_by text not null,
  is_corrected boolean default false,
  correction_reason text,
  previous_temperature numeric(4,1),
  corrected_at timestamptz,
  corrected_by text,
  constraint unique_patient_date unique (patient_id, date)
);

create index if not exists idx_temperature_patient_date on temperature_records(patient_id, date desc);

-- 3. Daily Doctor Visits Table
-- Business Rule: Maximum one completed visit per patient per calendar day
create table if not exists doctor_visits (
  id text primary key,
  patient_id text references patients(id) on delete cascade,
  patient_name text not null,
  room_number integer not null,
  date date not null default current_date,
  visited_at timestamptz not null default now(),
  doctor_name text not null,
  clinical_notes text not null,
  treatment_given text not null,
  condition_summary text not null check (condition_summary in ('Improving', 'Stable', 'Guarded', 'Critical')),
  vitals jsonb,
  constraint unique_patient_doctor_visit_date unique (patient_id, date)
);

create index if not exists idx_doctor_visits_patient_date on doctor_visits(patient_id, date desc);

-- 4. Audit Trail Table
create table if not exists audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  action text not null,
  actor_name text not null,
  actor_role text not null check (actor_role in ('nurse', 'doctor', 'admin', 'management')),
  patient_id text,
  patient_name text,
  details text not null
);

create index if not exists idx_audit_logs_timestamp on audit_logs(timestamp desc);

-- 5. System Configuration Table
create table if not exists system_config (
  id text primary key default 'default_config',
  fever_threshold numeric(3,1) default 38.0,
  facility_max_capacity integer default 74,
  facility_name text default 'CareTrack Central Quarantine Facility',
  quarantine_required_fever_free_days integer default 3,
  current_simulation_date date default current_date
);

-- Insert default configuration
insert into system_config (id, fever_threshold, facility_max_capacity, facility_name, quarantine_required_fever_free_days, current_simulation_date)
values ('default_config', 38.0, 74, 'CareTrack Central Quarantine Facility', 3, current_date)
on conflict (id) do nothing;

-- 6. Row Level Security Policies (RLS)
alter table patients enable row level security;
alter table temperature_records enable row level security;
alter table doctor_visits enable row level security;
alter table audit_logs enable row level security;
alter table system_config enable row level security;


-- No public access policies: cloud writes require a separately implemented authenticated backend.
