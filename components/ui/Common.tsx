
import React from 'react';
import { Star, MapPin } from 'lucide-react';

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
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md shadow-blue-500/20",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 shadow-sm",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 shadow-md shadow-red-500/20",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
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

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export const XPBar: React.FC<{ xp: number }> = ({ xp }) => {
  const level = Math.floor(xp / 1000) + 1;
  const progress = (xp % 1000) / 10; // 0-100%

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-bold text-blue-900 dark:text-blue-300">Уровень {level}</span>
        <span className="text-gray-500 dark:text-gray-400">{xp} XP</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export const Rating: React.FC<{ value: number; count?: number }> = ({ value, count }) => {
  // If count is explicitly 0, force display rating to 0.0 regardless of value
  const displayValue = count === 0 ? 0 : value;
  
  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
      <Star className={`w-3.5 h-3.5 mr-1 ${displayValue > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
      <span className="font-bold text-sm text-gray-900 dark:text-white">{displayValue.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">({count})</span>}
    </div>
  );
};

export const LocationBadge: React.FC<{ location: string }> = ({ location }) => (
  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
    <MapPin className="w-3 h-3 mr-1" />
    {location}
  </div>
);

// --- FORMATTERS ---

export const formatAddress = (raw: string): string => {
    if (!raw) return 'Адрес не указан';
    
    // 1. Remove "g. Snezhinsk" and variations
    let clean = raw.replace(/^г\.?\s*Снежинск,?\s*/i, '').trim();
    
    // 2. Normalize typical prefixes if missing
    // If it starts with just a name (e.g. "Dzerzhinskogo") and no prefix, add "ul."
    // Exceptions: numbers (microdistricts), or already having prefixes like pr, per, mkr, bul
    const hasPrefix = /^(ул\.|пр\.|пер\.|б-р|пл\.|мкр\.|шоссе|тракт)/i.test(clean);
    const isMicrodistrict = /^\d/.test(clean) || /^мкр/i.test(clean);
    
    if (!hasPrefix && !isMicrodistrict && clean.length > 0) {
        clean = 'ул. ' + clean;
    }

    return clean;
};

export const formatPhone = (raw: string): string => {
    if (!raw) return '';
    
    // 1. Split by comma/slash if multiple, take first
    const primary = raw.split(/[,/]/)[0].trim();
    
    // 2. Strip non-digits (keep + if at start)
    const digits = primary.replace(/[^\d+]/g, '');
    
    // 3. Simple mask for Russian numbers
    // 89001234567 -> +7 (900) 123-45-67
    if ((digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) || (digits.length === 12 && digits.startsWith('+7'))) {
        const d = digits.slice(-10);
        return `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`;
    }
    
    // 4. Landline 6-digit (local) -> XX-XX-XX
    if (digits.length === 6) {
        return `${digits.slice(0,2)}-${digits.slice(2,4)}-${digits.slice(4,6)}`;
    }

    return primary; // Return raw if didn't match standard patterns
};
