import React from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { AppProvider, useApp } from '../src/context/AppContext';
import { calculateOutcomeMetrics, evaluateDischargeEligibility } from '../src/utils/clinicalCalculations';
import { INITIAL_PATIENTS, INITIAL_TEMPERATURE_RECORDS, INITIAL_DOCTOR_VISITS } from '../src/constants/mockData';
import { StorageService } from '../src/services/storage';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(() => localStorage.clear());
afterEach(cleanup);
const setup = () => renderHook(() => useApp(), { wrapper: ({ children }) => <AppProvider>{children}</AppProvider> });
const admission = { fullName: 'Asha Rao', age: 29, gender: 'Female' as const, nationalId: 'ASSESS-001', contactPhone: '9876543210', emergencyContact: 'Ravi 9876543211', roomNumber: 74, symptoms: ['Observation'] };
const visit = (patientId: string) => ({ patientId, clinicalNotes: 'Stable, no fever.', treatmentGiven: 'Hydration and observation', conditionSummary: 'Stable' as const });

test('full admission to discharge workflow across four calendar days, roles and refresh', () => {
  const {result, unmount} = setup();
  expect(result.current.admitPatient(admission).success).toBe(false);
  act(() => result.current.setUserRole('admin'));
  let id = '';
  act(() => { const r = result.current.admitPatient(admission); expect(r.success).toBe(true); id = r.patientId!; });
  for (const date of ['2026-11-12','2026-11-13','2026-11-14','2026-11-15']) {
    act(() => result.current.setUserRole('admin'));
    act(() => result.current.updateConfig({currentSimulationDate: date}));
    act(() => result.current.setUserRole('doctor'));
    act(() => expect(result.current.recordDoctorVisit(visit(id)).success).toBe(false));
    act(() => result.current.setUserRole('nurse'));
    act(() => expect(result.current.recordTemperature(id,36.8).success).toBe(true));
    act(() => expect(result.current.recordTemperature(id,36.9).success).toBe(false));
    act(() => result.current.setUserRole('doctor'));
    act(() => expect(result.current.recordDoctorVisit(visit(id)).success).toBe(true));
    act(() => expect(result.current.recordDoctorVisit(visit(id)).success).toBe(false));
    if (date !== '2026-11-15') act(() => expect(result.current.approveDischarge(id,'Stable').success).toBe(false));
  }
  act(() => expect(result.current.approveDischarge(id,'Recovered, home care advised.').success).toBe(true));
  act(() => expect(result.current.finalizeDischarge(id).success).toBe(false));
  act(() => result.current.setUserRole('admin'));
  const occupied = result.current.occupiedBedsCount;
  act(() => expect(result.current.finalizeDischarge(id).success).toBe(true));
  expect(result.current.occupiedBedsCount).toBe(occupied-1);
  expect(result.current.bedsMatrix.find(b => b.roomNumber === 74)?.isOccupied).toBe(false);
  act(() => expect(result.current.finalizeDischarge(id).success).toBe(false));
  expect(result.current.auditLogs.some(a => a.patientId === id && a.action === 'DISCHARGE_FINALIZED_ADMIN')).toBe(true);
  unmount();
  const restored = setup();
  expect(restored.result.current.getPatientById(id)?.status).toBe('discharged');
});

test('calendar gaps, missing visits, fever threshold and stale histories block eligibility', () => {
  const p = INITIAL_PATIENTS[0];
  const check = (temps = INITIAL_TEMPERATURE_RECORDS, visits = INITIAL_DOCTOR_VISITS, today='2026-11-12') => evaluateDischargeEligibility(p,temps,38,3,today,visits);
  expect(check().isEligible).toBe(true);
  expect(check(INITIAL_TEMPERATURE_RECORDS.filter(t => t.date !== '2026-11-10')).isEligible).toBe(false);
  expect(check(undefined,INITIAL_DOCTOR_VISITS.filter(v => v.date !== '2026-11-10')).isEligible).toBe(false);
  expect(check(INITIAL_TEMPERATURE_RECORDS.map(t => t.patientId===p.id && t.date==='2026-11-11' ? {...t,temperature:38} : t)).isEligible).toBe(false);
  expect(check(undefined,undefined,'2026-11-20').isEligible).toBe(false);
});

test('corrections require a reason and fever blocks pending discharge release', () => {
  const {result} = setup();
  act(() => expect(result.current.recordTemperature('CT-102',38,true,'').success).toBe(false));
  act(() => expect(result.current.recordTemperature('CT-102',NaN).success).toBe(false));
  act(() => expect(result.current.recordTemperature('CT-102',38,true,'Verified with replacement thermometer').success).toBe(true));
  expect(result.current.getTodayTemperatureRecord('CT-102')?.isCorrected).toBe(true);
  act(() => result.current.setUserRole('admin'));
  act(() => expect(result.current.finalizeDischarge('CT-102').success).toBe(false));
});

test('capacity, room collision and duplicate identity are enforced', () => {
  const {result} = setup();
  act(() => result.current.setUserRole('admin'));
  act(() => expect(result.current.admitPatient({...admission,roomNumber:1}).success).toBe(false));
  act(() => expect(result.current.admitPatient({...admission,fullName:''}).success).toBe(false));
  act(() => expect(result.current.admitPatient(admission).success).toBe(true));
  act(() => expect(result.current.admitPatient({...admission,roomNumber:71}).success).toBe(false));
  while (result.current.availableBedsCount > 0) {
    const room = result.current.bedsMatrix.find(b=>!b.isOccupied)!.roomNumber;
    act(() => expect(result.current.admitPatient({...admission,roomNumber:room,nationalId:`ROOM-${room}`}).success).toBe(true));
  }
  expect(result.current.occupiedBedsCount).toBe(74);
  act(() => expect(result.current.admitPatient({...admission,nationalId:'OVERFLOW'}).success).toBe(false));
});

test('outcomes count only finalized patients and warning is strictly above 15 percent', () => {
  const p=INITIAL_PATIENTS[0];
  const cases=(deaths:number) => Array.from({length:20},(_,i)=>({...p,id:String(i),status:i<deaths?'deceased' as const:'discharged' as const,outcome:i<deaths?'deceased' as const:'recovered' as const}));
  expect(calculateOutcomeMetrics(cases(3)).isMortalityWarning).toBe(false);
  expect(calculateOutcomeMetrics(cases(4)).treatmentSuccessRate).toBe(80);
  expect(calculateOutcomeMetrics(cases(4)).isMortalityWarning).toBe(true);
  expect(calculateOutcomeMetrics([{...p,outcome:'recovered'}]).totalCompletedOutcomes).toBe(0);
});

test('terminal outcomes are immutable and require doctor role and notes', () => {
  const {result}=setup();
  act(()=>expect(result.current.recordPatientDeceased('CT-104','Clinical outcome documented').success).toBe(false));
  act(()=>result.current.setUserRole('doctor'));
  act(()=>expect(result.current.recordPatientDeceased('CT-104','').success).toBe(false));
  act(()=>expect(result.current.recordPatientDeceased('CT-104','Clinical outcome documented').success).toBe(true));
  act(()=>expect(result.current.recordPatientDeceased('CT-104','Repeated').success).toBe(false));
  act(()=>expect(result.current.recordDoctorVisit(visit('CT-104')).success).toBe(false));
});

test('backup roundtrip preserves valid data and rejects malformed restores without mutation', () => {
  const backup = StorageService.exportFullBackup();
  expect(StorageService.importBackup(backup)).toBe(true);
  const before = StorageService.getPatients();
  expect(StorageService.importBackup('{"patients":[]}')).toBe(false);
  expect(StorageService.importBackup(JSON.stringify({...JSON.parse(backup), config: {facilityMaxCapacity: 200}}))).toBe(false);
  expect(StorageService.getPatients()).toEqual(before);
});
