import PasswordChecklist from "../../../components/Common/PasswordChecklist";
import styles from "../Join.module.css";

export default function JoinPasswordSection({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmChange,
}) {
  return (
    <>
      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          비밀번호 <span className={styles.requiredIndicator}>*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="8자 이상, 영문+숫자 조합"
          required
          className={styles.input}
          maxLength={20}
        />
        <PasswordChecklist password={password} />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          비밀번호 확인 <span className={styles.requiredIndicator}>*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={onConfirmChange}
          required
          className={styles.input}
          maxLength={20}
        />
        {password && confirmPassword && (
          <p
            className={
              password === confirmPassword
                ? styles.successText
                : styles.errorText
            }
          >
            {password === confirmPassword
              ? "비밀번호가 일치합니다."
              : "비밀번호가 일치하지 않습니다."}
          </p>
        )}
      </div>
    </>
  );
}
