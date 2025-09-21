import { supabase } from "../utils/supabase";
import { User } from "../domain/User";

export const UpsertUserData = async (data: User) => {
  const { error } = await supabase.from("users").upsert(
    {
      id: data.id,
      name: data.name,
      email: data.email,
      is_vegan: data.is_vegan,
      is_gluten_free: data.is_gluten_free,
      allergies: data.allergies,
      created_at: data.created_at,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.log("ユーザー情報の登録に失敗しました", error);
    throw error;
  } else {
    console.log("ユーザー情報の登録に成功しました");
  }
};
