import { signInWithGoogle } from "../service/auth";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
//ログイン直後に使用するユーザー情報
import { User as SupabaseUser } from "@supabase/supabase-js";
import { fetchUser } from "../service/fetchUser";
import { useNavigate } from "react-router-dom";


export const Login = () => {
    const navigate = useNavigate();
    // 認証ユーザー
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        const init = async () => {
            //  開発時は毎回ログアウトから開始（ただしブラウザセッションごとに一度だけ）
            if (import.meta.env.DEV) {
                if (!sessionStorage.getItem("alreadySignedOut")) {
                    await supabase.auth.signOut();
                    sessionStorage.setItem("alreadySignedOut", "true");
                }
            }

            // 初期セッション確認
            const { data } = await supabase.auth.getSession();
            console.log("getSession result:", data);
            const currentUser = data.session?.user ?? null;
            console.log("currentUser", currentUser);
            if (currentUser) {
                setAuthUser(currentUser);
                const appUser = await fetchUser(currentUser.id);
                navigate(appUser ? "/substitute-search" : "/register");
            }

            // 状態変化リスナー
            const { data: listener } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    console.log("🔥 状態変化イベント:", event, session);
                    if (event === "SIGNED_IN") {
                        const user = session?.user ?? null;
                        setAuthUser(user);
                        console.log("user", user);
                        if (user) {
                            const appUser = await fetchUser(user.id);
                            navigate(appUser ? "/substitute-search" : "/register");
                        }
                    } else if (event === "SIGNED_OUT") {
                        setAuthUser(null);
                    }
                }
            );
            subscription = listener.subscription;
            setBootstrapping(false);
        };

        void init();

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 via-white to-green-50">
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="flex flex-col items-center text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-green-700" data-testid="testLoginTitle">代替品検索アプリ</h1>
                    <h2 className="text-2xl font-semibold text-slate-600">
                        食材がなくても、代わりが見つかる
                    </h2>
                    <div className="mt-2" />
                    <p className="text-base md:text-lg text-slate-500 leading-relaxed">
                        卵が切れた？バターがない？このアプリならAIが代わりの食材を提案します。
                    </p>
                    <div className="mt-6" />
                    {!authUser && (
                        <>
                            <button
                                onClick={() => {
                                    console.log(" ボタン押下")
                                    signInWithGoogle()
                                }}
                                className="w-full flex items-center justify-center gap-3 rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition"
                            >
                                <span>Googleでログイン</span>
                            </button>
                            {bootstrapping && (
                                <p className="text-sm text-slate-500">Loading...</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}