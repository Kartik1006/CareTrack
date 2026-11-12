import React, { useState } from 'react';
import { Bed, UserPlus, AlertTriangle, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BedMatrixViewProps {
  onSelectPatient: (patientId: string) => void;
  onAdmitToRoom: (roomNumber: number) => void;
}

export const BedMatrixView: React.FC<BedMatrixViewProps> = ({
  onSelectPatient,
  onAdmitToRoom,
}) => {
  const { bedsMatrix, config, getPatientById, getTodayTemperatureRecord } = useApp();

  const [selectedWing, setSelectedWing] = useState<'all' | 'Wing A' | 'Wing B' | 'Wing C'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied'>('all');

  const filteredBeds = bedsMatrix.filter((bed) => {
    if (selectedWing !== 'all' && bed.zone !== selectedWing) return false;
    if (filterStatus === 'available' && bed.isOccupied) return false;
    if (filterStatus === 'occupied' && !bed.isOccupied) return false;
    return true;
  });

  const wings = [
    { name: 'Wing A', range: 'Beds 1 – 25', filter: 'Wing A' as const },
    { name: 'Wing B', range: 'Beds 26 – 50', filter: 'Wing B' as const },
    { name: 'Wing C', range: 'Beds 51 – 74', filter: 'Wing C' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Controls & Legend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedWing('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedWing === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Wings (74)
            </button>
            {wings.map((w) => (
              <button
                key={w.filter}
                onClick={() => setSelectedWing(w.filter)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedWing === w.filter ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Beds
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterStatus === 'available' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Vacant
            </button>
            <button
              onClick={() => setFilterStatus('occupied')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                filterStatus === 'occupied' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Occupied
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-400" />
            <span>Vacant Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-teal-600 text-white" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-500 text-white" />
            <span>Discharge Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 text-white" />
            <span>Fever (≥{config.feverThreshold}°C)</span>
          </div>
        </div>
      </div>

      {/* Grid of Beds */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(68px,1fr))] gap-2.5">
          {filteredBeds.map((bed) => {
            const patient = bed.patientId ? getPatientById(bed.patientId) : undefined;
            const todayTemp = patient ? getTodayTemperatureRecord(patient.id) : undefined;
            const hasFever = todayTemp && todayTemp.temperature >= config.feverThreshold;
            const isDischargeReady = bed.status === 'discharge_ready';

            let bedStyle = 'bg-slate-50 border-emerald-300 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50';
            let badgeBg = 'bg-emerald-100 text-emerald-800';

            if (isDischargeReady) {
              bedStyle = 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100';
              badgeBg = 'bg-purple-600 text-white';
            } else if (hasFever) {
              bedStyle = 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100';
              badgeBg = 'bg-rose-600 text-white';
            } else if (bed.isOccupied) {
              bedStyle = 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100';
              badgeBg = 'bg-teal-700 text-white';
            }

            return (
              <div
                key={bed.roomNumber}
                onClick={() => {
                  if (bed.isOccupied && bed.patientId) {
                    onSelectPatient(bed.patientId);
                  } else {
                    onAdmitToRoom(bed.roomNumber);
                  }
                }}
                className={`relative p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[92px] group ${bedStyle} hover:shadow-md hover:-translate-y-0.5`}
                title={
                  bed.isOccupied
                    ? `Room ${bed.roomNumber}: ${bed.patientName} (${bed.zone})`
                    : `Room ${bed.roomNumber}: Vacant — Click to Admit`
                }
              >
                {/* Header: Room Number and status icon */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${badgeBg}`}>
                    #{bed.roomNumber}
                  </span>
                  {isDischargeReady ? (
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                  ) : hasFever ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : bed.isOccupied ? (
                    <Bed className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100" />
                  )}
                </div>

                {/* Body info */}
                <div className="mt-1 text-left">
                  {bed.isOccupied ? (
                    <>
                      <p className="text-[11px] font-bold truncate leading-tight text-slate-900">
                        {bed.patientName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {todayTemp ? `${todayTemp.temperature}°C` : 'Pending'}
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-1">
                      <span className="text-[10px] font-semibold text-emerald-700 block">
                        Vacant
                      </span>
                      <span className="text-[9px] text-slate-400 block group-hover:text-emerald-700">
                        + Admit
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer wing indicator */}
                <div className="text-[9px] text-slate-400 truncate">
                  {bed.zone}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
