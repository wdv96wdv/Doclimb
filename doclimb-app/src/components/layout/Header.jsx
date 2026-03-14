import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css';
import logo from '../../assets/img/mainlogo4.png';

function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
    setIsMenuOpen(false); // 로그아웃 시 메뉴 닫기
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo} onClick={() => handleNavigate("/")}>
            <img src={logo} alt="DoClimb Logo" className={styles.logoImage} />
          </div>

          <button
            className={`${styles.menuToggle} ${isMenuOpen ? styles.menuToggleOpen : ''}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            {/* 🌍 누구나 볼 수 있는 공통 메뉴 */}
            <button className={styles.navButton} onClick={() => handleNavigate("/gymlist")}>실시간 암장 혼잡도</button>
            <button className={styles.navButton} onClick={() => handleNavigate("/community")}>커뮤니티</button>
            <button className={styles.navButton} onClick={() => handleNavigate("/beta")}>인스타 피드</button>
            <button className={styles.navButton} onClick={() => handleNavigate("/ranking")}>명예의 전당</button>
            <button className={styles.navButton} onClick={() => handleNavigate("/guide")}>가이드</button>

            {/* 🔒 로그인 상태에 따라 다른 메뉴 */}
            {isAuthenticated ? (
              <>
                <button className={styles.navButton} onClick={() => handleNavigate("/ai-coach")}>AI 코칭</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/records")}>기록</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/mypage")}>마이페이지</button>
                <button className={`${styles.navButton} ${styles.logoutBtn}`} onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button className={`${styles.navButton} ${styles.loginBtn}`} onClick={() => handleNavigate("/login")}>로그인</button>
            )}
          </nav>
        </div>
      </header>

      {isMenuOpen && (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Header;