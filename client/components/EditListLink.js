import React from "react";
import styles from "./styles/EditListLink.module.css";

function EditListLink(props) {
  const curSelected = props.curSelected;
  const listType = props.listType;

  return (
    <li
      id={curSelected == listType ? "style-selected" : ""}
      className={curSelected == listType ? styles.style_selected : ""}
    >
      <a
        className="full-a"
        onClick={(e) => {
          if (curSelected == listType) {
            return;
          }
          window.location = props.link;
        }}
      />
      <div
        className={styles.text_display_big}
        style={curSelected == listType ? { fontWeight: "600" } : {}}
      >
        {props.display}
      </div>
      <img className={styles.display_img_small} src={props.smallImg} />
    </li>
  );
}

export default EditListLink;
