import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRecordById, deleteRecord } from "../../services/record";
import { 
  Calendar, 
  MapPin, 
  Activity, 
  Trophy, 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import Swal from "sweetalert2";
import Loading from "../../components/Common/Loading";
import styles from "./RecordDetail.module.css";

// 난이도별 색상 매핑 함수
const getDifficultyColor = (difficulty) => {
  const colors = {
    "흰색": "#FFFFFF",
    "주황": "#ff8c00",
    "노랑": "#ffd700",
    "초록": "#32cd32",
    "파랑": "#1e90ff",
    "남색": "#04203aff",
    "빨강": "#ff0000",
    "보라": "#8a2be2",
    "회색": "#808080",
    "갈색": "#8b4513",
    "검정색": "#000000",
    "핑크색": "#eb0cc5ff"
  };
  return colors[difficulty] || "#5271ff";
};

function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await getRecordById(id);
        setRecord(data);
      } catch (err) {
        setError("기록을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleEdit = () => {
    navigate(`/records/${id}/edit`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "기록을 삭제하시겠습니까?",
      text: "삭제된 기록은 되돌릴 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      background: "#1a1d29",
      color: "#fff",
      confirmButtonColor: "#ff4d4f",
      cancelButtonColor: "#5271ff",
      confirmButtonText: "삭제하기",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      try {
        await deleteRecord(id);
        await Swal.fire({
          icon: "success",
          title: "삭제 완료",
          text: "기록이 안전하게 삭제되었습니다.",
          background: "#1a1d29",
          color: "#fff",
          confirmButtonColor: "#5271ff",
        });
        navigate("/records");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "삭제 실패",
          text: "기록 삭제 중 오류가 발생했습니다.",
          background: "#1a1d29",
          color: "#fff",
        });
      }
    }
  };

  if (loading) {
    return <Loading message="기록을 불러오고 있습니다..." />;
  }

  if (error || !record) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <XCircle size={48} color="#ff4d4f" />
          <p>{error || "기록을 찾을 수 없습니다."}</p>
          <button onClick={() => navigate("/records")} className={styles.backButton}>목록으로 이동</button>
        </div>
      </div>
    );
  }

  const difficultyColor = getDifficultyColor(record.difficulty);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.iconButton} title="뒤로가기">
          <ChevronLeft size={24} />
        </button>
        <h2 className={styles.pageTitle}>기록 상세</h2>
        <div className={styles.headerActions}>
          <button onClick={handleEdit} className={styles.iconButton} title="수정">
            <Edit3 size={20} />
          </button>
          <button onClick={handleDelete} className={`${styles.iconButton} ${styles.deleteButton}`} title="삭제">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCard}>
          {/* Status Badge */}
          <div className={`${styles.statusBadge} ${record.success ? styles.success : styles.failure}`}>
            {record.success ? (
              <><CheckCircle2 size={24} /> <span>완등 성공</span></>
            ) : (
              <><XCircle size={24} /> <span>연습 기록</span></>
            )}
          </div>

          <h1 className={styles.locationTitle}>{record.location}</h1>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><Calendar size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>등반 날짜</span>
                <span className={styles.infoValue}>{record.date}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><MapPin size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>장소</span>
                <span className={styles.infoValue}>{record.location}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><Activity size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>등반 종류</span>
                <span className={styles.infoValue}>{record.climb_type}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}><Trophy size={20} /></div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>난이도</span>
                <div className={styles.difficultyValue}>
                  <div 
                    className={styles.colorDot} 
                    style={{ 
                      backgroundColor: difficultyColor,
                      boxShadow: `0 0 10px ${difficultyColor}66`
                    }} 
                  />
                  <span>{record.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {record.notes && (
            <div className={styles.notesSection}>
              <h3 className={styles.notesTitle}>메모</h3>
              <p className={styles.notesContent}>{record.notes}</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={() => navigate("/records")} className={styles.listButton}>
            전체 목록보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordDetail;
