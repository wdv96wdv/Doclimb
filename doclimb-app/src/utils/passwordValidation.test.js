import { describe, it, expect } from "vitest";
import {
  PASSWORD_REGEX,
  isPasswordValid,
  getPasswordChecklistState,
  validatePasswordPair,
} from "./passwordValidation";

describe("passwordValidation", () => {
  it("accepts valid password", () => {
    expect(isPasswordValid("Abcdef1!")).toBe(true);
    expect(PASSWORD_REGEX.test("Abcdef1!")).toBe(true);
  });

  it("rejects password without special char", () => {
    expect(isPasswordValid("Abcdef12")).toBe(false);
  });

  it("getPasswordChecklistState reflects rules", () => {
    const state = getPasswordChecklistState("Abc1!");
    expect(state.lengthOk).toBe(false);
    expect(state.hasLetter).toBe(true);
    expect(state.hasNumber).toBe(true);
    expect(state.hasSpecial).toBe(true);
  });

  it("validatePasswordPair checks match", () => {
    expect(validatePasswordPair("Abcdef1!", "Abcdef1!").ok).toBe(true);
    expect(validatePasswordPair("Abcdef1!", "wrong").ok).toBe(false);
  });
});
