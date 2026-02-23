import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css'; // Import the CSS module
import logo from '../../assets/img/mainlogo4.png';

function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
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
            {isAuthenticated ? (
              <>
                <button className={styles.navButton} onClick={() => handleNavigate("/gymlist")}>실시간 암장 혼잡도</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/records")}>기록</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/community")}>커뮤니티</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/guide")}>가이드</button>
                <button className={styles.navButton} onClick={() => handleNavigate("/mypage")}>마이페이지</button>
                <button className={styles.navButton} onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <button className={styles.navButton} onClick={() => handleNavigate("/login")}>로그인</button>
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
