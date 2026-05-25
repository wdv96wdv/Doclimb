import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, uploadAvatar } from '../../services/profile';
import { getAllGyms } from '../../services/gym';
import { getUserBadges } from '../../services/gamification';
import { deleteUserAccount } from '../../services/auth';
import { Footprints, Trophy, Map, Flame, Medal, Award, Trash2 } from 'lucide-react';
import Loading from '../../components/Common/Loading';
import styles from './MyPage.module.css';
import Swal from 'sweetalert2';
import defaultAvatar from '../../assets/img/No_Image_Available.jpg';

function MyPage() {
  const { user, signOut, updatePassword } = useAuth();
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
  const [gyms, setGyms] = useState([]);
  const [gymLoading, setGymLoading] = useState(false);
  const [isCustomGym, setIsCustomGym] = useState(false);
  const [avatar_url, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [email, setEmail] = useState('');
  const [badges, setBadges] = useState([]);

  // 비밀번호 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 정규식 설정 (Join.js와 동일)
  const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/;

  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    pattern: false,
    match: false,
  });
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);

  // 실시간 비밀번호 유효성 검사
  useEffect(() => {
    if (password || confirmPassword) {
      setIsPasswordDirty(true);
    }
    setPasswordErrors({
      length: password.length >= 8,
      pattern: passwordRegEx.test(password),
      match: password === confirmPassword && confirmPassword !== '',
    });
  }, [password, confirmPassword]);

  // 프로필 로드
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setGymLoading(true);

      // Fetch gym list
      const gymData = await getAllGyms();
      setGyms(gymData || []);

      // Fetch profile
      const profile = await getProfile(user.id);
      setName(profile.name || '');
      setDisplayNickname(profile.display_nickname || '');
      setClimbingLevel(profile.climbing_level || '');
      setPreferredGym(profile.preferred_gym || '');
      setClimbingStyle(profile.climbing_style || []);
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar_url);

      // Check if preferred gym is in the list
      const gymExists = gymData?.some(g => g.name === profile.preferred_gym);
      if (!gymExists && profile.preferred_gym) {
        setIsCustomGym(true);
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      Swal.fire({ 
        icon: 'error', 
        title: '실패', 
        text: '데이터를 불러오는 중 오류가 발생했습니다.',
        background: '#1a1d29',
        color: '#fff'
      });
    } finally {
      setLoading(false);
      setGymLoading(false);
    }
  }, [user.id]);

  const loadBadges = useCallback(async () => {
    try {
      const data = await getUserBadges(user.id);
      setBadges(data || []);
    } catch (err) {
      console.error('뱃지 로드 오류:', err);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBadges();
    }
  }, [user, loadProfile, loadBadges]);

  const getBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'Footprints': return <Footprints size={24} />;
      case 'Trophy': return <Trophy size={24} />;
      case 'Map': return <Map size={24} />;
      case 'Flame': return <Flame size={24} />;
      default: return <Award size={24} />;
    }
  };

  // --- 핸들러 함수들 ---

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
    setDisplayNickname(filteredValue);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z가-힣]/g, '');
    setName(filteredValue);
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (passwordErrors.pattern && passwordErrors.match) handlePasswordChange();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleClimbingStyleChange = (e) => {
    const { value, checked } = e.target;
    setClimbingStyle((prev) => checked ? [...prev, value] : prev.filter((s) => s !== value));
  };

  const handleGymChange = (e) => {
    const { value } = e.target;
    if (value === 'custom') {
      setIsCustomGym(true);
      setPreferredGym('');
    } else {
      setIsCustomGym(false);
      setPreferredGym(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !displayNickname.trim()) {
      return Swal.fire({ 
        icon: 'warning', 
        text: '필수 정보를 입력해주세요.',
        background: '#1a1d29',
        color: '#fff'
      });
    }

    setSaving(true);
    try {
      let newAvatarUrl = avatar_url;
      if (avatarFile) newAvatarUrl = await uploadAvatar(avatarFile, user.id);
      
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
        title: '수정 완료',
        background: '#1a1d29',
        color: '#fff',
        confirmButtonColor: '#5271ff'
      });
      navigate('/');
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: '수정 실패',
        background: '#1a1d29',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordErrors.pattern || !passwordErrors.match) return;
    
    setPasswordSaving(true);
    try {
      await updatePassword(password);

      await Swal.fire({ 
        icon: 'success', 
        title: '비밀번호 변경 완료', 
        text: '보안을 위해 다시 로그인해주세요.',
        background: '#1a1d29',
        color: '#fff',
        confirmButtonColor: '#5271ff'
      });
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      Swal.fire({ icon: 'error', title: '실패', text: err.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '정말 탈퇴하시겠습니까?',
      text: "모든 데이터가 삭제되며 복구할 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#5271ff',
      confirmButtonText: '탈퇴하기',
      background: '#1a1d29',
      color: '#fff'
    });

    if (isConfirmed) {
      try {
        setLoading(true);
        await deleteUserAccount();
        await signOut();
        await Swal.fire({ icon: 'success', title: '탈퇴 완료' });
        navigate('/');
      } catch (err) {
        Swal.fire({ icon: 'error', title: '탈퇴 실패' });
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

  if (loading) {
    return <Loading message="프로필을 불러오고 있습니다..." />;
  }

  return (
    <div className={styles.myPageContainer}>
      <h1 className={styles.title}>마이페이지</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.sectionTitle}>프로필 사진</div>
        <div className={styles.avatarSection}>
          <img 
            src={avatarPreview || avatar_url || defaultAvatar} 
            alt="Avatar" 
            className={styles.avatarPreview} 
          />
          <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} className={styles.avatarInput} />
          <div className={styles.avatarButtons}>
            <label htmlFor="avatar" className={styles.avatarLabel}>사진 변경</label>
            {(avatarPreview || avatar_url) && (
              <button type="button" onClick={handleDeleteAvatar} className={styles.avatarDeleteBtn} title="사진 삭제">
                <Trash2 size={18} /> 삭제
              </button>
            )}
          </div>
        </div>

        <div className={styles.sectionTitle}>나의 뱃지 컬렉션</div>
        <div className={styles.badgeGrid}>
          {badges.length > 0 ? (
            badges.map((item) => (
              <div key={item.badges.id} className={styles.badgeItem}>
                <div className={styles.badgeIconWrapper}>
                  {getBadgeIcon(item.badges.icon_type)}
                </div>
                <div className={styles.badgeInfo}>
                  <p className={styles.badgeName}>{item.badges.name}</p>
                  <p className={styles.badgeDesc}>{item.badges.description}</p>
                  <span className={styles.earnedAt}>{new Date(item.earned_at).toLocaleDateString()} 획득</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noBadge}>아직 획득한 뱃지가 없습니다. 등반을 기록해보세요!</p>
          )}
        </div>

        <div className={styles.sectionTitle}>계정 정보</div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이메일</label>
          <input type="email" value={email} disabled className={`${styles.input} ${styles.disabled}`} />
        </div>

        <div className={styles.sectionTitle}>비밀번호 변경</div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>새 비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            className={`${styles.input} ${isPasswordDirty && !passwordErrors.pattern ? styles.inputError : ''}`}
            placeholder="영문+숫자+특수문자 조합 (8자 이상)"
            maxLength={20}
          />
          {isPasswordDirty && (
            <div className={styles.validationWrapper}>
              <p className={passwordErrors.length ? styles.validText : styles.invalidText}>
                {passwordErrors.length ? '✓ 8자리 이상' : '✗ 8자리 이상 필요'}
              </p>
              <p className={passwordErrors.pattern ? styles.validText : styles.invalidText}>
                {passwordErrors.pattern ? '✓ 복잡도 충족' : '✗ 영문, 숫자, 특수문자 조합 필요'}
              </p>
            </div>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>새 비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            className={`${styles.input} ${isPasswordDirty && !passwordErrors.match ? styles.inputError : ''}`}
            maxLength={20}
          />
          {isPasswordDirty && (
            <p className={passwordErrors.match ? styles.validText : styles.invalidText}>
              {passwordErrors.match ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePasswordChange}
          disabled={passwordSaving || !passwordErrors.pattern || !passwordErrors.match}
          className={styles.passwordButton}
        >
          {passwordSaving ? '변경 중...' : '비밀번호 변경 적용'}
        </button>

        <hr className={styles.divider} />

        <div className={styles.sectionTitle}>프로필 정보</div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이름 <span className={styles.requiredIndicator}>*</span></label>
          <input type="text" value={name} onChange={handleNameChange} required className={styles.input} maxLength={10} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>닉네임 <span className={styles.requiredIndicator}>*</span></label>
          <input type="text" value={displayNickname} onChange={handleNicknameChange} required className={styles.input} maxLength={12} />
          <p className={styles.hintText}>한글, 영문, 숫자 조합 (최대 12자)</p>
        </div>

        <div className={styles.sectionTitle}>선택 정보</div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>클라이밍 레벨</label>
          <select value={climbingLevel} onChange={(e) => setClimbingLevel(e.target.value)} className={styles.input}>
            {CLIMBING_LEVEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>주로 가는 암장</label>
          {gymLoading ? (
            <div className={styles.loadingText}>암장 목록을 불러오는 중...</div>
          ) : (
            <select 
              value={isCustomGym ? 'custom' : preferredGym} 
              onChange={handleGymChange} 
              className={styles.input}
            >
              <option value="">암장을 선택해주세요</option>
              {gyms.map(gym => (
                <option key={gym.id} value={gym.name}>
                  {gym.name}
                </option>
              ))}
              <option value="custom">직접 입력</option>
            </select>
          )}
          
          {isCustomGym && (
            <input 
              type="text" 
              value={preferredGym} 
              onChange={(e) => setPreferredGym(e.target.value)} 
              className={styles.input} 
              style={{ marginTop: '10px' }}
              placeholder="암장 이름을 직접 입력해주세요"
              maxLength={50} 
            />
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>클라이밍 스타일</label>
          <div className={styles.checkboxGroup}>
            {['BOULDER', 'LEAD', 'TOPROPE'].map(style => (
              <label key={style} className={styles.checkboxLabel}>
                <input type="checkbox" value={style} checked={climbingStyle.includes(style)} onChange={handleClimbingStyleChange} /> {style}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className={styles.submitButton}>
          {saving ? '저장 중...' : '프로필 정보 저장'}
        </button>
      </form>

      <div className={styles.dangerZone}>
        <button type="button" onClick={handleDeleteAccount} className={styles.deleteButton}>회원 탈퇴</button>
      </div>
    </div>
  );
}

export default MyPage;