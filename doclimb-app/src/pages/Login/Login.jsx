import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import kakaoLoginImage from "../../assets/img/kakao_login_large_wide.png";

const APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://doclimb.vercel.app";

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


  // --- 추가된 기능: 아이디(이메일) 찾기 ---
  const handleFindEmail = async () => {
    const { value: formValues } = await Swal.fire({
      title: '아이디 찾기',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="이름을 입력하세요">' +
        '<input id="swal-input2" class="swal2-input" placeholder="닉네임을 입력하세요">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      // 1. 이제 팝업이 열렸으니, 화면에서 입력창을 찾을 수 있습니다
      didOpen: () => {
        // 1. 팝업창에서 입력창을 찾는다
        const input1 = document.getElementById('swal-input1');
        const input2 = document.getElementById('swal-input2');
      
        // 2. 이름 입력창에서 엔터 치면 -> 닉네임창으로 이동
        input1.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault(); // 엔터 시 폼 제출 방지 (필요 시)
            input2.focus();
          }
        });
      
        // 3. 닉네임 입력창에서 엔터 치면 -> 확인 버튼 클릭 (제출)
        input2.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            Swal.clickConfirm();
          }
        });
      },
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const nickname = document.getElementById('swal-input2').value;
        if (!name || !nickname) {
          Swal.showValidationMessage('이름과 닉네임을 모두 입력해주세요.');
        }
        return { name, nickname };
      }
    });

    if (formValues) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', formValues.name)
        .eq('display_nickname', formValues.nickname) // 닉네임까지 대조하여 중복 방지
        .maybeSingle();
  
      if (error) {
        Swal.fire({ icon: 'error', text: '조회 중 오류가 발생했습니다.' });
      } else if (data) {
        Swal.fire({
          icon: 'success',
          title: '아이디 찾기 결과',
          html: `가입하신 이메일은 <br><b>[ ${data.email} ]</b><br> 입니다.`,
          confirmButtonColor: "#007bff",
        });
      } else {
        Swal.fire({ 
          icon: 'warning', 
          text: '일치하는 정보가 없습니다. 이름과 닉네임을 다시 확인해주세요.' 
        });
      }
    }
  };

  const handleResetPassword = async () => {
    const { value: resetEmail } = await Swal.fire({
      title: '비밀번호 재설정',
      input: 'email',
      inputPlaceholder: 'example@email.com',
      showCancelButton: true,
      confirmButtonText: '메일 발송',
      // 🌟 엔터키 기능만 쏙 넣기
      didOpen: () => {
        Swal.getInput().addEventListener('keydown', (e) => {
          if (e.key === 'Enter') Swal.clickConfirm();
        });
      }
    });
  
    if (resetEmail) {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${APP_BASE_URL}/update-password`,
      });
  
      if (error) {
        // 🌟 에러 메시지만 한글로 간단히 보여주기
        const msg = error.message.includes("Too many requests") 
                    ? "잠시 후 다시 시도해주세요." 
                    : "발송 실패 (이메일을 확인해주세요)";
        Swal.fire({ icon: 'error', text: msg });
      } else {
        Swal.fire({ icon: 'success', text: '재설정 메일을 보냈습니다!' });
      }
    }
  };


  // 구글 로그인 핸들러 추가
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${APP_BASE_URL}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
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
          redirectTo: `${APP_BASE_URL}/`,
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
      await signIn(email, password);
      // 실제 이동 경로는 App의 /login 라우트 가드가
      // userProfile/role을 보고 / 또는 /admin 으로 결정
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
        korMessage = "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
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

        {/* 아이디/비밀번호 찾기 링크 추가 */}
        <div className={styles.findCredentials}>
          <span onClick={handleFindEmail} className={styles.link}>아이디 찾기</span>
          <span className={styles.divider}>|</span>
          <span onClick={handleResetPassword} className={styles.link}>비밀번호 찾기</span>
        </div>

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

        <div className={styles.googleLoginContainer}>
          <button type="button" onClick={handleGoogleLogin} className={styles.googleLoginButton}>
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Google 계정으로 로그인
          </button>
        </div>
      </form>
      <p className={styles.registerLink}>
        계정이 없으신가요? <span onClick={() => navigate('/join')} className={styles.link}>회원가입</span>
      </p>
    </div>
  );
}

export default Login;