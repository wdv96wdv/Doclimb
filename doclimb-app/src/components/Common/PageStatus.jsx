import Loading from "./Loading";
import styles from "./PageStatus.module.css";

/**
 * 로딩 / 에러 / 콘텐츠 3상태를 통일하는 래퍼
 */
export default function PageStatus({
  loading,
  error,
  loadingMessage = "불러오는 중...",
  children,
  onRetry,
}) {
  if (loading) {
    return <Loading message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>{error}</p>
        {onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return children;
}
