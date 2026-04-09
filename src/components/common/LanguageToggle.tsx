import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t('app.switchLanguage')}
      title={t('app.switchLanguage')}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
    >
      <Languages size={16} />
      <span className="hidden sm:inline">{t('app.switchLanguage')}</span>
      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs">
        {language === 'th' ? 'EN' : 'ไทย'}
      </span>
    </button>
  );
};

export default LanguageToggle;
