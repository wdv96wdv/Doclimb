import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPost, getPostById, updatePost } from "../../services/community";
import { ImagePlus, Upload, X, Send, Check, RefreshCw, MessageSquare, Tag } from "lucide-react";
import noImage from "../../assets/img/no_image.png";
import styles from "./PostForm.module.css";

function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedTag, setSelectedTag] = useState("자유소통");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tags = ["자유소통", "암장추천", "장비리뷰", "정복완료", "도와줘요"];

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      getPostById(id)
        .then(post => {
          setCaption(post.caption || "");
          setSelectedTag(post.category || "자유소통");
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
    if (!caption) {
      setError("글 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await updatePost(id, { caption, category: selectedTag, imageFile });
      } else {
        await createPost({ caption, category: selectedTag, imageFile });
      }
      navigate("/community");
    } catch (err) {
      setError("게시물 저장에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className={styles.page}><div className={styles.error}>데이터를 가져오는 중...</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{isEditMode ? "게시물 수정" : "새 게시물 작성"}</h2>
          <p>오늘의 등반 이야기를 들려주세요.</p>
        </div>
        
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/*Trendy Card Preview 섹션 */}
          <div className={styles.previewSection}>
            <p className={styles.sectionTitle}>미리보기</p>
            <div className={styles.previewCard}>
              <div className={styles.previewImageWrapper}>
                <img src={imagePreview || noImage} alt="Preview" className={styles.previewImage} />
                <div className={styles.previewTag}>{selectedTag}</div>
              </div>
              <div className={styles.previewContent}>
                <p className={styles.previewCaption}>{caption || "여기에 내용이 표시됩니다..."}</p>
              </div>
            </div>
          </div>

          <div className={styles.inputSection}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><Tag size={16} /> 카테고리 선택</label>
              <div className={styles.tagList}>
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tagBtn} ${selectedTag === tag ? styles.activeTag : ""}`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}><Upload size={16} /> 사진 추가 (선택)</label>
              <div className={styles.uploadArea}>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.hiddenInput}
                />
                <label htmlFor="imageUpload" className={styles.uploadBtn}>
                  {imagePreview ? <RefreshCw size={20} /> : <ImagePlus size={24} />}
                  <span>{imagePreview ? "사진 변경하기" : "사진 업로드하기"}</span>
                </label>
                {imagePreview && (
                  <button type="button" className={styles.removeBtn} onClick={() => {setImageFile(null); setImagePreview("");}}>
                    <X size={16} /> 제거
                  </button>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}><MessageSquare size={16} /> 내용</label>
                <span className={styles.charCounter}>{caption.length}/200</span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="어떤 멋진 등반을 하셨나요? 자유롭게 들려주세요."
                className={styles.textarea} 
                maxLength={200}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate("/community")}
            >
              취소
            </button>

            <button
              type="submit"
              disabled={loading || !caption}
              className={styles.submitBtn}
            >
              {loading ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : isEditMode ? (
                "수정 완료"
              ) : (
                "지금 게시하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;
