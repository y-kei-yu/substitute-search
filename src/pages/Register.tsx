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
import { upsertUserData } from "../service/upsertUserData";
import { upsertUserIngredients } from "../service/upsertUserIngredients";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfileRadioField } from "@/components/UserProfileRadioField";
import { UserProfileTextField } from "@/components/UserProfileTextField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IngredientCheckBox } from "@/components/IngredientCheckBox";
import { SubmitButton } from "@/components/layouts/SubmitButton";
import { BackButton } from "@/components/layouts/BackButton";


export const Register = () => {
    const { register, handleSubmit, formState: { errors }, control } = useForm<UserForm>({
        defaultValues: {
            name: "",
            is_vegan: false,
            is_gluten_free: false,
            allergies: "",
        },
    })
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
        <>
            <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-green-50 via-white to-green-100 pt-0 pb-8">
                <div className="mx-auto w-full max-w-7xl mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-3xl font-extrabold text-green-700 text-center" data-testid="testSubstituteSearchTitle">新規登録画面</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        {/* ニックネーム */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base font-semibold text-green-700">ニックネーム</Label>
                                            <Input
                                                id="name"
                                                {...register("name", {
                                                    required: "ニックネームの入力は必須です",
                                                })}
                                                placeholder="山田 太郎"
                                                className="placeholder:text-slate-400"
                                            />
                                            {errors.name?.message && (
                                                <span className="text-red-500 text-sm" data-testid="nameErrMsg">{errors.name.message}</span>
                                            )}
                                        </div>
                                        {/* is_vegan */}
                                        <UserProfileRadioField
                                            fieldLabel="ベジタリアン"
                                            name={"is_vegan"}
                                            control={control}
                                            idPrefix="is_vegan"
                                        />
                                        {/* is_gluten_free */}
                                        <UserProfileRadioField
                                            fieldLabel="グルテンフリー"
                                            name={"is_gluten_free"}
                                            control={control}
                                            idPrefix="is_gluten_free"
                                        />
                                        {/* allergies */}
                                        <UserProfileTextField
                                            name="allergies"
                                            fieldLabel="アレルギー（カンマ区切りで入力)"
                                            register={register}
                                        />
                                    </div>
                                    {/* Right column: 家にある調味料 */}
                                    <IngredientCheckBox
                                        fieldLabel="家にある調味料"
                                        ingredientData={ingredientData}
                                        selectedIngredients={selectedIngredients}
                                        onChange={handleCheckboxChange}
                                    />
                                </div>
                                {/* 登録・戻るボタンを横並びに配置 */}
                                <div className="flex justify-center gap-4">
                                    <BackButton />
                                    <SubmitButton buttonName="登録" />
                                </div>

                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
