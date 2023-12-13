import React from "react";
import styles from "./styles/Modal.module.scss";

/**
 * Popup component container
 * @param children JSX children elements
 * @param {String} title Title of modal to be displayed
 */
function Modal({ children, title = "Chefswap", backgroundUrl }) {
  // console.log(`rgba(128, 128, 128, 0.701), ${backgroundUrl}`);    // test
  return (
    <div
      className={styles.cred_modal_container}
      style={{
        backgroundImage: `linear-gradient(rgba(128, 128, 128, 0.3), rgba(128, 128, 128, 0.3)), url(${backgroundUrl})`,
      }}
    >
      <div className={styles.popup}>
        <div className={styles.cred_modal_header}>
          <div className={styles.header_title}>{title}</div>
          <button className={styles.close_modal_btn}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>
        <div className={styles.cred_modal_content}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
