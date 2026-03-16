import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Instagram, MapPin, Palette, FileText, Send, RefreshCw, Mountain } from "lucide-react";
import Swal from "sweetalert2";
import { getAllGyms } from "../../services/gym";
import { difficultyColors, getContrastColor } from "../../utils/climbingUtils";
import styles from "./CreateBeta.module.css";
import { useEffect } from "react";

function CreateBeta() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    video_url: "",
    gym_name: "",
    color_level: "빨강",
    description: "",
  });
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    getAllGyms().then(setGyms).catch(console.error);
  }, []);

  const difficultyList = Object.entries(difficultyColors).map(([label, color]) => ({
    label,
    color
  }));

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

      await Swal.fire({
        title: "공유 완료!",
        text: "인스타 영상이 피드에 공유되었습니다.",
        icon: "success",
        background: '#1a1d29',
        color: '#fff',
        confirmButtonColor: '#5271ff'
      });
      navigate("/beta");
    } catch (err) {
      Swal.fire({
        title: "에러 발생",
        text: err.message,
        icon: "error",
        background: '#1a1d29',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>인스타 피드 공유</h2>
      <form onSubmit={handleSubmit} className={styles.form}>

        <div className={styles.inputGroup}>
          <label><Instagram size={14} className="inline mr-1" /> 영상 링크</label>
          <input
            type="url"
            placeholder="https://www.instagram.com/p/..."
            value={formData.video_url}
            required
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label><MapPin size={14} className="inline mr-1" /> 클라이밍장</label>
          <select 
            className={styles.select}
            value={formData.gym_name}
            required 
            onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
          >
            <option value="">암장을 선택해주세요</option>
            {gyms.map(gym => (
              <option key={gym.id} value={gym.name}>{gym.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label><Mountain size={14} className="inline mr-1" /> 난이도 색상</label>
          <div className={styles.diffGrid}>
            {difficultyList.map((diff) => (
              <button
                key={diff.label}
                type="button"
                className={`${styles.diffBtn} ${formData.color_level === diff.label ? styles.activeDiff : ""}`}
                onClick={() => setFormData({ ...formData, color_level: diff.label })}
                style={{
                  '--btn-color': diff.color,
                  color: getContrastColor(diff.label)
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label><FileText size={14} className="inline mr-1" /> 상세 설명</label>
          <textarea
            placeholder="상세 정보를 적어주세요."
            value={formData.description}
            rows={2}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={20} className="refresh-spin" />
              <span>공유 중...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>피드에 공유하기</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CreateBeta;