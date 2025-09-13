import { SearchHistory } from "../domain/SearchHistory";
import { SearchHistoryRow } from "../domain/SearchHistoryRow";
import { supabase } from "../utils/supabase";

//ユーザーごとの検索履歴を取得する関数
export const fetchUserSearchHistory = async () => {
  const response = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", 1) // 例としてuser_idが1のユーザーの履歴を取得
    .limit(5);
  if (response.error) {
    console.error("Error fetching user search history:", response.error);
    return [];
  }
  //Supabase から取ったオブジェクトを SearchHistory クラスに変換
  const histories = (response.data || []).map(
    (history: SearchHistoryRow) =>
      new SearchHistory(
        history.id,
        history.user_id,
        history.query,
        history.ai_response,
        history.created_at
      )
  );

  console.log("fetchUserSearchHistory response:", histories);
  return histories;
};
