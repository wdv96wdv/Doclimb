import React from 'react';
import styles from './Loading.module.css';
import logoImg from '../../assets/img/mainlogo4.png'; // 프로젝트의 로고 경로

const Loading = ({ message = "권한 확인 중..." }) => {
  return (
    <div className={styles.container}>
      {/* 1. 로고 이미지 추가 */}
      <img src={logoImg} alt="Doclimb" className={styles.pulseLogo} />
      {/* 2. 메시지 추가 */}
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Loading;