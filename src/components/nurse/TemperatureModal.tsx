import React, { useState, useEffect } from 'react';
import { Thermometer, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';

interface TemperatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  mode: 'new' | 'correct';
}

export const TemperatureModal: React.FC<TemperatureModalProps> = ({
  isOpen,
  onClose,
  patient,
  mode,
}) => {
  const { recordTemperature, config, getTodayTemperatureRecord } = useApp();

  const [tempInput, setTempInput] = useState<string>('37.0');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const existingReading = patient ? getTodayTemperatureRecord(patient.id) : undefined;

  useEffect(() => {
    if (patient) {
      if (mode === 'correct' && existingReading) {
        setTempInput(existingReading.temperature.toString());
        setReason('');
      } else {
        setTempInput('36.8');
        setReason('');
      }
      setErrorMsg('');
    }
  }, [patient, mode, existingReading]);

  if (!patient) return null;

  const numericTemp = parseFloat(tempInput);
  const isValidTemp = !isNaN(numericTemp) && numericTemp >= 30.0 && numericTemp <= 44.0;
  const isFever = isValidTemp && numericTemp >= config.feverThreshold;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTemp) {
      setErrorMsg('Please enter a valid physiological temperature (30.0°C - 44.0°C).');
      return;
    }

    if (mode === 'correct' && !reason.trim()) {
      setErrorMsg('Authorized corrections require a specific medical / procedural reason.');
      return;
    }

    const result = recordTemperature(
      patient.id,
      numericTemp,
      mode === 'correct',
      mode === 'correct' ? reason : undefined
    );

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  const quickTemps = [36.5, 36.8, 37.2, 37.6, 38.2, 38.8, 39.4];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'correct'
          ? `Authorized Temperature Correction — Room ${patient.roomNumber}`
          : `Record Daily Temperature — Room ${patient.roomNumber}`
      }
      subtitle={`Patient: ${patient.fullName} (${patient.id}) • Wing: ${patient.zone}`}
      icon={<Thermometer className="w-5 h-5" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'correct' && existingReading && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authorized Audit Correction Protocol</p>
              <p className="mt-0.5 text-amber-700">
                Current recorded reading for today is <strong className="font-bold">{existingReading.temperature}°C</strong>.
                Modifying this entry will preserve the previous value in the permanent audit trail.
              </p>
            </div>
          </div>
        )}

        {/* Temperature Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Patient Temperature (°C)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="30"
              max="44"
              value={tempInput}
              onChange={(e) => {
                setTempInput(e.target.value);
                setErrorMsg('');
              }}
              required
              className="w-full text-2xl font-bold text-slate-900 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all pr-12 font-mono"
              placeholder="37.0"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
              °C
            </span>
          </div>
        </div>

        {/* Quick select buttons */}
        <div>
          <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Quick Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickTemps.map((val) => {
              const isSelected = numericTemp === val;
              const isPresFever = val >= config.feverThreshold;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setTempInput(val.toString());
                    setErrorMsg('');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all ${
                    isSelected
                      ? isPresFever
                        ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-400'
                        : 'bg-teal-600 text-white font-bold ring-2 ring-teal-400'
                      : isPresFever
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {val.toFixed(1)}°
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Interpretation Preview */}
        {isValidTemp && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
              isFever
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFever ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {isFever ? 'Fever Alert Triggered' : 'Afebrile (Normal Range)'}
                </span>
                <p className="text-[11px] opacity-90">
                  {isFever
                    ? `Reading exceeds fever threshold of ${config.feverThreshold}°C. Patient will be highlighted.`
                    : `Reading is within normal temperature limits (< ${config.feverThreshold}°C).`}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-xs uppercase ${
                isFever ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {isFever ? 'Fever' : 'Normal'}
            </span>
          </div>
        )}

        {/* Correction Reason (if in correct mode) */}
        {mode === 'correct' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Authorized Correction Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none mb-2"
            >
              <option value="">-- Select standard correction reason --</option>
              <option value="Initial probe calibration error; re-measured with calibrated tympanic unit">
                Initial probe calibration error; re-measured with calibrated tympanic unit
              </option>
              <option value="Typographical entry error during initial round">
                Typographical entry error during initial round
              </option>
              <option value="Immediate clinical re-test after antipyretic administration">
                Immediate clinical re-test after antipyretic administration
              </option>
              <option value="Patient drank warm beverage immediately prior to first reading">
                Patient drank warm beverage immediately prior to first reading
              </option>
              <option value="Custom specified clinical reason">Other clinical reason (type below)</option>
            </select>
            <input
              type="text"
              placeholder="Provide specific justification details for audit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {errorMsg}
          </p>
        )}

        {/* Action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-all ${
              isFever
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
            }`}
          >
            {mode === 'correct' ? 'Save Authorized Correction' : 'Submit Temperature Reading'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
