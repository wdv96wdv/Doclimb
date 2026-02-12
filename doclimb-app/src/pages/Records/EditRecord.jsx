import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecordById, updateRecord } from "../../services/record";
import styles from "./EditRecord.module.css"; // Use the new styles

function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: "",
    location: "",
    climb_type: "볼더링",
    difficulty: "V1",
    success: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.location) {
      setError("날짜와 클라이밍 장소를 입력하세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateRecord(id, form);
      navigate(`/records/${id}`);
    } catch (err) {
      setError("기록 수정에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>클라이밍 기록 수정</h2>
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
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <label htmlFor="success">성공</label>
            <input
              type="checkbox"
              id="success"
              name="success"
              checked={form.success}
              onChange={handleChange}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "수정 중..." : "수정"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditRecord;
