import { useState } from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { canAccessTab, ROLE_DETAILS, type NavTabId } from './constants/roles';
import type { UserRole } from './types';
import { ToastContainer } from './components/layout/ToastContainer';
import { FacilityOverview } from './components/overview/FacilityOverview';
import { NurseStation } from './components/nurse/NurseStation';
import { DoctorRounds } from './components/doctor/DoctorRounds';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManagementAnalytics } from './components/management/ManagementAnalytics';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { PatientDetailModal } from './components/patient/PatientDetailModal';
import { SettingsModal } from './components/settings/SettingsModal';

function AppContent() {
  const { config, userRole, setUserRole, selectedPatientId, setSelectedPatientId } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTabId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const tab = canAccessTab(userRole, currentTab) ? currentTab : userRole;
  const navigate = (next: NavTabId) => { if (canAccessTab(userRole, next)) setCurrentTab(next); };
  const selectRole = (role: UserRole) => {
    setSelectedPatientId(null); setIsSettingsOpen(false); setIsMobileMenuOpen(false);
    setUserRole(role); setCurrentTab(role); setIsRolesOpen(false);
  };
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Sidebar currentTab={tab} onSelectTab={navigate} isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} onOpenRoles={() => setIsRolesOpen(true)}/>
    <div className="app-body">
      <Navbar currentTab={tab} onOpenSettings={() => setIsSettingsOpen(true)} onOpenRoles={() => setIsRolesOpen(true)} onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}/>
      <div className="app-status-bar"><span><Database size={13}/>Local demo · saved in this browser</span><span>Simulation date <strong>{config.currentSimulationDate}</strong></span></div>
      <main id="main-content" tabIndex={-1} className="app-main">
        {tab !== 'overview' && <div className="workspace-context"><ShieldCheck size={15}/><span>{ROLE_DETAILS[userRole].label} workspace</span><span className="workspace-context-detail">{ROLE_DETAILS[userRole].description}</span></div>}
        <div key={`${tab}-${userRole}`} className="workspace-content">
          {tab === 'overview' && <FacilityOverview onNavigateTab={navigate} onSelectPatient={setSelectedPatientId}/>}
          {tab === 'nurse' && <NurseStation onSelectPatient={setSelectedPatientId}/>}
          {tab === 'doctor' && <DoctorRounds onSelectPatient={setSelectedPatientId}/>}
          {tab === 'admin' && <AdminDashboard onSelectPatient={setSelectedPatientId}/>}
          {tab === 'management' && <ManagementAnalytics/>}
          {tab === 'audit' && <AuditTrailView/>}
        </div>
        <footer className="app-footer"><span>CareTrack · Quarantine & treatment management</span><span>Assessment environment · fictional patient data</span></footer>
      </main>
    </div>
    <PatientDetailModal patientId={selectedPatientId} onClose={() => setSelectedPatientId(null)}/>
    {userRole === 'admin' && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>}
    <RoleSwitcher isOpen={isRolesOpen} onClose={() => setIsRolesOpen(false)} onSelect={selectRole}/>
    <ToastContainer/>
  </div>;
}
export default function App() { return <AppProvider><AppContent/></AppProvider>; }
