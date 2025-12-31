
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Данные считаются "свежими" 2 минуты, чтобы не дергать API при каждом переключении табов
      staleTime: 1000 * 60 * 2, 
      // Кэш хранится 30 минут
      gcTime: 1000 * 60 * 30,   
      refetchOnWindowFocus: false, // Отключаем рефетч при смене вкладки браузера
      retry: (failureCount, error: any) => {
        // Не повторяем запрос, если это 4xx ошибка (кроме 429 - лимиты)
        const status = error?.status || error?.code;
        const statusNum = Number(status);
        
        if (statusNum === 429) return failureCount < 3; // Лимиты — пробуем еще раз
        if (!isNaN(statusNum) && statusNum >= 400 && statusNum < 500) return false;
        
        return failureCount < 2; // Для остальных ошибок (5xx, сеть) — 2 попытки
      },
    },
  },
});
