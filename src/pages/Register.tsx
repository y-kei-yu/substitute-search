import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { Ingredients } from "../domain/Ingredients";
import { getAllIngredients } from "../service/getAllIngredients";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

import { User as SupabaseUser } from "@supabase/supabase-js";
import { toUser } from "../domain/UserMapper";
import { UserForm } from "../domain/UserForm";
import { Header } from "../components/Header";
import { upsertUserData } from "../service/upsertUserData";
import { upsertUserIngredients } from "../service/upsertUserIngredients";


export const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<UserForm>()
    const [ingredientData, setIngredientData] = useState<Ingredients[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const navigate = useNavigate();


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

    //登録ボタンクリック時の処理
    const onSubmit: SubmitHandler<UserForm> = async (data) => {
        if (!authUser) return;
        console.log("登録データ", data);
        console.log("authUser.id", authUser.id)
        console.log("authUser.email", authUser.email)
        // UserForm → User へ変換
        const user = toUser(data, authUser.id, authUser.email ?? "");
        await upsertUserData(user);
        // 選択した食材を登録
        await upsertUserIngredients(authUser.id, selectedIngredients);

        console.log(user);

        navigate("/substitute-search");
    };

    //認証データ取得
    const fetchAuthUser = async () => {
        const { data } = await supabase.auth.getUser();
        setAuthUser(data.user);
    };


    //
    useEffect(() => {
        allIngredients();
        fetchAuthUser();
    }, []);


    return (
        <div className="min-h-dvh bg-slate-50 py-10">
            <div className="mx-auto max-w-3xl px-4">
                <Header />
                {/* Form Card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <h1 data-testid="testRegisterTitle" className=" text-2xl font-bold tracking-tight text-slate-900">新規登録画面</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        {/* Name Field */}
                        <div className="mb-6">
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">ニックネーム</label>
                            <input
                                id="name"
                                {...register("name", {
                                    required: "ニックネームの入力は必須です"
                                })}
                                placeholder="山田 太郎"
                                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                            {errors.name && (
                                <span style={{ color: "red" }} data-testid="nameErrMsg">{errors.name.message}</span>
                            )}
                        </div>

                        {/* is_vegan Field */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-slate-700">ベジタリアン</label>
                            <div className="flex items-center mb-4">
                                <input
                                    id="is_vegan_true"
                                    type="radio"
                                    value="true"
                                    {...register("is_vegan")}
                                    data-testid="testVeganYes"
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <label htmlFor="is_vegan_true" className="ms-2 text-sm font-medium text-gray-900">はい</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="is_vegan_false"
                                    type="radio"
                                    value="false"
                                    {...register("is_vegan")}
                                    data-testid="testVeganNo"
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                    defaultChecked
                                />
                                <label htmlFor="is_vegan_false" className="ms-2 text-sm font-medium text-gray-900">いいえ</label>
                            </div>
                        </div>

                        {/* is_gluten_free Field */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-slate-700">グルテンフリー</label>
                            <div className="flex items-center mb-4">
                                <input
                                    id="is_gluten_free_true"
                                    type="radio"
                                    value="true"
                                    {...register("is_gluten_free")}
                                    data-testid="testGlutenYes"
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                />
                                <label htmlFor="is_gluten_free_true" className="ms-2 text-sm font-medium text-gray-900">はい</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="is_gluten_free_false"
                                    type="radio"
                                    value="false"
                                    {...register("is_gluten_free")}
                                    data-testid="testGlutenNo"
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                                    defaultChecked
                                />
                                <label htmlFor="is_gluten_free_false" className="ms-2 text-sm font-medium text-gray-900">いいえ</label>
                            </div>
                        </div>

                        {/* allergies Field */}
                        <div className="mb-6">
                            <label htmlFor="allergies" className="mb-2 block text-sm font-medium text-slate-700">アレルギー（カンマ区切りで入力）</label>
                            <input
                                id="allergies"
                                {...register("allergies")}
                                placeholder="例: 卵, 乳, 小麦"
                                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100"
                            />
                        </div>

                        {/* Ingredients Section Header */}
                        <div className="mb-3 flex items-baseline justify-between">
                            <label className="text-sm font-medium text-slate-700">家にある調味料</label>
                            <span className="text-xs text-slate-500">選択中: {selectedIngredients.length} 件</span>
                        </div>

                        {/* Ingredients Grid as Cards */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {ingredientData.map((ingredient) => (
                                <div key={ingredient.id} className="">
                                    <label
                                        htmlFor={`ingredient-${ingredient.id}`}
                                        className="group relative block cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md has-[:checked]:border-green-500 has-[:checked]:ring-4 has-[:checked]:ring-green-100"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`ingredient-${ingredient.id}`}
                                            aria-label={ingredient.name}
                                            className="peer sr-only"
                                            checked={selectedIngredients.includes(ingredient.id)}
                                            onChange={(e) => handleCheckboxChange(ingredient.id, e.target.checked)}
                                        />
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 h-5 w-5 shrink-0 rounded border border-slate-300 transition peer-checked:border-green-600 peer-checked:bg-green-600" />
                                            <div>
                                                <p className="font-medium text-slate-900">{ingredient.name}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">チェックして登録</p>
                                            </div>
                                        </div>
                                        {/* checkmark overlay */}
                                        <svg
                                            aria-hidden
                                            viewBox="0 0 24 24"
                                            className="pointer-events-none absolute right-3 top-3 h-5 w-5 opacity-0 transition-opacity peer-checked:opacity-100"
                                        >
                                            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600" />
                                        </svg>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100"
                            >
                                登録
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
