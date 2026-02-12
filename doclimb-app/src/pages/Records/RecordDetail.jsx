import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecordById, deleteRecord } from "../../services/record";
import Swal from "sweetalert2"; // Import SweetAlert2
import styles from "./RecordDetail.module.css"; // Assuming you will create a CSS module

function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await getRecordById(id);
        setRecord(data);
      } catch (err) {
        setError("기록을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        console.log("기록을 불러오는데 성공했습니다.");
      }
    };

    fetchRecord();
  }, [id]);

  const handleEdit = () => {
    navigate(`/records/${id}/edit`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "정말로 삭제하시겠습니까?",
      text: "삭제된 기록은 되돌릴 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      try {
        await deleteRecord(id);
        Swal.fire("삭제 완료!", "기록이 성공적으로 삭제되었습니다.", "success");
        navigate("/records");
      } catch (err) {
        setError("기록을 삭제하는데 실패했습니다.");
        Swal.fire("삭제 실패", "기록 삭제 중 오류가 발생했습니다.", "error");
        console.error(err);
      }
    }
  };

  if (error || !record) {
    return <div className={styles.error}>{error || "기록을 찾을 수 없습니다."}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>클라이밍 기록 상세</h2>

        <div className={styles.detailItem}>
          <span className={styles.label}>📅 날짜</span>
          <span className={styles.value}>{record.date}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>📍 장소</span>
          <span className={styles.value}>{record.location}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>🧗‍♀️ 종류</span>
          <span className={styles.value}>{record.climb_type}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>💪 난이도</span>
          <span className={styles.value}>{record.difficulty}</span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>🏆 결과</span>
          <span className={`${styles.value} ${record.success ? styles.success : styles.failure}`}>
            {record.success ? "성공" : "실패"}
          </span>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={() => navigate("/records")} className={styles.button}>
            목록
          </button>
          <button onClick={handleEdit} className={`${styles.button} ${styles.editButton}`}>
            수정
          </button>
          <button onClick={handleDelete} className={`${styles.button} ${styles.deleteButton}`}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordDetail;
