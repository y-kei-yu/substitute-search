import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { RankedIngredient } from "@/domain/RankedIngredient";

type IngredientCheckBoxProps = {
    fieldLabel: string
    ingredientData: RankedIngredient[];
    selectedIngredients: number[];
    onChange: (id: number, checked: boolean) => void;
};


export const IngredientCheckBox = ({ fieldLabel, ingredientData, selectedIngredients, onChange }: IngredientCheckBoxProps) => {
    return (
        <>
            <div className="space-y-2">
                <Label className="text-base font-semibold text-green-700">{fieldLabel}</Label>
                <p className="text-sm text-gray-500">
                    （全ユーザーのデータから算出した「家にある可能性が高い調味料ランキング」）
                </p>
                <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ingredientData.map((ingredient) => (
                            <div key={ingredient.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`ingredient-${ingredient.id}`}
                                    checked={selectedIngredients.includes(ingredient.id)}
                                    onCheckedChange={(checked) =>
                                        onChange(ingredient.id, checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor={`ingredient-${ingredient.id}`}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {ingredient.name}
                                    {ingredient.rank && (
                                        <span className="ml-2 text-xs text-green-600">(TOP{ingredient.rank})</span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        </>
    )
}