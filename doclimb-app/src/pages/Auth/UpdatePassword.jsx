import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PasswordChecklist from "../../components/Common/PasswordChecklist";
import {
  isPasswordValid,
  validatePasswordPair,
} from "../../utils/passwordValidation";
import { showError, showSuccess } from "../../utils/notify";
import styles from "./UpdatePassword.module.css";

function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();

  const handleUpdate = async (e) => {
    e.preventDefault();

    const validation = validatePasswordPair(newPassword, confirmPassword);
    if (!validation.ok) {
      if (validation.message.includes("일치")) {
        return showError(validation.message);
      }
      return showWarning(validation.message);
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      await showSuccess(
        "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요!",
        "변경 완료"
      );
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      showError(
        "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
        "변경 실패"
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !!newPassword &&
    !!confirmPassword &&
    isPasswordValid(newPassword) &&
    newPassword === confirmPassword &&
    !loading;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>새 비밀번호 설정</h2>
      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            placeholder="8자 이상, 영문+숫자+특수문자 조합"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            maxLength={20}
            className={styles.input}
          />
          <PasswordChecklist password={newPassword} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            maxLength={20}
            className={styles.input}
          />
          {newPassword && confirmPassword && (
            <p
              className={`${styles.helperText} ${
                newPassword === confirmPassword
                  ? styles.successText
                  : styles.errorText
              }`}
            >
              {newPassword === confirmPassword
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={!canSubmit}
        >
          {loading ? "변경 중..." : "비밀번호 변경하기"}
        </button>
      </form>
    </div>
  );
}

export default UpdatePassword;
