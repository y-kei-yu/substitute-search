import { createClient } from "@supabase/supabase-js";

//Supabaseクライアントを作成
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // ✅ セッションを localStorage に保存
      autoRefreshToken: true, // ✅ トークンを自動リフレッシュ
      detectSessionInUrl: true, // ✅ OAuth コールバックURLからセッションを検出
    },
  }
);
