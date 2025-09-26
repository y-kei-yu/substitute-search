import { signOut } from "../service/auth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export const Header = () => {
    const navigate = useNavigate()

    // ログアウトボタンを押下時
    const handleSignOut = async () => {
        await signOut()
        navigate("/")
    }

    // タイトルをクリックした時
    const handleTitle = async () => {
        window.location.reload();

    }

    return (
        <header className="w-full border-b bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 text-white shadow">
            <div className="container mx-auto flex items-center justify-between p-4">
                {/* 左側: ロゴ or アイコン */}
                <div className="flex items-center gap-2">
                    {/* PCのみアプリ名表示 */}
                    <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide text-white cursor-pointer hover:text-green-200 transition-colors duration-200"
                        onClick={handleTitle}>
                        代替品検索アプリ
                    </h1>
                </div>

                {/* 右側: ログアウトボタン */}
                <Button
                    onClick={handleSignOut}
                    variant="secondary"
                    className="text-green-700 font-medium bg-white rounded-md shadow-sm hover:bg-green-100 focus:outline-none focus:ring-4 focus:ring-green-200 transition-colors duration-200 cursor-pointer"
                >
                    ログアウト
                </Button>
            </div>
        </header>
    )
}