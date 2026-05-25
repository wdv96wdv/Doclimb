import { POLICY_URL } from "../joinConstants";
import styles from "../Join.module.css";

export default function JoinAgreementSection({ isAgreed, onAgreedChange }) {
  return (
    <>
      <div className={styles.sectionTitle}>약관 동의</div>
      <div className={styles.agreementGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={onAgreedChange}
            className={styles.checkbox}
          />
          <span>개인정보 수집 및 이용 동의 (필수)</span>
        </label>
        <button
          type="button"
          className={styles.policyBtn}
          onClick={() => window.open(POLICY_URL, "_blank")}
        >
          약관 상세보기
        </button>
      </div>
    </>
  );
}
