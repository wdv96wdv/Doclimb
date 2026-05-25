import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuth } from "../../context/AuthContext";
import {
  resetPasswordForEmail,
  signInWithOAuth,
} from "../../services/auth";
import { findEmailByNameAndNickname } from "../../services/profile";
import { showError, showSuccess, showWarning } from "../../utils/notify";
import Swal from "sweetalert2";
import kakaoLoginImage from "../../assets/img/kakao_login_large_wide.png";

const SWAL_FORM_DEFAULTS = {
  background: "#1a1d29",
  color: "#fff",
  confirmButtonColor: "#5271ff",
};

function Login() {
  const navigate = useNavigate();
  const { resendConfirmationEmail, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resending, setResending] = useState(false);

  const handleFindEmail = async () => {
    const { value: formValues } = await Swal.fire({
      title: "아이디 찾기",
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="이름을 입력하세요" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">' +
        '<input id="swal-input2" class="swal2-input" placeholder="닉네임을 입력하세요" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1);">',
      focusConfirm: false,
      showCancelButton: true,
      ...SWAL_FORM_DEFAULTS,
      didOpen: () => {
        const input1 = document.getElementById("swal-input1");
        const input2 = document.getElementById("swal-input2");
        input1.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            input2.focus();
          }
        });
        input2.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value;
        const nickname = document.getElementById("swal-input2").value;
        if (!name || !nickname) {
          Swal.showValidationMessage("이름과 닉네임을 모두 입력해주세요.");
        }
        return { name, nickname };
      },
    });

    if (!formValues) return;

    try {
      const data = await findEmailByNameAndNickname(
        formValues.name,
        formValues.nickname
      );
      if (data) {
        await Swal.fire({
          icon: "success",
          title: "아이디 찾기 결과",
          html: `가입하신 이메일은 <br><b>[ ${data.email} ]</b><br> 입니다.`,
          ...SWAL_FORM_DEFAULTS,
        });
      } else {
        await showWarning(
          "일치하는 정보가 없습니다. 이름과 닉네임을 다시 확인해주세요."
        );
      }
    } catch {
      await showError("조회 중 오류가 발생했습니다.");
    }
  };

  const handleResetPassword = async () => {
    const { value: resetEmail } = await Swal.fire({
      title: "비밀번호 재설정",
      input: "email",
      inputPlaceholder: "example@email.com",
      showCancelButton: true,
      confirmButtonText: "메일 발송",
      ...SWAL_FORM_DEFAULTS,
      didOpen: () => {
        Swal.getInput().addEventListener("keydown", (e) => {
          if (e.key === "Enter") Swal.clickConfirm();
        });
      },
    });

    if (!resetEmail) return;

    try {
      await resetPasswordForEmail(resetEmail);
      await showSuccess("재설정 메일을 보냈습니다!");
    } catch (err) {
      const msg = err.message?.includes("Too many requests")
        ? "잠시 후 다시 시도해주세요."
        : "발송 실패 (이메일을 확인해주세요)";
      await showError(msg);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const data = await signInWithOAuth(provider);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error(`${provider} 로그인 에러:`, err);
      const text =
        provider === "kakao"
          ? "이미 가입된 이메일이거나 서버 오류가 발생했습니다."
          : "구글 로그인 중 오류가 발생했습니다.";
      await showError(text, "로그인 실패");
    }
  };

  const handleResendEmail = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      await resendConfirmationEmail(pendingEmail);
      setMessage("인증 메일을 다시 보냈습니다.");
      setError("");
    } catch (err) {
      setError(err.message || "이메일 재전송 실패");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력하세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      let korMessage = "로그인 중 에러가 발생했습니다.";

      if (err.message.includes("Invalid login credentials")) {
        korMessage = "이메일 또는 비밀번호가 일치하지 않습니다.";
      } else if (err.message.includes("Email not confirmed")) {
        korMessage = "이메일 인증이 완료되지 않았습니다.";
        setEmailNotConfirmed(true);
        setPendingEmail(email);
      } else if (err.message.includes("Too many requests")) {
        korMessage =
          "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      } else if (err.message.includes("User not found")) {
        korMessage = "존재하지 않는 계정입니다.";
      }

      setError(korMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>로그인</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        {emailNotConfirmed && (
          <div className={styles.emailConfirmNotice}>
            <p>📧 이메일 인증이 필요합니다</p>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending}
              className={styles.resendButton}
            >
              {resending ? "전송 중..." : "인증 메일 다시 보내기"}
            </button>
          </div>
        )}

        <div className={styles.findCredentials}>
          <span onClick={handleFindEmail} className={styles.link}>
            아이디 찾기
          </span>
          <span className={styles.divider}>|</span>
          <span onClick={handleResetPassword} className={styles.link}>
            비밀번호 찾기
          </span>
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "이동 중..." : "로그인"}
        </button>

        <div className={styles.kakaoLoginContainer}>
          <img
            src={kakaoLoginImage}
            alt="카카오 로그인"
            onClick={() => handleOAuthLogin("kakao")}
            className={styles.kakaoLoginButton}
          />
        </div>

        <div className={styles.googleLoginContainer}>
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className={styles.googleLoginButton}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Google 계정으로 로그인
          </button>
        </div>
      </form>
      <p className={styles.registerLink}>
        계정이 없으신가요?{" "}
        <span onClick={() => navigate("/join")} className={styles.link}>
          회원가입
        </span>
      </p>
    </div>
  );
}

export default Login;
