import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";

function Login() {
  const navigate = useNavigate();
  const { resendConfirmationEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resending, setResending] = useState(false);

  // 카카오 로그인 함수 예시
  const handleKakaoLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        // 인증 완료 후 사용자를 보낼 페이지 주소 (예: 홈 화면)
        redirectTo: window.location.origin + '/home',
      },
    });

    if (error) {
      console.error('카카오 로그인 에러:', error.message);
      Swal.fire({ icon: 'error', text: '카카오 로그인 중 오류가 발생했습니다.' });
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role?.toUpperCase() === 'ADMIN') {
        // replace를 사용해 현재 페이지를 기록에서 지우고 관리자 페이지로 강제 이동
        window.location.replace("/admin");
      } else {
        window.location.replace("/");
      }

    } catch (err) {
      // --- 에러 메시지 한글화 로직 시작 ---
      let korMessage = "로그인 중 에러가 발생했습니다.";

      if (err.message.includes("Invalid login credentials")) {
        korMessage = "이메일 또는 비밀번호가 일치하지 않습니다.";
      } else if (err.message.includes("Email not confirmed")) {
        korMessage = "이메일 인증이 완료되지 않았습니다.";
        setEmailNotConfirmed(true);
        setPendingEmail(email);
      } else if (err.message.includes("Too many requests")) {
        korMessage = "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
      } else if (err.message.includes("User not found")) {
        korMessage = "존재하지 않는 계정입니다.";
      }

      setError(korMessage);
      setLoading(false); // 에러 발생 시에만 버튼 비활성화를 풉니다.
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>로그인</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>이메일</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>비밀번호</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        {emailNotConfirmed && (
          <div className={styles.emailConfirmNotice}>
            <p>📧 이메일 인증이 필요합니다</p>
            <button type="button" onClick={handleResendEmail} disabled={resending} className={styles.resendButton}>
              {resending ? '전송 중...' : '인증 메일 다시 보내기'}
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "이동 중..." : "로그인"}
        </button>

        <button onClick={handleKakaoLogin} className={styles.kakaoBtn}>
          카카오톡으로 시작하기
        </button>
      </form>
      <p className={styles.registerLink}>
        계정이 없으신가요? <span onClick={() => navigate('/join')} className={styles.link}>회원가입</span>
      </p>
    </div>
  );
}

export default Login;