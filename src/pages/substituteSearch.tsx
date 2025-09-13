import { useEffect, useState } from "react";
import { getAllIngredients } from "../service/getAllIngredients";
import { Ingredient } from "../domain/ingredients";
import { SearchHistory } from "../domain/SearchHistory";
import { fetchUserSearchHistory } from "../service/fetchUserSearchHistory";
//import { GoogleGenAI } from "@google/genai";

export const SubstituteSearch = () => {

    const [ingredientData, setIngredientData] = useState<Ingredient[]>([]);
    const [targetSubstitute, setTargetSubstitute] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [searchResults, setSearchResults] = useState<SearchHistory[]>([]);

    //代替したいもの欄の値変更時
    const changeTargetSubstitute = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTargetSubstitute(e.target.value);
    };

    //チェックボックス変更時の状態管理
    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            // チェックされた場合、selectedIngredientsに追加
            setSelectedIngredients([...selectedIngredients, id]);
        } else {
            // チェックが外された場合、selectedIngredientsから削除
            setSelectedIngredients(selectedIngredients.filter(selectedId => selectedId !== id));
        }
    }


    //材料テーブルから全データを取得する
    const allIngredients = async () => {
        const ingredientData = await getAllIngredients();
        setIngredientData(ingredientData);
    };

    //検索
    useEffect(() => {
        allIngredients();
        userSearchHistory();
    }, []);

    //ユーザーごとの検索履歴を表示する
    const userSearchHistory = async () => {
        // ユーザーの検索履歴を取得して表示する処理
        const userSearchHistory = await fetchUserSearchHistory();
        setSearchResults(userSearchHistory);
    };
    //ボタン押下時の処理
    const handleSearch = () => {
        console.log(selectedIngredients);
        // // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        // const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        // const prompt = `
        //         ${targetSubstitute}の代替品を教えてください。
        //         ユーザーはグルテンフリーやアレルギー
        //         それぞれの代替品について、以下のフォーマットで出力してください。
        //         1. 名前
        //     `
        // async function main() {
        //     const response = await ai.models.generateContent({
        //         model: "gemini-2.5-flash",
        //         contents: prompt,
        //     });
        //     console.log(response.text);
        // }


        // main();
    };
    return (
        <>
            <h1 data-testid="substitute-search-title">Substitute Search</h1>
            <input type="text" onChange={changeTargetSubstitute} placeholder="代替したいものを入力してください。" value={targetSubstitute} />
            <button onClick={handleSearch}>検索</button>
            {ingredientData.map((ingredient) => (
                <div key={ingredient.id}>
                    <input
                        type="checkbox"
                        id={`ingredient-${ingredient.id}`}
                        onChange={(e) => handleCheckboxChange(ingredient.id, e.target.checked)}
                    />
                    <label htmlFor={`ingredient-${ingredient.id}`}>{ingredient.name}</label>
                </div>
            ))}
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>代替したいもの</th>
                        <th>出力結果</th>
                        <th>出力した日付</th>
                    </tr>
                </thead>
                <tbody>
                    {searchResults.map((result, index) => (
                        <tr key={result.id}>
                            <td>{index + 1}</td>
                            <td>{result.query}</td>
                            <td>{result.ai_response}</td>
                            <td>{result.getFormattedDate()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    );
};
