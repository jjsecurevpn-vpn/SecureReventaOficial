import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../i18n/context';
import type { Language } from '../../../i18n/types';

interface Props {
  onLanguageChange?: (lang: Language) => void;
}

const LANG_LABELS: Record<Language, string> = {
  es: '🇦🇷',
  en: '🇺🇸',
  pt: '🇧🇷',
};
export function LanguageButton({ onLanguageChange }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen]);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
    onLanguageChange?.(lang);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        type="button"
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('language.selectLanguage')}
        title={t('language.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {LANG_LABELS[language]}
      </button>

      {isOpen && (
        <div className="language-dropdown" role="listbox">
          <button
            type="button"
            className={`language-option ${language === 'es' ? 'active' : ''}`}
            onClick={() => handleSelectLanguage('es')}
            role="option"
            aria-selected={language === 'es'}
          >
            🇦🇷 {t('language.spanish')}
          </button>
          <button
            type="button"
            className={`language-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleSelectLanguage('en')}
            role="option"
            aria-selected={language === 'en'}
          >
            🇺🇸 {t('language.english')}
          </button>
          <button
            type="button"
            className={`language-option ${language === 'pt' ? 'active' : ''}`}
            onClick={() => handleSelectLanguage('pt')}
            role="option"
            aria-selected={language === 'pt'}
          >
            🇧🇷 {t('language.portuguese')}
          </button>
        </div>
      )}
    </div>
  );
}
