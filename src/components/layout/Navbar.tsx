import { CalendarDays, ChevronDown, Menu, Settings2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DETAILS, type NavTabId } from '../../constants/roles';
interface NavbarProps { currentTab: NavTabId; onOpenSettings: () => void; onOpenRoles: () => void; onToggleMobileMenu: () => void; }
export function Navbar({ currentTab, onOpenSettings, onOpenRoles, onToggleMobileMenu }: NavbarProps) {
  const { userRole, config } = useApp(); const role = ROLE_DETAILS[userRole];
  return <header className="app-header">
    <div className="header-location"><button aria-label="Open navigation" onClick={onToggleMobileMenu} className="icon-button mobile-menu-button"><Menu size={21}/></button><div><span className="eyebrow hidden sm:block">CARE OPERATIONS</span><p className="header-page">{currentTab === 'overview' ? 'Facility overview' : currentTab === 'audit' ? 'Audit trail' : role.workspace}</p></div></div>
    <div className="header-tools"><span className="header-date"><CalendarDays size={16}/>{new Date(config.currentSimulationDate + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</span>
      {userRole === 'admin' && <button className="icon-button" aria-label="Facility settings" title="Facility settings" onClick={onOpenSettings}><Settings2 size={19}/></button>}
      <button className="role-trigger" onClick={onOpenRoles} aria-haspopup="dialog" aria-label={`Switch role, current role: ${role.label}`}><span className={`staff-avatar role-${userRole}`}>{role.initials}</span><span className="role-trigger-copy"><span className="role-trigger-name">{role.shortName}</span><span className="role-trigger-label"><ShieldCheck size={12}/>{role.label}<span className="demo-pill">DEMO</span></span></span><ChevronDown size={15} className="text-slate-400 shrink-0"/></button>
    </div>
  </header>;
}
