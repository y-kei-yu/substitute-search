import { render, screen, waitFor } from "@testing-library/react";
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

const { getAllIngredientsMock, fetchUserMock, fetchUserIngredientsMock, fetchUserSearchHistoryMock, insertUserSearchHistoryMock, supabaseMock, generateContentMock } = vi.hoisted(() => {
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
            },
            from: vi.fn(() => ({
                upsert: vi.fn().mockResolvedValue({ error: null, data: [] }),
                eq: vi.fn().mockReturnThis(),
            })),
        },
        getAllIngredientsMock: vi.fn().mockResolvedValue(mockIngredients),
        fetchUserMock: vi.fn(),
        fetchUserIngredientsMock: vi.fn(),
        fetchUserSearchHistoryMock: vi.fn().mockResolvedValue([]),
        insertUserSearchHistoryMock: vi.fn(),
        generateContentMock: vi.fn().mockResolvedValue({
            text: "ダミーAIレスポンス",
        }),

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
vi.mock("../service/insertUserSearchHistory", () => ({
    insertUserSearchHistory: insertUserSearchHistoryMock,
}));
vi.mock("../utils/supabase", () => ({
    supabase: supabaseMock,
}));
vi.mock("@google/genai", () => {
    return {
        GoogleGenAI: vi.fn().mockImplementation(() => ({
            models: {
                generateContent: generateContentMock,
            }
        }))
    }
})

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
        // デバッグ出力を追加
        // screen.debug();

        // 「はい」が選ばれていることを確認
        await waitFor(() => {
            expect(screen.getByTestId("is_veganYes")).toBeChecked();
            expect(screen.getByTestId("is_gluten_freeYes")).toBeChecked();
        });

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

    test("入力して検索ボタンを押すと AI検索関数（モック）が呼ばれる", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );

        await user.type(screen.getByLabelText("代替したいもの"), "バター");
        const SearchButton = await screen.findByRole("button", { name: "検索" })
        await user.click(SearchButton);

        await waitFor(() => {
            expect(generateContentMock).toHaveBeenCalled();
        })
    })

    test("検索クリックでローディングが出て、AIからの結果が出たらローディングが消える", async () => {
        let resolvePromise!: (val: { text: string }) => void;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        })
        generateContentMock.mockReturnValue(promise)

        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        await user.type(screen.getByLabelText("代替したいもの"), "バター");
        const SearchButton = await screen.findByRole("button", { name: "検索" })
        await user.click(SearchButton);

        // ローディングが表示される
        const loading = await screen.findByTestId("loadingTest");
        expect(loading).toBeInTheDocument();

        // モックのPromiseを解決してAIレスポンスを返す
        resolvePromise({ text: "ダミーAIレスポンス" });

        // ローディングが消え、結果が表示される
        await waitFor(() => {
            expect(screen.queryByTestId("loadingTest")).not.toBeInTheDocument();
            expect(screen.getByText("ダミーAIレスポンス")).toBeInTheDocument();
        });
    });

    test("AI が失敗したら「 サーバーが混雑しています…」が表示される", async () => {
        generateContentMock.mockRejectedValue(new Error("APIエラー"))
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        await user.type(screen.getByLabelText("代替したいもの"), "バター");
        const SearchButton = await screen.findByRole("button", { name: "検索" })
        await user.click(SearchButton);
        await waitFor(() => {
            expect(screen.getByText("サーバーが混雑しています。しばらくしてからもう一度お試しください。")).toBeInTheDocument();
        });
    })

    test("検索した内容が履歴に追加される", async () => {
        // ユーザーを取得
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "test@test.com" } }
        });

        fetchUserSearchHistoryMock
            .mockResolvedValueOnce([]) // 初期状態では履歴なし
            .mockResolvedValueOnce([   // 検索後
                {
                    id: 1,
                    query: "バター",
                    ai_response: "ダミーAIレスポンス",
                    getFormattedDate: () => "2025-10-02",
                },
            ]);

        let resolvePromise!: (val: { text: string }) => void;
        const promise = new Promise<{ text: string }>((resolve) => {
            resolvePromise = resolve;
        });
        generateContentMock.mockReturnValueOnce(promise);

        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(supabaseMock.auth.getUser).toHaveBeenCalled();
        });
        await user.type(screen.getByLabelText("代替したいもの"), "バター");
        const SearchButton = await screen.findByRole("button", { name: "検索" })
        await user.click(SearchButton);

        resolvePromise({ text: "ダミーAIレスポンス" });
        await waitFor(() => {
            console.log("calls:", insertUserSearchHistoryMock.mock.calls);
            expect(insertUserSearchHistoryMock).toHaveBeenCalled();
            expect(screen.getByText("バター")).toBeInTheDocument();
            expect(screen.getByText("ダミーAIレスポンス")).toBeInTheDocument();
        });
    })

    test("調味料のランキングが正しく集計される", async () => {

    })
})
