
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

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  progressPercent: number;
  nextLevelXp: number;
  color: string;
}

export const getLevelInfo = (xp: number = 0): LevelInfo => {
  let level = 1;
  let title = 'Новичок';
  let minXp = 0;
  let maxXp = 100;
  let color = 'bg-gray-400';

  if (xp >= 101 && xp <= 300) {
    level = 2;
    title = 'Житель';
    minXp = 101;
    maxXp = 300;
    color = 'bg-blue-500';
  } else if (xp >= 301 && xp <= 600) {
    level = 3;
    title = 'Активист';
    minXp = 301;
    maxXp = 600;
    color = 'bg-green-500';
  } else if (xp >= 601 && xp <= 1000) {
    level = 4;
    title = 'Знаток';
    minXp = 601;
    maxXp = 1000;
    color = 'bg-purple-500';
  } else if (xp > 1000) {
    level = 5;
    title = 'Легенда';
    minXp = 1001;
    maxXp = 5000; // Cap visual
    color = 'bg-yellow-500';
  }

  // Calculate percentage within current level range
  const range = maxXp - minXp;
  const currentInRange = xp - minXp;
  // Cap at 100%
  const progressPercent = Math.min(100, Math.max(0, (currentInRange / range) * 100));

  return {
    level,
    title,
    minXp,
    maxXp,
    progressPercent,
    nextLevelXp: maxXp,
    color
  };
};

/**
 * Compresses an image file using Canvas.
 * Max width/height: 1280px, Quality: 0.8 (JPEG)
 */
export const compressImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const maxWidth = 1280;
        const maxHeight = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
            reject(new Error("Canvas context is null"));
            return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        ctx.canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Compression failed"));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
