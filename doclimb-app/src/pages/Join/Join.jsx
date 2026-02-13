import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import styles from './Join.module.css';
import Swal from 'sweetalert2';

// 컴포넌트 외부에서 옵션 상수 정의 (중요!)
const CLIMBING_LEVEL_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'BEGINNER', label: 'BEGINNER' },
  { value: 'INTERMEDIATE', label: 'INTERMEDIATE' },
  { value: 'ADVANCED', label: 'ADVANCED' },
];

const CLIMBING_STYLE_OPTIONS = [
  { value: 'BOULDER', label: 'BOULDER' },
  { value: 'LEAD', label: 'LEAD' },
  { value: 'TOPROPE', label: 'TOPROPE' },
];

function Join() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const emailRef = useRef(null);
  const nicknameRef = useRef(null);
  const [isAgreed, setIsAgreed] = useState(false);

  // 상태 변수들
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [climbingLevel, setClimbingLevel] = useState('');
  const [preferredGym, setPreferredGym] = useState('');
  const [climbingStyle, setClimbingStyle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // error 상태 추가

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const getFullEmail = () => `${emailId}@${emailDomain}`;

  const EMAIL_DOMAINS = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'kakao.com',
    'outlook.com',
  ];

  const canSubmit =
    isAgreed &&
    isEmailChecked &&
    isNicknameChecked &&
    password &&
    confirmPassword &&
    password === confirmPassword;
  // 이메일 정규식 (최소 유효성)
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // 임시 이메일 도메인 차단 목록
  const BLOCKED_EMAIL_DOMAINS = [
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'dispostable.com',
    'yopmail.com',
  ];

  // 이메일 중복 확인
  const checkEmailDuplicate = async () => {
    const email = getFullEmail();

    if (!emailId) {
      return Swal.fire('이메일 아이디를 입력해주세요.');
    }

    if (!EMAIL_REGEX.test(email)) {
      return Swal.fire({
        icon: 'error',
        text: '올바른 이메일 형식이 아닙니다.',
      });
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return Swal.fire({
        icon: 'error',
        text: '임시 이메일은 사용할 수 없습니다.',
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return Swal.fire({
        icon: 'error',
        text: '이메일 확인 중 오류가 발생했습니다.',
      });
    }

    if (data) {
      setIsEmailChecked(false);
      return Swal.fire({ icon: 'error', text: '이미 가입된 이메일입니다.' });
    }

    setIsEmailChecked(true);
    Swal.fire({ icon: 'success', text: '사용 가능한 이메일입니다.' });
  };


  // 닉네임 중복 확인
  const checkNicknameDuplicate = async () => {
    if (!displayNickname) {
      nicknameRef.current.focus(); // 입력값이 없으면 포커스
      return Swal.fire('닉네임을 입력해주세요.');
    }

    const { data } = await supabase.from('profiles').select('display_nickname').eq('display_nickname', displayNickname).maybeSingle();

    if (data) {
      Swal.fire({ icon: 'error', text: '이미 사용 중인 닉네임입니다.' });
      setIsNicknameChecked(false);
      nicknameRef.current.focus(); // 중복이면 다시 포커스
    } else {
      Swal.fire({ icon: 'success', text: '사용 가능한 닉네임입니다.' });
      setIsNicknameChecked(true);
    }
  };

  const handleClimbingStyleChange = (e) => {
    const { value, checked } = e.target;
    setClimbingStyle((prev) => checked ? [...prev, value] : prev.filter((s) => s !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // 에러 초기화

    const email = getFullEmail();

    // 이메일 형식 재검증
    if (!EMAIL_REGEX.test(email)) {
      return Swal.fire({
        icon: 'error',
        text: '올바른 이메일 형식이 아닙니다.',
      });
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return Swal.fire({
        icon: 'error',
        text: '임시 이메일은 사용할 수 없습니다.',
      });
    }

    // 2. 동의 체크박스 확인 로직 추가 (가장 먼저 확인)
    if (!isAgreed) {
      return Swal.fire({
        icon: 'warning',
        text: '개인정보 수집 및 이용에 동의해주세요.',
      });
    }

    // 1. 비밀번호 길이 체크 (예: 8자 이상)
    if (password.length < 8) {
      return Swal.fire({
        icon: 'warning',
        text: '비밀번호는 최소 8자 이상이어야 합니다.',
      });
    }

    // 2. 비밀번호 복잡도 체크 (영문 + 숫자 + 특수문자 조합 예시)
    const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/;

    if (!passwordRegEx.test(password)) {
      return Swal.fire({
        icon: 'warning',
        text: '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.'

      });
    }

    // 3. 기존 비밀번호 일치 체크
    if (password !== confirmPassword) {
      return Swal.fire({ icon: 'error', text: '비밀번호가 일치하지 않습니다.' });
    }

    if (!isEmailChecked) return Swal.fire({ icon: 'warning', text: '이메일 중복 확인이 필요합니다.' });
    if (!isNicknameChecked) return Swal.fire({ icon: 'warning', text: '닉네임 중복 확인이 필요합니다.' });

    setLoading(true);
    try {
      await signUp(email, password, {
        name,
        nickname: displayNickname,
        display_nickname: displayNickname,
        climbing_level: climbingLevel,
        preferred_gym: preferredGym,
        climbing_style: climbingStyle,
      });

      Swal.fire({
        icon: 'success',
        title: '가입 신청 완료!',
        text: '메일함(스팸함 포함)을 확인하여 인증을 완료해주세요.',
      }).then(() => navigate('/login'));
    } catch (err) {
      let msg = "회원가입 중 오류가 발생했습니다.";

      if (err.message.includes("Database error saving new user")) {
        msg = "필수 정보(닉네임 등) 저장 중 오류가 발생했습니다. DB 설정을 확인해주세요.";
      } else if (err.message.includes("User already registered")) {
        msg = "이미 등록된 이메일입니다.";
      }

      Swal.fire({ icon: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.joinContainer}>
      <h1 className={styles.title}>회원가입</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.sectionTitle}>필수 정보</div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            이메일 <span className={styles.requiredIndicator}>*</span>
          </label>

          <div className={styles.emailBox}>
            <input
              type="text"
              value={emailId}
              onChange={(e) => {
                setEmailId(e.target.value);
                setIsEmailChecked(false);
              }}
              placeholder="이메일 아이디"
              className={styles.emailInput}
            />

            <span className={styles.at}>@</span>

            <select
              value={emailDomain}
              onChange={(e) => {
                setEmailDomain(e.target.value);
                setIsEmailChecked(false);
              }}
              className={styles.emailSelect}
            >
              {EMAIL_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={checkEmailDuplicate}
              className={styles.emailCheckBtn}
            >
              중복확인
            </button>
          </div>

          {/* 상태 텍스트 */}
          {emailId && (
            <p
              className={
                isEmailChecked ? styles.successText : styles.hintText
              }
            >
              {isEmailChecked
                ? `✔ ${getFullEmail()} 사용 가능`
                : '이메일 중복 확인이 필요합니다'}
            </p>
          )}
        </div>


        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>비밀번호 <span className={styles.requiredIndicator}>*</span></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상, 영문+숫자 조합"
            required
            className={styles.input}
          />

          <ul className={styles.passwordChecklist}>
            <li className={password.length >= 8 ? styles.ok : styles.no}>
              8자 이상
            </li>
            <li className={/[A-Za-z]/.test(password) ? styles.ok : styles.no}>
              영문 포함
            </li>
            <li className={/\d/.test(password) ? styles.ok : styles.no}>
              숫자 포함
            </li>
            <li className={/[!@#$%^&*()_+=-]/.test(password) ? styles.ok : styles.no}>
              특수문자 포함
            </li>
          </ul>

        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>비밀번호 확인 <span className={styles.requiredIndicator}>*</span></label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={styles.input} />
          {password && confirmPassword && (
            <p className={password === confirmPassword ? styles.successText : styles.errorText}>
              {password === confirmPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>이름 <span className={styles.requiredIndicator}>*</span></label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="displayNickname" className={styles.label}>닉네임 <span className={styles.requiredIndicator}>*</span></label>
          <div className={styles.inputWithBtn}>
            <input type="text" value={displayNickname} ref={nicknameRef} onChange={(e) => { setDisplayNickname(e.target.value); setIsNicknameChecked(false); }} required className={styles.input} />
            <button type="button" onClick={checkNicknameDuplicate} className={styles.emailCheckBtn}>중복확인</button>
          </div>
        </div>

        {displayNickname && (
          <p
            className={
              isNicknameChecked
                ? styles.successText
                : styles.hintText
            }
          >
            {isNicknameChecked
              ? '✔ 사용 가능한 닉네임입니다'
              : '닉네임 중복 확인이 필요합니다'}
          </p>
        )}


        <div className={styles.sectionTitle}>선택 정보</div>

        <div className={styles.inputGroup}>
          <label htmlFor="climbingLevel" className={styles.label}>클라이밍 레벨</label>
          <select id="climbingLevel" value={climbingLevel} onChange={(e) => setClimbingLevel(e.target.value)} className={styles.input}>
            {CLIMBING_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="preferredGym" className={styles.label}>주로 가는 암장</label>
          <input type="text" id="preferredGym" value={preferredGym} onChange={(e) => setPreferredGym(e.target.value)} className={styles.input} maxLength={50} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>클라이밍 스타일</label>
          <div className={styles.checkboxGroup}>
            {CLIMBING_STYLE_OPTIONS.map((option) => (
              <label key={option.value} className={styles.checkboxLabel}>
                <input type="checkbox" value={option.value} checked={climbingStyle.includes(option.value)} onChange={handleClimbingStyleChange} className={styles.checkbox} />
                {option.label}
              </label>
            ))}
          </div>
          <div className={styles.sectionTitle}>약관 동의</div>
          <div className={styles.agreementGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className={styles.checkbox}
              />
              <span>개인정보 수집 및 이용 동의 (필수)</span>
            </label>
            <button
              type="button"
              className={styles.policyBtn}
              onClick={() => window.open('https://climbing-frame-cc5.notion.site/3050f03e6dcc807586dbfb95ccaf7332', '_blank')}
            >
              약관 상세보기
            </button>
          </div>

        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={`${styles.button} ${!canSubmit ? styles.disabled : ''}`}
        >

          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
}

export default Join;