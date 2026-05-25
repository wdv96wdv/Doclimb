import { useState } from "react";
import { createGym } from "../../services/gym";
import Swal from "sweetalert2";
import { Building2, MapPin, Phone, FileText, PlusCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminAddGym.module.css";

function AdminAddGym() {
  const navigate = useNavigate();
  const [gymData, setGymData] = useState({
    name: "",
    address: "", // UI에서는 address로 입력받고 DB에는 location으로 매핑
    phone: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!gymData.name.trim()) return Swal.fire("알림", "암장 이름은 필수입니다.", "warning");
    if (!gymData.address.trim()) return Swal.fire("알림", "암장 주소(위치)는 필수입니다.", "warning");

    setLoading(true);
    try {
      // DB 컬럼 매핑: address -> location
      await createGym({
        name: gymData.name,
        location: gymData.address,
        phone: gymData.phone,
        description: gymData.description,
      });

      await Swal.fire({
        icon: "success",
        title: "등록 성공",
        text: "새로운 암장이 시스템에 안전하게 등록되었습니다.",
        confirmButtonColor: "#3182ce",
      });
      
      setGymData({ name: "", address: "", phone: "", description: "" }); // 폼 초기화
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "등록 실패",
        text: err.message === 'new row violates row-level security policy for table "gyms"' 
          ? "암장 등록 권한이 없습니다 (관리자 전용)." 
          : err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
           <ArrowLeft size={18} /> 뒤로가기
        </button>
        <h2 className={styles.title}>🏢 새 암장 등록</h2>
        <p className={styles.subtitle}>
          DoClimb 서비스에 새로운 클라이밍 센터 정보를 추가합니다.<br />
          정확한 정보를 입력하면 유저들이 더 쉽게 암장을 찾을 수 있습니다.
        </p>
      </header>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label className={styles.label}><Building2 size={16} className={styles.icon} /> 암장 이름</label>
            <input
              className={styles.input}
              type="text"
              placeholder="예: 더클라임 연남점"
              value={gymData.name}
              onChange={(e) => setGymData({ ...gymData, name: e.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><MapPin size={16} className={styles.icon} /> 주소 (위치)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="서울시 마포구 양화로..."
              value={gymData.address}
              onChange={(e) => setGymData({ ...gymData, address: e.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}><Phone size={16} className={styles.icon} /> 연락처</label>
            <input
              className={styles.input}
              type="text"
              placeholder="02-123-4567"
              value={gymData.phone}
              onChange={(e) => setGymData({ ...gymData, phone: e.target.value })}
            />
          </div>

          <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
            <label className={styles.label}><FileText size={16} className={styles.icon} /> 암장 설명</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="암장의 특징, 이용 시간, 주차 안내 등을 상세히 적어주세요."
              value={gymData.description}
              onChange={(e) => setGymData({ ...gymData, description: e.target.value })}
            />
          </div>

          <div className={styles.fullWidth}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "데이터 처리 중..." : <><PlusCircle size={20} /> 암장 등록 완료</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAddGym;
