import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import { LANGS, Lang } from '../i18n/types';

const LanguagePicker: React.FC = () => {
  const { lang, setLang, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('lang.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:border-blue-300 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline">{active.label}</span>
        <span className="text-lg leading-none" aria-hidden="true">
          {active.flag}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50"
        >
          {LANGS.map((l) => {
            const selected = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLang(l.code as Lang);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                    selected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden="true">
                    {l.flag}
                  </span>
                  <span className="flex-1 font-medium">{l.label}</span>
                  {selected && <Check className="w-4 h-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguagePicker;
