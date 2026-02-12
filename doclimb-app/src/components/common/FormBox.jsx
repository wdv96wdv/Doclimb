import styles from './FormBox.module.css'

function FormBox({ children }) {
  return <div className={styles.box}>{children}</div>
}

export default FormBox
