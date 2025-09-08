import { useEffect, useState } from "react";
import { getAllIngredients } from "../service/getAllIngredients";
import { Ingredient } from "../domain/ingredients";

export const SubstituteSearch = () => {

    const [ingredientData, setIngredientData] = useState<Ingredient[]>([]);

    //材料テーブルから全データを取得
    const allIngredients = async () => {
        const ingredientData = await getAllIngredients();
        setIngredientData(ingredientData);
    };

    //検索
    useEffect(() => {
        allIngredients();
    }, []);

    return (
        <div>
            <h1 data-testid="substitute-search-title">Substitute Search</h1>
            <input type="text" placeholder="代替したいものを入力" />
            <button>検索</button>
            {ingredientData.map((ingredient) => (
                <div key={ingredient.id}>
                    <input type="checkbox" id={`ingredient-${ingredient.id}`} />
                    <label htmlFor={`ingredient-${ingredient.id}`}>{ingredient.name}</label>
                </div>
            ))}


        </div>
    );
};
