
import { createClient } from '@supabase/supabase-js';

// В режиме preview (через importmap) process.env недоступен.
// Мы используем ключи напрямую, чтобы приложение работало в браузере.
const SUPABASE_URL = 'https://psqkumgnvuptyfcamxkr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWt1bWdudnVwdHlmY2FteGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjMxODUsImV4cCI6MjA3OTYzOTE4NX0.pX3D1Uvrzfabbdrs1eYSkKGADWK2IMlznWLo2myX2a0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
