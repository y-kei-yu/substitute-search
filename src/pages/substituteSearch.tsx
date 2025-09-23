import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { getAllIngredients } from "../service/getAllIngredients";
import { Ingredient } from "../domain/Ingredients";
import { SearchHistory } from "../domain/SearchHistory";
import { fetchUserSearchHistory } from "../service/fetchUserSearchHistory";
import { supabase } from "../utils/supabase";
import { fetchUser } from "../service/fetchUser";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { fetchUserIngredients } from "../service/fetchUserIngredients";
import { GoogleGenAI } from "@google/genai";
import { SearchForm } from "../domain/SearchForm";
import { InsertUserSearchHistory } from "../service/InsertUserSearchHistory";
import { Header } from "../components/Header";
import { UpsertUserIngredients } from "../service/UpsertUserIngredients";
import { toUser } from "../domain/UserMapper";
import { UpsertUserData } from "../service/UpsertUser";




export const SubstituteSearch = () => {
    const [ingredientData, setIngredientData] = useState<Ingredient[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [searchResults, setSearchResults] = useState<SearchHistory[]>([]);
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const [latestResult, setLatestResult] = useState<string | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SearchForm>();

    // 初期ロード時に一度だけ呼ぶ
    useEffect(() => {
        allIngredients();
        userSearchHistory();
        fetchAuthUserAndProfile();
    }, []);

    // authUser が決まったあとにだけ呼ぶ
    useEffect(() => {
        if (authUser) {
            fetchUserIngredientsData();
            userSearchHistory();
        }
    }, [authUser]);

    // 材料テーブルから全データを取得する
    const allIngredients = async () => {
        const ingredientData = await getAllIngredients();
        setIngredientData(ingredientData);
    };

    // ユーザーごとの検索履歴を表示する
    const userSearchHistory = async () => {
        if (!authUser) return;
        const userSearchHistory = await fetchUserSearchHistory(authUser.id);
        setSearchResults(userSearchHistory);
    };

    // ユーザー認証とプロフィール取得
    const fetchAuthUserAndProfile = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            setAuthUser(data.user);
            // プロフィール取得
            const userProfile = await fetchUser(data.user.id);
            if (userProfile) {
                // resetで初期値をセット
                reset({
                    targetSubstitute: "",
                    is_vegan: userProfile.is_vegan !== undefined ? String(userProfile.is_vegan) : "false",
                    is_gluten_free: userProfile.is_gluten_free !== undefined ? String(userProfile.is_gluten_free) : "false",
                    allergies: userProfile.allergies ? userProfile.allergies.join(", ") : "",
                });
            }
        }
    };
    // ユーザーが選択した食材を取得
    const fetchUserIngredientsData = async () => {
        if (!authUser) return;
        const userIngredients = await fetchUserIngredients(authUser.id);
        setSelectedIngredients(userIngredients);
    };

    // チェックボックス変更時の状態管理
    const handleCheckboxChange = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIngredients([...selectedIngredients, id]);
        } else {
            setSelectedIngredients(selectedIngredients.filter(selectedId => selectedId !== id));
        }
    };

    // 検索ボタンクリック時の処理
    const handleSearch: SubmitHandler<SearchForm> = (data) => {
        // data: targetSubstitute, is_vegan, is_gluten_free, allergies
        console.log("検索フォーム:", data);
        console.log("選択中の食材:", selectedIngredients);
        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const prompt = `
            「${data.targetSubstitute}」が無い場合の代替食材と分量を提案してください。
            - 家庭にある調味料を優先する
            - 必ず「代替食材」「分量」の2行で答える

            条件:
            ${data.is_vegan === "true" ? "- 動物性の材料は使わない" : ""}
            ${data.is_gluten_free === "true" ? "- 小麦を含む材料は使わない" : ""}
            ${data.allergies ? `- 以下のアレルゲンは使わない: ${data.allergies}` : ""}
            - 家にある食材: ${ingredientData
                .filter((i) => selectedIngredients.includes(i.id))
                .map((i) => i.name)
                .join(", ") || "指定なし"}
            出力形式:
            代替食材: （材料名をカンマ区切りで書く）
            分量: （「材料: 量」の形式でカンマ区切りで書く）
        `;

        async function callAI() {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
                console.log(response.text);
                setLatestResult(response.text ?? null);  // 検索直後に画面へ表示
                if (authUser) {
                    // UserForm → User に変換して保存
                    const user = toUser(data, authUser.id, authUser.email ?? "");
                    await UpsertUserData(user);
                    await InsertUserSearchHistory({
                        user_id: authUser.id,
                        query: data.targetSubstitute,
                        ai_response: response.text ?? "",
                    });
                    await userSearchHistory();
                    await UpsertUserIngredients(authUser.id, selectedIngredients);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Gemini API error:", error.message);
                } else {
                    console.error("Gemini API unknown error:", error);
                }
                setLatestResult("⚠️ サーバーが混雑しています。しばらくしてからもう一度お試しください。");
            }
        };

        callAI();
    };

    return (
        <>
            <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-0 pb-8">
                <Header />
                <div className="mx-auto w-full max-w-7xl mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-slate-200 bg-white shadow-lg p-8">
                        <form onSubmit={handleSubmit(handleSearch)} className="space-y-10">
                            {/* 代替したいもの */}
                            <section className="space-y-4">
                                <label htmlFor="targetSubstitute" className="mb-2 block text-sm font-medium text-slate-700">代替したいもの</label>
                                <input
                                    id="targetSubstitute"
                                    {...register("targetSubstitute", {
                                        required: "代替したいものを入力してください。"
                                    })}
                                    placeholder="代替したいものを入力してください。"
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                />
                                {errors.targetSubstitute?.message && (
                                    <span style={{ color: "red" }} className="error-message">{errors.targetSubstitute?.message}</span>
                                )}
                            </section>
                            {/* is_vegan */}
                            <section className="space-y-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">ベジタリアン</label>
                                <div className="flex items-center mb-4">
                                    <input
                                        id="is_vegan_true"
                                        type="radio"
                                        value="true"
                                        {...register("is_vegan")}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_vegan_true" className="ms-2 text-sm font-medium text-gray-900">はい</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="is_vegan_false"
                                        type="radio"
                                        value="false"
                                        {...register("is_vegan")}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_vegan_false" className="ms-2 text-sm font-medium text-gray-900">いいえ</label>
                                </div>
                            </section>
                            {/* is_gluten_free */}
                            <section className="space-y-4">
                                <label className="mb-2 block text-sm font-medium text-slate-700">グルテンフリー</label>
                                <div className="flex items-center mb-4">
                                    <input
                                        id="is_gluten_free_true"
                                        type="radio"
                                        value="true"
                                        {...register("is_gluten_free")}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_gluten_free_true" className="ms-2 text-sm font-medium text-gray-900">はい</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="is_gluten_free_false"
                                        type="radio"
                                        value="false"
                                        {...register("is_gluten_free")}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_gluten_free_false" className="ms-2 text-sm font-medium text-gray-900">いいえ</label>
                                </div>
                            </section>
                            {/* allergies */}
                            <section className="space-y-4">
                                <label htmlFor="allergies" className="mb-2 block text-sm font-medium text-slate-700">アレルギー（カンマ区切りで入力）</label>
                                <input
                                    id="allergies"
                                    {...register("allergies")}
                                    placeholder="例: 卵, 乳, 小麦"
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                />
                            </section>
                            {/* チェックボックス（家にある調味料） */}
                            <section className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <label className="text-sm font-medium text-slate-700">家にある調味料</label>
                                    <span className="text-xs text-slate-500">選択中: {selectedIngredients.length} 件</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {ingredientData.map((ingredient) => (
                                            <div key={ingredient.id}>
                                                <label
                                                    htmlFor={`ingredient-${ingredient.id}`}
                                                    className="group relative block cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-3 transition has-[:checked]:border-blue-500 has-[:checked]:ring-2 has-[:checked]:ring-blue-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`ingredient-${ingredient.id}`}
                                                        className="peer sr-only"
                                                        checked={selectedIngredients.includes(ingredient.id)}
                                                        onChange={(e) => handleCheckboxChange(ingredient.id, e.target.checked)}
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-0.5 h-5 w-5 shrink-0 rounded border border-slate-300 transition peer-checked:border-blue-600 peer-checked:bg-blue-600" />
                                                        <div>
                                                            <p className="font-medium text-slate-900 text-sm">{ingredient.name}</p>
                                                        </div>
                                                    </div>
                                                    <svg
                                                        aria-hidden
                                                        viewBox="0 0 24 24"
                                                        className="pointer-events-none absolute right-3 top-3 h-5 w-5 opacity-0 transition-opacity peer-checked:opacity-100"
                                                    >
                                                        <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
                                                    </svg>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            {/* 検索ボタン */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                    >
                                        検索
                                    </button>
                                </div>
                            </section>
                            {/* 検索履歴テーブル */}
                            <section className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-sm rounded-lg shadow">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                <th className="px-4 py-2 font-bold text-slate-700">No</th>
                                                <th className="px-4 py-2 font-bold text-slate-700">代替したいもの</th>
                                                <th className="px-4 py-2 font-bold text-slate-700">出力結果</th>
                                                <th className="px-4 py-2 font-bold text-slate-700">出力した日付</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResults.map((result, index) => (
                                                <tr
                                                    key={result.id}
                                                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                                >
                                                    <td className="px-4 py-2">{index + 1}</td>
                                                    <td className="px-4 py-2">{result.query}</td>
                                                    <td className="px-4 py-2">{result.ai_response}</td>
                                                    <td className="px-4 py-2">{result.getFormattedDate()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </form>
                    </div>
                    {latestResult && (
                        <div className="mt-10 p-6 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
                            <h2 className="text-xl font-bold text-blue-700 mb-2">検索結果</h2>
                            <p className="whitespace-pre-line text-slate-800">{latestResult}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

