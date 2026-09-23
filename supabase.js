// ==========================================
// UA LEGION — Supabase
// ==========================================

// URL проєкту Supabase
const SUPABASE_URL =
  "https://trjneluohyxcumnyfufd.supabase.co";

// Publishable key Supabase
const SUPABASE_ANON_KEY =
  "sb_publishable_gE7MHPwxZPAomEcW9O70zg_cwS4bevt";

// Створюємо підключення до Supabase
const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

// Робимо Supabase доступним на всьому сайті
window.supabaseClient =
  supabaseClient;

console.log("UA LEGION Supabase підключено");
