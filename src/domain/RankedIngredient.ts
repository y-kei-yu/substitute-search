import { Ingredients } from "./Ingredients";
// Ingredients.ts に、（rank）を追加
// rankはDBにないカラムでUIようなので別ファイルに
export type RankedIngredient = Ingredients & { rank?: number };
