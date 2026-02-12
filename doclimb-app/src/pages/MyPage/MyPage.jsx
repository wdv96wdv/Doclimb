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

      await Swal.fire({
        icon: 'success',
        title: '비밀번호 변경 완료!',
        text: '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.',
        confirmButtonText: '확인',
        confirmButtonColor: '#3085d6'
      });
      
      await signOut();
      navigate('/login');

    } catch (err) {
      console.error('비밀번호 변경 오류:', err);
      Swal.fire({
        icon: 'error',
        title: '비밀번호 변경 실패!',
        text: err.message || '비밀번호 변경 중 오류가 발생했습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#d33'
      });
    } finally {
      setPasswordSaving(false);
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
    </div>
  );
}

export default MyPage;