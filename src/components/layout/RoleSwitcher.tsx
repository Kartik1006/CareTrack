import { ArrowRight, Check, ClipboardCheck, Eye, ShieldCheck, Stethoscope, Thermometer } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ROLE_DETAILS } from '../../constants/roles';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';
const icons = {nurse: Thermometer, doctor: Stethoscope, admin: ClipboardCheck, management: Eye};
export function RoleSwitcher({isOpen, onClose, onSelect}: {isOpen: boolean; onClose: () => void; onSelect: (role: UserRole) => void}) {
  const {userRole} = useApp();
  return <Modal isOpen={isOpen} onClose={onClose} title="Choose your workspace" subtitle="Explore the assessment with role-specific permissions." icon={<ShieldCheck size={20}/>} maxWidth="2xl">
    <div className="role-options">{(Object.keys(ROLE_DETAILS) as UserRole[]).map(id => {
      const role = ROLE_DETAILS[id]; const Icon = icons[id]; const selected = userRole === id;
      return <button key={id} onClick={() => onSelect(id)} className={`role-option ${selected ? 'selected' : ''}`} aria-label={`Use ${role.label} role`}>
        <span className="flex items-center justify-between gap-2"><span className={`role-option-icon role-${id}`}><Icon size={22}/></span>{selected ? <span className="active-role-label"><Check size={13}/>Current role</span> : <ArrowRight size={16} className="text-slate-400"/>}</span>
        <strong>{role.label}</strong><span className="role-description">{role.description}</span><span className="role-permissions">{role.permissions.map(p => <span key={p}><Check size={13}/>{p}</span>)}</span>
      </button>;
    })}</div><p className="role-demo-note"><ShieldCheck size={16}/>Demo access only. Switching roles changes the available actions; it is not a secure sign-in.</p>
  </Modal>;
}
