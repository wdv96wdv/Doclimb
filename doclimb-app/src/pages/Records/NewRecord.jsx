import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createRecords } from "../../services/record";
import { useAuth } from "../../context/AuthContext";
import { checkAndAwardBadges } from "../../services/gamification";
import { Calendar, MapPin, Activity, Mountain, Trophy, XCircle, CheckCircle2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import styles from './NewRecord.module.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

import { getAllGyms } from "../../services/gym";
import { difficultyColors, getContrastColor } from "../../utils/climbingUtils";

function NewRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get("date");

  // Common Info state
  const [commonInfo, setCommonInfo] = useState(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      date: dateFromQuery || today,
      location: "",
      is_public: false,
    };
  });

  // Challenges state
  const [challenges, setChallenges] = useState([
    { id: Date.now(), climb_type: "볼더링", difficulty: "흰색", success: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gyms, setGyms] = useState([]);
  const [gymLoading, setGymLoading] = useState(true);
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  // Fetch gyms on mount
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        const data = await getAllGyms();
        setGyms(data || []);
      } catch (err) {
        console.error("암장 목록 로드 실패:", err);
      } finally {
        setGymLoading(false);
      }
    };
    fetchGymData();
  }, []);

  const handleCommonChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "gymSelector") {
      if (value === "custom") {
        setIsCustomLocation(true);
        setCommonInfo(prev => ({ ...prev, location: "" }));
      } else {
        setIsCustomLocation(false);
        setCommonInfo(prev => ({ ...prev, location: value }));
      }
    } else {
      setCommonInfo(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleChallengeChange = (id, field, value) => {
    setChallenges(prev => prev.map(ch =>
      ch.id === id ? { ...ch, [field]: value } : ch
    ));
  };

  const addChallenge = () => {
    setChallenges(prev => [
      ...prev,
      { id: Date.now(), climb_type: "볼더링", difficulty: "흰색", success: false }
    ]);
  };

  const removeChallenge = (id) => {
    if (challenges.length === 1) return;
    setChallenges(prev => prev.filter(ch => ch.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commonInfo.date || !commonInfo.location) {
      setError("날짜와 클라이밍 장소를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const recordsToSave = challenges.map(({ climb_type, difficulty, success }) => ({
        ...commonInfo,
        climb_type,
        difficulty,
        success
      }));

      await createRecords(recordsToSave);

      // 뱃지 체크 로직 추가
      if (user) {
        const earned = await checkAndAwardBadges(user.id);
        if (earned && earned.length > 0) {
          // 다중 뱃지 획득 시 처리
          const badgeNames = earned.map(b => `[${b.name}]`).join(", ");
          await Swal.fire({
            title: '✨ 새로운 뱃지 획득!',
            html: `<div style="color: #eee; font-size: 0.9rem;">축하합니다! <b style="color: #5271ff">${badgeNames}</b> 뱃지를 획득하셨습니다. <br/> 마이페이지에서 확인해보세요!</div>`,
            icon: 'success',
            background: '#1a1d29',
            color: '#fff',
            confirmButtonColor: '#5271ff',
            confirmButtonText: '확인'
          });
        }
      }

      navigate("/records");
    } catch (err) {
      setError("기록 저장에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const climbTypes = ["볼더링", "리드", "탑로프"];
  const difficulties = Object.entries(difficultyColors).map(([label, color]) => ({
    id: label,
    label,
    color
  }));

  return (
    <div className={styles.pageOverlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>오늘의 클라이밍 기록</h2>
          <p>여러 개의 도전을 한 번에 기록할 수 있어요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Common Info Section */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Calendar size={18} className={styles.icon} />
              <label htmlFor="date">등반 날짜</label>
            </div>
            <DatePicker
              selected={commonInfo.date ? new Date(commonInfo.date) : null}
              onChange={(date) => {
                const formattedDate = date.toISOString().split('T')[0];
                setCommonInfo(prev => ({ ...prev, date: formattedDate }));
              }}
              dateFormat="yyyy-MM-dd"
              locale={ko}
              className={styles.input}
              placeholderText="날짜를 선택하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <MapPin size={18} className={styles.icon} />
              <label htmlFor="location">암장 선택</label>
            </div>
            {gymLoading ? (
              <div className={styles.loadingText}>암장 목록을 불러오는 중...</div>
            ) : (
              <select
                id="gymSelector"
                name="gymSelector"
                className={styles.select}
                value={isCustomLocation ? "custom" : commonInfo.location}
                onChange={handleCommonChange}
                required
              >
                <option value="">암장을 선택해주세요</option>
                {gyms.map(gym => (
                  <option key={gym.id} value={gym.name}>
                    {gym.name}
                  </option>
                ))}
                <option value="custom">직접 입력 (검색에 없는 경우)</option>
              </select>
            )}
            
            {isCustomLocation && (
              <input
                type="text"
                name="location"
                className={styles.input}
                style={{ marginTop: '10px' }}
                placeholder="암장 이름을 직접 입력해주세요"
                value={commonInfo.location}
                onChange={handleCommonChange}
                required
              />
            )}
          </div>

          <div className={styles.formGroup}>
            <div className={styles.publicToggleWrapper} onClick={() => setCommonInfo(prev => ({ ...prev, is_public: !prev.is_public }))}>
              <div className={styles.labelWrapper}>
                {commonInfo.is_public ? <Eye size={18} className={styles.icon} /> : <EyeOff size={18} className={styles.iconMuted} />}
                <label>명예의 전당 공개</label>
              </div>
              <div className={`${styles.toggleSwitch} ${commonInfo.is_public ? styles.active : ''}`}>
                <div className={styles.toggleHandle}></div>
              </div>
            </div>
            <p className={styles.helperText}>
              {commonInfo.is_public 
                ? "이 기록은 명예의 전당(랭킹)에 집계되어 다른 사용자에게 공개됩니다." 
                : "이 기록은 본인만 볼 수 있으며 랭킹에 집계되지 않습니다."}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }} />

          <h3 className={styles.challengesTitle}>도전 내용</h3>

          {/* Challenges List */}
          <div className={styles.challengeList}>
            {challenges.map((ch, index) => (
              <div key={ch.id} className={styles.challengeItem}>
                <div className={styles.challengeHeader}>
                  <span className={styles.challengeNumber}>Challenge #{index + 1}</span>
                  {challenges.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeChallenge(ch.id)}
                    >
                      <Trash2 size={14} style={{ marginRight: '4px' }} /> 삭제
                    </button>
                  )}
                </div>

                {/* Climb Type */}
                <div className={styles.formGroup}>
                  <div className={styles.labelWrapper}>
                    <Activity size={18} className={styles.icon} />
                    <label>종류</label>
                  </div>
                  <div className={styles.pillGroup}>
                    {climbTypes.map(type => (
                      <button
                        type="button"
                        key={type}
                        className={`${styles.pillBtn} ${ch.climb_type === type ? styles.active : ''}`}
                        onClick={() => handleChallengeChange(ch.id, 'climb_type', type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className={styles.formGroup}>
                  <div className={styles.labelWrapper}>
                    <Mountain size={18} className={styles.icon} />
                    <label>난이도</label>
                  </div>
                  <div className={styles.diffGrid}>
                    {difficulties.map((diff) => (
                      <button
                        type="button"
                        key={diff.id}
                        className={`${styles.diffBtn} ${ch.difficulty === diff.label ? styles.active : ''}`}
                        onClick={() => handleChallengeChange(ch.id, 'difficulty', diff.label)}
                        style={{
                          '--btn-color': diff.color,
                          color: getContrastColor(diff.label)
                        }}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div className={styles.formGroup}>
                  <div className={styles.labelWrapper}>
                    <Trophy size={18} className={styles.icon} />
                    <label>결과</label>
                  </div>
                  <div className={styles.successGroup}>
                    <button
                      type="button"
                      className={`${styles.successBtn} ${styles.isSuccess} ${ch.success ? styles.active : ''}`}
                      onClick={() => handleChallengeChange(ch.id, 'success', true)}
                    >
                      <CheckCircle2 size={20} /> 성공
                    </button>
                    <button
                      type="button"
                      className={`${styles.successBtn} ${styles.isFail} ${!ch.success ? styles.active : ''}`}
                      onClick={() => handleChallengeChange(ch.id, 'success', false)}
                    >
                      <XCircle size={20} /> 실패
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className={styles.addChallengeBtn} onClick={addChallenge}>
            <Plus size={20} /> 다른 도전 추가하기
          </button>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "저장 중..." : `${challenges.length}개의 기록 완료하기`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRecord;
