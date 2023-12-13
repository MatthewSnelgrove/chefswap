import React from "react";
import styles from "../styles/Error.module.scss";

export default function NotFound() {
  return (
    <div className={styles.content}>
      <h1 className={styles.status}>404</h1>
      <h2 className={styles.message}>Page not found</h2>
      <p className={styles.description}>That's all we know, sorry!</p>
    </div>
  );
}
