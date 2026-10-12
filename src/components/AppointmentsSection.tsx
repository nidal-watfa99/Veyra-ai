import React, { useState } from 'react';
import { Appointment, AIEmployee } from '../types';
import { Calendar, Clock, MapPin, FileCheck2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AppointmentsSectionProps {
  appointments: Appointment[];
  employees: AIEmployee[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  appointments,
  employees,
  onSelectAppointment,
}) => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAppointments = appointments.filter((apt) => {
    if (filterType === 'all') return true;
    return apt.status === filterType;
  });

  const getAgent = (agentId: string) => {
    return employees.find((e) => e.id === agentId) || employees[0];
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'prep_ready':
        return t('dossierReady');
      case 'confirmed':
        return t('confirmed');
      case 'rescheduled':
        return t('autoRescheduled');
      default:
        return status;
    }
  };

  return (
    <div className="surface-card rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{t('appointmentsHeading')}</span>
            <span className="font-serif italic font-normal text-[#C5A059] text-lg">{t('appointmentsItalic')}</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {t('appointmentsSubtext')}
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 bg-[#0C1017] p-1 rounded-lg border hairline-border overflow-x-auto">
          {[
            { key: 'all', label: t('allSlots') },
            { key: 'prep_ready', label: t('dossierReady') },
            { key: 'confirmed', label: t('confirmed') },
            { key: 'rescheduled', label: t('autoRescheduled') },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize whitespace-nowrap shrink-0 ${
                filterType === item.key
                  ? 'bg-[#161D2B] text-[#F1F5F9] border hairline-border'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Appointments */}
      {filteredAppointments.length === 0 && (
        <div className="py-8 text-center text-xs text-[#64748B]">{t('noItemsMatch')}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAppointments.map((apt) => {
          const agent = getAgent(apt.assignedAgentId);
          return (
            <div
              key={apt.id}
              onClick={() => onSelectAppointment(apt)}
              className="surface-card-subtle p-4 rounded-xl hover:border-slate-700/70 transition-colors cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Top: Date/Time & Status */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-[#F1F5F9] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{apt.date}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-[#C5A059]">{apt.time}</span>
                  </div>

                  {/* Clean unboxed status with typographic dot */}
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <span
                      className={
                        apt.status === 'prep_ready'
                          ? 'text-emerald-400 font-medium'
                          : apt.status === 'confirmed'
                          ? 'text-teal-400 font-medium'
                          : 'text-amber-400 font-medium'
                      }
                    >
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>

                {/* Title & Client */}
                <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-white mb-0.5">
                  {apt.title}
                </h3>
                <div className="text-xs text-[#94A3B8] mb-2.5">
                  <span>{apt.clientName}</span>
                  <span className="text-[#64748B]"> — {apt.clientRole}, {apt.clientCompany}</span>
                </div>

                {/* Location / Channel */}
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                  <span className="truncate">{apt.channel}</span>
                </div>
              </div>

              {/* Footer: Handling Agent & Prep status */}
              <div className="pt-2.5 border-t hairline-divider flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded object-cover border hairline-border shrink-0"
                  />
                  <span className="text-[11px] text-[#94A3B8]">
                    {t('orchestratedBy')} {agent.name}
                  </span>
                </div>

                {apt.prepDocumentGenerated && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <FileCheck2 className="w-3 h-3" />
                    <span>{t('briefingPack')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
