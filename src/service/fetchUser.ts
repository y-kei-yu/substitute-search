import { supabase } from "../utils/supabase";
export const fetchUser = async () => {
  const response = await supabase.from("users").select("*");
  console.log("fetchUser response:", response);
  return response.data;
};
