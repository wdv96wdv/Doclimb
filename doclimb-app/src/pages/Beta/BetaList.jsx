import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
      Swal.fire({ icon: "warning", title: "로그인 필요", text: "투표를 하려면 로그인이 필요합니다." });
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
      Swal.fire({ icon: "error", title: "에러", text: "이미 투표하셨거나 권한이 없습니다." });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '삭제하시겠습니까?',
      text: "복구할 수 없는 작업입니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("betas").delete().eq("id", id);
      if (error) {
        Swal.fire("에러", error.message, "error");
      } else {
        Swal.fire("삭제 완료", "포스트가 삭제되었습니다.", "success");
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

  if (loading) return <div className={styles.loading}>데이터를 불러오는 중...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <div className={styles.header}>
          <h2>인스타 피드</h2>
          <button onClick={() => navigate("/beta/new")} className={styles.addButton}>
            글쓰기
          </button>
        </div>

        <div className={styles.postList}>
          {betas.length > 0 ? (
            betas.map((beta) => {
              const myRating = beta.route_ratings?.find(r => r.user_id === userProfile?.id)?.perceived_difficulty;
              
              return (
                <div key={beta.id} className={styles.postCard}>
                  {/* 상단 암장 정보 바 */}
                  <div className={styles.cardTopBar}>
                    <div className={styles.gymGroup}>
                      <span className={`${styles.levelTag} ${styles[beta.color_level]}`}>
                        {beta.color_level}
                      </span>
                      <span className={styles.gymName}>{beta.gym_name}</span>
                    </div>
                    {userProfile?.id === beta.user_id && (
                      <button className={styles.deleteButton} onClick={() => handleDelete(beta.id)}>삭제</button>
                    )}
                  </div>

                  {/* 작성자 프로필 섹션 */}
                  <div className={styles.authorSection}>
                    <div className={styles.authorLeft}>
                      <img 
                        src={beta.profiles?.avatar_url || "/climbing_placeholder.jpg"} 
                        className={styles.authorAvatar} 
                        alt="profile"
                      />
                      <div className={styles.authorTextInfo}>
                        <span className={styles.authorNickname}>{beta.profiles?.display_nickname || "익명"}</span>
                        {/* <span className={styles.subText}>오리지널 오디오</span> */}
                      </div>
                    </div>
                    {/* <button className={styles.profileViewButton}>프로필 보기</button> */}
                  </div>

                  {/* 비디오 컨텐츠 */}
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

                  {/* 하단 설명 및 투표 */}
                  <div className={styles.postInfo}>
                    <p className={styles.postCaption}>{beta.description}</p>
                    
                    <div className={styles.ratingSection}>
                      <p className={styles.ratingTitle}>체감 난이도</p>
                      <div className={styles.ratingButtons}>
                        <button className={`${styles.rateBtn} ${myRating === "쉬워요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "쉬워요")}>
                          🟢 {getRatingCount(beta.route_ratings, "쉬워요")}
                        </button>
                        <button className={`${styles.rateBtn} ${myRating === "적당해요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "적당해요")}>
                          🟡 {getRatingCount(beta.route_ratings, "적당해요")}
                        </button>
                        <button className={`${styles.rateBtn} ${myRating === "매워요" ? styles.active : ""}`} onClick={() => handleRate(beta.id, "매워요")}>
                          🔴 {getRatingCount(beta.route_ratings, "매워요")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>아직 공유된 영상이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BetaList;