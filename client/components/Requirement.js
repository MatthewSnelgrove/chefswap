import React from "react";
import styles from "./styles/Requirement.module.scss";

function Requirement({ pass, requirementText }) {
  let textColor = pass ? { color: "rgb(0, 166, 83)" } : { color: "gray" };

  return (
    <div className={styles.requirement}>
      <div className={styles.requirement_text} style={textColor}>
        &#11044; &nbsp; {requirementText}
      </div>
    </div>
  );
}

export default Requirement;
