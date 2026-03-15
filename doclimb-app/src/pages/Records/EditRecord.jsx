import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecordById, updateRecord } from "../../services/record";
import { Calendar, MapPin, Activity, Mountain, Trophy, XCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import styles from "./EditRecord.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";

function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    location: "",
    climb_type: "볼더링",
    difficulty: "흰색",
    success: false,
    is_public: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const record = await getRecordById(id);
        setForm({
          date: record.date.slice(0, 10),
          location: record.location,
          climb_type: record.climb_type,
          difficulty: record.difficulty,
          success: record.success,
          is_public: record.is_public ?? true,
        });
      } catch (err) {
        setError("기록을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

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

    setUpdating(true);
    setError("");

    try {
      await updateRecord(id, form);
      navigate(`/records/${id}`);
    } catch (err) {
      setError("기록 수정에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageOverlay}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p>기록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageOverlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>기록 수정하기</h2>
          <p>그날의 도전을 다시 기록합니다</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Date */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Calendar size={18} className={styles.icon} />
              <label htmlFor="date">등반 날짜</label>
            </div>
            <DatePicker
              selected={form.date ? new Date(form.date) : null}
              onChange={(date) => {
                const formattedDate = date.toISOString().split('T')[0];
                setForm(prev => ({ ...prev, date: formattedDate }));
              }}
              dateFormat="yyyy-MM-dd"
              locale={ko}
              className={styles.input}
              placeholderText="날짜를 선택하세요"
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

          {/* Public Status */}
          <div className={styles.formGroup}>
            <div className={styles.publicToggleWrapper} onClick={() => handleCustomSelect("is_public", !form.is_public)}>
              <div className={styles.labelWrapper}>
                {form.is_public ? <Eye size={18} className={styles.icon} /> : <EyeOff size={18} className={styles.iconMuted} />}
                <label>명예의 전당 공개</label>
              </div>
              <div className={`${styles.toggleSwitch} ${form.is_public ? styles.active : ''}`}>
                <div className={styles.toggleHandle}></div>
              </div>
            </div>
            <p className={styles.helperText}>
              {form.is_public 
                ? "이 기록은 명예의 전당(랭킹)에 집계되어 다른 사용자에게 공개됩니다." 
                : "이 기록은 본인만 볼 수 있으며 랭킹에 집계되지 않습니다."}
            </p>
          </div>

          {/* Climb Type */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Activity size={18} className={styles.icon} />
              <label>등반 종류</label>
            </div>
            <div className={styles.pillGroup}>
              {climbTypes.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`${styles.pillBtn} ${form.climb_type === type ? styles.active : ""}`}
                  onClick={() => handleCustomSelect("climb_type", type)}
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
              <label>목표 난이도</label>
            </div>
            <div className={styles.diffGrid}>
              {difficulties.map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  className={`${styles.diffBtn} ${form.difficulty === diff.label ? styles.active : ""}`}
                  onClick={() => handleCustomSelect("difficulty", diff.label)}
                  style={{
                    "--btn-color": diff.color,
                    color: (diff.id === "white" || diff.id === "yellow") ? "#000" : "#fff",
                  }}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Success Status */}
          <div className={styles.formGroup}>
            <div className={styles.labelWrapper}>
              <Trophy size={18} className={styles.icon} />
              <label>도전 결과</label>
            </div>
            <div className={styles.successGroup}>
              <button
                type="button"
                className={`${styles.successBtn} ${styles.isSuccess} ${form.success ? styles.active : ""}`}
                onClick={() => handleCustomSelect("success", true)}
              >
                <CheckCircle2 size={20} /> 완등 성공!
              </button>
              <button
                type="button"
                className={`${styles.successBtn} ${styles.isFail} ${!form.success ? styles.active : ""}`}
                onClick={() => handleCustomSelect("success", false)}
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
              onClick={() => navigate(-1)}
            >
              취소
            </button>
            <button type="submit" disabled={updating} className={styles.submitButton}>
              {updating ? "수정 중..." : "수정 완료하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecord;
