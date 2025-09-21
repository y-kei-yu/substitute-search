import { supabase } from "../utils/supabase";

/**
 * ユーザーの食材情報をupsert + 不要なものをdeleteする共通関数
 * Register.tsx, SubstituteSearch.tsx どちらからも利用可能
 * @param userId
 * @param ingredientIds
 */
export const UpsertUserIngredients = async (
  userId: string,
  ingredientIds: number[]
) => {
  // 1. upsert: チェックが付いている食材を保存
  if (ingredientIds.length > 0) {
    const rows = ingredientIds.map((id) => ({
      user_id: userId,
      ingredient_id: id,
      has_it: true,
    }));
    const { error } = await supabase
      .from("user_ingredients")
      .upsert(rows, { onConflict: "user_id, ingredient_id" });
    if (error) {
      console.error("食材登録(upsert)に失敗しました", error);
      throw error;
    } else {
      console.log("食材登録(upsert)に成功しました");
    }
  } else {
    // ingredientIdsが空の場合はupsertはスキップ
    console.log("食材登録(upsert)スキップ（ingredientIdsが空）");
  }

  // 2. delete: ingredientIdsに含まれないuserの食材は削除
  // 削除対象: user_idが一致し、ingredient_idがingredientIdsに含まれない行
  const deleteQuery = supabase
    .from("user_ingredients")
    .delete()
    .eq("user_id", userId);
  if (ingredientIds.length > 0) {
    // 削除条件: user_idが一致し、ingredient_idがingredientIdsに含まれない
    deleteQuery.not("ingredient_id", "in", `(${ingredientIds.join(",")})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) {
    console.error("不要な食材削除(delete)に失敗しました", deleteError);
    throw deleteError;
  } else {
    console.log("不要な食材削除(delete)に成功しました");
  }
};
