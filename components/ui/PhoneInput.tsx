
import React, { ChangeEvent, forwardRef, FocusEvent } from 'react';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeText: (value: string) => void; // Returns formatted string
  error?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({ value, onChangeText, className = '', error, onFocus, ...props }, ref) => {
  
  const formatPhoneNumber = (input: string) => {
    // 1. Remove non-digits
    let digits = input.replace(/\D/g, '');

    // 2. Handle empty case
    if (!digits) return '';

    // 3. Auto-correction rules for Russian numbers
    // If starts with 8, replace with 7
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    // If starts with 9, prepend 7 (assuming user forgot +7)
    if (digits[0] === '9') digits = '7' + digits;
    
    // If it doesn't start with 7, just return +digits (fallback for international if needed, or force 7)
    // Here we strictly aim for RU format mostly
    if (digits[0] !== '7') return '+' + digits.substring(0, 15);

    // 4. Formatting for +7 (XXX) XXX-XX-XX
    // Limit to 11 digits (7 + 10 digits)
    const limited = digits.substring(0, 11);
    
    let formatted = '+7';
    if (limited.length > 1) formatted += ' (' + limited.substring(1, 4);
    if (limited.length > 4) formatted += ') ' + limited.substring(4, 7);
    if (limited.length > 7) formatted += '-' + limited.substring(7, 9);
    if (limited.length > 9) formatted += '-' + limited.substring(9, 11);

    return formatted;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If deleting and empty, clear
    if (!val) {
        onChangeText('');
        return;
    }
    const formatted = formatPhoneNumber(val);
    onChangeText(formatted);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      // Auto-fill +7 if empty on focus
      if (!value) {
          onChangeText('+7');
      }
      if (onFocus) onFocus(e);
  };

  return (
    <input
      ref={ref}
      type="tel"
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder="+7 (___) ___-__-__"
      maxLength={18}
      className={`w-full border rounded-lg p-2 outline-none transition-all dark:bg-gray-700 dark:text-white ${
        error 
          ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
          : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
      } ${className}`}
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';
