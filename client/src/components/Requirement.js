import React from "react";
import "./styles/Requirement.scss";

function Requirement({ pass, requirementText }) {
  let textColor = pass ? { color: "rgb(0, 166, 83)" } : { color: "gray" };

  return (
    <div className="requirement">
      <div className="requirement-text" style={textColor}>
        &#11044; &nbsp; {requirementText}
      </div>
    </div>
  );
}

export default Requirement;
