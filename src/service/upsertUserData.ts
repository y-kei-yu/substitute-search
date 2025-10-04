import { supabase } from "../utils/supabase";
import { User } from "../domain/User";

export const upsertUserData = async (data: User) => {
  // 基本データ
  const updateData: Partial<User> = {
    id: data.id,
    email: data.email,
    is_vegan: data.is_vegan,
    is_gluten_free: data.is_gluten_free,
    allergies: data.allergies,
    created_at: data.created_at,
  };

  // name が undefined でない場合のみ追加
  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  const { error } = await supabase
    .from("users")
    .upsert(updateData, { onConflict: "id" });

  if (error) {
    console.log("ユーザー情報の登録に失敗しました", error);
    throw error;
  } else {
    console.log("ユーザー情報の登録に成功しました");
  }
};
