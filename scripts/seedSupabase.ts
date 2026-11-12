import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_PATIENTS,
  INITIAL_TEMPERATURE_RECORDS,
  INITIAL_DOCTOR_VISITS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONFIG,
} from '../src/constants/mockData.ts';

const url = process.env.VITE_SUPABASE_URL || 'https://kqdsmsvxahnultzmhncl.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
if (!key) {
  console.error('Missing VITE_SUPABASE_ANON_KEY or SUPABASE_KEY environment variable.');
  process.exit(1);
}
const supabase = createClient(url, key);

async function seed() {
  console.log('Starting Supabase seed...');

  // 1. Seed Patients
  const patientsRows = INITIAL_PATIENTS.map((p) => ({
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
  }));

  const { error: pErr } = await supabase.from('patients').upsert(patientsRows);
  if (pErr) console.error('Error inserting patients:', pErr);
  else console.log(`✓ Inserted ${patientsRows.length} patients into Supabase.`);

  // 2. Seed Temperature Records
  const tempRows = INITIAL_TEMPERATURE_RECORDS.map((t) => ({
    id: t.id,
    patient_id: t.patientId,
    patient_name: t.patientName,
    room_number: t.roomNumber,
    date: t.date,
    temperature: t.temperature,
    is_fever: t.isFever,
    recorded_at: t.recordedAt,
    recorded_by: t.recordedBy,
    is_corrected: t.isCorrected || false,
    correction_reason: t.correctionReason || null,
    previous_temperature: t.previousTemperature || null,
    corrected_at: t.correctedAt || null,
    corrected_by: t.correctedBy || null,
  }));

  const { error: tErr } = await supabase.from('temperature_records').upsert(tempRows);
  if (tErr) console.error('Error inserting temperatures:', tErr);
  else console.log(`✓ Inserted ${tempRows.length} temperature records into Supabase.`);

  // 3. Seed Doctor Visits
  const visitRows = INITIAL_DOCTOR_VISITS.map((v) => ({
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
  }));

  const { error: vErr } = await supabase.from('doctor_visits').upsert(visitRows);
  if (vErr) console.error('Error inserting doctor visits:', vErr);
  else console.log(`✓ Inserted ${visitRows.length} doctor visits into Supabase.`);

  // 4. Seed Audit Logs
  const auditRows = INITIAL_AUDIT_LOGS.map((a) => ({
    id: a.id,
    timestamp: a.timestamp,
    action: a.action,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    patient_id: a.patientId || null,
    patient_name: a.patientName || null,
    details: a.details,
  }));

  const { error: aErr } = await supabase.from('audit_logs').upsert(auditRows);
  if (aErr) console.error('Error inserting audit logs:', aErr);
  else console.log(`✓ Inserted ${auditRows.length} audit logs into Supabase.`);

  // 5. System Config
  const configRow = {
    id: 'default_config',
    fever_threshold: INITIAL_CONFIG.feverThreshold,
    facility_max_capacity: INITIAL_CONFIG.facilityMaxCapacity,
    facility_name: INITIAL_CONFIG.facilityName,
    quarantine_required_fever_free_days: INITIAL_CONFIG.quarantineRequiredFeverFreeDays,
    current_simulation_date: INITIAL_CONFIG.currentSimulationDate,
  };

  const { error: cErr } = await supabase.from('system_config').upsert(configRow);
  if (cErr) console.error('Error inserting system config:', cErr);
  else console.log('✓ Inserted system config into Supabase.');

  console.log('Seed completed successfully!');
}

seed();
