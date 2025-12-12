
// ВНИМАНИЕ: В реальном проекте эти данные должны быть в файле .env
// Например: VITE_SUPABASE_URL=...

// Пытаемся получить ключи из переменных окружения Vite
const ENV_URL = (import.meta as any).env?.VITE_SUPABASE_URL;
const ENV_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Хардкод (резервный вариант для быстрого запуска без .env)
const HARDCODED_URL = 'https://jdrwaxgufvpuhubylagi.supabase.co'; 
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcndheGd1ZnZwdWh1YnlsYWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjU3MzAsImV4cCI6MjA4MDIwMTczMH0.-w0qQJJm_l_ETeHUmV08l0BaNSIAlQ0ewpBo_ufUDHE'; 

export const SUPABASE_URL = ENV_URL || HARDCODED_URL;
export const SUPABASE_ANON_KEY = ENV_KEY || HARDCODED_KEY;

// Вставьте ваш ключ от Яндекс Карт сюда, если есть. Иначе будет использоваться демо-режим.
export const YANDEX_MAPS_API_KEY = (import.meta as any).env?.VITE_YANDEX_MAPS_KEY || '';

// Проверка, настроен ли Supabase
export const isSupabaseConfigured = () => {
    return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0 && SUPABASE_ANON_KEY.startsWith('ey');
};
