import { useJoinForm } from "../../hooks/useJoinForm";
import JoinEmailSection from "./components/JoinEmailSection";
import JoinPasswordSection from "./components/JoinPasswordSection";
import JoinProfileSection from "./components/JoinProfileSection";
import JoinOptionalSection from "./components/JoinOptionalSection";
import JoinAgreementSection from "./components/JoinAgreementSection";
import styles from "./Join.module.css";

function Join() {
  const form = useJoinForm();

  return (
    <div className={styles.joinContainer}>
      <h1 className={styles.title}>회원가입</h1>
      <form onSubmit={form.handleSubmit} className={styles.form}>
        <div className={styles.sectionTitle}>필수 정보</div>

        <JoinEmailSection
          emailId={form.emailId}
          emailDomain={form.emailDomain}
          emailDomains={form.emailDomains}
          isEmailChecked={form.isEmailChecked}
          getFullEmail={form.getFullEmail}
          onEmailIdChange={form.handleEmailIdChange}
          onDomainChange={form.handleEmailDomainChange}
          onCheckDuplicate={form.checkEmailDuplicate}
        />

        <JoinPasswordSection
          password={form.password}
          confirmPassword={form.confirmPassword}
          onPasswordChange={(e) => form.setPassword(e.target.value)}
          onConfirmChange={(e) => form.setConfirmPassword(e.target.value)}
        />

        <JoinProfileSection
          name={form.name}
          displayNickname={form.displayNickname}
          isNicknameChecked={form.isNicknameChecked}
          nicknameRef={form.nicknameRef}
          onNameChange={(e) => form.setName(e.target.value)}
          onNicknameChange={form.handleNicknameChange}
          onCheckNickname={form.checkNicknameDuplicate}
        />

        <JoinOptionalSection
          climbingLevel={form.climbingLevel}
          preferredGym={form.preferredGym}
          climbingStyle={form.climbingStyle}
          onLevelChange={(e) => form.setClimbingLevel(e.target.value)}
          onGymChange={(e) => form.setPreferredGym(e.target.value)}
          onStyleChange={form.handleClimbingStyleChange}
        />

        <JoinAgreementSection
          isAgreed={form.isAgreed}
          onAgreedChange={(e) => form.setIsAgreed(e.target.checked)}
        />

        {form.error && <p className={styles.error}>{form.error}</p>}

        <button
          type="submit"
          disabled={!form.canSubmit || form.loading}
          className={`${styles.button} ${!form.canSubmit ? styles.disabled : ""}`}
        >
          {form.loading ? "가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
}

export default Join;
