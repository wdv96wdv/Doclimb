import { EMAIL_ID_REGEX } from "../joinConstants";
import styles from "../Join.module.css";

export default function JoinEmailSection({
  emailId,
  emailDomain,
  emailDomains,
  isEmailChecked,
  getFullEmail,
  onEmailIdChange,
  onDomainChange,
  onCheckDuplicate,
}) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor="emailId" className={styles.label}>
        이메일 <span className={styles.requiredIndicator}>*</span>
      </label>

      <div className={styles.emailBox}>
        <input
          id="emailId"
          type="text"
          value={emailId}
          onChange={onEmailIdChange}
          placeholder="이메일 아이디"
          className={styles.emailInput}
          maxLength={50}
        />
        <span className={styles.at}>@</span>
        <select
          value={emailDomain}
          onChange={(e) => onDomainChange(e.target.value)}
          className={styles.emailSelect}
        >
          {emailDomains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onCheckDuplicate}
          className={styles.emailCheckBtn}
        >
          중복확인
        </button>
      </div>

      {!EMAIL_ID_REGEX.test(emailId) && emailId.length > 0 ? (
        <p
          className={styles.errorText}
          style={{ fontSize: "12px", color: "#ff4d4f", marginTop: "4px" }}
        >
          영문, 숫자, 특수문자(._%+-)만 사용 가능합니다.
        </p>
      ) : (
        emailId && (
          <p className={isEmailChecked ? styles.successText : styles.hintText}>
            {isEmailChecked
              ? `✔ ${getFullEmail()} 사용 가능`
              : "이메일 중복 확인이 필요합니다"}
          </p>
        )
      )}
    </div>
  );
}
