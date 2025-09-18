import { supabase } from "../utils/supabase";
import { User } from "../domain/User";

export const InsertUserData = async (data: User) => {
  const { error: userError } = await supabase.from("users").insert({
    id: data.id,
    name: data.name,
    email: data.email,
    is_vegan: data.is_vegan,
    is_gluten_free: data.is_gluten_free,
    allergies: data.allergies,
    created_at: data.created_at,
  });

  if (userError) {
    console.log("ユーザー情報の登録に失敗しました", userError);
    throw userError;
  } else {
    console.log("ユーザー情報の登録に成功しました");
  }
};
