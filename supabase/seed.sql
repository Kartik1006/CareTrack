-- ==============================================================================
-- CareTrack — Quarantine & Treatment Management System
-- Initial Frontend Seed Dataset for Supabase
-- Project: kqdsmsvxahnultzmhncl
-- ==============================================================================

-- 1. System Configuration
INSERT INTO system_config (
  id,
  fever_threshold,
  facility_max_capacity,
  facility_name,
  quarantine_required_fever_free_days,
  current_simulation_date
) VALUES (
  'default_config',
  38.0,
  74,
  'CareTrack Central Quarantine Facility',
  3,
  '2026-11-12'
) ON CONFLICT (id) DO UPDATE SET
  fever_threshold = EXCLUDED.fever_threshold,
  facility_max_capacity = EXCLUDED.facility_max_capacity,
  current_simulation_date = EXCLUDED.current_simulation_date;

-- 2. Patients (Active Admitted, Pending Admin, Discharged Recovered, Deceased)
INSERT INTO patients (
  id, full_name, age, gender, national_id, contact_phone, emergency_contact,
  admission_date, room_number, zone, status, outcome, discharge_date,
  discharge_approved_date, discharge_approved_by_doctor, discharge_doctor_notes,
  deceased_date, deceased_notes, symptoms, medical_history
) VALUES
-- Active Patients:
(
  'CT-101', 'Eleanor Vance', 34, 'Female', 'ID-8829104', '+1 (555) 234-5678', 'David Vance (Spouse) - +1 (555) 234-5679',
  '2026-11-04', 1, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Mild cough', 'Loss of smell'], 'No chronic conditions. Non-smoker.'
),
(
  'CT-102', 'Marcus Brody', 49, 'Male', 'ID-4412098', '+1 (555) 345-6789', 'Sarah Brody (Daughter) - +1 (555) 345-6780',
  '2026-11-03', 2, 'Wing A', 'discharge_pending_admin', NULL, NULL,
  '2026-11-12 09:30:00+00', 'Dr. Sarah Lin, MD', 'Patient completed 4 consecutive afebrile days. Vitals stable (SpO2 99%, Pulse 72). Lungs clear on auscultation. Approved for home release.',
  NULL, NULL,
  ARRAY['Fever', 'Fatigue', 'Sore throat'], 'Mild hypertension (controlled on Amlodipine).'
),
(
  'CT-103', 'Sophia Martinez', 28, 'Female', 'ID-9923847', '+1 (555) 456-7890', 'Carlos Martinez (Father) - +1 (555) 456-7891',
  '2026-11-05', 3, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Headache', 'Low grade fever'], 'Seasonal allergies.'
),
(
  'CT-104', 'Arthur Pendelton', 62, 'Male', 'ID-1209384', '+1 (555) 567-8901', 'Clara Pendelton (Spouse) - +1 (555) 567-8902',
  '2026-11-09', 4, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['High fever', 'Productive cough', 'Shortness of breath'], 'Type 2 Diabetes, mild asthma.'
),
(
  'CT-105', 'Fatima Al-Mansoor', 41, 'Female', 'ID-6638291', '+1 (555) 678-9012', 'Tariq Al-Mansoor (Brother) - +1 (555) 678-9013',
  '2026-11-10', 5, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Chills', 'Fever spike', 'Body aches'], 'None reported.'
),
(
  'CT-106', 'Jameson Cole', 53, 'Male', 'ID-3349182', '+1 (555) 789-0123', 'Rebecca Cole (Spouse) - +1 (555) 789-0124',
  '2026-11-08', 6, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Dry cough', 'Mild chest tightness'], 'Hypertension.'
),
(
  'CT-107', 'Ananya Sharma', 24, 'Female', 'ID-5510293', '+1 (555) 890-1234', 'Rohan Sharma (Brother) - +1 (555) 890-1235',
  '2026-11-11', 7, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Loss of taste', 'Mild fatigue'], 'Healthy.'
),
(
  'CT-108', 'Dmitri Volkov', 45, 'Male', 'ID-7729103', '+1 (555) 901-2345', 'Elena Volkova (Sister) - +1 (555) 901-2346',
  '2026-11-07', 8, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Mild fever', 'Headache'], 'No chronic diseases.'
),
(
  'CT-109', 'Chloe Dupont', 38, 'Female', 'ID-8839201', '+1 (555) 012-3456', 'Luc Dupont (Spouse) - +1 (555) 012-3457',
  '2026-11-06', 9, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Cough', 'Fatigue'], 'Mild anemia.'
),
(
  'CT-110', 'Gabriel Santos', 31, 'Male', 'ID-2283910', '+1 (555) 123-4560', 'Maria Santos (Mother) - +1 (555) 123-4561',
  '2026-11-06', 10, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Sore throat', 'Congestion'], 'None.'
),
(
  'CT-111', 'Klaus Mueller', 58, 'Male', 'ID-9912044', '+1 (555) 234-5601', 'Ingrid Mueller (Spouse) - +1 (555) 234-5602',
  '2026-11-07', 15, 'Wing A', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Fever', 'Fatigue'], 'Hypercholesterolemia.'
),
(
  'CT-112', 'Hannah Tanaka', 29, 'Female', 'ID-3391029', '+1 (555) 345-6702', 'Ken Tanaka (Brother) - +1 (555) 345-6703',
  '2026-11-08', 26, 'Wing B', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Mild cough'], 'Healthy.'
),
(
  'CT-113', 'Liam O’Connor', 36, 'Male', 'ID-4401928', '+1 (555) 456-7803', 'Fiona O’Connor (Spouse) - +1 (555) 456-7804',
  '2026-11-09', 28, 'Wing B', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Loss of taste', 'Fatigue'], 'Asthma.'
),
(
  'CT-114', 'Zara Chen', 43, 'Female', 'ID-5519283', '+1 (555) 567-8904', 'Wei Chen (Spouse) - +1 (555) 567-8905',
  '2026-11-05', 32, 'Wing B', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Mild fever', 'Headache'], 'None.'
),
(
  'CT-115', 'Mateo Rossi', 51, 'Male', 'ID-6629104', '+1 (555) 678-9015', 'Giulia Rossi (Daughter) - +1 (555) 678-9016',
  '2026-11-06', 52, 'Wing C', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Fever', 'Dry cough'], 'Hypertension.'
),
(
  'CT-116', 'Amara Okafor', 33, 'Female', 'ID-7739105', '+1 (555) 789-0126', 'Emeka Okafor (Spouse) - +1 (555) 789-0127',
  '2026-11-10', 54, 'Wing C', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Fatigue', 'Fever spike'], 'None.'
),
(
  'CT-117', 'Nils Lindqvist', 65, 'Male', 'ID-8849106', '+1 (555) 890-1237', 'Astrid Lindqvist (Spouse) - +1 (555) 890-1238',
  '2026-11-04', 60, 'Wing C', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Shortness of breath', 'Cough'], 'COPD.'
),
(
  'CT-118', 'Amina Diallo', 26, 'Female', 'ID-9959107', '+1 (555) 901-2348', 'Ousmane Diallo (Father) - +1 (555) 901-2349',
  '2026-11-11', 70, 'Wing C', 'admitted', NULL, NULL,
  NULL, NULL, NULL, NULL, NULL,
  ARRAY['Sore throat'], 'None.'
),

-- Historical Discharged Patients (Recovered):
(
  'CT-080', 'Robert Taylor', 50, 'Male', 'ID-1102938', '+1 (555) 111-2233', 'Karen Taylor',
  '2026-10-25', 12, 'Wing A', 'discharged', 'recovered', '2026-11-08',
  '2026-11-07 14:00:00+00', 'Dr. Sarah Lin, MD', 'Full recovery, 5 afebrile days.',
  NULL, NULL,
  ARRAY['Fever', 'Cough'], 'None.'
),
(
  'CT-081', 'Linda Zhang', 42, 'Female', 'ID-2203948', '+1 (555) 222-3344', 'Michael Zhang',
  '2026-10-26', 18, 'Wing A', 'discharged', 'recovered', '2026-11-09',
  '2026-11-08 11:20:00+00', 'Dr. Marcus Vance, MD', 'Asymptomatic for 4 days.',
  NULL, NULL,
  ARRAY['Loss of taste'], 'None.'
),
(
  'CT-082', 'George Washington Carver', 60, 'Male', 'ID-3304958', '+1 (555) 333-4455', 'Alice Carver',
  '2026-10-28', 22, 'Wing A', 'discharged', 'recovered', '2026-11-10',
  '2026-11-09 16:15:00+00', 'Dr. Sarah Lin, MD', 'Normal inflammatory markers, afebrile.',
  NULL, NULL,
  ARRAY['Chills'], 'None.'
),
(
  'CT-083', 'Patricia Morales', 39, 'Female', 'ID-4405968', '+1 (555) 444-5566', 'Jorge Morales',
  '2026-10-27', 35, 'Wing B', 'discharged', 'recovered', '2026-11-07',
  '2026-11-06 10:00:00+00', 'Dr. Marcus Vance, MD', 'Resolved uneventfully.',
  NULL, NULL,
  ARRAY['Fatigue'], 'None.'
),
(
  'CT-084', 'Evelyn Wright', 31, 'Female', 'ID-5506978', '+1 (555) 555-6677', 'Thomas Wright',
  '2026-10-29', 44, 'Wing B', 'discharged', 'recovered', '2026-11-09',
  '2026-11-08 15:30:00+00', 'Dr. Sarah Lin, MD', 'Complete symptom resolution.',
  NULL, NULL,
  ARRAY['Fever', 'Headache'], 'None.'
),
(
  'CT-085', 'Benjamin Hayes', 55, 'Male', 'ID-6607988', '+1 (555) 666-7788', 'Carol Hayes',
  '2026-10-30', 50, 'Wing B', 'discharged', 'recovered', '2026-11-10',
  '2026-11-09 09:45:00+00', 'Dr. Marcus Vance, MD', 'Afebrile, vital signs normal.',
  NULL, NULL,
  ARRAY['Cough'], 'None.'
),
(
  'CT-086', 'Miriam Becker', 47, 'Female', 'ID-7708998', '+1 (555) 777-8899', 'Otto Becker',
  '2026-10-31', 65, 'Wing C', 'discharged', 'recovered', '2026-11-11',
  '2026-11-10 12:00:00+00', 'Dr. Sarah Lin, MD', 'Lungs clear, 3 days normal temp.',
  NULL, NULL,
  ARRAY['Mild fever'], 'None.'
),
(
  'CT-087', 'Samuel Adebayo', 52, 'Male', 'ID-8809908', '+1 (555) 888-9900', 'Grace Adebayo',
  '2026-11-01', 72, 'Wing C', 'discharged', 'recovered', '2026-11-11',
  '2026-11-10 17:10:00+00', 'Dr. Marcus Vance, MD', 'Normal vitals, released.',
  NULL, NULL,
  ARRAY['Loss of smell'], 'None.'
),

-- Historical Recorded Deaths:
(
  'CT-050', 'Harold Finch', 82, 'Male', 'ID-9901122', '+1 (555) 999-0011', 'Grace Finch (Daughter)',
  '2026-10-20', 14, 'Wing A', 'deceased', 'deceased', '2026-10-27',
  NULL, NULL, NULL,
  '2026-10-27 03:15:00+00', 'Severe acute respiratory distress syndrome (ARDS) compounded by advanced cardiopulmonary disease.',
  ARRAY['Severe dyspnea', 'High fever', 'Hypoxemia'], 'Advanced COPD, congestive heart failure.'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  outcome = EXCLUDED.outcome,
  room_number = EXCLUDED.room_number,
  discharge_date = EXCLUDED.discharge_date,
  discharge_approved_date = EXCLUDED.discharge_approved_date,
  discharge_approved_by_doctor = EXCLUDED.discharge_approved_by_doctor,
  discharge_doctor_notes = EXCLUDED.discharge_doctor_notes,
  deceased_date = EXCLUDED.deceased_date,
  deceased_notes = EXCLUDED.deceased_notes;

-- 3. Temperature Records
INSERT INTO temperature_records (
  id, patient_id, patient_name, room_number, date, temperature, is_fever,
  recorded_at, recorded_by, is_corrected, correction_reason, previous_temperature,
  corrected_at, corrected_by
) VALUES
-- Eleanor Vance (CT-101) - 3 Consecutive Fever-Free Days
('TR-101-09', 'CT-101', 'Eleanor Vance', 1, '2026-11-09', 37.0, false, '2026-11-09 08:15:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-101-10', 'CT-101', 'Eleanor Vance', 1, '2026-11-10', 36.8, false, '2026-11-10 08:20:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-101-11', 'CT-101', 'Eleanor Vance', 1, '2026-11-11', 36.9, false, '2026-11-11 08:10:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-101-12', 'CT-101', 'Eleanor Vance', 1, '2026-11-12', 36.7, false, '2026-11-12 08:30:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),

-- Marcus Brody (CT-102) - 4 Days Afebrile, Doctor Approved
('TR-102-09', 'CT-102', 'Marcus Brody', 2, '2026-11-09', 36.9, false, '2026-11-09 08:25:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-102-10', 'CT-102', 'Marcus Brody', 2, '2026-11-10', 36.8, false, '2026-11-10 08:30:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-102-11', 'CT-102', 'Marcus Brody', 2, '2026-11-11', 36.7, false, '2026-11-11 08:25:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-102-12', 'CT-102', 'Marcus Brody', 2, '2026-11-12', 36.6, false, '2026-11-12 08:35:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),

-- Sophia Martinez (CT-103) - 3 Consecutive Fever-Free Days
('TR-103-10', 'CT-103', 'Sophia Martinez', 3, '2026-11-10', 37.1, false, '2026-11-10 08:40:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-103-11', 'CT-103', 'Sophia Martinez', 3, '2026-11-11', 36.8, false, '2026-11-11 08:35:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-103-12', 'CT-103', 'Sophia Martinez', 3, '2026-11-12', 36.9, false, '2026-11-12 08:45:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),

-- Arthur Pendelton (CT-104) - Active Fever Today (38.9°C)
('TR-104-10', 'CT-104', 'Arthur Pendelton', 4, '2026-11-10', 38.4, true, '2026-11-10 08:50:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-104-11', 'CT-104', 'Arthur Pendelton', 4, '2026-11-11', 38.6, true, '2026-11-11 08:45:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-104-12', 'CT-104', 'Arthur Pendelton', 4, '2026-11-12', 38.9, true, '2026-11-12 08:50:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),

-- Fatima Al-Mansoor (CT-105) - Active Fever Today (38.8°C)
('TR-105-11', 'CT-105', 'Fatima Al-Mansoor', 5, '2026-11-11', 38.3, true, '2026-11-11 09:00:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-105-12', 'CT-105', 'Fatima Al-Mansoor', 5, '2026-11-12', 38.8, true, '2026-11-12 09:05:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),

-- Jameson Cole & Ananya Sharma (Yesterday logged, today pending)
('TR-106-11', 'CT-106', 'Jameson Cole', 6, '2026-11-11', 37.3, false, '2026-11-11 09:15:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-107-11', 'CT-107', 'Ananya Sharma', 7, '2026-11-11', 37.0, false, '2026-11-11 09:20:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),

-- Dmitri Volkov (CT-108) - Temp logged & doctor visit done
('TR-108-11', 'CT-108', 'Dmitri Volkov', 8, '2026-11-11', 37.4, false, '2026-11-11 09:30:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-108-12', 'CT-108', 'Dmitri Volkov', 8, '2026-11-12', 37.2, false, '2026-11-12 09:15:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),

-- Chloe Dupont (CT-109) - Temp logged, doctor visit pending
('TR-109-11', 'CT-109', 'Chloe Dupont', 9, '2026-11-11', 37.5, false, '2026-11-11 09:40:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-109-12', 'CT-109', 'Chloe Dupont', 9, '2026-11-12', 37.1, false, '2026-11-12 09:25:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),

-- Gabriel Santos (CT-110) - Corrected Temperature Demonstration
('TR-110-12', 'CT-110', 'Gabriel Santos', 10, '2026-11-12', 37.3, false, '2026-11-12 09:30:00+00', 'Nurse Jessica Hayes, RN', true, 'Immediate re-measurement: Initial probe had calibration artifact. Re-measured with calibrated tympanic scanner.', 39.5, '2026-11-12 09:38:00+00', 'Nurse Jessica Hayes, RN (Authorized by Head Nurse)'),

-- Other Wings
('TR-111-12', 'CT-111', 'Klaus Mueller', 15, '2026-11-12', 37.6, false, '2026-11-12 09:45:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-112-12', 'CT-112', 'Hannah Tanaka', 26, '2026-11-12', 36.8, false, '2026-11-12 09:50:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-113-12', 'CT-113', 'Liam O’Connor', 28, '2026-11-12', 37.0, false, '2026-11-12 09:55:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL),
('TR-114-12', 'CT-114', 'Zara Chen', 32, '2026-11-12', 37.2, false, '2026-11-12 10:00:00+00', 'Nurse Jessica Hayes, RN', false, NULL, NULL, NULL, NULL),
('TR-115-12', 'CT-115', 'Mateo Rossi', 52, '2026-11-12', 38.4, true, '2026-11-12 10:10:00+00', 'Nurse Alex Morgan, RN', false, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  temperature = EXCLUDED.temperature,
  is_fever = EXCLUDED.is_fever,
  is_corrected = EXCLUDED.is_corrected,
  correction_reason = EXCLUDED.correction_reason,
  previous_temperature = EXCLUDED.previous_temperature,
  corrected_at = EXCLUDED.corrected_at,
  corrected_by = EXCLUDED.corrected_by;

-- 4. Doctor Visits
INSERT INTO doctor_visits (
  id, patient_id, patient_name, room_number, date, visited_at,
  doctor_name, clinical_notes, treatment_given, condition_summary, vitals
) VALUES
(
  'DV-102-12', 'CT-102', 'Marcus Brody', 2, '2026-11-12', '2026-11-12 09:20:00+00',
  'Dr. Sarah Lin, MD', 'Day 10 evaluation. Patient exhibits complete recovery. Chest clear to auscultation bilaterally. Heart sounds normal S1/S2.',
  'Discontinued quarantine medication. Multivitamins prescribed for 14 days.', 'Improving',
  '{"pulse": 72, "spo2": 99, "bp": "124/82", "respiratoryRate": 16}'::jsonb
),
(
  'DV-104-12', 'CT-104', 'Arthur Pendelton', 4, '2026-11-12', '2026-11-12 09:40:00+00',
  'Dr. Sarah Lin, MD', 'Persistent pyrexia (38.9°C). Moderate bibasilar crackles. Supplemental oxygen administered at 2L/min via nasal cannula. Blood cultures sent.',
  'IV Paracetamol 1g, Azithromycin 500mg, continue 2L O2.', 'Guarded',
  '{"pulse": 104, "spo2": 93, "bp": "138/88", "respiratoryRate": 24}'::jsonb
),
(
  'DV-108-12', 'CT-108', 'Dmitri Volkov', 8, '2026-11-12', '2026-11-12 10:05:00+00',
  'Dr. Marcus Vance, MD', 'Patient doing well. Afebrile. Cough has resolved significantly. Ambulatory and tolerating normal diet.',
  'Supportive hydration, Oral Paracetamol PRN.', 'Improving',
  '{"pulse": 76, "spo2": 98, "bp": "120/78", "respiratoryRate": 16}'::jsonb
),
(
  'DV-101-11', 'CT-101', 'Eleanor Vance', 1, '2026-11-11', '2026-11-11 11:00:00+00',
  'Dr. Sarah Lin, MD', 'Day 8 checkup. Patient continues to be afebrile. Lungs clear. Mood is positive. Awaiting tomorrow’s 3rd consecutive day reading for discharge clearance.',
  'Supportive care.', 'Improving',
  '{"pulse": 68, "spo2": 99, "bp": "118/74", "respiratoryRate": 14}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  clinical_notes = EXCLUDED.clinical_notes,
  treatment_given = EXCLUDED.treatment_given,
  condition_summary = EXCLUDED.condition_summary,
  vitals = EXCLUDED.vitals;

-- 5. Audit Trail Logs
INSERT INTO audit_logs (
  id, timestamp, action, actor_name, actor_role, patient_id, patient_name, details
) VALUES
('AUD-001', '2026-11-12 08:30:00+00', 'TEMPERATURE_RECORDED', 'Nurse Jessica Hayes, RN', 'nurse', 'CT-101', 'Eleanor Vance', 'Recorded morning temperature: 36.7°C (Normal / Afebrile).'),
('AUD-002', '2026-11-12 08:50:00+00', 'TEMPERATURE_RECORDED', 'Nurse Alex Morgan, RN', 'nurse', 'CT-104', 'Arthur Pendelton', 'Recorded morning temperature: 38.9°C (FEVER DETECTED - Alert triggered).'),
('AUD-003', '2026-11-12 09:20:00+00', 'DOCTOR_VISIT_RECORDED', 'Dr. Sarah Lin, MD', 'doctor', 'CT-102', 'Marcus Brody', 'Completed daily clinical round. Vitals SpO2 99%, Pulse 72. Marked improving.'),
('AUD-004', '2026-11-12 09:30:00+00', 'DISCHARGE_APPROVED_DOCTOR', 'Dr. Sarah Lin, MD', 'doctor', 'CT-102', 'Marcus Brody', 'Approved patient for discharge following 4 consecutive fever-free days. Dispatched to Admin Queue.'),
('AUD-005', '2026-11-12 09:38:00+00', 'TEMPERATURE_CORRECTED', 'Nurse Jessica Hayes, RN', 'nurse', 'CT-110', 'Gabriel Santos', 'Authorized temperature correction: Changed 39.5°C -> 37.3°C. Reason: Calibration artifact on initial device, re-checked with calibrated unit.')
ON CONFLICT (id) DO NOTHING;

