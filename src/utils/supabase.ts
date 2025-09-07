import { createClient } from "@supabase/supabase-js";

//Supabaseクライアントを作成
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
