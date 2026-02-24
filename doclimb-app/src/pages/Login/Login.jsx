import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import kakaoLoginImage from '../../assets/img/kakao_login_large_wide.png';

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


  // 구글 로그인 핸들러 추가
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // 이미 카카오에서 사용 중인 배포 주소를 그대로 사용합니다.
          redirectTo: `https://doclimb.vercel.app/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error("구글 로그인 에러:", err);
      Swal.fire({
        icon: "error",
        title: "로그인 실패",
        text: "구글 로그인 중 오류가 발생했습니다.",
        confirmButtonColor: "#007bff"
      });
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          // 배포 환경 주소와 일치 시킴
          redirectTo: `https://doclimb.vercel.app/`,
        },
      });
      if (error) throw error;
      // signInWithOAuth는 자동으로 리다이렉트되지만, 명시적으로 URL이 있는 경우 이동
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error("카카오 로그인 에러:", err);
      // DB 트리거 에러(saving new user 실패 등) 발생 시 알림
      Swal.fire({
        icon: "error",
        title: "로그인 실패",
        text: "이미 가입된 이메일이거나 서버 오류가 발생했습니다.",
        confirmButtonColor: "#007bff"
      });
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

      // 이메일 로그인 성공 시 프로필 정보(role) 확인
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

        <div className={styles.kakaoLoginContainer}>
          <img
            src={kakaoLoginImage}
            alt="카카오 로그인"
            onClick={handleKakaoLogin}
            className={styles.kakaoLoginButton}
          />
        </div>

        {/* 구글 로그인 버튼 (기능 연결 버전) */}
        <div className={styles.googleLoginContainer}>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleLoginButton}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            style={{ width: '20px', marginRight: '10px' }}
          />
          Google 계정으로 로그인
        </button>
        </div>
      </form >
    <p className={styles.registerLink}>
      계정이 없으신가요? <span onClick={() => navigate('/join')} className={styles.link}>회원가입</span>
    </p>
    </div >
  );
}

export default Login;