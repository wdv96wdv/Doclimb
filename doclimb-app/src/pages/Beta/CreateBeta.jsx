import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import styles from "./CreateBeta.module.css";

function CreateBeta() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    video_url: "",
    gym_name: "",
    color_level: "빨강", // 초기값
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("betas").insert([
        {
          user_id: user.id,
          video_url: formData.video_url,
          gym_name: formData.gym_name,
          color_level: formData.color_level,
          description: formData.description,
        },
      ]);

      if (error) throw error;

      Swal.fire("성공!", "베타 영상이 공유되었습니다.", "success");
      navigate("/beta"); // 리스트 페이지로 이동
    } catch (err) {
      Swal.fire("에러", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Beta 영상 공유</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* 인스타그램 링크 */}
        <div className={styles.inputGroup}>
          <label>영상 링크</label>
          <input 
            type="url" 
            placeholder="https://www.instagram.com/p/..." 
            value={formData.video_url}
            required 
            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
          />
        </div>

        {/* 암장 이름 */}
        <div className={styles.inputGroup}>
          <label>클라이밍장</label>
          <input 
            type="text" 
            placeholder="암장 이름을 입력하세요 (예: 더클라임 연남)" 
            value={formData.gym_name}
            required 
            onChange={(e) => setFormData({...formData, gym_name: e.target.value})}
          />
        </div>

        {/* 난이도 선택 (이 부분이 추가되었습니다) */}
        <div className={styles.inputGroup}>
          <label>난이도 색상</label>
          <select 
            className={styles.select}
            value={formData.color_level}
            onChange={(e) => setFormData({...formData, color_level: e.target.value})}
          >
            <option value="빨강">빨강</option>
            <option value="주황">주황</option>
            <option value="노랑">노랑</option>
            <option value="초록">초록</option>
            <option value="파랑">파랑</option>
            <option value="남색">남색</option>
            <option value="보라">보라</option>
            <option value="갈색">갈색</option>
            <option value="검정">검정</option>
          </select>
        </div>

        {/* 상세 설명 */}
        <div className={styles.inputGroup}>
          <label>설명</label>
          <textarea 
            placeholder="문제에 대한 팁이나 설명을 적어주세요."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "공유 중..." : "공유하기"}
        </button>
      </form>
    </div>
  );
}

export default CreateBeta;