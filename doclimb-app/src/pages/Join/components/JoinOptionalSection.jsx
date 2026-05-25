import {
  CLIMBING_LEVEL_OPTIONS,
  CLIMBING_STYLE_OPTIONS,
} from "../joinConstants";
import styles from "../Join.module.css";

export default function JoinOptionalSection({
  climbingLevel,
  preferredGym,
  climbingStyle,
  onLevelChange,
  onGymChange,
  onStyleChange,
}) {
  return (
    <>
      <div className={styles.sectionTitle}>선택 정보</div>

      <div className={styles.inputGroup}>
        <label htmlFor="climbingLevel" className={styles.label}>
          클라이밍 레벨
        </label>
        <select
          id="climbingLevel"
          value={climbingLevel}
          onChange={onLevelChange}
          className={styles.input}
        >
          {CLIMBING_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="preferredGym" className={styles.label}>
          주로 가는 암장
        </label>
        <input
          type="text"
          id="preferredGym"
          value={preferredGym}
          onChange={onGymChange}
          className={styles.input}
          maxLength={50}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>클라이밍 스타일</label>
        <div className={styles.checkboxGroup}>
          {CLIMBING_STYLE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={option.value}
                checked={climbingStyle.includes(option.value)}
                onChange={onStyleChange}
                className={styles.checkbox}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
