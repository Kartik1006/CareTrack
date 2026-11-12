import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type NavTabId } from './components/layout/Sidebar';
import { ToastContainer } from './components/layout/ToastContainer';
import { FacilityOverview } from './components/overview/FacilityOverview';
import { NurseStation } from './components/nurse/NurseStation';
import { DoctorRounds } from './components/doctor/DoctorRounds';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManagementAnalytics } from './components/management/ManagementAnalytics';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { PatientDetailModal } from './components/patient/PatientDetailModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';

const AppContent: React.FC = () => {
  const { config, userRole, resetToDemo, selectedPatientId, setSelectedPatientId } = useApp();

  const [currentTab, setCurrentTab] = useState<NavTabId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <div className="bg-teal-950 text-teal-50 text-xs text-center px-4 py-2">Demo date: {config.currentSimulationDate} · saved in this browser · role switcher is demo access · calendar date controlled in administrator settings</div>
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {(['nurse', 'doctor', 'admin'].includes(currentTab) && currentTab !== userRole) && <div className="rounded-2xl border border-teal-200 bg-white p-8"><h1 className="font-bold text-xl">Switch role to continue</h1><p className="mt-2 text-slate-500">Select the {currentTab === 'admin' ? 'Administrator' : currentTab} demo role in the header or mobile menu to use this workspace.</p></div>}
          {currentTab === 'overview'  && (
            <FacilityOverview
              onNavigateTab={setCurrentTab}
              onSelectPatient={setSelectedPatientId}
            />
          )}

          {currentTab === 'nurse' && userRole === 'nurse' && (
            <NurseStation onSelectPatient={setSelectedPatientId} />
          )}

          {currentTab === 'doctor' && userRole === 'doctor' && (
            <DoctorRounds onSelectPatient={setSelectedPatientId} />
          )}

          {currentTab === 'admin' && userRole === 'admin' && (
            <AdminDashboard onSelectPatient={setSelectedPatientId} />
          )}

          {currentTab === 'management' && <ManagementAnalytics />}

          {currentTab === 'audit' && <AuditTrailView />}
        </main>
      </div>

      {/* Global Patient Detail Dossier */}
      <PatientDetailModal
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />

      {/* Settings & Supabase Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Reset Demo Data Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToDemo}
        title="Reset to Canonical Demo Data?"
        message="This will restore the default simulation dataset with preloaded active patients, pending/completed readings, fever cases, 3-day eligible discharges, and baseline outcomes. Any manual changes made in this session will be replaced."
        confirmLabel="Reset to Demo State"
        variant="warning"
      />

      {/* Animated Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
