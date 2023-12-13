import React from "react";
import styles from "./styles/EditListLink.module.css";

function EditListLink(props) {
  // const curSelected = props.curSelected;
  // const listType = props.listType;
  const selected = props.selected;
  const onClick = props.onClick;

  return (
    <li
      id={selected ? "style-selected" : ""}
      className={
        selected ? `${styles.style_selected} ${styles.tab}` : styles.tab
      }
      onClick={onClick}
    >
      {/* <a
        className={styles.full_a}
        onClick={(e) => {
          if (curSelected == listType) {
            return;
          }
          window.location = props.link;
        }}
      /> */}
      <div
        className={styles.text_display_big}
        style={selected ? { fontWeight: "600" } : {}}
      >
        {props.display}
      </div>
      <img className={styles.display_img_small} src={props.smallImg} />
    </li>
  );
}

export default EditListLink;
