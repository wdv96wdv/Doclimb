import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../../services/community";
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
      } finally {
        console.log("기록을 불러오는데 성공했습니다.");
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
            글쓰기
          </Link>
        </div>

        <div className={styles.postList}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                to={`/community/${post.id}`}
                key={post.id}
                className={styles.postCard}
              >
                <img
                  src={post.image_url}
                  alt={post.caption}
                  className={styles.postImage}
                />
                <div className={styles.postInfo}>
                  <p className={styles.postCaption}>{post.caption}</p>
                  <div className={styles.authorInfo}>
                    <img
                      src={post.profiles.avatar_url || "/climbing_placeholder.jpg"}
                      alt={post.profiles.display_nickname}
                      className={styles.authorAvatar}
                    />
                    <span>{post.profiles.display_nickname}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>아직 게시물이 없습니다. 첫 게시물을 작성해보세요!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;
