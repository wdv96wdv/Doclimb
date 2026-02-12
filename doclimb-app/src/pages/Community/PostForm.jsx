import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPost, getPostById, updatePost } from "../../services/community";
import styles from "./PostForm.module.css";

function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getPostById(id)
        .then(post => {
          setCaption(post.caption);
          setImagePreview(post.image_url);
        })
        .catch(err => {
          setError("게시물 정보를 불러오는데 실패했습니다.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption || (!imageFile && !isEditMode)) {
      setError("사진과 설명을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await updatePost(id, { caption, imageFile });
      } else {
        await createPost({ caption, imageFile });
      }
      navigate("/community");
    } catch (err) {
      setError("게시물 저장에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div>로딩 중...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2>{isEditMode ? "게시물 수정" : "새 게시물"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.imagePreview}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <span>사진을 선택하세요</span>
            )}
          </div>
          <label htmlFor="imageUpload" className={styles.imageUploadLabel}>
            사진 선택
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.imageUploadInput}
          />

          <label htmlFor="caption" className={styles.captionLabel}>설명</label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="사진에 대한 설명을 입력하세요..."
            className={styles.captionInput} 
            maxLength={200}
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate("/community")}
            >
              취소
            </button>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "저장 중..." : isEditMode ? "수정" : "게시"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default PostForm;
