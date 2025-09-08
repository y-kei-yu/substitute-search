import { supabase } from "../utils/supabase";

export const getAllIngredients = async () => {
  const response = await supabase.from("ingredients").select("*");
  if (response.error) {
    console.error("Error fetching ingredients:", response.error);
    return [];
  }
  return response.data;
};
