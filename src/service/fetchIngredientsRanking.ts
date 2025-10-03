import { supabase } from "@/utils/supabase";

export const fetchIngredientsRanking = async () => {
  const { data, error } = await supabase
    .from("user_ingredients")
    .select("ingredient_id", { count: "exact" })
    .eq("has_it", true);

  if (error) {
    console.error("Error fetching ingredients ranking:", error);
    return [];
  }
  // ingredientCountsは各 ingredient_id が登場した回数
  const ingredientCounts: Record<number, number> = {};
  data.forEach((row) => {
    ingredientCounts[row.ingredient_id] =
      (ingredientCounts[row.ingredient_id] || 0) + 1;
  });

  //多い順に並びかえる
  return Object.entries(ingredientCounts)
    .map(([ingredient_id, usageCount]) => ({
      ingredient_id: Number(ingredient_id),
      usageCount,
    }))
    .sort((itemA, itemB) => itemB.usageCount - itemA.usageCount)
    .slice(0, 10);
};
