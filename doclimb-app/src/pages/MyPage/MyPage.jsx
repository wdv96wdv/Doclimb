import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, uploadAvatar } from '../../services/profile';
import { supabase } from '../../services/supabase';
import styles from './MyPage.module.css';
import Swal from 'sweetalert2';

function MyPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 프로필 정보 상태
  const [name, setName] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const [climbingLevel, setClimbingLevel] = useState('');
  const [preferredGym, setPreferredGym] = useState('');
  const [climbingStyle, setClimbingStyle] = useState([]);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // 비밀번호 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // 읽기 전용 정보
  const [email, setEmail] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await getProfile(user.id);

      setName(profile.name || '');
      setDisplayNickname(profile.display_nickname || '');
      setClimbingLevel(profile.climbing_level || '');
      setPreferredGym(profile.preferred_gym || '');
      setClimbingStyle(profile.climbing_style || []);
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url);
    } catch (err) {
      console.error('프로필 로드 오류:', err);
      Swal.fire({
        icon: 'error',
        title: '프로필 로드 실패!',
        text: '프로필을 불러오는데 실패했습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  }, [user.id]); // user.id is the dependency for loadProfile

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleClimbingStyleChange = (e) => {
    const { value, checked } = e.target;
    setClimbingStyle((prev) =>
      checked ? [...prev, value] : prev.filter((style) => style !== value)
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let newAvatarUrl = avatar_url;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      console.log('User ID for update:', user.id); // Debugging

      if (!name.trim()) {
        Swal.fire({
          icon: 'error',
          title: '유효성 검사 실패!',
          text: '이름은 비워둘 수 없습니다.',
          confirmButtonText: '확인',
          confirmButtonColor: '#d33'
        });
        setSaving(false);
        return;
      }

      if (!displayNickname.trim()) {
        Swal.fire({
          icon: 'error',
          title: '유효성 검사 실패!',
          text: '닉네임은 비워둘 수 없습니다.',
          confirmButtonText: '확인',
          confirmButtonColor: '#d33'
        });
        setSaving(false);
        return;
      }

      await updateProfile(user.id, {
        name,
        display_nickname: displayNickname,
        climbing_level: climbingLevel || null,
        preferred_gym: preferredGym || null,
        climbing_style: climbingStyle,
        avatar_url: newAvatarUrl,
      });

      Swal.fire({
        icon: 'success',
        title: '수정 완료!',
        text: '프로필이 성공적으로 수정되었습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#3085d6'
      });
      // 홈화면으로 이독
      navigate('/');
    } catch (err) {
      console.error('프로필 수정 오류:', err);
      Swal.fire({
        icon: 'error',
        title: '프로필 수정 실패!',
        text: err.message || '프로필 수정 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '오류!',
        text: '비밀번호가 일치하지 않습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#d33'
      });
      return;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: '오류!',
        text: '비밀번호는 6자리 이상이어야 합니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setPasswordSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      // 2. 알림 표시 (사용자가 확인을 누를 때까지 대기)
      await Swal.fire({
        icon: 'success',
        title: '비밀번호 변경 완료!',
        text: '보안을 위해 다시 로그인해주세요.',
        confirmButtonText: '확인',
        confirmButtonColor: '#3085d6'
      });

      // 3. ✅ 핵심 수정: 모든 세션 로그아웃 및 로컬 데이터 삭제
      // AuthContext의 signOut이 내부적으로 supabase.auth.signOut()을 호출한다면 
      // 아래와 같이 직접 호출하여 확실하게 처리할 수 있습니다.
      await supabase.auth.signOut({ scope: 'global' });

      // 4. 로그인 페이지로 이동 및 뒤로가기 방지
      navigate('/login', { replace: true });

    } catch (err) {
      console.error('비밀번호 변경 오류:', err);
      Swal.fire({
        icon: 'error',
        title: '비밀번호 변경 실패!',
        text: err.message || '비밀번호 변경 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  // 회원 탈퇴 핸들러 추가
  const handleDeleteAccount = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '정말 탈퇴하시겠습니까?',
      text: "그동안의 클라이밍 기록과 프로필 정보가 모두 삭제되며, 이 작업은 되돌릴 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '탈퇴하기',
      cancelButtonText: '취소',
    });

    if (isConfirmed) {
      try {
        setLoading(true); // 로딩 표시

        // 1. Supabase SQL 함수 호출 (사용자 계정 삭제)
        const { error: deleteError } = await supabase.rpc('delete_user_account');

        if (deleteError) throw deleteError;

        // 2. 로그아웃 및 홈으로 이동
        await signOut();
        await Swal.fire({
          icon: 'success',
          title: '탈퇴 완료',
          text: '그동안 DoClimb을 이용해주셔서 감사합니다.',
          confirmButtonColor: '#3085d6',
        });
        navigate('/');
      } catch (err) {
        console.error('탈퇴 오류:', err);
        Swal.fire({
          icon: 'error',
          title: '탈퇴 실패',
          text: '계정 삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
      } finally {
        setLoading(false);
      }
    }
  };



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

  if (loading) {
    return (
      <div className={styles.myPageContainer}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.myPageContainer}>
      <h1 className={styles.title}>마이페이지</h1>

      {/* 프로필 수정 폼 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.sectionTitle}>프로필 사진</div>
        <div className={styles.avatarSection}>
          <img
            src={avatarPreview || avatar_url || '/climbing_placeholder.jpg'}
            alt="Avatar"
            className={styles.avatarPreview}
          />
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className={styles.avatarInput}
          />
          <label htmlFor="avatar" className={styles.avatarLabel}>
            사진 선택
          </label>
        </div>
        <div className={styles.sectionTitle}>계정 정보</div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>이메일</label>
          <input
            type="email"
            value={email}
            disabled
            className={`${styles.input} ${styles.disabled}`}
          />
          <p className={styles.helpText}>이메일은 변경할 수 없습니다.</p>
        </div>

        <div className={styles.sectionTitle}>비밀번호 변경</div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>새 비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="6자리 이상 입력하세요"
            maxLength={20}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            maxLength={20}
          />
          {passwordMessage && (
            <p className={password === confirmPassword ? styles.validationSuccess : styles.validationError}>
              {passwordMessage}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePasswordChange}
          disabled={passwordSaving}
          className={styles.button}
        >
          {passwordSaving ? '변경 중...' : '비밀번호 변경'}
        </button>

        <div className={styles.sectionTitle}>프로필 정보</div>

        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            이름 <span className={styles.requiredIndicator}>*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
            maxLength={20}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="displayNickname" className={styles.label}>
            닉네임 <span className={styles.requiredIndicator}>*</span>
          </label>
          <input
            type="text"
            id="displayNickname"
            value={displayNickname}
            onChange={(e) => setDisplayNickname(e.target.value)}
            required
            className={styles.input}
            maxLength={20}
          />
        </div>
        <div className={styles.sectionTitle}>선택 정보</div>

        <div className={styles.inputGroup}>
          <label htmlFor="climbingLevel" className={styles.label}>클라이밍 레벨</label>
          <select
            id="climbingLevel"
            value={climbingLevel}
            onChange={(e) => setClimbingLevel(e.target.value)}
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
          <label htmlFor="preferredGym" className={styles.label}>주로 가는 암장</label>
          <input
            type="text"
            id="preferredGym"
            value={preferredGym}
            onChange={(e) => setPreferredGym(e.target.value)}
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
                  onChange={handleClimbingStyleChange}
                  className={styles.checkbox}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className={styles.button}>
          {saving ? '저장 중...' : '프로필 저장'}
        </button>
      </form>

      <div className={styles.dangerZone}>
        <div className={styles.sectionTitle}>계정 관리</div>
        <p className={styles.dangerText}>계정을 삭제하면 모든 데이터가 즉시 파기됩니다.</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className={styles.deleteButton}
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
export default MyPage;