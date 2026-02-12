import styles from "./Footer.module.css"; // 필요 시 생성

function Footer() {
  return (
    <footer style={{ 
      padding: "20px", 
      textAlign: "center", 
      fontSize: "12px", 
      color: "#888",
      backgroundColor: "#f9f9f9",
      marginBottom: "70px" // BottomNav에 가려지지 않게 여백 추가
    }}>
      <p>© 2026 DoClimb. All rights reserved.</p>
      <a 
        href="https://climbing-frame-cc5.notion.site/3050f03e6dcc807586dbfb95ccaf7332" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: "#666", textDecoration: "underline", marginTop: "5px", display: "inline-block" }}
      >
        개인정보 처리방침
      </a>
    </footer>
  );
}

export default Footer;