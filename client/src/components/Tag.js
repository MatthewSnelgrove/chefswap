import React from "react";
import "./styles/Tag.css";

function Tag(props) {
  return (
    <div style={{ display: "inline-block", marginRight: "4px" }} className="tag">
      {props.cuisine}
    </div>
  )
}

export default Tag;
