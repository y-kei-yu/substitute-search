import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Register } from "../pages/Register";
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

// モック定義（外部依存を差し替え）
const { getAllIngredientsMock, upsertUserDataMock, upsertUserIngredientsMock, supabaseMock } = vi.hoisted(() => {
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
        upsertUserDataMock: vi.fn(),
        upsertUserIngredientsMock: vi.fn(),
        fetchUserMock: vi.fn()

    };
});
// サービスやsupabaseをモックに置き換え
vi.mock("../service/getAllIngredients", () => ({
    getAllIngredients: getAllIngredientsMock
}));
vi.mock("../service/upsertUserData", () => ({
    upsertUserData: upsertUserDataMock
}));
vi.mock("../service/upsertUserIngredients", () => ({
    upsertUserIngredients: upsertUserIngredientsMock
}));
vi.mock("../utils/supabase", () => ({
    supabase: supabaseMock,
}));

// テストで使うユーザー操作イベントを定義
const user = userEvent.setup();


describe("新規登録画面", async () => {
    // セッションの初期化
    beforeEach(() => {
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } });
    });

    test("タイトルが表示できること", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter >
        );
        // waitFor使用しないで書く方法
        const title = await screen.findByTestId("testRegisterTitle");
        expect(title).toHaveTextContent("新規登録画面");
    });

    test("ニックネーム入力欄に文字を入力すると、その値が反映される", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        await user.type(screen.getByLabelText("ニックネーム"), "テスト");
        expect(screen.getByLabelText("ニックネーム")).toHaveValue("テスト");
    });

    test("ヴィーガンのラジオボタンが表示され、初期値は「いいえ」になっている", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        const veganYes = screen.getByTestId("is_veganYes") as HTMLInputElement;
        const veganNo = screen.getByTestId("is_veganNo") as HTMLInputElement;

        expect(veganYes).not.toBeChecked();
        expect(veganNo).toBeChecked(); // 初期は「いいえ」
    });

    test("ヴィーガンのラジオボタンの「はい」を選択できる", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        const veganYes = screen.getByTestId("is_veganYes") as HTMLInputElement;
        const veganNo = screen.getByTestId("is_veganNo") as HTMLInputElement;

        // 「はい」を選択
        await user.click(veganYes);
        expect(veganYes).toBeChecked();
        expect(veganNo).not.toBeChecked();
    });

    test("グルテンフリーのラジオボタンが表示され、初期値は「いいえ」になっている", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        const glutenYes = screen.getByTestId("is_gluten_freeYes") as HTMLInputElement;
        const glutenNo = screen.getByTestId("is_gluten_freeNo") as HTMLInputElement;

        expect(glutenYes).not.toBeChecked();
        expect(glutenNo).toBeChecked(); // 初期は「いいえ」
    });

    test("グルテンフリーのラジオボタンの「はい」を選択できる", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        const glutenYes = screen.getByTestId("is_gluten_freeYes") as HTMLInputElement;
        const glutenNo = screen.getByTestId("is_gluten_freeNo") as HTMLInputElement;

        // 「はい」を選択
        await user.click(glutenYes);
        expect(glutenYes).toBeChecked();
        expect(glutenNo).not.toBeChecked();
    });

    test("家にある調味料が表示される", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        expect(await screen.findByText("塩")).toBeInTheDocument();
        expect(await screen.findByText("砂糖")).toBeInTheDocument();
        expect(await screen.findByText("醤油")).toBeInTheDocument();
    });

    test("調味料のチェックボックスを選択・解除できる", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // 「塩」のチェックボックスを取得
        const saltCheckBox = await screen.findByRole("checkbox", { name: "塩" });

        // 初期状態: チェックされていない
        expect(saltCheckBox).not.toBeChecked();

        // クリック → チェックされる
        await user.click(saltCheckBox);
        expect(saltCheckBox).toBeChecked();

        // もう一度クリック → チェックが外れる
        await user.click(saltCheckBox);
        expect(saltCheckBox).not.toBeChecked();
    });

    test("アレルギー入力欄に文字を入力すると、その値が反映される", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        await user.type(screen.getByLabelText("アレルギー（カンマ区切りで入力）"), "卵");
        expect(screen.getByLabelText("アレルギー（カンマ区切りで入力）")).toHaveValue("卵");
    });

    test("ニックネームがないとエラーメッセージが表示される", async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
        await user.clear(screen.getByLabelText("ニックネーム"));
        const loginButton = await screen.findByRole("button", { name: "登録" })
        await user.click(loginButton);
        const errorMessage = await screen.getByTestId("nameErrMsg")
        expect(errorMessage).toHaveTextContent("ニックネームの入力は必須です")
    });

    test("登録ボタン押下でデータ保存と画面遷移が行われる", async () => {

        // ユーザーを取得
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "test@test.com" } }
        });
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // ニックネーム入力
        await user.type(screen.getByLabelText("ニックネーム"), "テストユーザー");

        // ヴィーガン「はい」を選択
        const veganYes = screen.getByTestId("is_veganYes") as HTMLInputElement;
        await user.click(veganYes);

        // グルテンフリー「はい」を選択
        const glutenYes = screen.getByTestId("is_gluten_freeYes") as HTMLInputElement;
        await user.click(glutenYes);

        // アレルギーを入力
        await user.type(screen.getByLabelText("アレルギー（カンマ区切りで入力）"), "卵");

        // 調味料「塩」を選択
        const saltCheckBox = await screen.findByRole("checkbox", { name: "塩" });
        await user.click(saltCheckBox);

        // 登録ボタン押下
        const registerButton = screen.getByRole("button", { name: "登録" });
        await user.click(registerButton);

        // UpsertUserData が呼ばれる
        console.log("upsertUserDataMock 出力結果", upsertUserDataMock.mock.calls);
        expect(upsertUserDataMock).toHaveBeenCalled();

        // UpsertUserIngredients が呼ばれる
        console.log("upsertUserIngredientsMock 出力結果", upsertUserIngredientsMock.mock.calls);
        expect(upsertUserIngredientsMock).toHaveBeenCalled();

        // 代替品検索画面に遷移する
        expect(mockedNavigator).toHaveBeenCalledWith("/substitute-search");
    });
})