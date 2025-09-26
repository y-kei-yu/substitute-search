import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "../pages/Login";
import userEvent from "@testing-library/user-event";


// useNavigateのモック化(一部モック化)
const mockedNavigator = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigator,
    };
});
// supabase,fetchUserのモック化
const { supabaseMock, fetchUserMock } = vi.hoisted(() => ({
    supabaseMock: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
            signOut: vi.fn(),
        },
    },
    fetchUserMock: vi.fn(),
}));
vi.mock("../utils/supabase", () => ({
    supabase: supabaseMock,
}));

vi.mock("../service/fetchUser", () => ({
    fetchUser: fetchUserMock
}));

// テストで使うユーザー操作イベントを定義
const user = userEvent.setup();





describe("ログイン画面", () => {

    // セッションの初期化
    beforeEach(() => {
        supabaseMock.auth.getSession.mockResolvedValue({
            data: { session: null }, // ログインしていないデフォルト
        });
    });

    test("タイトルが表示できること", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter >
        );
        await waitFor(() => {
            const title = screen.getByTestId("testLoginTitle");
            expect(title).toHaveTextContent("代替品検索アプリ");
        });
    });

    test("ユーザーが Supabase の users テーブルに存在する場合、検索画面に遷移すること", async () => {
        // ログインユーザとユーザを取得
        supabaseMock.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
        });
        fetchUserMock.mockResolvedValue({ id: "user-123" });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter >
        );
        const loginButton = await screen.findByRole("button", { name: "Googleでログイン" })
        await user.click(loginButton);
        expect(mockedNavigator).toHaveBeenCalledWith("/substitute-search")
    })

    test("ユーザーが Supabase の users テーブルに存在しない場合、新規登録画面に遷移すること", async () => {
        // ログインユーザとユーザを取得
        supabaseMock.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: "user-123" } } },
        });
        fetchUserMock.mockResolvedValue(null);

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter >
        );
        const loginButton = await screen.findByRole("button", { name: "Googleでログイン" })
        await user.click(loginButton);
        expect(mockedNavigator).toHaveBeenCalledWith("/register")
    })

});