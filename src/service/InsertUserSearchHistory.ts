import { supabase } from "../utils/supabase";
import { SearchHistoryInput } from "../domain/SearchHistoryInput";

export const InsertUserSearchHistory = async (data: SearchHistoryInput) => {
  const { error } = await supabase.from("search_history").insert({
    user_id: data.user_id,
    query: data.query,
    ai_response: data.ai_response,
  });

  if (error) {
    console.error("Error inserting search_history:", error);
    throw error;
  } else {
    console.log("検索履歴を登録しました");
  }
};
