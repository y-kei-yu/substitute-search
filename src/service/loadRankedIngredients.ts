import { RankedIngredient } from "@/domain/RankedIngredient";
import { getAllIngredients } from "./getAllIngredients";
import { fetchIngredientsRanking } from "./fetchIngredientsRanking";

// 材料テーブルをランキング順で表示する
export const loadRankedIngredients = async (): Promise<RankedIngredient[]> => {
  const allIngredients = await getAllIngredients();
  const topRankedItems = await fetchIngredientsRanking();

  const rankedIngredientIds = topRankedItems.map((item) => item.ingredient_id);
  console.log(rankedIngredientIds);

  // 順位順に対応する食材オブジェクトを取得する
  const rankedIngredients: RankedIngredient[] = [];
  rankedIngredientIds.forEach((id, index) => {
    const ingredient = allIngredients.find((i) => i.id === id);
    if (ingredient) {
      // ランキング設定
      rankedIngredients.push({ ...ingredient, rank: index + 1 });
    }
  });

  // ランキングに出てこなかった食材を集める
  // set hasはJavaScriptの機能
  const rankedIdSet = new Set(rankedIngredientIds);
  const unRankedIngredients: RankedIngredient[] = allIngredients.filter(
    (ingredient) => !rankedIdSet.has(ingredient.id)
  );

  return [...rankedIngredients, ...unRankedIngredients];
};
