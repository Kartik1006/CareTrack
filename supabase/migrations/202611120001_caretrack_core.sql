-- CareTrack initial schema. Apply through Supabase migrations, not the browser.
-- Client roles are provisioned by a trusted administrator in staff_profiles.
begin;

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) > 0),
  role text not null check (role in ('nurse','doctor','admin','management')),
  created_at timestamptz not null default now()
);

create table public.rooms (
  room_number integer primary key check (room_number between 1 and 74),
  zone text not null check (zone in ('Wing A','Wing B','Wing C'))
);
insert into public.rooms(room_number, zone)
select n, case when n <= 25 then 'Wing A' when n <= 50 then 'Wing B' else 'Wing C' end
from generate_series(1,74) n;

create table public.system_config (
  id text primary key default 'default_config' check (id = 'default_config'),
  fever_threshold numeric(3,1) not null default 38 check (fever_threshold between 36 and 40),
  facility_max_capacity integer not null default 74 check (facility_max_capacity = 74),
  facility_name text not null default 'CareTrack Central Quarantine Facility',
  quarantine_required_fever_free_days integer not null default 3 check (quarantine_required_fever_free_days = 3),
  current_simulation_date date not null default current_date,
  updated_at timestamptz not null default now()
);
insert into public.system_config(id) values ('default_config');

create table public.patients (
  id text primary key default ('CT-' || gen_random_uuid()::text),
  full_name text not null check (length(btrim(full_name)) > 0),
  age integer not null check (age between 1 and 120),
  gender text not null check (gender in ('Male','Female','Other')),
  national_id text not null check (length(btrim(national_id)) > 0),
  contact_phone text not null,
  emergency_contact text not null,
  admission_date date not null default current_date,
  room_number integer not null references public.rooms(room_number),
  zone text not null check (zone in ('Wing A','Wing B','Wing C')),
  status text not null default 'admitted' check (status in ('admitted','discharge_pending_admin','discharged','deceased')),
  outcome text check (outcome in ('recovered','deceased')),
  discharge_date date,
  discharge_approved_date timestamptz,
  discharge_approved_by_doctor text,
  discharge_doctor_notes text,
  deceased_date timestamptz,
  deceased_notes text,
  symptoms text[] not null default '{}',
  medical_history text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coherent_outcome check (
    (status in ('admitted','discharge_pending_admin') and outcome is null and discharge_date is null) or
    (status = 'discharged' and outcome is not distinct from 'recovered' and discharge_date is not null) or
    (status = 'deceased' and outcome is not distinct from 'deceased' and deceased_date is not null)
  ),
  constraint discharge_signoff check (status not in ('discharge_pending_admin','discharged') or
    (discharge_approved_date is not null and coalesce(length(btrim(discharge_approved_by_doctor)),0) > 0 and coalesce(length(btrim(discharge_doctor_notes)),0) > 0))
);
-- These indexes enforce capacity and room exclusivity, including concurrent admissions.
create unique index patients_one_active_occupant on public.patients(room_number) where status in ('admitted','discharge_pending_admin');
create unique index patients_unique_active_identity on public.patients(lower(btrim(national_id))) where status in ('admitted','discharge_pending_admin');
create index patients_status_idx on public.patients(status);

create table public.temperature_records (
  id text primary key default ('TR-' || gen_random_uuid()::text),
  patient_id text not null references public.patients(id),
  patient_name text not null,
  room_number integer not null references public.rooms(room_number),
  date date not null default current_date,
  temperature numeric(4,1) not null check (temperature between 32 and 43),
  is_fever boolean not null,
  recorded_at timestamptz not null default now(),
  recorded_by text not null,
  is_corrected boolean not null default false,
  correction_reason text,
  previous_temperature numeric(4,1),
  corrected_at timestamptz,
  corrected_by text,
  constraint unique_patient_date unique(patient_id,date),
  constraint correction_requires_reason check (not is_corrected or coalesce(length(btrim(correction_reason)),0) > 0)
);
create table public.doctor_visits (
  id text primary key default ('DV-' || gen_random_uuid()::text),
  patient_id text not null references public.patients(id),
  patient_name text not null,
  room_number integer not null references public.rooms(room_number),
  date date not null default current_date,
  visited_at timestamptz not null default now(),
  doctor_name text not null,
  clinical_notes text not null check (length(btrim(clinical_notes)) > 0),
  treatment_given text not null check (length(btrim(treatment_given)) > 0),
  condition_summary text not null check (condition_summary in ('Improving','Stable','Guarded','Critical')),
  vitals jsonb,
  constraint unique_patient_doctor_visit_date unique(patient_id,date),
  constraint temperature_before_visit foreign key(patient_id,date) references public.temperature_records(patient_id,date)
);
create index temperature_room_idx on public.temperature_records(room_number);
create index visits_room_idx on public.doctor_visits(room_number);

create table public.audit_logs (
  id text primary key default ('AUD-' || gen_random_uuid()::text),
  timestamp timestamptz not null default now(),
  action text not null,
  actor_id uuid,
  actor_name text not null,
  actor_role text not null,
  patient_id text,
  patient_name text,
  details text not null,
  before_data jsonb,
  after_data jsonb
);
create index audit_logs_timestamp_idx on public.audit_logs(timestamp desc);
create index audit_logs_patient_idx on public.audit_logs(patient_id);

create function public.caretrack_role() returns text
language sql stable security definer set search_path = ''
as $$ select role from public.staff_profiles where user_id = (select auth.uid()) $$;
revoke all on function public.caretrack_role() from public, anon;
grant execute on function public.caretrack_role() to authenticated;

-- Eligibility uses the three immediately preceding full dates, never a count of arbitrary readings.
-- Live database rules use current_date; current_simulation_date is only local-demo configuration.
create function public.caretrack_discharge_ready(p_id text) returns boolean
language sql stable security invoker set search_path = ''
as $$
 select exists (
   select 1 from public.system_config c where c.id = 'default_config'
   and (select count(*) from generate_series(1,3) d
     join public.temperature_records t on t.patient_id = p_id and t.date = current_date - d
     join public.doctor_visits v on v.patient_id = t.patient_id and v.date = t.date
     where t.temperature < c.fever_threshold) = 3
   and exists (select 1 from public.temperature_records t join public.doctor_visits v using(patient_id,date)
     where t.patient_id = p_id and t.date = current_date and t.temperature < c.fever_threshold)
 )
$$;
revoke all on function public.caretrack_discharge_ready(text) from public, anon;
grant execute on function public.caretrack_discharge_ready(text) to authenticated;

create function public.caretrack_guard_patient() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare actor text; staff_name text; trusted boolean;
begin
  trusted := current_user in ('postgres','supabase_admin','service_role');
  if not trusted then actor := public.caretrack_role(); end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.id,0));
  if new.zone <> (select zone from public.rooms where room_number = new.room_number) then raise exception 'Room and wing must match'; end if;
  if tg_op = 'INSERT' then
    if not trusted and actor is distinct from 'admin' then raise exception 'Administrator role required'; end if;
    if not trusted and (new.status <> 'admitted' or new.admission_date <> current_date or new.discharge_approved_date is not null or new.deceased_date is not null) then raise exception 'New admissions must start today without an outcome'; end if;
  else
    if old.status in ('discharged','deceased') then raise exception 'Completed outcomes are immutable'; end if;
    if new.id <> old.id then raise exception 'Patient identity cannot change'; end if;
    if not trusted then
      select display_name into staff_name from public.staff_profiles where user_id = auth.uid();
      if actor = 'doctor' then
        if (to_jsonb(new) - array['status','outcome','discharge_date','discharge_approved_date','discharge_approved_by_doctor','discharge_doctor_notes','deceased_date','deceased_notes','updated_at']) is distinct from
           (to_jsonb(old) - array['status','outcome','discharge_date','discharge_approved_date','discharge_approved_by_doctor','discharge_doctor_notes','deceased_date','deceased_notes','updated_at']) then raise exception 'Doctors cannot edit admission details'; end if;
        if new.status = 'discharge_pending_admin' and old.status = 'admitted' then
          if not public.caretrack_discharge_ready(old.id) then raise exception 'Three complete fever-free days and today care are required'; end if;
          new.discharge_approved_date := now(); new.discharge_approved_by_doctor := staff_name;
          new.outcome := null; new.discharge_date := null; new.deceased_date := null; new.deceased_notes := null;
        elsif new.status = 'deceased' then
          if coalesce(length(btrim(new.deceased_notes)),0) = 0 then raise exception 'Clinical death notes are required'; end if;
          new.outcome := 'deceased'; new.deceased_date := now(); new.discharge_date := current_date;
          new.discharge_approved_date := old.discharge_approved_date; new.discharge_approved_by_doctor := old.discharge_approved_by_doctor; new.discharge_doctor_notes := old.discharge_doctor_notes;
        else raise exception 'Doctors may only approve discharge or record death'; end if;
      elsif actor = 'admin' then
        if old.status <> 'discharge_pending_admin' or new.status <> 'discharged' then raise exception 'Doctor approval is required before administrator discharge'; end if;
        if (to_jsonb(new) - array['status','outcome','discharge_date','updated_at']) is distinct from
           (to_jsonb(old) - array['status','outcome','discharge_date','updated_at']) then raise exception 'Administrator may only finalize the approved discharge'; end if;
        if not public.caretrack_discharge_ready(old.id) then raise exception 'Discharge criteria changed; medical review required'; end if;
        new.outcome := 'recovered'; new.discharge_date := current_date;
      else raise exception 'Role cannot change patients'; end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger caretrack_patient_guard before insert or update on public.patients for each row execute function public.caretrack_guard_patient();

create function public.caretrack_guard_daily_record() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare p public.patients; staff_name text; trusted boolean; threshold numeric;
begin
  trusted := current_user in ('postgres','supabase_admin','service_role');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.patient_id,0));
  select * into p from public.patients where id = new.patient_id;
  if p.id is null or p.status not in ('admitted','discharge_pending_admin') then raise exception 'Patient must be admitted'; end if;
  if new.date < p.admission_date then raise exception 'Record cannot predate admission'; end if;
  if not trusted and new.date <> current_date then raise exception 'Only today records can be entered'; end if;
  select display_name into staff_name from public.staff_profiles where user_id = auth.uid();
  new.patient_name := p.full_name; new.room_number := p.room_number;
  if tg_table_name = 'temperature_records' then
    if not trusted and public.caretrack_role() is distinct from 'nurse' then raise exception 'Nurse role required'; end if;
    select fever_threshold into threshold from public.system_config where id = 'default_config';
    new.is_fever := new.temperature >= threshold;
    if tg_op = 'UPDATE' then
      if new.id <> old.id or new.patient_id <> old.patient_id or new.date <> old.date then raise exception 'Reading identity cannot change'; end if;
      if coalesce(length(btrim(new.correction_reason)),0) = 0 then raise exception 'Correction reason required'; end if;
      new.recorded_at := old.recorded_at; new.recorded_by := old.recorded_by;
      new.previous_temperature := old.temperature; new.is_corrected := true; new.corrected_at := now(); new.corrected_by := coalesce(staff_name,'Database administrator');
    elsif not trusted then new.recorded_at := now(); new.recorded_by := staff_name; new.is_corrected := false; end if;
  else
    if tg_op = 'UPDATE' then raise exception 'Completed visits cannot be changed'; end if;
    if not trusted and public.caretrack_role() is distinct from 'doctor' then raise exception 'Doctor role required'; end if;
    if not trusted then new.visited_at := now(); new.doctor_name := staff_name; end if;
  end if;
  return new;
end $$;
create trigger caretrack_temperature_guard before insert or update on public.temperature_records for each row execute function public.caretrack_guard_daily_record();
create trigger caretrack_visit_guard before insert or update on public.doctor_visits for each row execute function public.caretrack_guard_daily_record();

create function public.caretrack_audit_action() returns trigger
language plpgsql security definer set search_path = '' as $$
declare staff_name text; staff_role text; event text; pid text; pname text;
begin
  select display_name,role into staff_name,staff_role from public.staff_profiles where user_id = auth.uid();
  if tg_table_name = 'patients' then
    pid := new.id; pname := new.full_name;
    event := case when tg_op = 'INSERT' then 'PATIENT_ADMITTED' when new.status = 'discharge_pending_admin' then 'DISCHARGE_APPROVED_DOCTOR' when new.status = 'discharged' then 'DISCHARGE_FINALIZED_ADMIN' when new.status = 'deceased' then 'PATIENT_DECEASED' else 'PATIENT_UPDATED' end;
  elsif tg_table_name = 'temperature_records' then
    pid := new.patient_id; pname := new.patient_name; event := case when tg_op = 'UPDATE' then 'TEMPERATURE_CORRECTED' else 'TEMPERATURE_RECORDED' end;
  elsif tg_table_name = 'doctor_visits' then pid := new.patient_id; pname := new.patient_name; event := 'DOCTOR_VISIT_RECORDED';
  else event := 'CONFIG_UPDATED'; end if;
  insert into public.audit_logs(action,actor_id,actor_name,actor_role,patient_id,patient_name,details,before_data,after_data)
  values(event,auth.uid(),coalesce(staff_name,'Database administrator'),coalesce(staff_role,'system'),pid,pname,tg_table_name || ': ' || lower(tg_op),case when tg_op = 'UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end $$;
create trigger caretrack_patient_audit after insert or update on public.patients for each row execute function public.caretrack_audit_action();
create trigger caretrack_temperature_audit after insert or update on public.temperature_records for each row execute function public.caretrack_audit_action();
create trigger caretrack_visit_audit after insert on public.doctor_visits for each row execute function public.caretrack_audit_action();
create trigger caretrack_config_audit after update on public.system_config for each row execute function public.caretrack_audit_action();

alter table public.staff_profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.system_config enable row level security;
alter table public.patients enable row level security;
alter table public.temperature_records enable row level security;
alter table public.doctor_visits enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_read on public.staff_profiles for select to authenticated using (user_id = (select auth.uid()) or (select public.caretrack_role()) in ('admin','management'));
create policy rooms_read on public.rooms for select to authenticated using ((select public.caretrack_role()) is not null);
create policy config_read on public.system_config for select to authenticated using ((select public.caretrack_role()) is not null);
create policy config_admin on public.system_config for update to authenticated using ((select public.caretrack_role()) = 'admin') with check ((select public.caretrack_role()) = 'admin');
create policy patients_read on public.patients for select to authenticated using ((select public.caretrack_role()) is not null);
create policy patients_admit on public.patients for insert to authenticated with check ((select public.caretrack_role()) = 'admin');
create policy patients_transition on public.patients for update to authenticated using ((select public.caretrack_role()) in ('admin','doctor')) with check ((select public.caretrack_role()) in ('admin','doctor'));
create policy temperatures_read on public.temperature_records for select to authenticated using ((select public.caretrack_role()) is not null);
create policy temperatures_insert on public.temperature_records for insert to authenticated with check ((select public.caretrack_role()) = 'nurse');
create policy temperatures_correct on public.temperature_records for update to authenticated using ((select public.caretrack_role()) = 'nurse') with check ((select public.caretrack_role()) = 'nurse');
create policy visits_read on public.doctor_visits for select to authenticated using ((select public.caretrack_role()) is not null);
create policy visits_insert on public.doctor_visits for insert to authenticated with check ((select public.caretrack_role()) = 'doctor');
create policy audit_read on public.audit_logs for select to authenticated using ((select public.caretrack_role()) is not null);

revoke all on public.staff_profiles,public.rooms,public.system_config,public.patients,public.temperature_records,public.doctor_visits,public.audit_logs from anon,authenticated;
grant select on public.staff_profiles,public.rooms,public.system_config,public.patients,public.temperature_records,public.doctor_visits,public.audit_logs to authenticated;
grant insert,update on public.patients,public.temperature_records to authenticated;
grant insert on public.doctor_visits to authenticated;
grant update on public.system_config to authenticated;
-- No client writes to staff roles or audit events; no clinical deletions.
revoke all on function public.caretrack_guard_patient(),public.caretrack_guard_daily_record(),public.caretrack_audit_action() from public,anon,authenticated;

create view public.discharge_queue with (security_invoker = true) as
select id,full_name,room_number,zone,discharge_approved_date,discharge_approved_by_doctor,discharge_doctor_notes
from public.patients where status = 'discharge_pending_admin';
create view public.treatment_outcomes with (security_invoker = true) as
select count(*) filter(where status = 'discharged' and outcome is not distinct from 'recovered') as recoveries,
 count(*) filter(where status = 'deceased' and outcome is not distinct from 'deceased') as deaths,
 round(100.0 * count(*) filter(where status = 'discharged' and outcome is not distinct from 'recovered') / nullif(count(*) filter(where status in ('discharged','deceased')),0),1) as success_rate,
 coalesce(count(*) filter(where status = 'deceased')::numeric / nullif(count(*) filter(where status in ('discharged','deceased')),0) > 0.15,false) as mortality_warning
from public.patients;
revoke all on public.discharge_queue,public.treatment_outcomes from anon;
grant select on public.discharge_queue,public.treatment_outcomes to authenticated;
commit;
