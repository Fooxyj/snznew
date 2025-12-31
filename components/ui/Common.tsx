
import React from 'react';
import { Star, MapPin, Circle, Shield, Zap, Crown, CheckCircle2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md shadow-blue-500/10",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 shadow-sm",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 shadow-md shadow-red-500/10",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'blue', className = '' }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[color] || colors.blue} ${className}`}>
      {children}
    </span>
  );
};

export const XPBar: React.FC<{ xp: number }> = ({ xp }) => {
  const level = Math.floor(xp / 1000) + 1;
  const progress = (xp % 1000) / 10; // 0-100%

  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1.5 font-black uppercase tracking-widest">
        <span className="text-blue-900 dark:text-blue-300">Уровень {level}</span>
        <span className="text-gray-400">{xp} XP</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export const Rating: React.FC<{ value: number; count?: number }> = ({ value, count }) => {
  const displayValue = count === 0 ? 0 : value;
  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-700">
      <Star className={`w-3 h-3 mr-1 ${displayValue > 0 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
      <span className="font-black text-xs text-gray-900 dark:text-white">{displayValue.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-400 text-[10px] ml-1">({count})</span>}
    </div>
  );
};

export const LocationBadge: React.FC<{ location: string }> = ({ location }) => (
  <div className="flex items-center text-gray-500 dark:text-gray-400 text-[10px] font-bold">
    <MapPin className="w-3 h-3 mr-1" />
    {location}
  </div>
);

export const UserStatus: React.FC<{ lastSeen?: string; showText?: boolean; className?: string }> = ({ lastSeen, showText = true, className = "" }) => {
    if (!lastSeen) return showText ? <span className="text-gray-400 uppercase text-[9px] font-black italic">не в сети</span> : null;
    
    // Подготовка даты из строки БД (заменяем пробел на T для корректности парсинга в Safari/Chrome)
    const dateStr = lastSeen.includes(' ') && !lastSeen.includes('T') ? lastSeen.replace(' ', 'T') : lastSeen;
    const lastSeenDate = new Date(dateStr);
    const now = new Date();
    
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    // Если активность менее 2 минут назад — "В сети"
    if (diffMin < 2) {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                {showText && <span className="text-green-600 font-black uppercase text-[9px]">В сети</span>}
            </div>
        );
    }
    
    if (!showText) return null;

    const timeStr = lastSeenDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const isToday = lastSeenDate.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = lastSeenDate.toDateString() === yesterday.toDateString();

    let statusText = "";
    if (isToday) {
        statusText = `был(а) сегодня в ${timeStr}`;
    } else if (isYesterday) {
        statusText = `был(а) вчера в ${timeStr}`;
    } else {
        const fullDateStr = lastSeenDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
        statusText = `был(а) ${fullDateStr} в ${timeStr}`;
    }

    return <span className={`text-gray-400 uppercase text-[9px] font-black ${className}`}>{statusText}</span>;
};

export const formatAddress = (raw: string): string => {
    if (!raw) return '—';
    return raw.replace(/^г\.?\s*Снежинск,?\s*/i, '').trim();
};

export const formatPhone = (raw: string): string => {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 11) {
        return `+7 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7,9)}-${digits.slice(9,11)}`;
    }
    return raw; 
};
