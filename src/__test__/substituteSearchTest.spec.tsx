import { render, screen } from "@testing-library/react";
import { SubstituteSearch } from "../pages/SubstituteSearch";
import { MemoryRouter } from "react-router-dom";
// import userEvent from "@testing-library/user-event";


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
// const user = userEvent.setup();


describe("代替品検索画面", async () => {
    test("タイトルが表示できること", async () => {
        render(
            <MemoryRouter>
                <SubstituteSearch />
            </MemoryRouter >
        );
        const title = await screen.findByTestId("testSubstituteSearchTitle");
        expect(title).toHaveTextContent("代替品検索フォーム");
    });

    // test("代替したいものの入力欄に文字を入力すると、その値が反映される", async () => {
    //     render(
    //         <MemoryRouter>
    //             <SubstituteSearch />
    //         </MemoryRouter>
    //     );
    //     await user.type(screen.getByLabelText("代替したいもの"), "麺つゆ");
    //     expect(screen.getByLabelText("代替したいもの")).toHaveValue("麺つゆ");
    // });
})