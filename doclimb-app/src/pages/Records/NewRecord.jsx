import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecord } from "../../services/record";
import styles from './NewRecord.module.css'; // Assuming you will create a CSS module

function NewRecord() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      date: today,
      location: "",
      climb_type: "볼더링",
      difficulty: "V1",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.location) {
      setError("날짜와 클라이밍 장소를 입력하세요.");
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

  return (
    <div className={styles.container}>
      <h2>새로운 클라이밍 기록</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="date">날짜</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location">장소</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="클라이밍 장소"
            value={form.location}
            onChange={handleChange}
            required
            maxLength={50}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="climb_type">종류</label>
          <select
            id="climb_type"
            name="climb_type"
            value={form.climb_type}
            onChange={handleChange}
          >
            <option value="볼더링">볼더링</option>
            <option value="리드">리드</option>
            <option value="탑로프">탑로프</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="difficulty">난이도</label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            {["V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="success"
              checked={form.success}
              onChange={handleChange}
            />
            성공
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/records")}
          >
            목록
          </button>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewRecord;
