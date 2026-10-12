import React, { useState } from 'react';
import { Conversation, AIEmployee } from '../types';
import { MessageSquare, Search, Filter, ShieldCheck, ArrowRight, CornerDownRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConversationsSectionProps {
  conversations: Conversation[];
  employees: AIEmployee[];
  onSelectConversation: (conv: Conversation) => void;
  selectedChannelFilter: string;
}

export const ConversationsSection: React.FC<ConversationsSectionProps> = ({
  conversations,
  employees,
  onSelectConversation,
  selectedChannelFilter,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel =
      selectedChannelFilter === 'All Channels' || c.channel === selectedChannelFilter;
    const matchesPriority =
      priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.intent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesPriority && matchesSearch;
  });

  const getAgent = (agentId: string) => {
    return employees.find((e) => e.id === agentId) || employees[0];
  };

  return (
    <div className="surface-card rounded-xl p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{t('dialoguesHeading')}</span>
            <span className="font-serif italic font-normal text-[#C5A059] text-lg">{t('dialoguesItalic')}</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {t('dialoguesSubtext')}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchDialogues')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="panel-recessed pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#64748B] rounded-lg border hairline-border focus:outline-none focus:border-slate-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="panel-recessed px-2.5 py-1.5 text-xs text-[#94A3B8] rounded-lg border hairline-border focus:outline-none cursor-pointer"
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="urgent">{t('urgent')}</option>
            <option value="high">{t('high')}</option>
            <option value="standard">{t('standard')}</option>
          </select>
        </div>
      </div>

      {/* High-Density Conversation List */}
      <div className="divide-y hairline-divider">
        {filteredConversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            {t('noConversationsMatch')}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const agent = getAgent(conv.assignedAgentId);
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="py-3.5 px-2 hover:bg-[#161D2B]/70 rounded-lg transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left: Client info and message snippet */}
                <div className="flex-1 min-w-0 pr-4 rtl:pr-0 rtl:pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white truncate">
                      {conv.clientName}
                    </span>
                    <span className="text-xs text-[#64748B] truncate">
                      ({conv.clientCompany})
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {conv.channel}
                    </span>
                    {conv.priority === 'urgent' && (
                      <>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-[11px] font-mono font-medium text-amber-400">
                          {t('urgent')}
                        </span>
                      </>
                    )}
                    {conv.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 rtl:ml-0 rtl:mr-1" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-[#94A3B8] line-clamp-1 leading-relaxed">
                    "{conv.lastMessage}"
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#64748B]">
                    <span className="font-mono text-[#C5A059]">Intent: {conv.intent}</span>
                    <span aria-hidden="true">·</span>
                    <span>{conv.turnCount} {t('turns')}</span>
                    {conv.appointmentLinked && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400/90 font-mono">
                          {t('linkedSlot')}: {conv.appointmentLinked.time}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Handling Agent & Timing */}
                <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                  <div className="flex items-center gap-2 text-right rtl:text-left">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-md object-cover border hairline-border shrink-0"
                    />
                    <div className="text-left rtl:text-right">
                      <div className="text-xs font-medium text-[#E2E8F0]">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono tabular-nums">
                        {conv.lastMessageTime}
                      </div>
                    </div>
                  </div>

                  <div className="p-1 text-[#64748B] group-hover:text-[#F1F5F9] transition-colors">
                    <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
