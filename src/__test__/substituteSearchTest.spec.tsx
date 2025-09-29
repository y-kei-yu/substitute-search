import { render, screen } from "@testing-library/react";
import { SubstituteSearch } from "../pages/SubstituteSearch";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";


// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// useNavigateのモック化(一部モック化)
const mockedNavigator = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigator,
    };
});

// テストで使うユーザー操作イベントを定義
const user = userEvent.setup();

const { getAllIngredientsMock, fetchUserMock, fetchUserIngredientsMock, fetchUserSearchHistoryMock, supabaseMock } = vi.hoisted(() => {
    // テストデータ
    const mockIngredients = [
        { id: 1, name: "塩" },
        { id: 2, name: "砂糖" },
        { id: 3, name: "醤油" },
    ];
    return {
        supabaseMock: {
            auth: {
                getUser: vi.fn(),
            }
        },
        getAllIngredientsMock: vi.fn().mockResolvedValue(mockIngredients),
        fetchUserMock: vi.fn(),
        fetchUserIngredientsMock: vi.fn(),
        fetchUserSearchHistoryMock: vi.fn().mockResolvedValue([]),
    }
});
vi.mock("../service/getAllIngredients", () => ({
    getAllIngredients: getAllIngredientsMock
}));
vi.mock("../service/fetchUser", () => ({
    fetchUser: fetchUserMock
}));
vi.mock("../service/fetchUserIngredients", () => ({
    fetchUserIngredients: fetchUserIngredientsMock
}));
vi.mock("../service/fetchUserSearchHistory", () => ({
    fetchUserSearchHistory: fetchUserSearchHistoryMock
}));
vi.mock("../utils/supabase", () => ({
    supabase: supabaseMock,
}));



describe("代替品検索画面", async () => {
    // セッションの初期化
    beforeEach(() => {
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } });
    });
    test("タイトルが表示できること", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter >
        );
        const title = await screen.findByTestId("testSubstituteSearchTitle");
        expect(title).toHaveTextContent("代替品検索フォーム");
    });

    test("代替したいものの入力欄に文字を入力すると、その値が反映される", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        await user.type(screen.getByLabelText("代替したいもの"), "麺つゆ");
        expect(screen.getByLabelText("代替したいもの")).toHaveValue("麺つゆ");
    });

    test("家にある調味料が表示される", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        expect(await screen.findByText("塩")).toBeInTheDocument();
        expect(await screen.findByText("砂糖")).toBeInTheDocument();
        expect(await screen.findByText("醤油")).toBeInTheDocument();
    });

    test("新規登録画面で入力したデータが初期表示されている", async () => {
        // ユーザーを取得
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "test@test.com" } }
        });

        // ユーザープロフィールをモック
        fetchUserMock.mockResolvedValue({
            is_vegan: true,
            is_gluten_free: true,
            allergies: ["卵"],
        });

        // ユーザーが持っている調味料をモック
        fetchUserIngredientsMock.mockResolvedValue([1, 3]); // 「塩」と「醤油」
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );

        // 「はい」が選ばれていることを確認
        expect(await screen.findByTestId("is_veganYes")).toBeChecked();
        expect(await screen.findByTestId("is_gluten_freeYes")).toBeChecked();

        // アレルギー入力欄に「卵」が表示される
        expect(await screen.findByLabelText("アレルギー（カンマ区切りで入力)"))
            .toHaveValue("卵");

        // 「塩」と「醤油」がチェックされている
        expect(await screen.findByRole("checkbox", { name: "塩" })).toBeChecked();
        expect(await screen.findByRole("checkbox", { name: "醤油" })).toBeChecked();
    });

    test("代替したいものがないとエラーメッセージが表示される", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        await user.clear(screen.getByLabelText("代替したいもの"));
        const SearchButton = await screen.findByRole("button", { name: "検索" })
        await user.click(SearchButton);
        const errorMessage = await screen.getByTestId("substituteErrMsg")
        expect(errorMessage).toHaveTextContent("代替したいものを入力してください。")
    });
})
