import { supabase } from "../utils/supabase";

export const signInWithGoogle = async () => {
  const redirectTo =
    import.meta.env.MODE === "development"
      ? import.meta.env.VITE_SUPABASE_REDIRECT_DEV
      : import.meta.env.VITE_SUPABASE_REDIRECT_PROD;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  console.log(redirectTo);

  if (error) {
    console.error("Error signing in:", error.message);
  }
  return data;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
