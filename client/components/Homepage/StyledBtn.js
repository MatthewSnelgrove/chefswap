import React from "react";
import { useState } from "react";
import styles from "./styles/StyledBtn.module.scss";

/**
 * Styled button for Navbar and homepage
 * @param {*} props
 * @param {Boolean} arrowed Arrow in text or not
 * @param {Boolean} light Theme is light or not
 * @param {String} text Button text
 * @param {String} link Link to redirect to once clicked
 */
function StyledBtn({
  arrowed = false,
  light = false,
  text,
  color = "#FB8C00",
  link,
}) {
  const [hover, setHover] = useState(false);
  // console.log(hover);   // test

  let arrow = "";
  if (arrowed) {
    arrow = <span style={{ fontWeight: 500 }}> ➜</span>;
  }

  let darkTheme = {
    border: `1.5px solid ${color}`,
    backgroundColor: color,
    color: "#fffef2",
  };

  let lightTheme = {
    border: "1.5px solid rgb(220, 220, 220)",
    backgroundColor: "#fffef2",
    color: color,
  };

  function handleFocus() {
    setHover((hover) => {
      return !hover;
    });
  }

  let isLight = hover ? !light : light;
  let theme = isLight ? lightTheme : darkTheme;

  return (
    <a href={link ? link : ""}>
      <button
        className={styles.StyledBtn}
        style={theme}
        onMouseOver={handleFocus}
        onMouseOut={handleFocus}
      >
        {text} {arrow}
      </button>
    </a>
  );
}

export default StyledBtn;
