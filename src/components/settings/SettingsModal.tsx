import React, { useState } from 'react';
import {
  Settings,
  Database,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SupabaseService, SUPABASE_SCHEMA_SQL } from '../../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetToDemo, exportData, importData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'clinical' | 'supabase' | 'backup'>('clinical');

  // Clinical state
  const [threshold, setThreshold] = useState<number>(config.feverThreshold);
  const [simDate, setSimDate] = useState<string>(config.currentSimulationDate);

  // Supabase state
  const currentSupabaseSettings = SupabaseService.getSettings();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabaseSettings.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabaseSettings.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  // Import state
  const [importJsonText, setImportJsonText] = useState('');

  const handleSaveClinical = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      feverThreshold: Number(threshold),
      currentSimulationDate: simDate,
    });
    showToast('success', 'Configuration Saved', 'Clinical parameters updated.');
    onClose();
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await SupabaseService.testConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      SupabaseService.saveSettings({
        url: supabaseUrl,
        anonKey: supabaseKey,
        autoSync: true,
      });
      showToast('success', 'Supabase Connected', 'Supabase credentials saved and active.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caretrack-facility-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Exported', 'Facility database downloaded as JSON.');
  };

  const handleImportBackup = () => {
    if (!importJsonText.trim()) return;
    const ok = importData(importJsonText);
    if (ok) {
      setImportJsonText('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Settings & Database Integration"
      subtitle="Configure clinical thresholds, Supabase cloud connection, or manage data backups."
      icon={<Settings className="w-5 h-5 text-teal-600" />}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Subtabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'clinical'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Clinical Parameters</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'supabase'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud Integration</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'backup'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Backup & Demo Reset</span>
          </button>
        </div>

        {/* TAB 1: CLINICAL PARAMETERS */}
        {activeTab === 'clinical' && (
          <form onSubmit={handleSaveClinical} className="space-y-4">
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
              <strong>Clinical Fever Rule:</strong> The quarantine protocol identifies any temperature reading
              equal to or exceeding this threshold as an active fever episode, resetting the 3-day consecutive afebrile streak.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fever Threshold (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="36.0"
                    max="40.0"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full text-base font-bold font-mono px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    °C
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Default: 38.0°C</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Active Simulation Date
                </label>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Controls current calendar day for rounds</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              >
                Apply Parameters
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SUPABASE CLOUD INTEGRATION */}
        {activeTab === 'supabase' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Zero-Friction Cloud Persistence</span>
              </div>
              <p className="leading-relaxed">
                By default, CareTrack operates with high-fidelity, refresh-persistent local storage so that
                it runs 100% out-of-the-box when deployed on Vercel without requiring external setup.
              </p>
              <p className="leading-relaxed">
                To connect to your own Supabase project, provide your Project URL and Anon Key below, or configure{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_ANON_KEY</code> in Vercel.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting || !supabaseUrl || !supabaseKey}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs disabled:opacity-50"
                >
                  {isTesting ? 'Testing Connection...' : 'Test & Save Supabase Connection'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  {showSql ? 'Hide SQL Schema' : 'View Supabase SQL Schema'}
                </button>
              </div>

              {showSql && (
                <div className="mt-3 p-3 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono relative">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                    <span className="text-[11px] text-slate-400">PostgreSQL Schema for Supabase</span>
                    <button
                      onClick={handleCopySql}
                      className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] flex items-center gap-1 font-sans font-bold"
                    >
                      {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedSql ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                  <pre className="max-h-56 overflow-y-auto text-[11px] leading-tight text-slate-300">
                    {SUPABASE_SCHEMA_SQL}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BACKUP & DEMO RESET */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            {/* Reset to Demo */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-700" />
                Restore Canonical Demo Scenario
              </h4>
              <p className="text-amber-800 leading-relaxed">
                Restores preloaded realistic assessment data (admitted patients, pending/completed readings,
                fever flags, 3-day eligible discharges, and historical treatment outcomes).
              </p>
              <button
                type="button"
                onClick={() => {
                  resetToDemo();
                  onClose();
                }}
                className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Reset Database to Demo Defaults
              </button>
            </div>

            {/* Export Backup */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600" />
                Export Facility Database (JSON)
              </h4>
              <p className="text-slate-600">
                Download the complete active facility dataset including all patients, temperature history,
                doctor clinical notes, and audit logs.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON Backup
              </button>
            </div>

            {/* Import Backup */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-600" />
                Restore from JSON Backup
              </h4>
              <textarea
                rows={3}
                placeholder="Paste backup JSON string here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full font-mono text-[11px] p-2.5 rounded-lg border border-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={handleImportBackup}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs disabled:opacity-50"
              >
                Import & Restore Database
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
