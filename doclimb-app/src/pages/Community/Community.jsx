import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../../services/community";
import { Plus, Image as ImageIcon, MessageCircle, Heart } from "lucide-react";
import noImage from "../../assets/img/no_image.png";
import styles from "./Community.module.css";

function Community() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        setError("게시물을 불러오는데 실패했습니다.");
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        <div className={styles.header}>
          <h2>커뮤니티</h2>
          <Link to="/community/new" className={styles.addButton}>
            <Plus size={20} strokeWidth={3} />
            글쓰기
          </Link>
        </div>

        <div className={styles.postList}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                to={`` + `/community/${post.id}`}
                key={post.id}
                className={styles.postCard}
              >
                <img
                  src={post.image_url || noImage}
                  alt={post.caption}
                  className={styles.postImage}
                />
                <div className={styles.postInfo}>
                  <div className={styles.tagBadge}>{post.category || '자유소통'}</div>
                  <p className={styles.postCaption}>{post.caption}</p>
                  <div className={styles.authorInfo}>
                    <img
                      src={post.profiles.avatar_url || "/climbing_placeholder.jpg"}
                      alt={post.profiles.display_nickname}
                      className={styles.authorAvatar}
                      style={{ 
                        border: `2px solid ${post.profiles.highest_level_color || 'transparent'}`,
                        boxShadow: post.profiles.highest_level_color ? `0 0 8px ${post.profiles.highest_level_color}aa` : 'none'
                      }}
                    />
                    <span>{post.profiles.display_nickname}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyFeed}>
              <ImageIcon size={64} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '20px' }} />
              <p>아직 게시물이 없습니다. <br />첫 등반의 설렘을 공유해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;
