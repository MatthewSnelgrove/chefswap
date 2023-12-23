import React from "react";
import styles from "../styles/Error.module.scss";

export default function NotFound() {
  return (
    <div className={styles.content}>
      <h1 className={styles.status}>500</h1>
      <h2 className={styles.message}>Server-side error</h2>
      <p className={styles.description}>That's all we know, sorry!</p>
    </div>
  );
}
