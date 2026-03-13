import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createRecords } from "../../services/record";
import { Calendar, MapPin, Activity, Mountain, Trophy, XCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import styles from './NewRecord.module.css';

function NewRecord() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get("date");

  // Common Info state
  const [commonInfo, setCommonInfo] = useState(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      date: dateFromQuery || today,
      location: "",
    };
  });

  // Challenges state
  const [challenges, setChallenges] = useState([
    { id: Date.now(), climb_type: "볼더링", difficulty: "흰색", success: false }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonInfo(prev => ({ ...prev, [name]: value }));
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
      navigate("/records");
    } catch (err) {
      setError("기록 저장에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const climbTypes = ["볼더링", "리드", "탑로프"];
  const difficulties = [
    { id: "white", label: "흰색", color: "#FFFFFF" },
    { id: "orange", label: "주황", color: "#ff8c00" },
    { id: "yellow", label: "노랑", color: "#ffd700" },
    { id: "green", label: "초록", color: "#32cd32" },
    { id: "blue", label: "파랑", color: "#1e90ff" },
    { id: "navy", label: "남색", color: "#04203aff" },
    { id: "red", label: "빨강", color: "#ff0000" },
    { id: "purple", label: "보라", color: "#8a2be2" },
    { id: "gray", label: "회색", color: "#808080" },
    { id: "brown", label: "갈색", color: "#8b4513" },
    { id: "black", label: "검정색", color: "#000000" },
    { id: "pink", label: "핑크색", color: "#eb0cc5ff" }
  ];

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
            <input
              type="date"
              id="date"
              name="date"
              className={styles.input}
              value={commonInfo.date}
              onChange={handleCommonChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <MapPin size={18} className={styles.icon} />
              <label htmlFor="location">암장 이름</label>
            </div>
            <input
              type="text"
              id="location"
              name="location"
              className={styles.input}
              placeholder="예: 서울숲 클라이밍 뚝섬점"
              value={commonInfo.location}
              onChange={handleCommonChange}
              required
              maxLength={50}
            />
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
                          color: (diff.id === 'white' || diff.id === 'yellow') ? '#000' : '#fff'
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
