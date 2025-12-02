
// ВНИМАНИЕ: В реальном проекте эти данные хранятся в файле .env
// Здесь мы используем config.ts для учебных целей.

export const SUPABASE_URL = 'https://jdrwaxgufvpuhubylagi.supabase.co'; 

// СЮДА ВСТАВЛЯЕМ КЛЮЧ 'anon' / 'public'
// Он находится: Project Settings -> API -> Project API Keys -> anon public
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkcndheGd1ZnZwdWh1YnlsYWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjU3MzAsImV4cCI6MjA4MDIwMTczMH0.-w0qQJJm_l_ETeHUmV08l0BaNSIAlQ0ewpBo_ufUDHE'; 

// Проверка, настроен ли Supabase
export const isSupabaseConfigured = () => {
    return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0 && SUPABASE_ANON_KEY.startsWith('ey');
};
