import { signOut } from "../service/auth"
import { useNavigate } from "react-router-dom";

export const Header = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <header className="w-full bg-blue-500 text-white">
            <div className="flex justify-between items-center p-5 flex-col md:flex-row">
                <a className="flex title-font font-medium items-center text-white mb-4 md:mb-0">
                    <h1 className="ml-3 text-xl text-white">代替品検索アプリ</h1>
                </a>
                <button
                    onClick={handleSignOut}
                    className="ml-auto bg-white text-blue-600 hover:bg-blue-100 rounded px-4 py-2 text-sm font-medium"
                >
                    ログアウト
                </button>
            </div>
        </header>
    )
}