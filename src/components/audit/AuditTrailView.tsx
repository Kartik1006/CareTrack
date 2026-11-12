import React, { useState } from 'react';
import {
  History,
  Search,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Stethoscope,
  Building2,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import type { AuditActionType, UserRole } from '../../types';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const searchMatch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patientName && log.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.patientId && log.patientId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!searchMatch) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (roleFilter !== 'all' && log.actorRole !== roleFilter) return false;

    return true;
  });

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'PATIENT_ADMITTED':
        return <Badge variant="info" icon={<Building2 className="w-3 h-3" />}>Admitted</Badge>;
      case 'TEMPERATURE_RECORDED':
        return <Badge variant="neutral" icon={<Thermometer className="w-3 h-3" />}>Temp Logged</Badge>;
      case 'TEMPERATURE_CORRECTED':
        return <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Temp Corrected</Badge>;
      case 'DOCTOR_VISIT_RECORDED':
        return <Badge variant="purple" icon={<Stethoscope className="w-3 h-3" />}>Doctor Visit</Badge>;
      case 'DISCHARGE_APPROVED_DOCTOR':
        return <Badge variant="success" icon={<Award className="w-3 h-3" />}>Doctor Clearance</Badge>;
      case 'DISCHARGE_FINALIZED_ADMIN':
        return <Badge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>Bed Released</Badge>;
      case 'PATIENT_DECEASED':
        return <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>Deceased</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'nurse':
        return <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-teal-200">Nurse</span>;
      case 'doctor':
        return <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-indigo-200">Doctor</span>;
      case 'admin':
        return <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-amber-200">Admin</span>;
      case 'management':
        return <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[10px] border border-emerald-200">Management</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-slate-700" />
            Compliance & Clinical Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable system logs documenting all patient admissions, temperature entries, corrections, clinical rounds, and discharges.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
          {auditLogs.length} Events Logged
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, patient or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Action Types</option>
            <option value="TEMPERATURE_RECORDED">Temperature Recorded</option>
            <option value="TEMPERATURE_CORRECTED">Temperature Corrected</option>
            <option value="DOCTOR_VISIT_RECORDED">Doctor Visit</option>
            <option value="DISCHARGE_APPROVED_DOCTOR">Discharge Approved</option>
            <option value="DISCHARGE_FINALIZED_ADMIN">Discharge Finalized</option>
            <option value="PATIENT_ADMITTED">Patient Admitted</option>
            <option value="PATIENT_DECEASED">Patient Deceased</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Roles</option>
            <option value="nurse">Nurse</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Administrator</option>
            <option value="management">Management</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Audit Record Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateStr = dateObj.toISOString().slice(0, 10);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-800 font-semibold block">{timeStr}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{dateStr}</span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {getRoleBadge(log.actorRole)}
                          <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">
                            {log.actorName}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {log.patientName ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">{log.patientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{log.patientId}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Facility Wide</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 leading-relaxed max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
