import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Join from "./Join";

vi.mock("../../context/AuthContext", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useAuth: () => ({
      signUp: vi.fn(),
    }),
  };
});

vi.mock("../../services/profile", () => ({
  checkEmailAvailable: vi.fn(),
  checkNicknameAvailable: vi.fn(),
}));

describe("Join Component", () => {
  it("should not have a profile ID input field", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Join />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByLabelText(/프로필 아이디/i)).not.toBeInTheDocument();
  });

  it("should associate email label with email id input", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Join />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/이메일/i);
    expect(emailInput).toHaveAttribute("id", "emailId");
  });

  it("should render password checklist", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Join />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("8자 이상")).toBeInTheDocument();
    expect(screen.getByText("특수문자 포함")).toBeInTheDocument();
  });
});
