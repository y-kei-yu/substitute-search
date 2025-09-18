import { supabase } from "../utils/supabase";
export const fetchUserIngredients = async (userId: string) => {
  const response = await supabase
    .from("user_ingredients")
    .select("ingredient_id")
    .eq("user_id", userId);

  if (response.error) {
    console.error("Error user_ingredients:", response.error);
    return [];
  }
  console.log("user_ingredients response:", response);
  return response.data.map((row) => row.ingredient_id);
};
