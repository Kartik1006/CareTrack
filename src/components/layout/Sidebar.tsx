import { Activity, ArrowLeftRight, BarChart3, Building2, History, LayoutDashboard, ShieldCheck, Stethoscope, Thermometer, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DETAILS, type NavTabId } from '../../constants/roles';
export type { NavTabId } from '../../constants/roles';
interface SidebarProps { currentTab: NavTabId; onSelectTab: (tab: NavTabId) => void; isMobileOpen: boolean; onCloseMobile: () => void; onOpenRoles: () => void; }
const roleIcons = { nurse: Thermometer, doctor: Stethoscope, admin: Building2, management: BarChart3 };
export function Sidebar({ currentTab, onSelectTab, isMobileOpen, onCloseMobile, onOpenRoles }: SidebarProps) {
  const { userRole, todayTemperatureStats, todayDoctorVisitStats, pendingAdminDischarges, occupiedBedsCount, config } = useApp();
  const role = ROLE_DETAILS[userRole]; const WorkspaceIcon = roleIcons[userRole];
  const count = userRole === 'nurse' ? todayTemperatureStats.pending : userRole === 'doctor' ? todayDoctorVisitStats.pending : userRole === 'admin' ? pendingAdminDischarges.length : 0;
  const navigate = (id: NavTabId) => { onSelectTab(id); onCloseMobile(); };
  return <>
    {isMobileOpen && <button className="sidebar-backdrop" onClick={onCloseMobile} aria-label="Close navigation"/>}
    <aside className={`app-sidebar ${isMobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-brand"><span className="brand-symbol"><Activity size={24} strokeWidth={2.4}/></span><div><strong>CareTrack<span>+</span></strong><p>QUARANTINE MANAGEMENT</p></div><button onClick={onCloseMobile} aria-label="Close navigation" className="sidebar-close"><X size={19}/></button></div>
      <div className="facility-label"><span className="status-dot"/><span>Central quarantine facility</span></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav">
        <button className={currentTab === 'overview' ? 'active' : ''} aria-current={currentTab === 'overview' ? 'page' : undefined} onClick={() => navigate('overview')}><LayoutDashboard size={19}/><span>Overview</span></button>
        <button className={currentTab === userRole ? 'active' : ''} aria-current={currentTab === userRole ? 'page' : undefined} onClick={() => navigate(userRole)}><WorkspaceIcon size={19}/><span>{role.workspace}</span>{count > 0 && <b className="nav-count">{count}</b>}</button>
        <button className={currentTab === 'audit' ? 'active' : ''} aria-current={currentTab === 'audit' ? 'page' : undefined} onClick={() => navigate('audit')}><History size={19}/><span>Audit trail</span></button>
      </nav>
      <div className="sidebar-access"><div className="flex items-center gap-2"><ShieldCheck size={16}/><strong>{role.label} access</strong></div><p>{role.restriction}</p><button onClick={() => {onCloseMobile(); onOpenRoles();}}><ArrowLeftRight size={14}/>Switch demo role</button></div>
      <div className="sidebar-bottom"><div className="flex justify-between"><span>Facility capacity</span><strong>{occupiedBedsCount}<span className="text-slate-500 font-normal"> / {config.facilityMaxCapacity}</span></strong></div><div className="sidebar-capacity"><span style={{width:`${occupiedBedsCount/config.facilityMaxCapacity*100}%`}}/></div><p>{config.facilityMaxCapacity - occupiedBedsCount} beds available</p><div className="sidebar-footer"><span className="status-dot"/>Local demo <span>v3.0</span></div></div>
    </aside>
  </>;
}
