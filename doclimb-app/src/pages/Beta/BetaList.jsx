import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, MapPin, Smile, Meh, Frown, PlayCircle } from "lucide-react";
import styles from "./Beta.module.css";
import Swal from "sweetalert2";

function BetaList() {
  const [betas, setBetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const fetchBetas = async () => {
    try {
      const { data, error } = await supabase
        .from("betas")
        .select(`
          *,
          profiles (
            display_nickname,
            avatar_url
          ),
          route_ratings (
            perceived_difficulty,
            user_id
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBetas(data);
    } catch (err) {
      console.error("데이터 로딩 에러:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetas();
  }, []);

  const handleRate = async (betaId, ratingValue) => {
    if (!userProfile) {
      Swal.fire({ 
        icon: "warning", 
        title: "로그인 필요", 
        text: "투표를 하려면 로그인이 필요합니다.",
        background: '#1a1d29',
        color: '#fff'
      });
      return;
    }
    try {
      const { error } = await supabase.from("route_ratings").upsert(
        { beta_id: betaId, user_id: userProfile.id, perceived_difficulty: ratingValue },
        { onConflict: 'beta_id, user_id' }
      );
      if (error) throw error;
      fetchBetas();
    } catch (err) {
      Swal.fire({ 
        icon: "error", 
        title: "에러", 
        text: "이미 투표하셨거나 권한이 없습니다.",
        background: '#1a1d29',
        color: '#fff'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '삭제하시겠습니까?',
      text: "복구할 수 없는 작업입니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      background: '#1a1d29',
      color: '#fff'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("betas").delete().eq("id", id);
      if (error) {
        Swal.fire({ title: "에러", text: error.message, icon: "error", background: '#1a1d29', color: '#fff' });
      } else {
        Swal.fire({ title: "삭제 완료", text: "포스트가 삭제되었습니다.", icon: "success", background: '#1a1d29', color: '#fff' });
        fetchBetas();
      }
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const baseUrl = url.split("?")[0];
    return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}embed`;
  };

  const getRatingCount = (ratings, type) => ratings?.filter(r => r.perceived_difficulty === type).length || 0;


  if (loading) return <div className={styles.loading}>등반 영상 로드 중...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <div className={styles.header}>
          <h2>인스타 피드</h2>
          <button onClick={() => navigate("/beta/new")} className={styles.addButton}>
            <Plus size={20} strokeWidth={3} />
            영상 공유
          </button>
        </div>

        <div className={styles.postList}>
          {betas.length > 0 ? (
            betas.map((beta) => {
              const myRating = beta.route_ratings?.find(r => r.user_id === userProfile?.id)?.perceived_difficulty;
              
              return (
                <div key={beta.id} className={styles.postCard}>
                  <div className={styles.cardTopBar}>
                    <div className={styles.gymGroup}>
                      <span className={`${styles.levelTag} ${styles[beta.color_level]}`}>
                        {beta.color_level}
                      </span>
                      <span className={styles.gymName}><MapPin size={14} className="inline mr-1" /> {beta.gym_name}</span>
                    </div>
                    {userProfile?.id === beta.user_id && (
                      <button className={styles.deleteButton} onClick={() => handleDelete(beta.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className={styles.authorSection}>
                    <div className={styles.authorLeft}>
                      <img 
                        src={beta.profiles?.avatar_url || "/climbing_placeholder.jpg"} 
                        className={styles.authorAvatar} 
                        alt="profile"
                      />
                      <div className={styles.authorTextInfo}>
                        <span className={styles.authorNickname}>{beta.profiles?.display_nickname || "익명"}</span>
                        <span className={styles.subText}>{new Date(beta.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.videoWrapper}>
                    <iframe
                      src={getEmbedUrl(beta.video_url)}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency="true"
                      title={`video-${beta.id}`}
                    ></iframe>
                  </div>

                  <div className={styles.postInfo}>
                    <p className={styles.postCaption}>{beta.description}</p>
                    
                    <div className={styles.ratingSection}>
                      <p className={styles.ratingTitle}>체감 난이도 투표</p>
                      <div className={styles.ratingButtons}>
                        <button className={`${styles.rateBtn} ${myRating === "쉬워요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "쉬워요")}>
                          <Smile size={18} /> <span>{getRatingCount(beta.route_ratings, "쉬워요")}</span>
                        </button>
                        <button className={`${styles.rateBtn} ${myRating === "적당해요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "적당해요")}>
                          <Meh size={18} /> <span>{getRatingCount(beta.route_ratings, "적당해요")}</span>
                        </button>
                        <button className={`${styles.rateBtn} ${myRating === "매워요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "매워요")}>
                          <Frown size={18} /> <span>{getRatingCount(beta.route_ratings, "매워요")}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>
              <PlayCircle size={64} strokeWidth={1} style={{ opacity: 0.1, marginBottom: '20px' }} />
              <p>아직 공유된 영상이 없습니다. <br />첫 영상을 공유해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BetaList;