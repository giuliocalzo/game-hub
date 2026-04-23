import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { Theme, useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n/I18nContext';

const THEMES: Array<{ code: Theme; icon: React.ComponentType<{ className?: string }> }> = [
  { code: 'light', icon: Sun },
  { code: 'dark', icon: Moon },
  { code: 'system', icon: Monitor },
];

const ThemePicker: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const active = THEMES.find((x) => x.code === theme) ?? THEMES[0];
  const ActiveIcon = active.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('theme.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm hover:border-blue-300 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/40"
      >
        <ActiveIcon className={`w-4 h-4 ${isDark ? 'text-indigo-300' : 'text-amber-500'}`} />
        <span className="hidden sm:inline">{t(`theme.${theme}`)}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 dark:bg-gray-800 dark:border-gray-700"
        >
          {THEMES.map(({ code, icon: Icon }) => {
            const selected = code === theme;
            return (
              <li key={code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setTheme(code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                    selected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 font-medium">{t(`theme.${code}`)}</span>
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

export default ThemePicker;
