import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createRecord } from "../../services/record";
import { Calendar, MapPin, Activity, Mountain, Trophy, XCircle, CheckCircle2 } from "lucide-react";
import styles from './NewRecord.module.css';

function NewRecord() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const dateFromQuery = queryParams.get("date");

  const [form, setForm] = useState(() => {
    if (dateFromQuery) {
      return {
        date: dateFromQuery,
        location: "",
        climb_type: "볼더링",
        difficulty: "흰색",
        success: false,
      };
    }

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      date: today,
      location: "",
      climb_type: "볼더링",
      difficulty: "흰색",
      success: false,
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.location) {
      setError("날짜와 클라이밍 장소를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createRecord(form);
      navigate("/records");
    } catch (err) {
      setError("기록 저장에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const climbTypes = ["볼더링", "리드", "탑로프"];

  return (
    <div className={styles.pageOverlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>새로운 기록 추가</h2>
          <p>오늘의 위대한 도전을 기록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* Date */}
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
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
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
              value={form.location}
              onChange={handleChange}
              required
              maxLength={50}
            />
          </div>

          {/* Climb Type (Pill selector) */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Activity size={18} className={styles.icon} />
              <label>등반 종류</label>
            </div>
            <div className={styles.pillGroup}>
              {climbTypes.map(type => (
                <button
                  type="button"
                  key={type}
                  className={`${styles.pillBtn} ${form.climb_type === type ? styles.active : ''}`}
                  onClick={() => handleCustomSelect('climb_type', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty (Grid selector) */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Mountain size={18} className={styles.icon} />
              <label>목표 난이도</label>
            </div>
            <div className={styles.diffGrid}>
              {[
                { id: "white", label: "흰색", color: "#FFFFFF" },
                { id: "orange", label: "주황", color: "#ff8c00" },
                { id: "yellow", label: "노랑", color: "#ffd700" },
                { id: "green", label: "초록", color: "#32cd32" },
                { id: "blue", label: "파랑", color: "#1e90ff" },
                { id: "red", label: "빨강", color: "#ff0000" },
                { id: "purple", label: "보라", color: "#8a2be2" },
                { id: "gray", label: "회색", color: "#808080" },
                { id: "brown", label: "갈색", color: "#8b4513" },
                { id: "black", label: "검정색", color: "#000000" }
              ].map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  className={`${styles.diffBtn} ${form.difficulty === diff.label ? styles.active : ''}`}
                  onClick={() => handleCustomSelect('difficulty', diff.label)}
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

          {/* Success Status (Big toggle blocks) */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Trophy size={18} className={styles.icon} />
              <label>도전 결과</label>
            </div>
            <div className={styles.successGroup}>
              <button
                type="button"
                className={`${styles.successBtn} ${styles.isSuccess} ${form.success ? styles.active : ''}`}
                onClick={() => handleCustomSelect('success', true)}
              >
                <CheckCircle2 size={20} /> 완등 성공!
              </button>
              <button
                type="button"
                className={`${styles.successBtn} ${styles.isFail} ${!form.success ? styles.active : ''}`}
                onClick={() => handleCustomSelect('success', false)}
              >
                <XCircle size={20} /> 실패/연습중
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(-1)} // 뒤로가기가 더 직관적일 수 있음
            >
              취소
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "기록 저장 중..." : "기록 완료하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRecord;
