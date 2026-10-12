import React, { useState, useEffect } from 'react';
import { Database, FileCode2, ShieldAlert, CheckCircle2, Lock, ArrowUpRight, Upload, X, Search, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Translations } from '../i18n/translations';

interface VaultDocument {
  id: string;
  title: string;
  category: string;
  tokens: string;
  status: string;
  lastSync: string;
  guardrailLevel: string;
  summary: string;
  fullDirectives?: string[];
}

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-01',
    title: 'Aethelgard Master Advisory Retainer & Tariff Schedule (Q4)',
    category: 'Commercial Contracts & Pricing',
    tokens: '48,200 tokens',
    status: 'Indexed & Enforced',
    lastSync: 'Synced 4h ago',
    guardrailLevel: 'Strict Binding',
    summary: 'Authoritative schedule for retainer tiers (£15k/mo baseline), cross-border asset management charges, and partner rate cards.',
    fullDirectives: [
      'Retainer baseline: £15,000/month for Family Office Tier I',
      'Discretionary asset management: 65 bps on assets between £20M - £100M',
      'Advisory consultation: £1,200/hour for Senior Partner time in Mayfair/Zurich',
      'All proposed figures must explicitly reference Schedule Q4-2026',
    ],
  },
  {
    id: 'doc-02',
    title: 'SEC Fiduciary Communication & Disclaimers Protocol (Ref: SEC-2026)',
    category: 'Regulatory Compliance',
    tokens: '92,400 tokens',
    status: 'Indexed & Enforced',
    lastSync: 'Synced 1d ago',
    guardrailLevel: 'Zero-Tolerance Block',
    summary: 'Automatic interception of any speculative forward-looking projection. Injects formal disclaimers across all WhatsApp & email threads.',
    fullDirectives: [
      'Strict ban on words: "guaranteed yield", "risk-free", "certain outcome"',
      'Required footnote: "Past portfolio performance does not predict future returns"',
      'Mandatory partner introduction for prospective liquid asset transfers over $20M',
    ],
  },
  {
    id: 'doc-03',
    title: 'Mayfair & Zurich Executive Calendar Availability Matrix',
    category: 'Scheduling & Logistics',
    tokens: '12,800 tokens',
    status: 'Live Real-time Sync',
    lastSync: 'Continuous Webhook',
    guardrailLevel: 'Conflict Prevention',
    summary: 'Governs senior partner office hours, cross-Atlantic flight buffers, and Mayfair private briefing suite capacity.',
    fullDirectives: [
      'London Mayfair Suite hours: 09:00 - 18:00 BST Monday through Thursday',
      'Zurich Baur au Lac briefing rooms: 10:00 - 17:00 CET Tuesday & Friday',
      'Minimum buffer: 45 minutes between distinct client executive consultations',
    ],
  },
  {
    id: 'doc-04',
    title: 'Bespoke Private Client Lexicon & Tone Calibration Guide',
    category: 'Brand Architecture',
    tokens: '31,500 tokens',
    status: 'Indexed & Enforced',
    lastSync: 'Synced 3d ago',
    guardrailLevel: 'Tone Alignment',
    summary: 'Guidelines for discreet, calm, non-coercive diplomacy suitable for UHNW families, sovereign wealth funds, and private offices.',
    fullDirectives: [
      'Address UHNW contacts by formal salutations until reciprocity established',
      'Tone: authoritative, composed, highly courteous, zero sales aggression',
      'Bilingual French/English nuance detection for Swiss and Monaco inquiries',
    ],
  },
];

// Category values stay as stable data keys (used for filtering); only their labels are translated.
const CATEGORY_LABEL_KEYS: Record<string, keyof Translations> = {
  'Commercial Contracts & Pricing': 'vaultCatCommercial',
  'Regulatory Compliance': 'vaultCatRegulatory',
  'Scheduling & Logistics': 'vaultCatScheduling',
  'Brand Architecture': 'vaultCatBrand',
};

export const KnowledgeVaultSection: React.FC = () => {
  const { t } = useLanguage();
  const catLabel = (cat: string) => (CATEGORY_LABEL_KEYS[cat] ? t(CATEGORY_LABEL_KEYS[cat]) : cat);
  const [documents, setDocuments] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<VaultDocument | null>(null);

  // New document form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Regulatory Compliance');
  const [newSummary, setNewSummary] = useState('');
  const [newDirectives, setNewDirectives] = useState('');

  // Escape closes whichever dialog is open
  useEffect(() => {
    if (!isUploadModalOpen && !activeDoc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isUploadModalOpen) setIsUploadModalOpen(false);
      else setActiveDoc(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isUploadModalOpen, activeDoc]);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const directivesArray = newDirectives
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      tokens: `${Math.floor(Math.random() * 40000 + 15000).toLocaleString()} ${t('tokensCount')}`,
      status: 'Indexed & Enforced',
      lastSync: 'Just now',
      guardrailLevel: 'Strict Binding',
      summary: newSummary || 'Institutional directives ingested into Veyra cognitive layer.',
      fullDirectives: directivesArray.length > 0 ? directivesArray : ['Policy validated & bound to active personnel.'],
    };

    setDocuments([newDoc, ...documents]);
    setNewTitle('');
    setNewSummary('');
    setNewDirectives('');
    setIsUploadModalOpen(false);
  };

  const categories = ['all', 'Commercial Contracts & Pricing', 'Regulatory Compliance', 'Scheduling & Logistics', 'Brand Architecture'];

  return (
    <div className="surface-card rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2">
            <span>{t('vaultHeading')}</span>
            <span className="font-serif italic font-normal text-[#C5A059] text-lg">{t('vaultItalic')}</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {t('vaultSubtext')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('vaultSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="panel-recessed ps-8 pe-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#64748B] rounded-lg border hairline-border focus:outline-none focus:border-slate-500 w-48 sm:w-56"
            />
          </div>

          <button 
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0B0E14] font-medium bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('ingestDirectiveBtn')}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 bg-[#0C1017] p-1 rounded-lg border hairline-border overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#161D2B] text-[#F1F5F9] border hairline-border'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {cat === 'all' ? t('allDirectives') : catLabel(cat)}
          </button>
        ))}
      </div>

      {/* Grid of Knowledge Documents */}
      {filteredDocs.length === 0 && (
        <div className="py-8 text-center text-xs text-[#64748B]">{t('vaultNoResults')}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setActiveDoc(doc)}
            className="surface-card-subtle p-4 rounded-xl border hairline-border hover:border-slate-700/70 transition-colors flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[#C5A059] text-[11px]">
                  {catLabel(doc.category)}
                </span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{doc.status}</span>
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-white mb-1.5 leading-snug">
                {doc.title}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
                {doc.summary}
              </p>
            </div>

            <div className="pt-2.5 border-t hairline-divider flex items-center justify-between text-[11px] text-[#64748B] font-mono">
              <div className="flex items-center gap-2">
                <span>{doc.tokens}</span>
                <span aria-hidden="true">·</span>
                <span>{doc.lastSync}</span>
              </div>
              <span className="text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors">{doc.guardrailLevel} &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Ingestion Packet Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsUploadModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#F1F5F9]">{t('vaultIngestTitle')}</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded text-[#64748B] hover:text-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                  {t('vaultFieldTitle')}
                </label>
                <input
                  type="text"
                  placeholder={t('vaultFieldTitlePlaceholder')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                  {t('vaultFieldCategory')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#94A3B8] border hairline-border focus:outline-none cursor-pointer"
                >
                  <option value="Commercial Contracts & Pricing">{t('vaultCatCommercial')}</option>
                  <option value="Regulatory Compliance">{t('vaultCatRegulatory')}</option>
                  <option value="Scheduling & Logistics">{t('vaultCatScheduling')}</option>
                  <option value="Brand Architecture">{t('vaultCatBrand')}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                  {t('vaultFieldSummary')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('vaultFieldSummaryPlaceholder')}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                  {t('vaultFieldDirectives')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('vaultFieldDirectivesPlaceholder')}
                  value={newDirectives}
                  onChange={(e) => setNewDirectives(e.target.value)}
                  className="w-full panel-recessed px-3 py-2 rounded-lg text-xs text-[#F1F5F9] border hairline-border focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t hairline-divider">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-[#0B0E14] bg-[#C5A059] hover:bg-[#D4AF37] rounded-lg transition-colors cursor-pointer"
                >
                  {t('vaultSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Drawer / Modal */}
      {activeDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setActiveDoc(null);
          }}
        >
          <div 
            className="w-full max-w-xl max-h-[92dvh] bg-[#10151F] border hairline-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E2E8F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#0F131C] border-b hairline-border flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <span className="font-mono text-[10px] text-[#C5A059] uppercase">{catLabel(activeDoc.category)}</span>
                <h3 className="text-base font-semibold text-[#F1F5F9] mt-0.5">{activeDoc.title}</h3>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="p-1 rounded text-[#64748B] hover:text-[#F1F5F9] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="panel-recessed p-3.5 rounded-lg border hairline-border">
                <div className="text-[10px] font-mono text-[#64748B] uppercase mb-1">{t('vaultOperationalScope')}</div>
                <p className="text-xs text-[#E2E8F0] leading-relaxed">{activeDoc.summary}</p>
              </div>

              {activeDoc.fullDirectives && (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider">
                    {t('vaultEnforcedDirectives')}
                  </div>
                  <div className="space-y-2">
                    {activeDoc.fullDirectives.map((dir, idx) => (
                      <div key={idx} className="surface-card p-2.5 rounded-lg border hairline-border flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-[#94A3B8]">{dir}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t hairline-divider flex items-center justify-between text-xs text-[#64748B] font-mono">
                <span>{t('vectorEmbeddings')} {activeDoc.tokens}</span>
                <span className="text-emerald-400">{activeDoc.status}</span>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#0F131C] border-t hairline-border text-right rtl:text-left shrink-0">
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-[#141B26] text-xs text-[#F1F5F9] border hairline-border cursor-pointer hover:bg-[#1C2536]"
              >
                {t('closeDirective')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
