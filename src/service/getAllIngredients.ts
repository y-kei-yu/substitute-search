import { supabase } from "../utils/supabase";

//材料テーブルのデータ取得
export const getAllIngredients = async () => {
  const response = await supabase.from("ingredients").select("*");
  if (response.error) {
    console.error("Error fetching ingredients:", response.error);
    return [];
  }
  return response.data;
};
