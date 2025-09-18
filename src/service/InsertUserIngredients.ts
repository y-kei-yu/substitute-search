import { supabase } from "../utils/supabase";

export const InsertUserIngredients = async (
  userId: string,
  ingredientIds: number[]
) => {
  if (ingredientIds.length === 0) return;

  const rows = ingredientIds.map((id) => ({
    user_id: userId,
    ingredient_id: id,
    has_it: true,
  }));

  const { error } = await supabase.from("user_ingredients").insert(rows);
  if (error) {
    console.error("食材登録に失敗しました", error);
    throw error;
  } else {
    console.log("食材登録に成功しました");
  }
};
