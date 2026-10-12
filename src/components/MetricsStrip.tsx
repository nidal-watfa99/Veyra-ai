import React from 'react';
import { MessageSquareText, CalendarCheck2, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MetricsStrip: React.FC = () => {
  const { t } = useLanguage();

  const metrics = [
    {
      label: t('metricActiveDialogues'),
      value: '34',
      subtext: t('metricStarted2h'),
      rate: t('metricSlaUptime'),
      trend: '+18.4%',
      icon: MessageSquareText,
      accent: 'emerald',
    },
    {
      label: t('metricAppointments'),
      value: '18',
      subtext: t('metricTodayQueued'),
      rate: t('metricZeroDoubleBookings'),
      trend: '+24.1%',
      icon: CalendarCheck2,
      accent: 'champagne',
    },
    {
      label: t('metricPipelineValue'),
      value: '£4.82M',
      subtext: t('metricHighConviction'),
      rate: t('metricAvgVelocity'),
      trend: '+12.5%',
      icon: Award,
      accent: 'emerald',
    },
    {
      label: t('metricResolutionRate'),
      value: '96.4%',
      subtext: t('metricStrictProtocol'),
      rate: t('metricGuardrailIntegrity'),
      trend: '+2.1%',
      icon: ShieldAlert,
      accent: 'copper',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="surface-card p-4 rounded-xl relative overflow-hidden group hover:border-slate-700/60 transition-colors"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#94A3B8] font-medium tracking-tight">
                {item.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#0C1017] border hairline-border flex items-center justify-center text-[#64748B] group-hover:text-[#E2E8F0] transition-colors shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Middle row: Tabular Metric & Trend */}
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-2xl font-semibold tracking-tight text-[#F1F5F9] font-mono tabular-nums">
                {item.value}
              </div>
              <div className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3 rtl:-scale-x-100" />
                <span>{item.trend}</span>
              </div>
            </div>

            {/* Bottom row: Clean unboxed metadata with typographic separator */}
            <div className="pt-2.5 border-t hairline-divider flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="truncate">{item.subtext}</span>
              <span aria-hidden="true" className="px-1 text-slate-700">·</span>
              <span className="text-[#94A3B8] whitespace-nowrap font-mono">{item.rate}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
