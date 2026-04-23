import React from 'react';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'purple';

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

interface StatusBarProps {
  tone?: StatusTone;
  children: React.ReactNode;
}

const StatusBar: React.FC<StatusBarProps> = ({ tone = 'neutral', children }) => (
  <div
    role="status"
    aria-live="polite"
    className={`text-sm md:text-base font-medium px-4 py-2 rounded-full border ${toneClasses[tone]}`}
  >
    {children}
  </div>
);

export default StatusBar;
