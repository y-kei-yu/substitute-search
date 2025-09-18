// Supabase から返ってくる生のレコード型
export type SearchHistoryRow = {
  id: number;
  user_id: string;
  query: string;
  ai_response: string;
  created_at: string;
};
