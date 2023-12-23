import React from "react";
import styles from "./styles/Tag.module.css";

function Tag(props) {
  return (
    <div
      style={{ display: "inline-block", marginRight: "4px" }}
      className={styles.tag}
    >
      {props.cuisine}
    </div>
  );
}

export default Tag;
