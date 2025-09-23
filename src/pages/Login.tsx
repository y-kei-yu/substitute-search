import { signInWithGoogle } from "../service/auth";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
//ログイン直後に使用するユーザー情報
import { User as SupabaseUser } from "@supabase/supabase-js";
import { fetchUser } from "../service/fetchUser";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";


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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-50">
            <Header />
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center space-y-6">
                    <h1 className="text-3xl font-extrabold text-blue-700" data-testid="testLoginTitle">ログイン画面</h1>
                    {!authUser && (
                        <>
                            <button
                                onClick={() => {
                                    console.log(" ボタン押下");
                                    signInWithGoogle();
                                }}
                                className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                                    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.5c-6.4 34.5-25.9 63.7-55.1 83.2v68h88.9c52.1-47.9 80.2-118.4 80.2-196z" />
                                    <path fill="#34A853" d="M272 544.3c74.9 0 137.6-24.9 183.5-67.9l-88.9-68c-24.7 16.6-56.4 26.4-94.6 26.4-72.9 0-134.7-49.2-156.9-115.2h-92.3v72.3C70.8 486.7 164.1 544.3 272 544.3z" />
                                    <path fill="#FBBC05" d="M115.1 319.6c-10.6-31.6-10.6-65.7 0-97.3v-72.3H22.8c-45.7 91.3-45.7 198.4 0 289.7l92.3-72.3z" />
                                    <path fill="#EA4335" d="M272 107.7c39.7 0 75.6 13.7 103.9 40.5l77.9-77.9C409.6 24.5 346.9 0 272 0 164.1 0 70.8 57.6 22.8 150.1l92.3 72.3c22.2-66 84-115.2 156.9-115.2z" />
                                </svg>
                                <span>Googleでログイン</span>
                            </button>
                            {bootstrapping && <p className="text-sm text-slate-500">Loading...</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};