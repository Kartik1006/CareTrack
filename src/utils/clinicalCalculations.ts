import type { Patient, TemperatureRecord, DoctorVisit } from '../types';
export interface DischargeEligibilityResult {
  isEligible: boolean; consecutiveFeverFreeDays: number; requiredDays: number;
  recentReadings: { date: string; temperature: number; isFever: boolean }[];
  reason: string; hasFeverToday: boolean; latestTemperature?: number;
}
export function evaluateDischargeEligibility(
  patient: Patient, temperatures: TemperatureRecord[], feverThreshold = 38, requiredDays = 3,
  today = new Date().toISOString().slice(0,10), visits: DoctorVisit[] = []
): DischargeEligibilityResult {
  const records = temperatures.filter(r => r.patientId === patient.id && r.date <= today && r.date >= patient.admissionDate);
  const current = records.find(r => r.date === today);
  const recentReadings: DischargeEligibilityResult['recentReadings'] = [];
  let consecutiveFeverFreeDays = 0;
  for (let offset = 1; offset <= requiredDays; offset++) {
    const day = new Date(today + 'T12:00:00Z');
    day.setUTCDate(day.getUTCDate() - offset);
    const date = day.toISOString().slice(0,10);
    const reading = records.find(r => r.date === date);
    if (!reading || !Number.isFinite(reading.temperature) || reading.temperature >= feverThreshold ||
      !visits.some(v => v.patientId === patient.id && v.date === date)) break;
    consecutiveFeverFreeDays++;
    recentReadings.push({date, temperature: reading.temperature, isFever: false});
  }
  const hasFeverToday = !!current && current.temperature >= feverThreshold;
  const isEligible = patient.status === 'admitted' && consecutiveFeverFreeDays >= requiredDays && !hasFeverToday;
  return {isEligible, consecutiveFeverFreeDays, requiredDays, recentReadings, hasFeverToday,
    latestTemperature: current?.temperature,
    reason: hasFeverToday ? 'Fever today blocks discharge.' :
      `${consecutiveFeverFreeDays}/${requiredDays} complete calendar days before today with a fever-free reading and doctor visit. Today's reading and visit are also required before approval.`};
}
/**
 * Calculates Treatment Success Rate and Mortality Rate:
 * Treatment Success Rate = Recovered / (Recovered + Recorded Deaths) * 100%
 */
export function calculateOutcomeMetrics(patients: Patient[]): {
  totalRecovered: number;
  totalDeaths: number;
  totalCompletedOutcomes: number;
  treatmentSuccessRate: number; // percentage (0 - 100)
  mortalityRate: number; // percentage (0 - 100)
  isMortalityWarning: boolean;
} {
  const recovered = patients.filter((p) => p.status === 'discharged' && p.outcome === 'recovered').length;
  const deaths = patients.filter((p) => p.status === 'deceased' && p.outcome === 'deceased').length;
  const completed = recovered + deaths;
  let treatmentSuccessRate = 0;
  let mortalityRate = 0;
  if (completed > 0) {
    treatmentSuccessRate = Number(((recovered / completed) * 100).toFixed(1));
    mortalityRate = Number(((deaths / completed) * 100).toFixed(1));
  }
  const isMortalityWarning = completed > 0 && deaths / completed > 0.15;
  return {
    totalRecovered: recovered,
    totalDeaths: deaths,
    totalCompletedOutcomes: completed,
    treatmentSuccessRate,
    mortalityRate,
    isMortalityWarning,
  };
}
