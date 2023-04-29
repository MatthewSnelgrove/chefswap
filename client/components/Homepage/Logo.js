import React from "react";
import styles from "./styles/Logo.module.scss";

function Logo() {
  return (
    <div className={styles.CSLogo}>
      <img
        src={process.env.PUBLIC_URL + "/chefswap-logo.png"}
        alt="Chefswap logo"
        className={styles.logo_img}
      />
      <h3 className={styles.logo_text}>Chefswap</h3>
    </div>
  );
}

export default Logo;
