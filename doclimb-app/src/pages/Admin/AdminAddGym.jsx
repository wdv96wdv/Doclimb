import { useState } from "react";
import { supabase } from "../../services/supabase";
import Swal from "sweetalert2";
import styles from "./AdminUsers.module.css"; // 스타일 재사용

function AdminAddGym() {
  const [gymData, setGymData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymData.name) return Swal.fire("알림", "암장 이름은 필수입니다.", "warning");

    setLoading(true);
    try {
      const { error } = await supabase.from("gyms").insert([gymData]);
      if (error) throw error;

      await Swal.fire("성공", "새로운 암장이 등록되었습니다!", "success");
      setGymData({ name: "", address: "", phone: "", description: "" }); // 폼 초기화
    } catch (err) {
      Swal.fire("오류", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>🏢 새 암장 등록</h2>
        <p className={styles.subtitle}>새로운 지점이나 암장 정보를 시스템에 추가합니다.</p>
      </header>

      <div className={styles.card} style={{ padding: "30px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>암장 이름</label>
            <input
              className={styles.input}
              type="text"
              placeholder="예: 더클라임 연남점"
              value={gymData.name}
              onChange={(e) => setGymData({ ...gymData, name: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>주소</label>
            <input
              className={styles.input}
              type="text"
              placeholder="서울시 마포구..."
              value={gymData.address}
              onChange={(e) => setGymData({ ...gymData, address: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>전화번호</label>
            <input
              className={styles.input}
              type="text"
              placeholder="02-123-4567"
              value={gymData.phone}
              onChange={(e) => setGymData({ ...gymData, phone: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>설명</label>
            <textarea
              className={styles.input}
              rows="4"
              placeholder="암장 특징이나 이용 안내를 적어주세요."
              value={gymData.description}
              onChange={(e) => setGymData({ ...gymData, description: e.target.value })}
              style={{ resize: "none" }}
            />
          </div>
          <button type="submit" className={styles.primaryBtn} disabled={loading} style={{ width: "100%", padding: "15px" }}>
            {loading ? "등록 중..." : "암장 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", color: "#4a5568", fontSize: "14px" };

export default AdminAddGym;