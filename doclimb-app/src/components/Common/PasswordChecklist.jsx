import styles from "./PasswordChecklist.module.css";
import { getPasswordChecklistState } from "../../utils/passwordValidation";

export default function PasswordChecklist({ password, className }) {
  const { lengthOk, hasLetter, hasNumber, hasSpecial } =
    getPasswordChecklistState(password);

  return (
    <ul className={`${styles.checklist} ${className || ""}`}>
      <li className={lengthOk ? styles.ok : styles.no}>8자 이상</li>
      <li className={hasLetter ? styles.ok : styles.no}>영문 포함</li>
      <li className={hasNumber ? styles.ok : styles.no}>숫자 포함</li>
      <li className={hasSpecial ? styles.ok : styles.no}>특수문자 포함</li>
    </ul>
  );
}
