import { Header } from "@/components/Header";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";


// useNavigateのモック化(一部モック化)
const mockedNavigator = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigator,
    };
});

const { fetchUserMock, supabaseMock } = vi.hoisted(() => {
    return {
        supabaseMock: {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } })
            }
        },
        fetchUserMock: vi.fn().mockResolvedValue({ name: "テストユーザー" }),
    }
})
vi.mock("../service/fetchUser", () => ({
    fetchUser: fetchUserMock
}));
vi.mock("../utils/supabase", () => ({
    supabase: supabaseMock,
}));
vi.mock("../service/auth", () => ({
    signOut: vi.fn().mockResolvedValue(undefined),
}));

// テストで使うユーザー操作イベントを定義
const user = userEvent.setup();

describe("ヘッダー画面", async () => {
    test("タイトルが表示できること", async () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter >
        );
        const title = await screen.findByText("代替品検索アプリ");
        expect(title).toBeInTheDocument();
    });

    test("ニックネームが表示されること", async () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        )
        const nickName = await screen.findByText("テストユーザーさん");
        expect(nickName).toBeInTheDocument();
    });

    test("ログアウトをクリックするとログイン画面に遷移すること", async () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        )
        // ログアウトボタン押下
        const logoutButton = screen.getByRole("button", { name: "ログアウト" });
        await user.click(logoutButton);

        // ログインに遷移する
        expect(mockedNavigator).toHaveBeenCalledWith("/");
    });
})