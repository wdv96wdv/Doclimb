import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, deletePost } from "../../services/community";
import { useAuth } from "../../context/AuthContext";
import styles from "./PostDetail.module.css";
import Swal from 'sweetalert2';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        setError("게시물을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      text: "삭제된 게시물은 복구할 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePost(id);
          Swal.fire(
            '삭제 완료!',
            '게시물이 성공적으로 삭제되었습니다.',
            'success'
          ).then(() => {
            navigate("/community");
          });
        } catch (err) {
          Swal.fire(
            '삭제 실패!',
            '게시물 삭제 중 오류가 발생했습니다.',
            'error'
          );
          console.error(err);
        }
      }
    });
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  const isAuthor = user && user.id === post.user_id;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <img
            src={post.image_url}
            alt=""
            className={styles.bgImage}
            aria-hidden
          />
          <img
            src={post.image_url}
            alt={post.caption}
            className={styles.postImage}
          />
        </div>

        <div className={styles.postContent}>
          <div className={styles.authorInfo}>
            <img
              src={post.profiles.avatar_url || '/climbing_placeholder.jpg'}
              alt={post.profiles.username}
              className={styles.authorAvatar}
            />
            <span>{post.profiles.username}</span>
          </div>
          <p className={styles.postCaption}>{post.caption}</p>
          <span className={styles.postDate}>{new Date(post.created_at).toLocaleDateString()}</span>

          {isAuthor && (
            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={() => navigate("/community")}>목록 </button>
              <Link to={`/community/${id}/edit`} className={styles.editButton}>수정</Link>
              <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
