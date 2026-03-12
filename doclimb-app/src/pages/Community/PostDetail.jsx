import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, deletePost, getCommentsByPostId, createComment, deleteComment } from "../../services/community";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, Edit3, Trash2, Tag, MessageCircle, Send, Reply, X, RefreshCw } from "lucide-react";
import noImage from "../../assets/img/no_image.png";
import styles from "./PostDetail.module.css";
import Swal from 'sweetalert2';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { id, nickname }
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [postData, commentData] = await Promise.all([
        getPostById(id),
        getCommentsByPostId(id)
      ]);
      setPost(postData);
      setComments(commentData);
    } catch (err) {
      setError("데이터를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      text: "삭제된 게시물은 복구할 수 없습니다.",
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
      try {
        await deletePost(id);
        await Swal.fire({
          title: '삭제 완료!',
          icon: 'success',
          background: '#1a1d29',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/community");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({ title: "로그인이 필요합니다.", icon: "info", background: "#1a1d29", color: "#fff" });
      return;
    }
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const newComment = await createComment({
        postId: id,
        content: commentText,
        parentId: replyTo ? replyTo.id : null
      });
      // 전체 댓글 다시 가져오기 (트리 구조 갱신을 위해)
      const updatedComments = await getCommentsByPostId(id);
      setComments(updatedComments);
      setCommentText("");
      setReplyTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: '댓글을 삭제하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: '삭제',
      background: '#1a1d29',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 댓글 계층 구조 형성 로직
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];
    
    comments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });
    
    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  }, [comments]);

  if (loading) return <div className={styles.page}><div className={styles.loading}>로딩 중...</div></div>;
  if (!post) return <div className={styles.page}><div className={styles.error}>게시물을 찾을 수 없습니다.</div></div>;

  const isAuthor = user && user.id === post.user_id;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 상단 이미지 영역 */}
        <div className={styles.imageWrapper}>
          <img src={post.image_url || noImage} alt="" className={styles.bgImage} />
          <img src={post.image_url || noImage} alt={post.caption} className={styles.postImage} />
        </div>

        <div className={styles.postContent}>
          {/* 게시물 헤더 */}
          <div className={styles.authorSection}>
            <div className={styles.authorInfo}>
              <img
                src={post.profiles.avatar_url || '/climbing_placeholder.jpg'}
                alt={post.profiles.display_nickname}
                className={styles.authorAvatar}
              />
              <div className={styles.authorText}>
                <span className={styles.nickname}>{post.profiles.display_nickname || "클라이머"}</span>
                <span className={styles.postDate}>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            {post.category && (
              <div className={styles.categoryBadge}>
                <Tag size={12} /> {post.category}
              </div>
            )}
          </div>
          
          {/* 게시물 본문 */}
          <div className={styles.mainContent}>
            <p className={styles.postCaption}>{post.caption}</p>
          </div>

          {/* 버튼 액션 */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={() => navigate("/community")}>
              <ChevronLeft size={18} /> 목록으로
            </button>
            {isAuthor && (
              <div className={styles.authorActions}>
                <Link to={`/community/${id}/edit`} className={styles.editButton}>
                  <Edit3 size={16} /> 수정
                </Link>
                <button onClick={handleDeletePost} className={styles.deleteButton}>
                  <Trash2 size={16} /> 삭제
                </button>
              </div>
            )}
          </div>

          <hr className={styles.divider} />

          {/* 댓글 섹션 */}
          <div className={styles.commentSection}>
            <div className={styles.commentHeader}>
              <MessageCircle size={20} />
              <h3>댓글 <span>{comments.length}</span></h3>
            </div>

            <div className={styles.commentList}>
              {commentTree.length === 0 ? (
                <p className={styles.emptyComments}>첫 댓글을 남겨보세요!</p>
              ) : (
                commentTree.map(comment => (
                  <CommentNode 
                    key={comment.id} 
                    node={comment} 
                    user={user} 
                    onReply={(target) => setReplyTo(target)}
                    onDelete={handleDeleteComment}
                    depth={0}
                  />
                ))
              )}
            </div>

            {/* 댓글 입력 폼 */}
            <div className={styles.commentFormWrapper}>
              {replyTo && (
                <div className={styles.replyIndicator}>
                  <span><strong>@{replyTo.nickname}</strong> 님에게 답글 남기는 중</span>
                  <button onClick={() => setReplyTo(null)}><X size={14} /></button>
                </div>
              )}
              <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 남겨보세요."}
                  disabled={!user || commentLoading}
                  maxLength={500}
                />
                <button type="submit" disabled={!user || !commentText.trim() || commentLoading}>
                  {commentLoading ? <div className={styles.spinner}></div> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 재귀적 댓글 노드 컴포넌트
function CommentNode({ node, user, onReply, onDelete, depth }) {
  const maxDepth = 3; // 최대 들여쓰기 깊이 제한 (가독성 위해)
  
  return (
    <div className={styles.commentThread}>
      <div 
        className={`${styles.commentCard} ${depth > 0 ? styles.isReplyCard : ""}`}
        style={{ marginLeft: depth > 0 ? `${Math.min(depth, maxDepth) * 20}px` : "0" }}
      >
        <img 
          src={node.profiles.avatar_url || '/climbing_placeholder.jpg'} 
          alt="" 
          className={styles.commentAvatar} 
        />
        <div className={styles.commentBody}>
          <div className={styles.commentInfo}>
            <span className={styles.commentNickname}>{node.profiles.display_nickname}</span>
            <span className={styles.commentDate}>{new Date(node.created_at).toLocaleDateString()}</span>
          </div>
          <p className={styles.commentText}>{node.content}</p>
          <div className={styles.commentActions}>
            <button 
              onClick={() => onReply({ id: node.id, nickname: node.profiles.display_nickname })} 
              className={styles.replyBtn}
            >
              <Reply size={14} /> 답글 달기
            </button>
            {user && user.id === node.user_id && (
              <button onClick={() => onDelete(node.id)} className={styles.deleteBtn}>
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 자식 댓글(대댓글) 재귀 렌더링 */}
      {node.children && node.children.map(child => (
        <CommentNode 
          key={child.id} 
          node={child} 
          user={user} 
          onReply={onReply} 
          onDelete={onDelete} 
          depth={depth + 1} 
        />
      ))}
    </div>
  );
}

export default PostDetail;
