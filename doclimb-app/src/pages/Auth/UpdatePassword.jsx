import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import styles from "./UpdatePassword.module.css";

const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/;

function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return Swal.fire({
        icon: "warning",
        text: "비밀번호는 최소 8자 이상이어야 합니다.",
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return Swal.fire({
        icon: "warning",
        text: "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
      });
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        text: "비밀번호가 일치하지 않습니다.",
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "변경 실패",
        text: "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
      setLoading(false);
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "변경 완료",
      text: "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요!",
    });

    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const isPasswordValid = PASSWORD_REGEX.test(newPassword);
  const canSubmit =
    !!newPassword &&
    !!confirmPassword &&
    isPasswordValid &&
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
          <ul className={styles.passwordChecklist}>
            <li className={newPassword.length >= 8 ? styles.ok : styles.no}>
              8자 이상
            </li>
            <li className={/[A-Za-z]/.test(newPassword) ? styles.ok : styles.no}>
              영문 포함
            </li>
            <li className={/\d/.test(newPassword) ? styles.ok : styles.no}>
              숫자 포함
            </li>
            <li
              className={
                /[!@#$%^&*()_+=-]/.test(newPassword)
                  ? styles.ok
                  : styles.no
              }
            >
              특수문자 포함
            </li>
          </ul>
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