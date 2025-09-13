import { supabase } from "../utils/supabase";
export const fetchUser = async (userId: string) => {
  const response = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (response.error) {
    console.error("Error fetching user:", response.error);
    return null;
  }
  console.log("fetchUser response:", response);
  return response.data;
};
