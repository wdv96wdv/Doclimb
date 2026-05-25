import styles from "../Join.module.css";

export default function JoinProfileSection({
  name,
  displayNickname,
  isNicknameChecked,
  nicknameRef,
  onNameChange,
  onNicknameChange,
  onCheckNickname,
}) {
  return (
    <>
      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          이름 <span className={styles.requiredIndicator}>*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={onNameChange}
          required
          className={styles.input}
          maxLength={10}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="displayNickname" className={styles.label}>
          닉네임 <span className={styles.requiredIndicator}>*</span>
        </label>
        <div className={styles.inputWithBtn}>
          <input
            id="displayNickname"
            type="text"
            value={displayNickname}
            ref={nicknameRef}
            onChange={onNicknameChange}
            required
            className={styles.input}
            maxLength={12}
          />
          <button
            type="button"
            onClick={onCheckNickname}
            className={styles.emailCheckBtn}
          >
            중복확인
          </button>
        </div>
      </div>

      {displayNickname && (
        <p className={isNicknameChecked ? styles.successText : styles.hintText}>
          {isNicknameChecked
            ? "✔ 사용 가능한 닉네임입니다"
            : "한글, 영문, 숫자만 가능합니다 (중복 확인 필요)"}
        </p>
      )}
    </>
  );
}
