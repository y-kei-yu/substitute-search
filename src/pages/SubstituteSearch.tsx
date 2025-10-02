import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { getAllIngredients } from "../service/getAllIngredients";
import { Ingredients } from "../domain/Ingredients";
import { SearchHistory } from "../domain/SearchHistory";
import { fetchUserSearchHistory } from "../service/fetchUserSearchHistory";
import { supabase } from "../utils/supabase";
import { fetchUser } from "../service/fetchUser";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { fetchUserIngredients } from "../service/fetchUserIngredients";
import { GoogleGenAI } from "@google/genai";
import { SearchForm } from "../domain/SearchForm";
import { Header } from "../components/Header";
import { toUser } from "../domain/UserMapper";
import { upsertUserData } from "../service/upsertUserData";
import { insertUserSearchHistory } from "../service/insertUserSearchHistory";
import { upsertUserIngredients } from "../service/upsertUserIngredients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserProfileRadioField } from "@/components/UserProfileRadioField";
import { UserProfileTextField } from "@/components/UserProfileTextField";
import { IngredientCheckBox } from "@/components/IngredientCheckBox";
import { SubmitButton } from "@/components/layouts/SubmitButton";
import { BackButton } from "@/components/layouts/BackButton";



export const SubstituteSearch = () => {
    const [ingredientData, setIngredientData] = useState<Ingredients[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [searchResults, setSearchResults] = useState<SearchHistory[]>([]);
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const [latestResult, setLatestResult] = useState<string | null>(null);
    const { register, handleSubmit, reset, formState: { errors }, control } = useForm<SearchForm>();
    const [isLoading, setIsLoading] = useState(false)

    // 初期ロード時に一度だけ呼ぶ
    useEffect(() => {
        allIngredients();
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
            console.log("fetchUser result:", userProfile);
            if (userProfile) {
                // resetで初期値をセット
                reset({
                    targetSubstitute: "",
                    is_vegan: userProfile.is_vegan ?? false,
                    is_gluten_free: userProfile.is_gluten_free ?? false,
                    allergies: userProfile.allergies ? userProfile.allergies.join(", ") : "",
                });
            }
        }
    };

    // AI呼び出し処理
    const callAI = async (prompt: string) => {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text ?? "";
    }

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
    const handleSearch: SubmitHandler<SearchForm> = async (data) => {
        setIsLoading(true);
        const prompt = `
            「${data.targetSubstitute}」が無い場合の代替食材と分量を提案してください。
            - 家庭にある調味料を優先する
            - 必ず「代替食材」「分量」の2行で答える

            条件:
            ${data.is_vegan ? "- 動物性の材料は使わない" : ""}
            ${data.is_gluten_free ? "- 小麦を含む材料は使わない" : ""}
            ${data.allergies ? `- 以下のアレルゲンは使わない: ${data.allergies}` : ""}
            - 家にある食材: ${ingredientData
                .filter((i) => selectedIngredients.includes(i.id))
                .map((i) => i.name)
                .join(", ") || "指定なし"}
            出力形式:
            代替食材: （材料名をカンマ区切りで書く）
            分量: （「材料: 量」の形式でカンマ区切りで書く）
        `;
        try {
            const result = await callAI(prompt);
            setLatestResult(result);  // 検索直後に画面へ表示
            if (authUser) {
                // UserForm → User に変換して保存
                const user = toUser(data, authUser.id, authUser.email ?? "");
                await upsertUserData(user);

                await insertUserSearchHistory({
                    user_id: authUser.id,
                    query: data.targetSubstitute,
                    ai_response: result,
                });

                await userSearchHistory();
                await upsertUserIngredients(authUser.id, selectedIngredients);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Gemini API error:", error.message);
            } else {
                console.error("Gemini API unknown error:", error);
            }
            setLatestResult("サーバーが混雑しています。しばらくしてからもう一度お試しください。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-green-50 via-white to-green-100 pt-0 pb-8">
                <div className="mx-auto w-full max-w-7xl mt-6 sm:mt-10 px-4 sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-3xl font-extrabold text-green-700 text-center" data-testid="testSubstituteSearchTitle">代替品検索フォーム</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSubmit(handleSearch)} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Left column: targetSubstitute, is_vegan, is_gluten_free, allergies */}
                                    <div className="space-y-6">
                                        {/* 代替したいもの */}
                                        <div className="space-y-2">
                                            <Label htmlFor="targetSubstitute" className="text-base font-semibold text-green-700">代替したいもの</Label>
                                            <Input
                                                id="targetSubstitute"
                                                {...register("targetSubstitute", {
                                                    required: "代替したいものを入力してください。",
                                                })}
                                                placeholder="例：バター、卵、小麦粉など"
                                                className="placeholder:text-slate-400"
                                            />
                                            {errors.targetSubstitute?.message && (
                                                <span className="text-red-500 text-sm" data-testid="substituteErrMsg">{errors.targetSubstitute.message}</span>
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
                                {/* 登録ボタンを横並びに配置 */}
                                <div className="flex justify-center gap-4">
                                    <SubmitButton buttonName="検索" />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    {/* 検索中の表示 */}
                    {isLoading && (
                        <div className="mt-10 text-center text-lg font-semibold text-green-700" data-testid="loadingTest">
                            検索中です...
                        </div>
                    )}
                    {/* 検索結果 */}
                    {latestResult && (
                        <div className="mt-10">
                            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-3xl font-extrabold text-green-700 text-center">検索結果</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={latestResult}
                                        readOnly
                                        className="min-h-[300px] resize-none text-2xl md:text-3xl font-extrabold text-green-800 bg-green-50 leading-loose p-6"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {/* 検索履歴 */}
                    {searchResults.length > 0 && (
                        <div className="mt-10">
                            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-green-700">検索履歴</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border bg-muted/30">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-border/50">
                                                    <TableHead className="w-16 font-semibold text-green-700">No</TableHead>
                                                    <TableHead className="font-semibold text-green-700">代替したいもの</TableHead>
                                                    <TableHead className="font-semibold text-green-700">出力結果</TableHead>
                                                    <TableHead className="w-32 font-semibold text-green-700">出力した日付</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {searchResults.map((result, index) => (
                                                    <TableRow
                                                        key={result.id}
                                                        className="border-border/50"
                                                    >
                                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                                        <TableCell className="font-medium">{result.query}</TableCell>
                                                        <TableCell className="max-w-md">
                                                            <div className=" text-muted-foreground whitespace-pre-wrap break-words">{result.ai_response}</div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{result.getFormattedDate()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
