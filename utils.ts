
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

export const getLevelInfo = (points: number) => {
  if (points < 50) return { level: 1, nextLevelPoints: 50, name: 'Новичок' };
 if (points < 150) return { level: 2, nextLevelPoints: 150, name: 'Участник' };
  if (points < 400) return { level: 3, nextLevelPoints: 400, name: 'Активист' };
  if (points < 800) return { level: 4, nextLevelPoints: 800, name: 'Эксперт' };
  return { level: 5, nextLevelPoints: Infinity, name: 'Мастер' };
};
