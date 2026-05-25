export const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/;

export function isPasswordValid(value) {
  return PASSWORD_REGEX.test(value || "");
}

export function getPasswordChecklistState(value) {
  const password = value || "";
  return {
    lengthOk: password.length >= 8,
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+=-]/.test(password),
  };
}

export function validatePasswordPair(password, confirmPassword) {
  if (password.length < 8) {
    return { ok: false, message: "비밀번호는 최소 8자 이상이어야 합니다." };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      ok: false,
      message:
        "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: "비밀번호가 일치하지 않습니다." };
  }
  return { ok: true };
}
