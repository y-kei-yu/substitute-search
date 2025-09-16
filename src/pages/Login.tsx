import { signInWithGoogle } from "../service/auth";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
//ログイン直後に使用するユーザー情報
import { User as SupabaseUser } from "@supabase/supabase-js";
//DBに保存する型
//import { User as AppUser } from "../domain/User";
import { fetchUser } from "../service/fetchUser";
import { useNavigate } from "react-router";


export const Login = () => {
    const navigate = useNavigate();
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null); // 認証ユーザー
    //const [appUser, setAppUser] = useState<AppUser | null>(null);       // プロフィール付きユーザー
    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        const init = async () => {
            // ✅ 開発時は毎回ログアウトから開始（ただしブラウザセッションごとに一度だけ）
            if (import.meta.env.DEV) {
                if (!sessionStorage.getItem("alreadySignedOut")) {
                    await supabase.auth.signOut();
                    sessionStorage.setItem("alreadySignedOut", "true");
                }
            }

            // ✅ 初期セッション確認
            const { data } = await supabase.auth.getSession();
            console.log("✅ getSession result:", data);
            const currentUser = data.session?.user ?? null;
            console.log("currentUser", currentUser);
            if (currentUser) {
                setAuthUser(currentUser);
                const appUser = await fetchUser(currentUser.id);
                navigate(appUser ? "/substitute-search" : "/register");
            }

            // ✅ 状態変化リスナー
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
        <div>
            {/* 未ログイン時は必ずボタン表示（初期処理中は Loading を併記） */}
            {!authUser && (
                <>
                    <button onClick={() => {
                        console.log("✅ ボタン押下");
                        signInWithGoogle();
                    }}>Googleでログイン</button>
                    {bootstrapping && <p>Loading...</p>}
                </>
            )}
        </div>
    );
};