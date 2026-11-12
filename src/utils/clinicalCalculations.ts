import type { Patient, TemperatureRecord } from '../types';

export interface DischargeEligibilityResult {
  isEligible: boolean;
  consecutiveFeverFreeDays: number;
  requiredDays: number;
  recentReadings: {
    date: string;
    temperature: number;
    isFever: boolean;
  }[];
  reason: string;
  hasFeverToday: boolean;
  latestTemperature?: number;
}

/**
 * Checks if a patient is eligible for discharge:
 * Requires 3 consecutive complete calendar days without fever (temp < feverThreshold).
 */
export function evaluateDischargeEligibility(
  patient: Patient,
  allTemperatures: TemperatureRecord[],
  feverThreshold: number = 38.0,
  requiredDays: number = 3
): DischargeEligibilityResult {
  // If patient is not currently admitted, not eligible
  if (patient.status !== 'admitted') {
    return {
      isEligible: false,
      consecutiveFeverFreeDays: 0,
      requiredDays,
      recentReadings: [],
      reason: `Patient status is ${patient.status}.`,
      hasFeverToday: false,
    };
  }

  // Filter records for this patient and sort descending by date and recordedAt
  const patientRecords = allTemperatures
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.recordedAt.localeCompare(a.recordedAt));

  if (patientRecords.length === 0) {
    return {
      isEligible: false,
      consecutiveFeverFreeDays: 0,
      requiredDays,
      recentReadings: [],
      reason: 'No temperature records logged yet.',
      hasFeverToday: false,
    };
  }

  // Deduplicate by date (take the latest reading for each date, in case of corrections)
  const dateMap = new Map<string, TemperatureRecord>();
  for (const record of patientRecords) {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, record);
    }
  }

  const uniqueDateRecords = Array.from(dateMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const recentReadings = uniqueDateRecords.slice(0, 5).map((r) => ({
    date: r.date,
    temperature: r.temperature,
    isFever: r.temperature >= feverThreshold,
  }));

  const latest = uniqueDateRecords[0];
  const hasFeverToday = latest ? latest.temperature >= feverThreshold : false;

  // Count consecutive afebrile days starting from the latest reading
  let consecutiveDays = 0;
  for (let i = 0; i < uniqueDateRecords.length; i++) {
    const rec = uniqueDateRecords[i];
    if (rec.temperature < feverThreshold) {
      consecutiveDays++;
      if (consecutiveDays >= requiredDays) {
        break;
      }
    } else {
      // Fever encountered, streak broken
      break;
    }
  }

  const isEligible = consecutiveDays >= requiredDays;
  let reason = '';
  if (isEligible) {
    reason = `Patient has maintained ${consecutiveDays} consecutive fever-free days (< ${feverThreshold.toFixed(1)}°C) and is clinically eligible for discharge clearance.`;
  } else if (hasFeverToday) {
    reason = `Patient recorded fever (${latest.temperature.toFixed(1)}°C >= ${feverThreshold.toFixed(1)}°C) today. Discharge streak reset.`;
  } else {
    reason = `Patient has ${consecutiveDays} of ${requiredDays} required fever-free days (< ${feverThreshold.toFixed(1)}°C).`;
  }

  return {
    isEligible,
    consecutiveFeverFreeDays: consecutiveDays,
    requiredDays,
    recentReadings,
    reason,
    hasFeverToday,
    latestTemperature: latest?.temperature,
  };
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
  const recovered = patients.filter((p) => p.outcome === 'recovered').length;
  const deaths = patients.filter((p) => p.outcome === 'deceased').length;
  const completed = recovered + deaths;

  let treatmentSuccessRate = 100;
  let mortalityRate = 0;

  if (completed > 0) {
    treatmentSuccessRate = Number(((recovered / completed) * 100).toFixed(1));
    mortalityRate = Number(((deaths / completed) * 100).toFixed(1));
  }

  const isMortalityWarning = mortalityRate > 15;

  return {
    totalRecovered: recovered,
    totalDeaths: deaths,
    totalCompletedOutcomes: completed,
    treatmentSuccessRate,
    mortalityRate,
    isMortalityWarning,
  };
}
