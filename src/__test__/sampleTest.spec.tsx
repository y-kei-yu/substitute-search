import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";


test("タイトルがあること", async () => {
  render(<App />);
  const title = await screen.findByTestId("testTitle");
  expect(title).toBeInTheDocument();
});
