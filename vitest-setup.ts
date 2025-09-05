import "@testing-library/jest-dom/vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import { config } from "dotenv";

expect.extend(matchers);
config();
