import { createClient } from '@supabase/supabase-js';

// Функція для отримання Supabase клієнта з детальним логуванням
export function getSupabaseAdmin() {
  // Детальне логування ВСІХ змінних оточення (без значень для безпеки)
  const allEnvKeys = Object.keys(process.env);
  console.log('[Supabase Init] Total env vars available:', allEnvKeys.length);
  console.log('[Supabase Init] Env keys sample:', allEnvKeys.slice(0, 10));
  console.log('[Supabase Init] Supabase-related keys:',
    allEnvKeys.filter(k => k.includes('SUPABASE') || k.includes('supabase'))
  );

  // Отримуємо змінні з process.env
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Детальне логування для діагностики
  console.log('[Supabase Init] Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 20),
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
  });

  if (!supabaseUrl || !supabaseKey) {
    // В build-time (или если забыли env) возвращаем null, чтобы приложение не падало сразу.
    // Ошибку выбросим при попытке использования.
    console.error('❌ [Supabase Init] Missing credentials. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return null;
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('✅ [Supabase Init] Client initialized successfully.');
    return client;
  } catch (error) {
    console.error('❌ [Supabase Init] Failed to create client:', error);
    return null;
  }
}

// Экспортируем только функцию. Никаких переменных уровня модуля!
// Это гарантирует, что код не выполнится при импорте файла.
export { getSupabaseAdmin };
