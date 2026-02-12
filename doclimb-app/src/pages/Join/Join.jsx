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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const emailRef = useRef(null);
  const nicknameRef = useRef(null);

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

  // 이메일 중복 확인
  const checkEmailDuplicate = async () => {
    if (!email) {
      emailRef.current.focus(); // 입력값이 없으면 포커스
      return Swal.fire('이메일을 입력해주세요.');
    }

    const { data } = await supabase.from('profiles').select('email').eq('email', email).maybeSingle();

    if (data) {
      Swal.fire({ icon: 'error', text: '이미 가입된 이메일입니다.' });
      setIsEmailChecked(false);
      emailRef.current.focus(); // 중복이면 다시 포커스
    } else {
      Swal.fire({ icon: 'success', text: '사용 가능한 이메일입니다.' });
      setIsEmailChecked(true);
    }
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

    // 1. 비밀번호 길이 체크 (예: 8자 이상)
    if (password.length < 8) {
      return Swal.fire({
        icon: 'warning',
        text: '비밀번호는 최소 8자 이상이어야 합니다.',
      });
    }

    // 2. 비밀번호 복잡도 체크 (영문 + 숫자 조합 예시)
    const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegEx.test(password)) {
      return Swal.fire({
        icon: 'warning',
        text: '비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.',
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
          <label htmlFor="email" className={styles.label}>이메일 <span className={styles.requiredIndicator}>*</span></label>
          <div className={styles.inputWithBtn}>
            <input type="email" value={email} ref={emailRef} onChange={(e) => { setEmail(e.target.value); setIsEmailChecked(false); }} required className={styles.input} />
            <button type="button" onClick={checkEmailDuplicate} className={styles.checkBtn}>중복확인</button>
          </div>
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
          <p className={styles.hintText}>* 8자 이상 영문, 숫자 조합으로 입력해주세요.</p>
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
            <button type="button" onClick={checkNicknameDuplicate} className={styles.checkBtn}>중복확인</button>
          </div>
        </div>

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
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
}

export default Join;