import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { Language } from '../i18n/translations';

interface LanguageSwitcherProps {
  compact?: boolean;
  /** Where the dropdown opens. Use 'up' when the switcher sits at the bottom of a panel. */
  placement?: 'down' | 'up';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, placement = 'down' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languageOptions: { code: Language; label: string; nativeName: string; flag: string }[] = [
    { code: 'ar', label: 'العربية', nativeName: 'Arabic', flag: '🇦🇪' },
    { code: 'en', label: 'English', nativeName: 'English (US/UK)', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', nativeName: 'French', flag: '🇫🇷' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick as unknown as EventListener);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick as unknown as EventListener);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const currentOption = languageOptions.find((o) => o.code === language) || languageOptions[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#E2E8F0] hover:text-white bg-[#141B26] hover:bg-[#1C2536] border hairline-border rounded-lg transition-colors cursor-pointer select-none"
        title="تغيير اللغة / Switch Language"
      >
        <Languages className="w-3.5 h-3.5 text-[#C5A059]" />
        {!compact ? (
          <span className="font-sans font-medium">{currentOption.label}</span>
        ) : (
          <span className="font-mono uppercase text-[11px]">{currentOption.code}</span>
        )}
        <ChevronDown className="w-3 h-3 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 rtl:right-auto rtl:left-0 w-44 rounded-lg bg-[#10151F] border hairline-border shadow-2xl z-50 py-1 divide-y hairline-divider ${placement === 'up' ? 'bottom-full mb-1.5' : 'mt-1.5'}`}>
          <div className="px-3 py-1.5 text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
            Language / اللغة
          </div>
          <div className="p-1 space-y-0.5">
            {languageOptions.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left rtl:text-right ${
                    isSelected
                      ? 'bg-[#16202E] text-[#F1F5F9] font-medium'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#141B26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">{opt.flag}</span>
                    <div>
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{opt.nativeName}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
