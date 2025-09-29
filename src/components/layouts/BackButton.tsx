import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button"
import { supabase } from "@/utils/supabase";


export const BackButton = () => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center pt-4">
            <Button
                type="button"
                size="lg"
                onClick={async (e) => {
                    e.preventDefault();               // フォーム内でもリロードを抑止
                    await supabase.auth.signOut();    // ← ここでセッションを消す
                    navigate("/");
                }}
                className="mt-6  flex items-center justify-center gap-3 rounded-lg bg-gray-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 transition">
                戻る
            </Button>
        </div>
    )
}