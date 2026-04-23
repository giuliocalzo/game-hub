import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StatusBar, { StatusTone } from '../shared/StatusBar';
import WinOverlay from '../shared/WinOverlay';
import { useTranslation } from '../../i18n/I18nContext';
import { TYPING_SENTENCES } from '../../i18n/content';
import { Lang } from '../../i18n/types';

const pickSentence = (lang: Lang, avoid?: string): string => {
  const pool = TYPING_SENTENCES[lang];
  const choices = pool.filter((s) => s !== avoid);
  const list = choices.length ? choices : pool;
  return list[Math.floor(Math.random() * list.length)];
};

const TypingPractice: React.FC<{ isBotEnabled: boolean }> = () => {
  const { t, lang } = useTranslation();
  const [target, setTarget] = useState<string>(() => pickSentence(lang));
  const [typed, setTyped] = useState<string>('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setTarget((prev) => pickSentence(lang, prev));
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [lang]);

  // When the language changes, pull a fresh sentence in the new language.
  useEffect(() => {
    setTarget(pickSentence(lang));
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
  }, [lang]);

  const onChange = (v: string) => {
    if (!startedAt && v.length > 0) setStartedAt(Date.now());
    setTyped(v);
    if (v === target) setFinishedAt(Date.now());
  };

  const errors = useMemo(
    () =>
      typed.split('').reduce((acc, ch, i) => (ch !== target[i] ? acc + 1 : acc), 0),
    [typed, target],
  );

  const { wpm, accuracy, elapsed } = useMemo(() => {
    const end = finishedAt ?? Date.now();
    const secs = startedAt ? Math.max(1, (end - startedAt) / 1000) : 0;
    const words = typed.length / 5;
    const w = secs > 0 ? Math.round((words / secs) * 60) : 0;
    const acc = typed.length ? Math.max(0, 100 - (errors / typed.length) * 100) : 100;
    return { wpm: w, accuracy: Math.round(acc), elapsed: Math.round(secs) };
  }, [startedAt, finishedAt, typed, errors]);

  const done = finishedAt !== null;
  const tone: StatusTone = done ? 'success' : 'info';

  const statusText = done
    ? t('typing.done_status', { elapsed, wpm, accuracy })
    : startedAt
      ? t('typing.progress', { typed: typed.length, total: target.length })
      : t('typing.initial');

  return (
    <div className="flex flex-col items-center gap-5">
      <StatusBar tone={tone}>{statusText}</StatusBar>

      <div
        className="relative w-full max-w-xl p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md font-mono text-lg tracking-wide leading-relaxed"
        lang={lang}
      >
        {target.split('').map((ch, i) => {
          let cls = 'text-gray-400 dark:text-gray-500';
          if (i < typed.length) {
            cls = typed[i] === ch
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-500 underline';
          }
          if (i === typed.length && !done) cls += ' bg-blue-100 dark:bg-blue-500/30';
          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}
        {done && (
          <WinOverlay
            title={t('typing.done_title', { wpm })}
            subtitle={t('typing.done_subtitle', { accuracy, elapsed })}
            onPlayAgain={reset}
            playAgainLabel={t('typing.new_sentence')}
          />
        )}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('typing.placeholder')}
        disabled={done}
        lang={lang}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full max-w-xl px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-400 focus:outline-none font-mono"
      />

      <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
        <span>{t('typing.errors')}: <strong>{errors}</strong></span>
        <span>·</span>
        <span>{t('typing.length')}: <strong>{target.length}</strong></span>
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold shadow hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {t('typing.new_sentence')}
      </button>
    </div>
  );
};

export default TypingPractice;
