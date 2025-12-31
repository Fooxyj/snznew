
import React, { ChangeEvent, forwardRef, FocusEvent } from 'react';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeText: (value: string) => void; // Возвращает отформатированную строку
  error?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({ value, onChangeText, className = '', error, onFocus, ...props }, ref) => {
  
  const formatPhoneNumber = (input: string) => {
    // 1. Очищаем от всего, кроме цифр
    let digits = input.replace(/\D/g, '');

    // 2. Если пусто — возвращаем пустую строку (или +7 ниже в фокусе)
    if (!digits) return '';

    // 3. Правила автокоррекции для РФ
    // Если начинается с 8, заменяем на 7
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    // Если начинается с 9, добавляем 7 в начало
    if (digits[0] === '9') digits = '7' + digits;
    
    // Если первая цифра не 7, просто возвращаем с плюсом (для других стран)
    if (digits[0] !== '7') return '+' + digits.substring(0, 15);

    // 4. Форматирование +7 (XXX) XXX-XX-XX
    const limited = digits.substring(0, 11);
    
    let formatted = '+7';
    if (limited.length > 1) {
        formatted += ' (' + limited.substring(1, 4);
    }
    if (limited.length > 4) {
        formatted += ') ' + limited.substring(4, 7);
    }
    if (limited.length > 7) {
        formatted += '-' + limited.substring(7, 9);
    }
    if (limited.length > 9) {
        formatted += '-' + limited.substring(9, 11);
    }

    return formatted;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Если пользователь пытается удалить +7 полностью, сбрасываем в '+7'
    if (val.length < 2) {
        onChangeText('+7');
        return;
    }

    const formatted = formatPhoneNumber(val);
    onChangeText(formatted);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      // Если поле пустое, при клике сразу ставим +7
      if (!value || value === '') {
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
      className={`w-full border rounded-xl p-3 outline-none transition-all dark:bg-gray-700 dark:text-white ${
        error 
          ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
          : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
      } ${className}`}
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';
