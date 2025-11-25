
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Russian mobile/landline (11 digits, usually starting with 7 or 8)
  // Example: 89001234567 -> +7 (900) 123-45-67
  if (cleaned.length === 11) {
    const part1 = cleaned.slice(1, 4);
    const part2 = cleaned.slice(4, 7);
    const part3 = cleaned.slice(7, 9);
    const part4 = cleaned.slice(9, 11);
    return `+7 (${part1}) ${part2}-${part3}-${part4}`;
  }
  
  // 10 digits (sometimes entered without country code)
  // Example: 9001234567 -> +7 (900) 123-45-67
  if (cleaned.length === 10) {
     const part1 = cleaned.slice(0, 3);
     const part2 = cleaned.slice(3, 6);
     const part3 = cleaned.slice(6, 8);
     const part4 = cleaned.slice(8, 10);
     return `+7 (${part1}) ${part2}-${part3}-${part4}`;
  }

  // Short city numbers (6 digits)
  if (cleaned.length === 6) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`;
  }

  // Fallback for others
  return phone; 
};
