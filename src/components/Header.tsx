import { signOut } from "../service/auth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase"
import { fetchUser } from "@/service/fetchUser"
import { useEffect, useState } from "react"

export const Header = () => {
    const navigate = useNavigate()
    const [nickname, setNickname] = useState<string | null>(null);

    // ログアウトボタンを押下時
    const handleSignOut = async () => {
        await signOut()
        navigate("/")
    }

    //ニックネームを取得
    const fetchUserNickName = async () => {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
            // プロフィール取得
            const userProfile = await fetchUser(data.user.id);
            if (userProfile) setNickname(userProfile.name);
        }
    }
    useEffect(() => {
        fetchUserNickName();

        // ログイン／ログアウトの変化を監視
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    const userProfile = await fetchUser(session.user.id);
                    if (userProfile) {
                        setNickname(userProfile.name);
                    }
                } else if (event === "SIGNED_OUT") {
                    setNickname(null);
                }
            }
        )
        return () => {
            listener.subscription.unsubscribe();
        }
    }, [])

    return (
        <header className="w-full border-b bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 text-white shadow">
            <div className="container mx-auto flex items-center justify-between p-4">
                {/* 左側: ロゴ or アイコン */}
                <div className="flex items-center gap-2">
                    {/* PCのみアプリ名表示 */}
                    <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide text-white">
                        代替品検索アプリ
                    </h1>
                </div>

                {/* 右側: ログアウトボタン */}
                <div className="flex items-center gap-4">
                    {nickname && <span className="font-semibold">{nickname}さん</span>}
                    <Button
                        onClick={handleSignOut}
                        variant="secondary"
                        className="text-green-700 font-medium bg-white rounded-md shadow-sm hover:bg-green-100 focus:outline-none focus:ring-4 focus:ring-green-200 transition-colors duration-200 cursor-pointer"
                    >
                        ログアウト
                    </Button>
                </div>
            </div>
        </header>
    )
}