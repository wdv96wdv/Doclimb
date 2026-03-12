import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>© {new Date().getFullYear()} DoClimb. All rights reserved.</p>
      <a 
        href="https://climbing-frame-cc5.notion.site/3050f03e6dcc807586dbfb95ccaf7332" 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.privacyLink}
      >
        개인정보 처리방침
      </a>
    </footer>
  );
}

export default Footer;