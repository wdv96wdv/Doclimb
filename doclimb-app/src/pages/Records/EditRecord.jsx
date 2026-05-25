import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecordById, updateRecord } from "../../services/record";
import { Calendar, MapPin, Activity, Mountain, Trophy, XCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Loading from "../../components/Common/Loading";
import styles from "./EditRecord.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { getAllGyms } from "../../services/gym";
import { difficultyColors, getContrastColor } from "../../utils/climbingUtils";

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
  const [gyms, setGyms] = useState([]);
  const [gymLoading, setGymLoading] = useState(true);
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  const climbTypes = ["볼더링", "리드", "탑로프"];
  const difficulties = Object.entries(difficultyColors).map(([label, color]) => ({
    id: label,
    label,
    color
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setGymLoading(true);

        // Fetch gym list
        const gymData = await getAllGyms();
        setGyms(gymData || []);

        // Fetch record detail
        const record = await getRecordById(id);
        setForm({
          date: record.date.slice(0, 10),
          location: record.location,
          climb_type: record.climb_type,
          difficulty: record.difficulty,
          success: record.success,
          is_public: record.is_public ?? true,
        });

        // Check if the location is in the gym list
        const gymExists = gymData?.some(g => g.name === record.location);
        if (!gymExists && record.location) {
          setIsCustomLocation(true);
        }

      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
        setGymLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "gymSelector") {
      if (value === "custom") {
        setIsCustomLocation(true);
        setForm(prev => ({ ...prev, location: "" }));
      } else {
        setIsCustomLocation(false);
        setForm(prev => ({ ...prev, location: value }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
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
    return <Loading message="기록을 불러오고 있습니다..." />;
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
              <label htmlFor="location">암장 선택</label>
            </div>
            {gymLoading ? (
              <div className={styles.loadingText}>암장 목록을 불러오는 중...</div>
            ) : (
              <select
                id="gymSelector"
                name="gymSelector"
                className={styles.select}
                value={isCustomLocation ? "custom" : form.location}
                onChange={handleChange}
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
                value={form.location}
                onChange={handleChange}
                required
                maxLength={50}
              />
            )}
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
                     color: getContrastColor(diff.label),
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
